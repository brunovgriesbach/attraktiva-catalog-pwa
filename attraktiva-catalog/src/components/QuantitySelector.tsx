import type { ChangeEvent } from 'react'
import styles from './QuantitySelector.module.css'

interface QuantitySelectorProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  disabled?: boolean
  decreaseLabel?: string
  increaseLabel?: string
}

function clamp(value: number, min: number, max?: number) {
  if (typeof max === 'number') {
    return Math.min(Math.max(value, min), max)
  }

  return Math.max(value, min)
}

export default function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
  decreaseLabel = 'Diminuir quantidade',
  increaseLabel = 'Aumentar quantidade',
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (disabled) {
      return
    }

    const nextValue = clamp(value - 1, min, max)
    if (nextValue !== value) {
      onChange(nextValue)
    }
  }

  const handleIncrease = () => {
    if (disabled) {
      return
    }

    const nextValue = clamp(value + 1, min, max)
    if (nextValue !== value) {
      onChange(nextValue)
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return
    }

    const raw = event.target.value
    const parsed = Number.parseInt(raw, 10)

    if (Number.isNaN(parsed)) {
      if (raw === '') {
        onChange(min)
      }
      return
    }

    const nextValue = clamp(parsed, min, max)
    if (nextValue !== value) {
      onChange(nextValue)
    }
  }

  return (
    <div className={styles.selector} aria-label="Selecionar quantidade">
      <button
        type="button"
        className={styles.button}
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        aria-label={decreaseLabel}
      >
        −
      </button>
      <input
        type="number"
        className={styles.input}
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        inputMode="numeric"
        pattern="[0-9]*"
        aria-live="polite"
        aria-label="Quantidade selecionada"
        disabled={disabled}
      />
      <button
        type="button"
        className={styles.button}
        onClick={handleIncrease}
        disabled={disabled || (typeof max === 'number' && value >= max)}
        aria-label={increaseLabel}
      >
        +
      </button>
    </div>
  )
}
