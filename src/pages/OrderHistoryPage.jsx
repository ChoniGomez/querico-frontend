import { ArrowLeft, Clock3, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../data/products.js';

const sampleOrders = [
  { id: 'QR-2084', date: '18 de septiembre de 2026', status: 'Entregado', total: 28400, items: '1 Combo familiar, 2 empanadas de carne' },
  { id: 'QR-1942', date: '4 de septiembre de 2026', status: 'Entregado', total: 15900, items: '1 Combo de a dos' },
  { id: 'QR-1871', date: '29 de agosto de 2026', status: 'Entregado', total: 12500, items: '1 Pizza muzzarella' },
];

function OrderHistoryPage() {
  const { user } = useAuth();
  return <main className="min-h-screen bg-gray-100">
    <header className="bg-brand-green text-white"><div className="mx-auto flex min-h-16 max-w-4xl items-center justify-between px-4"><Link to="/" className="font-display text-lg font-extrabold">Que Rico!</Link><span className="text-xs font-bold">{user.name}</span></div></header>
    <section className="mx-auto max-w-4xl px-4 py-9 sm:py-12">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900" to="/"><ArrowLeft size={16} /> Volver al menú</Link>
      <div className="mb-7 mt-6"><p className="text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">TU CUENTA</p><h1 className="mt-1 font-display text-3xl font-extrabold">Historial de pedidos</h1><p className="mt-2 text-sm text-gray-500">Pedidos anteriores de {user.name}.</p></div>
      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {sampleOrders.map((order) => <article className="grid gap-3 py-5 sm:grid-cols-[1fr_auto] sm:items-center" key={order.id}>
          <div><div className="flex flex-wrap items-center gap-3"><h2 className="font-display font-extrabold">Pedido {order.id}</h2><span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700"><PackageCheck size={14} />{order.status}</span></div><p className="mt-1 text-sm text-gray-600">{order.items}</p><p className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400"><Clock3 size={13} />{order.date}</p></div>
          <strong className="text-base sm:text-right">{formatPrice(order.total)}</strong>
        </article>)}
      </div>
      <p className="mt-4 text-xs text-gray-400">Historial de ejemplo. Los pedidos reales requerirán persistencia en backend.</p>
    </section>
  </main>;
}

export default OrderHistoryPage;