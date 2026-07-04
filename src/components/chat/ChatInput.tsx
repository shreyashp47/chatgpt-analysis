'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Send, ArrowUp } from 'lucide-react'

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

  const canSend = input.trim() && !disabled

  return (
    <div className="flex items-end gap-2 bg-[var(--chat-input)] border border-[var(--chat-input-border)] rounded-[28px] px-4 py-2 focus-within:border-[var(--accent)] transition-colors shadow-sm">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message ChatGPT"
        rows={1}
        className="flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-[var(--foreground)] placeholder-[var(--secondary)]/50 outline-none max-h-[200px]"
        disabled={disabled}
      />
      <button
        type="submit"
        onClick={onSubmit}
        disabled={!canSend}
        className={cn(
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
          canSend
            ? 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-80'
            : 'bg-transparent text-[var(--secondary)]/30 cursor-not-allowed'
        )}
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  )
}
