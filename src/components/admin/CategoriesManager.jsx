import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiRequest } from '../../utils/api.js';
import VisibilitySwitch from './VisibilitySwitch.jsx';

function CategoriesManager() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/api/categories?all=true', { token: user.token })
      .then(setCategories)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [user.token]);

  const toggleVisibility = async (category, visible) => {
    setError('');
    try {
      const updated = await apiRequest(`/api/categories/${category.id}/visibility`, {
        method: 'PATCH',
        token: user.token,
        body: JSON.stringify({ visible }),
      });
      setCategories((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return <div className="mx-auto max-w-4xl">
    <div className="mb-7"><p className="text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">CATÁLOGO</p><h1 className="mt-1 font-display text-3xl font-extrabold">Categorías</h1><p className="mt-2 text-sm text-gray-500">Controlá qué categorías aparecen en el menú público.</p></div>
    {loading && <p className="py-6 text-sm text-gray-500">Cargando categorías...</p>}
    {error && <p role="alert" className="mb-4 text-sm font-semibold text-brand-red">{error}</p>}
    {!loading && !error && categories.length === 0 && <p className="py-6 text-sm text-gray-500">No hay categorías para mostrar.</p>}
    <div className="divide-y divide-gray-200 border-y border-gray-200">
      {categories.map((category) => <article key={category.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          {category.isVisible ? <Eye size={18} className="text-green-700" /> : <EyeOff size={18} className="text-gray-400" />}
          <div><h2 className="font-bold">{category.name}</h2><p className="mt-0.5 text-xs text-gray-500">Orden {category.sortOrder}</p></div>
        </div>
        <VisibilitySwitch
          checked={category.isVisible}
          label={`${category.isVisible ? 'Ocultar' : 'Mostrar'} ${category.name}`}
          onChange={(visible) => toggleVisibility(category, visible)}
        />
      </article>)}
    </div>
  </div>;
}

export default CategoriesManager;