import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Offline from './pages/Offline';

function Home() {
  return <h1>Attraktiva Catálogo</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/offline" element={<Offline />} />
      </Routes>
    </BrowserRouter>
  );
}
