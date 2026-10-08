import { useEffect, useState } from 'react';
import { CalendarClock, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { apiRequest } from '../../utils/api.js';

function toDateTimeInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function ProductAvailabilityManager() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    apiRequest('/api/products/manage', { token: user.token })
      .then(setProducts)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [user.token]);

  const updateProduct = (id, updates) => {
    setProducts((current) => current.map((product) => product.id === id ? { ...product, ...updates } : product));
    setSavedId(null);
  };

  const saveAvailability = async (product) => {
    setError('');
    setSavedId(null);
    setSavingId(product.id);
    try {
      const updated = await apiRequest(`/api/products/${product.id}/availability`, {
        method: 'PATCH',
        token: user.token,
        body: JSON.stringify({
          startDateTime: product.startDateTime ? new Date(product.startDateTime).toISOString() : null,
          endDateTime: product.endDateTime ? new Date(product.endDateTime).toISOString() : null,
          stock: product.stock === '' || product.stock === null ? null : Number(product.stock),
          promoMinQuantity: product.promoMinQuantity === '' || product.promoMinQuantity === null ? null : Number(product.promoMinQuantity),
          promoDiscountPercent: product.promoDiscountPercent === '' || product.promoDiscountPercent === null ? null : Number(product.promoDiscountPercent),
        }),
      });
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, ...updated } : item));
      setSavedId(product.id);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo guardar la disponibilidad.');
    } finally {
      setSavingId(null);
    }
  };

  return <section className="mb-10 border-b border-gray-200 pb-8">
    <div className="mb-4 flex items-start gap-3">
      <CalendarClock className="mt-1 shrink-0 text-brand-green-dark" size={20} />
      <div><h2 className="font-display text-lg font-extrabold">Disponibilidad de productos y combos</h2><p className="mt-1 text-sm text-gray-600">Programá cuándo se venden y el stock límite. El stock vacío significa sin límite.</p></div>
    </div>
    {error && <p role="alert" className="mb-3 text-sm font-semibold text-brand-red">{error}</p>}
    {loading && <p className="py-4 text-sm text-gray-600">Cargando productos...</p>}
    {!loading && products.length === 0 && !error && <p className="py-4 text-sm text-gray-600">No hay productos en el catálogo.</p>}
    {products.length > 0 && <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
        <thead><tr className="border-b border-gray-300 text-xs uppercase tracking-wide text-gray-600"><th className="py-3 pr-4">Producto</th><th className="py-3 pr-4">Desde</th><th className="py-3 pr-4">Hasta</th><th className="py-3 pr-4">Stock</th><th className="py-3 pr-4">Mín. unidades</th><th className="py-3 pr-4">Descuento %</th><th className="py-3 text-right">Acción</th></tr></thead>
        <tbody>{products.map((product) => <tr className="border-b border-gray-200 align-top" key={product.id}>
          <td className="py-3 pr-4"><p className="font-bold text-gray-900">{product.name}</p><p className="mt-0.5 text-xs text-gray-600">{product.categoryName}</p></td>
          <td className="py-3 pr-4"><label className="sr-only" htmlFor={`availability-start-${product.id}`}>Fecha y hora de apertura para {product.name}</label><input id={`availability-start-${product.id}`} className="h-9 rounded-md border border-gray-300 px-2 text-xs text-gray-900" type="datetime-local" value={toDateTimeInput(product.startDateTime)} onChange={(event) => updateProduct(product.id, { startDateTime: event.target.value })} /></td>
          <td className="py-3 pr-4"><label className="sr-only" htmlFor={`availability-end-${product.id}`}>Fecha y hora de cierre para {product.name}</label><input id={`availability-end-${product.id}`} className="h-9 rounded-md border border-gray-300 px-2 text-xs text-gray-900" type="datetime-local" value={toDateTimeInput(product.endDateTime)} onChange={(event) => updateProduct(product.id, { endDateTime: event.target.value })} /></td>
          <td className="py-3 pr-4"><label className="sr-only" htmlFor={`availability-stock-${product.id}`}>Stock para {product.name}</label><input id={`availability-stock-${product.id}`} className="h-9 w-24 rounded-md border border-gray-300 px-2 text-sm text-gray-900" type="number" min="0" step="1" placeholder="Ilimitado" value={product.stock ?? ''} onChange={(event) => updateProduct(product.id, { stock: event.target.value })} /></td>
          <td className="py-3 pr-4"><label className="sr-only" htmlFor={`promo-min-${product.id}`}>Cantidad mínima para descuento de {product.name}</label><input id={`promo-min-${product.id}`} className="h-9 w-24 rounded-md border border-gray-300 px-2 text-sm text-gray-900" type="number" min="1" step="1" placeholder="Sin promo" value={product.promoMinQuantity ?? ''} onChange={(event) => updateProduct(product.id, { promoMinQuantity: event.target.value })} /></td>
          <td className="py-3 pr-4"><label className="sr-only" htmlFor={`promo-discount-${product.id}`}>Porcentaje de descuento para {product.name}</label><input id={`promo-discount-${product.id}`} className="h-9 w-24 rounded-md border border-gray-300 px-2 text-sm text-gray-900" type="number" min="0.01" max="99.99" step="0.01" placeholder="%" value={product.promoDiscountPercent ?? ''} onChange={(event) => updateProduct(product.id, { promoDiscountPercent: event.target.value })} /></td>
          <td className="py-3 text-right"><button className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-gray-950 px-3 text-xs font-bold text-white hover:bg-gray-800 disabled:opacity-50" type="button" disabled={savingId === product.id} onClick={() => saveAvailability(product)}><Save size={14} />{savingId === product.id ? 'Guardando...' : savedId === product.id ? 'Guardado' : 'Guardar'}</button></td>
        </tr>)}</tbody>
      </table>
    </div>}
  </section>;
}

export default ProductAvailabilityManager;