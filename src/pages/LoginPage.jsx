import { useState } from 'react';
import { ArrowLeft, Check, Clock3, Crown, MailCheck, ReceiptText } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const { signInWithGoogle, signInWithEmail, registerWithEmail, verifyEmail, resendVerification } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [developmentCode, setDevelopmentCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', address: '' });

  const continueAfterLogin = (user) => {
    const requestedPath = location.state?.from?.pathname;
    const profileIsIncomplete = !user.firstName?.trim() || !user.lastName?.trim() || !user.address?.trim();
    const destination = user.role === 'admin'
      ? requestedPath || '/admin'
      : profileIsIncomplete ? '/mi-cuenta' : requestedPath || '/mis-pedidos';
    navigate(destination, { replace: true });
  };

  const loginWithGoogle = async (response) => {
    try {
      if (!response.credential) throw new Error('Google no devolvió una credencial válida.');
      const user = await signInWithGoogle(response.credential);
      continueAfterLogin(user);
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesión. Intentá nuevamente.');
    }
  };

  const submitEmailForm = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      if (mode === 'register') {
        if (form.password !== form.confirmPassword) throw new Error('Las contraseñas no coinciden.');
        const result = await registerWithEmail({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          address: form.address,
        });
        setPendingEmail(result.email);
        setDevelopmentCode(result.verificationCode || '');
        setVerificationCode(result.verificationCode || '');
        setNotice(result.message);
        setMode('verify');
      } else {
        const user = await signInWithEmail(form.email, form.password);
        continueAfterLogin(user);
      }
    } catch (requestError) {
      if (requestError.message?.includes('Verificá tu correo')) {
        setPendingEmail(form.email.trim().toLowerCase());
        setMode('verify');
      }
      setError(requestError.message || 'No se pudo completar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitVerification = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      const user = await verifyEmail(pendingEmail, verificationCode);
      continueAfterLogin(user);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo verificar el correo.');
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      const result = await resendVerification(pendingEmail);
      setDevelopmentCode(result.verificationCode || '');
      if (result.verificationCode) setVerificationCode(result.verificationCode);
      setNotice(result.message);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo reenviar el código.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateForm = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  return <main className="grid min-h-screen place-items-center bg-[#f4f6ef] px-4 py-10">
    <section className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-900/10">
      <div className="bg-brand-green-dark px-7 py-8 text-white sm:px-10">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-white/75 transition hover:text-white" to="/"><ArrowLeft size={16} /> Volver al menú</Link>
        <div className="mt-8 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-red text-white"><Crown size={24} /></span>
          <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-white/65">QUE RICO!</p><p className="font-display text-xl font-extrabold">CLUB</p></div>
        </div>
        <h1 className="mt-6 max-w-sm font-display text-3xl font-extrabold leading-tight">Tus pedidos, siempre a mano.</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-white/75">Entrá con Google y llevá el registro de tus compras y pedidos anteriores, rápido y sin vueltas.</p>
      </div>
      <div className="px-7 py-7 sm:px-10">
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><ReceiptText size={19} className="shrink-0 text-brand-red" /><span className="text-xs font-bold leading-5 text-gray-700">Historial detallado de compras</span></div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"><Clock3 size={19} className="shrink-0 text-brand-green-dark" /><span className="text-xs font-bold leading-5 text-gray-700">Repetí tus favoritos más rápido</span></div>
        </div>
        <div className="mb-5 flex min-h-12 justify-center"><GoogleLogin onSuccess={loginWithGoogle} onError={() => setError('No se pudo iniciar sesión con Google. Intentá nuevamente.')} /></div>
        <div className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"><span className="h-px flex-1 bg-gray-200" />O CON TU CORREO<span className="h-px flex-1 bg-gray-200" /></div>

        {mode !== 'verify' && <div className="mb-5 grid grid-cols-2 rounded-lg bg-gray-100 p-1" role="tablist" aria-label="Acceso a la cuenta">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={`min-h-10 rounded-md text-sm font-bold transition ${mode === 'login' ? 'bg-white text-brand-ink shadow-sm' : 'text-gray-500'}`} onClick={() => { setMode('login'); setError(''); setNotice(''); }}>Ingresar</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={`min-h-10 rounded-md text-sm font-bold transition ${mode === 'register' ? 'bg-white text-brand-ink shadow-sm' : 'text-gray-500'}`} onClick={() => { setMode('register'); setError(''); setNotice(''); }}>Crear cuenta</button>
        </div>}

        {mode === 'verify' ? <form className="space-y-4" onSubmit={submitVerification}>
          <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3 text-sm text-green-900"><MailCheck size={19} className="shrink-0" /><span>Enviamos un código de 6 dígitos a <strong>{pendingEmail}</strong>.</span></div>
          {developmentCode && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">Código de prueba local: <span className="font-mono text-sm">{developmentCode}</span></p>}
          <label className="block text-sm font-bold text-gray-800">Código de verificación
            <input className="mt-1.5 block h-12 w-full rounded-lg border border-gray-300 px-3 text-center font-mono text-xl tracking-[.3em] outline-none focus:border-brand-green" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
          </label>
          <button className="min-h-11 w-full rounded-lg bg-brand-red px-4 text-sm font-extrabold text-white hover:bg-brand-red-dark disabled:opacity-50" type="submit" disabled={submitting}>{submitting ? 'VERIFICANDO...' : 'VERIFICAR Y CONTINUAR'}</button>
          <button className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-900" type="button" onClick={resendCode} disabled={submitting}>Reenviar código</button>
          <button className="w-full py-1 text-xs font-bold text-gray-400 hover:text-gray-700" type="button" onClick={() => { setMode('login'); setError(''); setNotice(''); }}>Volver a ingresar</button>
        </form> : <form className="space-y-3" onSubmit={submitEmailForm}>
          {mode === 'register' && <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-gray-700">Nombre<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal outline-none focus:border-brand-green" autoComplete="given-name" maxLength={100} required value={form.firstName} onChange={updateForm('firstName')} /></label>
            <label className="text-xs font-bold text-gray-700">Apellido<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal outline-none focus:border-brand-green" autoComplete="family-name" maxLength={100} required value={form.lastName} onChange={updateForm('lastName')} /></label>
          </div>}
          <label className="block text-xs font-bold text-gray-700">Correo electrónico<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal outline-none focus:border-brand-green" type="email" autoComplete="email" required value={form.email} onChange={updateForm('email')} /></label>
          <label className="block text-xs font-bold text-gray-700">Contraseña<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal outline-none focus:border-brand-green" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 10 : undefined} maxLength={128} required value={form.password} onChange={updateForm('password')} />{mode === 'register' && <span className="mt-1 block font-normal text-gray-400">Usá entre 10 y 128 caracteres.</span>}</label>
          {mode === 'register' && <>
            <label className="block text-xs font-bold text-gray-700">Repetir contraseña<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal outline-none focus:border-brand-green" type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={form.confirmPassword} onChange={updateForm('confirmPassword')} /></label>
            <label className="block text-xs font-bold text-gray-700">Dirección de entrega<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 px-3 text-sm font-normal outline-none focus:border-brand-green" autoComplete="street-address" maxLength={500} required value={form.address} onChange={updateForm('address')} placeholder="Calle, número, piso y departamento" /></label>
          </>}
          <button className="min-h-11 w-full rounded-lg bg-brand-red px-4 text-sm font-extrabold text-white hover:bg-brand-red-dark disabled:opacity-50" type="submit" disabled={submitting}>{submitting ? 'PROCESANDO...' : mode === 'register' ? 'CREAR CUENTA' : 'INGRESAR CON EMAIL'}</button>
        </form>}
        {notice && <p role="status" className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700"><Check size={16} />{notice}</p>}
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-brand-red">{error}</p>}
        <p className="mt-5 text-center text-xs leading-5 text-gray-400">Al ingresar, tus datos de contacto se usan para completar tus pedidos.</p>
      </div>
    </section>
  </main>;
}

export default LoginPage;