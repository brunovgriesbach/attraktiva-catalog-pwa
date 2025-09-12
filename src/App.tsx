import { Link, Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/">Catalog</Link> | <Link to="/cart">Cart</Link>
      </nav>
      <Outlet />
    </div>
  );
}
