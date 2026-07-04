'use client'

import { useState, useEffect } from 'react'
import { Settings, X, Eye, EyeOff, Check, Key } from 'lucide-react'

const PROVIDER_CONFIG = [
  { id: 'groq', label: 'Groq', keyLabel: 'GROQ_API_KEY', url: 'https://console.groq.com/keys' },
  { id: 'gemini', label: 'Gemini', keyLabel: 'GEMINI_API_KEY', url: 'https://aistudio.google.com/apikey' },
  { id: 'openai', label: 'OpenAI', keyLabel: 'OPENAI_API_KEY', url: 'https://platform.openai.com/api-keys' },
]

export function SettingsButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-[var(--message-user)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
      {open && <SettingsModal onClose={() => setOpen(false)} />}
    </>
  )
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('chat-api-keys')
      if (stored) setKeys(JSON.parse(stored))
    } catch {}
  }, [])

  function handleKeyChange(provider: string, value: string) {
    setKeys((prev) => ({ ...prev, [provider]: value }))
  }

  function toggleVisibility(provider: string) {
    setVisible((prev) => ({ ...prev, [provider]: !prev[provider] }))
  }

  function handleSave() {
    localStorage.setItem('chat-api-keys', JSON.stringify(keys))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[var(--background)] rounded-2xl shadow-xl border border-[var(--sidebar-border)] w-[90vw] max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--sidebar-border)]">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-semibold text-[var(--foreground)]">API Keys</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--message-user)] text-[var(--foreground)]/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-[var(--foreground)]/50">
            Ollama runs locally and needs no key. For other providers, enter your API key below.
          </p>

          <div className="bg-[var(--message-user)] rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-medium text-[var(--foreground)]">Ollama (Local)</span>
            </div>
            <p className="text-xs text-[var(--foreground)]/40 mt-1">No API key needed</p>
          </div>

          {PROVIDER_CONFIG.map((p) => (
            <div key={p.id}>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                {p.label}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type={visible[p.id] ? 'text' : 'password'}
                    value={keys[p.id] || ''}
                    onChange={(e) => handleKeyChange(p.id, e.target.value)}
                    placeholder={`Enter ${p.keyLabel}`}
                    className="w-full rounded-lg border border-[var(--chat-input-border)] bg-[var(--chat-input)] px-3 py-2 pr-10 text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/30 outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    onClick={() => toggleVisibility(p.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 hover:text-[var(--foreground)]"
                  >
                    {visible[p.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--accent)] hover:underline mt-1 inline-block"
              >
                Get {p.label} API key →
              </a>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--sidebar-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-[var(--chat-input-border)] text-[var(--foreground)] hover:bg-[var(--message-user)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
