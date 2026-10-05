import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Menu } from 'lucide-react';
import { useShop } from '../context/ShopContext.jsx';
import logo from '../assets/logo.png';
import AccountMenu from './public/AccountMenu.jsx';

function Header() {
  const { isOpen } = useShop();
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="bg-brand-green text-white shadow-sm">
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
          <a className="hidden rounded-xl bg-brand-red px-4 py-2.5 text-xs font-extrabold shadow-sm transition hover:bg-brand-red-dark sm:inline-flex" href="#promos">HACÉ TU PEDIDO</a>
          <AccountMenu />
          <button className="rounded-lg p-2 hover:bg-white/15 sm:hidden" type="button" aria-label="Ir al menú" onClick={() => document.getElementById('promos')?.scrollIntoView({ behavior: 'smooth' })}><Menu size={21} /></button>
        </div>
      </div>
    </header>
  );
}

export default Header;