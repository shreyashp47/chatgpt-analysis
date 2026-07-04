'use client'

import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Check, Key, ExternalLink, Info } from 'lucide-react'

const PROVIDER_CONFIG = [
  {
    id: 'groq',
    label: 'Groq',
    desc: 'Fast inference, free tier, no credit card',
    keyLabel: 'GROQ_API_KEY',
    url: 'https://console.groq.com/keys',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    desc: 'Google\'s model, free tier with rate limits',
    keyLabel: 'GEMINI_API_KEY',
    url: 'https://aistudio.google.com/apikey',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    desc: 'Pay-as-you-go, requires billing setup',
    keyLabel: 'OPENAI_API_KEY',
    url: 'https://platform.openai.com/api-keys',
  },
]

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-[var(--message-user)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
      aria-label="Settings"
    >
      <Key className="w-5 h-5" />
    </button>
  )
}

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)
  const [savedProvider, setSavedProvider] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('chat-api-keys')
        if (stored) setKeys(JSON.parse(stored))
      } catch {}
    }
  }, [open])

  function handleKeyChange(provider: string, value: string) {
    setKeys((prev) => ({ ...prev, [provider]: value }))
  }

  function toggleVisibility(provider: string) {
    setVisible((prev) => ({ ...prev, [provider]: !prev[provider] }))
  }

  function handleSave() {
    localStorage.setItem('chat-api-keys', JSON.stringify(keys))
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 1000)
  }

  function isSet(id: string) {
    return keys[id] && keys[id].length > 0
  }

  if (!open) return null

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
          <div className="flex items-start gap-2 text-sm text-[var(--foreground)]/60 bg-blue-500/10 rounded-xl p-3">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p>Ollama runs locally (no key needed). For cloud providers, enter your API key below.</p>
          </div>

          <div className="bg-[var(--message-user)] rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-medium text-[var(--foreground)]">Ollama (Local)</span>
            </div>
            <p className="text-xs text-[var(--foreground)]/40 mt-1">No API key needed — runs on your machine</p>
          </div>

          {PROVIDER_CONFIG.map((p) => (
            <div key={p.id}>
              <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] mb-1">
                {p.label}
                {isSet(p.id) && <Check className="w-3.5 h-3.5 text-green-500" />}
              </label>
              <p className="text-xs text-[var(--foreground)]/40 mb-2">{p.desc}</p>
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
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline mt-1.5"
              >
                <ExternalLink className="w-3 h-3" />
                Create {p.label} API key
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
            className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors min-w-[80px] justify-center"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
