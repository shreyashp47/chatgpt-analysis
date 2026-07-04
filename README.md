# ChatGPT Clone

Minimal ChatGPT clone with multi-provider AI support.

## Features

- Multi-provider AI (Ollama local, Groq free, OpenAI)
- Streaming responses
- Clean chat UI

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Configuration

Copy `.env.local.example` to `.env.local` and configure:

```bash
AI_PROVIDER=ollama     # or groq, openai

# Ollama (default)
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen2.5:7b-instruct

# Groq (free, no credit card)
GROQ_API_KEY=your_key
GROQ_MODEL=llama-3.3-70b-versatile

# OpenAI
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini
```

## Tech Stack

- Next.js 16, TypeScript, Tailwind v4
- OpenAI SDK (compatible with Ollama, Groq)
- lucide-react icons
