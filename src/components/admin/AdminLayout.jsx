import { BadgeDollarSign, LogOut, Megaphone, Menu, Store, Tags, UtensilsCrossed, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/admin', label: 'Configuración', icon: Store, end: true },
  { to: '/admin/productos', label: 'Productos', icon: UtensilsCrossed },
  { to: '/admin/categorias', label: 'Categorías', icon: Tags },
  { to: '/admin/promociones', label: 'Promociones', icon: Megaphone },
  { to: '/admin/ventas', label: 'Ventas', icon: BadgeDollarSign, section: 'sales' },
];

function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches);

  const closeSidebarOnMobile = () => {
    if (window.matchMedia('(max-width: 1023px)').matches) setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        {sidebarOpen && <>
          <button className="fixed inset-0 z-40 bg-gray-950/55 lg:hidden" type="button" aria-label="Cerrar menú de administración" onClick={() => setSidebarOpen(false)} />
          <aside id="admin-sidebar" className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gray-950 px-4 py-5 text-white shadow-2xl transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:w-64 lg:shrink-0 lg:shadow-none">
            <div className="flex items-center justify-between">
              <a href="/admin" className="flex items-center gap-3 px-2 font-display text-xl font-extrabold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-green text-gray-950">QR!</span>Que Rico!<span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-gray-400">Admin</span></a>
              <button className="grid h-9 w-9 place-items-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white lg:hidden" type="button" aria-label="Cerrar menú" onClick={() => setSidebarOpen(false)}><X size={19} /></button>
            </div>
            <nav className="mt-8 flex flex-1 flex-col gap-2 overflow-y-auto" aria-label="Navegación de administración">
              {links.map(({ to, label, icon: Icon, end, section }) => <NavLink key={to} to={to} end={end} onClick={closeSidebarOnMobile} className={({ isActive }) => `flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${section === 'sales' ? 'mt-4 border-t border-white/15 pt-5' : ''} ${isActive ? 'bg-brand-green text-gray-950' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}><Icon size={17} />{label}</NavLink>)}
            </nav>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <div className="min-w-0"><p className="truncate text-sm font-bold">{user.name}</p><p className="truncate text-xs text-gray-400">{user.email}</p></div>
              <button type="button" title="Cerrar sesión" aria-label="Cerrar sesión" className="rounded-lg p-2 text-gray-300 hover:bg-white/10 hover:text-white" onClick={() => { signOut(); navigate('/'); }}><LogOut size={18} /></button>
            </div>
          </aside>
        </>}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-10">
            <button className="grid h-9 w-9 place-items-center rounded-lg text-gray-700 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green" type="button" aria-label={sidebarOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'} aria-expanded={sidebarOpen} aria-controls="admin-sidebar" onClick={() => setSidebarOpen((open) => !open)}>{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
            <span className="text-sm font-bold text-gray-700">Panel de administración</span>
          </header>
          <div className="min-w-0 px-4 py-6 sm:px-7 sm:py-8 lg:px-10"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;