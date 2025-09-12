import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  category: string;
  thumbnailUrl: string;
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/products.json')
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const filtered = products.filter(
    (p) =>
      (category === 'all' || p.category === category) &&
      p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.slug}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              border: '1px solid #ddd',
              padding: '1rem',
            }}
          >
            <img
              src={p.thumbnailUrl}
              alt={p.title}
              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
            />
            <h3>{p.title}</h3>
            <p>${p.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
