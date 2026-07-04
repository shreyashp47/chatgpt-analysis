'use client'

import { cn } from '@/lib/utils'
import { Bot, RefreshCw } from 'lucide-react'
import { MessageActions } from './MessageActions'
import { MarkdownRenderer } from './MarkdownRenderer'
import type { Message } from '@/types/conversation'

interface MessageBubbleProps {
  message: Message
  isStreaming: boolean
  isLast: boolean
  onRegenerate?: () => void
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isError(content: string) {
  return content.startsWith('Error:')
}

export function MessageBubble({ message, isStreaming, isLast, onRegenerate }: MessageBubbleProps) {
  const error = isError(message.content)

  return (
    <div className="flex gap-4 group w-full">
      <div
        className={cn(
          'flex-1',
          message.role === 'user'
            ? 'bg-[var(--message-user)] rounded-2xl px-4 py-3 max-w-[70%] ml-auto'
            : 'max-w-[70%]'
        )}
        title={formatDate(message.createdAt)}
      >
        {message.role === 'assistant' && !error ? (
          <div className="text-sm leading-relaxed text-[var(--foreground)]">
            <MarkdownRenderer content={message.content} />
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--foreground)]">
            {message.content}
          </p>
        )}
        {isStreaming && isLast && (
          <span className="inline-block w-2 h-4 bg-[var(--foreground)] ml-0.5 animate-pulse" />
        )}
        {message.role === 'assistant' && error && (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
        {!error && (
          <MessageActions
            content={message.content}
            isAssistant={message.role === 'assistant'}
            onRegenerate={message.role === 'assistant' && !isStreaming ? onRegenerate : undefined}
          />
        )}
      </div>
    </div>
  )
}
