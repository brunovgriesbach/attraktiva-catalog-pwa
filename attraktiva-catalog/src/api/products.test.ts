import { describe, it, expect, vi, afterEach } from 'vitest'

import type { Product } from '../data/products'
import { fetchProducts } from './products'

type CsvProduct = Product & {
  category: string
  subcategory: string
}

const mockProducts = [
  {
    id: 1,
    name: 'Mock Product',
    description: 'Mock description',
    price: 5,
    image: '/images/mock.jpg',
    category: 'Category 1',
    subcategory: 'Subcategory 1',
  },
  {
    id: 2,
    name: 'Second Product',
    description: 'Another description',
    price: 8.5,
    image: '/images/second.jpg',
    category: 'Category 2',
    subcategory: 'Subcategory 2',
  },
] satisfies CsvProduct[]

function createCsvResponse(products: CsvProduct[]): string {
  const header = 'id;name;description;price;image;category;subcategory'
  const rows = products.map((product) =>
    [
      product.id,
      product.name,
      product.description,
      product.price,
      product.image,
      product.category,
      product.subcategory,
    ].join(';'),
  )

  return [header, ...rows].join('\n')
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchProducts', () => {
  it('returns products in correct format', async () => {
    const csvResponse = createCsvResponse(mockProducts)

    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({
        ok: true,
        text: async () => csvResponse,
      } as unknown as Response)

    const data = await fetchProducts()

    const basePath = (import.meta.env.BASE_URL ?? '/').trim() || '/'
    const normalizedBasePath = basePath.endsWith('/')
      ? basePath
      : `${basePath}/`
    const baseWithLeadingSlash = normalizedBasePath.startsWith('/')
      ? normalizedBasePath
      : `/${normalizedBasePath}`
    const expectedUrl = new URL(
      'products.csv',
      new URL(baseWithLeadingSlash, window.location.origin),
    ).toString()
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)

    const expectedProducts = mockProducts.map((product) => {
      const { category, subcategory, ...rest } = product
      void category
      void subcategory
      return rest
    })

    expect(data).toEqual(expectedProducts)
  })
})
