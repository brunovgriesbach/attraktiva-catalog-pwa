import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

import type { Product } from '../data/products'

type CsvProduct = Product

const mockProducts = [
  {
    id: 1,
    name: 'Mock Product',
    description: 'Mock description',
    price: 5,
    image: '/images/mock.jpg',
    images: ['/images/mock.jpg', '/images/mock-alt.jpg'],
    category: 'Category 1',
    subcategory: 'Subcategory 1',
    manufacturer: 'Maker',
    manufacturerCode: 'MK-100',
    productReference: 'REF-100',
  },
  {
    id: 2,
    name: 'Second Product',
    description: 'Another description',
    price: 8.5,
    image: '/images/second.jpg',
    images: ['/images/second.jpg'],
    category: 'Category 2',
    subcategory: 'Subcategory 2',
    manufacturer: 'Builder',
    manufacturerCode: 'BL-200',
    productReference: 'REF-200',
  },
] satisfies CsvProduct[]

function createCsvResponse(products: CsvProduct[]): string {
  const header =
    'id;name;description;price;image;category;subcategory;image2;image3;image4;image5;Fabricante;codigo-fabricante;referencia-produto'
  const rows = products.map((product) => {
    const [primaryImage, ...additionalImages] =
      product.images.length > 0 ? product.images : [product.image]
    const [image2 = '', image3 = '', image4 = '', image5 = ''] = additionalImages

    return [
      product.id,
      product.name,
      product.description,
      product.price,
      primaryImage,
      product.category,
      product.subcategory,
      image2,
      image3,
      image4,
      image5,
      product.manufacturer,
      product.manufacturerCode,
      product.productReference,
    ].join(';')
  })

  return [header, ...rows].join('\n')
}

const ORIGINAL_SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL

function setGoogleSheetsUrl(value: string | undefined) {
  const env = import.meta.env as Record<string, string | undefined>
  if (value === undefined) {
    delete env.VITE_GOOGLE_SHEETS_URL
    return
  }

  env.VITE_GOOGLE_SHEETS_URL = value
}

async function importFetchProducts() {
  const module = await import('./products')
  return module.fetchProducts
}

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  setGoogleSheetsUrl(ORIGINAL_SHEETS_URL)
  vi.restoreAllMocks()
})

describe('fetchProducts', () => {
  it('falls back to baseUrl when provided', async () => {
    setGoogleSheetsUrl('https://docs.google.com/spreadsheets/d/EXAMPLE/export?format=csv')

    const csvResponse = createCsvResponse(mockProducts)
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({
        ok: true,
        text: async () => csvResponse,
      } as unknown as Response)

    const fetchProducts = await importFetchProducts()
    const data = await fetchProducts('http://localhost')

    expect(mockFetch).toHaveBeenCalledWith('http://localhost/products.csv')
    expect(data).toEqual(mockProducts)
  })

  it('uses Google Sheets URL from environment when available', async () => {
    const sharedUrl =
      'https://docs.google.com/spreadsheets/d/1V_cRwCFGDK6DRwI7xVYlf6raYq3iQzB7cZcgQRIRIo4/edit?usp=sharing'
    const expectedCsvUrl =
      'https://docs.google.com/spreadsheets/d/1V_cRwCFGDK6DRwI7xVYlf6raYq3iQzB7cZcgQRIRIo4/export?format=csv'
    setGoogleSheetsUrl(sharedUrl)

    const csvResponse = createCsvResponse(mockProducts)
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({
        ok: true,
        text: async () => csvResponse,
      } as unknown as Response)

    const fetchProducts = await importFetchProducts()
    const data = await fetchProducts()

    expect(mockFetch).toHaveBeenCalledWith(expectedCsvUrl)
    expect(data).toEqual(mockProducts)
  })

  it('falls back to legacy products.csv when environment variable is missing', async () => {
    setGoogleSheetsUrl('')

    const csvResponse = createCsvResponse(mockProducts)
    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({
        ok: true,
        text: async () => csvResponse,
      } as unknown as Response)

    const fetchProducts = await importFetchProducts()
    const data = await fetchProducts()

    expect(mockFetch).toHaveBeenCalledWith('/products.csv')
    expect(data).toEqual(mockProducts)
  })
})

