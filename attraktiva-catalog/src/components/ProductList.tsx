import { useMemo } from 'react'
import type { Product } from '../data/products'
import type { SortOrder } from '../types/filters'
import ProductCard from './ProductCard'
import styles from './ProductList.module.css'
import { useFavorites } from '../context/FavoritesContext'
import { smartSearchMatch, createSearchableText } from '../utils/smartSearch'

interface ProductListProps {
  products: Product[]
  searchTerm: string
  category: string
  subcategory: string
  sortOrder: SortOrder
  manufacturer: string
  manufacturerCode: string
  productReference: string
  onlyFavorites: boolean
}

function filterProducts(
  products: Product[],
  searchTerm: string,
  category: string,
  subcategory: string,
  manufacturer: string,
  manufacturerCode: string,
  productReference: string,
  onlyFavorites: boolean,
  favoriteIds: Set<number>,
): Product[] {
  const normalizedManufacturer = manufacturer.trim().toLowerCase()
  const normalizedManufacturerCode = manufacturerCode.trim().toLowerCase()
  const normalizedProductReference = productReference.trim().toLowerCase()

  return products.filter((product) => {
    if (onlyFavorites && !favoriteIds.has(product.id)) {
      return false
    }

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

    if (searchTerm.trim().length === 0) {
      return true
    }

    const searchableText = createSearchableText(
      product.name,
      product.manufacturer,
      product.manufacturerCode,
      product.productReference,
    )

    return smartSearchMatch(searchTerm, searchableText)
  })
}

function sortProducts(products: Product[], sortOrder: SortOrder): Product[] {
  if (sortOrder === 'default') {
    return products
  }

  const sorted = [...products]

  switch (sortOrder) {
    case 'price-asc':
      sorted.sort((a, b) => {
        const priceA =
          typeof a.price === 'number' ? a.price : Number.POSITIVE_INFINITY
        const priceB =
          typeof b.price === 'number' ? b.price : Number.POSITIVE_INFINITY

        return priceA - priceB
      })
      break
    case 'price-desc':
      sorted.sort((a, b) => {
        const priceA =
          typeof a.price === 'number' ? a.price : Number.NEGATIVE_INFINITY
        const priceB =
          typeof b.price === 'number' ? b.price : Number.NEGATIVE_INFINITY

        return priceB - priceA
      })
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
  onlyFavorites,
}: ProductListProps) {
  const { favoriteIds } = useFavorites()
  const favoriteIdSet = useMemo(
    () => new Set(favoriteIds),
    [favoriteIds],
  )

  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(
      products,
      searchTerm,
      category,
      subcategory,
      manufacturer,
      manufacturerCode,
      productReference,
      onlyFavorites,
      favoriteIdSet,
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
    onlyFavorites,
    favoriteIdSet,
  ])

  return (
    <div className={styles.list}>
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
