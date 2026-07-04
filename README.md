# ChatGPT Clone

A ChatGPT clone with multi-provider AI support — Ollama (local), Groq, Gemini, and OpenAI. API keys are entered in the browser and saved to localStorage — no server setup needed.

## Features

- **4 AI providers** — Ollama (local), Groq (free), Gemini (free), OpenAI
- **Streaming responses** — see text appear word-by-word
- **Conversation management** — sidebar with history, new/delete chats
- **Markdown rendering** — with syntax-highlighted code blocks
- **Dark/light mode** — persists preference, respects system setting
- **Browser API keys** — enter keys in the UI, saved to localStorage
- **Mobile responsive** — sidebar overlay on mobile

## Quick Start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**.

## Usage

### Ollama (Local)

1. Install [Ollama](https://ollama.com) and pull a model:
   ```bash
   ollama pull qwen2.5:7b-instruct
   ```
2. Start Ollama: `ollama serve`
3. Select **"Ollama (Local)"** in the dropdown — no API key needed.

### Groq (Free, no credit card)

1. Go to https://console.groq.com/keys and create an API key
2. Click the key icon (🔑) in the top-right header
3. Paste your Groq API key and click Save
4. Select **"Groq (Free)"** in the dropdown

### Gemini (Free tier)

1. Go to https://aistudio.google.com/apikey and create an API key
2. Click the key icon (🔑) → enter your Gemini key → Save
3. Select **"Gemini (Free)"** in the dropdown

### OpenAI

1. Go to https://platform.openai.com/api-keys and create an API key
2. Click the key icon (🔑) → enter your OpenAI key → Save
3. Select **"OpenAI"** in the dropdown

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages, API routes)
│   ├── api/chat/           # POST /api/chat — streaming proxy
│   ├── layout.tsx          # Root layout with ThemeProvider
│   ├── page.tsx            # Main chat page (orchestrator)
│   └── globals.css         # Tailwind, CSS variables, themes
├── components/
│   ├── chat/               # ChatInput, ChatWindow, MessageBubble, etc.
│   ├── sidebar/            # Sidebar, ConversationItem, NewChatButton
│   ├── theme/              # ThemeProvider, ThemeToggle
│   └── ui/                 # SettingsModal, Toast
├── hooks/                  # useConversations, useStreamResponse
├── lib/
│   ├── ai/                 # AI provider abstraction
│   │   └── providers/      # ollama.ts, groq.ts, gemini.ts, openai.ts
│   ├── store.ts            # Zustand store (conversations, messages)
│   └── utils.ts            # Tailwind class merging (cn)
└── types/                  # TypeScript interfaces
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full layer rules and data flow.

## Tech Stack

- **Next.js 16** — App Router, Turbopack
- **TypeScript** — strict mode
- **Tailwind CSS v4** — utility-first, dark mode via class strategy
- **OpenAI SDK** — compatible with Ollama, Groq, Gemini
- **Zustand** — state management with localStorage persistence
- **react-markdown + rehype-highlight** — markdown rendering
- **lucide-react** — icons

## Deployment

Deploy for free on [Vercel](https://vercel.com):

1. Connect your GitHub repo to Vercel
2. No environment variables needed (keys are browser-based)
3. Vercel auto-detects Next.js — just click Deploy

## Environment Variables (Optional)

Only needed if you want to set defaults instead of using browser keys:

```
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen2.5:7b-instruct
GROQ_API_KEY=your_key
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
```
