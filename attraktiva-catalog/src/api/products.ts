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

const GOOGLE_DRIVE_DIRECT_DOWNLOAD_BASE_URL =
  'https://drive.google.com/uc?export=view&id='
const ONEDRIVE_DIRECT_DOWNLOAD_BASE_URL =
  'https://api.onedrive.com/v1.0/shares/'
const ONEDRIVE_DIRECT_DOWNLOAD_SUFFIX = '/root/content'

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
    const normalizedUrl = normalizeImageUrl(url)
    if (normalizedUrl.length > 0) {
      imageUrls.push(normalizedUrl)
    }
  }

  return imageUrls
}

function normalizeImageUrl(value: string): string {
  if (value.length === 0) {
    return value
  }

  const googleDriveId = extractGoogleDriveFileId(value)
  if (googleDriveId) {
    return `${GOOGLE_DRIVE_DIRECT_DOWNLOAD_BASE_URL}${encodeURIComponent(googleDriveId)}`
  }

  const oneDriveShareUrl = extractOneDriveShareUrl(value)
  if (oneDriveShareUrl) {
    return convertOneDriveShareUrl(oneDriveShareUrl)
  }

  return value
}

function extractGoogleDriveFileId(value: string): string | null {
  const trimmedValue = value.trim()
  if (trimmedValue.length === 0) {
    return null
  }

  const attributeMatch = trimmedValue.match(/\b(?:src|href)\s*=\s*"([^"]+)"/i)
  if (attributeMatch?.[1]) {
    const nestedId = extractGoogleDriveFileId(attributeMatch[1])
    if (nestedId) {
      return nestedId
    }
  }

  const singleQuoteAttributeMatch = trimmedValue.match(/\b(?:src|href)\s*=\s*'([^']+)'/i)
  if (singleQuoteAttributeMatch?.[1]) {
    const nestedId = extractGoogleDriveFileId(singleQuoteAttributeMatch[1])
    if (nestedId) {
      return nestedId
    }
  }

  if (!/google\.com/i.test(trimmedValue)) {
    return null
  }

  const directIdMatch = trimmedValue.match(/\b([\w-]{10,})\b/)
  if (directIdMatch && !/https?:/i.test(trimmedValue)) {
    return directIdMatch[1]
  }

  const idParamMatch = trimmedValue.match(/[?&]id=([\w-]+)/i)
  if (idParamMatch?.[1]) {
    return idParamMatch[1]
  }

  const fileSegmentMatch = trimmedValue.match(/\/d\/([\w-]+)/i)
  if (fileSegmentMatch?.[1]) {
    return fileSegmentMatch[1]
  }

  return null
}

function extractOneDriveShareUrl(value: string): string | null {
  const trimmedValue = value.trim()
  if (trimmedValue.length === 0) {
    return null
  }

  const attributeMatch = trimmedValue.match(/\b(?:src|href)\s*=\s*"([^"]+)"/i)
  if (attributeMatch?.[1]) {
    const nestedShareUrl = extractOneDriveShareUrl(attributeMatch[1])
    if (nestedShareUrl) {
      return nestedShareUrl
    }
  }

  const singleQuoteAttributeMatch = trimmedValue.match(/\b(?:src|href)\s*=\s*'([^']+)'/i)
  if (singleQuoteAttributeMatch?.[1]) {
    const nestedShareUrl = extractOneDriveShareUrl(singleQuoteAttributeMatch[1])
    if (nestedShareUrl) {
      return nestedShareUrl
    }
  }

  if (!isAbsoluteUrl(trimmedValue)) {
    return null
  }

  try {
    const url = new URL(trimmedValue)
    const hostname = url.hostname.toLowerCase()

    if (hostname === 'api.onedrive.com') {
      return url.toString()
    }

    if (
      hostname === '1drv.ms' ||
      hostname === 'onedrive.live.com' ||
      hostname.endsWith('.onedrive.live.com') ||
      hostname.endsWith('.sharepoint.com')
    ) {
      return url.toString()
    }
  } catch {
    return null
  }

  return null
}

function convertOneDriveShareUrl(value: string): string {
  const trimmedValue = value.trim()
  if (trimmedValue.length === 0) {
    return trimmedValue
  }

  if (!isAbsoluteUrl(trimmedValue)) {
    return trimmedValue
  }

  let url: URL
  try {
    url = new URL(trimmedValue)
  } catch {
    return trimmedValue
  }

  const hostname = url.hostname.toLowerCase()

  if (hostname === 'api.onedrive.com') {
    return url.toString()
  }

  if (
    hostname !== '1drv.ms' &&
    hostname !== 'onedrive.live.com' &&
    !hostname.endsWith('.onedrive.live.com') &&
    !hostname.endsWith('.sharepoint.com')
  ) {
    return trimmedValue
  }

  const normalizedShareUrl = url.toString()
  const encodedShareUrl = base64UrlEncode(normalizedShareUrl)
  return `${ONEDRIVE_DIRECT_DOWNLOAD_BASE_URL}u!${encodedShareUrl}${ONEDRIVE_DIRECT_DOWNLOAD_SUFFIX}`
}

type BufferFactory = {
  from(input: string, encoding: string): { toString(encoding: string): string }
}

function base64UrlEncode(value: string): string {
  if (typeof globalThis.btoa === 'function') {
    return globalThis
      .btoa(value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
  }

  const bufferCtor = (globalThis as typeof globalThis & { Buffer?: BufferFactory }).Buffer
  if (bufferCtor) {
    return bufferCtor
      .from(value, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
  }

  throw new Error('Base64 encoding is not supported in this environment')
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
