'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
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
    <Dialog>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVerticalIcon className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <EyeIcon className="mr-2" />
              View Payload
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent maxWidth="max-w-2xl" className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Webhook Payload</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto flex-1">
          <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto whitespace-pre-wrap break-words">
            {formattedPayload}
          </pre>
        </div>
        <DialogClose asChild>
          <Button variant="outline" className="w-full sm:w-auto sm:ml-auto">
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}



