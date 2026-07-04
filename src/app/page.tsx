'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Send, Bot, User, Sparkles, MessageSquare, Trash2, Plus } from 'lucide-react'
import { useChatStore } from '@/lib/store'
import { useStreamResponse } from '@/hooks/useStreamResponse'

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
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const streaming = useChatStore((s) => s.streaming)
  const createConversation = useChatStore((s) => s.createConversation)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const setActive = useChatStore((s) => s.setActive)

  const { sendMessage } = useStreamResponse()
  const activeConv = conversations.find((c) => c.id === activeId)

  useEffect(() => {
    if (!activeId && conversations.length === 0) {
      createConversation()
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(t)
    }
  }, [error])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleNewChat() {
    createConversation()
    setInput('')
    setError('')
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

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {(!activeConv || activeConv.messages.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
                <Bot className="w-12 h-12 text-[var(--accent)] mb-4" />
                <h2 className="text-xl font-medium text-[var(--foreground)] mb-2">
                  Start a conversation
                </h2>
                <p className="text-sm text-[var(--foreground)] opacity-60 max-w-md">
                  Choose a provider above and start chatting.
                </p>
              </div>
            )}

            {activeConv?.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-[var(--accent)] text-white rounded-br-md'
                      : 'bg-[var(--message-user)] text-[var(--foreground)] rounded-bl-md'
                  )}
                >
                  {msg.content}
                  {streaming && msg === activeConv.messages[activeConv.messages.length - 1] && (
                    <span className="inline-block w-2 h-4 bg-[var(--foreground)] ml-0.5 animate-pulse" />
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[var(--foreground)] flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-[var(--background)]" />
                  </div>
                )}
              </div>
            ))}

            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-3 text-center">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-[var(--sidebar-border)] p-4 shrink-0"
        >
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-[var(--chat-input-border)] bg-[var(--chat-input)] px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/40 outline-none focus:border-[var(--accent)]"
              style={{ maxHeight: '200px' }}
              disabled={streaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className={cn(
                'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                input.trim() && !streaming
                  ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                  : 'bg-[var(--chat-input-border)] text-[var(--foreground)]/30 cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
