'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'

interface MessageActionsProps {
  content: string
  isAssistant: boolean
  onRegenerate?: () => void
}

export function MessageActions({ content, isAssistant, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={handleCopy}
        className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
        title="Copy message"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      {isAssistant && onRegenerate && content && !content.startsWith('Error:') && (
        <button
          onClick={onRegenerate}
          className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
          title="Regenerate response"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
