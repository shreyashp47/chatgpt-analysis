export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIProviderConfig {
  apiKey?: string
  baseURL?: string
  model: string
}

export interface AIProvider {
  name: string
  streamChat(
    messages: ChatMessage[],
    config: AIProviderConfig
  ): AsyncGenerator<string>
}
