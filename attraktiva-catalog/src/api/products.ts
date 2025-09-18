import Papa from 'papaparse'
import type { Product } from '../data/products'

type RawProduct = {
  id?: string | number | null
  name?: string | null
  description?: string | null
  price?: string | number | null
  image?: string | null
  image2?: string | null
  image3?: string | null
  image4?: string | null
  image5?: string | null
  category?: string | null
  subcategory?: string | null
  Fabricante?: string | null
  'codigo-fabricante'?: string | null
  'referencia-produto'?: string | null
}

function normalizeText(value: string | number | null | undefined): string {
  if (typeof value === 'number') {
    return String(value)
  }
  return (value ?? '').trim()
}

function toNumber(value: string | number | null | undefined): number {
  const normalized =
    typeof value === 'number' ? value : Number((value ?? '').toString().trim())
  return Number.isFinite(normalized) ? normalized : NaN
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`
}

function ensureLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`
}

function isAbsoluteUrl(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value)
}

function normalizeGoogleSheetsUrl(url: string): string {
  if (!isAbsoluteUrl(url)) {
    return url
  }

  try {
    const parsedUrl = new URL(url)

    const spreadsheetMatch = parsedUrl.pathname.match(
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    )

    if (!spreadsheetMatch) {
      return url
    }

    // Already pointing to an export endpoint – nothing to normalize
    if (/\/export$/.test(parsedUrl.pathname)) {
      return url
    }

    const spreadsheetId = spreadsheetMatch[1]
    const gidFromSearch = parsedUrl.searchParams.get('gid')
    const gidFromHashMatch = parsedUrl.hash.match(/gid=(\d+)/)
    const gid = gidFromSearch ?? gidFromHashMatch?.[1] ?? undefined

    const normalizedUrl = new URL(`/spreadsheets/d/${spreadsheetId}/export`, parsedUrl.origin)
    normalizedUrl.searchParams.set('format', 'csv')
    if (gid) {
      normalizedUrl.searchParams.set('gid', gid)
    }

    return normalizedUrl.toString()
  } catch (error) {
    console.warn('[fetchProducts] Failed to normalize Google Sheets URL:', error)
    return url
  }
}

function resolveProductsRequestUrl(baseUrl: string | undefined): string {
  const trimmedBaseUrl = baseUrl?.trim()
  if (trimmedBaseUrl) {
    if (isAbsoluteUrl(trimmedBaseUrl)) {
      return `${ensureTrailingSlash(trimmedBaseUrl)}products.csv`
    }

    const normalizedBasePath = ensureTrailingSlash(
      ensureLeadingSlash(trimmedBaseUrl.replace(/^(\.\/)+/, '')),
    )
    return `${normalizedBasePath}products.csv`
  }

  const envValue = (import.meta.env.VITE_GOOGLE_SHEETS_URL as string | undefined)?.trim() ?? ''
  if (envValue.length > 0) {
    const normalizedValue = normalizeGoogleSheetsUrl(envValue)
    if (isAbsoluteUrl(normalizedValue)) {
      return normalizedValue
    }

    return ensureLeadingSlash(normalizedValue)
  }

  return '/products.csv'
}

function extractImageUrls(row: RawProduct): string[] {
  const entries = Object.entries(row as Record<string, unknown>)
    .filter(([key]) => /^image\d*$/i.test(key))
    .sort(([keyA], [keyB]) => {
      const normalizedA = keyA.toLowerCase()
      const normalizedB = keyB.toLowerCase()

      if (normalizedA === 'image') {
        return normalizedB === 'image' ? 0 : -1
      }

      if (normalizedB === 'image') {
        return 1
      }

      const matchA = normalizedA.match(/^image(\d+)$/)
      const matchB = normalizedB.match(/^image(\d+)$/)

      const indexA = matchA ? Number.parseInt(matchA[1], 10) : Number.POSITIVE_INFINITY
      const indexB = matchB ? Number.parseInt(matchB[1], 10) : Number.POSITIVE_INFINITY

      return indexA - indexB
    })

  const imageUrls: string[] = []

  for (const [, value] of entries) {
    const url = normalizeText(value as string | number | null | undefined)
    if (url.length > 0) {
      imageUrls.push(url)
    }
  }

  return imageUrls
}

export async function fetchProducts(baseUrl?: string): Promise<Product[]> {
  const requestUrl = resolveProductsRequestUrl(baseUrl)
  const response = await fetch(requestUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch product catalog')
  }

  const csvText = await response.text()
  const { data, errors } = Papa.parse<RawProduct>(csvText, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    console.error('[fetchProducts] Failed to parse CSV:', errors)
    throw new Error('Failed to parse product catalog')
  }

  const products: Product[] = []

  for (const row of data) {
    const id = toNumber(row.id)
    const price = toNumber(row.price)
    const name = normalizeText(row.name)
    const description = normalizeText(row.description)
    const images = extractImageUrls(row)
    const image = images[0] ?? ''
    const category = normalizeText(row.category)
    const subcategory = normalizeText(row.subcategory)
    const manufacturer = normalizeText(row.Fabricante)
    const manufacturerCode = normalizeText(row['codigo-fabricante'])
    const productReference = normalizeText(row['referencia-produto'])

    if (
      Number.isNaN(id) ||
      Number.isNaN(price) ||
      name.length === 0 ||
      description.length === 0 ||
      image.length === 0 ||
      category.length === 0 ||
      subcategory.length === 0
    ) {
      continue
    }

    products.push({
      id,
      name,
      description,
      price,
      image,
      images,
      category,
      subcategory,
      manufacturer,
      manufacturerCode,
      productReference,
    })
  }

  return products
}
