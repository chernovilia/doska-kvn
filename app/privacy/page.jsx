import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export const metadata = {
  title: 'Политика конфиденциальности',
  description:
    'Как Доска/КВН обрабатывает и защищает персональные данные пользователей.'
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-black/5 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 grid place-items-center rounded-full ring-1 ring-black/10 hover:bg-brand-50"
            aria-label="На главную"
          >
            <ArrowLeft className="w-4 h-4 text-ink-800" />
          </Link>
          <Lock className="w-5 h-5 text-brand-700" />
          <div className="font-black tracking-tight text-lg text-ink-900">
            Политика конфиденциальности
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6 text-[15px] text-ink-800 leading-relaxed">
        <p className="text-ink-500 text-sm">Редакция от 26 сентября 2026 года.</p>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">1. Кто мы</h2>
          <p>
            Сервис «Доска/КВН» — онлайн-платформа объявлений для агломерации
            Кулебаки — Выкса — Навашино. Мы обрабатываем персональные данные
            пользователей в соответствии с Федеральным законом № 152-ФЗ
            «О персональных данных».
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">2. Какие данные мы собираем</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Указанные вами:</strong> имя, e-mail, телефон (при выборе способа
              связи), домашний город, короткое «О себе».
            </li>
            <li>
              <strong>Публикуемый контент:</strong> тексты и фотографии объявлений.
            </li>
            <li>
              <strong>Технические:</strong> IP-адрес и User-Agent — для защиты от
              автоматизированных атак и подбора кодов входа. Хранятся не дольше 30 дней.
            </li>
            <li>
              <strong>Cookies:</strong> httpOnly cookies с идентификатором сессии
              (access_token, refresh_token). Не используем сторонних трекеров без
              явного согласия.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">3. Зачем мы это используем</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>для обеспечения работы сервиса и вашей авторизации;</li>
            <li>для отображения ваших объявлений и профиля другим пользователям;</li>
            <li>для отправки уведомлений на e-mail (можно отключить в настройках);</li>
            <li>для защиты от спама, мошенничества и злоупотреблений;</li>
            <li>для выполнения требований законодательства.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">4. Где хранятся данные</h2>
          <p>
            Все данные хранятся на серверах, физически размещённых на территории
            Российской Федерации:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Приложение и база данных — в облаке Amvera (РФ)</li>
            <li>Фото — в объектном хранилище Timeweb Cloud (РФ)</li>
            <li>Отправка писем — через сервис Unisender Go (РФ)</li>
          </ul>
          <p className="mt-2">
            Трансграничная передача персональных данных не осуществляется.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">5. Кому мы передаём данные</h2>
          <p>
            Мы не продаём и не передаём персональные данные третьим лицам, за
            исключением случаев:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>требований законодательства (по запросу уполномоченных органов);</li>
            <li>привлечения подрядчиков для инфраструктуры (хостинг, email-рассылка)
              — они действуют строго в наших интересах и не могут использовать данные самостоятельно;</li>
            <li>обмена ссылками через встроенные кнопки (публичные страницы
              объявлений и профилей видны любому в интернете).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">6. Ваши права</h2>
          <p>Вы можете в любой момент:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>отредактировать свои данные в разделе «Настройки»;</li>
            <li>удалить любое своё объявление;</li>
            <li>запросить удаление аккаунта и всех связанных данных — напишите нам на
              указанный ниже e-mail;</li>
            <li>отозвать согласие на обработку данных (это может ограничить возможности сервиса).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">7. Сроки хранения</h2>
          <p>
            Данные аккаунта хранятся, пока аккаунт активен. После удаления аккаунта
            данные удаляются в течение 30 дней, за исключением информации, которую
            мы обязаны хранить по закону (например, чеки о платежах). Технические
            логи очищаются автоматически через 30 дней.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">8. Дети</h2>
          <p>
            Сервис не предназначен для детей младше 14 лет. Мы сознательно не
            собираем данные несовершеннолетних. Если вам известно о таком случае —
            сообщите нам.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">9. Изменения политики</h2>
          <p>
            Мы можем обновлять эту Политику. Актуальная редакция всегда доступна по
            этому адресу. О существенных изменениях мы уведомим через e-mail или
            уведомление в личном кабинете.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">10. Контакты</h2>
          <p>
            Вопросы, запросы по обработке персональных данных, отзыв согласия:{' '}
            <a href="mailto:privacy@доска-квн.рф" className="text-brand-700 underline">
              privacy@доска-квн.рф
            </a>
          </p>
        </section>

        <div className="pt-4 text-sm text-ink-500">
          Смежные документы:{' '}
          <Link href="/terms" className="text-brand-700 underline">
            Условия использования
          </Link>
        </div>
      </main>
    </div>
  );
}
