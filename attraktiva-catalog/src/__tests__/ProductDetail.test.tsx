import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

import ProductDetail from '../pages/ProductDetail'

expect.extend(matchers)

describe('ProductDetail', () => {
  it('shows product info when product exists', () => {
    render(
      <MemoryRouter initialEntries={['/product/1']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Product 1' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Description for product 1')).toBeInTheDocument()
  })

  it('shows not found message for missing product', () => {
    render(
      <MemoryRouter initialEntries={['/product/999']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Product not found.')).toBeInTheDocument()
  })
})
