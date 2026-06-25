type AIProvider = { name: string; url: string; model: string; apiKey: string | undefined }

const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    apiKey: process.env.GROQ_API_KEY,
  },
  {
    name: 'Cerebras',
    url: 'https://api.cerebras.ai/v1/chat/completions',
    model: 'llama-3.3-70b',
    apiKey: process.env.CEREBRAS_API_KEY,
  },
  {
    name: 'SambaNova',
    url: 'https://api.sambanova.ai/v1/chat/completions',
    model: 'Meta-Llama-3.3-70B-Instruct',
    apiKey: process.env.SAMBANOVA_API_KEY,
  },
]

export async function callAI(prompt: string, maxTokens = 4096): Promise<string> {
  for (const provider of AI_PROVIDERS) {
    if (!provider.apiKey) continue
    try {
      const res = await fetch(provider.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.apiKey}` },
        body: JSON.stringify({
          model: provider.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0,
          max_tokens: maxTokens,
        }),
      })
      if (res.status === 429) {
        console.warn(`[ai] ${provider.name} rate limited — trying next provider`)
        continue
      }
      if (!res.ok) {
        console.warn(`[ai] ${provider.name} returned ${res.status} — trying next provider`)
        continue
      }
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
      const content = data.choices?.[0]?.message?.content
      if (!content) {
        console.warn(`[ai] ${provider.name} returned empty content — trying next provider`)
        continue
      }
      return content
    } catch (err) {
      console.warn(`[ai] ${provider.name} request failed:`, err)
    }
  }
  throw new Error('All AI providers are currently unavailable or rate limited.')
}
