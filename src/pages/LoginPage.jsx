import { useState } from 'react';
import { ArrowLeft, UserRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const continueTo = location.state?.from?.pathname || '/mis-pedidos';

  const login = async () => {
    try {
      await signInWithGoogle();
      navigate(continueTo, { replace: true });
    } catch {
      setError('No se pudo iniciar sesión. Intentá nuevamente.');
    }
  };

  return <main className="grid min-h-screen place-items-center bg-gray-100 px-4 py-10">
    <section className="w-full max-w-md bg-white p-7 shadow-card sm:p-9">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900" to="/"><ArrowLeft size={16} /> Volver al menú</Link>
      <div className="mt-8 grid h-12 w-12 place-items-center rounded-xl bg-brand-green/15 text-brand-green-dark"><UserRound size={22} /></div>
      <h1 className="mt-4 font-display text-2xl font-extrabold">Ingresá a Que Rico!</h1><p className="mt-2 text-sm leading-6 text-gray-500">Accedé a tu historial de pedidos con tu cuenta de cliente.</p>
      <button type="button" className="mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 text-sm font-bold hover:bg-gray-50" onClick={login}><span className="font-black text-lg text-brand-red">G</span>Ingresar con Google <span className="text-[10px] text-gray-400">(demo)</span></button>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-brand-red">{error}</p>}
      <Link className="mt-7 block border-t border-gray-100 pt-5 text-xs font-bold text-gray-500 hover:text-gray-900" to="/admin/login">Acceso administrador</Link>
    </section>
  </main>;
}

export default LoginPage;