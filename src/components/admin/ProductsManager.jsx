import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { categories, formatPrice } from '../../data/products.js';
import { useShop } from '../../context/ShopContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiRequest } from '../../utils/api.js';
import { readImageFile } from '../../utils/readImageFile.js';
import VisibilitySwitch from './VisibilitySwitch.jsx';

const emptyProduct = { name: '', description: '', category: categories[0].id, price: '', badge: '', image: '' };

function ProductsManager() {
  const { products, setProducts } = useShop();
  const setProductsRef = useRef(setProducts);
  setProductsRef.current = setProducts;
  const { user } = useAuth();
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [imageError, setImageError] = useState('');
  const [visibilityError, setVisibilityError] = useState('');

  useEffect(() => {
    apiRequest('/api/products/manage', { token: user.token })
      .then((manageableProducts) => setProductsRef.current(manageableProducts))
      .catch((error) => setVisibilityError(error.message));

    apiRequest('/api/categories?all=true', { token: user.token })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategoryOptions(data.map((c) => ({ id: c.id, label: c.name })));
        }
      })
      .catch(() => {});
  }, [user.token]);

  const changeVisibility = async (product, visible) => {
    setVisibilityError('');
    try {
      await apiRequest(`/api/products/${product.id}/visibility`, {
        method: 'PATCH',
        token: user.token,
        body: JSON.stringify({ visible }),
      });
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, visible } : item));
    } catch (error) {
      setVisibilityError(error.message || 'No se pudo actualizar la visibilidad.');
    }
  };

  const saveProduct = (event) => {
    event.preventDefault();
    const product = { ...form, price: Number(form.price), image: form.image || products[0]?.image || '', badge: form.badge || null };
    if (editingId) setProducts(products.map((item) => item.id === editingId ? { ...item, ...product } : item));
    else setProducts([...products, { ...product, id: `producto-${Date.now()}`, visible: true }]);
    setForm(emptyProduct);
    setEditingId(null);
    setImageError('');
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name, description: product.description, category: product.category, price: String(product.price), badge: product.badge || '', image: product.image || '' });
    setImageError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectImage = async (file) => {
    if (!file) return;
    try {
      const image = await readImageFile(file);
      setForm((current) => ({ ...current, image }));
      setImageError('');
    } catch (error) {
      setImageError(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">CATÁLOGO</p><h1 className="mt-1 font-display text-3xl font-extrabold">Productos</h1></div><span className="text-sm font-semibold text-gray-500">{products.length} productos</span></div>
      <form className="mb-8 border-y border-gray-200 py-5" onSubmit={saveProduct}>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-extrabold">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>{editingId && <button type="button" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900" onClick={() => { setEditingId(null); setForm(emptyProduct); }}><X size={15} /> Cancelar edición</button>}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-bold text-gray-600">Nombre<input required className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="text-xs font-bold text-gray-600">Precio<input required min="0" type="number" className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
          <label className="text-xs font-bold text-gray-600">Categoría<select className="mt-1 block h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label>
          <label className="text-xs font-bold text-gray-600">Etiqueta<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900" placeholder="PROMO (opcional)" value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value })} /></label>
          <label className="text-xs font-bold text-gray-600 sm:col-span-2">Descripción<input required className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <div className="sm:col-span-2">
            <span className="text-xs font-bold text-gray-600">Imagen del producto</span>
            <label htmlFor="product-image-upload" className="mt-1 flex min-h-28 cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 bg-white p-3 transition hover:border-brand-green">
              {form.image ? <img className="h-20 w-24 rounded-md bg-gray-100 object-cover" src={form.image} alt="Vista previa del producto" /> : <span className="grid h-20 w-24 shrink-0 place-items-center rounded-md bg-gray-100 text-gray-500"><ImagePlus size={24} /></span>}
              <span><span className="block text-sm font-bold text-gray-800">Elegir imagen</span><span className="mt-1 block text-xs text-gray-500">JPG, PNG o WebP · máximo 2 MB</span></span>
              <input id="product-image-upload" className="sr-only" type="file" accept="image/*" onChange={(event) => { selectImage(event.target.files?.[0]); event.target.value = ''; }} />
            </label>
            <label className="mt-2 block text-xs font-bold text-gray-600">O usar URL<input type="url" className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900" placeholder="https://..." value={form.image.startsWith('data:') ? '' : form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label>
            {imageError && <p className="mt-1 text-xs font-semibold text-brand-red" role="alert">{imageError}</p>}
          </div>
        </div>
        <button className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-gray-950 px-4 text-sm font-bold text-white hover:bg-gray-800" type="submit">{editingId ? <Pencil size={15} /> : <Plus size={16} />}{editingId ? 'Guardar cambios' : 'Crear producto'}</button>
      </form>
      <div className="overflow-x-auto">
        {visibilityError && <p role="alert" className="mb-3 text-sm font-semibold text-brand-red">{visibilityError}</p>}
        <table className="w-full min-w-[780px] border-collapse text-left text-sm"><thead><tr className="border-b border-gray-300 text-xs uppercase tracking-wide text-gray-500"><th className="py-3 pr-4">Producto</th><th className="py-3 pr-4">Categoría</th><th className="py-3 pr-4">Precio</th><th className="py-3 pr-4">Visibilidad</th><th className="py-3 text-right">Acciones</th></tr></thead>
          <tbody>{products.map((product) => <tr className="border-b border-gray-200" key={product.id}><td className="py-3 pr-4"><div className="flex items-center gap-3"><img className="h-11 w-12 rounded-md bg-gray-100 object-cover" src={product.image} alt="" /><div><p className="font-bold">{product.name}</p><p className="mt-0.5 max-w-lg truncate text-xs text-gray-500">{product.description}</p></div></div></td><td className="py-3 pr-4 text-gray-600">{categoryOptions.find((category) => category.id === product.category)?.label || product.categoryName || product.category}</td><td className="py-3 pr-4 font-bold">{formatPrice(Number(product.price))}</td><td className="py-3 pr-4"><VisibilitySwitch label={`${product.visible === false ? 'Mostrar' : 'Ocultar'} ${product.name}`} checked={product.visible !== false} onChange={(visible) => changeVisibility(product, visible)} /></td><td className="py-3"><div className="flex justify-end gap-2"><button className="rounded-lg p-2 text-gray-600 hover:bg-gray-200" type="button" aria-label={`Editar ${product.name}`} onClick={() => editProduct(product)}><Pencil size={16} /></button><button className="rounded-lg p-2 text-brand-red hover:bg-red-50" type="button" aria-label={`Eliminar ${product.name}`} onClick={() => { setProducts(products.filter((item) => item.id !== product.id)); if (editingId === product.id) { setEditingId(null); setForm(emptyProduct); } }}><Trash2 size={16} /></button></div></td></tr>)}</tbody>
        </table>
        {products.length === 0 && <p className="py-8 text-center text-sm text-gray-500">Todavía no hay productos en el catálogo.</p>}
      </div>
    </div>
  );
}

export default ProductsManager;