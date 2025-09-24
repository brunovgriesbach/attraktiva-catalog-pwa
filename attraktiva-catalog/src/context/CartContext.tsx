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
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem(product: Product, quantity?: number): void
  removeItem(id: number): void
  clearCart(): void
  updateNotes(id: number, notes: string): void
  updateQuantity(id: number, quantity: number): void
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
          const candidate = item as {
            product: Product
            notes?: string
            quantity?: number
          }
          return {
            product: candidate.product,
            notes: candidate.notes ?? '',
            quantity: Math.max(1, Math.floor(candidate.quantity ?? 1)),
          }
        }

        const product = item as Product
        return {
          product,
          notes: '',
          quantity: 1,
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

  const normalizeQuantity = (quantity?: number) => {
    if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
      return 1
    }

    return Math.max(1, Math.floor(quantity))
  }

  const addItem = (product: Product, quantity?: number) => {
    const amount = normalizeQuantity(quantity)

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id)
      if (existingIndex !== -1) {
        const next = [...prev]
        const current = next[existingIndex]
        next[existingIndex] = {
          ...current,
          quantity: current.quantity + amount,
        }
        return next
      }

      return [...prev, { product, notes: '', quantity: amount }]
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

  const updateQuantity = (id: number, quantity: number) => {
    const amount = normalizeQuantity(quantity)

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === id
          ? {
              ...item,
              quantity: amount,
            }
          : item,
      ),
    )
  }

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, updateNotes, updateQuantity }}
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
