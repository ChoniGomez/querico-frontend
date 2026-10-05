import { useEffect, useState } from 'react';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { formatPrice } from '../data/products.js';

function CheckoutModal({ cart, subtotal, initialName, isOpen, onClose, onChangeQuantity, onSubmit }) {
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState(initialName);
  const [address, setAddress] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('overflow-hidden');
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('overflow-hidden');
    };
  }, [onClose]);

  const changeQuantity = (lineId, amount) => {
    onChangeQuantity(lineId, amount);
    setFormError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (deliveryType === 'delivery' && !address.trim()) {
      setFormError('Ingresá la dirección para el delivery.');
      return;
    }
    if (paymentMethod === 'cash' && cashAmount && Number(cashAmount) < subtotal) {
      setFormError('El monto indicado debe cubrir el subtotal del pedido.');
      return;
    }
    setFormError('');
    if (!customerName.trim()) {
      setFormError('Ingresá tu nombre para identificar el pedido.');
      return;
    }
    onSubmit({ name: customerName.trim(), deliveryType, address: address.trim(), paymentMethod, cashAmount });
  };

  return (
      <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-gray-950/60 p-3 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="my-auto max-h-[calc(100vh-24px)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <header className="mb-4 flex items-center justify-between">
          <div><p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">UN PASO MÁS</p><h2 id="checkout-title" className="font-display text-2xl font-extrabold">FINALIZAR PEDIDO</h2></div>
          <button className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 hover:bg-gray-50" type="button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button>
        </header>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-x-6 md:grid-cols-2">
            <label className="border-t border-gray-100 py-4 text-sm font-bold md:col-span-2" htmlFor="customer-name">
              Tu nombre
              <input className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20" id="customer-name" type="text" autoComplete="name" required value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nombre y apellido" />
            </label>
            <section className="border-t border-gray-100 py-4 md:col-span-2">
              <div className="mb-2 flex items-center justify-between"><h3 className="font-display font-extrabold">Tu pedido</h3><span className="text-xs text-gray-500">{cart.reduce((count, item) => count + item.quantity, 0)} productos</span></div>
              {cart.length === 0 ? <p className="text-sm text-gray-500">Tu pedido está vacío.</p> : cart.map((item) => (
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-3" key={item.lineId}>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <strong className="text-sm font-extrabold">{item.name}</strong>
                    {item.notes && <span className="truncate text-xs italic text-brand-green-dark">{item.notes}</span>}
                    <span className="text-xs text-gray-500">{formatPrice(item.price)} c/u</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 text-gray-600 hover:border-brand-red hover:text-brand-red" type="button" aria-label={`Restar ${item.name}`} onClick={() => changeQuantity(item.lineId, -1)}>{item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}</button>
                      <strong className="min-w-3 text-center text-sm">{item.quantity}</strong>
                      <button className="grid h-8 w-8 place-items-center rounded-full border border-gray-200 text-gray-600 hover:border-brand-green hover:text-brand-green-dark" type="button" aria-label={`Sumar ${item.name}`} onClick={() => changeQuantity(item.lineId, 1)}><Plus size={14} /></button>
                    </div>
                    <b className="min-w-20 text-right text-sm">{formatPrice(item.price * item.quantity)}</b>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-3 font-display font-extrabold"><strong>Subtotal</strong><strong>{formatPrice(subtotal)}</strong></div>
            </section>

            <section className="border-t border-gray-100 py-4">
              <h3 className="mb-3 font-display font-extrabold">Tipo de entrega</h3>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-bold ${deliveryType === 'delivery' ? 'border-brand-green bg-brand-green/10 text-brand-green-dark' : 'border-gray-200'}`}>
                  <input className="accent-brand-green" type="radio" name="delivery" value="delivery" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} /> Delivery
                </label>
                <label className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-bold ${deliveryType === 'pickup' ? 'border-brand-green bg-brand-green/10 text-brand-green-dark' : 'border-gray-200'}`}>
                  <input className="accent-brand-green" type="radio" name="delivery" value="pickup" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} /> Retiro local
                </label>
              </div>
              {deliveryType === 'delivery' && (
                <label className="mt-3 block text-sm font-bold" htmlFor="delivery-address">
                  Dirección completa
                  <input className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20" id="delivery-address" type="text" autoComplete="street-address" placeholder="Calle, número, piso y departamento" value={address} onChange={(event) => setAddress(event.target.value)} />
                </label>
              )}
            </section>

            <section className="border-t border-gray-100 py-4">
              <h3 className="mb-3 font-display font-extrabold">Método de pago</h3>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-bold ${paymentMethod === 'cash' ? 'border-brand-green bg-brand-green/10 text-brand-green-dark' : 'border-gray-200'}`}>
                  <input className="accent-brand-green" type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Efectivo
                </label>
                <label className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-bold ${paymentMethod === 'transfer' ? 'border-brand-green bg-brand-green/10 text-brand-green-dark' : 'border-gray-200'}`}>
                  <input className="accent-brand-green" type="radio" name="payment" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} /> Transferencia
                </label>
              </div>
              {paymentMethod === 'cash' && (
                <label className="mt-3 block text-sm font-bold" htmlFor="cash-amount">
                  ¿Con cuánto pagás? <span className="text-[10px] font-semibold text-gray-400">OPCIONAL</span>
                  <input className="mt-1.5 block h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20" id="cash-amount" type="number" min={subtotal} step="100" placeholder="Monto en pesos" value={cashAmount} onChange={(event) => setCashAmount(event.target.value)} />
                  {cashAmount && Number(cashAmount) >= subtotal && <small className="mt-1 block text-xs font-bold text-brand-green-dark">Vuelto estimado: {formatPrice(Number(cashAmount) - subtotal)}</small>}
                </label>
              )}
            </section>
          </div>
          {!isOpen && <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-brand-red" role="status">El local está cerrado. Podés revisar el pedido, pero no enviarlo por ahora.</p>}
          {formError && <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-brand-red" role="alert">{formError}</p>}
          <button className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green-dark px-4 text-center text-sm font-extrabold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={cart.length === 0 || !isOpen}>
            <span aria-hidden="true">◔</span> CONFIRMAR Y ENVIAR A WHATSAPP
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-500">Al confirmar, se abrirá WhatsApp con el detalle listo para enviar.</p>
        </form>
      </section>
    </div>
  );
}

export default CheckoutModal;