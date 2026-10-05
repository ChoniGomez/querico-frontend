import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, ShoppingBag, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

function AccountMenu() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return <button type="button" className="rounded-xl bg-white px-3 py-2.5 text-xs font-extrabold text-brand-ink transition hover:bg-gray-100" onClick={async () => { await signInWithGoogle(); }}>
      Ingresar con Google <span className="ml-1 text-[10px] text-gray-500">(demo)</span>
    </button>;
  }

  return (
    <div className="relative">
      <button type="button" className="flex items-center gap-2 rounded-xl bg-white/15 px-2 py-1.5 text-left hover:bg-white/25" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
        {user.photoURL ? <img src={user.photoURL} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-brand-green-dark"><UserRound size={16} /></span>}
        <span className="hidden max-w-28 truncate text-xs font-bold sm:block">{user.name}</span><ChevronDown size={15} />
      </button>
      {menuOpen && <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-1.5 text-sm text-gray-800 shadow-xl">
        {user.role === 'cliente' && <Link className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-gray-50" to="/mis-pedidos" onClick={() => setMenuOpen(false)}><ShoppingBag size={16} /> Mis pedidos</Link>}
        {user.role === 'administrador' && <Link className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-gray-50" to="/admin" onClick={() => setMenuOpen(false)}>Panel administrador</Link>}
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50" type="button" onClick={() => { signOut(); setMenuOpen(false); navigate('/'); }}><LogOut size={16} /> Cerrar sesión</button>
      </div>}
    </div>
  );
}

export default AccountMenu;