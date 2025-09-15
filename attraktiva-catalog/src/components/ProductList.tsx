import { useMemo } from 'react';
import type { Product } from '../data/products';
import ProductCard from './ProductCard';
import styles from './ProductList.module.css';

interface ProductListProps {
  products: Product[];
  searchTerm?: string;
  filter?: string;
}

export default function ProductList({
  products,
  searchTerm = '',
  filter = 'all',
}: ProductListProps) {
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        switch (filter) {
          case 'under-10':
            matchesFilter = product.price < 10;
            break;
          case '10-20':
            matchesFilter = product.price >= 10 && product.price <= 20;
            break;
          case 'over-20':
            matchesFilter = product.price > 20;
            break;
          default:
            matchesFilter = true;
        }

        return matchesSearch && matchesFilter;
      }),
    [products, searchTerm, filter],
  );

  return (
    <div className={styles.list}>
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
