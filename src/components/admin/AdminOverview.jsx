import { useState } from 'react';
import { useShop } from '../../context/ShopContext.jsx';

function AdminOverview() {
  const { isOpen, setIsOpen, schedule, setSchedule } = useShop();

  const updateDay = (index, updates) => setSchedule(schedule.map((item, dayIndex) => dayIndex === index ? { ...item, ...updates } : item));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-7"><p className="text-xs font-extrabold uppercase tracking-widest text-brand-green-dark">LOCAL</p><h1 className="mt-1 font-display text-3xl font-extrabold">Configuración</h1><p className="mt-2 text-sm text-gray-500">Estado de atención y horarios semanales.</p></div>
      <section className="border-b border-gray-200 pb-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h2 className="font-display text-lg font-extrabold">Estado del local</h2><p className="mt-1 text-sm text-gray-500">Al cerrar, el checkout no permitirá enviar pedidos.</p></div>
          <label className="flex cursor-pointer items-center gap-3">
            <span className={`text-sm font-extrabold ${isOpen ? 'text-green-700' : 'text-gray-500'}`}>{isOpen ? 'ABIERTO' : 'CERRADO'}</span>
            <input type="checkbox" role="switch" className="peer sr-only" checked={isOpen} onChange={(event) => setIsOpen(event.target.checked)} aria-label="Local abierto" />
            <span className="relative h-7 w-12 rounded-full bg-gray-300 transition peer-checked:bg-brand-green after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
          </label>
        </div>
      </section>
      <section className="pt-7">
        <div className="mb-4"><h2 className="font-display text-lg font-extrabold">Días y horarios</h2><p className="mt-1 text-sm text-gray-500">Los cambios se guardan en este navegador automáticamente.</p></div>
        <div className="divide-y divide-gray-200">
          {schedule.map((item, index) => <div className="grid grid-cols-[minmax(105px,1fr)_auto_auto] items-center gap-3 py-3 sm:grid-cols-[minmax(130px,1fr)_auto_140px_140px]" key={item.day}>
            <label className="flex items-center gap-2 text-sm font-bold"><input className="h-4 w-4 accent-brand-green" type="checkbox" checked={item.enabled} onChange={(event) => updateDay(index, { enabled: event.target.checked })} />{item.day}</label>
            <span className={`text-xs font-bold ${item.enabled ? 'text-green-700' : 'text-gray-400'}`}>{item.enabled ? 'Abierto' : 'Cerrado'}</span>
            <label className="text-[11px] font-semibold text-gray-500">Desde<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-900 disabled:bg-gray-100" type="time" value={item.from} disabled={!item.enabled} onChange={(event) => updateDay(index, { from: event.target.value })} /></label>
            <label className="text-[11px] font-semibold text-gray-500">Hasta<input className="mt-1 block h-10 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-900 disabled:bg-gray-100" type="time" value={item.to} disabled={!item.enabled} onChange={(event) => updateDay(index, { to: event.target.value })} /></label>
          </div>)}
        </div>
      </section>
    </div>
  );
}

export default AdminOverview;