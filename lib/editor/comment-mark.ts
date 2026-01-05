import { Mark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Editor } from '@tiptap/core'
import type { CommentWithUser } from '@/lib/comments'

export interface CommentMarkOptions {
  onCommentClick?: (commentId: string) => void
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      setComment: (commentId: string) => ReturnType
      unsetComment: (commentId: string) => ReturnType
    }
  }
}

export const CommentMark = Mark.create<CommentMarkOptions>({
  name: 'comment',

  addOptions() {
    return {
      onCommentClick: undefined,
    }
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-id'),
        renderHTML: (attributes) => ({
          'data-comment-id': attributes.commentId,
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'mark[data-comment-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'mark',
      mergeAttributes(HTMLAttributes, {
        class:
          'bg-yellow-200/50 dark:bg-yellow-500/30 dark:text-foreground cursor-pointer hover:bg-yellow-300/60 dark:hover:bg-yellow-500/40 transition-colors rounded-sm',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setComment:
        (commentId: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { commentId })
        },
      unsetComment:
        (commentId: string) =>
        ({ tr, state }) => {
          const { doc } = state
          let found = false

          doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (mark.type.name === this.name && mark.attrs.commentId === commentId) {
                tr.removeMark(pos, pos + node.nodeSize, mark.type)
                found = true
              }
            })
          })

          return found
        },
    }
  },

  addProseMirrorPlugins() {
    const { onCommentClick } = this.options

    return [
      new Plugin({
        key: new PluginKey('commentClick'),
        props: {
          handleClick(view, pos) {
            if (!onCommentClick) return false

            const { state } = view
            const $pos = state.doc.resolve(pos)
            const marks = $pos.marks()

            const commentMark = marks.find((mark) => mark.type.name === 'comment')
            if (commentMark && commentMark.attrs.commentId) {
              // Blur the editor to prevent keyboard popup on mobile
              ;(view.dom as HTMLElement).blur()
              onCommentClick(commentMark.attrs.commentId)
              return true
            }

            return false
          },
        },
      }),
    ]
  },
})

/**
 * Apply comment mark to the current selection
 */
export function addCommentMark(
  editor: Editor,
  commentId: string,
  from: number,
  to: number
): void {
  // Guard against editor not being ready
  if (!editor.view || editor.isDestroyed) {
    console.warn('Cannot add comment mark: editor not ready')
    return
  }
  
  editor
    .chain()
    .setTextSelection({ from, to })
    .setComment(commentId)
    .run()
}

/**
 * Remove comment mark from the document
 */
export function removeCommentMark(editor: Editor, commentId: string): void {
  if (!editor.view || editor.isDestroyed) return
  editor.chain().unsetComment(commentId).run()
}

/**
 * Re-apply comment marks based on quoted text matching.
 * Called when loading a post with existing comments.
 */
export function applyCommentMarks(
  editor: Editor,
  comments: CommentWithUser[]
): void {
  if (!editor.view || editor.isDestroyed) return
  
  const { doc } = editor.state
  const textContent = doc.textContent

  comments.forEach((comment) => {
    if (!comment.quotedText || comment.parentId) return // Skip replies

    const index = textContent.indexOf(comment.quotedText)
    if (index === -1) return // Text not found

    // Find the actual position in the document
    let currentPos = 0
    let startPos: number | null = null
    let endPos: number | null = null

    doc.descendants((node, pos) => {
      if (startPos !== null && endPos !== null) return false

      if (node.isText && node.text) {
        const nodeStart = currentPos
        const nodeEnd = currentPos + node.text.length

        if (startPos === null && nodeEnd > index) {
          // Start is in this node
          const offsetInNode = index - nodeStart
          startPos = pos + offsetInNode
        }

        if (startPos !== null && endPos === null) {
          const targetEnd = index + comment.quotedText.length
          if (nodeEnd >= targetEnd) {
            // End is in this node
            const offsetInNode = targetEnd - nodeStart
            endPos = pos + offsetInNode
          }
        }

        currentPos = nodeEnd
      }

      return true
    })

    if (startPos !== null && endPos !== null) {
      editor
        .chain()
        .setTextSelection({ from: startPos, to: endPos })
        .setComment(comment.id)
        .setTextSelection(endPos) // Deselect
        .run()
    }
  })
}

/**
 * Scroll to a comment mark in the editor
 */
export function scrollToComment(editor: Editor, commentId: string): void {
  if (!editor.view || editor.isDestroyed) return
  
  const { doc } = editor.state

  doc.descendants((node, pos) => {
    const commentMark = node.marks.find(
      (mark) => mark.type.name === 'comment' && mark.attrs.commentId === commentId
    )

    if (commentMark) {
      editor.chain().setTextSelection(pos).run()

      // Scroll to the selection
      const view = editor.view
      const coords = view.coordsAtPos(pos)
      const editorRect = view.dom.getBoundingClientRect()

      if (coords.top < editorRect.top || coords.bottom > editorRect.bottom) {
        view.dom.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      return false // Stop iteration
    }

    return true
  })
}

