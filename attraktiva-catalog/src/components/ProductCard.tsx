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
  const { addItem, items } = useCart()
  const [quantity, setQuantity] = useState(1)
  const coverImage = product.image || product.images[0] || ''
  const favorite = isFavorite(product.id)
  const favoriteLabel = favorite
    ? 'Remover dos favoritos'
    : 'Adicionar aos favoritos'
  const cartItem = items.find((item) => item.product.id === product.id)
  const isInCart = Boolean(cartItem)
  const buttonLabel = isInCart ? 'Adicionar mais' : 'Adicionar ao carrinho'

  function handleFavoriteClick() {
    toggleFavorite(product)
  }

  function handleAddToCart() {
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
      <Link to={`/product/${product.id}`} className={styles.link}>
        <div className={styles.imageContainer}>
          <img src={coverImage} alt={product.name} className={styles.image} />
          <span className={styles.productId}>{product.id}</span>
          <div className={styles.nameOverlay}>
            <h3 className={styles.name}>{product.name}</h3>
          </div>
        </div>
      </Link>
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
