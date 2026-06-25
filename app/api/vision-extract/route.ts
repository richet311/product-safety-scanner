import Groq from 'groq-sdk'
import type { ChatCompletionContentPart } from 'groq-sdk/resources/chat/completions'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 60

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
              text: `Extract product name and full ingredient list from this label photo. Return JSON:
{"product_name": "brand and product name or null", "ingredients": "full ingredient list as text or null"}

- Search entire image (back, sides, bottom) for ingredient text
- Food: full "Ingredients:" section with all sub-ingredients in parentheses
- Medications/OTC/eye drops: combine Active AND Inactive into one string, e.g. "Active: Acetaminophen 325mg. Inactive: gelatin, glycerin"
- Cleaning/household: extract ingredients, active ingredients, chemical composition, material/substance, or disinfectant actives
- If front label states an active ingredient or concentration (e.g. "Isopropyl Alcohol 70%", "Hydrogen Peroxide 3%"), use that as ingredients
- Supplements: complete Supplement Facts panel
- Cosmetics/K-beauty/J-beauty: full ingredient list (may start with "성분", "全成分", "成份")
- Korean/Japanese/Chinese ingredients: translate to English INCI names (정제수→Water, 글리세린→Glycerin, 나이아신아마이드→Niacinamide, 알로에베라잎추출물→Aloe Barbadensis Leaf Extract, 히알루론산→Sodium Hyaluronate, 판테놀→Panthenol, 병풀추출물→Centella Asiatica Extract)
- If no ingredients visible, set ingredients to null but still return product_name
- Transcribe ALL ingredient text — do not summarize or truncate`,
            },
          ] as ChatCompletionContentPart[],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 2048,
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
            "Unable to recognize this product's ingredients. Try scanning the ingredient label directly for best results.",
          product_name: result.product_name ?? null,
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
