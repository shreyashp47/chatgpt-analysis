'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, MessageSquare, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/lib/store'
import { useStreamResponse } from '@/hooks/useStreamResponse'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatWindow } from '@/components/chat/ChatWindow'

const PROVIDERS = [
  { value: 'ollama', label: 'Ollama (Local)' },
  { value: 'groq', label: 'Groq (Free)' },
  { value: 'gemini', label: 'Gemini (Free)' },
  { value: 'openai', label: 'OpenAI' },
]

export default function Home() {
  const [input, setInput] = useState('')
  const [provider, setProvider] = useState('ollama')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const streaming = useChatStore((s) => s.streaming)
  const createConversation = useChatStore((s) => s.createConversation)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const setActive = useChatStore((s) => s.setActive)

  const { sendMessage, regenerate } = useStreamResponse()
  const activeConv = conversations.find((c) => c.id === activeId)

  useEffect(() => {
    if (!activeId && conversations.length === 0) {
      createConversation()
    }
  }, [])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(t)
    }
  }, [error])

  function handleSubmit() {
    if (!input.trim() || streaming) return

    let convId = activeId
    if (!convId) {
      convId = createConversation()
    }

    const text = input.trim()
    setInput('')
    setError('')
    sendMessage(convId, text, provider)
  }

  function handleNewChat() {
    createConversation()
    setInput('')
    setError('')
  }

  function handleRegenerate() {
    if (!activeId || streaming) return
    regenerate(activeId, provider)
  }

  return (
    <div className="flex h-dvh bg-[var(--background)]">
      <aside className="hidden md:flex flex-col w-64 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]">
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full rounded-lg border border-[var(--chat-input-border)] px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--message-user)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActive(conv.id)}
              className={cn(
                'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-left transition-colors group',
                conv.id === activeId
                  ? 'bg-[var(--message-user)] text-[var(--foreground)]'
                  : 'text-[var(--foreground)]/70 hover:bg-[var(--message-user)] hover:text-[var(--foreground)]'
              )}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id) }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--sidebar-border)] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            <h1 className="font-semibold text-[var(--foreground)]">Chat</h1>
          </div>
          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            className="text-sm bg-[var(--chat-input)] border border-[var(--chat-input-border)] rounded-lg px-3 py-1.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          >
            {PROVIDERS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </header>

        <ChatWindow
          conversation={activeConv}
          streaming={streaming}
          onRegenerate={handleRegenerate}
        />

        {error && (
          <div className="px-4 pb-2">
            <div className="max-w-3xl mx-auto text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2 text-center">
              {error}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
          className="border-t border-[var(--sidebar-border)] p-4 shrink-0"
        >
          <div className="max-w-3xl mx-auto">
            <ChatInput
              input={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              disabled={streaming}
            />
          </div>
        </form>
      </div>
    </div>
  )
}
