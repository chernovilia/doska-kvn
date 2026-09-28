/**
 * Скелетон карточки объявления.
 * Показывается вместо AdCard, пока данные едут от API.
 * Размеры и внутренняя структура повторяют AdCard, чтобы не было layout shift.
 */
export default function AdCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 animate-pulse">
      {/* Фото */}
      <div className="aspect-square w-full bg-slate-200" />

      <div className="flex flex-1 flex-col gap-2 p-2.5 md:p-3">
        {/* Цена */}
        <div className="h-4 rounded bg-slate-200 w-1/2" />
        {/* Заголовок — 2 строки */}
        <div className="h-3 rounded bg-slate-200 w-5/6" />
        <div className="h-3 rounded bg-slate-200 w-3/5" />
        {/* Город и время */}
        <div className="mt-auto h-2.5 rounded bg-slate-200 w-2/3" />
      </div>
    </div>
  );
}
