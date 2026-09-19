export default function Logo({ className = '' }) {
  return (
    <div className={`select-none font-black tracking-tight text-2xl md:text-3xl leading-none ${className}`}>
      <span>Доска</span>
      <span className="brand-slash">/</span>
      <span>КВН</span>
    </div>
  );
}
