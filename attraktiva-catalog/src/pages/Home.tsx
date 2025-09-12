import ProductList from '../components/ProductList'
import { products } from '../data/products'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Products</h1>
      <ProductList products={products} />
    </div>
  )
}
