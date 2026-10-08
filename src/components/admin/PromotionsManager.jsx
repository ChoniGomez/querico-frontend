import { useEffect, useState } from 'react';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiRequest } from '../../utils/api.js';
import { formatPrice } from '../../data/products.js';
import { readImageFile } from '../../utils/readImageFile.js';
import VisibilitySwitch from './VisibilitySwitch.jsx';
import ProductAvailabilityManager from './ProductAvailabilityManager.jsx';

function PromotionsManager() {
  const { promotions, setPromotions } = useShop();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', details: '', type: 'discount', value: '', minQuantity: '6', productId: '', image: '' });
  const [imageError, setImageError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest('/api/products/manage', { token: user.token })
      .then(setProducts)
      .catch((error) => setFormError(error.message));
  }, [user.token]);

  const updateProductRule = async (product, minQuantity, discountPercent) => apiRequest(`/api/products/${product.id}/availability`, {
    method: 'PATCH',
    token: user.token,
    body: JSON.stringify({
      startDateTime: product.startDateTime ? new Date(product.startDateTime).toISOString() : null,
      endDateTime: product.endDateTime ? new Date(product.endDateTime).toISOString() : null,
      stock: product.stock ?? null,
      promoMinQuantity: minQuantity,
      promoDiscountPercent: discountPercent,
    }),
  });

  const addPromotion = async (event) => {
    event.preventDefault();
    setFormError('');
    const product = products.find((item) => String(item.id) === String(form.productId));
    const minimumQuantity = Number(form.minQuantity);
    const value = Number(form.value);
    if (!product || !Number.isInteger(minimumQuantity) || minimumQuantity < 1 || !Number.isFinite(value) || value <= 0) {
      setFormError('Elegí un producto y completá un valor y una cantidad mínima válidos.');
      return;
    }
    if (promotions.some((promotion) => String(promotion.productId) === String(product.id) && promotion.visible !== false)) {
      setFormError('Ese producto ya tiene una promoción visible. Ocultala o eliminala antes de crear otra.');
      return;
    }
    const discountPercent = form.type === 'discount'
      ? value
      : Math.round((1 - value / (Number(product.price) * minimumQuantity)) * 10000) / 100;
    if (discountPercent <= 0 || discountPercent >= 100) {
      setFormError('El descuento resultante debe estar entre 0 y 100%. Revisá el precio del combo.');
      return;
    }
    setSaving(true);
    try {
      await updateProductRule(product, minimumQuantity, discountPercent);
      setPromotions([...promotions, {
        ...form,
        id: `promo-${Date.now()}`,
        productId: product.id,
        minQuantity: minimumQuantity,
        discountPercent,
        productName: product.name,
        value,
        visible: true,
      }]);
      setProducts((current) => current.map((item) => item.id === product.id
        ? { ...item, promoMinQuantity: minimumQuantity, promoDiscountPercent: discountPercent }
        : item));
      setForm({ name: '', details: '', type: 'discount', value: '', minQuantity: '6', productId: '', image: '' });
    } catch (error) {
      setFormError(error.message || 'No se pudo guardar la regla de descuento.');
    } finally {
      setSaving(false);
    }
    setImageError('');
  };

  const togglePromotion = async (promotion, visible) => {
    const product = products.find((item) => String(item.id) === String(promotion.productId));
    if (!product) return;
    try {
      await updateProductRule(product, visible ? promotion.minQuantity : null, visible ? promotion.discountPercent : null);
      setProducts((current) => current.map((item) => item.id === product.id
        ? { ...item, promoMinQuantity: visible ? promotion.minQuantity : null, promoDiscountPercent: visible ? promotion.discountPercent : null }
        : item));
      setPromotions(promotions.map((item) => item.id === promotion.id ? { ...item, visible } : item));
    } catch (error) {
      setFormError(error.message || 'No se pudo actualizar la promoción.');
    }
  };

  const removePromotion = async (promotion) => {
    const product = products.find((item) => String(item.id) === String(promotion.productId));
    try {
      if (product) await updateProductRule(product, null, null);
      setProducts((current) => current.map((item) => item.id === promotion.productId
        ? { ...item, promoMinQuantity: null, promoDiscountPercent: null }
        : item));
      setPromotions(promotions.filter((item) => item.id !== promotion.id));
    } catch (error) {
      setFormError(error.message || 'No se pudo eliminar la promoción.');
    }
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
    <div className="mx-auto max-w-5xl">
      <div className="mb-7"><p className="text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">OFERTAS</p><h1 className="mt-1 font-display text-3xl font-extrabold">Promociones</h1><p className="mt-2 text-sm text-gray-500">Gestioná combos y descuentos especiales.</p></div>
      <ProductAvailabilityManager />
      <form className="mb-8 border-y border-gray-200 py-5" onSubmit={addPromotion}>
        <h2 className="mb-4 font-display text-lg font-extrabold">Crear promoción</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-bold text-gray-600">Nombre<input required className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="text-xs font-bold text-gray-600">Producto asociado<select required className="mt-1 block h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900" value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })}><option value="">Elegí un producto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
          <label className="text-xs font-bold text-gray-600">Tipo<select className="mt-1 block h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="discount">Descuento por cantidad</option><option value="combo">Precio del combo</option></select></label>
          <label className="text-xs font-bold text-gray-600">Cantidad mínima<input required min="1" step="1" type="number" className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900" value={form.minQuantity} onChange={(event) => setForm({ ...form, minQuantity: event.target.value })} /></label>
          <label className="text-xs font-bold text-gray-600">{form.type === 'discount' ? 'Descuento (%)' : 'Precio total del combo ($)'}<input required min="0.01" step="0.01" type="number" className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} /></label>
          <label className="text-xs font-bold text-gray-600">Detalle<input required className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900" value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} /></label>
          <div className="sm:col-span-2 lg:col-span-4">
            <span className="text-xs font-bold text-gray-600">Imagen de la promoción</span>
            <label htmlFor="promotion-image-upload" className="mt-1 flex min-h-24 cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 bg-white p-3 transition hover:border-brand-green">
              {form.image ? <img className="h-16 w-24 rounded-md bg-gray-100 object-cover" src={form.image} alt="Vista previa de la promoción" /> : <span className="grid h-16 w-24 shrink-0 place-items-center rounded-md bg-gray-100 text-gray-500"><ImagePlus size={24} /></span>}
              <span><span className="block text-sm font-bold text-gray-800">Elegir imagen</span><span className="mt-1 block text-xs text-gray-500">JPG, PNG o WebP · máximo 2 MB</span></span>
              <input id="promotion-image-upload" className="sr-only" type="file" accept="image/*" onChange={(event) => { selectImage(event.target.files?.[0]); event.target.value = ''; }} />
            </label>
            {imageError && <p className="mt-1 text-xs font-semibold text-brand-red" role="alert">{imageError}</p>}
          </div>
        </div>
        {formError && <p role="alert" className="mt-3 text-sm font-semibold text-brand-red">{formError}</p>}
        <button className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-gray-950 px-4 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50" type="submit" disabled={saving || products.length === 0}>{saving ? 'Guardando...' : <><Plus size={16} />Crear promoción</>}</button>
      </form>
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {promotions.map((promotion) => <article className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center" key={promotion.id}><div className="flex min-w-0 items-center gap-3">{promotion.image ? <img className="h-14 w-16 shrink-0 rounded-md bg-gray-100 object-cover" src={promotion.image} alt="" /> : <span className="grid h-14 w-16 shrink-0 place-items-center rounded-md bg-gray-100 text-gray-400"><ImagePlus size={19} /></span>}<div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-display font-extrabold">{promotion.name}</h3><span className="rounded-full bg-brand-green/15 px-2.5 py-1 text-[10px] font-extrabold uppercase text-brand-green-dark">{promotion.type === 'combo' ? `Combo · ${formatPrice(promotion.value)}` : `${promotion.value}% OFF`}</span></div><p className="mt-1 text-sm text-gray-600">{promotion.details}</p><p className="mt-1 text-xs font-semibold text-gray-700">{promotion.productName} · desde {promotion.minQuantity} unidades</p></div></div><VisibilitySwitch label={`${promotion.visible === false ? 'Mostrar' : 'Ocultar'} ${promotion.name}`} checked={promotion.visible !== false} onChange={(visible) => togglePromotion(promotion, visible)} /><button type="button" className="justify-self-end rounded-lg p-2 text-brand-red hover:bg-red-50" aria-label={`Eliminar ${promotion.name}`} onClick={() => removePromotion(promotion)}><Trash2 size={17} /></button></article>)}
        {promotions.length === 0 && <p className="py-8 text-sm text-gray-500">No hay promociones creadas.</p>}
      </div>
    </div>
  );
}

export default PromotionsManager;