import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useShop } from '../context/ShopContext.jsx';
import { categories as defaultCategories } from '../data/products.js';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/logo.png';
import AccountMenu from './public/AccountMenu.jsx';

function Header({ categories = defaultCategories }) {
  const { isOpen } = useShop();
  const { user } = useAuth();
  const [logoFailed, setLogoFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const navigateToCategory = (categoryId) => {
    setMenuOpen(false);
    document.getElementById(categoryId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header ref={headerRef} className="relative z-40 bg-brand-green text-white shadow-sm">
      <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link className="flex items-center gap-3" to="/" aria-label="Que Rico!, inicio">
          {!logoFailed && <img className="h-12 w-12 rounded-xl bg-white object-contain p-1" src={logo} alt="Logo Que Rico!" onError={() => setLogoFailed(true)} />}
          {logoFailed && <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-xl font-black text-brand-green">QR!</span>}
          <span className="font-display text-xl font-extrabold leading-none sm:text-2xl">Que Rico!</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <span className="hidden items-center gap-1.5 text-sm font-semibold sm:inline-flex"><MapPin size={16} /> Atención todos los días</span>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ${isOpen ? 'bg-white text-brand-green-dark' : 'bg-brand-green-dark text-white'}`}>
            <i className={`h-2 w-2 rounded-full ${isOpen ? 'bg-brand-green' : 'bg-red-300'}`} />{isOpen ? 'ABIERTO' : 'CERRADO'}
          </span>
          <div className="hidden sm:block"><AccountMenu /></div>
          <button className="grid h-10 w-10 place-items-center rounded-lg transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:hidden" type="button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        aria-label="Navegación móvil"
        aria-hidden={!menuOpen}
        className={`absolute inset-x-0 top-full z-50 origin-top border-t border-white/15 bg-brand-green-dark px-4 shadow-xl transition duration-200 ease-out sm:hidden ${menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible pointer-events-none -translate-y-2 opacity-0'}`}
      >
        <div className="mx-auto max-h-[calc(100dvh-76px)] max-w-6xl overflow-y-auto py-4">
          <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-white/10 px-3 py-2.5">
            <span className="inline-flex items-center gap-2 text-sm font-semibold"><MapPin size={16} /> Atención todos los días</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-brand-green-dark"><i className={`h-2 w-2 rounded-full ${isOpen ? 'bg-brand-green' : 'bg-red-500'}`} />{isOpen ? 'ABIERTO' : 'CERRADO'}</span>
          </div>
          <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-white/60">Categorías</p>
          <div className="divide-y divide-white/10">
            {categories.map((category) => <button key={category.id} type="button" className="flex min-h-11 w-full items-center justify-between px-3 text-left text-sm font-bold transition hover:bg-white/10" onClick={() => navigateToCategory(category.id)}>
              {category.label}<ChevronRight size={16} className="text-white/60" />
            </button>)}
          </div>
          <div className="mt-3 border-t border-white/15 pt-3">
            <Link to={user ? '/mi-cuenta' : '/ingresar'} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition hover:bg-white/10"><UserRound size={17} />Mi Cuenta</Link>
            {user?.role === 'customer' && <Link to="/mis-pedidos" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition hover:bg-white/10"><ShoppingBag size={17} />Mis pedidos</Link>}
            {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition hover:bg-white/10">Panel administrador</Link>}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;