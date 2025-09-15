import { useEffect, useState } from 'react'
import ProductList from '../components/ProductList'
import SearchBar from '../components/SearchBar'
import { fetchProducts } from '../api/products'
import type { Product } from '../data/products'
import styles from './Home.module.css'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => {
        console.error('Erro ao buscar produtos', err)
        setError('Erro ao buscar produtos')
      })
  }, [])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Products</h1>
      {error && <p className={styles.error}>{error}</p>}
      <SearchBar
        searchTerm={searchTerm}
        filter={filter}
        onSearchTermChange={setSearchTerm}
        onFilterChange={setFilter}
      />
      <ProductList
        products={products}
        searchTerm={searchTerm}
        filter={filter}
      />
    </div>
  )
}
