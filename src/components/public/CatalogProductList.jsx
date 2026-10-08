import { Plus } from 'lucide-react';
import { categories as defaultCategories, formatPrice } from '../../data/products.js';

function CatalogProductList({ products, categories = defaultCategories, onAdd }) {
  const visibleProducts = products.filter((product) => product.visible !== false);
  const formatDateTime = (value) => new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date(value));

  return (
    <div className="space-y-10">
      {categories.map((category) => {
        const categoryProducts = visibleProducts.filter((product) => product.category === category.id);
        if (categoryProducts.length === 0) return null;
        return (
          <section className="scroll-mt-20" id={category.id} key={category.id}>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="mb-1 text-xs font-extrabold uppercase tracking-[.16em] text-brand-green-dark">{category.id === 'promos' ? 'ELEGIDOS PARA VOS' : 'HECHOS EN EL MOMENTO'}</p>
                <h2 className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl">{category.label}</h2>
              </div>
              <span className="rounded-full bg-brand-green/15 px-3 py-1 text-xs font-bold text-brand-green-dark">{categoryProducts.length} opciones</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryProducts.map((product) => (
                <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lg" key={product.id}>
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img className="h-full w-full object-cover transition duration-300 hover:scale-105" src={product.image || 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85'} alt={product.name} loading="lazy" />
                    {product.badge && <span className="absolute left-3 top-3 rounded-full bg-brand-green px-3 py-1 text-[10px] font-extrabold uppercase text-white shadow-sm">{product.badge}</span>}
                  </div>
                  <div className="flex min-h-40 flex-col justify-between p-4">
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-brand-ink">{product.name}</h3>
                      <p className="mt-1 text-sm leading-5 text-gray-600">{product.description}</p>
                      {(product.endDateTime || product.stock !== null || product.availabilityStatus !== 'available') && <div className="mt-2 flex flex-wrap gap-1.5">
                        {product.availabilityStatus === 'scheduled' && <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-900">Disponible desde {formatDateTime(product.startDateTime)}</span>}
                        {product.availabilityStatus === 'expired' && <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">Promoción finalizada</span>}
                        {product.availabilityStatus === 'sold_out' && <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-800">Agotado</span>}
                        {product.availabilityStatus === 'available' && product.endDateTime && <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-900">Disponible hasta {formatDateTime(product.endDateTime)}</span>}
                        {product.availabilityStatus === 'available' && product.stock !== null && <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">{product.stock > 0 ? `Quedan ${product.stock} · hasta agotar stock` : 'Agotado'}</span>}
                      </div>}
                      {product.promoMinQuantity && product.promoDiscountPercent && <p className="mt-2 inline-flex rounded-md bg-brand-red/10 px-2 py-1 text-xs font-extrabold text-brand-red">{product.promoMinQuantity}+ unidades · {product.promoDiscountPercent}% OFF</p>}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <strong className="font-display text-lg font-extrabold">{formatPrice(product.price)}</strong>
                      <button type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-red px-3 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600" disabled={product.isPurchasable === false} onClick={() => onAdd(product)} aria-label={`${product.isPurchasable === false ? 'No disponible' : 'Agregar'} ${product.name}`}>
                        <Plus size={16} strokeWidth={2.5} /> {product.isPurchasable === false ? 'NO DISPONIBLE' : 'AGREGAR'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default CatalogProductList;