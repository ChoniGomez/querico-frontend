import { useEffect, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiRequest } from '../../utils/api.js';
import VisibilitySwitch from './VisibilitySwitch.jsx';

function CategoriesManager() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para Modal de Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', displayOrder: 1, isVisible: true });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para Modal de Eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest('/api/categories?all=true', { token: user.token });
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => (a.displayOrder ?? a.sortOrder ?? 0) - (b.displayOrder ?? b.sortOrder ?? 0),
      );
      setCategories(sorted);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchCategories();
    }
  }, [user?.token]);

  // Manejo de visibilidad (Switch)
  const toggleVisibility = async (category, visible) => {
    setError('');
    try {
      const updated = await apiRequest(`/api/categories/${category.id}`, {
        method: 'PUT',
        token: user.token,
        body: JSON.stringify({ isVisible: visible }),
      });
      setCategories((current) =>
        current.map((item) => (item.id === category.id ? { ...item, ...updated, isVisible: visible } : item)),
      );
    } catch (requestError) {
      setError(requestError.message || 'No se pudo actualizar la visibilidad.');
    }
  };

  // Abrir modal de creación
  const openCreateModal = () => {
    const nextOrder = categories.reduce(
      (max, c) => Math.max(max, Number(c.displayOrder ?? c.sortOrder ?? 0)),
      0,
    ) + 1;

    setEditingCategory(null);
    setForm({
      name: '',
      displayOrder: nextOrder,
      isVisible: true,
    });
    setFormError('');
    setModalOpen(true);
  };

  // Abrir modal de edición
  const openEditModal = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      displayOrder: category.displayOrder ?? category.sortOrder ?? 1,
      isVisible: category.isVisible ?? true,
    });
    setFormError('');
    setModalOpen(true);
  };

  // Guardar (Crear o Modificar)
  const handleSaveCategory = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setFormError('El nombre de la categoría es obligatorio.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      if (editingCategory) {
        // Actualizar
        const updated = await apiRequest(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          token: user.token,
          body: JSON.stringify({
            name: form.name.trim(),
            displayOrder: Number(form.displayOrder),
            isVisible: form.isVisible,
          }),
        });

        setCategories((current) =>
          current
            .map((item) => (item.id === editingCategory.id ? { ...item, ...updated } : item))
            .sort((a, b) => (a.displayOrder ?? a.sortOrder ?? 0) - (b.displayOrder ?? b.sortOrder ?? 0)),
        );
      } else {
        // Crear
        const created = await apiRequest('/api/categories', {
          method: 'POST',
          token: user.token,
          body: JSON.stringify({
            name: form.name.trim(),
            displayOrder: Number(form.displayOrder),
            isVisible: form.isVisible,
          }),
        });

        setCategories((current) =>
          [...current, created].sort(
            (a, b) => (a.displayOrder ?? a.sortOrder ?? 0) - (b.displayOrder ?? b.sortOrder ?? 0),
          ),
        );
      }
      setModalOpen(false);
    } catch (requestError) {
      setFormError(requestError.message || 'Error al guardar la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir confirmación de eliminación
  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      await apiRequest(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        token: user.token,
      });

      setCategories((current) => current.filter((item) => item.id !== categoryToDelete.id));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (requestError) {
      setDeleteError(requestError.message || 'No se pudo eliminar la categoría.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Encabezado con Botón de Agregar Categoría */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">CATÁLOGO</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Categorías</h1>
          <p className="mt-2 text-sm text-gray-500">Controlá qué categorías aparecen en el menú público.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Agregar categoría
        </button>
      </div>

      {loading && <p className="py-6 text-sm text-gray-500">Cargando categorías...</p>}
      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-semibold text-brand-red">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm font-semibold text-gray-600">No hay categorías registradas.</p>
          <p className="mt-1 text-xs text-gray-400">Comenzá creando tu primera categoría con el botón de arriba.</p>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {categories.map((category) => (
          <article
            key={category.id}
            className="flex flex-wrap items-center justify-between gap-4 py-4 transition hover:bg-gray-50/70"
          >
            {/* Indicador de visibilidad, título y orden */}
            <div className="flex items-center gap-3">
              {category.isVisible ? (
                <Eye size={18} className="shrink-0 text-green-700" title="Visible en catálogo público" />
              ) : (
                <EyeOff size={18} className="shrink-0 text-gray-400" title="Oculto en catálogo público" />
              )}
              <div>
                <h2 className="font-bold text-gray-900">{category.name}</h2>
                <p className="mt-0.5 text-xs text-gray-500">Orden {category.displayOrder ?? category.sortOrder ?? 0}</p>
              </div>
            </div>

            {/* Switch de visibilidad y acciones secundarias */}
            <div className="flex items-center gap-3">
              <VisibilitySwitch
                checked={category.isVisible}
                label={`${category.isVisible ? 'Ocultar' : 'Mostrar'} ${category.name}`}
                onChange={(visible) => toggleVisibility(category, visible)}
              />
              <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
                  aria-label={`Editar ${category.name}`}
                  title={`Editar ${category.name}`}
                  onClick={() => openEditModal(category)}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-brand-red transition hover:bg-red-50"
                  aria-label={`Eliminar ${category.name}`}
                  title={`Eliminar ${category.name}`}
                  onClick={() => openDeleteModal(category)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Modal: Crear / Editar Categoría */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-gray-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 id="category-modal-title" className="font-display text-xl font-extrabold text-gray-900">
                {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              <button
                type="button"
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-4">
              {formError && (
                <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-brand-red">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700" htmlFor="category-name">
                  Nombre de la categoría *
                </label>
                <input
                  id="category-name"
                  type="text"
                  required
                  placeholder="Ej. Hamburguesas, Pizzas, Bebidas"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700" htmlFor="category-order">
                  Orden de visualización *
                </label>
                <input
                  id="category-order"
                  type="number"
                  min="0"
                  required
                  placeholder="Ej. 1"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                  className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Las categorías con menor número de orden aparecen primero en el catálogo público.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/80 p-3">
                <div>
                  <span className="block text-xs font-bold text-gray-800">Visibilidad inicial</span>
                  <span className="block text-[11px] text-gray-500">
                    {form.isVisible ? 'Visible para los clientes' : 'Oculta en el menú público'}
                  </span>
                </div>
                <VisibilitySwitch
                  checked={form.isVisible}
                  label="Visibilidad de categoría"
                  onChange={(visible) => setForm({ ...form, isVisible: visible })}
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmación de Eliminación */}
      {deleteModalOpen && categoryToDelete && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-gray-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setDeleteModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 id="delete-modal-title" className="font-display text-lg font-extrabold text-brand-red">
                ¿Eliminar categoría?
              </h2>
              <button
                type="button"
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                onClick={() => setDeleteModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600">
                ¿Estás seguro de que querés eliminar la categoría{' '}
                <strong className="text-gray-900">{categoryToDelete.name}</strong>?
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Esta acción no se puede deshacer. Recordá que no se puede eliminar una categoría que tenga productos asociados.
              </p>

              {deleteError && (
                <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-brand-red">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-brand-red-dark disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar categoría'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesManager;