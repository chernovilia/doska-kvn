'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CITIES, SECTIONS } from '@/data/mock';
import { CheckCircle2, Camera, Sparkles, ArrowLeft, ArrowRight, Download } from 'lucide-react';
import { useState } from 'react';
import Modal from './Modal';

const STEPS = ['Город', 'Категория', 'Описание', 'Фото', 'Проверка'];

function isAvitoLink(text) {
  if (!text) return false;
  return /avito\.(ru|com)/i.test(text);
}

export default function PostAdModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    city: 'vyksa',
    section: 'market',
    title: '',
    price: '',
    description: '',
    photos: 0
  });
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    setStep(0);
    setForm({ city: 'vyksa', section: 'market', title: '', price: '', description: '', photos: 0 });
    setChecking(false);
    setDone(false);
  }

  function next() {
    if (step === STEPS.length - 1) {
      setChecking(true);
      setTimeout(() => {
        setChecking(false);
        setDone(true);
      }, 1600);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  const canNext =
    (step === 0 && form.city) ||
    (step === 1 && form.section) ||
    (step === 2 && form.title.trim().length > 3) ||
    (step === 3) ||
    step === 4;

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose?.();
        setTimeout(reset, 300);
      }}
      size="md"
    >
      <div className="p-5 md:p-6">
        <div className="text-xs uppercase tracking-wide text-brand-700 font-bold">
          Подать объявление
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold text-ink-900 mt-1">
          Займёт меньше минуты
        </h3>

        {/* Steps */}
        <div className="mt-4 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 grid place-items-center rounded-full text-xs font-bold ${
                  i <= step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-500'
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-[2px] rounded ${i < step ? 'bg-brand-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
          <div className="ml-auto text-xs text-ink-500">
            Шаг {step + 1} / {STEPS.length}
          </div>
        </div>

        {/* Body */}
        <div className="mt-5 min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step + (done ? 'done' : '') + (checking ? 'chk' : '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {done ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="mt-3 text-lg font-extrabold text-ink-900">
                    Объявление одобрено!
                  </div>
                  <div className="mt-1 text-sm text-ink-500">
                    Модерация прошла успешно. Объявление уже на витрине.
                  </div>
                </div>
              ) : checking ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-brand-100 text-brand-700 animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="mt-3 text-lg font-extrabold text-ink-900">
                    Модерация…
                  </div>
                  <div className="mt-1 text-sm text-ink-500">
                    Проверяем на запрещёнку, дубли и корректность цены
                  </div>
                </div>
              ) : step === 0 ? (
                <div>
                  <div className="text-sm font-semibold text-ink-700 mb-2">Выберите город</div>
                  <div className="grid grid-cols-2 gap-2">
                    {CITIES.filter((c) => c.id !== 'all').map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setForm((f) => ({ ...f, city: c.id }))}
                        className={`rounded-2xl px-4 py-4 text-left ring-1 transition ${
                          form.city === c.id
                            ? 'bg-brand-50 ring-brand-300 text-brand-800'
                            : 'bg-white ring-black/10 hover:bg-brand-50'
                        }`}
                      >
                        <div className="font-bold">{c.name}</div>
                        <div className="text-[12px] text-ink-500">Ваш город размещения</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : step === 1 ? (
                <div>
                  <div className="text-sm font-semibold text-ink-700 mb-2">Категория</div>
                  <div className="grid grid-cols-1 gap-2">
                    {SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setForm((f) => ({ ...f, section: s.id }))}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition ${
                          form.section === s.id
                            ? 'bg-brand-50 ring-brand-300'
                            : 'bg-white ring-black/10 hover:bg-brand-50'
                        }`}
                      >
                        <div className="text-2xl">{s.emoji}</div>
                        <div>
                          <div className="font-bold text-ink-900">{s.name}</div>
                          <div className="text-[12px] text-ink-500">{s.hint}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : step === 2 ? (
                <div className="space-y-3">
                  {/* Автодетект ссылки Авито */}
                  {isAvitoLink(form.title) || isAvitoLink(form.description) ? (
                    <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-3 flex items-start gap-3">
                      <Download className="w-5 h-5 text-emerald-700 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-emerald-800">
                          Ссылка на Авито распознана
                        </div>
                        <div className="text-[12px] text-emerald-700/90">
                          Мы можем автоматически подтянуть заголовок, цену и фото.
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            title: 'Импорт с Авито — заголовок подтянут',
                            price: f.price || '15000',
                            description:
                              f.description ||
                              'Описание автоматически импортировано с Авито. Проверьте и отредактируйте.',
                            photos: Math.max(f.photos, 3)
                          }))
                        }
                        className="shrink-0 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5"
                      >
                        Импортировать
                      </button>
                    </div>
                  ) : null}

                  <div>
                    <label className="text-sm font-semibold text-ink-700">Заголовок</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Например: Сдам 2-к квартиру в центре Выксы или вставьте ссылку с avito.ru"
                      className="mt-1 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-ink-700">Цена, ₽</label>
                    <input
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/\D/g, '') }))}
                      placeholder="18000"
                      inputMode="numeric"
                      className="mt-1 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-ink-700">Описание</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Опишите товар или услугу, состояние, условия…"
                      className="mt-1 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              ) : step === 3 ? (
                <div>
                  <div className="text-sm font-semibold text-ink-700 mb-2">Фотографии (демо)</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        onClick={() =>
                          setForm((f) => ({ ...f, photos: Math.min(6, f.photos + 1) }))
                        }
                        className={`aspect-square rounded-2xl grid place-items-center ring-1 transition ${
                          i < form.photos
                            ? 'bg-brand-50 ring-brand-300 text-brand-700'
                            : 'bg-slate-50 ring-black/10 text-ink-500 hover:bg-brand-50'
                        }`}
                      >
                        {i < form.photos ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Camera className="w-6 h-6" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-ink-500">
                    Загружено фото: <b>{form.photos}</b> из 6. Для демо тапайте по слотам.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-ink-700">Проверьте объявление</div>
                  <div className="rounded-2xl bg-slate-50 ring-1 ring-black/10 p-4 text-sm">
                    <div><b>Город:</b> {CITIES.find((c) => c.id === form.city)?.name}</div>
                    <div><b>Раздел:</b> {SECTIONS.find((s) => s.id === form.section)?.name}</div>
                    <div><b>Заголовок:</b> {form.title || <span className="text-ink-500">не указан</span>}</div>
                    <div><b>Цена:</b> {form.price ? `${form.price} ₽` : <span className="text-ink-500">по договорённости</span>}</div>
                    <div><b>Фото:</b> {form.photos}</div>
                  </div>
                  <p className="text-[12px] text-ink-500">
                    Нажимая «Опубликовать», вы соглашаетесь с правилами платформы «Доска/КВН».
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!done && !checking && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white ring-1 ring-black/10 px-4 py-3 text-sm font-semibold text-ink-700 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </button>
            <button
              onClick={next}
              disabled={!canNext}
              className="ml-auto inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white px-4 py-3 text-sm font-semibold"
            >
              {step === STEPS.length - 1 ? 'Опубликовать' : 'Далее'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
        {done && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                onClose?.();
                setTimeout(reset, 300);
              }}
              className="ml-auto inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 text-sm font-semibold"
            >
              Готово
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
