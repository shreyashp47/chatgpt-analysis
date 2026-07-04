import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversation, Message } from '@/types/conversation'

function generateId() {
  return crypto.randomUUID()
}

interface ChatState {
  conversations: Conversation[]
  activeId: string | null
  streaming: boolean

  createConversation: () => string
  deleteConversation: (id: string) => void
  setActive: (id: string | null) => void
  addMessage: (conversationId: string, message: Message) => void
  updateLastMessage: (conversationId: string, content: string) => void
  updateMessage: (conversationId: string, messageId: string, content: string) => void
  popLastAssistantMessage: (conversationId: string) => void
  setStreaming: (streaming: boolean) => void
  getActiveConversation: () => Conversation | undefined
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,
      streaming: false,

      createConversation: () => {
        const id = generateId()
        const now = Date.now()
        const conv: Conversation = {
          id,
          title: 'New chat',
          messages: [],
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          conversations: [conv, ...state.conversations],
          activeId: id,
        }))
        return id
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeId:
            state.activeId === id
              ? state.conversations.find((c) => c.id !== id)?.id ?? null
              : state.activeId,
        }))
      },

      setActive: (id) => set({ activeId: id }),

      addMessage: (conversationId, message) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: Date.now(),
                  title:
                    c.title === 'New chat' && message.role === 'user'
                      ? message.content.slice(0, 60)
                      : c.title,
                }
          ),
        }))
      },

      updateLastMessage: (conversationId, content) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m, i) =>
                    i === c.messages.length - 1 ? { ...m, content } : m
                  ),
                  updatedAt: Date.now(),
                }
          ),
        }))
      },

      updateMessage: (conversationId, messageId, content) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id !== messageId ? m : { ...m, content }
                  ),
                  updatedAt: Date.now(),
                }
          ),
        }))
      },

      popLastAssistantMessage: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id !== conversationId
              ? c
              : {
                  ...c,
                  messages: c.messages.filter(
                    (_, i) => !(i === c.messages.length - 1 && c.messages[i].role === 'assistant')
                  ),
                  updatedAt: Date.now(),
                }
          ),
        }))
      },

      setStreaming: (streaming) => set({ streaming }),

      getActiveConversation: () => {
        const state = get()
        return state.conversations.find((c) => c.id === state.activeId)
      },
    }),
    { name: 'chat-store' }
  )
)
