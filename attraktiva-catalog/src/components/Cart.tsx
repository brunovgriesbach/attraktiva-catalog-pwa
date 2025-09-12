import { useCart } from '../context/CartContext'

const Cart = () => {
  const { items, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return <p>Seu carrinho está vazio.</p>
  }

  return (
    <div>
      <h2>Carrinho</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} - R$ {item.price.toFixed(2)}{' '}
            <button onClick={() => removeItem(item.id)}>Remover</button>
          </li>
        ))}
      </ul>
      <button onClick={clearCart}>Limpar Carrinho</button>
    </div>
  )
}

export default Cart
