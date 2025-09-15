import { useEffect, useMemo, useState } from 'react'
import ProductList from '../components/ProductList'
import SearchBar from '../components/SearchBar'
import { fetchProducts } from '../api/products'
import type { Product } from '../data/products'
import CategoryMenu, {
  type CategoryGroup,
} from '../components/CategoryMenu'
import styles from './Home.module.css'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  )
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

  const categories = useMemo<CategoryGroup[]>(() => {
    const map = new Map<string, Set<string>>()

    products.forEach((product) => {
      const categoryName = product.category || 'Outros'
      const subcategoryName = product.subcategory || ''

      if (!map.has(categoryName)) {
        map.set(categoryName, new Set<string>())
      }

      if (subcategoryName) {
        map.get(categoryName)?.add(subcategoryName)
      }
    })

    return Array.from(map.entries())
      .map(([name, subcategories]) => ({
        name,
        subcategories: Array.from(subcategories).sort((a, b) =>
          a.localeCompare(b),
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  useEffect(() => {
    if (!selectedCategory) {
      return
    }

    const activeCategory = categories.find(
      (category) => category.name === selectedCategory,
    )

    if (!activeCategory) {
      setSelectedCategory(null)
      setSelectedSubcategory(null)
      return
    }

    if (
      selectedSubcategory &&
      !activeCategory.subcategories.includes(selectedSubcategory)
    ) {
      setSelectedSubcategory(null)
    }
  }, [categories, selectedCategory, selectedSubcategory])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Products</h1>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.filters}>
        <div className={styles.filtersMenu}>
          <CategoryMenu
            categories={categories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategorySelect={setSelectedCategory}
            onSubcategorySelect={setSelectedSubcategory}
          />
        </div>
        <div className={styles.filtersSearch}>
          <SearchBar
            searchTerm={searchTerm}
            filter={priceFilter}
            onSearchTermChange={setSearchTerm}
            onFilterChange={setPriceFilter}
          />
        </div>
      </div>
      <ProductList
        products={products}
        searchTerm={searchTerm}
        priceFilter={priceFilter}
        categoryFilter={selectedCategory}
        subcategoryFilter={selectedSubcategory}
      />
    </div>
  )
}
