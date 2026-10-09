import { createContext, useContext, useState } from 'react';
import { products as initialProducts } from '../data/products.js';

const ShopContext = createContext(null);
const STORAGE_KEY = 'que-rico-shop';

const defaultShop = {
  isOpen: true,
  schedule: [
    { day: 'Lunes', enabled: true, from: '12:00', to: '23:00' },
    { day: 'Martes', enabled: true, from: '12:00', to: '23:00' },
    { day: 'Miércoles', enabled: true, from: '12:00', to: '23:00' },
    { day: 'Jueves', enabled: true, from: '12:00', to: '23:00' },
    { day: 'Viernes', enabled: true, from: '12:00', to: '23:00' },
    { day: 'Sábado', enabled: true, from: '12:00', to: '23:00' },
    { day: 'Domingo', enabled: true, from: '12:00', to: '23:00' },
  ],
  products: initialProducts,
  promotions: [],
};

function readShop() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultShop, ...saved } : defaultShop;
  } catch {
    return defaultShop;
  }
}

export function ShopProvider({ children }) {
  const [shop, setShop] = useState(readShop);

  const updateShop = (updates) => setShop((current) => {
    const next = { ...current, ...updates };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  });

  const value = {
    ...shop,
    setIsOpen: (isOpen) => updateShop({ isOpen }),
    setSchedule: (schedule) => updateShop({ schedule }),
    setProducts: (nextProducts) => {
      const products = typeof nextProducts === 'function'
        ? nextProducts(Array.isArray(shop.products) ? shop.products : initialProducts)
        : nextProducts;
      updateShop({ products: Array.isArray(products) ? products : initialProducts });
    },
    setPromotions: (promotions) => updateShop({ promotions }),
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop debe usarse dentro de ShopProvider.');
  return context;
}