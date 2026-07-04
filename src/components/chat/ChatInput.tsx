'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Send } from 'lucide-react'

interface ChatInputProps {
  input: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
}

export function ChatInput({ input, onChange, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`
    }
  }, [input])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          rows={1}
          className="w-full resize-none rounded-xl border border-[var(--chat-input-border)] bg-[var(--chat-input)] px-4 py-3 pr-20 text-sm text-[var(--foreground)] placeholder-[var(--foreground)]/40 outline-none focus:border-[var(--accent)]"
          disabled={disabled}
        />
        <span className="absolute bottom-2 right-3 text-[10px] text-[var(--foreground)]/20 select-none">
          Shift+Enter for newline
        </span>
      </div>
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className={cn(
          'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
          input.trim() && !disabled
            ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
            : 'bg-[var(--chat-input-border)] text-[var(--foreground)]/30 cursor-not-allowed'
        )}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  )
}
