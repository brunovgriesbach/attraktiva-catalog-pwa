import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './routes'
import { CartProvider } from './context/CartContext'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js'
    navigator.serviceWorker.register(swUrl).then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        installingWorker?.addEventListener('statechange', () => {
          if (
            installingWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            alert('Nova versão disponível. Recarregue para atualizar.')
          }
        })
      }
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </StrictMode>,
)
