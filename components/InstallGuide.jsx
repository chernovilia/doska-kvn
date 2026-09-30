'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDown,
  BellRing,
  Compass,
  Copy,
  EllipsisVertical,
  Menu,
  MonitorDown,
  Plus,
  Share,
  Smartphone,
  Sparkles,
  SquarePlus
} from 'lucide-react';
import Modal from './Modal';
import { useToast } from './Toast';
import { canPromptInstall, detectPlatform, onInstallAvailability, promptInstall, trackAppEvent } from '@/lib/pwa';

/**
 * Гайд «Установить приложение». Шаги — под платформу и браузер: на Android и в Chrome на
 * компьютере — одна кнопка (системное окно), на iPhone — «Поделиться» → «На экран Домой».
 * Кнопки браузера нарисованы как на экране: тёмное меню iOS, пункты меню Android.
 * reason: 'push' — открыт из предложения уведомлений (на iPhone пуши только у приложения).
 */
export default function InstallGuide({ open, onClose, onDismiss, reason }) {
  const { toast } = useToast();
  const [platform, setPlatform] = useState(null);
  const [canPrompt, setCanPrompt] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setCanPrompt(canPromptInstall());
    return onInstallAvailability(setCanPrompt);
  }, []);

  useEffect(() => {
    if (open) trackAppEvent('install_prompt_shown');
  }, [open]);

  async function install() {
    trackAppEvent('install_clicked');
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      toast('Готово! Доска/КВН на вашем экране');
      onClose?.();
    }
  }

  function later() {
    trackAppEvent('install_dismissed');
    onDismiss?.();
    onClose?.();
  }

  const guide = platform ? guideFor(platform, canPrompt) : null;

  return (
    <Modal open={open} onClose={later} size="sm">
      <div className="p-5 pb-6 space-y-3.5">
        <div className="flex items-center gap-3 pr-10">
          <img src="/icons/icon-192.png" alt="" className="w-12 h-12 rounded-2xl ring-1 ring-black/10 shadow-card shrink-0" />
          <div className="min-w-0">
            <div className="font-extrabold text-lg text-ink-900 leading-tight">Доска/КВН на экране телефона</div>
            <div className="text-[13px] text-ink-500">
              {reason === 'push'
                ? 'На iPhone уведомления приходят только в приложение'
                : 'Бесплатно, без App Store и Google Play'}
            </div>
          </div>
        </div>

        <ul className="space-y-1.5">
          <Benefit icon={Smartphone} title="Всегда под рукой">открывается с иконки, как приложение</Benefit>
          <Benefit icon={BellRing} title="Ничего не пропустите">ответы продавцов и покупателей сразу приходят уведомлением</Benefit>
          <Benefit icon={Sparkles} title="Скоро">уведомления о новых объявлениях в любимых категориях</Benefit>
        </ul>

        {guide && (
          <div className="rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4 space-y-3">
            <div className="text-[13px] font-bold uppercase tracking-wide text-ink-500">{guide.title}</div>
            {guide.kind === 'button' ? (
              <button onClick={install} className="w-full btn-primary h-12 rounded-2xl text-[15px]">
                <Plus className="w-5 h-5" />
                Установить
              </button>
            ) : (
              <ol className="space-y-3">
                {guide.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent-500 text-white text-[12px] font-bold grid place-items-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="text-[14px] text-ink-900 leading-snug">{s.text}</div>
                      {s.visual}
                      {s.hint && <div className="text-[12px] text-ink-500 leading-snug">{s.hint}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {guide.copyLink && <CopyLink />}
            {guide.pointDown && (
              <div className="flex items-center justify-center gap-1.5 pt-1 text-[12px] font-semibold text-accent-700">
                <ArrowDown className="w-4 h-4 animate-bounce" />
                Кнопки браузера — внизу экрана, под этим окном
              </div>
            )}
          </div>
        )}

        {platform?.os === 'ios' && guide?.kind !== 'button' && (
          <p className="text-[12px] text-ink-500 leading-snug">
            После установки откройте Доску с экрана «Домой» и войдите ещё раз — на iPhone приложение хранит вход
            отдельно от браузера.
          </p>
        )}

        <button onClick={later} className="w-full h-10 text-sm font-semibold text-ink-500 hover:text-ink-800">
          Не сейчас
        </button>
      </div>
    </Modal>
  );
}

// Одна строка на преимущество — чтобы инструкция помещалась на экран без прокрутки
function Benefit({ icon: Icon, title, children }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-lg bg-accent-100 text-accent-700 grid place-items-center shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0 text-[13px] leading-snug text-ink-500">
        <b className="text-ink-900 font-bold">{title}</b> — {children}
      </div>
    </li>
  );
}

// ── Нарисованные кнопки браузера ──────────────────────────────────

// Круглая кнопка панели браузера (как в Safari и ВК на iPhone)
function MockToolbarButton({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-10 h-10 rounded-full bg-white ring-1 ring-black/10 shadow-card grid place-items-center text-ink-900">
        <Icon className="w-5 h-5" strokeWidth={2} />
      </span>
      {label && <span className="text-[13px] font-semibold text-ink-700">{label}</span>}
    </span>
  );
}

// Пункт тёмного меню iOS «Поделиться»: русская подпись и английская — телефон может быть на любом языке
function MockIosRow({ icon: Icon, ru, en }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#3a3a3c] text-white px-4 py-2.5 max-w-[280px]">
      <Icon className="w-5 h-5 shrink-0" strokeWidth={1.8} />
      <div className="min-w-0 leading-tight">
        <div className="text-[14px]">{ru}</div>
        {en && <div className="text-[11px] text-white/60">{en}</div>}
      </div>
    </div>
  );
}

// Пункт меню Android (белое меню с тенью)
function MockMenuRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white ring-1 ring-black/10 shadow-card px-3 py-2 max-w-[280px] text-[14px] text-ink-900">
      {Icon && <Icon className="w-5 h-5 text-ink-700 shrink-0" />}
      {label}
    </div>
  );
}

function CopyLink() {
  const { toast } = useToast();
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      toast('Ссылка скопирована — вставьте её в браузере');
    } catch {
      toast(window.location.origin);
    }
  }
  return (
    <button onClick={copy} className="w-full btn-outline h-10 rounded-2xl text-sm">
      <Copy className="w-4 h-4" />
      Скопировать ссылку на сайт
    </button>
  );
}

// ── Инструкции по платформам ──────────────────────────────────────

const ADD_TO_HOME = <MockIosRow icon={SquarePlus} ru="На экран «Домой»" en="Add to Home Screen" />;
const IOS_ADD_BUTTON = (
  <span className="inline-block rounded-lg bg-white ring-1 ring-black/10 px-3 py-1 text-[14px] font-semibold text-[#0a84ff]">
    Добавить <span className="text-[11px] font-normal text-ink-500">/ Add</span>
  </span>
);

function guideFor({ os, browser, inApp }, canPrompt) {
  if (canPrompt) return { kind: 'button', title: 'Установка в одно нажатие' };

  if (os === 'ios') {
    if (browser === 'chrome') {
      return {
        title: 'Как установить в Chrome',
        steps: [
          { text: 'Нажмите «Поделиться» в адресной строке — вверху справа', visual: <MockToolbarButton icon={Share} /> },
          { text: 'Выберите пункт', visual: ADD_TO_HOME, hint: 'Нет в списке — пролистайте меню вниз' },
          { text: 'Нажмите «Добавить» в правом верхнем углу', visual: IOS_ADD_BUTTON }
        ]
      };
    }
    if (inApp && browser !== 'vk') {
      return {
        title: 'Сначала откройте в Safari',
        copyLink: true,
        steps: [
          { text: 'Нажмите «•••» или «Поделиться» в этом окне и выберите «Открыть в Safari»', visual: <MockToolbarButton icon={Compass} label="Safari" /> },
          { text: 'В Safari — «Поделиться» → «На экран „Домой“» → «Добавить»' }
        ]
      };
    }
    // Safari и встроенный браузер ВК — одинаково, через «Поделиться» на нижней панели
    return {
      title: browser === 'vk' ? 'Как установить из ВКонтакте' : 'Как установить в Safari',
      pointDown: true,
      steps: [
        browser === 'vk'
          ? { text: 'Нажмите «Поделиться» на панели внизу справа', visual: <MockToolbarButton icon={Share} /> }
          : {
              text: 'Нажмите «Поделиться» на панели браузера внизу',
              visual: <MockToolbarButton icon={Share} />,
              hint: 'В новых iOS кнопка может быть спрятана в «•••» — нажмите её сначала'
            },
        {
          text: 'Выберите пункт',
          visual: ADD_TO_HOME,
          hint: 'Не видно? Нажмите «Ещё» (View More) — пункт появится в списке'
        },
        { text: 'Нажмите «Добавить» в правом верхнем углу', visual: IOS_ADD_BUTTON }
      ]
    };
  }

  if (os === 'android') {
    if (inApp) {
      return {
        title: 'Сначала откройте в браузере',
        copyLink: true,
        steps: [
          { text: 'Нажмите меню вверху справа', visual: <MockToolbarButton icon={EllipsisVertical} /> },
          { text: 'Выберите «Открыть в браузере»', hint: 'Там установка займёт пару секунд' }
        ]
      };
    }
    if (browser === 'yandex') {
      return {
        title: 'Как установить в Яндекс Браузере',
        steps: [
          { text: 'Откройте меню браузера', visual: <MockToolbarButton icon={EllipsisVertical} /> },
          { text: 'Выберите пункт', visual: <MockMenuRow icon={SquarePlus} label="Добавить ярлык / На главный экран" /> },
          { text: 'Подтвердите «Добавить»' }
        ]
      };
    }
    if (browser === 'samsung') {
      return {
        title: 'Как установить в Samsung Internet',
        steps: [
          { text: 'Откройте меню внизу справа', visual: <MockToolbarButton icon={Menu} /> },
          { text: 'Выберите пункт', visual: <MockMenuRow icon={Plus} label="Добавить страницу на → Главный экран" /> }
        ]
      };
    }
    return {
      title: 'Как установить',
      steps: [
        { text: 'Откройте меню браузера вверху справа', visual: <MockToolbarButton icon={EllipsisVertical} /> },
        { text: 'Выберите пункт', visual: <MockMenuRow icon={SquarePlus} label="Установить приложение" />, hint: 'Или «Добавить на главный экран»' }
      ]
    };
  }

  return {
    title: 'Как установить на компьютер',
    steps: [
      {
        text: 'В Chrome, Edge или Яндекс Браузере нажмите значок установки в адресной строке',
        visual: <MockToolbarButton icon={MonitorDown} />,
        hint: 'Или меню браузера → «Установить Доска/КВН»'
      }
    ]
  };
}

