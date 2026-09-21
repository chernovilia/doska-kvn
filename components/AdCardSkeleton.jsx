/**
 * Скелетон карточки объявления.
 * Показывается вместо AdCard, пока данные едут от API.
 * Размеры и внутренняя структура повторяют AdCard, чтобы не было layout shift.
 */
export default function AdCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 animate-pulse">
      {/* Обложка */}
      <div className="aspect-[4/3] w-full bg-slate-200" />

      {/* Тело */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Заголовок — 2 строки */}
        <div className="h-3 rounded bg-slate-200 w-5/6" />
        <div className="h-3 rounded bg-slate-200 w-4/6" />

        {/* Адрес */}
        <div className="h-2.5 rounded bg-slate-200 w-3/5 mt-1" />

        {/* Мета — прижата к низу */}
        <div className="mt-auto flex items-center gap-2">
          <div className="h-4 rounded-full bg-slate-200 w-1/3" />
          <div className="ml-auto h-3 rounded bg-slate-200 w-1/4" />
        </div>
      </div>
    </div>
  );
}
