import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import type { Product } from '../data/products'

export interface CartItem {
  product: Product
  notes: string
}

interface CartContextType {
  items: CartItem[]
  addItem(product: Product): void
  removeItem(id: number): void
  clearCart(): void
  updateNotes(id: number, notes: string): void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function parseStoredCart(value: string | null): CartItem[] {
  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((item) => {
        if (item && typeof item === 'object' && 'product' in item) {
          const candidate = item as { product: Product; notes?: string }
          return {
            product: candidate.product,
            notes: candidate.notes ?? '',
          }
        }

        const product = item as Product
        return {
          product,
          notes: '',
        }
      })
      .filter((item) => Boolean(item.product))
  } catch (error) {
    console.error('Não foi possível carregar o carrinho do armazenamento local', error)
    return []
  }
}

function getInitialItems(): CartItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  return parseStoredCart(window.localStorage.getItem('cart'))
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(getInitialItems)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (product: Product) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.product.id === product.id)
      if (exists) {
        return prev
      }

      return [...prev, { product, notes: '' }]
    })
  }

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== id))
  }

  const clearCart = () => {
    setItems([])
  }

  const updateNotes = (id: number, notes: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === id
          ? {
              ...item,
              notes,
            }
          : item,
      ),
    )
  }

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, updateNotes }}
    >
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
