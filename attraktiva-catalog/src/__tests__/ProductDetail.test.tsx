import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

import ProductDetail from '../pages/ProductDetail'
import { fetchProducts } from '../api/products'
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
    category: 'Category 2',
    subcategory: 'Subcategory 2',
    manufacturer: 'Maker Two',
    manufacturerCode: 'MK-2',
    productReference: 'REF-002',
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
})
