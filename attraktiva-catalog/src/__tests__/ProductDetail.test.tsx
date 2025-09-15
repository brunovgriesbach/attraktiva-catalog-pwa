import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

import ProductDetail from '../pages/ProductDetail'

expect.extend(matchers)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ProductDetail', () => {
  it('shows product info when product exists', async () => {
    const csvResponse = `id;name;description;price;image\n` +
      `1;Product 1;Description for product 1;9.99;/images/product1.jpg\n`

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => csvResponse,
    } as unknown as Response)

    render(
      <MemoryRouter initialEntries={['/product/1']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Product 1' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Description for product 1')).toBeInTheDocument()
  })

  it('shows not found message for missing product', async () => {
    const csvResponse = `id;name;description;price;image\n` +
      `1;Product 1;Description for product 1;9.99;/images/product1.jpg\n`

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => csvResponse,
    } as unknown as Response)

    render(
      <MemoryRouter initialEntries={['/product/999']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Product not found.')).toBeInTheDocument()
  })
})
