import { ShoppingBag } from 'lucide-react';
import { formatPrice } from '../data/products.js';

function CartButton({ itemCount, subtotal, onClick }) {
  return (
    <button className="fixed bottom-4 right-4 z-40 flex min-h-14 items-center gap-3 rounded-2xl bg-brand-red px-4 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-brand-red-dark sm:bottom-6 sm:right-6 sm:px-5" type="button" onClick={onClick} aria-label={`Abrir carrito con ${itemCount} productos`}>
      <span className="relative"><ShoppingBag size={21} /><i className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-extrabold not-italic text-brand-red">{itemCount}</i></span>
      <span className="text-xs font-extrabold">VER PEDIDO</span>
      <span className="h-6 border-l border-white/40" />
      <strong className="text-sm font-extrabold">{formatPrice(subtotal)}</strong>
    </button>
  );
}

export default CartButton;