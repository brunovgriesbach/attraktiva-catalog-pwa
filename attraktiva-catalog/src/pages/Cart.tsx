import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Cart.module.css'
import { useCart } from '../context/CartContext'
import QuantitySelector from '../components/QuantitySelector'

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== 'number') {
    return 'Preço indisponível'
  }

  return `R$ ${value.toFixed(2)}`
}

export default function Cart() {
  const { items, removeItem, clearCart, updateNotes, updateQuantity } = useCart()
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})
  const [vendorEmail, setVendorEmail] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return window.localStorage.getItem('cartVendorEmail') ?? ''
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem('cartVendorEmail', vendorEmail)
  }, [vendorEmail])

  const hasItems = items.length > 0
  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )
  const totalValue = useMemo(
    () =>
      items.reduce((total, item) => {
        const price = item.product.price
        if (typeof price === 'number') {
          return total + price * item.quantity
        }
        return total
      }, 0),
    [items],
  )

  function handleNoteChange(event: ChangeEvent<HTMLTextAreaElement>, id: number) {
    updateNotes(id, event.target.value)
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setVendorEmail(event.target.value)
  }

  function handleToggleDetails(productId: number) {
    setExpandedItems((previous) => ({
      ...previous,
      [productId]: !previous[productId],
    }))
  }

  function handleSendQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!hasItems) {
      return
    }

    const lines = items.map((item, index) => {
      const { product, notes, quantity } = item
      const noteText = notes.trim().length > 0 ? `\nObservações: ${notes.trim()}` : ''
      const priceText =
        typeof product.price === 'number'
          ? `\nPreço unitário: ${formatCurrency(product.price)}\nSubtotal: ${formatCurrency(
              product.price * quantity,
            )}`
          : ''
      return `${index + 1}. ${product.name} (ID: ${product.id})\nQuantidade: ${quantity}${priceText}${noteText}`
    })

    const summary = [`Itens selecionados: ${totalItems}`, `Valor estimado: ${formatCurrency(totalValue)}`]

    const body = encodeURIComponent(
      `${lines.join('\n\n')}\n\n${summary.join('\n')}\n\nEnviado automaticamente pelo catálogo Attraktiva.`,
    )
    const subject = encodeURIComponent('Pedido de orçamento - Catálogo Attraktiva')
    const email = encodeURIComponent(vendorEmail.trim())
    const mailto = `mailto:${email}?subject=${subject}&body=${body}`

    if (typeof window !== 'undefined') {
      window.location.href = mailto
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Carrinho de compras</h1>
          <p className={styles.subtitle}>
            Selecione os produtos para organizar seus pedidos e enviar um orçamento rapidamente.
          </p>
        </div>
        <Link to="/" className={styles.backToCatalog}>
          Voltar para o catálogo
        </Link>
      </header>

      {!hasItems && (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            Seu carrinho está vazio. Explore o catálogo e adicione itens para começar um orçamento.
          </p>
          <Link to="/" className={styles.emptyButton}>
            Ver produtos
          </Link>
        </div>
      )}

      {hasItems && (
        <>
          <div className={styles.gallery}>
            {items.map((item) => {
              const { product, notes, quantity } = item
              const image = product.image || product.images[0] || ''
              const manufacturer = product.manufacturer || 'Não informado'
              const productReference = product.productReference || 'Não informado'
              const isExpanded = expandedItems[product.id] ?? false

              return (
                <article key={product.id} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    {image ? (
                      <img src={image} alt={product.name} className={styles.image} />
                    ) : (
                      <div className={styles.placeholder} aria-hidden="true">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.productName} title={product.name}>
                        {product.name}
                      </h2>
                    </div>
                    <button
                      type="button"
                      className={styles.toggleInfoButton}
                      onClick={() => handleToggleDetails(product.id)}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? 'Ocultar informações' : 'Ver informações'}
                    </button>
                    {isExpanded && (
                      <ul className={styles.metaList}>
                        <li>
                          <span className={styles.metaLabel}>ID</span>
                          <span className={styles.metaValue}>#{product.id}</span>
                        </li>
                        <li>
                          <span className={styles.metaLabel}>Fabricante</span>
                          <span className={styles.metaValue} title={manufacturer}>
                            {manufacturer}
                          </span>
                        </li>
                        <li>
                          <span className={styles.metaLabel}>Referência</span>
                          <span className={styles.metaValue} title={productReference}>
                            {productReference}
                          </span>
                        </li>
                      </ul>
                    )}
                    <div className={styles.purchaseRow}>
                      {isExpanded && (
                        <div className={styles.priceBlock}>
                          <span className={styles.priceLabel}>Preço unitário</span>
                          <span className={styles.priceValue}>{formatCurrency(product.price)}</span>
                          {typeof product.price === 'number' && (
                            <span className={styles.lineTotal}>
                              Total: {formatCurrency(product.price * quantity)}
                            </span>
                          )}
                        </div>
                      )}
                      <div className={styles.quantitySection}>
                        <div className={styles.quantityBlock}>
                          <span className={styles.quantityLabel}>Quantidade</span>
                          <QuantitySelector
                            value={quantity}
                            onChange={(nextQuantity) => updateQuantity(product.id, nextQuantity)}
                            decreaseLabel={`Diminuir quantidade de ${product.name}`}
                            increaseLabel={`Aumentar quantidade de ${product.name}`}
                          />
                        </div>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => removeItem(product.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                    <label className={styles.notesLabel} htmlFor={`notes-${product.id}`}>
                      Observações para o vendedor
                    </label>
                    <textarea
                      id={`notes-${product.id}`}
                      className={styles.notes}
                      placeholder="Informe medidas especiais, acabamentos ou detalhes combinados com o cliente."
                      value={notes}
                      onChange={(event) => handleNoteChange(event, product.id)}
                      rows={3}
                    />
                  </div>
                </article>
              )
            })}
          </div>

          <form className={styles.summary} onSubmit={handleSendQuote}>
            <div className={styles.summaryInfo}>
              <h2 className={styles.summaryTitle}>Resumo do pedido</h2>
              <p className={styles.summaryItem}>
                <span>Itens selecionados</span>
                <strong>{totalItems}</strong>
              </p>
              <p className={styles.summaryItem}>
                <span>Valor estimado</span>
                <strong>{formatCurrency(totalValue)}</strong>
              </p>
              <button type="button" className={styles.clearButton} onClick={clearCart}>
                Limpar carrinho
              </button>
            </div>
            <div className={styles.summaryActions}>
              <label className={styles.emailLabel} htmlFor="vendorEmail">
                Receba o orçamento por e-mail
              </label>
              <input
                id="vendorEmail"
                name="vendorEmail"
                type="email"
                value={vendorEmail}
                onChange={handleEmailChange}
                placeholder="seuemail@empresa.com"
                className={styles.emailInput}
              />
              <p className={styles.emailHint}>
                Vamos montar um e-mail com todos os itens selecionados para você revisar e enviar ao cliente.
              </p>
              <button type="submit" className={styles.sendButton}>
                Enviar para orçamento
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
