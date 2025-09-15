import { useMemo, useState } from 'react'

type Subcategory = {
  id: string
  name: string
}

type Category = {
  id: string
  name: string
  subcategories?: Subcategory[]
}

interface CategoryMenuProps {
  categories: Category[]
  onCategorySelect: (categoryId: string | null) => void
  onSubcategorySelect: (subcategoryId: string | null) => void
}

export default function CategoryMenu({
  categories,
  onCategorySelect,
  onSubcategorySelect,
}: CategoryMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategory),
    [categories, selectedCategory],
  )

  function handleSelectAll() {
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    onCategorySelect(null)
    onSubcategorySelect(null)
  }

  function handleCategoryClick(category: Category) {
    setSelectedCategory(category.id)
    setSelectedSubcategory(null)
    onCategorySelect(category.id)
    onSubcategorySelect(null)
  }

  function handleSubcategoryClick(subcategory: Subcategory) {
    setSelectedSubcategory(subcategory.id)
    onSubcategorySelect(subcategory.id)
  }

  return (
    <nav aria-label="Categorias">
      <div role="menubar">
        <button
          type="button"
          onClick={handleSelectAll}
          aria-pressed={selectedCategory === null}
        >
          Todas
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryClick(category)}
            aria-pressed={selectedCategory === category.id}
          >
            {category.name}
          </button>
        ))}
      </div>
      {activeCategory?.subcategories?.length ? (
        <div role="menu">
          {activeCategory.subcategories.map((subcategory) => (
            <button
              key={subcategory.id}
              type="button"
              onClick={() => handleSubcategoryClick(subcategory)}
              aria-pressed={selectedSubcategory === subcategory.id}
            >
              {subcategory.name}
            </button>
          ))}
        </div>
      ) : null}
    </nav>
  )
}
