'use client'

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { useChatStore } from '@/lib/store'
import { useStreamResponse } from '@/hooks/useStreamResponse'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { SidebarToggle } from '@/components/sidebar/SidebarToggle'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Toast } from '@/components/ui/Toast'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const streaming = useChatStore((s) => s.streaming)
  const createConversation = useChatStore((s) => s.createConversation)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const setActive = useChatStore((s) => s.setActive)

  const { sendMessage, regenerate } = useStreamResponse()
  const activeConv = conversations.find((c) => c.id === activeId)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!activeId && conversations.length === 0) {
      createConversation()
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-dvh bg-[var(--background)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--foreground)]/50">Loading...</p>
        </div>
      </div>
    )
  }

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
    setSidebarOpen(false)
  }

  function handleRegenerate() {
    if (!activeId || streaming) return
    regenerate(activeId, provider)
  }

  function handleSelectConversation(id: string) {
    setActive(id)
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-dvh bg-[var(--background)]">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelect={handleSelectConversation}
        onDelete={deleteConversation}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--sidebar-border)] shrink-0">
          <div className="flex items-center gap-2">
            <SidebarToggle
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen((v) => !v)}
            />
            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            <h1 className="font-semibold text-[var(--foreground)]">Chat</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <select
              value={provider}
              onChange={e => setProvider(e.target.value)}
              className="text-sm bg-[var(--chat-input)] border border-[var(--chat-input-border)] rounded-lg px-3 py-1.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            >
              {PROVIDERS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </header>

        <ChatWindow
          conversation={activeConv}
          streaming={streaming}
          onRegenerate={handleRegenerate}
        />

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

      {error && (
        <Toast message={error} onClose={() => setError('')} />
      )}
    </div>
  )
}
