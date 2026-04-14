-- ============================================================
-- PATCH: run this on an EXISTING database only
-- (Do not run full supabase-schema.sql again — tables already exist.)
--
-- Adds / updates the function the app calls after magic-link login:
--   supabase.rpc('link_judge_to_user')
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
