import type { ChangeEvent } from 'react'
import type { SearchFilters, SortOrder } from '../types/filters'
import styles from './SearchBar.module.css'

export interface CategoryOption {
  value: string
  label: string
  subcategories: string[]
}

interface SearchBarProps extends SearchFilters {
  categories: CategoryOption[]
  onFilterChange: (filters: SearchFilters) => void
}

function mergeFilters(
  current: SearchFilters,
  partial: Partial<SearchFilters>,
): SearchFilters {
  return {
    searchTerm: partial.searchTerm ?? current.searchTerm,
    category: partial.category ?? current.category,
    subcategory: partial.subcategory ?? current.subcategory,
    sortOrder: partial.sortOrder ?? current.sortOrder,
  }
}

function getSubcategories(
  categories: CategoryOption[],
  selectedCategory: string,
): string[] {
  const match = categories.find((category) => category.value === selectedCategory)
  return match?.subcategories ?? []
}

export default function SearchBar({
  searchTerm,
  category,
  subcategory,
  sortOrder,
  categories,
  onFilterChange,
}: SearchBarProps) {
  const subcategoryOptions = getSubcategories(categories, category)

  function handleFilterChange(partial: Partial<SearchFilters>) {
    onFilterChange(
      mergeFilters({ searchTerm, category, subcategory, sortOrder }, partial),
    )
  }

  function handleSearchTermChange(event: ChangeEvent<HTMLInputElement>) {
    handleFilterChange({ searchTerm: event.target.value })
  }

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextCategory = event.target.value
    handleFilterChange({ category: nextCategory, subcategory: '' })
  }

  function handleSubcategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    handleFilterChange({ subcategory: event.target.value })
  }

  function handleSortOrderChange(event: ChangeEvent<HTMLSelectElement>) {
    handleFilterChange({ sortOrder: event.target.value as SortOrder })
  }

  return (
    <form
      className={styles.searchBar}
      role="search"
      aria-label="Busca de produtos"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="searchTerm">
          Buscar
        </label>
        <input
          id="searchTerm"
          type="search"
          name="searchTerm"
          placeholder="Buscar produtos"
          value={searchTerm}
          onChange={handleSearchTermChange}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="category">
          Categoria
        </label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={handleCategoryChange}
          className={styles.select}
        >
          <option value="">Todas as categorias</option>
          {categories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="subcategory">
          Subcategoria
        </label>
        <select
          id="subcategory"
          name="subcategory"
          value={subcategory}
          onChange={handleSubcategoryChange}
          className={styles.select}
          disabled={category === '' || subcategoryOptions.length === 0}
        >
          <option value="">Todas as subcategorias</option>
          {subcategoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="sortOrder">
          Ordenar por
        </label>
        <select
          id="sortOrder"
          name="sortOrder"
          value={sortOrder}
          onChange={handleSortOrderChange}
          className={styles.select}
        >
          <option value="default">Ordenação padrão</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="name-asc">Nome A–Z</option>
        </select>
      </div>
    </form>
  )
}
