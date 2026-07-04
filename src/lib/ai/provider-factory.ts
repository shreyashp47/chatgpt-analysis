import type { AIProvider, AIProviderConfig } from './types'
import { config } from './config'
import { ollamaProvider } from './providers/ollama'
import { groqProvider } from './providers/groq'
import { openaiProvider } from './providers/openai'
import { geminiProvider } from './providers/gemini'

const providers: Record<string, AIProvider> = {
  ollama: ollamaProvider,
  groq: groqProvider,
  openai: openaiProvider,
  gemini: geminiProvider,
}

export function getProvider(name?: string): AIProvider {
  const providerName = name || config.provider
  const provider = providers[providerName]
  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}. Available: ${Object.keys(providers).join(', ')}`)
  }
  return provider
}

export function getProviderConfig(providerName?: string): AIProviderConfig {
  const name = providerName || config.provider
  switch (name) {
    case 'ollama':
      return { baseURL: config.ollama.baseURL, model: config.ollama.model }
    case 'groq':
      return { apiKey: config.groq.apiKey, model: config.groq.model }
    case 'openai':
      return { apiKey: config.openai.apiKey, model: config.openai.model }
    case 'gemini':
      return { apiKey: config.gemini.apiKey, model: config.gemini.model }
    default:
      throw new Error(`No config for provider: ${name}`)
  }
}
