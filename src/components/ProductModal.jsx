import { useEffect, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { formatPrice } from '../data/products.js';

function ProductModal({ product, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('overflow-hidden');
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('overflow-hidden');
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-gray-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
        <section className="relative my-auto grid w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:grid-cols-2" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
          <button className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white" type="button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button>
          <img className="h-52 w-full object-cover sm:h-full sm:min-h-[440px]" src={product.image} alt={product.name} />
          <div className="p-6 sm:p-8">
            {product.badge && <span className="rounded-full bg-brand-green/15 px-3 py-1 text-[10px] font-extrabold uppercase text-brand-green-dark">{product.badge}</span>}
            <h2 id="product-modal-title" className="mt-3 font-display text-2xl font-extrabold">{product.name}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{product.description}</p>
            <div className="my-5 flex items-center justify-between border-y border-gray-100 py-4">
              <span className="text-sm font-extrabold">CANTIDAD</span>
              <div className="flex items-center gap-4">
                <button className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 hover:border-brand-green hover:text-brand-green-dark" type="button" aria-label="Restar cantidad" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button>
                <strong className="min-w-4 text-center">{quantity}</strong>
                <button className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 hover:border-brand-green hover:text-brand-green-dark" type="button" aria-label="Sumar cantidad" onClick={() => setQuantity((value) => value + 1)}><Plus size={15} /></button>
              </div>
            </div>
            <label className="block text-sm font-bold" htmlFor="product-notes">Aclaración del producto <span className="ml-1 text-[10px] font-semibold text-gray-400">OPCIONAL</span></label>
            <textarea className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/20" id="product-notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ej: sin cebolla, bien cocida..." rows="3" maxLength="180" />
            <button className="mt-5 flex min-h-12 w-full items-center justify-between gap-2 rounded-xl bg-brand-red px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-brand-red-dark" type="button" onClick={() => onConfirm(product, quantity, notes)}>
              CONFIRMAR Y AGREGAR <span>{formatPrice(product.price * quantity)}</span>
            </button>
          </div>
        </section>
    </div>
  );
}

export default ProductModal;