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

  it('converts Google Drive references into direct download URLs', async () => {
    const csvResponse = [
      'id;name;description;price;image;category;subcategory;image2;image3;image4;image5;Fabricante;codigo-fabricante;referencia-produto',
      [
        5,
        'Drive Asset',
        'Produto com imagem no Drive',
        123.45,
        'https://drive.google.com/file/d/1DrivePrimaryID/view?usp=sharing',
        'Decor',
        'Quadros',
        '<img src="https://drive.google.com/open?id=1DriveSecondaryID" />',
        '',
        '',
        '',
        'Maker',
        'MK-500',
        'REF-500',
      ].join(';'),
    ].join('\n')

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => csvResponse,
    } as unknown as Response)

    const data = await fetchProducts('https://catalog.example.com')

    expect(data).toEqual([
      {
        id: 5,
        name: 'Drive Asset',
        description: 'Produto com imagem no Drive',
        price: 123.45,
        image:
          'https://drive.google.com/uc?export=view&id=1DrivePrimaryID',
        images: [
          'https://drive.google.com/uc?export=view&id=1DrivePrimaryID',
          'https://drive.google.com/uc?export=view&id=1DriveSecondaryID',
        ],
        category: 'Decor',
        subcategory: 'Quadros',
        manufacturer: 'Maker',
        manufacturerCode: 'MK-500',
        productReference: 'REF-500',
      },
    ])
  })

  it('converts OneDrive share URLs into direct download URLs', async () => {
    const shareUrl =
      'https://1drv.ms/i/c/3150482359d620a2/EUlA84ZVFzlBjuicTK6vFbYBf4ofry0aLt9ZMBA2t_SrCA?e=Hgqcbb&download=1'
    const csvResponse = [
      'id;name;description;price;image;category;subcategory;image2;image3;image4;image5;Fabricante;codigo-fabricante;referencia-produto',
      [
        9,
        'OneDrive Asset',
        'Produto com imagem no OneDrive',
        77.7,
        shareUrl,
        'Decor',
        'Quadros',
        '',
        '',
        '',
        '',
        'Maker',
        'MK-900',
        'REF-900',
      ].join(';'),
    ].join('\n')

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => csvResponse,
    } as unknown as Response)

    const data = await fetchProducts('https://catalog.example.com')

    expect(data).toEqual([
      {
        id: 9,
        name: 'OneDrive Asset',
        description: 'Produto com imagem no OneDrive',
        price: 77.7,
        image:
          'https://api.onedrive.com/v1.0/shares/u!aHR0cHM6Ly8xZHJ2Lm1zL2kvYy8zMTUwNDgyMzU5ZDYyMGEyL0VVbEE4NFpWRnpsQmp1aWNUSzZ2RmJZQmY0b2ZyeTBhTHQ5Wk1CQTJ0X1NyQ0E_ZT1IZ3FjYmImZG93bmxvYWQ9MQ/root/content',
        images: [
          'https://api.onedrive.com/v1.0/shares/u!aHR0cHM6Ly8xZHJ2Lm1zL2kvYy8zMTUwNDgyMzU5ZDYyMGEyL0VVbEE4NFpWRnpsQmp1aWNUSzZ2RmJZQmY0b2ZyeTBhTHQ5Wk1CQTJ0X1NyQ0E_ZT1IZ3FjYmImZG93bmxvYWQ9MQ/root/content',
        ],
        category: 'Decor',
        subcategory: 'Quadros',
        manufacturer: 'Maker',
        manufacturerCode: 'MK-900',
        productReference: 'REF-900',
      },
    ])
  })
})

