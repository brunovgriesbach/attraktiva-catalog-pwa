import localforage from 'localforage';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  thumbnailUrl: string;
  quantity: number;
}

const store = localforage.createInstance({ name: 'attraktiva', storeName: 'cart' });
const CART_KEY = 'cart';

async function setCart(items: CartItem[]): Promise<void> {
  await store.setItem(CART_KEY, items);
}

export async function getCart(): Promise<CartItem[]> {
  return (await store.getItem<CartItem[]>(CART_KEY)) || [];
}

export async function addToCart(item: CartItem): Promise<void> {
  const cart = await getCart();
  const existing = cart.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  await setCart(cart);
}

export async function clearCart(): Promise<void> {
  await setCart([]);
}
