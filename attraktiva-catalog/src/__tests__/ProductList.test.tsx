import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

import ProductList from '../components/ProductList'
import { products } from '../data/products'

expect.extend(matchers)

describe('ProductList', () => {
  it('renders all products', () => {
    render(
      <MemoryRouter>
        <ProductList products={products} />
      </MemoryRouter>
    )

    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })
  })
})

