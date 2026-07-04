'use client'

import { Plus } from 'lucide-react'

interface NewChatButtonProps {
  onClick: () => void
}

export function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full rounded-lg border border-[var(--chat-input-border)] px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--message-user)] transition-colors"
    >
      <Plus className="w-4 h-4" />
      New chat
    </button>
  )
}
