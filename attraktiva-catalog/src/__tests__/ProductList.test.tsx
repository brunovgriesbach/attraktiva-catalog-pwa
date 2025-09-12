import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
} from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import ProductList from '../components/ProductList'
import type { Product } from '../data/products'

expect.extend(matchers)

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Mock Product',
    description: 'Description',
    price: 1,
    image: '/img.jpg',
  },
]

const server = setupServer(
  http.get('/api/products', () => HttpResponse.json(mockProducts))
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ProductList', () => {
  it('renders products after loading', async () => {
    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    for (const product of mockProducts) {
      expect(await screen.findByText(product.name)).toBeInTheDocument()
    }
  })

  it('shows error when request fails', async () => {
    server.use(
      http.get('/api/products', () => new HttpResponse(null, { status: 500 }))
    )

    render(
      <MemoryRouter>
        <ProductList />
      </MemoryRouter>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(
      await screen.findByText(/failed to load products/i)
    ).toBeInTheDocument()
  })
})

