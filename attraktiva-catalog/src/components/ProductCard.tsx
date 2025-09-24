import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import styles from './ProductCard.module.css'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { addItem, items } = useCart()
  const coverImage = product.image || product.images[0] || ''
  const favorite = isFavorite(product.id)
  const favoriteLabel = favorite
    ? 'Remover dos favoritos'
    : 'Adicionar aos favoritos'
  const isInCart = items.some((item) => item.product.id === product.id)

  function handleFavoriteClick() {
    toggleFavorite(product)
  }

  function handleAddToCart() {
    addItem(product)
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
        <button
          type="button"
          onClick={handleAddToCart}
          className={styles.cartButton}
          disabled={isInCart}
        >
          {isInCart ? 'No carrinho' : 'Adicionar ao carrinho'}
        </button>
      </div>
    </div>
  )
}
