import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Ready ASEAN Youth Challenge 2026 — Judging Portal',
  description:
    'Official judging platform for the AI Ready ASEAN Youth Challenge 2026. Powered by AI Singapore, ASEAN Foundation, and Google.org.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%231D9E8B'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='20' font-weight='bold'>AJ</text></svg>",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
