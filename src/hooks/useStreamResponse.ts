import { useChatStore } from '@/lib/store'
import type { Message } from '@/types/conversation'

function generateId() {
  return crypto.randomUUID()
}

function getApiKey(provider: string): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const stored = localStorage.getItem('chat-api-keys')
    if (!stored) return undefined
    const keys = JSON.parse(stored)
    return keys[provider]
  } catch {
    return undefined
  }
}

export function useStreamResponse() {
  const addMessage = useChatStore((s) => s.addMessage)
  const updateMessage = useChatStore((s) => s.updateMessage)
  const popLastAssistantMessage = useChatStore((s) => s.popLastAssistantMessage)
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

    await streamResponse(conversationId, assistantMsg.id, provider)
  }

  async function regenerate(conversationId: string, provider: string) {
    popLastAssistantMessage(conversationId)

    const assistantMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    }
    addMessage(conversationId, assistantMsg)

    await streamResponse(conversationId, assistantMsg.id, provider)
  }

  async function streamResponse(conversationId: string, assistantId: string, provider: string) {
    setStreaming(true)

    try {
      const conversation = useChatStore.getState().conversations.find((c) => c.id === conversationId)
      const apiMessages = (conversation?.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const apiKey = getApiKey(provider)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, provider, apiKey }),
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
        updateMessage(conversationId, assistantId, fullContent)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      updateMessage(conversationId, assistantId, `Error: ${message}`)
    } finally {
      setStreaming(false)
    }
  }

  return { sendMessage, regenerate }
}
