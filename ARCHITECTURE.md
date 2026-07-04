# Architecture

## Layer Overview

```
src/
├── app/                    Entry points (Next.js App Router)
├── components/             Presentation layer (UI components)
├── hooks/                  Custom React hooks (bridge UI <-> state)
├── lib/                    Business logic & state management
│   └── ai/                 AI provider abstraction
│       └── providers/      Provider implementations
└── types/                  Shared TypeScript types
```

## Layer Rules

Each layer has a defined dependency direction — a layer can only import from layers below it in this hierarchy:

```
app  →  components  →  hooks  →  lib  →  types
                   ↘            ↘    ↘
              (same-layer       ai/  utils
               composition)  providers/
```

- **app/** — pages, layouts, API routes. May import from any layer.
- **components/** — UI components. May import from other components (same-layer composition), hooks, lib, types. Never imports from app.
- **hooks/** — logic bridges. May import from lib and types. Never imports from components or app.
- **lib/** — business logic, state, utilities. May import from types only and other lib files. Never imports from hooks, components, or app.
- **types/** — TypeScript interfaces only. Zero project imports.

## Layer Details

### `types/` — Domain Types

Plain TypeScript interfaces with zero dependencies.

```
src/types/
└── conversation.ts          Message, Conversation interfaces
```

### `lib/` — Business Logic & State

```
src/lib/
├── store.ts                 Zustand store (conversations, messages, streaming state)
├── utils.ts                 Shared utilities (cn helper for Tailwind classes)
└── ai/
    ├── types.ts             AI provider interfaces (AIProvider, ChatMessage)
    ├── config.ts            Environment variable config (API keys, models, base URLs)
    ├── provider-factory.ts  Factory pattern — returns correct provider based on AI_PROVIDER
    └── providers/           Individual provider implementations
        ├── ollama.ts        Local LLM (OpenAI SDK, custom baseURL)
        ├── groq.ts          Free cloud LLM (OpenAI SDK, custom baseURL)
        ├── gemini.ts        Google Gemini (OpenAI SDK via Google's compatibility endpoint)
        └── openai.ts        OpenAI (default SDK)
```

**Provider pattern** — each provider implements the `AIProvider` interface:

```typescript
interface AIProvider {
  name: string
  streamChat(messages: ChatMessage[], config: AIProviderConfig): AsyncGenerator<string>
}
```

Adding a new provider: create a file in `providers/`, implement the interface, add config in `config.ts`, register in `provider-factory.ts`.

### `hooks/` — React Hooks

```
src/hooks/
├── useConversations.ts      Wraps Zustand store for component consumption
└── useStreamResponse.ts     Sends messages to /api/chat, updates store chunk-by-chunk
```

Hooks encapsulate state access patterns and async logic so components stay simple.

### `components/` — UI Components

```
src/components/
└── chat/
    ├── ChatInput.tsx        Textarea + send button + shortcut hint
    ├── ChatWindow.tsx       Scrollable message list + scroll detection
    ├── MessageBubble.tsx    Individual message with avatar, timestamp, error state
    └── MessageActions.tsx   Copy + Regenerate action buttons
```

Components are stateless where possible — they receive data and callbacks via props. State lives in the store.

### `app/` — Entry Points

```
src/app/
├── layout.tsx               Root layout (font loading, global styles)
├── page.tsx                 Main page (orchestrates sidebar + chat window + input)
├── globals.css              Tailwind directives, CSS variables, dark mode
└── api/chat/
    └── route.ts             POST /api/chat — streaming proxy to AI provider
```

`page.tsx` is the orchestrator — it wires store, hooks, and components together.

## Data Flow

```
User types → ChatInput.onSubmit()
  → page.tsx.handleSubmit()
    → useStreamResponse.sendMessage()
      → adds user message to Zustand store
      → adds empty assistant message to store
      → POST /api/chat (streaming)
        → provider-factory → provider.streamChat()
          → OpenAI SDK → external API
      → reads stream chunk-by-chunk
      → updateMessage() → store → re-render
```

## Adding a Feature

1. **Types first** — define interfaces in `src/types/`
2. **Store action** — add logic in `src/lib/store.ts`
3. **Hook** — create a hook in `src/hooks/` if async or complex
4. **Component** — build UI in `src/components/`
5. **Wire up** — use in `src/app/page.tsx`

## Environment Variables

See `.env.local.example` for all config options. Provider is selected via `AI_PROVIDER`.

```
AI_PROVIDER=ollama | groq | gemini | openai
```
