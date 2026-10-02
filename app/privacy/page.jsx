import LegalDoc from '@/components/LegalDoc';
import { loadLegal } from '@/lib/legal';

export const metadata = {
  title: 'Политика конфиденциальности',
  description: 'Какие данные собирает Доска/КВН, зачем, где они хранятся и как ими управлять.'
};

export default async function PrivacyPage() {
  const doc = await loadLegal('privacy');
  return (
    <LegalDoc
      title={doc.title}
      date={doc.date}
      text={doc.text}
      related={{ href: '/terms', label: 'Правила сервиса' }}
    />
  );
}
