import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const DAILY_LIMIT = Number(process.env.DAILY_SCAN_LIMIT ?? 20)

type IngredientAnalysis = {
  name: string
  grade: 'A' | 'B' | 'C' | 'D'
  concern: string | null
  safe: boolean
}

type ScanAnalysis = {
  overall_grade: 'A' | 'B' | 'C' | 'D'
  summary: string
  ingredients: IngredientAnalysis[]
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count, error: countError } = await supabase
    .from('scan_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())

  if (!countError && (count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Daily scan limit of ${DAILY_LIMIT} reached. Try again tomorrow.` },
      { status: 429 }
    )
  }

  let ingredients: string
  let productName: string | undefined
  let imageUrl: string | undefined
  try {
    const body = await request.json()
    ingredients = String(body.ingredients ?? '').trim()
    productName = body.product_name ? String(body.product_name).trim() : undefined
    imageUrl = body.image_url ? String(body.image_url).trim() : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!ingredients) return NextResponse.json({ error: 'ingredients is required' }, { status: 400 })
  if (ingredients.length > 4000) return NextResponse.json({ error: 'Ingredients text too long (max 4000 chars)' }, { status: 400 })

  let analysis: ScanAnalysis
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Analyze these product ingredients for safety. Return ONLY valid JSON.

Schema:
{"overall_grade":"A"|"B"|"C"|"D","summary":"1-2 sentence safety assessment","ingredients":[{"name":"ingredient name","grade":"A"|"B"|"C"|"D","concern":"brief concern or null","safe":true|false}]}

Grading scale:
A = very safe, well-studied, no concerns
B = generally safe, minor concerns for some people
C = use with caution, some studies show concerns
D = potentially harmful, avoid if possible

Ingredients list:
${ingredients}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 4096,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('Empty response')
    analysis = JSON.parse(content) as ScanAnalysis
  } catch (err) {
    console.error('[scan] analysis failed:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 502 })
  }

  const { error: eventError } = await supabase.from('scan_events').insert({ user_id: user.id })
  if (eventError) console.error('[scan] scan_events insert failed:', eventError.message)

  const { data: scanData, error: scanError } = await supabase
    .from('scans')
    .insert({
      user_id: user.id,
      product_name: productName ?? null,
      raw_ingredients: ingredients,
      analysis,
      overall_grade: analysis.overall_grade,
      image_url: imageUrl ?? null,
    })
    .select('id')
    .single()

  if (scanError) console.error('[scan] insert failed:', scanError.message)

  return NextResponse.json({
    id: scanData?.id,
    analysis,
    scans_today: (count ?? 0) + 1,
    daily_limit: DAILY_LIMIT,
  })
}
