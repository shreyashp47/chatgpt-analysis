'use client'

import { cn } from '@/lib/utils'
import { Bot, User, RefreshCw } from 'lucide-react'
import { MessageActions } from './MessageActions'
import { MarkdownRenderer } from './MarkdownRenderer'
import type { Message } from '@/types/conversation'

interface MessageBubbleProps {
  message: Message
  isStreaming: boolean
  isLast: boolean
  onRegenerate?: () => void
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
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
  const displayContent = error
    ? message.content
    : message.content

  return (
    <div
      className={cn(
        'flex gap-3 group',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="flex flex-col items-end">
        <div
          className={cn(
            'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
            message.role === 'user'
              ? 'bg-[var(--accent)] text-white rounded-br-md'
              : error
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 rounded-bl-md border border-red-500/20'
                : 'bg-[var(--message-user)] text-[var(--foreground)] rounded-bl-md'
          )}
          title={formatDate(message.createdAt)}
        >
          {message.role === 'assistant' && !error ? (
            <MarkdownRenderer content={displayContent} />
          ) : (
            <p className="whitespace-pre-wrap">{displayContent}</p>
          )}
          {isStreaming && isLast && (
            <span className="inline-block w-2 h-4 bg-[var(--foreground)] ml-0.5 animate-pulse" />
          )}
        </div>
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
      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-[var(--foreground)] flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-[var(--background)]" />
        </div>
      )}
      {message.role === 'user' && (
        <span className="text-[10px] text-[var(--foreground)]/30 mt-1 hidden group-hover:block">
          {formatTime(message.createdAt)}
        </span>
      )}
    </div>
  )
}
