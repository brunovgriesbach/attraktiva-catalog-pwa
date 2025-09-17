import Papa from 'papaparse'
import type { Product } from '../data/products'

type RawProduct = {
  id?: string | number | null
  name?: string | null
  description?: string | null
  price?: string | number | null
  image?: string | null
  category?: string | null
  subcategory?: string | null
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

function normalizeImageUrl(value: string): string {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return trimmed
  }

  if (!isAbsoluteUrl(trimmed)) {
    return trimmed
  }

  try {
    const url = new URL(trimmed)

    if (url.hostname !== 'drive.google.com') {
      return trimmed
    }

    const pathMatch = url.pathname.match(/\/file\/d\/([^/]+)/)
    const id = pathMatch?.[1] ?? url.searchParams.get('id') ?? ''

    if (id.length === 0) {
      return trimmed
    }

    return `https://drive.google.com/uc?export=view&id=${id}`
  } catch (error) {
    console.warn('[normalizeImageUrl] Failed to parse image URL', error)
    return trimmed
  }
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

function resolveProductsUrl(baseUrl?: string): string {
  const rawBase = baseUrl ?? import.meta.env.BASE_URL ?? '/'
  const trimmedBase = rawBase.trim()
  const basePath = trimmedBase.length === 0 ? '/' : trimmedBase

  if (isAbsoluteUrl(basePath)) {
    const normalizedBaseUrl = ensureTrailingSlash(basePath)
    return new URL('products.csv', normalizedBaseUrl).toString()
  }

  const normalizedBasePath = ensureLeadingSlash(ensureTrailingSlash(basePath))

  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return `${normalizedBasePath}products.csv`
  }

  const root = new URL(normalizedBasePath, window.location.origin)
  return new URL('products.csv', root).toString()
}

export async function fetchProducts(baseUrl?: string): Promise<Product[]> {
  const requestUrl = resolveProductsUrl(baseUrl)
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
    const image = normalizeImageUrl(normalizeText(row.image))
    const category = normalizeText(row.category)
    const subcategory = normalizeText(row.subcategory)

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
      category,
      subcategory,
    })
  }

  return products
}
