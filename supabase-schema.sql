-- ============================================================
-- AI Ready ASEAN Youth Challenge 2026 — Judging Portal Schema
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Competitions
create table competitions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  deadline timestamptz not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Criteria
create table criteria (
  id uuid primary key default uuid_generate_v4(),
  competition_id uuid references competitions(id) on delete cascade,
  key text not null,
  name text not null,
  weight numeric not null check (weight > 0 and weight <= 100),
  description text,
  sort_order integer default 0,
  unique(competition_id, key)
);

-- Projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  competition_id uuid references competitions(id) on delete cascade,
  name text not null,
  country text not null,
  pdf_url text,
  video_url text,
  metadata jsonb,
  created_at timestamptz default now(),
  unique(competition_id, name)
);

-- Judges (extends auth.users)
create table judges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  competition_id uuid references competitions(id) on delete cascade,
  name text not null,
  email text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(competition_id, email)
);

-- Assignments (many-to-many: judge ↔ project)
create table assignments (
  id uuid primary key default uuid_generate_v4(),
  judge_id uuid references judges(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  assigned_at timestamptz default now(),
  unique(judge_id, project_id)
);

-- Scores
create table scores (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id) on delete cascade,
  criterion_id uuid references criteria(id) on delete cascade,
  score integer not null check (score >= 1 and score <= 10),
  saved_at timestamptz default now(),
  submitted_at timestamptz,
  unique(assignment_id, criterion_id)
);

-- Feedback
create table feedback (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id) on delete cascade unique,
  personal_notes text default '',
  team_feedback text default '',
  updated_at timestamptz default now()
);

-- Audit log (append-only)
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id),
  criterion_id uuid references criteria(id),
  old_score integer,
  new_score integer,
  action text not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

alter table competitions enable row level security;
alter table criteria enable row level security;
alter table projects enable row level security;
alter table judges enable row level security;
alter table assignments enable row level security;
alter table scores enable row level security;
alter table feedback enable row level security;
alter table audit_log enable row level security;

-- Helper: check if user is an organiser for a competition
create or replace function is_organiser(comp_id uuid)
returns boolean as $$
  select exists (
    select 1 from competitions where id = comp_id and created_by = auth.uid()
  );
$$ language sql security definer;

-- Helper: get judge id for current user in a competition
create or replace function get_judge_id(comp_id uuid)
returns uuid as $$
  select id from judges where user_id = auth.uid() and competition_id = comp_id and is_active = true limit 1;
$$ language sql security definer;

-- Competitions
create policy "Organisers can manage own competitions"
  on competitions for all using (created_by = auth.uid());

create policy "Judges can read competitions they are assigned to"
  on competitions for select using (
    exists (
      select 1 from judges j
      join assignments a on a.judge_id = j.id
      where j.user_id = auth.uid() and j.competition_id = competitions.id
    )
  );

-- Criteria
create policy "Organisers can manage criteria"
  on criteria for all using (is_organiser(competition_id));

create policy "Judges can read criteria"
  on criteria for select using (
    exists (
      select 1 from judges j where j.user_id = auth.uid() and j.competition_id = criteria.competition_id
    )
  );

-- Projects
create policy "Organisers can manage projects"
  on projects for all using (is_organiser(competition_id));

create policy "Judges can read assigned projects"
  on projects for select using (
    exists (
      select 1 from assignments a
      join judges j on j.id = a.judge_id
      where j.user_id = auth.uid() and a.project_id = projects.id
    )
  );

-- Judges
create policy "Organisers can manage judges"
  on judges for all using (is_organiser(competition_id));

create policy "Judges can read own record"
  on judges for select using (user_id = auth.uid());

-- Assignments
create policy "Organisers can manage assignments"
  on assignments for all using (
    exists (
      select 1 from projects p where p.id = assignments.project_id and is_organiser(p.competition_id)
    )
  );

create policy "Judges can read own assignments"
  on assignments for select using (
    exists (
      select 1 from judges j where j.id = assignments.judge_id and j.user_id = auth.uid()
    )
  );

-- Scores
create policy "Organisers can read all scores"
  on scores for select using (
    exists (
      select 1 from assignments a
      join projects p on p.id = a.project_id
      where a.id = scores.assignment_id and is_organiser(p.competition_id)
    )
  );

create policy "Judges can manage own scores"
  on scores for all using (
    exists (
      select 1 from assignments a
      join judges j on j.id = a.judge_id
      where a.id = scores.assignment_id and j.user_id = auth.uid()
    )
  );

-- Deadline enforcement: prevent saving scores after deadline
create or replace function check_deadline()
returns trigger as $$
declare
  comp_deadline timestamptz;
begin
  select c.deadline into comp_deadline
  from assignments a
  join projects p on p.id = a.project_id
  join competitions c on c.id = p.competition_id
  where a.id = new.assignment_id;

  if now() > comp_deadline then
    raise exception 'Judging deadline has passed. Scores can no longer be modified.';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger scores_deadline_check
  before insert or update on scores
  for each row execute function check_deadline();

-- Feedback
create policy "Organisers can read all feedback"
  on feedback for select using (
    exists (
      select 1 from assignments a
      join projects p on p.id = a.project_id
      where a.id = feedback.assignment_id and is_organiser(p.competition_id)
    )
  );

create policy "Judges can manage own feedback"
  on feedback for all using (
    exists (
      select 1 from assignments a
      join judges j on j.id = a.judge_id
      where a.id = feedback.assignment_id and j.user_id = auth.uid()
    )
  );

-- Audit log
create policy "Organisers can read audit log"
  on audit_log for select using (
    exists (
      select 1 from assignments a
      join projects p on p.id = a.project_id
      where a.id = audit_log.assignment_id and is_organiser(p.competition_id)
    )
  );

-- Auto-audit trigger
create or replace function log_score_change()
returns trigger as $$
begin
  if TG_OP = 'UPDATE' and old.score != new.score then
    insert into audit_log (assignment_id, criterion_id, old_score, new_score, action, changed_by)
    values (new.assignment_id, new.criterion_id, old.score, new.score, 'SCORE_AMENDED', auth.uid());
  elsif TG_OP = 'INSERT' then
    insert into audit_log (assignment_id, criterion_id, old_score, new_score, action, changed_by)
    values (new.assignment_id, new.criterion_id, null, new.score, 'SCORE_SAVED', auth.uid());
  end if;
  return new;
end;
$$ language plpgsql;

create trigger score_audit_trigger
  after insert or update on scores
  for each row execute function log_score_change();

-- ============================================================
-- Post-login: link auth user to judge rows invited by email
-- Call from app after magic-link exchange: supabase.rpc('link_judge_to_user')
-- ============================================================

create or replace function public.link_judge_to_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  em text;
begin
  uid := auth.uid();
  if uid is null then
    return;
  end if;
  select lower(trim(email)) into em from auth.users where id = uid;
  if em is null then
    return;
  end if;
  update public.judges
  set user_id = uid
  where lower(trim(email)) = em
    and user_id is null;
end;
$$;

grant execute on function public.link_judge_to_user() to authenticated;

-- ============================================================
-- Seed the AISG 2026 competition with judging criteria
-- Run after schema migration
-- ============================================================

-- Insert the competition (update created_by to your organiser user UUID)
insert into competitions (name, slug, deadline, created_by)
values (
  'AI Ready ASEAN Youth Challenge 2026',
  'airayc-2026',
  '2026-04-15 04:00:00+00', -- 15 April 2026 12:00 SGT
  null -- replace with organiser user UUID
);

-- Insert judging criteria
with comp as (select id from competitions where slug = 'airayc-2026' limit 1)
insert into criteria (competition_id, key, name, weight, description, sort_order)
select comp.id, key, name, weight, description, sort_order
from comp, (values
  ('problem_definition', 'Problem Definition', 10, 'Clarity and comprehensiveness of the issue addressed, target audience, and scope of proposed solution.', 1),
  ('relevance_impact', 'Relevance & Impact', 10, 'Relevance of the proposed solution and its potential benefits for the identified target audience.', 2),
  ('ai_application', 'AI Application', 15, 'Sound and responsible use of AI to solve the identified problem.', 3),
  ('viability', 'Viability', 10, 'Technical and operational feasibility of the proposed solution.', 4),
  ('innovation', 'Innovation', 10, 'Creativity and originality of the solution.', 5),
  ('sustainability', 'Sustainability', 10, 'Ability to maintain and grow the solution over time.', 6),
  ('practicality', 'Practicality', 10, 'How realistic and easy it is to implement your proposed awareness outreach plan.', 7),
  ('effectiveness', 'Effectiveness', 10, 'Effectiveness of your proposed outreach plan to engage at least 1,000 community members.', 8)
) as t(key, name, weight, description, sort_order);
