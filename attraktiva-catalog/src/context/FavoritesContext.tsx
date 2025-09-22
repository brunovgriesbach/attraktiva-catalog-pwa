import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product } from '../data/products'

interface FavoritesContextValue {
  favorites: Product[]
  favoriteIds: number[]
  isFavorite(id: number): boolean
  toggleFavorite(product: Product): void
  syncFavorites(products: Product[]): void
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
)

function readStoredFavorites(): Product[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem('favorites')
    if (!rawValue) {
      return []
    }

    const parsed = JSON.parse(rawValue)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((item): item is Product => {
        if (typeof item !== 'object' || item === null) {
          return false
        }

        const candidate = item as Partial<Product>

        const hasValidPrice =
          typeof candidate.price === 'number' || candidate.price === null

        return (
          typeof candidate.id === 'number' &&
          typeof candidate.name === 'string' &&
          typeof candidate.description === 'string' &&
          hasValidPrice
        )
      })
      .map((item) => ({ ...item }))
  } catch (error) {
    console.warn('[FavoritesContext] Failed to parse stored favorites', error)
    return []
  }
}

function storeFavorites(favorites: Product[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem('favorites', JSON.stringify(favorites))
  } catch (error) {
    console.warn('[FavoritesContext] Failed to persist favorites', error)
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>(() => readStoredFavorites())

  useEffect(() => {
    storeFavorites(favorites)
  }, [favorites])

  const favoriteIds = useMemo(
    () => favorites.map((product) => product.id),
    [favorites],
  )

  const isFavorite = useCallback(
    (id: number) => favoriteIds.includes(id),
    [favoriteIds],
  )

  const toggleFavorite = useCallback((product: Product) => {
    setFavorites((previous) => {
      const exists = previous.some((item) => item.id === product.id)
      if (exists) {
        return previous.filter((item) => item.id !== product.id)
      }

      const sanitizedProduct: Product = {
        ...product,
        images: [...product.images],
      }

      return [...previous.filter((item) => item.id !== product.id), sanitizedProduct]
    })
  }, [])

  const syncFavorites = useCallback((products: Product[]) => {
    setFavorites((previous) => {
      if (previous.length === 0) {
        return previous
      }

      const productMap = new Map(products.map((product) => [product.id, product]))
      const nextFavorites = previous.map((favorite) => {
        const fresh = productMap.get(favorite.id)
        if (!fresh) {
          return favorite
        }

        return { ...fresh, images: [...fresh.images] }
      })

      const changed = nextFavorites.some((item, index) => item !== previous[index])

      return changed ? nextFavorites : previous
    })
  }, [])

  const value = useMemo(
    () => ({ favorites, favoriteIds, isFavorite, toggleFavorite, syncFavorites }),
    [favorites, favoriteIds, isFavorite, toggleFavorite, syncFavorites],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)

  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }

  return context
}

