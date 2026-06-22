import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

function stripMd(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contentType = request.headers.get('content-type') ?? ''

  // JSON path: direct barcode lookup (from live camera scan)
  if (contentType.includes('application/json')) {
    const body = await request.json()
    const barcode = String(body.barcode ?? '').trim()
    if (!barcode) return NextResponse.json({ error: 'No barcode provided' }, { status: 400 })
    return lookupBarcode(barcode)
  }

  // Multipart path: image file from upload/camera
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const mode = String(formData.get('mode') ?? 'ocr')

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  if (mode === 'barcode') {
    let parsed: { barcode: string | null }
    try {
      const result = await model.generateContent([
        { inlineData: { mimeType: file.type, data: base64 } },
        'Find any barcode, UPC code, EAN code, or QR code in this image. Return ONLY valid JSON:\n{"barcode": "the full barcode number as a string, or null if none found"}',
      ])
      parsed = JSON.parse(stripMd(result.response.text()))
    } catch {
      return NextResponse.json({ error: 'Failed to read the image. Please try again.' }, { status: 502 })
    }

    if (!parsed.barcode) {
      return NextResponse.json(
        { error: 'No barcode found in that image. Try a clearer photo or enter ingredients manually.' },
        { status: 422 }
      )
    }

    return lookupBarcode(parsed.barcode)
  }

  // OCR mode — extract ingredients text
  let ingredientsText: string | null = null
  const mimeType = file.type || 'image/jpeg'

  // Attempt 1: structured JSON response
  try {
    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64 } },
      'Find the ingredients list in this product image. Extract it exactly as printed. Return ONLY valid JSON:\n{"ingredients": "the complete ingredient list text, or null if you cannot find any ingredients"}',
    ])
    const raw = result.response.text()
    const obj = JSON.parse(stripMd(raw)) as { ingredients: string | null }
    ingredientsText = obj.ingredients || null
  } catch {}

  // Attempt 2: plain text fallback — no JSON constraint, just copy the text
  if (!ingredientsText) {
    try {
      const plainModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await plainModel.generateContent([
        { inlineData: { mimeType, data: base64 } },
        'Look at this product image. Find and copy the ingredients list exactly as it appears on the label. Output only the ingredients text, nothing else.',
      ])
      const raw = result.response.text().trim()
      // Reject generic refusals or very short responses
      if (
        raw.length > 20 &&
        !raw.toLowerCase().startsWith('i cannot') &&
        !raw.toLowerCase().startsWith('i am unable') &&
        !raw.toLowerCase().startsWith('sorry')
      ) {
        ingredientsText = raw
      }
    } catch {}
  }

  if (!ingredientsText) {
    return NextResponse.json(
      { error: 'No ingredient list found. Make sure the ingredients label is clearly visible and well-lit.' },
      { status: 422 }
    )
  }

  return NextResponse.json({ ingredients: ingredientsText })
}

async function lookupBarcode(barcode: string) {
  // 1. Open Food Facts — best coverage for food and cosmetics
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`,
      { headers: { 'User-Agent': 'Surfelt/1.0 (product safety scanner; contact@surfelt.com)' } }
    )
    const data = await res.json()
    if (data.status === 1) {
      const p = data.product
      const productName: string | undefined = p.product_name_en || p.product_name || undefined
      const ingredients: string | undefined = p.ingredients_text_en || p.ingredients_text || undefined
      const productImageUrl: string | undefined =
        p.selected_images?.front?.display?.en ||
        p.image_front_url ||
        p.image_url ||
        undefined
      if (productName || ingredients) {
        return NextResponse.json({ barcode, product_name: productName, ingredients, product_image_url: productImageUrl })
      }
    }
  } catch {}

  // 2. UPC Item DB — covers medicines, cleaning products, and general retail
  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`,
      { headers: { 'User-Agent': 'Surfelt/1.0 (product safety scanner; contact@surfelt.com)' } }
    )
    const data = await res.json()
    const item = data?.items?.[0]
    if (item) {
      const productName: string | undefined = item.title || item.brand || undefined
      const ingredients: string | undefined = item.ingredients || undefined
      const productImageUrl: string | undefined = item.images?.[0] || undefined
      return NextResponse.json({ barcode, product_name: productName, ingredients, product_image_url: productImageUrl })
    }
  } catch {}

  return NextResponse.json(
    { error: 'Product not found. Try the Photo tab to scan the ingredient label directly.', barcode },
    { status: 404 }
  )
}
