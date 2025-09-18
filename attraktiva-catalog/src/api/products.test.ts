import { describe, it, expect, vi, afterEach } from 'vitest'

import type { Product } from '../data/products'
import { PRODUCTS_SOURCE_URL } from '../config/catalog'
import { fetchProducts } from './products'

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

function createCsvResponse(
  products: CsvProduct[],
  options: { idHeader?: string } = {},
): string {
  const idHeader = options.idHeader ?? 'id'
  const header =
    `${idHeader},name,description,price,image,category,subcategory,image2,image3,image4,image5,Fabricante,codigo-fabricante,referencia-produto`
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
    ].join(',')
  })

  return [header, ...rows].join('\n')
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchProducts', () => {
  it('returns products in correct format for the default sheet', async () => {
    const csvResponse = createCsvResponse(mockProducts)

    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({
        ok: true,
        text: async () => csvResponse,
      } as unknown as Response)

    const data = await fetchProducts()

    expect(mockFetch).toHaveBeenCalledWith(PRODUCTS_SOURCE_URL)

    expect(data).toEqual(mockProducts)
  })

  it('supports alternate Google Sheets identifiers', async () => {
    const csvResponse = createCsvResponse(mockProducts, { idHeader: 'd' })

    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => csvResponse,
    } as unknown as Response)

    const data = await fetchProducts('https://example.com/custom-sheet')

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/custom-sheet')
    expect(data).toEqual(mockProducts)
  })

  it('resolves Google Drive file names when configured', async () => {
    const driveProduct: CsvProduct = {
      id: 3,
      name: 'Drive Product',
      description: 'Loaded from Drive',
      price: 10,
      image: 'catalog-image',
      images: ['catalog-image'],
      category: 'Drive Category',
      subcategory: 'Drive Subcategory',
      manufacturer: 'Drive Maker',
      manufacturerCode: 'DR-300',
      productReference: 'REF-300',
    }

    const csvResponse = createCsvResponse([driveProduct])

    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString()

        if (url.startsWith('https://www.googleapis.com/drive/v3/files')) {
          const parsed = new URL(url)
          expect(parsed.searchParams.get('q')).toBe(
            "'drive-folder-123' in parents and trashed = false",
          )
          return {
            ok: true,
            json: async () => ({
              files: [
                { id: 'drive-file-1', name: 'catalog-image.png' },
                { id: 'drive-file-2', name: 'catalog-image.jpg' },
              ],
            }),
          } as unknown as Response
        }

        expect(url).toBe(PRODUCTS_SOURCE_URL)

        return {
          ok: true,
          text: async () => csvResponse,
        } as unknown as Response
      })

    const data = await fetchProducts(undefined, {
      driveFolderId: 'drive-folder-123',
      driveApiKey: 'drive-api-key-456',
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(data).toEqual([
      {
        ...driveProduct,
        image: 'https://drive.google.com/uc?export=view&id=drive-file-1',
        images: ['https://drive.google.com/uc?export=view&id=drive-file-1'],
      },
    ])
  })
})

