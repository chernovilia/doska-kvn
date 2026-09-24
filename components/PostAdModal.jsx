'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CITIES, SECTIONS, getCategoryGroups, createAd } from '@/lib/api';
import { CheckCircle2, Camera, Sparkles, ArrowLeft, ArrowRight, Download, ChevronRight, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import { useAuth } from '@/lib/auth';

const STEPS = ['Город', 'Раздел', 'Категория', 'Описание', 'Фото', 'Проверка'];

function isAvitoLink(text) {
  if (!text) return false;
  return /avito\.(ru|com)/i.test(text);
}

function defaultCity(user) {
  return user?.homeCityId || 'vyksa';
}

export default function PostAdModal({ open, onClose }) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => ({
    city: defaultCity(user),
    section: 'market',
    group: null,
    category: null,
    title: '',
    price: '',
    description: '',
    photos: 0
  }));
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);
  const [publishedAdId, setPublishedAdId] = useState(null);
  const [error, setError] = useState(null);

  const groups = getCategoryGroups(form.section);

  // При смене раздела — сбрасываем выбор подкатегории.
  useEffect(() => {
    setForm((f) => ({ ...f, group: null, category: null }));
  }, [form.section]);

  // Если юзер загрузился позже и у него есть homeCityId — подставим дефолт.
  useEffect(() => {
    if (user?.homeCityId) {
      setForm((f) => (f.city === 'vyksa' ? { ...f, city: user.homeCityId } : f));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.homeCityId]);

  function reset() {
    setStep(0);
    setForm({
      city: defaultCity(user),
      section: 'market',
      group: null,
      category: null,
      title: '',
      price: '',
      description: '',
      photos: 0
    });
    setChecking(false);
    setDone(false);
    setPublishedAdId(null);
    setError(null);
  }

  async function publish() {
    setError(null);
    setChecking(true);
    try {
      const payload = {
        title: form.title.trim(),
        section: form.section,
        cityId: form.city,
        categoryGroup: form.group || undefined,
        category: form.category || undefined,
        price: form.price ? Number(form.price) : 0,
        description: form.description?.trim() || undefined
      };
      const ad = await createAd(payload);
      setPublishedAdId(ad.id);
      setDone(true);
    } catch (err) {
      setError(err.message || 'Не удалось опубликовать');
    } finally {
      setChecking(false);
    }
  }

  function next() {
    if (step === STEPS.length - 1) {
      publish();
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
    (step === 2 && form.category) ||
    (step === 3 && form.title.trim().length > 3) ||
    step === 4 ||
    step === 5;

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
        <div className="mt-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 shrink-0">
              <div
                className={`w-7 h-7 grid place-items-center rounded-full text-xs font-bold shrink-0 ${
                  i <= step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-500'
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-4 h-[2px] rounded shrink-0 ${i < step ? 'bg-brand-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
          <div className="ml-auto text-xs text-ink-500 shrink-0 pl-2">
            {step + 1} / {STEPS.length}
          </div>
        </div>

        {/* Body */}
        <div className="mt-5 min-h-[280px]">
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
                    Объявление опубликовано!
                  </div>
                  <div className="mt-1 text-sm text-ink-500">
                    Оно уже видно всем в вашем городе.
                  </div>
                </div>
              ) : checking ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-brand-100 text-brand-700 animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="mt-3 text-lg font-extrabold text-ink-900">
                    Публикуем…
                  </div>
                  <div className="mt-1 text-sm text-ink-500">
                    Сохраняем объявление и отправляем на витрину
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
                  <div className="text-sm font-semibold text-ink-700 mb-2">Раздел</div>
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
                <div>
                  <div className="text-sm font-semibold text-ink-700 mb-2">
                    Категория
                    {form.category && (
                      <span className="ml-2 text-brand-700">
                        {form.group} → {form.category}
                      </span>
                    )}
                  </div>

                  {!form.group ? (
                    <div className="grid grid-cols-1 gap-1.5">
                      {groups.map((g) => (
                        <button
                          key={g.name}
                          onClick={() => setForm((f) => ({ ...f, group: g.name }))}
                          className="flex items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left ring-1 ring-black/10 bg-white hover:bg-brand-50 transition"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-ink-900">{g.name}</div>
                            <div className="text-[12px] text-ink-500 truncate">
                              {g.items.slice(0, 3).join(' · ')}
                              {g.items.length > 3 && ` и ещё ${g.items.length - 3}`}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-ink-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => setForm((f) => ({ ...f, group: null, category: null }))}
                        className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-ink-800"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Все группы
                      </button>
                      <div className="text-[12px] uppercase tracking-wide text-ink-500 font-bold mb-1.5">
                        {form.group}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(groups.find((g) => g.name === form.group)?.items || []).map((c) => (
                          <button
                            key={c}
                            onClick={() => setForm((f) => ({ ...f, category: c }))}
                            className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition ${
                              form.category === c
                                ? 'bg-brand-600 text-white ring-brand-600'
                                : 'bg-white text-ink-700 ring-black/10 hover:bg-brand-50'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : step === 3 ? (
                <div className="space-y-3">
                  {(isAvitoLink(form.title) || isAvitoLink(form.description)) && (
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
                  )}

                  <div>
                    <label className="text-sm font-semibold text-ink-700">Заголовок</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Например: Сдам 2-к квартиру в центре Выксы"
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
                      placeholder="Опишите товар или услугу, состояние, условия… Можно вставить ссылку с avito.ru — мы подтянем данные."
                      className="mt-1 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              ) : step === 4 ? (
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
                  <div className="rounded-2xl bg-slate-50 ring-1 ring-black/10 p-4 text-sm space-y-0.5">
                    <div><b>Город:</b> {CITIES.find((c) => c.id === form.city)?.name}</div>
                    <div><b>Раздел:</b> {SECTIONS.find((s) => s.id === form.section)?.name}</div>
                    <div><b>Категория:</b> {form.group} → {form.category}</div>
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
        {error && !checking && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 px-3 py-2 text-[13px] text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {done && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                onClose?.();
                setTimeout(reset, 300);
              }}
              className="rounded-2xl bg-white ring-1 ring-black/10 text-ink-700 hover:bg-slate-50 px-4 py-3 text-sm font-semibold"
            >
              Закрыть
            </button>
            {publishedAdId && (
              <button
                onClick={() => {
                  onClose?.();
                  setTimeout(reset, 300);
                  router.push(`/ad/${publishedAdId}`);
                }}
                className="ml-auto inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 text-sm font-semibold"
              >
                Открыть объявление
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
