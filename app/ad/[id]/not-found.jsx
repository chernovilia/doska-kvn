import { NotFoundScreen } from '@/app/not-found';

export const metadata = { title: 'Объявление не найдено', robots: { index: false } };

// Старая или чужая ссылка на объявление: его сняли, удалили или оно ещё на проверке.
export default function AdNotFound() {
  return (
    <NotFoundScreen
      title="Объявление не найдено"
      text="Его сняли с публикации или удалили — такое бывает, когда вещь уже продана. Посмотрите другие объявления."
    />
  );
}
