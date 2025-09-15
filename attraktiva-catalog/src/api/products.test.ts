import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchProducts } from './products';
import type { Product } from '../data/products';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchProducts', () => {
  it('returns products in correct format', async () => {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'Mock Product',
        description: 'Mock description',
        price: 5,
        image: '/images/mock.jpg',
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockProducts,
    } as unknown as Response);

    const data = await fetchProducts();
    expect(data).toEqual(mockProducts);
    data.forEach((p) => {
      expect(typeof p.id).toBe('number');
      expect(typeof p.name).toBe('string');
      expect(typeof p.description).toBe('string');
      expect(typeof p.price).toBe('number');
      expect(typeof p.image).toBe('string');
    });
  });
});
