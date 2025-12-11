'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVerticalIcon, EyeIcon } from '@/components/Icons'

interface ViewPayloadButtonProps {
  payload: string | null
}

export function ViewPayloadButton({ payload }: ViewPayloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!payload) {
    return <span className="text-muted-foreground text-sm">—</span>
  }

  // Try to pretty-print JSON
  let formattedPayload = payload
  try {
    formattedPayload = JSON.stringify(JSON.parse(payload), null, 2)
  } catch {
    // Not valid JSON, use as-is
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVerticalIcon className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsOpen(true)}>
            <EyeIcon className="mr-2" />
            View Payload
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Simple modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-background border rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Webhook Payload</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
                {formattedPayload}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
