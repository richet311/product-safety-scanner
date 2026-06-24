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

const HEADERS = { 'User-Agent': 'Surfelt/1.0 (product safety scanner; surfeltsupport@gmail.com)' }

type OpenFoodResult =
  | { product_name?: string; ingredients: string; product_image_url?: string }
  | { product_name?: string }

async function lookupOpenFoodNetwork(subdomain: string, barcode: string): Promise<OpenFoodResult | null> {
  try {
    const res = await fetch(
      `https://world.${subdomain}.org/api/v0/product/${encodeURIComponent(barcode)}.json`,
      { headers: HEADERS }
    )
    const data = await res.json()
    if (data.status !== 1) return null
    const p = data.product
    const productName: string | undefined = p.product_name_en || p.product_name || undefined
    const ingredients: string | undefined =
      p.ingredients_text_en || p.ingredients_text ||
      p.composition_en || p.composition || undefined
    const productImageUrl: string | undefined =
      p.selected_images?.front?.display?.en || p.image_front_url || p.image_url || undefined
    if (ingredients) return { product_name: productName, ingredients, product_image_url: productImageUrl }
    if (productName) return { product_name: productName }
    return null
  } catch {
    return null
  }
}

async function searchOpenFoodNetwork(
  subdomain: string,
  query: string
): Promise<{ product_name: string; ingredients: string; product_image_url?: string } | null> {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: '5',
    })
    const res = await fetch(`https://world.${subdomain}.org/cgi/search.pl?${params}`, { headers: HEADERS })
    const data = await res.json()
    const products = (data?.products ?? []) as Record<string, unknown>[]
    for (const p of products) {
      const productName = ((p.product_name_en || p.product_name) as string) || ''
      const ingredients = ((p.ingredients_text_en || p.ingredients_text || p.composition_en || p.composition) as string) || ''
      const sel = p.selected_images as Record<string, unknown> | undefined
      const productImageUrl =
        ((sel?.front as Record<string, unknown>)?.display as Record<string, string>)?.en ??
        (p.image_front_url as string | undefined) ??
        (p.image_url as string | undefined)
      if (productName && ingredients) {
        return { product_name: productName, ingredients, product_image_url: productImageUrl }
      }
    }
  } catch {}
  return null
}

async function lookupOpenFDAByUPC(barcode: string): Promise<{ product_name: string; ingredients: string } | null> {
  try {
    const url = `https://api.fda.gov/drug/label.json?search=openfda.upc:${encodeURIComponent(barcode)}&limit=1`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    const data = await res.json()
    const result = data?.results?.[0]
    if (!result) return null
    return extractOpenFDAIngredients(result)
  } catch {
    return null
  }
}

async function lookupOpenFDAByName(query: string): Promise<{ product_name: string; ingredients: string } | null> {
  try {
    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22${encodeURIComponent(query)}%22&limit=1`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    const data = await res.json()
    const result = data?.results?.[0]
    if (!result) return null
    return extractOpenFDAIngredients(result, query)
  } catch {
    return null
  }
}

function extractOpenFDAIngredients(
  result: Record<string, unknown>,
  fallbackName?: string
): { product_name: string; ingredients: string } | null {
  const openfda = result.openfda as Record<string, string[]> | undefined
  const productName: string = openfda?.brand_name?.[0] ?? fallbackName ?? 'Unknown'
  const activeRaw = ((result.active_ingredient as string[] | undefined) ?? []).join(' ').trim()
  const inactiveRaw = ((result.inactive_ingredient as string[] | undefined) ?? []).join(' ').trim()
  let ingredients = ''
  if (activeRaw && inactiveRaw) {
    ingredients = `Active ingredients: ${activeRaw} Inactive ingredients: ${inactiveRaw}`
  } else {
    ingredients = activeRaw || inactiveRaw
  }
  if (!ingredients) return null
  return { product_name: productName, ingredients }
}

type BarcodeMatch = { product_name?: string; ingredients: string; product_image_url?: string; source: string }

function normalizeProductName(name: string | undefined): string {
  return (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

async function lookupBarcode(barcode: string) {
  let foundName: string | undefined
  let foundImageUrl: string | undefined

  // 1-3. Open*Facts in parallel — food, beauty, household/cleaning
  const [food, beauty, products] = await Promise.all([
    lookupOpenFoodNetwork('openfoodfacts', barcode),
    lookupOpenFoodNetwork('openbeautyfacts', barcode),
    lookupOpenFoodNetwork('openproductsfacts', barcode),
  ])

  // Collect all results that have a full ingredient list
  const allMatches: BarcodeMatch[] = []
  for (const [result, source] of [
    [food, 'openfoodfacts'],
    [beauty, 'openbeautyfacts'],
    [products, 'openproductsfacts'],
  ] as const) {
    if (result && 'ingredients' in result) {
      allMatches.push({
        product_name: result.product_name,
        ingredients: result.ingredients,
        product_image_url: 'product_image_url' in result ? result.product_image_url : undefined,
        source,
      })
    }
  }

  // Deduplicate by normalized product name, keeping first occurrence
  const seenNames = new Set<string>()
  const uniqueMatches: BarcodeMatch[] = []
  for (const match of allMatches) {
    const norm = normalizeProductName(match.product_name)
    if (!seenNames.has(norm)) {
      seenNames.add(norm)
      uniqueMatches.push(match)
    }
  }

  // Multiple distinct products share this barcode — let the user choose
  if (uniqueMatches.length > 1) {
    return NextResponse.json({ barcode, matches: uniqueMatches })
  }

  // Single match — return directly
  if (uniqueMatches.length === 1) {
    const { source: _source, ...rest } = uniqueMatches[0]
    return NextResponse.json({ barcode, ...rest })
  }

  // Collect any name or image found from partial results (no ingredients)
  for (const result of [food, beauty, products]) {
    if (result?.product_name && !foundName) foundName = result.product_name
    if (result && 'product_image_url' in result && result.product_image_url && !foundImageUrl) {
      foundImageUrl = result.product_image_url as string
    }
  }

  // 4. OpenFDA direct UPC search (OTC medications & drugs)
  const fdaByUpc = await lookupOpenFDAByUPC(barcode)
  if (fdaByUpc) {
    return NextResponse.json({ barcode, ...fdaByUpc, ...(foundImageUrl ? { product_image_url: foundImageUrl } : {}) })
  }

  // 5. UPC Item DB (general fallback)
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

  // 6. OpenFDA by name (if any source above returned a product name)
  if (foundName) {
    const fdaByName = await lookupOpenFDAByName(foundName)
    if (fdaByName) {
      return NextResponse.json({ barcode, ...fdaByName, ...(foundImageUrl ? { product_image_url: foundImageUrl } : {}) })
    }
  }

  return NextResponse.json(
    { error: 'Product not found. Try the Photo tab to photograph the ingredient label directly.', barcode },
    { status: 404 }
  )
}

async function searchProductByName(query: string) {
  // Search all three Open*Facts networks in parallel
  const [foodResult, beautyResult, productsResult] = await Promise.all([
    searchOpenFoodNetwork('openfoodfacts', query),
    searchOpenFoodNetwork('openbeautyfacts', query),
    searchOpenFoodNetwork('openproductsfacts', query),
  ])

  for (const result of [foodResult, beautyResult, productsResult]) {
    if (result) return NextResponse.json(result)
  }

  // OpenFDA by name (medications, OTC drugs, supplements)
  const fdaResult = await lookupOpenFDAByName(query)
  if (fdaResult) {
    return NextResponse.json(fdaResult)
  }

  return NextResponse.json(
    { error: `Couldn't find "${query}" in our database. Try scanning the barcode instead.`, product_name: query },
    { status: 404 }
  )
}
