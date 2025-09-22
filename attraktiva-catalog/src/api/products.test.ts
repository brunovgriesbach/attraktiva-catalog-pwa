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

  it('parses localized prices and keeps incomplete rows', async () => {
    const csvResponse = [
      'id,name,description,price,category,subcategory,Fabricante,codigo-fabricante,referencia-produto,image,image2,image3,image4,image5',
      '5,,,"R$ 1.234,56",,,,,,,,,,',
      '6,"Produto informado",,"",Sala,Mesas,"Fabricante X","COD-123","REF-123","https://example.com/image.jpg",,,,',
    ].join('\n')

    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => csvResponse,
    } as unknown as Response)

    const data = await fetchProducts('https://example.com/localized-sheet')

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/localized-sheet')
    expect(data).toEqual([
      {
        id: 5,
        name: 'Produto 5',
        description: 'Descrição não disponível',
        price: 1234.56,
        image: '/images/product-placeholder.svg',
        images: ['/images/product-placeholder.svg'],
        category: 'Outros',
        subcategory: 'Outros',
        manufacturer: '',
        manufacturerCode: '',
        productReference: '',
      },
      {
        id: 6,
        name: 'Produto informado',
        description: 'Descrição não disponível',
        price: null,
        image: 'https://example.com/image.jpg',
        images: ['https://example.com/image.jpg'],
        category: 'Sala',
        subcategory: 'Mesas',
        manufacturer: 'Fabricante X',
        manufacturerCode: 'COD-123',
        productReference: 'REF-123',
      },
    ])
  })
})

