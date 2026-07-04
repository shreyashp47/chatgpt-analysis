import { useChatStore } from '@/lib/store'
import type { Message } from '@/types/conversation'

function generateId() {
  return crypto.randomUUID()
}

export function useStreamResponse() {
  const addMessage = useChatStore((s) => s.addMessage)
  const updateLastMessage = useChatStore((s) => s.updateLastMessage)
  const setStreaming = useChatStore((s) => s.setStreaming)

  async function sendMessage(conversationId: string, content: string, provider: string) {
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content,
      createdAt: Date.now(),
    }
    addMessage(conversationId, userMsg)

    const assistantMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    }
    addMessage(conversationId, assistantMsg)

    setStreaming(true)

    try {
      const conversation = useChatStore.getState().conversations.find((c) => c.id === conversationId)
      const apiMessages = (conversation?.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, provider }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `API error: ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        fullContent += text
        updateLastMessage(conversationId, fullContent)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      updateLastMessage(conversationId, `Error: ${message}`)
    } finally {
      setStreaming(false)
    }
  }

  return { sendMessage }
}
