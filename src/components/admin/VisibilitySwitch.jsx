function VisibilitySwitch({ checked, label, onChange }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        className="peer sr-only"
        type="checkbox"
        role="switch"
        checked={checked}
        aria-label={label}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-brand-green after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
      <span className="min-w-14 text-xs font-bold text-gray-600">{checked ? 'Mostrar' : 'Ocultar'}</span>
    </label>
  );
}

export default VisibilitySwitch;