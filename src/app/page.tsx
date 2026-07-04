'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Key, Settings } from 'lucide-react'
import { useChatStore } from '@/lib/store'
import { useStreamResponse } from '@/hooks/useStreamResponse'
import { ChatInput } from '@/components/chat/ChatInput'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { SidebarToggle } from '@/components/sidebar/SidebarToggle'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { SettingsButton, SettingsModal } from '@/components/ui/SettingsModal'
import { Toast } from '@/components/ui/Toast'

const PROVIDERS = [
  { value: 'ollama', label: 'Ollama (Local)' },
  { value: 'groq', label: 'Groq (Free)' },
  { value: 'gemini', label: 'Gemini (Free)' },
  { value: 'openai', label: 'OpenAI' },
]

function hasApiKey(provider: string): boolean {
  if (provider === 'ollama') return true
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem('chat-api-keys')
    if (!stored) return false
    const keys = JSON.parse(stored)
    return !!keys[provider]
  } catch {
    return false
  }
}

export default function Home() {
  const [input, setInput] = useState('')
  const [provider, setProvider] = useState('ollama')
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const conversations = useChatStore((s) => s.conversations)
  const activeId = useChatStore((s) => s.activeId)
  const streaming = useChatStore((s) => s.streaming)
  const createConversation = useChatStore((s) => s.createConversation)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const setActive = useChatStore((s) => s.setActive)

  const { sendMessage, regenerate } = useStreamResponse()
  const activeConv = conversations.find((c) => c.id === activeId)
  const missingKey = mounted && !hasApiKey(provider) && provider !== 'ollama'

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

  function handleProviderChange(value: string) {
    setProvider(value)
    if (!hasApiKey(value) && value !== 'ollama') {
      setSettingsOpen(true)
    }
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
      >
        <div className="p-3 border-t border-[var(--sidebar-border)]">
          <a
            href="https://github.com/shreyashp47/shreyashp47.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-[var(--foreground)]/40 hover:text-[var(--accent)] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            shreyashp47.github.io
          </a>
        </div>
      </Sidebar>

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
          <div className="flex items-center gap-1">
            <SettingsButton onClick={() => setSettingsOpen(true)} />
            <ThemeToggle />
            <select
              value={provider}
              onChange={e => handleProviderChange(e.target.value)}
              className="text-sm bg-[var(--chat-input)] border border-[var(--chat-input-border)] rounded-lg px-3 py-1.5 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            >
              {PROVIDERS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </header>

        {missingKey && (
          <div className="px-4 pt-3">
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors text-left"
            >
              <Key className="w-4 h-4 shrink-0" />
              <span>Add your <strong>{PROVIDERS.find(p => p.value === provider)?.label}</strong> API key in settings to start chatting</span>
              <Settings className="w-4 h-4 ml-auto shrink-0" />
            </button>
          </div>
        )}

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
              disabled={streaming || missingKey}
            />
          </div>
        </form>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {error && (
        <Toast message={error} onClose={() => setError('')} />
      )}
    </div>
  )
}
