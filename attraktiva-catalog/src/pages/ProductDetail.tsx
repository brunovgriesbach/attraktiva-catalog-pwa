import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchProducts } from '../api/products';
import type { Product } from '../data/products';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((items) => {
        const found = items.find((p) => p.id === Number(id)) || null;
        setProduct(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.container}>
        <p>Product not found.</p>
        <Link to="/" className={styles.back}>
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <img src={product.image} alt={product.name} className={styles.image} />
      <div className={styles.info}>
        <h2 className={styles.name}>{product.name}</h2>
        <p className={styles.description}>{product.description}</p>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <Link to="/" className={styles.back}>
          Back to products
        </Link>
      </div>
    </div>
  );
}
