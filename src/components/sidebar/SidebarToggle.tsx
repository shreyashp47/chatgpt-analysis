'use client'

import { Menu, X } from 'lucide-react'

interface SidebarToggleProps {
  isOpen: boolean
  onToggle: () => void
}

export function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="md:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--message-user)] text-[var(--foreground)] transition-colors"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  )
}
