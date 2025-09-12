import { describe, it, expect } from 'vitest'
import { products } from './products'

describe('products data', () => {
  it('should have the correct format', () => {
    products.forEach((p) => {
      expect(typeof p.id).toBe('number')
      expect(typeof p.name).toBe('string')
      expect(typeof p.description).toBe('string')
      expect(typeof p.price).toBe('number')
      expect(typeof p.image).toBe('string')
    })
  })
})
