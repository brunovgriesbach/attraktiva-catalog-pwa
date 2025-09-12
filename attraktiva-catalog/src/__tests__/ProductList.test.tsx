import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
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
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'Description for product 2',
    price: 19.99,
    image: '/images/product2.jpg',
  },
]

expect.extend(matchers)

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
})
