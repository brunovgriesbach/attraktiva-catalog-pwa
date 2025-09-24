import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import styles from './ProductCard.module.css'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'
import QuantitySelector from './QuantitySelector'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { addItem, removeItem, items } = useCart()
  const [quantity, setQuantity] = useState(1)
  const coverImage = product.image || product.images[0] || ''
  const favorite = isFavorite(product.id)
  const favoriteLabel = favorite
    ? 'Remover dos favoritos'
    : 'Adicionar aos favoritos'
  const cartItem = items.find((item) => item.product.id === product.id)
  const isInCart = Boolean(cartItem)
  const buttonLabel = isInCart ? 'Adicionar mais' : 'Adicionar ao carrinho'
  const cartToggleLabel = isInCart ? 'Remover do carrinho' : 'Adicionar ao carrinho'

  function handleFavoriteClick() {
    toggleFavorite(product)
  }

  function handleAddToCart() {
    addItem(product, quantity)
    setQuantity(1)
  }

  function handleCartToggle() {
    if (isInCart) {
      removeItem(product.id)
      setQuantity(1)
      return
    }

    addItem(product, quantity)
    setQuantity(1)
  }

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.favoriteButton}
        data-active={favorite ? 'true' : 'false'}
        onClick={handleFavoriteClick}
        aria-pressed={favorite}
        aria-label={favoriteLabel}
        title={favoriteLabel}
      >
        {favorite ? '★' : '☆'}
      </button>
      <div className={styles.mediaArea}>
        <Link to={`/product/${product.id}`} className={styles.link}>
          <div className={styles.imageContainer}>
            <img src={coverImage} alt={product.name} className={styles.image} />
            <span className={styles.productId}>{product.id}</span>
            <div className={styles.nameOverlay}>
              <h3 className={styles.name}>{product.name}</h3>
            </div>
          </div>
        </Link>
        <button
          type="button"
          className={styles.cartOverlayButton}
          data-active={isInCart ? 'true' : 'false'}
          onClick={handleCartToggle}
          aria-pressed={isInCart}
          aria-label={cartToggleLabel}
          title={cartToggleLabel}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
            className={styles.cartOverlayIcon}
          >
            <path
              d="M7.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-9.63-6.75a1.25 1.25 0 0 1-1.21-.92L3.28 5.88H2a.75.75 0 0 1 0-1.5h1.83c.56 0 1.05.38 1.21.92l.54 1.85h13.87a1.25 1.25 0 0 1 1.21 1.58l-1.35 4.74a2.25 2.25 0 0 1-2.16 1.67H6.87Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      <div className={styles.actions}>
        <div className={styles.actionRow}>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            decreaseLabel="Diminuir quantidade do produto"
            increaseLabel="Aumentar quantidade do produto"
          />
          <button
            type="button"
            onClick={handleAddToCart}
            className={styles.cartButton}
          >
            {buttonLabel}
          </button>
        </div>
        {cartItem && (
          <span className={styles.cartInfo}>
            No carrinho: <strong>{cartItem.quantity}</strong>
          </span>
        )}
      </div>
    </div>
  )
}
