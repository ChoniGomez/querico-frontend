const WHATSAPP_PHONE = '5493764560631';
import { calculateProductPricing } from './promotionPricing.js';

export function generarEnlaceWhatsApp(carrito, cliente) {
  if (carrito.length === 0) return null;

  const originalSubtotal = carrito.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  const subtotal = carrito.reduce((total, item) => {
    const productQuantity = carrito.filter((line) => String(line.id) === String(item.id)).reduce((quantity, line) => quantity + line.quantity, 0);
    return total + calculateProductPricing(item, item.quantity, productQuantity).total;
  }, 0);
  const savings = originalSubtotal - subtotal;
  const lines = carrito.map((item) => {
    const note = item.notes ? `\n   _Aclaración: ${item.notes}_` : '';
    const productQuantity = carrito.filter((line) => String(line.id) === String(item.id)).reduce((quantity, line) => quantity + line.quantity, 0);
    const pricing = calculateProductPricing(item, item.quantity, productQuantity);
    const discount = pricing.discountApplies ? `\n   _Promo ${pricing.discountPercent}%: ahorrás ${formatMoney(pricing.discountAmount)}_` : '';
    return `• ${item.quantity} x *${item.name}* — ${formatMoney(pricing.total)}${discount}${note}`;
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
    `*Subtotal: ${formatMoney(originalSubtotal)}*`,
    ...(savings > 0 ? [`*Descuento: -${formatMoney(savings)}*`] : []),
    `*Total: ${formatMoney(subtotal)}*`,
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