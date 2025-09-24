import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { fetchProducts } from '../api/products'
import { MAX_PRODUCT_IMAGES } from '../config/catalog'
import type { Product } from '../data/products'
import styles from './ProductDetail.module.css'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { addItem, items } = useCart()

  useEffect(() => {
    fetchProducts()
      .then((items) => {
        const found = items.find((p) => p.id === Number(id)) || null
        setProduct(found)
        setActiveImageIndex(0)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [product?.id])

  const galleryImages = useMemo(() => {
    if (!product) {
      return []
    }

    if (product.images.length > 0) {
      return product.images.slice(0, MAX_PRODUCT_IMAGES)
    }

    return product.image ? [product.image] : []
  }, [product])

  const activeImage = galleryImages[activeImageIndex] ?? galleryImages[0]
  const favorite = product ? isFavorite(product.id) : false
  const favoriteLabel = favorite
    ? 'Remover dos favoritos'
    : 'Adicionar aos favoritos'
  const isInCart = product ? items.some((item) => item.product.id === product.id) : false

  function handleFavoriteClick() {
    if (product) {
      toggleFavorite(product)
    }
  }

  function handleAddToCart() {
    if (product) {
      addItem(product)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <p>Product not found.</p>
        <Link to="/" className={styles.back}>
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.gallery}>
          {activeImage && (
            <div className={styles.mainImageWrapper}>
              <img
                src={activeImage}
                alt={product.name}
                className={styles.mainImage}
              />
            </div>
          )}
          {galleryImages.length > 1 && (
            <div className={styles.thumbnailList}>
              {galleryImages.map((imageUrl, index) => {
                const isActive = index === activeImageIndex

                return (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    className={styles.thumbnailButton}
                    data-active={isActive ? 'true' : 'false'}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`Ver imagem ${index + 1} de ${galleryImages.length}`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} - imagem ${index + 1}`}
                      className={styles.thumbnailImage}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div className={styles.info}>
          <div className={styles.header}>
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
            <h2 className={styles.name}>{product.name}</h2>
            <div className={styles.headerActions}>
              <Link
                to="/cart"
                className={styles.cartShortcut}
                aria-label="Ir para o carrinho"
                title="Ir para o carrinho"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 24 24"
                  className={styles.cartShortcutIcon}
                >
                  <path
                    d="M7.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-9.63-6.75a1.25 1.25 0 0 1-1.21-.92L3.28 5.88H2a.75.75 0 0 1 0-1.5h1.83c.56 0 1.05.38 1.21.92l.54 1.85h13.87a1.25 1.25 0 0 1 1.21 1.58l-1.35 4.74a2.25 2.25 0 0 1-2.16 1.67H6.87Z"
                    fill="currentColor"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <p className={styles.description}>{product.description}</p>
          <div className={styles.priceRow}>
            <button
              type="button"
              className={styles.addToCartIcon}
              data-active={isInCart ? 'true' : 'false'}
              onClick={handleAddToCart}
              disabled={isInCart}
              aria-pressed={isInCart}
              aria-label={
                isInCart ? 'Produto já está no carrinho' : 'Adicionar produto ao carrinho'
              }
              title={
                isInCart ? 'Produto já está no carrinho' : 'Adicionar produto ao carrinho'
              }
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                className={styles.addToCartIconSvg}
              >
                <path
                  d="M7.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-9.63-6.75a1.25 1.25 0 0 1-1.21-.92L3.28 5.88H2a.75.75 0 0 1 0-1.5h1.83c.56 0 1.05.38 1.21.92l.54 1.85h13.87a1.25 1.25 0 0 1 1.21 1.58l-1.35 4.74a2.25 2.25 0 0 1-2.16 1.67H6.87Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <p className={styles.price}>
              {typeof product.price === 'number'
                ? `R$ ${product.price.toFixed(2)}`
                : 'Preço indisponível'}
            </p>
          </div>
          {isInCart && (
            <p className={styles.cartStatus}>Produto no carrinho</p>
          )}
          <dl className={styles.details}>
            <div className={styles.detailItem}>
              <dt className={styles.detailLabel}>Fabricante</dt>
              <dd className={styles.detailValue}>
                {product.manufacturer || 'Não informado'}
              </dd>
            </div>
            <div className={styles.detailItem}>
              <dt className={styles.detailLabel}>Código do Fabricante</dt>
              <dd className={styles.detailValue}>
                {product.manufacturerCode || 'Não informado'}
              </dd>
            </div>
            <div className={styles.detailItem}>
              <dt className={styles.detailLabel}>Referência do Produto</dt>
              <dd className={styles.detailValue}>
                {product.productReference || 'Não informado'}
              </dd>
            </div>
          </dl>
          <Link to="/" className={styles.back}>
            Back to products
          </Link>
        </div>
      </div>
    </div>
  )
}
