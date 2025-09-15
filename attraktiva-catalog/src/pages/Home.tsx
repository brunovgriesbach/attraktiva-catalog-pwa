import { useEffect, useMemo, useState } from 'react'
import ProductList from '../components/ProductList'
import SearchBar, { type CategoryOption } from '../components/SearchBar'
import { fetchProducts } from '../api/products'
import type { Product } from '../data/products'
import type { SearchFilters, SortOrder } from '../types/filters'
import styles from './Home.module.css'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('default')
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => {
        console.error('Erro ao buscar produtos', err)
        setError(
          'Não foi possível carregar os produtos. Verifique se o servidor/backend está em execução.',
        )
      })
  }, [])

  const categoryOptions = useMemo<CategoryOption[]>(
    () =>
      Array.from(
        products.reduce((acc, product) => {
          const normalizedCategory = product.category
          const normalizedSubcategory = product.subcategory
          if (!acc.has(normalizedCategory)) {
            acc.set(normalizedCategory, new Set<string>())
          }
          acc.get(normalizedCategory)?.add(normalizedSubcategory)
          return acc
        }, new Map<string, Set<string>>()),
      )
        .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR', { sensitivity: 'base' }))
        .map(([categoryName, subcategories]) => ({
          value: categoryName,
          label: categoryName,
          subcategories: Array.from(subcategories).sort((a, b) =>
            a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }),
          ),
        })),
    [products],
  )

  function handleFilterChange({
    searchTerm: nextSearchTerm,
    category: nextCategory,
    subcategory: nextSubcategory,
    sortOrder: nextSortOrder,
  }: SearchFilters) {
    setSearchTerm(nextSearchTerm)
    setCategory(nextCategory)
    setSubcategory(nextSubcategory)
    setSortOrder(nextSortOrder)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Products</h1>
      {error && <p className={styles.error}>{error}</p>}
      <SearchBar
        searchTerm={searchTerm}
        category={category}
        subcategory={subcategory}
        sortOrder={sortOrder}
        categories={categoryOptions}
        onFilterChange={handleFilterChange}
      />
      <ProductList
        products={products}
        searchTerm={searchTerm}
        category={category}
        subcategory={subcategory}
        sortOrder={sortOrder}
      />
    </div>
  )
}
