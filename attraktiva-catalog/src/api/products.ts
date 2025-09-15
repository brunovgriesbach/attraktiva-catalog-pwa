import type { Product } from '../data/products'

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`)
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  const data: Product[] = await response.json()
  return data
}
