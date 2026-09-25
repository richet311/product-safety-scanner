type ProviderResult = { status: number; content?: string }

async function callOpenAICompatible(
  url: string,
  model: string,
  apiKey: string,
  prompt: string,
  maxTokens: number
): Promise<ProviderResult> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: maxTokens,
    }),
  })
  if (!res.ok) return { status: res.status }
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  return { status: res.status, content: data.choices?.[0]?.message?.content }
}

async function callGemini(prompt: string, maxTokens: number): Promise<ProviderResult> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: maxTokens, responseMimeType: 'application/json' },
      }),
    }
  )
  if (!res.ok) return { status: res.status }
  const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
  return { status: res.status, content: data.candidates?.[0]?.content?.parts?.[0]?.text }
}

type AIProvider = { name: string; apiKey: string | undefined; call: (prompt: string, maxTokens: number) => Promise<ProviderResult> }

const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'Groq',
    apiKey: process.env.GROQ_API_KEY,
    call: (prompt, maxTokens) =>
      callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', 'openai/gpt-oss-120b', process.env.GROQ_API_KEY!, prompt, maxTokens),
  },
  {
    name: 'Cerebras',
    apiKey: process.env.CEREBRAS_API_KEY,
    call: (prompt, maxTokens) =>
      callOpenAICompatible('https://api.cerebras.ai/v1/chat/completions', 'gpt-oss-120b', process.env.CEREBRAS_API_KEY!, prompt, maxTokens),
  },
  {
    name: 'SambaNova',
    apiKey: process.env.SAMBANOVA_API_KEY,
    call: (prompt, maxTokens) =>
      callOpenAICompatible('https://api.sambanova.ai/v1/chat/completions', 'Meta-Llama-3.3-70B-Instruct', process.env.SAMBANOVA_API_KEY!, prompt, maxTokens),
  },
  {
    name: 'Gemini',
    apiKey: process.env.GOOGLE_AI_API_KEY,
    call: callGemini,
  },
]

export async function callAI(prompt: string, maxTokens = 4096): Promise<string> {
  for (const provider of AI_PROVIDERS) {
    if (!provider.apiKey) continue
    try {
      const { status, content } = await provider.call(prompt, maxTokens)
      if (status === 429) {
        console.warn(`[ai] ${provider.name} rate limited — trying next provider`)
        continue
      }
      if (!content) {
        console.warn(`[ai] ${provider.name} returned ${status} or empty content — trying next provider`)
        continue
      }
      return content
    } catch (err) {
      console.warn(`[ai] ${provider.name} request failed:`, err)
    }
  }
  throw new Error('All AI providers are currently unavailable or rate limited.')
}
