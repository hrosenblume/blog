interface TableEmptyRowProps {
  colSpan: number
  children: React.ReactNode
}

export function TableEmptyRow({ colSpan, children }: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
        {children}
      </td>
    </tr>
  )
}

