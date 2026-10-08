import { useEffect, useState } from 'react';
import { categories as starterCategories, products as starterProducts } from '../data/products.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useShop } from '../context/ShopContext.jsx';
import CartButton from '../components/CartButton.jsx';
import CategoryNav from '../components/CategoryNav.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';
import Header from '../components/Header.jsx';
import CatalogProductList from '../components/public/CatalogProductList.jsx';
import PromotionList from '../components/public/PromotionList.jsx';
import ProductModal from '../components/ProductModal.jsx';
import { generarEnlaceWhatsApp } from '../utils/whatsapp.js';
import { apiRequest } from '../utils/api.js';
import { calculateProductPricing } from '../utils/promotionPricing.js';

function CatalogPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [databaseCategories, setDatabaseCategories] = useState(null);
  const [databaseProducts, setDatabaseProducts] = useState(null);
  const [promotionError, setPromotionError] = useState('');
  const { user, updateProfile } = useAuth();
  const { isOpen, products, promotions } = useShop();

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest('/api/categories'), apiRequest('/api/products')])
      .then(([categories, catalogProducts]) => {
        if (!active) return;
        setDatabaseCategories(categories.map((category) => ({
          id: category.id,
          label: category.name,
        })));
        setDatabaseProducts(catalogProducts);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const addToCart = (product, quantity, notes = '', promotionName = null) => {
    const lineId = `${product.id}-${notes.trim().toLowerCase()}`;
    setCart((currentCart) => {
      const existingLine = currentCart.find((item) => item.lineId === lineId);
      if (existingLine) return currentCart.map((item) => item.lineId === lineId ? { ...item, quantity: item.quantity + quantity, promotionName: promotionName || item.promotionName } : item);
      return [...currentCart, { ...product, lineId, quantity, notes: notes.trim(), promotionName }];
    });
    setSelectedProduct(null);
  };

  const changeQuantity = (lineId, amount) => setCart((currentCart) => currentCart
    .map((item) => item.lineId === lineId ? { ...item, quantity: item.quantity + amount } : item)
    .filter((item) => item.quantity > 0));

  const addPromotionToCart = (promotion, product, quantity) => {
    if (!product || product.isPurchasable === false || (product.stock !== null && product.stock < quantity)) {
      setPromotionError('Esta promoción ya no está disponible o no tiene stock suficiente.');
      return;
    }
    setPromotionError('');
    addToCart(product, quantity, '', promotion.name);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => {
    const productQuantity = cart
      .filter((line) => String(line.id) === String(item.id))
      .reduce((quantity, line) => quantity + line.quantity, 0);
    return total + calculateProductPricing(item, item.quantity, productQuantity).total;
  }, 0);

  const sendOrder = async (customer) => {
    if (!isOpen) return;
    const url = generarEnlaceWhatsApp(cart, { ...customer, name: customer.name || user?.name });
    if (!url) return;
    const whatsappWindow = window.open('', '_blank');
    try {
      await apiRequest('/api/orders', {
        method: 'POST',
        token: user?.token,
        body: JSON.stringify({
          customerName: customer.name || user?.name,
          customerEmail: customer.email,
          deliveryType: customer.deliveryType,
          address: customer.address,
          paymentMethod: customer.paymentMethod,
          cashAmount: customer.cashAmount,
          items: cart.map(({ id, name, quantity, price, notes }) => ({ productId: id, name, quantity, price, notes })),
        }),
      });
      if (whatsappWindow && !whatsappWindow.closed) whatsappWindow.location.href = url;
      else window.location.assign(url);
    } catch (error) {
      whatsappWindow?.close();
      throw error;
    }
  };

  return (
    <div className="min-h-screen min-w-[320px] scroll-smooth bg-gray-100 text-gray-900" id="top">
      <Header categories={databaseCategories || starterCategories} />
      <CategoryNav categories={databaseCategories || starterCategories} />
      <main className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <section className="my-6 grid overflow-hidden rounded-2xl bg-white shadow-sm sm:my-8 sm:grid-cols-[1.1fr_.9fr]" aria-labelledby="menu-title">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[.18em] text-brand-green">SABOR CASERO, SIEMPRE</p>
            <h1 id="menu-title" className="font-display text-4xl font-extrabold leading-[1.04] sm:text-5xl">HOY SE COME <span className="text-brand-red">RICO.</span></h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">Tus favoritos, recién hechos y directo a tu mesa. Elegí algo rico para compartir.</p>
          </div>
          <div className="relative min-h-48 sm:min-h-64">
            <img className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=85" alt="Pizza recién horneada" />
            <span className="absolute bottom-4 right-4 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-brand-green-dark shadow-sm">HECHO CON GANAS</span>
          </div>
        </section>
        {promotionError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-brand-red" role="alert">{promotionError}</p>}
        <PromotionList promotions={promotions} products={databaseProducts || products || starterProducts} onAddPromotion={addPromotionToCart} />
        <CatalogProductList categories={databaseCategories || starterCategories} products={databaseProducts || products || starterProducts} onAdd={setSelectedProduct} />
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 py-6 text-xs font-semibold text-gray-500">
          <span>QUE RICO! <span className="text-brand-green-dark">BUEN SABOR, BUENOS MOMENTOS.</span></span><span>HECHO CON AMOR Y MUCHO QUESO</span>
        </footer>
      </main>
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onConfirm={addToCart} />}
      {totalItems > 0 && <CartButton itemCount={totalItems} subtotal={subtotal} onClick={() => setCheckoutOpen(true)} />}
      {checkoutOpen && <CheckoutModal cart={cart} subtotal={subtotal} initialName={user?.name || ''} user={user} onUpdateProfile={updateProfile} isOpen={isOpen} onClose={() => setCheckoutOpen(false)} onChangeQuantity={changeQuantity} onSubmit={sendOrder} />}
    </div>
  );
}

export default CatalogPage;