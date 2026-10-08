import { useEffect, useState } from 'react';
import { Clock3, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useShop } from '../../context/ShopContext.jsx';
import { formatPrice } from '../../data/products.js';
import { apiRequest } from '../../utils/api.js';

function AdminOverview() {
  const { isOpen, setIsOpen, schedule, setSchedule } = useShop();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => {
    apiRequest('/api/orders/all', { token: user.token })
      .then(setOrders)
      .catch((error) => setOrdersError(error.message))
      .finally(() => setLoadingOrders(false));
  }, [user.token]);

  const updateDay = (index, updates) => setSchedule(schedule.map((item, dayIndex) => dayIndex === index ? { ...item, ...updates } : item));

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        token: user.token,
        body: JSON.stringify({ status }),
      });
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
    } catch (error) {
      setOrdersError(error.message);
    }
  };

  const filteredOrders = orders.filter((order) => String(order.orderNumber || '').includes(orderSearch.trim().replace(/^#/, '')));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-7"><p className="text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">LOCAL</p><h1 className="mt-1 font-display text-3xl font-extrabold">Configuración</h1><p className="mt-2 text-sm text-gray-500">Estado de atención y horarios semanales.</p></div>
      <section className="border-b border-gray-200 pb-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="font-display text-lg font-extrabold">Estado del local</h2><p className="mt-1 text-sm text-gray-500">Al cerrar, el checkout no permitirá enviar pedidos.</p></div>
          <label className="flex cursor-pointer items-center gap-3">
            <span className={`text-sm font-extrabold ${isOpen ? 'text-green-700' : 'text-gray-500'}`}>{isOpen ? 'ABIERTO' : 'CERRADO'}</span>
            <input type="checkbox" role="switch" className="peer sr-only" checked={isOpen} onChange={(event) => setIsOpen(event.target.checked)} aria-label="Local abierto" />
            <span className="relative h-7 w-12 rounded-full bg-gray-300 transition peer-checked:bg-brand-green after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
          </label>
        </div>
      </section>
      <section className="pt-7">
        <div className="mb-4"><h2 className="font-display text-lg font-extrabold">Días y horarios</h2><p className="mt-1 text-sm text-gray-500">Los cambios se guardan en este navegador automáticamente.</p></div>
        <div className="divide-y divide-gray-200">
          {schedule.map((item, index) => <div className="grid grid-cols-[minmax(105px,1fr)_auto_auto] items-center gap-3 py-3 sm:grid-cols-[minmax(130px,1fr)_auto_140px_140px]" key={item.day}>
            <label className="flex items-center gap-2 text-sm font-bold"><input className="h-4 w-4 accent-brand-green" type="checkbox" checked={item.enabled} onChange={(event) => updateDay(index, { enabled: event.target.checked })} />{item.day}</label>
            <span className={`text-xs font-bold ${item.enabled ? 'text-green-700' : 'text-gray-400'}`}>{item.enabled ? 'Abierto' : 'Cerrado'}</span>
            <label className="text-[11px] font-semibold text-gray-500">Desde<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-900 disabled:bg-gray-100" type="time" value={item.from} disabled={!item.enabled} onChange={(event) => updateDay(index, { from: event.target.value })} /></label>
            <label className="text-[11px] font-semibold text-gray-500">Hasta<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-900 disabled:bg-gray-100" type="time" value={item.to} disabled={!item.enabled} onChange={(event) => updateDay(index, { to: event.target.value })} /></label>
          </div>)}
        </div>
      </section>
      <section className="mt-10 border-t border-gray-200 pt-7">
        <div className="mb-4"><p className="text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">VENTAS</p><h2 className="mt-1 font-display text-xl font-extrabold">Pedidos recientes</h2></div>
        {loadingOrders && <p className="py-4 text-sm text-gray-500">Cargando pedidos...</p>}
        {ordersError && <p role="alert" className="py-4 text-sm font-semibold text-brand-red">{ordersError}</p>}
        {!loadingOrders && !ordersError && orders.length === 0 && <p className="py-4 text-sm text-gray-500">Todavía no hay pedidos registrados.</p>}
        {orders.length > 0 && <label className="relative mb-4 block max-w-sm">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <span className="sr-only">Buscar por número de pedido</span>
          <input className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/15" inputMode="numeric" type="search" placeholder="Buscar pedido #1001" value={orderSearch} onChange={(event) => setOrderSearch(event.target.value.replace(/[^\d#]/g, ''))} />
        </label>}
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {filteredOrders.map((order) => <article className="flex flex-wrap items-center justify-between gap-4 py-4" key={order.id}>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">#{order.orderNumber} · {order.customerName}</h3><span className="text-xs text-gray-500">{order.customerEmail || 'Pedido de invitado'}</span></div>
              <p className="mt-1 text-sm text-gray-600">{order.items.map((item) => `${item.quantity} ${item.name}`).join(', ')}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400"><Clock3 size={12} />{new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt))}</p>
            </div>
            <div className="flex items-center gap-3"><strong className="text-sm">{formatPrice(Number(order.total))}</strong><label className="sr-only" htmlFor={`order-status-${order.id}`}>Estado del pedido {order.id}</label><select id={`order-status-${order.id}`} className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-xs font-bold" value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)}><option>Pendiente</option><option>En preparación</option><option>Entregado</option></select></div>
          </article>)}
          {orders.length > 0 && filteredOrders.length === 0 && <p className="py-6 text-center text-sm text-gray-500">No hay pedidos con ese número.</p>}
        </div>
      </section>
    </div>
  );
}

export default AdminOverview;