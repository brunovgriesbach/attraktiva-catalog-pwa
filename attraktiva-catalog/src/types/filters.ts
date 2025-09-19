export type SortOrder = 'default' | 'price-asc' | 'price-desc' | 'name-asc'

export interface SearchFilters {
  searchTerm: string
  category: string
  subcategory: string
  sortOrder: SortOrder
  manufacturer: string
  manufacturerCode: string
  productReference: string
  onlyFavorites: boolean
}
