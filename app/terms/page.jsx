import LegalDoc from '@/components/LegalDoc';
import { loadLegal } from '@/lib/legal';

export const metadata = {
  title: 'Правила сервиса',
  description: 'Правила размещения объявлений и пользования сервисом Доска/КВН — Кулебаки, Выкса, Навашино.'
};

export default async function TermsPage() {
  const doc = await loadLegal('terms');
  return (
    <LegalDoc
      title={doc.title}
      date={doc.date}
      text={doc.text}
      related={{ href: '/privacy', label: 'Политика конфиденциальности' }}
    />
  );
}
