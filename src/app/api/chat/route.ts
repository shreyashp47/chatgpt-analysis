import { getProvider, getProviderConfig } from '@/lib/ai/provider-factory'
import type { ChatMessage } from '@/lib/ai/types'

export async function POST(req: Request) {
  try {
    const { messages, provider: providerName } = await req.json() as {
      messages: ChatMessage[]
      provider?: string
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response('Messages array is required', { status: 400 })
    }

    const provider = getProvider(providerName)
    const config = getProviderConfig(providerName)

    if (!config.apiKey && provider.name !== 'ollama') {
      return new Response(
        `API key not configured for provider "${provider.name}". Set ${provider.name.toUpperCase()}_API_KEY in .env.local`,
        { status: 400 }
      )
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of provider.streamChat(messages, config)) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Stream error'
          controller.enqueue(new TextEncoder().encode(`\n\nError: ${message}`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return new Response(message, { status: 500 })
  }
}
