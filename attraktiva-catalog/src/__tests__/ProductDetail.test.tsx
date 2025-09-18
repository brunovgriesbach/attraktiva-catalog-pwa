import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

import ProductDetail from '../pages/ProductDetail'
import { fetchProducts } from '../api/products'
import { MAX_PRODUCT_IMAGES } from '../config/catalog'
import type { Product } from '../data/products'

vi.mock('../api/products', () => ({
  fetchProducts: vi.fn(),
}))

const mockProducts = [
  {
    id: 1,
    name: 'Product 1',
    description: 'Description for product 1',
    price: 9.99,
    image: '/images/product1.jpg',
    images: [
      '/images/product1.jpg',
      '/images/product1-alt.jpg',
      '/images/product1-detail.jpg',
    ],
    category: 'Category 1',
    subcategory: 'Subcategory 1',
    manufacturer: 'Maker One',
    manufacturerCode: 'MK-1',
    productReference: 'REF-001',
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'Description for product 2',
    price: 19.99,
    image: '/images/product2.jpg',
    images: ['/images/product2.jpg'],
    category: 'Category 2',
    subcategory: 'Subcategory 2',
    manufacturer: 'Maker Two',
    manufacturerCode: 'MK-2',
    productReference: 'REF-002',
  },
  {
    id: 3,
    name: 'Product 3',
    description: 'Description for product 3',
    price: 29.99,
    image: '/images/product3.jpg',
    images: [
      '/images/product3.jpg',
      '/images/product3-1.jpg',
      '/images/product3-2.jpg',
      '/images/product3-3.jpg',
      '/images/product3-4.jpg',
      '/images/product3-5.jpg',
      '/images/product3-6.jpg',
      '/images/product3-7.jpg',
      '/images/product3-8.jpg',
      '/images/product3-9.jpg',
      '/images/product3-10.jpg',
      '/images/product3-11.jpg',
    ],
    category: 'Category 3',
    subcategory: 'Subcategory 3',
    manufacturer: 'Maker Three',
    manufacturerCode: 'MK-3',
    productReference: 'REF-003',
  },
] satisfies Product[]

const mockedFetchProducts = vi.mocked(fetchProducts)

function renderProductDetail(productId: number) {
  render(
    <MemoryRouter initialEntries={[`/product/${productId}`]}>
      <Routes>
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

expect.extend(matchers)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('ProductDetail', () => {
  it('shows product info when product exists', async () => {
    mockedFetchProducts.mockResolvedValue(mockProducts)

    renderProductDetail(1)

    expect(
      await screen.findByRole('heading', { name: 'Product 1' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Description for product 1')).toBeInTheDocument()
    expect(screen.getByText('R$ 9.99')).toBeInTheDocument()
    expect(screen.getByText('Maker One')).toBeInTheDocument()
    expect(screen.getByText('MK-1')).toBeInTheDocument()
    expect(screen.getByText('REF-001')).toBeInTheDocument()
    const mainImage = screen.getByRole('img', { name: 'Product 1' })
    expect(mainImage).toHaveAttribute('src', '/images/product1.jpg')
    const thumbnailImages = screen.getAllByRole('img', {
      name: /Product 1 - imagem/i,
    })
    expect(thumbnailImages).toHaveLength(mockProducts[0].images.length)
    const backLink = screen.getByRole('link', { name: 'Back to products' })
    expect(backLink).toHaveAttribute('href', '/')
    expect(mockedFetchProducts).toHaveBeenCalledTimes(1)
  })

  it('shows not found message for missing product', async () => {
    mockedFetchProducts.mockResolvedValue(mockProducts)

    renderProductDetail(999)

    expect(await screen.findByText('Product not found.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to products' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(mockedFetchProducts).toHaveBeenCalledTimes(1)
  })

  it('limits the gallery to the maximum number of images', async () => {
    mockedFetchProducts.mockResolvedValue(mockProducts)

    renderProductDetail(3)

    expect(
      await screen.findByRole('heading', { name: 'Product 3' }),
    ).toBeInTheDocument()

    const thumbnails = screen.getAllByRole('img', {
      name: /Product 3 - imagem/i,
    })

    expect(thumbnails).toHaveLength(MAX_PRODUCT_IMAGES)
    const lastThumbnail = thumbnails[thumbnails.length - 1]
    expect(lastThumbnail).toHaveAttribute(
      'alt',
      `Product 3 - imagem ${MAX_PRODUCT_IMAGES}`,
    )
    expect(
      screen.queryByRole('img', { name: /Product 3 - imagem 11/i }),
    ).not.toBeInTheDocument()
  })
})
