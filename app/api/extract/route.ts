import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { callAI } from '@/lib/ai-providers'

export const maxDuration = 60

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
      p.ingredients_text_with_allergens_en || p.ingredients_text_with_allergens ||
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
      page_size: '12',
    })
    const res = await fetch(`https://world.${subdomain}.org/cgi/search.pl?${params}`, { headers: HEADERS })
    const data = await res.json()
    const products = (data?.products ?? []) as Record<string, unknown>[]
    for (const p of products) {
      const productName = ((p.product_name_en || p.product_name) as string) || ''
      const ingredients = ((
        p.ingredients_text_en || p.ingredients_text ||
        p.ingredients_text_with_allergens_en || p.ingredients_text_with_allergens ||
        p.composition_en || p.composition
      ) as string) || ''
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

// Web scraping fallback: DuckDuckGo search → Jina Reader → AI extraction
async function webScrapeForIngredients(
  productName: string
): Promise<{ product_name: string; ingredients: string } | null> {
  try {
    // Step 1: Search DuckDuckGo HTML for the product + "ingredients"
    const query = encodeURIComponent(`${productName} ingredients`)
    const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(6000),
    })
    if (!ddgRes.ok) return null
    const html = await ddgRes.text()

    // Step 2: Extract top result URLs from DuckDuckGo HTML (encoded in uddg= param)
    const urlMatches = [...html.matchAll(/uddg=([^"&\s]+)/g)]
    const candidateUrls: string[] = []
    for (const m of urlMatches) {
      try {
        const decoded = decodeURIComponent(m[1])
        // Skip wikis, DDG itself, and social media — prefer product/pharmacy/brand sites
        if (
          decoded.startsWith('http') &&
          !decoded.includes('duckduckgo.com') &&
          !decoded.includes('wikipedia.org') &&
          !decoded.includes('twitter.com') &&
          !decoded.includes('facebook.com') &&
          !decoded.includes('reddit.com') &&
          candidateUrls.length < 4
        ) {
          candidateUrls.push(decoded)
        }
      } catch {}
    }
    if (!candidateUrls.length) {
      console.warn('[extract] web scrape: no URLs found in DDG results')
      return null
    }

    // Step 3: Try each URL through Jina Reader until we get usable content
    let pageContent = ''
    let pageUrl = ''
    for (const url of candidateUrls) {
      try {
        const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
          headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
          signal: AbortSignal.timeout(8000),
        })
        if (!jinaRes.ok) continue
        const text = await jinaRes.text()
        // Need at least 400 chars of real content
        if (text && text.length > 400) {
          pageContent = text
          pageUrl = url
          break
        }
      } catch {}
    }
    if (!pageContent) {
      console.warn('[extract] web scrape: Jina Reader returned no usable content')
      return null
    }

    console.log(`[extract] web scrape: fetched ${pageContent.length} chars from ${pageUrl}`)

    // Step 4: Use AI to extract ingredient list from the page text
    const extractPrompt = `From the following product page content, find and extract the complete ingredient list for "${productName}".
Return ONLY valid JSON with this exact schema:
{"product_name": "exact product name as shown on the page, or null", "ingredients": "full ingredient list as plain text, or null"}
Rules:
- Only return ingredients if you can clearly identify an actual ingredient list (not product descriptions or marketing text)
- Do NOT invent, guess, or hallucinate ingredients — if unsure, return null for ingredients
- Include both active and inactive ingredients if both are present
- Return the ingredients as a single plain text string (comma-separated or as-is from the page)

Page content:
${pageContent.slice(0, 5000)}`

    const aiContent = await callAI(extractPrompt, 1024)
    const parsed = JSON.parse(aiContent) as { product_name?: string | null; ingredients?: string | null }

    if (!parsed.ingredients || parsed.ingredients.trim().length < 5) return null
    return {
      product_name: parsed.product_name ?? productName,
      ingredients: parsed.ingredients,
    }
  } catch (err) {
    console.warn('[extract] web scrape failed:', err)
    return null
  }
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
      if (productImageUrl && !foundImageUrl) foundImageUrl = productImageUrl
    }
  } catch {}

  // 6. OpenFDA by name (if any source above returned a product name)
  if (foundName) {
    const fdaByName = await lookupOpenFDAByName(foundName)
    if (fdaByName) {
      return NextResponse.json({ barcode, ...fdaByName, ...(foundImageUrl ? { product_image_url: foundImageUrl } : {}) })
    }
  }

  // 7. Name search across all Open*Facts networks + web scraping fallback
  if (foundName) {
    const nameSearch = await fetchProductByName(foundName)
    if (nameSearch) {
      return NextResponse.json({
        barcode,
        product_name: nameSearch.product_name,
        ingredients: nameSearch.ingredients,
        ...(nameSearch.product_image_url ? { product_image_url: nameSearch.product_image_url } : {}),
        ...(foundImageUrl && !nameSearch.product_image_url ? { product_image_url: foundImageUrl } : {}),
      })
    }
  }

  return NextResponse.json(
    { error: 'Product not found. Try the Photo tab to photograph the ingredient label directly.', barcode },
    { status: 404 }
  )
}

async function fetchProductByName(
  query: string
): Promise<{ product_name: string; ingredients: string; product_image_url?: string } | null> {
  const [foodResult, beautyResult, productsResult] = await Promise.all([
    searchOpenFoodNetwork('openfoodfacts', query),
    searchOpenFoodNetwork('openbeautyfacts', query),
    searchOpenFoodNetwork('openproductsfacts', query),
  ])

  for (const result of [foodResult, beautyResult, productsResult]) {
    if (result) return result
  }

  const fdaResult = await lookupOpenFDAByName(query)
  if (fdaResult) return { ...fdaResult }

  // Web scraping fallback — search the web and extract ingredients via AI
  const webResult = await webScrapeForIngredients(query)
  if (webResult) return webResult

  return null
}

async function searchProductByName(query: string) {
  const result = await fetchProductByName(query)
  if (result) return NextResponse.json(result)

  return NextResponse.json(
    { error: `Couldn't find "${query}" in our database. Try scanning the barcode or photographing the ingredient label directly.`, product_name: query },
    { status: 404 }
  )
}
