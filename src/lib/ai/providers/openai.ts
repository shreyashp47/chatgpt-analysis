import OpenAI from 'openai'
import type { AIProvider, AIProviderConfig, ChatMessage } from '../types'

export const openaiProvider: AIProvider = {
  name: 'openai',

  async *streamChat(messages: ChatMessage[], cfg: AIProviderConfig) {
    const client = new OpenAI({ apiKey: cfg.apiKey })

    const stream = await client.chat.completions.create({
      model: cfg.model,
      messages,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) yield content
    }
  },
}
