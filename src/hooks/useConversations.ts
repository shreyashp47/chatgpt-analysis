import { useChatStore } from '@/lib/store'

export function useConversations() {
  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const streaming = useChatStore((s) => s.streaming)

  const createConversation = useChatStore((s) => s.createConversation)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const setActive = useChatStore((s) => s.setActive)

  const activeConversation = conversations.find((c) => c.id === activeId)

  return {
    conversations,
    activeId,
    activeConversation,
    streaming,
    createConversation,
    deleteConversation,
    setActive,
  }
}
