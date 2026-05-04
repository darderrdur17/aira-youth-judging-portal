'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Link2, CalendarClock, ExternalLink } from 'lucide-react'
import { useOrganiserDemoStore } from '@/store/organiserDemoStore'
import { cn } from '@/lib/utils'

const ADVISOR_STYLES = [
  'bg-sky-200 text-sky-950',
  'bg-cyan-200 text-cyan-950',
  'bg-pink-200 text-pink-950',
  'bg-violet-200 text-violet-950',
  'bg-teal-200 text-teal-950',
  'bg-amber-200 text-amber-950',
]
const COUNTRY_STYLES = [
  'bg-fuchsia-200 text-fuchsia-950',
  'bg-emerald-200 text-emerald-950',
  'bg-rose-200 text-rose-950',
  'bg-indigo-200 text-indigo-950',
]

function pill(text: string, palette: string[], i: number) {
  const c = palette[i % palette.length]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium', c)}>
      {text}
    </span>
  )
}

type GroupRow = {
  id: string
  timeslot: string
  advisor: string
  organisation: string
  country: string
  team: string
}

const DEMO_GROUPS: { label: string; rows: GroupRow[] }[] = [
  {
    label: 'March 9, 2026 16:30',
    rows: [
      {
        id: 'c1',
        timeslot: 'March 9, 2026 16:00 +08',
        advisor: 'Wei Tat',
        organisation: 'AI Singapore',
        country: 'Singapore',
        team: 'Neural Garden',
      },
      {
        id: 'c2',
        timeslot: 'March 9, 2026 16:30 +08',
        advisor: 'Chee Jian',
        organisation: 'Mafindo',
        country: 'Indonesia',
        team: 'EcoVerify AI',
      },
      {
        id: 'c3',
        timeslot: 'March 9, 2026 16:30 +08',
        advisor: 'Bryan Wong',
        organisation: 'SmartCT',
        country: 'Philippines',
        team: 'AquaSafe',
      },
    ],
  },
  {
    label: 'March 18, 2026 15:00',
    rows: [
      {
        id: 'c4',
        timeslot: 'March 18, 2026 15:00 +08',
        advisor: 'Raundoh Tul Jannah',
        organisation: 'AI Singapore',
        country: 'Singapore',
        team: 'Harmony Lab',
      },
      {
        id: 'c5',
        timeslot: 'March 18, 2026 15:30 +08',
        advisor: 'Ayn Jasmine Latorre',
        organisation: 'IMDA',
        country: 'Singapore',
        team: 'Urban Pulse',
      },
    ],
  },
]

const FLAT_SESSIONS = [
  {
    id: 's1',
    session: '3/4/2026 3:00pm +08',
    team: 'Neural Garden',
    advisor: 'Wei Tat',
    availability: '3/4/2026 2:30pm +08',
    zoom: 'https://us02web.zoom.us/j/example-consult-001',
  },
  {
    id: 's2',
    session: '3/5/2026 10:00am +08',
    team: 'EcoVerify AI',
    advisor: 'Chee Jian',
    availability: '3/5/2026 9:45am +08',
    zoom: 'https://us02web.zoom.us/j/example-consult-002',
  },
  {
    id: 's3',
    session: '3/6/2026 4:00pm +08',
    team: 'AquaSafe',
    advisor: 'Ak Muhammad Rahimi Pg H',
    availability: '3/6/2026 3:30pm +08',
    zoom: 'https://us02web.zoom.us/j/example-consult-003',
  },
]

export default function OpenConsultationSessionsPage() {
  const assignments = useOrganiserDemoStore((s) => s.assignments)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A2B3C]">Open Consultation Sessions</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Demo layout inspired by the AIRA interface. Link real meetings from your run-of-show; today you have{' '}
            <span className="font-semibold text-[#1A2B3C]">{assignments.length}</span> judge–project assignments in the portal.
          </p>
        </div>
        <Link
          href="/organiser/assignments"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'shrink-0 border-gray-200 text-xs no-underline gap-1.5 inline-flex'
          )}
        >
          <Link2 size={13} /> Open assignments
        </Link>
      </div>

      {/* Grouped table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-fade-in-up">
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <CalendarClock size={16} className="text-[#E85A14]" />
          <h2 className="text-sm font-semibold text-[#1A2B3C]">By timeslot</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {DEMO_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="flex items-center justify-between bg-sky-50 px-4 py-2 text-xs font-medium text-sky-950">
                <span>Timeslot (start): {g.label}</span>
                <Badge variant="secondary" className="bg-white text-[11px] text-sky-900">
                  {g.rows.length} session{g.rows.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <Table className="table-row-hover">
                <TableHeader>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className="w-10 text-xs text-gray-500">#</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700">Timeslot</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700">Advisor</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700">Organisation</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700">Country</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-700">Team</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {g.rows.map((row, idx) => (
                    <TableRow key={row.id} className="border-b border-gray-50 text-sm">
                      <TableCell className="text-gray-400 text-xs">{idx + 1}</TableCell>
                      <TableCell className="text-gray-700">{row.timeslot}</TableCell>
                      <TableCell>{pill(row.advisor, ADVISOR_STYLES, idx)}</TableCell>
                      <TableCell className="text-gray-700">{row.organisation}</TableCell>
                      <TableCell>{pill(row.country, COUNTRY_STYLES, idx)}</TableCell>
                      <TableCell className="font-medium text-[#1A2B3C]">{row.team}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </div>

      {/* Flat sessions */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-[#1A2B3C]">Session details</h2>
          <p className="text-xs text-gray-500">Zoom links are placeholders — replace with your production URLs.</p>
        </div>
        <Table className="table-row-hover">
          <TableHeader>
            <TableRow className="bg-[#E85A14] hover:bg-[#E85A14]">
              <TableHead className="text-white text-xs font-semibold">#</TableHead>
              <TableHead className="text-white text-xs font-semibold">Session</TableHead>
              <TableHead className="text-white text-xs font-semibold">Team</TableHead>
              <TableHead className="text-white text-xs font-semibold">Advisor</TableHead>
              <TableHead className="text-white text-xs font-semibold">Advisor availability</TableHead>
              <TableHead className="text-white text-xs font-semibold">Zoom</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {FLAT_SESSIONS.map((row, idx) => (
              <TableRow key={row.id} className="border-b border-gray-50 text-sm">
                <TableCell className="text-gray-400 text-xs">{idx + 1}</TableCell>
                <TableCell className="text-gray-700">{row.session}</TableCell>
                <TableCell className="font-medium text-[#1A2B3C]">{row.team}</TableCell>
                <TableCell>{pill(row.advisor, ADVISOR_STYLES, idx + 2)}</TableCell>
                <TableCell className="text-gray-600 text-xs">{row.availability}</TableCell>
                <TableCell>
                  <a
                    href={row.zoom}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900"
                  >
                    Open link <ExternalLink size={12} />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
