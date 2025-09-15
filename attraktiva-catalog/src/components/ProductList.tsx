import { useMemo } from 'react'
import type { Product } from '../data/products'
import ProductCard from './ProductCard'
import styles from './ProductList.module.css'

interface ProductListProps {
  products: Product[]
  searchTerm?: string
  priceFilter?: string
  categoryFilter?: string | null
  subcategoryFilter?: string | null
}

export default function ProductList({
  products,
  searchTerm = '',
  priceFilter = 'all',
  categoryFilter = null,
  subcategoryFilter = null,
}: ProductListProps) {
  const filteredProducts = useMemo(
    () => {
      const normalizedSearch = searchTerm.trim().toLowerCase()
      const normalizedCategory = categoryFilter?.toLowerCase() ?? ''
      const normalizedSubcategory = subcategoryFilter?.toLowerCase() ?? ''

      return products.filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(normalizedSearch)

        let matchesFilter = true
        switch (priceFilter) {
          case 'under-10':
            matchesFilter = product.price < 10
            break
          case '10-20':
            matchesFilter = product.price >= 10 && product.price <= 20
            break
          case 'over-20':
            matchesFilter = product.price > 20
            break
          default:
            matchesFilter = true
        }

        const matchesCategory =
          !normalizedCategory ||
          product.category.toLowerCase() === normalizedCategory

        const matchesSubcategory =
          !normalizedSubcategory ||
          product.subcategory.toLowerCase() === normalizedSubcategory

        return (
          matchesSearch && matchesFilter && matchesCategory && matchesSubcategory
        )
      })
    },
    [products, searchTerm, priceFilter, categoryFilter, subcategoryFilter],
  )

  return (
    <div className={styles.list}>
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
