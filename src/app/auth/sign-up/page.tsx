import { Suspense } from 'react'
import SignUpContent from './SignUpContent'

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#1D9E8B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  )
}
