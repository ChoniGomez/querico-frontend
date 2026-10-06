import { useState } from 'react';
import { ArrowLeft, Check, MapPin, UserRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AccountProfilePage() {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [address, setAddress] = useState(user.address || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      await updateProfile({ firstName, lastName, address });
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron guardar tus datos.');
    } finally {
      setSaving(false);
    }
  };

  const continueTo = location.state?.continueTo || (user.role === 'admin' ? '/admin' : '/mis-pedidos');

  return <main className="min-h-screen bg-[#f4f6ef] px-4 py-8 sm:py-12">
    <section className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-900/5">
      <header className="bg-brand-green-dark px-6 py-7 text-white sm:px-9">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/75 hover:text-white"><ArrowLeft size={16} /> Volver al menú</Link>
        <div className="mt-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15"><UserRound size={21} /></span>
          <div><p className="text-xs font-bold uppercase tracking-widest text-white/60">QUE RICO! CLUB</p><h1 className="font-display text-2xl font-extrabold">Mi cuenta</h1></div>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-6 text-white/75">Guardá tus datos para completar tus pedidos de forma rápida. Solo usamos el domicilio para entregas.</p>
      </header>
      <form className="space-y-5 px-6 py-7 sm:px-9" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-gray-800">Nombre
            <input className="mt-1.5 block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/15" autoComplete="given-name" required maxLength={100} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          </label>
          <label className="text-sm font-bold text-gray-800">Apellido
            <input className="mt-1.5 block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/15" autoComplete="family-name" required maxLength={100} value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </label>
        </div>
        <label className="block text-sm font-bold text-gray-800">Correo electrónico
          <input className="mt-1.5 block h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-500" type="email" autoComplete="email" readOnly value={user.email} />
          <span className="mt-1 block text-xs font-normal text-gray-400">Verificado por Google</span>
        </label>
        <label className="block text-sm font-bold text-gray-800"><span className="inline-flex items-center gap-1.5"><MapPin size={15} /> Dirección de entrega</span>
          <input className="mt-1.5 block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/15" autoComplete="street-address" required maxLength={500} placeholder="Calle, número, piso y departamento" value={address} onChange={(event) => setAddress(event.target.value)} />
        </label>
        {error && <p role="alert" className="text-sm font-semibold text-brand-red">{error}</p>}
        {saved && <p role="status" className="flex items-center gap-2 text-sm font-semibold text-green-700"><Check size={16} /> Datos guardados correctamente.</p>}
        <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
          <button className="min-h-11 rounded-lg bg-brand-red px-5 text-sm font-extrabold text-white transition hover:bg-brand-red-dark disabled:opacity-50" type="submit" disabled={saving}>{saving ? 'GUARDANDO...' : 'GUARDAR MIS DATOS'}</button>
          {saved && <button className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50" type="button" onClick={() => navigate(continueTo, { replace: true })}>Continuar</button>}
        </div>
      </form>
    </section>
  </main>;
}

export default AccountProfilePage;