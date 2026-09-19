import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-black/5 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid gap-6 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-ink-500 max-w-xs">
            Городская платформа объявлений, услуг и афиши для агломерации Кулебаки — Выкса —
            Навашино.
          </p>
        </div>
        <div>
          <div className="text-sm font-bold text-ink-900 mb-2">Разделы</div>
          <ul className="space-y-1 text-sm text-ink-500">
            <li>Барахолка</li>
            <li>Услуги</li>
            <li>Недвижимость</li>
            <li>Афиша</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-bold text-ink-900 mb-2">Города</div>
          <ul className="space-y-1 text-sm text-ink-500">
            <li>Кулебаки</li>
            <li>Выкса</li>
            <li>Навашино</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-bold text-ink-900 mb-2">Контакты</div>
          <ul className="space-y-1 text-sm text-ink-500">
            <li>hello@doska-kvn.ru</li>
            <li>Telegram: @doska_kvn</li>
            <li>VK: vk.com/doska_kvn</li>
          </ul>
          <div className="text-[11px] text-ink-500/80 mt-2">
            Кулебаки • Выкса • Навашино · КВН
          </div>
        </div>
      </div>
      <div className="border-t border-black/5">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 text-xs text-ink-500 flex flex-wrap items-center gap-2 justify-between">
          <div>© {new Date().getFullYear()} Доска/КВН — демо для инвесторов.</div>
          <div>Работает на Next.js • Tailwind • Framer Motion</div>
        </div>
      </div>
    </footer>
  );
}
