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
        <img src={product.image} alt={product.name} className={styles.image} />
        <div className={styles.info}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>${product.price.toFixed(2)}</p>
        </div>
      </Link>
    </div>
  )
}
