import Groq from 'groq-sdk'
import type { ChatCompletionContentPart } from 'groq-sdk/resources/chat/completions'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let image_base64: string
  try {
    const body = await request.json()
    image_base64 = String(body.image_base64 ?? '').trim()
    if (!image_base64) throw new Error('missing')
  } catch {
    return NextResponse.json({ error: 'image_base64 is required' }, { status: 400 })
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${image_base64}` },
            },
            {
              type: 'text',
              text: `Look at this product image and extract information from the label.

Return ONLY valid JSON with this exact schema:
{"product_name": "brand and product name or null", "ingredients": "full ingredient list as text or null"}

Rules:
- For food/beverages: extract the "Ingredients:" section as-is
- For medications/OTC drugs: combine Active AND Inactive ingredients into one string, e.g. "Active: Acetaminophen 325mg, Dextromethorphan 15mg. Inactive: gelatin, glycerin, polyethylene glycol"
- For supplements: list all ingredients shown on the Supplement Facts panel
- If no ingredient list is visible or readable, set ingredients to null
- Return ONLY the JSON object, no other text`,
            },
          ] as ChatCompletionContentPart[],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 1024,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('Empty response from vision model')

    let result: { product_name?: string | null; ingredients?: string | null }
    try {
      result = JSON.parse(content)
    } catch {
      throw new Error('Vision model returned invalid JSON')
    }

    if (!result.ingredients) {
      return NextResponse.json(
        {
          error:
            "Couldn't read the ingredient list from this photo. Make sure the label is in focus and well-lit, then try again.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      product_name: result.product_name ?? undefined,
      ingredients: result.ingredients,
    })
  } catch (err) {
    console.error('[vision-extract] failed:', err)
    return NextResponse.json({ error: 'Could not process the photo. Please try again.' }, { status: 502 })
  }
}
