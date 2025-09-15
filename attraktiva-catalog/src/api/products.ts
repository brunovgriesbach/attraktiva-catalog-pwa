import type { Product } from '../data/products';

export async function fetchProducts(): Promise<Product[]> {
  const rawBaseUrl = import.meta.env.VITE_API_URL;
  const baseUrl = typeof rawBaseUrl === 'string' ? rawBaseUrl.trim() : '';

  if (!baseUrl) {
    throw new Error('VITE_API_URL não definido');
  }

  const normalizedBaseUrl = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const requestUrl = `${normalizedBaseUrl}/api/products`;

  console.debug('[fetchProducts] Request URL:', requestUrl);

  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data: Product[] = await response.json();
  return data;
}
