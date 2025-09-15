import { useMemo } from 'react'
import type { Product } from '../data/products'
import type { SortOrder } from '../types/filters'
import ProductCard from './ProductCard'
import styles from './ProductList.module.css'

interface ProductListProps {
  products: Product[]
  searchTerm: string
  category: string
  subcategory: string
  sortOrder: SortOrder
}

function filterProducts(
  products: Product[],
  searchTerm: string,
  category: string,
  subcategory: string,
): Product[] {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  return products.filter((product) => {
    if (category && product.category !== category) {
      return false
    }

    if (subcategory && product.subcategory !== subcategory) {
      return false
    }

    if (normalizedSearch.length === 0) {
      return true
    }

    const searchableText = `${product.name} ${product.description}`.toLowerCase()

    return searchableText.includes(normalizedSearch)
  })
}

function sortProducts(products: Product[], sortOrder: SortOrder): Product[] {
  if (sortOrder === 'default') {
    return products
  }

  const sorted = [...products]

  switch (sortOrder) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price)
      break
    case 'name-asc':
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
      )
      break
    default:
      break
  }

  return sorted
}

export default function ProductList({
  products,
  searchTerm,
  category,
  subcategory,
  sortOrder,
}: ProductListProps) {
  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(products, searchTerm, category, subcategory)
    return sortProducts(filtered, sortOrder)
  }, [products, searchTerm, category, subcategory, sortOrder])

  return (
    <div className={styles.list}>
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
