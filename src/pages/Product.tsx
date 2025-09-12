import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addToCart } from '../lib/db';

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  category: string;
  thumbnailUrl: string;
  images: string[];
  dimensions: { width: number; height: number; depth: number };
  materials: string[];
  stock: number;
  description: string;
}

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch('/products.json')
      .then((res) => res.json())
      .then((items: Product[]) => items.find((p) => p.slug === slug))
      .then(setProduct);
  }, [slug]);

  if (!product) return <p style={{ padding: '1rem' }}>Loading...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {product.images.map((img) => (
            <img key={img} src={img} alt={product.title} style={{ width: '300px', objectFit: 'cover' }} />
          ))}
        </div>
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <p>
          {product.dimensions.width}x{product.dimensions.height}x{product.dimensions.depth} cm
        </p>
        <p>Materials: {product.materials.join(', ')}</p>
        <p>In stock: {product.stock}</p>
        <p style={{ fontWeight: 'bold' }}>${product.price.toFixed(2)}</p>
        <button
          onClick={async () => {
            await addToCart({
              id: product.id,
              title: product.title,
              price: product.price,
              thumbnailUrl: product.thumbnailUrl,
              quantity: 1,
            });
            alert('Added to cart');
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
