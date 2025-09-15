import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, afterEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

import ProductList from '../components/ProductList'
import type { Product } from '../data/products'

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Product 1',
    description: 'Description for product 1',
    price: 9.99,
    image: '/images/product1.jpg',
    category: 'Furniture',
    subcategory: 'Chairs',
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'Description for product 2',
    price: 19.99,
    image: '/images/product2.jpg',
    category: 'Furniture',
    subcategory: 'Tables',
  },
  {
    id: 3,
    name: 'Product 3',
    description: 'Description for product 3',
    price: 29.99,
    image: '/images/product3.jpg',
    category: 'Lighting',
    subcategory: 'Lamps',
  },
]

expect.extend(matchers)

afterEach(() => {
  cleanup()
})

describe('ProductList', () => {
  it('renders all products', () => {
    render(
      <MemoryRouter>
        <ProductList products={mockProducts} />
      </MemoryRouter>,
    )

    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })
  })

  it('filters by category and subcategory', () => {
    render(
      <MemoryRouter>
        <ProductList
          products={mockProducts}
          categoryFilter="Furniture"
          subcategoryFilter="Chairs"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.queryByText('Product 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Product 3')).not.toBeInTheDocument()
  })
})
