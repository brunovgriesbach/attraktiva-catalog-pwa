import type { Product } from '../data/products'

export async function fetchProducts(): Promise<Product[]> {
  const baseUrl = import.meta.env.VITE_API_URL ?? ''
  const response = await fetch(`${baseUrl}/api/products`)
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  const data: Product[] = await response.json()
  return data
}
