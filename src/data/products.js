export const categories = [
  { id: 'promos', label: 'Promos y Combos' },
  { id: 'pizzas', label: 'Pizzas' },
  { id: 'burgers', label: 'Hamburguesas' },
  { id: 'empanadas', label: 'Empanadas' },
];

export const products = [
  { id: 'combo-familiar', category: 'promos', name: 'Combo familiar', description: 'Una pizza grande, 6 empanadas y una bebida de 1,5 L.', price: 24900, badge: 'PARA COMPARTIR', image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85' },
  { id: 'combo-pareja', category: 'promos', name: 'Combo de a dos', description: 'Pizza muzzarella mediana + 2 empanadas a elección.', price: 15900, badge: 'PROMO', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85' },
  { id: 'muzzarella', category: 'pizzas', name: 'Muzzarella', description: 'Salsa de tomate, muzzarella, aceitunas y orégano.', price: 12500, badge: 'CLÁSICA', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85' },
  { id: 'napolitana', category: 'pizzas', name: 'Napolitana', description: 'Muzzarella, rodajas de tomate fresco, ajo y albahaca.', price: 14900, badge: 'NUEVA', image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=900&q=85' },
  { id: 'doble-queso', category: 'burgers', name: 'Doble queso', description: 'Doble carne a la plancha, cheddar, pepinos y salsa de la casa.', price: 11900, badge: 'FAVORITA', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85' },
  { id: 'crispy-burger', category: 'burgers', name: 'Crispy pollo', description: 'Pollo crocante, lechuga fresca y mayo de ajo casera.', price: 10500, badge: 'NUEVA', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=85' },
  { id: 'empanada-carne', category: 'empanadas', name: 'Carne cortada a cuchillo', description: 'Carne tierna, cebolla, huevo y un toque de verdeo.', price: 1900, badge: null, image: 'https://images.unsplash.com/photo-1604467707321-70d5ac45adda?auto=format&fit=crop&w=900&q=85' },
  { id: 'empanada-jyq', category: 'empanadas', name: 'Jamón y queso', description: 'Jamón cocido y muzzarella, bien cremosos.', price: 1800, badge: null, image: 'https://images.unsplash.com/photo-1604467707321-70d5ac45adda?auto=format&fit=crop&w=900&q=85' },
];

export const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
}).format(price);