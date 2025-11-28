'use client'

export function EmailLink({ className }: { className?: string }) {
  const handleClick = () => {
    window.location.href = 'mailto:' + 'hrosenblume' + '@' + 'gmail.com'
  }

  return (
    <button onClick={handleClick} className={className}>
      Email
    </button>
  )
}

