import { describe, it, expect, vi, afterEach } from 'vitest'

import type { Product } from '../data/products'
import { fetchProducts, resolveOneDriveUrl } from './products'

import.meta.env.VITE_API_URL = 'http://localhost'

type CsvProduct = Product

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

    const data = await fetchProducts('http://localhost')

    expect(mockFetch).toHaveBeenCalledWith('http://localhost/products.csv')

    expect(data).toEqual(mockProducts)
  })
})

describe('resolveOneDriveUrl', () => {
  it('converts onedrive.live.com share URLs to direct download links', () => {
    const url =
      'https://onedrive.live.com/?cid=123ABC&resid=123ABC%21123&authkey=%21AIexampleKey'
    const resolved = resolveOneDriveUrl(url)

    expect(resolved).toBe(
      'https://onedrive.live.com/download?cid=123ABC&resid=123ABC%21123&authkey=%21AIexampleKey',
    )
  })

  it('appends download parameter to short 1drv.ms links', () => {
    const url = 'https://1drv.ms/u/s!example'
    const resolved = resolveOneDriveUrl(url)

    expect(resolved).toBe('https://1drv.ms/u/s!example?download=1')
  })

  it('returns the original URL for non-OneDrive hosts', () => {
    const url = 'https://example.com/image.jpg'

    expect(resolveOneDriveUrl(url)).toBe(url)
  })
})
