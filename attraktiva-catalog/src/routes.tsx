import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/product/:id',
    element: <ProductDetail />,
  },
]);
