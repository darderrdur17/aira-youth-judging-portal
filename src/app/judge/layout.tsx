import { TopNav } from '@/components/shared/TopNav'

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <TopNav role="judge" />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
