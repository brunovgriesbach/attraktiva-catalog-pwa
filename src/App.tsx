import { Link, Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-gray-800 text-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between p-4">
          <h1 className="text-lg font-bold">
            <Link to="/">Attraktiva Catálogo</Link>
          </h1>
          <nav className="flex gap-4">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/catalog" className="hover:underline">
              Catálogo
            </Link>
            <Link to="/cart" className="hover:underline">
              Carrinho
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default App
