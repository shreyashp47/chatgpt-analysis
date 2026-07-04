'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Bot, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MessageBubble } from './MessageBubble'
import type { Conversation } from '@/types/conversation'

interface ChatWindowProps {
  conversation: Conversation | undefined
  streaming: boolean
  onRegenerate: () => void
}

export function ChatWindow({ conversation, streaming, onRegenerate }: ChatWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const checkScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setIsAtBottom(atBottom)
    setShowScrollButton(!atBottom)
  }, [])

  useEffect(() => {
    if (isAtBottom || streaming) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation?.messages, streaming, isAtBottom])

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const messages = conversation?.messages ?? []

  return (
    <div
      ref={containerRef}
      onScroll={checkScroll}
      className="flex-1 overflow-y-auto px-4 py-6 relative"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
            <Bot className="w-12 h-12 text-[var(--accent)] mb-4" />
            <h2 className="text-xl font-medium text-[var(--foreground)] mb-2">
              Start a conversation
            </h2>
            <p className="text-sm text-[var(--foreground)] opacity-60 max-w-md">
              Choose a provider above and start chatting.
            </p>
            <a
              href="https://github.com/shreyashp47/shreyashp47.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--foreground)]/30 hover:text-[var(--accent)] transition-colors mt-6"
            >
              Built by shreyashp47
            </a>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id} className="message-enter">
            <MessageBubble
              message={msg}
              isStreaming={streaming}
              isLast={i === messages.length - 1}
              onRegenerate={onRegenerate}
            />
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[var(--accent)] text-white shadow-lg flex items-center justify-center hover:bg-[var(--accent-hover)] transition-colors animate-bounce"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
