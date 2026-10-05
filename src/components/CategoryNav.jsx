import { useEffect, useState } from 'react';
import { categories as defaultCategories } from '../data/products.js';

function CategoryNav({ categories = defaultCategories }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);

  useEffect(() => {
    if (!categories.some((category) => category.id === activeCategory)) {
      setActiveCategory(categories[0]?.id);
    }
  }, [activeCategory, categories]);

  const navigateTo = (categoryId) => {
    setActiveCategory(categoryId);
    document.getElementById(categoryId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur" aria-label="Categorías del menú">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 sm:gap-4 sm:px-6">
        {categories.map((category) => (
          <button
            className={`shrink-0 border-b-2 px-3 py-4 text-sm font-bold transition ${activeCategory === category.id ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-600 hover:text-brand-green-dark'}`}
            key={category.id}
            onClick={() => navigateTo(category.id)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default CategoryNav;