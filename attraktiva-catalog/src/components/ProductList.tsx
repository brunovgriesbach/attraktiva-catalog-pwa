import type { Product } from '../data/products'
import ProductCard from './ProductCard'
import styles from './ProductList.module.css'

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className={styles.list}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
