import { useState } from 'react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AdminLoginPage() {
  const { signInAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      await signInAdmin(email, password);
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return <main className="grid min-h-screen place-items-center bg-gray-950 px-4 py-10">
    <section className="w-full max-w-md bg-white p-7 shadow-2xl sm:p-9">
      <Link className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900" to="/"><ArrowLeft size={16} /> Volver al menú</Link>
      <div className="mt-8 grid h-12 w-12 place-items-center rounded-xl bg-gray-950 text-white"><LockKeyhole size={21} /></div>
      <h1 className="mt-4 font-display text-2xl font-extrabold">Acceso administrador</h1><p className="mt-2 text-sm leading-6 text-gray-500">Ingresá con las credenciales administrativas configuradas en el servidor.</p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-bold">Correo<input className="mt-1.5 block h-11 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal outline-none focus:border-brand-green" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="block text-sm font-bold">Contraseña<input className="mt-1.5 block h-11 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal outline-none focus:border-brand-green" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <p role="alert" className="text-sm font-semibold text-brand-red">{error}</p>}
        <button className="min-h-11 w-full rounded-lg bg-gray-950 px-4 text-sm font-extrabold text-white hover:bg-gray-800" type="submit">Ingresar</button>
      </form>
    </section>
  </main>;
}

export default AdminLoginPage;