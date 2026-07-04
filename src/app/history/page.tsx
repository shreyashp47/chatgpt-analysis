'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/lib/store'
import { Search, ArrowLeft, MessageSquare, Trash2 } from 'lucide-react'

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

function dateLabel(ts: number) {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function truncate(text: string, len: number) {
  return text.length > len ? text.slice(0, len) + '...' : text
}

const GROUP_ORDER = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older']

export default function HistoryPage() {
  const router = useRouter()
  const conversations = useChatStore((s) => s.conversations)
  const setActive = useChatStore((s) => s.setActive)
  const deleteConversation = useChatStore((s) => s.deleteConversation)
  const [search, setSearch] = useState('')

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

  function handleSelect(id: string) {
    setActive(id)
    router.push('/')
  }

  return (
    <div className="flex h-dvh bg-[var(--background)]">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-[var(--sidebar-border)] shrink-0">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl hover:bg-[var(--message-user)] text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-[var(--foreground)]">Chat History</h1>
        </header>

        <div className="px-6 pt-4 pb-2">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--secondary)]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-[var(--chat-input-border)] bg-[var(--chat-input)] pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--secondary)]/50 outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-10 h-10 text-[var(--secondary)]/30 mb-3" />
              <p className="text-sm text-[var(--secondary)]/60">
                {search ? 'No conversations match your search' : 'No conversations yet'}
              </p>
            </div>
          )}

          {GROUP_ORDER.map((group) => {
            const items = grouped[group]
            if (!items?.length) return null
            return (
              <div key={group} className="mb-6">
                <h2 className="text-xs font-semibold text-[var(--secondary)]/60 uppercase tracking-wider mb-2 px-1">
                  {group}
                </h2>
                <div className="space-y-1">
                  {items.map((conv) => {
                    const preview = conv.messages.find((m) => m.role === 'user')?.content
                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleSelect(conv.id)}
                        className="group flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left hover:bg-[var(--message-user)] transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-[var(--secondary)]/40 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--foreground)] truncate">
                              {conv.title}
                            </span>
                            <span className="text-xs text-[var(--secondary)]/40 shrink-0">
                              {dateLabel(conv.updatedAt)}
                            </span>
                          </div>
                          {preview && (
                            <p className="text-xs text-[var(--secondary)]/50 truncate mt-0.5">
                              {truncate(preview, 100)}
                            </p>
                          )}
                        </div>
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteConversation(conv.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-[var(--secondary)]/40 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
