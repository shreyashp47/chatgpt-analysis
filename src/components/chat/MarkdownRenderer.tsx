'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check } from 'lucide-react'
import type { Components } from 'react-markdown'

interface MarkdownRendererProps {
  content: string
}

function CodeBlock({ language, children }: { language?: string; children: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-black/20 dark:bg-white/10 rounded-t-lg px-4 py-1.5 text-xs text-[var(--foreground)]/50">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
        >
          {copied ? (
            <><Check className="w-3 h-3" /> Copied</>
          ) : (
            <><Copy className="w-3 h-3" /> Copy</>
          )}
        </button>
      </div>
      <pre className="bg-black/10 dark:bg-white/5 rounded-b-lg p-4 overflow-x-auto text-sm leading-relaxed">
        <code className={language ? `language-${language}` : ''}>{children}</code>
      </pre>
    </div>
  )
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const isInline = !match
    if (isInline) {
      return (
        <code
          className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      )
    }
    return <CodeBlock language={match[1]}>{String(children).replace(/\n$/, '')}</CodeBlock>
  },
  a({ href, children, ...props }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--accent)] hover:underline"
        {...props}
      >
        {children}
      </a>
    )
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full text-sm border-collapse border border-[var(--chat-input-border)]">
          {children}
        </table>
      </div>
    )
  },
  th({ children }) {
    return (
      <th className="border border-[var(--chat-input-border)] bg-black/10 dark:bg-white/10 px-3 py-2 text-left font-medium">
        {children}
      </th>
    )
  },
  td({ children }) {
    return (
      <td className="border border-[var(--chat-input-border)] px-3 py-2">
        {children}
      </td>
    )
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-[var(--accent)] pl-4 my-3 text-[var(--foreground)]/70 italic">
        {children}
      </blockquote>
    )
  },
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
