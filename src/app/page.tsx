import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, BarChart3, ShieldCheck, Zap, Globe, Calendar } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1D9E8B] flex items-center justify-center">
              <span className="text-white text-xs font-bold">AJ</span>
            </div>
            <span className="font-semibold text-[#1A2B3C] text-sm">AISG Judging Portal</span>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/login?role=judge">
              <Button variant="outline" size="sm" className="border-[#1D9E8B] text-[#1D9E8B] hover:bg-[#E1F5EE]">
                Judge Login
              </Button>
            </Link>
            <Link href="/auth/login?role=organiser">
              <Button size="sm" className="bg-[#1D9E8B] hover:bg-[#0F6E56] text-white">
                Organiser Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A2B3C] via-[#1D3A4A] to-[#1A2B3C] py-20 px-4">
        {/* Decorative tiles */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-12 h-12 rounded-sm"
              style={{
                left: `${(i % 12) * 8.5}%`,
                top: `${Math.floor(i / 12) * 18}%`,
                backgroundColor: ['#1D9E8B', '#E8735A', '#F5A623', '#3A7BD5', '#7C5CBF'][i % 5],
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="bg-[#1D9E8B]/20 text-[#6DDFD0] border-[#1D9E8B]/30 mb-4 text-xs">
            AI Ready ASEAN Youth Challenge 2026
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            The Official
            <br />
            <span className="text-[#1D9E8B]">Judging Portal</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            A purpose-built platform for structured, auditable, and real-time judging of AI
            solutions addressing challenges across the ASEAN region.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/auth/login?role=judge">
              <Button size="lg" className="bg-[#1D9E8B] hover:bg-[#0F6E56] text-white gap-2">
                <Users size={18} />
                Judge Portal
              </Button>
            </Link>
            <Link href="/auth/login?role=organiser">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                <BarChart3 size={18} />
                Organiser Portal
              </Button>
            </Link>
            <Link href="/vote">
              <Button size="lg" variant="outline" className="border-pink-400/50 text-pink-200 hover:bg-pink-500/10 gap-2">
                <span>❤️</span>
                People&#39;s Choice Vote
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              Judging Deadline: 15 April 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Globe size={14} />
              10 ASEAN Countries
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-[#F7F8FA]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1A2B3C] mb-2">Built for competition-grade judging</h2>
            <p className="text-gray-500">Everything organisers and judges need in one place.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <ShieldCheck className="text-[#1D9E8B]" size={22} />,
                title: 'Magic Link Authentication',
                desc: 'Judges log in via a secure email link — no passwords, no friction.',
              },
              {
                icon: <BarChart3 className="text-[#1D9E8B]" size={22} />,
                title: '8-Criterion Scoring',
                desc: 'Weighted scoring across Problem Definition, AI Application, Innovation, and more — auto-computed.',
              },
              {
                icon: <Zap className="text-[#1D9E8B]" size={22} />,
                title: 'Real-Time Progress',
                desc: 'Organisers see live completion rates per judge and send targeted reminders.',
              },
              {
                icon: <Users className="text-[#1D9E8B]" size={22} />,
                title: 'Multi-Judge Averaging',
                desc: 'Final rankings use weighted averages across all judges per project.',
              },
              {
                icon: <Globe className="text-[#1D9E8B]" size={22} />,
                title: 'CSV & PDF Export',
                desc: 'Download ranked results with per-criterion scores and team feedback summaries.',
              },
              {
                icon: <ShieldCheck className="text-[#1D9E8B]" size={22} />,
                title: 'Full Audit Trail',
                desc: 'Every score change is logged with old/new values for transparent dispute resolution.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-[#E1F5EE] flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#1A2B3C] mb-1.5 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Judging criteria overview */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1A2B3C] mb-2">Judging Criteria</h2>
            <p className="text-gray-500">8 weighted criteria totalling 85 points</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Problem Definition', weight: 10, desc: 'Issue clarity, target audience, scope' },
              { name: 'Relevance & Impact', weight: 10, desc: 'Benefits for the target audience' },
              { name: 'AI Application', weight: 15, desc: 'Sound, responsible use of AI', highlight: true },
              { name: 'Viability', weight: 10, desc: 'Technical & operational feasibility' },
              { name: 'Innovation', weight: 10, desc: 'Creativity & originality' },
              { name: 'Sustainability', weight: 10, desc: 'Long-term impact & operations' },
              { name: 'Practicality', weight: 10, desc: 'Outreach plan realism' },
              { name: 'Effectiveness', weight: 10, desc: 'Engaging 1,000+ community members' },
            ].map((c) => (
              <div
                key={c.name}
                className={`flex items-center gap-3 p-3.5 rounded-lg border ${
                  c.highlight
                    ? 'border-[#1D9E8B] bg-[#E1F5EE]'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                    c.highlight
                      ? 'bg-[#1D9E8B] text-white'
                      : 'bg-white text-[#1D9E8B] border border-gray-200'
                  }`}
                >
                  {c.weight}%
                </div>
                <div>
                  <p className={`font-semibold text-sm ${c.highlight ? 'text-[#0F6E56]' : 'text-[#1A2B3C]'}`}>
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Public Engagement (20%) is determined by community votes — not judge-scored
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 bg-[#1A2B3C]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1D9E8B] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AJ</span>
            </div>
            <span className="text-gray-400 text-sm">AI Ready ASEAN Youth Challenge 2026</span>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>IMDA · ATX Summit · AI Singapore · ASEAN Foundation · Google.org</span>
          </div>
          <a href="mailto:info@airayouthchallenge.ai" className="text-[#1D9E8B] text-xs hover:underline">
            info@airayouthchallenge.ai
          </a>
        </div>
      </footer>
    </div>
  )
}
