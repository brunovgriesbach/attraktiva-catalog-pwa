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

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`
}

function ensureLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`
}

function isAbsoluteUrl(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(value)
}

export function resolveOneDriveUrl(url: string): string {
  if (typeof url !== 'string' || url.trim().length === 0) {
    return url
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return url
  }

  const hostname = parsedUrl.hostname.toLowerCase()

  if (hostname === 'onedrive.live.com') {
    const cid = parsedUrl.searchParams.get('cid')
    const resid = parsedUrl.searchParams.get('resid') ?? parsedUrl.searchParams.get('id')
    const authkey = parsedUrl.searchParams.get('authkey')

    const params = new URLSearchParams()

    if (cid) {
      params.set('cid', cid)
    }
    if (resid) {
      params.set('resid', resid)
    }
    if (authkey) {
      params.set('authkey', authkey)
    }

    const query = params.toString()

    if (query.length === 0) {
      return url
    }

    return `https://onedrive.live.com/download?${query}`
  }

  if (hostname === '1drv.ms') {
    parsedUrl.searchParams.set('download', '1')
    return parsedUrl.toString()
  }

  return url
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
    const image = resolveOneDriveUrl(normalizeText(row.image))
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
