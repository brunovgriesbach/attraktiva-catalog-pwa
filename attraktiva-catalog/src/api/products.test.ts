import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchProducts } from './products'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchProducts', () => {
  it('returns products in correct format', async () => {
    const csvResponse = `id;name;description;price;image\n` +
      `1;Mock Product;Mock description;5;/images/mock.jpg\n` +
      `2;Second Product;Another description;8.5;/images/second.jpg\n`

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
    expect(data).toEqual([
      {
        id: 1,
        name: 'Mock Product',
        description: 'Mock description',
        price: 5,
        image: '/images/mock.jpg',
      },
      {
        id: 2,
        name: 'Second Product',
        description: 'Another description',
        price: 8.5,
        image: '/images/second.jpg',
      },
    ])
  })
})
