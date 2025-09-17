import { describe, it, expect, vi, afterEach } from 'vitest'

import type { Product } from '../data/products'
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

  it('normalizes OneDrive share image URLs', async () => {
    const onedriveShareUrl =
      'https://1drv.ms/i/c/3150482359d620a2/EcNiiWoTVxhBuYzZqCWioNEBT9t--DH_PoTzD7BdyajnZA?e=hqWj51'
    const expectedNormalizedUrl =
      'https://1drv.ms/i/c/3150482359d620a2/EcNiiWoTVxhBuYzZqCWioNEBT9t--DH_PoTzD7BdyajnZA?e=hqWj51'

    const csvResponse = [
      'id;name;description;price;image;category;subcategory;image2;image3;image4;image5;Fabricante;codigo-fabricante;referencia-produto',
      `1;Produto;Descrição;100;${onedriveShareUrl};Categoria;Subcategoria;${onedriveShareUrl};;;;Fabricante;COD-1;REF-1`,
    ].join('\n')

    const mockFetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, text: async () => csvResponse } as unknown as Response)

    const data = await fetchProducts('https://example.com')

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/products.csv')

    expect(data).toEqual([
      {
        id: 1,
        name: 'Produto',
        description: 'Descrição',
        price: 100,
        image: expectedNormalizedUrl,
        images: [expectedNormalizedUrl, expectedNormalizedUrl],
        category: 'Categoria',
        subcategory: 'Subcategoria',
        manufacturer: 'Fabricante',
        manufacturerCode: 'COD-1',
        productReference: 'REF-1',
      },
    ])
  })
})

