import { LayoutDashboard, LogOut, Megaphone, Store, UtensilsCrossed } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/admin', label: 'Configuración', icon: Store, end: true },
  { to: '/admin/productos', label: 'Productos', icon: UtensilsCrossed },
  { to: '/admin/promociones', label: 'Promociones', icon: Megaphone },
];

function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="flex flex-col bg-gray-950 px-4 py-5 text-white lg:min-h-screen lg:px-5">
        <a href="/admin" className="flex items-center gap-3 px-2 font-display text-xl font-extrabold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-green text-gray-950">QR!</span>Que Rico!<span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-gray-400">Admin</span></a>
        <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col" aria-label="Navegación de administración">
          {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-brand-green text-gray-950' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}><Icon size={17} />{label}</NavLink>)}
        </nav>
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 lg:mt-auto">
          <div className="min-w-0"><p className="truncate text-sm font-bold">{user.name}</p><p className="text-xs text-gray-400">{user.email}</p></div>
          <button type="button" title="Cerrar sesión" aria-label="Cerrar sesión" className="rounded-lg p-2 text-gray-300 hover:bg-white/10 hover:text-white" onClick={() => { signOut(); navigate('/'); }}><LogOut size={18} /></button>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-7 sm:py-8 lg:px-10"><Outlet /></main>
    </div>
  );
}

export default AdminLayout;