import { notFound, redirect } from 'next/navigation';
import AdsView from '@/components/AdsView';
import { CITIES, DEFAULT_REGION_ID, REGIONS } from '@/data/regions';

/**
 * Динамический роут /[place].
 * place может быть id региона (kvn) или id города (vyksa).
 * /kvn совпадает с корнем — редиректим, чтобы не плодить дублирующий контент.
 * Всё что не резолвится — 404.
 */
export default function PlacePage({ params }) {
  const place = params.place;

  if (place === DEFAULT_REGION_ID) {
    redirect('/');
  }

  const region = REGIONS.find((r) => r.id === place);
  const city = CITIES.find((c) => c.id === place);
  if (!region && !city) notFound();

  return <AdsView place={place} />;
}

// Заранее генерируем все известные места на этапе сборки.
export function generateStaticParams() {
  return [
    ...REGIONS.map((r) => ({ place: r.id })),
    ...CITIES.map((c) => ({ place: c.id }))
  ];
}
