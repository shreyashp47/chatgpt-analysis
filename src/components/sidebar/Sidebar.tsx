'use client'

import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { NewChatButton } from './NewChatButton'
import { ConversationItem } from './ConversationItem'
import { Search, Trash2 } from 'lucide-react'
import type { Conversation } from '@/types/conversation'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  isOpen: boolean
  onClose: () => void
  onNewChat: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onClearAll: () => void
  children?: React.ReactNode
}

function formatDate(ts: number) {
  const now = Date.now()
  const diff = now - ts
  const oneDay = 86400000
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay

  if (diff < oneDay) return 'Today'
  if (diff < 2 * oneDay) return 'Yesterday'
  if (diff < oneWeek) return 'Previous 7 Days'
  if (diff < oneMonth) return 'Previous 30 Days'
  return 'Older'
}

const GROUP_ORDER = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older']

export function Sidebar({ conversations, activeId, isOpen, onClose, onNewChat, onSelect, onDelete, onClearAll, children }: SidebarProps) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    )
  }, [conversations, search])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof conversations> = {}
    for (const conv of filtered) {
      const label = formatDate(conv.updatedAt)
      if (!groups[label]) groups[label] = []
      groups[label].push(conv)
    }
    return groups
  }, [filtered])

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
          'md:relative md:translate-x-0 md:w-[260px]',
          isOpen
            ? 'fixed inset-y-0 left-0 w-72 translate-x-0'
            : 'fixed inset-y-0 left-0 w-72 -translate-x-full md:hidden'
        )}
      >
        <div className="p-3">
          <NewChatButton onClick={onNewChat} />
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--secondary)]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-[var(--chat-input-border)] bg-transparent pl-9 pr-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--secondary)]/50 outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {filtered.length === 0 && (
            <p className="text-sm text-[var(--foreground)]/40 text-center py-8">
              {search ? 'No matches' : 'No conversations yet'}
            </p>
          )}

          {GROUP_ORDER.map((group) => {
            const items = grouped[group]
            if (!items?.length) return null
            return (
              <div key={group}>
                <p className="text-[11px] font-medium text-[var(--secondary)]/50 uppercase tracking-wider px-2 py-1">
                  {group}
                </p>
                {items.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )
          })}
        </div>

        <div className="border-t border-[var(--sidebar-border)] p-2 space-y-0.5">
          {conversations.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm text-[var(--foreground)]/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear conversations
            </button>
          )}
          {children}
        </div>
      </aside>
    </>
  )
}
