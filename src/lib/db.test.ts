import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('localforage', () => {
  const store: Record<string, any> = {};
  return {
    default: {
      createInstance: () => ({
        async getItem(key: string) {
          return store[key];
        },
        async setItem(key: string, value: any) {
          store[key] = value;
        },
      }),
    },
  };
});

import { addToCart, getCart, clearCart } from './db';

const sample = {
  id: 1,
  title: 'Test',
  price: 10,
  thumbnailUrl: 'test',
  quantity: 1,
};

describe('cart db', () => {
  beforeEach(async () => {
    await clearCart();
  });

  it('adds items to cart', async () => {
    await addToCart(sample);
    const cart = await getCart();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });

  it('clears cart', async () => {
    await addToCart(sample);
    await clearCart();
    const cart = await getCart();
    expect(cart).toHaveLength(0);
  });
});
