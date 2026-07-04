'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { NewChatButton } from './NewChatButton'
import { ConversationItem } from './ConversationItem'
import type { Conversation } from '@/types/conversation'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function Sidebar({ conversations, activeId, isOpen, onClose, onNewChat, onSelect, onDelete }: SidebarProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] flex flex-col transition-transform duration-200 z-40',
          'md:relative md:translate-x-0 md:w-64',
          isOpen
            ? 'fixed inset-y-0 left-0 w-72 translate-x-0'
            : 'fixed inset-y-0 left-0 w-72 -translate-x-full md:hidden'
        )}
      >
        <div className="p-3">
          <NewChatButton onClick={onNewChat} />
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {conversations.length === 0 && (
            <p className="text-sm text-[var(--foreground)]/40 text-center py-8">
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      </aside>
    </>
  )
}
