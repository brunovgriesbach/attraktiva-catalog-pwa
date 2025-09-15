import Papa from 'papaparse'
import type { Product } from '../data/products'

type RawProduct = {
  id?: string | number | null
  name?: string | null
  description?: string | null
  price?: string | number | null
  image?: string | null
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

function resolveProductsUrl(): string {
  const basePath = (import.meta.env.BASE_URL ?? '/').trim() || '/'
  const normalizedBasePath = basePath.endsWith('/')
    ? basePath
    : `${basePath}/`
  const baseWithLeadingSlash = normalizedBasePath.startsWith('/')
    ? normalizedBasePath
    : `/${normalizedBasePath}`

  if (typeof window === 'undefined' || typeof window.location === 'undefined') {
    return `${baseWithLeadingSlash}products.csv`
  }

  const root = new URL(baseWithLeadingSlash, window.location.origin)
  return new URL('products.csv', root).toString()
}

export async function fetchProducts(): Promise<Product[]> {
  const requestUrl = resolveProductsUrl()
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
    const image = normalizeText(row.image)

    if (
      Number.isNaN(id) ||
      Number.isNaN(price) ||
      name.length === 0 ||
      description.length === 0 ||
      image.length === 0
    ) {
      continue
    }

    products.push({
      id,
      name,
      description,
      price,
      image,
    })
  }

  return products
}
