import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'JSON body required' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const barcode = body.barcode ? String(body.barcode).trim() : null
  const productName = body.product_name ? String(body.product_name).trim() : null

  if (barcode) return lookupBarcode(barcode)
  if (productName) return searchProductByName(productName)

  return NextResponse.json({ error: 'Provide barcode or product_name' }, { status: 400 })
}

const HEADERS = { 'User-Agent': 'Surfelt/1.0 (product safety scanner; contact@surfelt.com)' }

async function lookupOpenFDA(query: string): Promise<{ product_name: string; ingredients: string } | null> {
  try {
    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22${encodeURIComponent(query)}%22&limit=1`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    const data = await res.json()
    const result = data?.results?.[0]
    if (!result) return null

    const productName: string = result.openfda?.brand_name?.[0] ?? query
    const activeRaw: string = (result.active_ingredient ?? []).join(' ').trim()
    const inactiveRaw: string = (result.inactive_ingredient ?? []).join(' ').trim()

    let ingredients = ''
    if (activeRaw && inactiveRaw) {
      ingredients = `Active ingredients: ${activeRaw} Inactive ingredients: ${inactiveRaw}`
    } else {
      ingredients = activeRaw || inactiveRaw
    }

    if (!ingredients) return null
    return { product_name: productName, ingredients }
  } catch {
    return null
  }
}

async function lookupBarcode(barcode: string) {
  let foundName: string | undefined

  // 1. Open Food Facts (food & drink)
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`,
      { headers: HEADERS }
    )
    const data = await res.json()
    if (data.status === 1) {
      const p = data.product
      const productName: string | undefined = p.product_name_en || p.product_name || undefined
      const ingredients: string | undefined = p.ingredients_text_en || p.ingredients_text || undefined
      const productImageUrl: string | undefined =
        p.selected_images?.front?.display?.en || p.image_front_url || p.image_url || undefined
      if (ingredients) {
        return NextResponse.json({ barcode, product_name: productName, ingredients, product_image_url: productImageUrl })
      }
      if (productName) foundName = productName
    }
  } catch {}

  // 2. UPC Item DB
  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`,
      { headers: HEADERS }
    )
    const data = await res.json()
    const item = data?.items?.[0]
    if (item) {
      const productName: string | undefined = item.title || item.brand || undefined
      const ingredients: string | undefined = item.ingredients || undefined
      const productImageUrl: string | undefined = item.images?.[0] || undefined
      if (ingredients) {
        return NextResponse.json({ barcode, product_name: productName, ingredients, product_image_url: productImageUrl })
      }
      if (productName && !foundName) foundName = productName
    }
  } catch {}

  // 3. OpenFDA drug label database (medications, OTC drugs, supplements)
  if (foundName) {
    const drugResult = await lookupOpenFDA(foundName)
    if (drugResult) {
      return NextResponse.json({ barcode, ...drugResult })
    }
  }

  return NextResponse.json(
    { error: 'Product not found. Try the Photo tab — take a photo of the ingredient label.', barcode },
    { status: 404 }
  )
}

async function searchProductByName(query: string) {
  // 1. Open Food Facts
  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: '5',
    })
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?${params}`,
      { headers: HEADERS }
    )
    const data = await res.json()
    const products = (data?.products ?? []) as Record<string, unknown>[]

    for (const p of products) {
      const productName = ((p.product_name_en || p.product_name) as string) || ''
      const ingredients = ((p.ingredients_text_en || p.ingredients_text) as string) || ''
      const sel = p.selected_images as Record<string, unknown> | undefined
      const productImageUrl =
        ((sel?.front as Record<string, unknown>)?.display as Record<string, string>)?.en ??
        (p.image_front_url as string | undefined) ??
        (p.image_url as string | undefined)
      if (productName && ingredients) {
        return NextResponse.json({ product_name: productName, ingredients, product_image_url: productImageUrl })
      }
    }
  } catch {}

  // 2. OpenFDA drug label database (medications, OTC drugs, supplements)
  const drugResult = await lookupOpenFDA(query)
  if (drugResult) {
    return NextResponse.json(drugResult)
  }

  return NextResponse.json(
    { error: `Couldn't find "${query}" in our database. Try scanning the barcode instead.`, product_name: query },
    { status: 404 }
  )
}
