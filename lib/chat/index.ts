// Re-export chat context from autoblogger
export { 
  ChatProvider, 
  useChatContext,
  type ChatMessage as Message,
  type ChatEssayContext as EssayContext,
  type EssaySnapshot,
  type ChatMode,
  type EssayEdit,
  type ChatEditHandler as EditHandler,
  type ExpandPlanHandler,
} from 'autoblogger/ui'
