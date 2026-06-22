import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

const DAILY_LIMIT = Number(process.env.DAILY_SCAN_LIMIT ?? 20)

function stripMd(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
}

function extractJSON(raw: string): string {
  const stripped = stripMd(raw)
  try { JSON.parse(stripped); return stripped } catch {}
  // Gemini sometimes wraps JSON in prose — grab the first {...} block
  const match = stripped.match(/\{[\s\S]*\}/)
  return match ? match[0] : stripped
}

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

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit — query immutable scan_events (users have INSERT only, no DELETE)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count, error: countError } = await supabase
    .from('scan_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())

  if (countError) {
    // Tables may not be set up yet — skip rate limiting rather than blocking
    console.error('[scan] rate-limit query failed (tables may not exist yet):', countError.message)
  } else if ((count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Daily scan limit of ${DAILY_LIMIT} reached. Try again tomorrow.` },
      { status: 429 }
    )
  }

  // Parse body
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

  if (!ingredients) {
    return NextResponse.json({ error: 'ingredients is required' }, { status: 400 })
  }

  if (ingredients.length > 4000) {
    return NextResponse.json({ error: 'Ingredients text too long (max 4000 chars)' }, { status: 400 })
  }

  // AI analysis
  let analysis: ScanAnalysis
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const result = await model.generateContent(`Analyze these product ingredients for safety. Return ONLY valid JSON, no markdown, no extra text.

Schema:
{
  "overall_grade": "A" | "B" | "C" | "D",
  "summary": "1-2 sentence safety assessment",
  "ingredients": [
    {
      "name": "ingredient name",
      "grade": "A" | "B" | "C" | "D",
      "concern": "brief concern string or null",
      "safe": true | false
    }
  ]
}

Grading scale:
A = very safe, well-studied, no concerns
B = generally safe, minor concerns for some people
C = use with caution, some studies show concerns
D = potentially harmful, avoid if possible

Ingredients list:
${ingredients}`)

    analysis = JSON.parse(extractJSON(result.response.text())) as ScanAnalysis
  } catch (err) {
    console.error('[scan] AI analysis failed:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 502 })
  }

  // Persist scan event (immutable log for rate limiting — no user DELETE policy)
  const { error: eventError } = await supabase
    .from('scan_events')
    .insert({ user_id: user.id })

  if (eventError) {
    console.error('[scan] scan_events insert failed:', eventError.message)
  }

  // Persist scan result (user can delete their own history)
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

  if (scanError) {
    console.error('[scan] scans insert failed:', scanError.message)
  }

  return NextResponse.json({
    id: scanData?.id,
    analysis,
    scans_today: (count ?? 0) + 1,
    daily_limit: DAILY_LIMIT,
  })
}
