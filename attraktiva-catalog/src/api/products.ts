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

const ONEDRIVE_HOST_SUFFIX = '1drv.ms'
const ONEDRIVE_IMAGE_PREFIX = 'https://1drv.ms/i/c/3150482359d620a2/'
const ONEDRIVE_IMAGE_PREFIX_URL = new URL(ONEDRIVE_IMAGE_PREFIX)
const ONEDRIVE_IMAGE_PREFIX_ORIGIN = ONEDRIVE_IMAGE_PREFIX_URL.origin
const ONEDRIVE_IMAGE_PREFIX_PATH = ONEDRIVE_IMAGE_PREFIX_URL.pathname
const ONEDRIVE_IMAGE_PREFIX_PATH_LOWER = ONEDRIVE_IMAGE_PREFIX_PATH.toLowerCase()

function normalizeOneDriveImageUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)

    if (!parsedUrl.hostname.toLowerCase().endsWith(ONEDRIVE_HOST_SUFFIX)) {
      return url
    }

    const originalPath = parsedUrl.pathname
    const normalizedPath = originalPath.toLowerCase()

    if (!normalizedPath.startsWith('/i/')) {
      return url
    }

    if (normalizedPath.startsWith(ONEDRIVE_IMAGE_PREFIX_PATH_LOWER)) {
      const suffix = originalPath
        .slice(ONEDRIVE_IMAGE_PREFIX_PATH.length)
        .replace(/^\/+/, '')
      const normalizedSuffix = suffix.length > 0 ? suffix : ''
      const finalPath = `${ONEDRIVE_IMAGE_PREFIX_PATH}${normalizedSuffix}`
      const finalOrigin =
        parsedUrl.origin.toLowerCase() === ONEDRIVE_IMAGE_PREFIX_ORIGIN
          ? parsedUrl.origin
          : ONEDRIVE_IMAGE_PREFIX_ORIGIN
      const finalSearch = parsedUrl.search ?? ''
      return `${finalOrigin}${finalPath}${finalSearch}`
    }

    return parsedUrl.toString()
  } catch {
    return url
  }
}

function normalizeImageUrl(url: string): string {
  if (url.length === 0) {
    return url
  }

  if (/^https?:\/\//i.test(url) && url.includes(ONEDRIVE_HOST_SUFFIX)) {
    return normalizeOneDriveImageUrl(url)
  }

  return url
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
      imageUrls.push(normalizeImageUrl(url))
    }
  }

  return imageUrls
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
