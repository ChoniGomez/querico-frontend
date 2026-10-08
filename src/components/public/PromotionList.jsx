import { Tag } from 'lucide-react';
import { formatPrice } from '../../data/products.js';

function PromotionList({ promotions, products = [], onAddPromotion }) {
  const visiblePromotions = promotions.filter((promotion) => promotion.visible !== false);
  if (visiblePromotions.length === 0) return null;

  return (
    <section className="mb-10 border-y border-gray-200 py-7" aria-labelledby="promotions-title">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div><p className="mb-1 text-xs font-extrabold uppercase tracking-[.16em] text-brand-red">POR TIEMPO LIMITADO</p><h2 id="promotions-title" className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl">Promociones</h2></div>
        <span className="text-xs font-bold text-gray-500">{visiblePromotions.length} activas</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePromotions.map((promotion) => {
          const product = products.find((item) => String(item.id) === String(promotion.productId));
          const quantity = Number(promotion.minQuantity || product?.promoMinQuantity || 1);
          const hasStock = product?.stock !== null && product?.stock !== undefined;
          const canAdd = Boolean(product && product.isPurchasable !== false && (!hasStock || product.stock >= quantity));
          return <article className="overflow-hidden rounded-xl border border-gray-200 bg-white" key={promotion.id}>
          {promotion.image ? <img className="h-40 w-full object-cover" src={promotion.image} alt={promotion.name} loading="lazy" /> : <div className="grid h-32 place-items-center bg-brand-green/15 text-brand-green-dark"><Tag size={30} /></div>}
          <div className="p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-display font-extrabold">{promotion.name}</h3><span className="rounded-full bg-brand-red/10 px-2.5 py-1 text-xs font-extrabold text-brand-red">{promotion.type === 'combo' ? formatPrice(promotion.value) : `${promotion.value}% OFF`}</span></div><p className="mt-2 text-sm leading-5 text-gray-600">{promotion.details}</p>{product && <p className="mt-2 text-xs font-semibold text-gray-700">{product.name} · {quantity} unidades</p>}<button className="mt-4 min-h-10 w-full rounded-lg bg-brand-red px-3 text-xs font-extrabold text-white hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600" type="button" disabled={!canAdd} onClick={() => onAddPromotion?.(promotion, product, quantity)}>{canAdd ? 'AGREGAR PROMO AL CARRITO' : product ? 'NO DISPONIBLE' : 'PROMO SIN PRODUCTO ASOCIADO'}</button></div>
        </article>;
        })}
      </div>
    </section>
  );
}

export default PromotionList;