import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, it, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

import ProductList from '../components/ProductList'
import type { Product } from '../data/products'
import { FavoritesProvider } from '../context/FavoritesContext'

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

describe('ProductList', () => {
  it('renders all products', () => {
    render(
      <FavoritesProvider>
        <MemoryRouter>
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
          />
        </MemoryRouter>
      </FavoritesProvider>,
    )

    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })
  })

  it('filters by category, subcategory and search term', () => {
    render(
      <FavoritesProvider>
        <MemoryRouter>
          <ProductList
            products={mockProducts}
            searchTerm="queen"
            category="Quarto"
            subcategory="Camas"
            sortOrder="default"
            manufacturer="Dream"
            manufacturerCode="DW-200"
            productReference="REF-CAMA"
            onlyFavorites={false}
          />
        </MemoryRouter>
      </FavoritesProvider>,
    )

    expect(screen.getByText('Cama Lisboa')).toBeInTheDocument()
    expect(screen.queryByText('Sofá Boreal')).not.toBeInTheDocument()
    expect(screen.queryByText('Luminária Lunar')).not.toBeInTheDocument()
  })

  it('sorts products by price when requested', () => {
    render(
      <FavoritesProvider>
        <MemoryRouter>
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
          />
        </MemoryRouter>
      </FavoritesProvider>,
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

    render(
      <FavoritesProvider>
        <MemoryRouter>
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
          />
        </MemoryRouter>
      </FavoritesProvider>,
    )

    expect(screen.getByText('Cama Lisboa')).toBeInTheDocument()
    expect(screen.queryByText('Sofá Boreal')).not.toBeInTheDocument()
    expect(screen.queryByText('Luminária Lunar')).not.toBeInTheDocument()
  })

  it('permite alternar favoritos diretamente no catálogo', async () => {
    const user = userEvent.setup()

    render(
      <FavoritesProvider>
        <MemoryRouter>
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
          />
        </MemoryRouter>
      </FavoritesProvider>,
    )

    const favoriteButtons = screen.getAllByRole('button', {
      name: 'Adicionar aos favoritos',
    })

    expect(favoriteButtons).toHaveLength(mockProducts.length)

    const firstFavoriteButton = favoriteButtons[0]

    await user.click(firstFavoriteButton)

    expect(firstFavoriteButton).toHaveAttribute('aria-pressed', 'true')
    expect(firstFavoriteButton).toHaveTextContent('★')

    await user.click(firstFavoriteButton)

    expect(firstFavoriteButton).toHaveAttribute('aria-pressed', 'false')
    expect(firstFavoriteButton).toHaveTextContent('☆')
  })
})
