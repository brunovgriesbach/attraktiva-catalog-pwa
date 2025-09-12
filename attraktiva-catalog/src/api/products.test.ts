import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
} from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { fetchProducts } from './products'
import type { Product } from '../data/products'

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Mock Product',
    description: 'Mock description',
    price: 5,
    image: '/images/mock.jpg',
  },
]

const server = setupServer(
  http.get('/api/products', () => HttpResponse.json(mockProducts))
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('fetchProducts', () => {
  it('returns products in correct format', async () => {
    const data = await fetchProducts()
    expect(data).toEqual(mockProducts)
    data.forEach((p) => {
      expect(typeof p.id).toBe('number')
      expect(typeof p.name).toBe('string')
      expect(typeof p.description).toBe('string')
      expect(typeof p.price).toBe('number')
      expect(typeof p.image).toBe('string')
    })
  })
})
