'use client'

import { cn } from '@/lib/utils'
import { MessageSquare, Trash2 } from 'lucide-react'
import type { Conversation } from '@/types/conversation'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function ConversationItem({ conversation, isActive, onSelect, onDelete }: ConversationItemProps) {
  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm text-left transition-colors group',
        isActive
          ? 'bg-[var(--message-user)] text-[var(--foreground)] font-medium'
          : 'text-[var(--foreground)]/70 hover:bg-[var(--message-user)] hover:text-[var(--foreground)]'
      )}
    >
      <MessageSquare className="w-4 h-4 shrink-0" />
      <span className="truncate flex-1">{conversation.title}</span>
      <span
        onClick={(e) => { e.stopPropagation(); onDelete(conversation.id) }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-opacity cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </span>
    </button>
  )
}
