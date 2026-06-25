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

// Web scraping fallback: DuckDuckGo (general + Amazon-specific) → Jina Reader → AI extraction
async function webScrapeForIngredients(
  productName: string,
  alternateNames: string[] = []
): Promise<{ product_name: string; ingredients: string } | null> {
  try {
    const DDG_HEADERS = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html',
    }
    const SKIP_DOMAINS = ['duckduckgo.com', 'wikipedia.org', 'twitter.com', 'facebook.com', 'reddit.com', 'youtube.com']

    const searchNames = [productName, ...alternateNames].slice(0, 2)
    const searches = [
      `${productName} ingredients`,
      `"${productName}" ingredients`,
      `${productName} active ingredient composition`,
      `${productName} product specifications`,
      `site:amazon.com ${productName} ingredients`,
      `site:amazon.com ${productName} specifications`,
      ...searchNames.slice(1).flatMap(name => [
        `${name} ingredients`,
        `${name} active ingredient composition`,
        `site:amazon.com ${name} ingredients`,
      ]),
    ]

    const searchResults = await Promise.allSettled(
      searches.map(search =>
        fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(search)}`, {
          headers: DDG_HEADERS,
          signal: AbortSignal.timeout(5000),
        })
      )
    )

    const directAmazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`

    const decodeHtml = (value: string): string =>
      value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, ' ')
        .replace(/&nbsp;/g, ' ')

    const htmlToSearchText = (html: string): string =>
      decodeHtml(
        html
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
      ).trim()

    const extractUrls = (html: string, limit: number): string[] => {
      const urls: string[] = []
      for (const m of html.matchAll(/uddg=([^"&\s]+)/g)) {
        try {
          const decoded = decodeURIComponent(m[1])
          if (decoded.startsWith('http') && !SKIP_DOMAINS.some(d => decoded.includes(d)) && urls.length < limit) {
            urls.push(decoded)
          }
        } catch {}
      }
      return urls
    }

    const seen = new Set<string>()
    const candidateUrls: string[] = []
    const searchResultText: string[] = []

    for (const result of searchResults) {
      const html = result.status === 'fulfilled' && result.value.ok ? await result.value.text() : ''
      const text = htmlToSearchText(html)
      if (text) searchResultText.push(text.slice(0, 2500))
      for (const url of extractUrls(html, 4)) {
        if (!seen.has(url) && candidateUrls.length < 8) {
          seen.add(url)
          candidateUrls.push(url)
        }
      }
    }

    if (!candidateUrls.some(u => u.includes('amazon.com'))) {
      candidateUrls.push(directAmazonUrl)
    }

    if (!candidateUrls.length) return null

    const sliceRelevantProductSections = (content: string, isAmazonPage: boolean): string => {
      const lowerContent = content.toLowerCase()
      const sectionNeedles = [
        'ingredients',
        'active ingredient',
        'inactive ingredient',
        'active ingredients',
        'inactive ingredients',
        'drug facts',
        'uses',
        'purpose',
        'important information',
        'about this item',
        'features & specs',
        'features and specs',
        'product specifications',
        'see all product specifications',
        'specifications',
        'material',
        'materials',
        'material feature',
        'item form',
        'scent',
        'composition',
        'formula',
        'product details',
        'technical details',
        'details',
      ]

      const starts = sectionNeedles
        .map(needle => lowerContent.indexOf(needle))
        .filter(idx => idx >= 0)
        .sort((a, b) => a - b)

      if (!starts.length) return content.slice(0, 9000)

      const snippets: string[] = []
      const seenRanges = new Set<string>()
      const maxSnippets = isAmazonPage ? 6 : 4

      for (const idx of starts) {
        const start = Math.max(0, idx - 500)
        const end = Math.min(content.length, idx + 3500)
        const rangeKey = `${Math.floor(start / 1000)}:${Math.floor(end / 1000)}`
        if (seenRanges.has(rangeKey)) continue
        seenRanges.add(rangeKey)
        snippets.push(content.slice(start, end))
        if (snippets.length >= maxSnippets) break
      }

      const combined = snippets.join('\n\n--- section break ---\n\n')
      return combined.length > 12000 ? combined.slice(0, 12000) : combined
    }

    type ScrapedPage = { url: string; text: string; hasRelevantText: boolean }
    const scrapedPages: ScrapedPage[] = []

    for (const url of candidateUrls) {
      try {
        const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
          headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' },
          signal: AbortSignal.timeout(8000),
        })
        if (!jinaRes.ok) continue
        const text = await jinaRes.text()
        if (!text || text.length < 400) continue
        scrapedPages.push({
          url,
          text,
          hasRelevantText:
            /ingredient|drug facts|important information|about this item|features (&|and) specs|product specifications|material|item form|composition|formula|technical details/i.test(text),
        })
      } catch {}
    }

    if (!scrapedPages.length) {
      if (!searchResultText.length) {
        console.warn('[extract] web scrape: Jina Reader returned no usable content')
        return null
      }
      scrapedPages.push({
        url: 'duckduckgo-search-results',
        text: searchResultText.join('\n\n--- search result break ---\n\n'),
        hasRelevantText: true,
      })
    }

    if (searchResultText.length && !scrapedPages.some(page => page.url === 'duckduckgo-search-results')) {
      scrapedPages.push({
        url: 'duckduckgo-search-results',
        text: searchResultText.join('\n\n--- search result break ---\n\n'),
        hasRelevantText: true,
      })
    }

    scrapedPages.sort((a, b) => {
      if (a.hasRelevantText !== b.hasRelevantText) return a.hasRelevantText ? -1 : 1
      const aIsAmazon = a.url.includes('amazon.com')
      const bIsAmazon = b.url.includes('amazon.com')
      if (aIsAmazon !== bIsAmazon) return aIsAmazon ? 1 : -1
      return 0
    })

    const pagesToTry = scrapedPages.slice(0, 5)
    const firstAmazonPage = scrapedPages.find(page => page.url.includes('amazon.com'))
    if (firstAmazonPage && !pagesToTry.some(page => page.url === firstAmazonPage.url)) {
      pagesToTry.push(firstAmazonPage)
    }
    const searchResultsPage = scrapedPages.find(page => page.url === 'duckduckgo-search-results')
    if (searchResultsPage && !pagesToTry.some(page => page.url === searchResultsPage.url)) {
      pagesToTry.push(searchResultsPage)
    }

    const evidenceSections = pagesToTry
      .map((page, index) => {
        const isAmazonPage = page.url.includes('amazon.com')
        const isSearchResultsPage = page.url === 'duckduckgo-search-results'
        const content = sliceRelevantProductSections(page.text, isAmazonPage).trim()
        if (content.length < 80) return null
        const sourceKind = isSearchResultsPage ? 'search results snippets' : isAmazonPage ? 'amazon product page' : 'product page'
        return `SOURCE ${index + 1} (${sourceKind})
URL: ${page.url}
${content}`
      })
      .filter((section): section is string => Boolean(section))

    const evidencePack = evidenceSections.join('\n\n====================\n\n').slice(0, 18000)
    if (!evidencePack) return null

    console.log(`[extract] web scrape: prepared ${evidenceSections.length} evidence sections for ${productName}`)

    const extractPrompt = `From the following product lookup evidence, extract the product's ingredients, active ingredients, composition, formula, or material/substance fields for "${productName}".
Return ONLY valid JSON with this exact schema:
{"product_name": "exact product name as shown on the page, or null", "ingredients": "full ingredient list as plain text, or null"}
Rules:
- Return ingredients when you can clearly identify an ingredient list, active/inactive ingredients, chemical composition, formula, material, or substance/concentration field
- Prefer direct product pages over search result snippets
- Use search result snippets only when they directly name the target product and directly state ingredients, active ingredients, formula, material, or composition
- On Amazon pages, inspect About this item, Features & Specs, See all product Specifications, Product specifications, Product details, Technical details, Drug Facts, and Important information; relevant ingredients/composition often appear there instead of in the title area
- For OTC/first-aid/cleaning/household products, a specification like "Active ingredient: Isopropyl alcohol 70%" or "Material: sodium hypochlorite" is valid ingredient/composition evidence
- Do not treat product benefits, claims, directions, warnings, size, scent, or packaging details as ingredients unless they directly name a substance or active ingredient
- Do not use ingredients for a different product, variant, scent, size, or sponsored/related listing
- Do NOT invent, guess, or hallucinate ingredients; if unsure, return null for ingredients
- Include both active and inactive ingredients if both are present
- Return the ingredients as a single plain text string (comma-separated or as-is from the page)

Evidence:
${evidencePack}`

    try {
      const aiContent = await callAI(extractPrompt, 1200)
      const parsed = JSON.parse(aiContent) as { product_name?: string | null; ingredients?: string | null }

      if (parsed.ingredients && parsed.ingredients.trim().length >= 5) {
        return {
          product_name: parsed.product_name ?? productName,
          ingredients: parsed.ingredients,
        }
      }
    } catch (err) {
      console.warn('[extract] web scrape: AI extraction failed for evidence pack', err)
    }

    return null
  } catch (err) {
    console.warn('[extract] web scrape failed:', err)
    return null
  }
}

type BarcodeMatch = { product_name?: string; ingredients: string; product_image_url?: string; source: string }

function normalizeProductName(name: string | undefined): string {
  return (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u2018\u2019`]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function addSearchVariant(variants: string[], seen: Set<string>, value: string) {
  const normalized = normalizeSearchText(value)
  const key = normalized.toLowerCase()
  if (normalized && !seen.has(key)) {
    seen.add(key)
    variants.push(normalized)
  }
}

function buildProductSearchQueries(query: string): string[] {
  const base = normalizeSearchText(query)
  const variants: string[] = []
  const seen = new Set<string>()

  addSearchVariant(variants, seen, base)
  addSearchVariant(variants, seen, base.replace(/\([^)]*\)/g, ' '))
  addSearchVariant(variants, seen, base.replace(/[^\p{L}\p{N}'&+\-\s]/gu, ' '))
  addSearchVariant(
    variants,
    seen,
    base.replace(/\b\d+(?:\.\d+)?\s*(?:fl\.?\s*oz|fluid ounces?|oz|ounces?|ml|milliliters?|g|grams?|ct|count|pack|pcs|ea)\b/gi, ' ')
  )
  addSearchVariant(variants, seen, base.replace(/\b(?:new|sealed|authentic|original|travel size|mini|value size)\b/gi, ' '))

  return variants
}

function extractObviousActiveIngredientFromName(
  query: string
): { product_name: string; ingredients: string } | null {
  const normalized = normalizeSearchText(query)
  const lower = normalized.toLowerCase()

  const isopropylMatch =
    lower.match(/\b(\d{2,3}(?:\.\d+)?)\s*%\s*isopropyl alcohol\b/) ??
    lower.match(/\bisopropyl alcohol\s*(\d{2,3}(?:\.\d+)?)\s*%/) ??
    lower.match(/\b(\d{2,3}(?:\.\d+)?)\s+isopropyl alcohol\b/) ??
    lower.match(/\bisopropyl alcohol\s+(\d{2,3}(?:\.\d+)?)\b/)
  if (isopropylMatch && (lower.includes('antiseptic') || lower.includes('first aid') || lower.includes('alcohol'))) {
    return {
      product_name: normalized,
      ingredients: `Active ingredient: Isopropyl alcohol ${isopropylMatch[1]}%`,
    }
  }

  const hydrogenPeroxideMatch =
    lower.match(/\b(\d{1,2}(?:\.\d+)?)\s*%\s*hydrogen peroxide\b/) ??
    lower.match(/\bhydrogen peroxide\s*(\d{1,2}(?:\.\d+)?)\s*%/)
  if (hydrogenPeroxideMatch && lower.includes('antiseptic')) {
    return {
      product_name: normalized,
      ingredients: `Active ingredient: Hydrogen peroxide ${hydrogenPeroxideMatch[1]}%`,
    }
  }

  return null
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
    const match = uniqueMatches[0]
    return NextResponse.json({
      barcode,
      product_name: match.product_name,
      ingredients: match.ingredients,
      product_image_url: match.product_image_url,
    })
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
  const queries = buildProductSearchQueries(query)

  for (const searchQuery of queries) {
    const obviousActiveIngredient = extractObviousActiveIngredientFromName(searchQuery)
    if (obviousActiveIngredient) return obviousActiveIngredient
  }

  for (const searchQuery of queries) {
    const [foodResult, beautyResult, productsResult] = await Promise.all([
      searchOpenFoodNetwork('openfoodfacts', searchQuery),
      searchOpenFoodNetwork('openbeautyfacts', searchQuery),
      searchOpenFoodNetwork('openproductsfacts', searchQuery),
    ])

    for (const result of [foodResult, beautyResult, productsResult]) {
      if (result) return result
    }
  }

  for (const searchQuery of queries) {
    const fdaResult = await lookupOpenFDAByName(searchQuery)
    if (fdaResult) return { ...fdaResult }
  }


  // Web scraping fallback — search the web and extract ingredients via AI
  const webResult = await webScrapeForIngredients(queries[0], queries.slice(1))
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
