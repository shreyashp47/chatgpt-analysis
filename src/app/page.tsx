'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Send, Bot, User, Sparkles } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const PROVIDERS = [
  { value: 'ollama', label: 'Ollama (Local)' },
  { value: 'groq', label: 'Groq (Free)' },
  { value: 'gemini', label: 'Gemini (Free)' },
  { value: 'openai', label: 'OpenAI' },
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [provider, setProvider] = useState('ollama')
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input.trim() || streaming) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setStreaming(true)
    setError('')

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          provider,
        }),
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: copy[copy.length - 1].content + text,
          }
          return copy
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-dvh bg-[var(--background)]">
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
          {messages.length === 0 && !streaming && (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
              <Bot className="w-12 h-12 text-[var(--accent)] mb-4" />
              <h2 className="text-xl font-medium text-[var(--foreground)] mb-2">
                Start a conversation
              </h2>
              <p className="text-sm text-[var(--foreground)] opacity-60 max-w-md">
                Choose a provider above and start chatting. Ollama runs locally,
                Groq is free with no credit card.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
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
                {i === messages.length - 1 && streaming && (
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
  )
}
