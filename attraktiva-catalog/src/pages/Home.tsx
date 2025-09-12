import ProductList from '../components/ProductList'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Products</h1>
      <ProductList />
    </div>
  )
}
