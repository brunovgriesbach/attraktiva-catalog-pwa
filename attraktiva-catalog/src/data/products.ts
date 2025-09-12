export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Product 1',
    description: 'Description for product 1',
    price: 9.99,
    image: '/images/product1.jpg',
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'Description for product 2',
    price: 19.99,
    image: '/images/product2.jpg',
  },
];
