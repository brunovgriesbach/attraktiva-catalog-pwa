import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CategoryMenu from './CategoryMenu'

const mockCategories = [
  {
    id: 'living-room',
    name: 'Sala de Estar',
    subcategories: [
      { id: 'sofas', name: 'Sofás' },
      { id: 'mesas', name: 'Mesas' },
    ],
  },
  {
    id: 'bedroom',
    name: 'Quarto',
    subcategories: [{ id: 'camas', name: 'Camas' }],
  },
]

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('CategoryMenu', () => {
  it('notifies when categories and subcategories are selected', () => {
    const onCategorySelect = vi.fn()
    const onSubcategorySelect = vi.fn()

    render(
      <CategoryMenu
        categories={mockCategories}
        onCategorySelect={onCategorySelect}
        onSubcategorySelect={onSubcategorySelect}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sala de Estar' }))

    expect(onCategorySelect).toHaveBeenLastCalledWith('living-room')
    expect(onSubcategorySelect).toHaveBeenLastCalledWith(null)

    fireEvent.click(screen.getByRole('button', { name: 'Sofás' }))
    expect(onSubcategorySelect).toHaveBeenLastCalledWith('sofas')

    fireEvent.click(screen.getByRole('button', { name: 'Quarto' }))
    expect(onCategorySelect).toHaveBeenLastCalledWith('bedroom')
    expect(onSubcategorySelect).toHaveBeenLastCalledWith(null)
  })

  it('resets the selection when clicking the "Todas" button', () => {
    const onCategorySelect = vi.fn()
    const onSubcategorySelect = vi.fn()

    render(
      <CategoryMenu
        categories={mockCategories}
        onCategorySelect={onCategorySelect}
        onSubcategorySelect={onSubcategorySelect}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sala de Estar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sofás' }))

    fireEvent.click(screen.getByRole('button', { name: 'Todas' }))

    expect(onCategorySelect).toHaveBeenLastCalledWith(null)
    expect(onSubcategorySelect).toHaveBeenLastCalledWith(null)
  })
})
