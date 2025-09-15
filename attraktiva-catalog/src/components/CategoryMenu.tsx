import styles from './CategoryMenu.module.css'

export interface CategoryGroup {
  name: string
  subcategories: string[]
}

interface CategoryMenuProps {
  categories: CategoryGroup[]
  selectedCategory: string | null
  selectedSubcategory: string | null
  onCategorySelect: (category: string | null) => void
  onSubcategorySelect: (subcategory: string | null) => void
}

export default function CategoryMenu({
  categories,
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
}: CategoryMenuProps) {
  const handleCategoryClick = (category: string | null) => {
    onCategorySelect(category)
    onSubcategorySelect(null)
  }

  const handleSubcategoryClick = (subcategory: string | null) => {
    onSubcategorySelect(subcategory)
  }

  return (
    <nav className={styles.menu} aria-label="Filtrar por categoria">
      <span className={styles.sectionTitle}>Categorias</span>
      {categories.length === 0 ? (
        <p className={styles.emptyState}>Nenhuma categoria disponível.</p>
      ) : (
        <div className={styles.categories}>
          <div className={styles.buttonsRow}>
            <button
              type="button"
              className={`${styles.button} ${
                selectedCategory === null ? styles.buttonActive : ''
              }`}
              onClick={() => handleCategoryClick(null)}
              aria-pressed={selectedCategory === null}
            >
              Todas as categorias
            </button>
          </div>
          {categories.map(({ name, subcategories }) => {
            const isActiveCategory = name === selectedCategory
            return (
              <div key={name} className={styles.categoryGroup}>
                <div className={styles.categoryHeader}>
                  <button
                    type="button"
                    className={`${styles.button} ${
                      isActiveCategory ? styles.buttonActive : ''
                    }`}
                    onClick={() => handleCategoryClick(name)}
                    aria-pressed={isActiveCategory}
                  >
                    {name}
                  </button>
                </div>
                {isActiveCategory && subcategories.length > 0 && (
                  <div className={styles.subcategories}>
                    <button
                      type="button"
                      className={`${styles.button} ${
                        selectedSubcategory === null ? styles.buttonActive : ''
                      }`}
                      onClick={() => handleSubcategoryClick(null)}
                      aria-pressed={selectedSubcategory === null}
                    >
                      Todas
                    </button>
                    {subcategories.map((subcategory) => {
                      const isActiveSubcategory =
                        subcategory === selectedSubcategory
                      return (
                        <button
                          key={subcategory}
                          type="button"
                          className={`${styles.button} ${
                            isActiveSubcategory ? styles.buttonActive : ''
                          }`}
                          onClick={() => handleSubcategoryClick(subcategory)}
                          aria-pressed={isActiveSubcategory}
                        >
                          {subcategory}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </nav>
  )
}
