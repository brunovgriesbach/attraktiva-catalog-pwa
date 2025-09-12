import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="text-center">
      <h2 className="mb-4 text-2xl font-semibold">Bem-vindo ao Attraktiva</h2>
      <Link
        to="/catalog"
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        Ver Catálogo
      </Link>
    </div>
  )
}
