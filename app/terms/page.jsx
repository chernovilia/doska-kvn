import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Условия использования',
  description:
    'Правила публикации объявлений и пользования сервисом Доска/КВН — Кулебаки, Выкса, Навашино.'
};

export default function TermsPage() {
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
          <ShieldCheck className="w-5 h-5 text-brand-700" />
          <div className="font-black tracking-tight text-lg text-ink-900">
            Условия использования
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6 text-[15px] text-ink-800 leading-relaxed">
        <p className="text-ink-500 text-sm">Редакция от 26 сентября 2026 года.</p>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">1. Общие положения</h2>
          <p>
            Настоящие Условия регулируют использование сервиса «Доска/КВН» —
            онлайн-платформы объявлений для агломерации Кулебаки — Выкса — Навашино,
            размещённой по адресу{' '}
            <Link href="/" className="text-brand-700 underline">
              доска-квн.рф
            </Link>
            . Регистрируясь и пользуясь сервисом, вы принимаете эти Условия и{' '}
            <Link href="/privacy" className="text-brand-700 underline">
              Политику конфиденциальности
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">2. Что можно и нельзя размещать</h2>
          <p>
            Мы стремимся к тому, чтобы Доска/КВН была полезной и безопасной. Поэтому
            <strong> запрещено</strong> размещать объявления, если они:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>нарушают законодательство РФ, содержат мошеннические схемы или обман;</li>
            <li>предлагают запрещённые товары и услуги (оружие, наркотики, поддельные документы, услуги финансовых пирамид и т.п.);</li>
            <li>содержат ссылки на вредоносные сайты, спам или заведомо ложную рекламу;</li>
            <li>нарушают права третьих лиц (авторские права, товарные знаки, персональные данные);</li>
            <li>оскорбляют или дискриминируют людей по любым признакам;</li>
            <li>дублируют другие ваши объявления с той же сутью в том же городе.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">3. Модерация</h2>
          <p>
            Администрация оставляет за собой право проверять объявления до или после
            публикации, отклонять их без объяснения причин и удалять любой контент,
            нарушающий эти Условия. При повторных нарушениях аккаунт может быть заблокирован.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">4. Ответственность</h2>
          <p>
            Пользователи публикуют объявления от своего имени и несут ответственность
            за достоверность указанной информации, качество товаров и услуг, а также
            за исполнение договорённостей с покупателями. Администрация сервиса не
            является стороной сделок и не участвует в спорах между пользователями.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">5. Оплата и тарифы</h2>
          <p>
            Базовое размещение объявлений — бесплатное. Тарифы для бизнес-аккаунтов
            и услуги продвижения (TOP, VIP) появятся позже; текущие цены и условия
            будут опубликованы на сайте до включения таких услуг. Стоимость услуг
            указана с учётом НДС, если применимо.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">6. Права на контент</h2>
          <p>
            Публикуя объявление, вы подтверждаете, что имеете права на все размещаемые
            материалы (фото, тексты) и предоставляете сервису бессрочную неисключительную
            лицензию на их хранение, показ и передачу через встроенные механизмы
            обмена ссылками (VK, мессенджеры, поисковые системы).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">7. Изменение Условий</h2>
          <p>
            Мы можем менять эти Условия. Актуальная редакция всегда доступна по этому
            адресу. О существенных изменениях мы уведомим через e-mail или уведомление
            в личном кабинете.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-extrabold text-ink-900 mb-2">8. Контакты</h2>
          <p>
            Вопросы, жалобы, запросы по обработке персональных данных:{' '}
            <a href="mailto:hello@доска-квн.рф" className="text-brand-700 underline">
              hello@доска-квн.рф
            </a>
          </p>
        </section>

        <div className="pt-4 text-sm text-ink-500">
          Смежные документы:{' '}
          <Link href="/privacy" className="text-brand-700 underline">
            Политика конфиденциальности
          </Link>
        </div>
      </main>
    </div>
  );
}
