const WHATSAPP_PHONE = '5493764560631';

export function generarEnlaceWhatsApp(carrito, cliente) {
  if (carrito.length === 0) return null;

  const subtotal = carrito.reduce((total, item) => total + item.price * item.quantity, 0);
  const lines = carrito.map((item) => {
    const note = item.notes ? `\n   _Aclaración: ${item.notes}_` : '';
    return `• ${item.quantity} x *${item.name}* — ${formatMoney(item.price * item.quantity)}${note}`;
  });
  const delivery = cliente.deliveryType === 'delivery'
    ? `Delivery\nDirección: ${cliente.address}`
    : 'Retiro local';
  const payment = cliente.paymentMethod === 'cash'
    ? `Efectivo${cliente.cashAmount ? ` (paga con ${formatMoney(Number(cliente.cashAmount))})` : ''}`
    : 'Transferencia';

  const message = [
    `*¡Hola Que Rico!* 👋 Soy ${cliente.name || 'un cliente'} y quiero hacer un pedido...`,
    '',
    ...lines,
    '',
    `*Subtotal: ${formatMoney(subtotal)}*`,
    '',
    `*Entrega:* ${delivery}`,
    `*Pago:* ${payment}`,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(value);
}