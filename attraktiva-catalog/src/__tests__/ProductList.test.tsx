import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, it, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

import ProductList from '../components/ProductList'
import type { Product } from '../data/products'

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Sofá Boreal',
    description: 'Sofá confortável para sala de estar',
    price: 2500,
    image: '/images/sofa.jpg',
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
})

describe('ProductList', () => {
  it('renders all products', () => {
    render(
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
        />
      </MemoryRouter>,
    )

    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })
  })

  it('filters by category, subcategory and search term', () => {
    render(
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
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Cama Lisboa')).toBeInTheDocument()
    expect(screen.queryByText('Sofá Boreal')).not.toBeInTheDocument()
    expect(screen.queryByText('Luminária Lunar')).not.toBeInTheDocument()
  })

  it('sorts products by price when requested', () => {
    render(
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
        />
      </MemoryRouter>,
    )

    const productHeadings = screen.getAllByRole('heading', { level: 3 })
    const renderedNames = productHeadings.map((heading) => heading.textContent ?? '')

    expect(renderedNames).toEqual([
      'Luminária Lunar',
      'Cama Lisboa',
      'Sofá Boreal',
    ])
  })
})
