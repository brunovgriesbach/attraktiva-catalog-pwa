import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, it, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import type { ReactNode } from 'react'

import ProductList from '../components/ProductList'
import type { Product } from '../data/products'
import { FavoritesProvider } from '../context/FavoritesContext'
import { CartProvider } from '../context/CartContext'

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Sofá Boreal',
    description: 'Sofá confortável para sala de estar',
    price: 2500,
    image: '/images/sofa.jpg',
    images: ['/images/sofa.jpg', '/images/sofa-alt.jpg'],
    category: 'Sala de Estar',
    subcategory: 'Sofás',
    manufacturer: 'ConfortHome',
    manufacturerCode: 'CH-001',
    productReference: 'REF-SOFA-01',
  },
  {
    id: 2,
    name: 'Cama Lisboa',
    description: 'Cama queen-size estofada',
    price: 1500,
    image: '/images/cama.jpg',
    images: ['/images/cama.jpg'],
    category: 'Quarto',
    subcategory: 'Camas',
    manufacturer: 'DreamWorks',
    manufacturerCode: 'DW-200',
    productReference: 'REF-CAMA-02',
  },
  {
    id: 3,
    name: 'Luminária Lunar',
    description: 'Luminária de piso com iluminação suave',
    price: 350,
    image: '/images/luminaria.jpg',
    images: ['/images/luminaria.jpg'],
    category: 'Iluminação',
    subcategory: 'Luminárias',
    manufacturer: 'BrightIdeas',
    manufacturerCode: 'BI-900',
    productReference: 'REF-LUZ-03',
  },
]

expect.extend(matchers)

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function renderWithProviders(ui: ReactNode) {
  return render(
    <FavoritesProvider>
      <CartProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </CartProvider>
    </FavoritesProvider>,
  )
}

describe('ProductList', () => {
  it('renders all products', () => {
    renderWithProviders(
      <ProductList
        products={mockProducts}
        searchTerm=""
        category=""
        subcategory=""
        sortOrder="default"
        manufacturer=""
        manufacturerCode=""
        productReference=""
        onlyFavorites={false}
      />,
    )

    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })
  })

  it('filters by category, subcategory and search term', () => {
    renderWithProviders(
      <ProductList
        products={mockProducts}
        searchTerm="Lisboa"
        category="Quarto"
        subcategory="Camas"
        sortOrder="default"
        manufacturer="Dream"
        manufacturerCode="DW-200"
        productReference="REF-CAMA"
        onlyFavorites={false}
      />,
    )

    expect(screen.getByText('Cama Lisboa')).toBeInTheDocument()
    expect(screen.queryByText('Sofá Boreal')).not.toBeInTheDocument()
    expect(screen.queryByText('Luminária Lunar')).not.toBeInTheDocument()
  })

  it('supports fuzzy search when the user makes small typos', () => {
    renderWithProviders(
      <ProductList
        products={mockProducts}
        searchTerm="sofaa"
        category=""
        subcategory=""
        sortOrder="default"
        manufacturer=""
        manufacturerCode=""
        productReference=""
        onlyFavorites={false}
      />,
    )

    expect(screen.getByText('Sofá Boreal')).toBeInTheDocument()
    expect(screen.queryByText('Cama Lisboa')).not.toBeInTheDocument()
    expect(screen.queryByText('Luminária Lunar')).not.toBeInTheDocument()
  })

  it('ignores matches that occur only in the product description', () => {
    renderWithProviders(
      <ProductList
        products={mockProducts}
        searchTerm="confortável"
        category=""
        subcategory=""
        sortOrder="default"
        manufacturer=""
        manufacturerCode=""
        productReference=""
        onlyFavorites={false}
      />,
    )

    expect(screen.queryByText('Sofá Boreal')).not.toBeInTheDocument()
    expect(screen.queryByText('Cama Lisboa')).not.toBeInTheDocument()
    expect(screen.queryByText('Luminária Lunar')).not.toBeInTheDocument()
  })

  it('sorts products by price when requested', () => {
    renderWithProviders(
      <ProductList
        products={mockProducts}
        searchTerm=""
        category=""
        subcategory=""
        sortOrder="price-asc"
        manufacturer=""
        manufacturerCode=""
        productReference=""
        onlyFavorites={false}
      />,
    )

    const productHeadings = screen.getAllByRole('heading', { level: 3 })
    const renderedNames = productHeadings.map((heading) => heading.textContent ?? '')

    expect(renderedNames).toEqual([
      'Luminária Lunar',
      'Cama Lisboa',
      'Sofá Boreal',
    ])
  })

  it('shows only favorite products when filtering favorites', () => {
    localStorage.setItem('favorites', JSON.stringify([mockProducts[1]]))

    renderWithProviders(
      <ProductList
        products={mockProducts}
        searchTerm=""
        category=""
        subcategory=""
        sortOrder="default"
        manufacturer=""
        manufacturerCode=""
        productReference=""
        onlyFavorites={true}
      />,
    )

    expect(screen.getByText('Cama Lisboa')).toBeInTheDocument()
    expect(screen.queryByText('Sofá Boreal')).not.toBeInTheDocument()
    expect(screen.queryByText('Luminária Lunar')).not.toBeInTheDocument()
  })

  it('permite alternar favoritos diretamente no catálogo', async () => {
    renderWithProviders(
      <ProductList
        products={mockProducts}
        searchTerm=""
        category=""
        subcategory=""
        sortOrder="default"
        manufacturer=""
        manufacturerCode=""
        productReference=""
        onlyFavorites={false}
      />,
    )

    const favoriteButtons = screen.getAllByRole('button', {
      name: 'Adicionar aos favoritos',
    })

    expect(favoriteButtons).toHaveLength(mockProducts.length)

    const firstFavoriteButton = favoriteButtons[0]

    fireEvent.click(firstFavoriteButton)

    expect(firstFavoriteButton).toHaveAttribute('aria-pressed', 'true')
    expect(firstFavoriteButton).toHaveTextContent('★')

    fireEvent.click(firstFavoriteButton)

    expect(firstFavoriteButton).toHaveAttribute('aria-pressed', 'false')
    expect(firstFavoriteButton).toHaveTextContent('☆')
  })
})
