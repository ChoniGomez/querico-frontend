import { useEffect, useState } from 'react';
import { AlertCircle, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiRequest } from '../../utils/api.js';
import { formatPrice } from '../../data/products.js';
import { readImageFile } from '../../utils/readImageFile.js';
import VisibilitySwitch from './VisibilitySwitch.jsx';

function toDateTimeInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function PromotionsManager() {
  const { promotions, setPromotions } = useShop();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', details: '', type: 'discount', value: '', minQuantity: '6', productId: '', startDateTime: '', endDateTime: '', stock: '', image: '' });
  const [imageError, setImageError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar productos y promociones activas desde la API/Base de datos
  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      apiRequest('/api/products/manage', { token: user.token }),
      apiRequest('/api/promotions?all=true', { token: user.token }).catch(() => null),
    ])
      .then(([manageableProducts, apiPromotions]) => {
        if (!active) return;
        setProducts(manageableProducts || []);

        let loadedPromotions = [];

        // 1. Si la API retorna promociones directamente de la BD:
        if (Array.isArray(apiPromotions) && apiPromotions.length > 0) {
          loadedPromotions = apiPromotions.map((p) => ({
            ...p,
            id: p.id || `promo-${p.productId}`,
            productId: p.productId || p.id,
            productName: p.productName || p.name,
            minQuantity: Number(p.minQuantity || p.promoMinQuantity || 1),
            value: Number(p.value || p.discountPercent || p.promoDiscountPercent || 0),
            discountPercent: Number(p.discountPercent || p.promoDiscountPercent || 0),
            visible: p.visible !== false,
          }));
        } else if (Array.isArray(manageableProducts)) {
          // 2. Extraer productos que tienen regla de descuento por cantidad configurada en la BD
          loadedPromotions = manageableProducts
            .filter((p) => p.promoMinQuantity && p.promoDiscountPercent)
            .map((p) => ({
              id: `promo-${p.id}`,
              productId: p.id,
              productName: p.name,
              name: p.name,
              details: `${p.promoMinQuantity}+ unidades · ${p.promoDiscountPercent}% OFF`,
              type: 'discount',
              value: Number(p.promoDiscountPercent),
              minQuantity: Number(p.promoMinQuantity),
              discountPercent: Number(p.promoDiscountPercent),
              startDateTime: p.startDateTime || null,
              endDateTime: p.endDateTime || null,
              stock: p.stock ?? null,
              image: p.image || '',
              visible: p.visible !== false,
            }));
        }

        setPromotions(loadedPromotions);
      })
      .catch((error) => {
        if (active) setFormError(error.message || 'No se pudieron cargar los datos.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user.token, setPromotions]);

  const updateProductRule = async (product, values) => apiRequest(`/api/products/${product.id}/availability`, {
    method: 'PATCH',
    token: user.token,
    body: JSON.stringify({
      startDateTime: values.startDateTime ? new Date(values.startDateTime).toISOString() : null,
      endDateTime: values.endDateTime ? new Date(values.endDateTime).toISOString() : null,
      stock: values.stock === '' || values.stock === null ? null : Number(values.stock),
      promoMinQuantity: values.minQuantity,
      promoDiscountPercent: values.discountPercent,
    }),
  });

  const selectProduct = (productId) => {
    const product = products.find((item) => String(item.id) === String(productId));
    setForm((current) => ({
      ...current,
      productId,
      startDateTime: toDateTimeInput(product?.startDateTime),
      endDateTime: toDateTimeInput(product?.endDateTime),
      stock: product?.stock ?? '',
      minQuantity: product?.promoMinQuantity || '6',
      value: product?.promoDiscountPercent || '',
    }));
  };

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
      const availability = {
        startDateTime: form.startDateTime,
        endDateTime: form.endDateTime,
        stock: form.stock,
        minQuantity: minimumQuantity,
        discountPercent,
      };
      await updateProductRule(product, availability);

      const newPromo = {
        ...form,
        id: `promo-${product.id}`,
        productId: product.id,
        minQuantity: minimumQuantity,
        discountPercent,
        productName: product.name,
        name: form.name.trim() || product.name,
        details: form.details.trim() || `${minimumQuantity}+ unidades · ${discountPercent}% OFF`,
        startDateTime: form.startDateTime || null,
        endDateTime: form.endDateTime || null,
        stock: form.stock === '' ? null : Number(form.stock),
        value,
        visible: true,
      };

      setPromotions((prev) => {
        const filtered = prev.filter((item) => String(item.productId) !== String(product.id));
        return [...filtered, newPromo];
      });

      setProducts(products.map((item) => (item.id === product.id
        ? {
            ...item,
            startDateTime: form.startDateTime || null,
            endDateTime: form.endDateTime || null,
            stock: form.stock === '' ? null : Number(form.stock),
            promoMinQuantity: minimumQuantity,
            promoDiscountPercent: discountPercent,
          }
        : item)));

      setForm({ name: '', details: '', type: 'discount', value: '', minQuantity: '6', productId: '', startDateTime: '', endDateTime: '', stock: '', image: '' });
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
      await updateProductRule(product, {
        startDateTime: product.startDateTime,
        endDateTime: product.endDateTime,
        stock: product.stock,
        minQuantity: visible ? promotion.minQuantity : null,
        discountPercent: visible ? promotion.discountPercent : null,
      });
      setProducts(products.map((item) => (item.id === product.id
        ? { ...item, promoMinQuantity: visible ? promotion.minQuantity : null, promoDiscountPercent: visible ? promotion.discountPercent : null }
        : item)));
      setPromotions(promotions.map((item) => (item.id === promotion.id ? { ...item, visible } : item)));
    } catch (error) {
      setFormError(error.message || 'No se pudo actualizar la promoción.');
    }
  };

  const removePromotion = async (promotion) => {
    const product = products.find((item) => String(item.id) === String(promotion.productId));
    try {
      if (product) {
        await updateProductRule(product, {
          startDateTime: product.startDateTime,
          endDateTime: product.endDateTime,
          stock: product.stock,
          minQuantity: null,
          discountPercent: null,
        });
      }

      await apiRequest(`/api/promotions/${promotion.productId || promotion.id}`, {
        method: 'DELETE',
        token: user.token,
      }).catch(() => {});

      setProducts(products.map((item) => (String(item.id) === String(promotion.productId)
        ? { ...item, promoMinQuantity: null, promoDiscountPercent: null }
        : item)));
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
      <div className="mb-7">
        <p className="text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">OFERTAS</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">Promociones</h1>
        <p className="mt-2 text-sm text-gray-500">Gestioná combos y descuentos especiales.</p>
      </div>

      <form className="mb-8 border-y border-gray-200 py-5" onSubmit={addPromotion}>
        <h2 className="mb-4 font-display text-lg font-extrabold">Crear promoción</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-bold text-gray-600">
            Nombre
            <input
              required
              placeholder="Ej. Promo Muzzarella"
              className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <label className="text-xs font-bold text-gray-600">
            Producto asociado
            <select
              required
              className="mt-1 block h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900"
              value={form.productId}
              onChange={(event) => selectProduct(event.target.value)}
            >
              <option value="">Elegí un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-gray-600">
            Tipo
            <select
              className="mt-1 block h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900"
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            >
              <option value="discount">Descuento por cantidad</option>
              <option value="combo">Precio del combo</option>
            </select>
          </label>
          <label className="text-xs font-bold text-gray-600">
            Cantidad mínima
            <input
              required
              min="1"
              step="1"
              type="number"
              className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900"
              value={form.minQuantity}
              onChange={(event) => setForm({ ...form, minQuantity: event.target.value })}
            />
          </label>
          <label className="text-xs font-bold text-gray-600">
            {form.type === 'discount' ? 'Descuento (%)' : 'Precio total del combo ($)'}
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900"
              value={form.value}
              onChange={(event) => setForm({ ...form, value: event.target.value })}
            />
          </label>
          <label className="text-xs font-bold text-gray-600">
            Abre
            <input
              className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900"
              type="datetime-local"
              value={form.startDateTime}
              onChange={(event) => setForm({ ...form, startDateTime: event.target.value })}
            />
          </label>
          <label className="text-xs font-bold text-gray-600">
            Cierra
            <input
              className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900"
              type="datetime-local"
              value={form.endDateTime}
              onChange={(event) => setForm({ ...form, endDateTime: event.target.value })}
            />
          </label>
          <label className="text-xs font-bold text-gray-600">
            Stock máximo
            <input
              className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900"
              type="number"
              min="0"
              step="1"
              placeholder="Ilimitado"
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value })}
            />
          </label>
          <label className="text-xs font-bold text-gray-600 sm:col-span-2 lg:col-span-4">
            Detalle
            <input
              required
              placeholder="Ej. Llevando 6 o más pizzas de muzzarella obtenés un descuento"
              className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal text-gray-900"
              value={form.details}
              onChange={(event) => setForm({ ...form, details: event.target.value })}
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <span className="text-xs font-bold text-gray-600">Imagen de la promoción</span>
            <label
              htmlFor="promotion-image-upload"
              className="mt-1 flex min-h-24 cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-300 bg-white p-3 transition hover:border-brand-green"
            >
              {form.image ? (
                <img className="h-16 w-24 rounded-md bg-gray-100 object-cover" src={form.image} alt="Vista previa de la promoción" />
              ) : (
                <span className="grid h-16 w-24 shrink-0 place-items-center rounded-md bg-gray-100 text-gray-500">
                  <ImagePlus size={24} />
                </span>
              )}
              <span>
                <span className="block text-sm font-bold text-gray-800">Elegir imagen</span>
                <span className="mt-1 block text-xs text-gray-500">JPG, PNG o WebP · máximo 2 MB</span>
              </span>
              <input
                id="promotion-image-upload"
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  selectImage(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </label>
            {imageError && <p className="mt-1 text-xs font-semibold text-brand-red" role="alert">{imageError}</p>}
          </div>
        </div>

        {formError && (
          <div role="alert" className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-semibold text-brand-red">
            <AlertCircle size={17} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <button
          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-gray-950 px-4 text-sm font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
          type="submit"
          disabled={saving || products.length === 0}
        >
          {saving ? 'Guardando...' : <><Plus size={16} />Crear promoción</>}
        </button>
      </form>

      {/* Listado de Promociones */}
      <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
        {loading && <p className="py-8 text-center text-sm text-gray-500">Cargando promociones...</p>}

        {!loading && promotions.map((promotion) => (
          <article className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center" key={promotion.id}>
            <div className="flex min-w-0 items-center gap-3">
              {promotion.image ? (
                <img className="h-14 w-16 shrink-0 rounded-md bg-gray-100 object-cover" src={promotion.image} alt="" />
              ) : (
                <span className="grid h-14 w-16 shrink-0 place-items-center rounded-md bg-gray-100 text-gray-400">
                  <ImagePlus size={19} />
                </span>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display font-extrabold text-gray-900">{promotion.name}</h3>
                  <span className="rounded-full bg-brand-green/15 px-2.5 py-1 text-[10px] font-extrabold uppercase text-brand-green-dark">
                    {promotion.type === 'combo' ? `Combo · ${formatPrice(promotion.value)}` : `${promotion.value}% OFF`}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{promotion.details}</p>
                <p className="mt-1 text-xs font-semibold text-gray-700">
                  {promotion.productName} · desde {promotion.minQuantity} unidades
                </p>
              </div>
            </div>

            <VisibilitySwitch
              label={`${promotion.visible === false ? 'Mostrar' : 'Ocultar'} ${promotion.name}`}
              checked={promotion.visible !== false}
              onChange={(visible) => togglePromotion(promotion, visible)}
            />

            <button
              type="button"
              className="justify-self-end rounded-lg p-2 text-brand-red transition hover:bg-red-50"
              aria-label={`Eliminar ${promotion.name}`}
              title={`Eliminar ${promotion.name}`}
              onClick={() => removePromotion(promotion)}
            >
              <Trash2 size={17} />
            </button>
          </article>
        ))}

        {!loading && promotions.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">No hay promociones creadas.</p>
        )}
      </div>
    </div>
  );
}

export default PromotionsManager;