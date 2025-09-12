import { useEffect, useState } from 'react';
import { getCart, clearCart } from '../lib/db';
import type { CartItem } from '../lib/db';

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const refresh = async () => setItems(await getCart());

  useEffect(() => {
    refresh();
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Cart</h2>
      {items.length === 0 && <p>Your cart is empty.</p>}
      {items.map((item) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <img src={item.thumbnailUrl} alt={item.title} style={{ width: '80px', height: '60px', objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <p>{item.title}</p>
            <p>
              {item.quantity} x ${item.price.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
      {items.length > 0 && (
        <>
          <p>Total: ${total.toFixed(2)}</p>
          <button
            onClick={async () => {
              await clearCart();
              await refresh();
            }}
          >
            Clear cart
          </button>
        </>
      )}
    </div>
  );
}
