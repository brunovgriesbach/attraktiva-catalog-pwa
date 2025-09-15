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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getCaseInsensitiveParam(
  params: URLSearchParams | undefined,
  name: string,
): string | null {
  if (!params) {
    return null
  }

  const lowerCaseName = name.toLowerCase()

  for (const [key, value] of params.entries()) {
    if (key.toLowerCase() === lowerCaseName && value.length > 0) {
      return value
    }
  }

  return null
}

function extractParamValues(parsedUrl: URL, originalUrl: string, names: string[]): string | null {
  const hash = parsedUrl.hash.replace(/^#/, '')
  const hashParams = hash.length > 0 ? new URLSearchParams(hash.replace(/^!/, '')) : undefined

  for (const params of [parsedUrl.searchParams, hashParams]) {
    for (const name of names) {
      const value = getCaseInsensitiveParam(params, name)
      if (value) {
        return value
      }
    }
  }

  for (const name of names) {
    const regex = new RegExp(`[?&#]${escapeRegExp(name)}=([^&#]*)`, 'i')
    const match = regex.exec(originalUrl)
    if (match && match[1]) {
      const encodedValue = match[1].replace(/\+/g, ' ')
      try {
        return decodeURIComponent(encodedValue)
      } catch {
        return encodedValue
      }
    }
  }

  return null
}

export async function resolveOneDriveUrl(url: string): Promise<string> {
  if (typeof url !== 'string') {
    return url
  }

  const normalizedUrl = url.trim()
  if (normalizedUrl.length === 0) {
    return normalizedUrl
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(normalizedUrl)
  } catch {
    return normalizedUrl
  }

  const hostname = parsedUrl.hostname.toLowerCase()
  const isOneDriveLiveHost =
    hostname === 'onedrive.live.com' || hostname.endsWith('.onedrive.live.com')
  const isShortOneDriveHost = hostname === '1drv.ms' || hostname.endsWith('.1drv.ms')

  if (!isOneDriveLiveHost && !isShortOneDriveHost) {
    return normalizedUrl
  }

  if (isShortOneDriveHost) {
    try {
      const response = await fetch(normalizedUrl, { redirect: 'manual' })
      const locationHeader = response.headers?.get('location')

      if (locationHeader) {
        const trimmedLocation = locationHeader.trim()

        if (trimmedLocation.length > 0) {
          try {
            const redirectUrl = new URL(trimmedLocation, parsedUrl)
            const redirectHostname = redirectUrl.hostname.toLowerCase()
            const pointsToOneDrive =
              redirectHostname === 'onedrive.live.com' ||
              redirectHostname.endsWith('.onedrive.live.com')

            if (pointsToOneDrive) {
              const resolvedRedirect = await resolveOneDriveUrl(redirectUrl.toString())
              if (resolvedRedirect.toLowerCase().includes('onedrive.live.com/download')) {
                return resolvedRedirect
              }
            }
          } catch {
            // Ignore URL parsing errors and fall back to the original URL
          }
        }
      }
    } catch {
      // Ignore network errors and fall back to the original URL
    }

    return normalizedUrl
  }

  const cid = extractParamValues(parsedUrl, normalizedUrl, ['cid'])
  const resid = extractParamValues(parsedUrl, normalizedUrl, ['resid', 'resId', 'id'])
  const authkey = extractParamValues(parsedUrl, normalizedUrl, ['authkey', 'authKey'])

  if (!resid) {
    return normalizedUrl
  }

  const params = new URLSearchParams()
  if (cid) {
    params.set('cid', cid)
  }

  params.set('resid', resid)

  if (authkey) {
    params.set('authkey', authkey)
  }

  return `https://onedrive.live.com/download?${params.toString()}`
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
    const image = await resolveOneDriveUrl(normalizeText(row.image))
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
