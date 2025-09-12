import { useState } from 'react'
import ProductList from '../components/ProductList'
import SearchBar from '../components/SearchBar'
import { products } from '../data/products'
import styles from './Home.module.css'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Products</h1>
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
