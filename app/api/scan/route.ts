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
  flagged?: boolean
}

type ScanAnalysis = {
  overall_grade: 'A' | 'B' | 'C' | 'D'
  summary: string
  ingredients: IngredientAnalysis[]
  user_alerts?: string[]
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('allergies, dietary_preferences, health_conditions, age')
    .eq('id', user.id)
    .single()

  const profileLines: string[] = []
  if (profile?.allergies?.length) {
    profileLines.push(`Allergies/intolerances (mark matching ingredients flagged=true and safe=false): ${profile.allergies.join(', ')}`)
  }
  if (profile?.dietary_preferences?.length) {
    profileLines.push(`Dietary preferences (flag ingredients incompatible with these): ${profile.dietary_preferences.join(', ')}`)
  }
  if (profile?.health_conditions?.length) {
    profileLines.push(`Health conditions (flag ingredients that may aggravate these): ${profile.health_conditions.join(', ')}`)
  }
  if (profile?.age) {
    profileLines.push(`User age: ${profile.age}`)
  }

  const profileSection = profileLines.length > 0
    ? `\nUser health profile — personalize the analysis for this person:\n${profileLines.join('\n')}\n`
    : ''

  let analysis: ScanAnalysis
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Analyze these product ingredients for safety. Return ONLY valid JSON.

Schema:
{"overall_grade":"A"|"B"|"C"|"D","summary":"1-2 sentence safety assessment","ingredients":[{"name":"ingredient name","grade":"A"|"B"|"C"|"D","concern":"brief concern or null","safe":true|false,"flagged":false}],"user_alerts":[]}

Grading scale:
A = very safe, well-studied, no concerns
B = generally safe, minor concerns for some people
C = use with caution, some studies show concerns
D = potentially harmful, avoid if possible

"flagged" means the ingredient directly conflicts with the user's allergies, dietary preferences, or health conditions.
"user_alerts" is an array of short personal warning strings (e.g. "Contains Dairy — you are lactose intolerant"). Leave empty [] if no profile or no conflicts.
${profileSection}
Ingredients list:
${ingredients}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 4096,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('Empty response')
    analysis = JSON.parse(content) as ScanAnalysis
  } catch (err) {
    console.error('[scan] analysis failed:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 502 })
  }

  const safeGrade = (analysis.overall_grade?.toUpperCase() ?? 'B') as 'A' | 'B' | 'C' | 'D'
  if (!['A', 'B', 'C', 'D'].includes(safeGrade)) {
    console.error('[scan] unexpected grade from AI:', analysis.overall_grade)
  }

  const { data: scanData, error: scanError } = await supabase
    .from('scans')
    .insert({
      user_id: user.id,
      product_name: productName ?? null,
      raw_ingredients: ingredients,
      analysis,
      overall_grade: safeGrade,
      image_url: imageUrl ?? null,
    })
    .select('id')
    .single()

  if (scanError) {
    console.error('[scan] insert failed:', scanError.message)
  } else {
    // Only count usage when the scan was actually saved
    const { error: eventError } = await supabase.from('scan_events').insert({ user_id: user.id })
    if (eventError) console.error('[scan] scan_events insert failed:', eventError.message)
  }

  return NextResponse.json({
    id: scanData?.id,
    analysis,
    scans_today: scanData ? (count ?? 0) + 1 : (count ?? 0),
    daily_limit: DAILY_LIMIT,
    ...(scanError ? { _save_error: scanError.message } : {}),
  })
}
