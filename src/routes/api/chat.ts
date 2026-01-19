import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, provider = 'openai', model } = await req.json()

  const providers: Record<string, { model: (id: string) => any; key: string }> = {
    openai: { model: openai, key: 'OPENAI_API_KEY' },
    anthropic: { model: anthropic, key: 'ANTHROPIC_API_KEY' },
    google: { model: google, key: 'GOOGLE_API_KEY' },
  }

  const selected = providers[provider]
  if (!selected) {
    return new Response(JSON.stringify({ error: 'Invalid provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const modelId = model || (provider === 'openai' ? 'gpt-4o' : provider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gemini-2.0-flash-exp')

  try {
    const result = await streamText({
      model: selected.model(modelId),
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('AI error:', error)
    return new Response(JSON.stringify({ error: 'Error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
