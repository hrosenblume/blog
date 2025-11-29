'use client'

export const EmailLink = ({ className }: { className?: string }) => (
  <button onClick={() => (window.location.href = 'mailto:your-email@example.com')} className={className}>
    Email
  </button>
)

