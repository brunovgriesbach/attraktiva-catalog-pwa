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
  manufacturer: string
  manufacturerCode: string
  productReference: string
}

function filterProducts(
  products: Product[],
  searchTerm: string,
  category: string,
  subcategory: string,
  manufacturer: string,
  manufacturerCode: string,
  productReference: string,
): Product[] {
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const normalizedManufacturer = manufacturer.trim().toLowerCase()
  const normalizedManufacturerCode = manufacturerCode.trim().toLowerCase()
  const normalizedProductReference = productReference.trim().toLowerCase()

  return products.filter((product) => {
    if (category && product.category !== category) {
      return false
    }

    if (subcategory && product.subcategory !== subcategory) {
      return false
    }

    if (
      normalizedManufacturer &&
      !product.manufacturer.toLowerCase().includes(normalizedManufacturer)
    ) {
      return false
    }

    if (
      normalizedManufacturerCode &&
      !product.manufacturerCode.toLowerCase().includes(normalizedManufacturerCode)
    ) {
      return false
    }

    if (
      normalizedProductReference &&
      !product.productReference.toLowerCase().includes(normalizedProductReference)
    ) {
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
  manufacturer,
  manufacturerCode,
  productReference,
}: ProductListProps) {
  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(
      products,
      searchTerm,
      category,
      subcategory,
      manufacturer,
      manufacturerCode,
      productReference,
    )
    return sortProducts(filtered, sortOrder)
  }, [
    products,
    searchTerm,
    category,
    subcategory,
    sortOrder,
    manufacturer,
    manufacturerCode,
    productReference,
  ])

  return (
    <div className={styles.list}>
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
