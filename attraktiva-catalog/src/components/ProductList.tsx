import { useEffect, useState } from 'react'
import type { Product } from '../data/products'
import { fetchProducts } from '../api/products'
import ProductCard from './ProductCard'
import styles from './ProductList.module.css'

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    fetchProducts()
      .then((data) => {
        if (isMounted) setProducts(data)
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Failed to load products: {error}</div>
  }

  return (
    <div className={styles.list}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
