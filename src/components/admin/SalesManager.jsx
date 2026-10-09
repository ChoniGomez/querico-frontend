import { useEffect, useState } from 'react';
import { Clock3, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatPrice } from '../../data/products.js';
import { apiRequest } from '../../utils/api.js';

function SalesManager() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    apiRequest('/api/orders/all', { token: user.token })
      .then(setOrders)
      .catch((error) => setOrdersError(error.message))
      .finally(() => setLoadingOrders(false));
  }, [user.token]);

  const updateOrderStatus = async (orderId, status) => {
    setOrdersError('');
    setUpdatingId(orderId);
    try {
      await apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        token: user.token,
        body: JSON.stringify({ status }),
      });
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
    } catch (error) {
      setOrdersError(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const normalizedSearch = orderSearch.trim().replace(/^#/, '');
  const filteredOrders = orders.filter((order) => String(order.orderNumber || '').includes(normalizedSearch));

  return <div className="mx-auto max-w-6xl">
    <div className="mb-7"><p className="text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">OPERACIONES</p><h1 className="mt-1 font-display text-3xl font-extrabold">Ventas</h1><p className="mt-2 text-sm text-gray-600">Buscá pedidos por número y actualizá su estado.</p></div>
    {ordersError && <p role="alert" className="mb-4 text-sm font-semibold text-brand-red">{ordersError}</p>}
    <label className="relative mb-5 block max-w-md">
      <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <span className="sr-only">Buscar por número de pedido</span>
      <input className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/15" inputMode="numeric" type="search" placeholder="Buscar pedido #1001" value={orderSearch} onChange={(event) => setOrderSearch(event.target.value.replace(/[^\d#]/g, ''))} />
    </label>
    {loadingOrders && <p className="py-4 text-sm text-gray-600">Cargando pedidos...</p>}
    {!loadingOrders && !ordersError && filteredOrders.length === 0 && <p className="border-y border-gray-200 py-6 text-center text-sm text-gray-600">{orders.length ? 'No hay pedidos con ese número.' : 'Todavía no hay pedidos registrados.'}</p>}
    {filteredOrders.length > 0 && <div className="divide-y divide-gray-200 border-y border-gray-200">
      {filteredOrders.map((order) => <article className="flex flex-wrap items-center justify-between gap-4 py-4" key={order.id}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">#{order.orderNumber} · {order.customerName}</h2><span className="text-xs text-gray-600">{order.customerEmail || 'Pedido de invitado'}</span></div>
          <p className="mt-1 text-sm text-gray-700">{order.items.map((item) => `${item.quantity} ${item.name}`).join(', ')}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-600"><Clock3 size={12} />{new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt))}</p>
        </div>
        <div className="flex items-center gap-3"><strong className="text-sm">{formatPrice(Number(order.total))}</strong><label className="sr-only" htmlFor={`sales-order-status-${order.id}`}>Estado del pedido {order.orderNumber}</label><select id={`sales-order-status-${order.id}`} className="h-10 rounded-lg border border-gray-300 bg-white px-2 text-xs font-bold text-gray-900 disabled:opacity-50" disabled={updatingId === order.id} value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)}><option>Pendiente</option><option>En preparación</option><option>Entregado</option></select></div>
      </article>)}
    </div>}
  </div>;
}

export default SalesManager;