/**
 * Field component for displaying label/value pairs in admin detail pages
 */

interface FieldProps {
  label: string
  value?: string | null
  link?: boolean
}

export function Field({ label, value, link }: FieldProps) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {value ? (
        link ? (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <div className="break-all">{value}</div>
        )
      ) : (
        <div className="text-muted-foreground">—</div>
      )}
    </div>
  )
}
