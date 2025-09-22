import Papa from 'papaparse'
import type { Product } from '../data/products'
import { MAX_PRODUCT_IMAGES, PRODUCTS_SOURCE_URL } from '../config/catalog'

const FALLBACK_DESCRIPTION = 'Descrição não disponível'
const FALLBACK_CATEGORY = 'Outros'
const FALLBACK_SUBCATEGORY = 'Outros'
const FALLBACK_IMAGE_URL = '/images/product-placeholder.svg'

type RawProduct = {
  [key: string]: string | number | null | undefined
  id?: string | number | null
  ID?: string | number | null
  Id?: string | number | null
  d?: string | number | null
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
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : NaN
  }

  const textValue = (value ?? '').toString().trim()
  if (textValue.length === 0) {
    return NaN
  }

  const compactValue = textValue.replace(/\s+/g, '')
  const numericCharacters = compactValue.replace(/[^\d.,-]/g, '')

  if (numericCharacters.length === 0 || numericCharacters === '-') {
    return NaN
  }

  if (!/[0-9]/.test(numericCharacters)) {
    return NaN
  }

  const lastComma = numericCharacters.lastIndexOf(',')
  const lastDot = numericCharacters.lastIndexOf('.')

  let normalizedValue = numericCharacters

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      normalizedValue = numericCharacters
        .replace(/\./g, '')
        .replace(',', '.')
    } else {
      normalizedValue = numericCharacters.replace(/,/g, '')
    }
  } else if (lastComma !== -1) {
    normalizedValue = numericCharacters.replace(',', '.')
  } else {
    normalizedValue = numericCharacters.replace(/,/g, '')
  }

  const parsed = Number(normalizedValue)
  return Number.isFinite(parsed) ? parsed : NaN
}

function resolveProductsUrl(sourceUrl?: string): string {
  const candidate = typeof sourceUrl === 'string' ? sourceUrl.trim() : ''

  if (candidate.length > 0) {
    return candidate
  }

  return PRODUCTS_SOURCE_URL
}

function extractImageUrls(row: RawProduct): string[] {
  const entries = Object.entries(row)
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

  return imageUrls.slice(0, MAX_PRODUCT_IMAGES)
}

export async function fetchProducts(sourceUrl?: string): Promise<Product[]> {
  const requestUrl = resolveProductsUrl(sourceUrl)
  const response = await fetch(requestUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch product catalog')
  }

  const csvText = await response.text()
  const { data, errors } = Papa.parse<RawProduct>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0) {
    console.error('[fetchProducts] Failed to parse CSV:', errors)
    throw new Error('Failed to parse product catalog')
  }

  const products: Product[] = []

  for (const row of data) {
    const rawId = row.id ?? row.ID ?? row.Id ?? row.d
    const id = toNumber(rawId)
    if (Number.isNaN(id)) {
      continue
    }
    const priceValue = toNumber(row.price)
    const price = Number.isNaN(priceValue) ? null : priceValue
    const normalizedName = normalizeText(row.name)
    const name =
      normalizedName.length > 0 ? normalizedName : `Produto ${Math.trunc(id)}`
    const descriptionValue = normalizeText(row.description)
    const description =
      descriptionValue.length > 0 ? descriptionValue : FALLBACK_DESCRIPTION
    let images = extractImageUrls(row)
    if (images.length === 0) {
      images = [FALLBACK_IMAGE_URL]
    }
    const image = images[0]
    const category = normalizeText(row.category) || FALLBACK_CATEGORY
    const subcategory = normalizeText(row.subcategory) || FALLBACK_SUBCATEGORY
    const manufacturer = normalizeText(row.Fabricante)
    const manufacturerCode = normalizeText(row['codigo-fabricante'])
    const productReference = normalizeText(row['referencia-produto'])

    if (image.length === 0) {
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
