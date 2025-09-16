import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className={styles.card}>
      <Link to={`/product/${product.id}`} className={styles.link}>
        <div className={styles.imageContainer}>
          <img src={product.image} alt={product.name} className={styles.image} />
          <span className={styles.productId}>{product.id}</span>
        </div>
        <div className={styles.info}>
          <h3 className={styles.name}>{product.name}</h3>
        </div>
      </Link>
    </div>
  )
}
