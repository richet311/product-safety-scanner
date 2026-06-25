import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callAI } from '@/lib/ai-providers'

export const maxDuration = 60

const MAX_SCANS = 50
const BATCH_SIZE = 5

type Ingredient = {
  name: string
  grade: 'A' | 'B' | 'C' | 'D'
  concern: string | null
  safe: boolean
  flagged?: boolean
}

type Analysis = {
  overall_grade: 'A' | 'B' | 'C' | 'D'
  summary: string
  key_ingredients?: Ingredient[]
  concern_ingredients?: Ingredient[]
  total_ingredients_count?: number
  ingredients?: Ingredient[]
  user_alerts?: string[]
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('allergies, dietary_preferences, health_conditions')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ updated: 0 })

  const profileLines: string[] = []
  if (profile.allergies?.length) {
    profileLines.push(`Allergies/intolerances: ${profile.allergies.join(', ')}`)
  }
  if (profile.dietary_preferences?.length) {
    profileLines.push(`Dietary preferences: ${profile.dietary_preferences.join(', ')}`)
  }
  if (profile.health_conditions?.length) {
    profileLines.push(`Health conditions: ${profile.health_conditions.join(', ')}`)
  }

  const { data: scans } = await supabase
    .from('scans')
    .select('id, analysis')
    .eq('user_id', user.id)
    .not('analysis', 'is', null)
    .order('created_at', { ascending: false })
    .limit(MAX_SCANS)

  if (!scans?.length) return NextResponse.json({ updated: 0 })

  let updated = 0

  for (let i = 0; i < scans.length; i += BATCH_SIZE) {
    const batch = scans.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (scan) => {
      try {
        const existing = scan.analysis as Analysis
        if (!existing) return

        const allIngredients: Ingredient[] = [
          ...(existing.key_ingredients ?? []),
          ...(existing.concern_ingredients ?? []),
          ...(existing.ingredients ?? []),
        ]
        if (!allIngredients.length) return

        let flaggedLower: string[] = []
        let userAlerts: string[] = []

        if (profileLines.length > 0) {
          const names = allIngredients.map(i => i.name).join(', ')
          const content = await callAI(
            `Review these product ingredients and identify which ones conflict with the user health profile.\n\nIngredients: ${names}\n\nUser health profile:\n${profileLines.join('\n')}\n\nReturn ONLY valid JSON:\n{"flagged_ingredients":["exact ingredient name from the list"],"user_alerts":["Contains X — you have Y"]}\n\nUse exact ingredient names as listed above. Return [] for both arrays if no conflicts.`
          )
          const result = JSON.parse(content) as { flagged_ingredients?: string[]; user_alerts?: string[] }
          flaggedLower = (result.flagged_ingredients ?? []).map(n => n.toLowerCase())
          userAlerts = result.user_alerts ?? []
        }

        function applyFlags(list: Ingredient[]): Ingredient[] {
          return list.map(ing => ({
            ...ing,
            flagged: flaggedLower.some(n => ing.name.toLowerCase() === n),
          }))
        }

        const updated_analysis: Analysis = { ...existing }
        if (updated_analysis.key_ingredients) {
          updated_analysis.key_ingredients = applyFlags(updated_analysis.key_ingredients)
        }
        if (updated_analysis.concern_ingredients) {
          updated_analysis.concern_ingredients = applyFlags(updated_analysis.concern_ingredients)
        }
        if (updated_analysis.ingredients) {
          updated_analysis.ingredients = applyFlags(updated_analysis.ingredients)
        }
        updated_analysis.user_alerts = userAlerts

        await supabase.from('scans').update({ analysis: updated_analysis }).eq('id', scan.id)
        updated++
      } catch {
        // Skip individual scan failures
      }
    }))
  }

  return NextResponse.json({ updated })
}
