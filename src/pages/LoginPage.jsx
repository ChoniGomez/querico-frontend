import { useState } from 'react';
import { ArrowLeft, UserRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const login = async (response) => {
    try {
      if (!response.credential) throw new Error('Google no devolvió una credencial válida.');
      const user = await signInWithGoogle(response.credential);
      const destination = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/mis-pedidos');
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesión. Intentá nuevamente.');
    }
  };

  return <main className="grid min-h-screen place-items-center bg-gray-100 px-4 py-10">
    <section className="w-full max-w-md bg-white p-7 shadow-card sm:p-9">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900" to="/"><ArrowLeft size={16} /> Volver al menú</Link>
      <div className="mt-8 grid h-12 w-12 place-items-center rounded-xl bg-brand-green/15 text-brand-green-dark"><UserRound size={22} /></div>
      <h1 className="mt-4 font-display text-2xl font-extrabold">Ingresá a Que Rico!</h1><p className="mt-2 text-sm leading-6 text-gray-500">Accedé a tu cuenta y a tus pedidos con Google.</p>
      <div className="mt-6 flex min-h-12 justify-center"><GoogleLogin onSuccess={login} onError={() => setError('No se pudo iniciar sesión con Google. Intentá nuevamente.')} /></div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-brand-red">{error}</p>}
    </section>
  </main>;
}

export default LoginPage;