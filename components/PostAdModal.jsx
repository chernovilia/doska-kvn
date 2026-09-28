'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CITIES, REGIONS, SECTIONS, getCategoryGroups, getSection, createAd, uploadAdPhoto } from '@/lib/api';
import { FREE_FROM_SECTIONS } from '@/data/categories';
import { formatPrice } from '@/lib/format';
import { getAttributeFields, describeAttributes, parseAttributeInput } from '@/data/attributes';
import { CheckCircle2, Sparkles, ArrowLeft, ArrowRight, ChevronRight, AlertCircle, X, ImagePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import { useAuth } from '@/lib/auth';

const STEP_LABELS = {
  city: 'Город',
  section: 'Раздел',
  category: 'Категория',
  details: 'Характеристики',
  text: 'Описание',
  photos: 'Фото',
  review: 'Проверка'
};

// Адрес спрашиваем там, где он важен для покупателя.
const ADDRESS_SECTIONS = ['realty', 'events'];

// Публикуем только в запущенные регионы.
const LAUNCHED = REGIONS.filter((r) => r.launched).map((r) => r.id);
const POST_CITIES = CITIES.filter((c) => LAUNCHED.includes(c.regionId));

// Поля цены зависят от раздела: вилка зарплаты у вакансий, «в месяц» у аренды.
function priceConfig(form) {
  if (form.section === 'jobs') {
    return form.group === 'Вакансии'
      ? { label: 'Зарплата, ₽ в месяц', range: true, suffix: '₽/мес', hint: 'Можно указать только «от».' }
      : { label: 'Желаемая зарплата, ₽ в месяц', suffix: '₽/мес' };
  }
  if (form.section === 'realty' && form.group === 'Аренда жилья') {
    return form.category === 'Посуточно'
      ? { label: 'Цена, ₽ за сутки', suffix: '₽/сутки' }
      : { label: 'Цена, ₽ в месяц', suffix: '₽/мес' };
  }
  if (FREE_FROM_SECTIONS.includes(form.section)) {
    return { label: 'Цена, ₽', hint: 'Без цены объявление попадёт в «Отдам даром».' };
  }
  if (form.section === 'events') return { label: 'Цена билета, ₽', hint: 'Без цены — «Бесплатно».' };
  return { label: 'Цена, ₽', hint: 'Без цены — «Договорная».' };
}

function emptyForm(user) {
  return {
    city: defaultCity(user),
    section: null,
    group: null,
    category: null,
    title: '',
    price: '',
    priceTo: '',
    attrs: {}, // Характеристики как ввёл пользователь (строки), разбираются при отправке
    eventDate: '', // datetime-local у афиши
    address: '',
    description: '',
    photos: [] // Массив { url } с бэка
  };
}

function defaultCity(user) {
  return user?.homeCityId || 'vyksa';
}

export default function PostAdModal({ open, onClose }) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => emptyForm(user));
  const [uploading, setUploading] = useState(0); // Количество активных загрузок
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);
  const [publishedAdId, setPublishedAdId] = useState(null);
  const [error, setError] = useState(null);

  const groups = getCategoryGroups(form.section);
  const priceCfg = priceConfig(form);
  const attrFields = getAttributeFields(form.section, form.group);
  const isEvent = form.section === 'events';
  const askAddress = ADDRESS_SECTIONS.includes(form.section);
  const steps = [
    'city',
    'section',
    'category',
    ...(attrFields.length || isEvent || askAddress ? ['details'] : []),
    'text',
    'photos',
    'review'
  ];
  const stepId = steps[step];
  const attrErrors = attributeErrors(attrFields, form.attrs);

  // При смене раздела — сбрасываем выбор подкатегории.
  useEffect(() => {
    setForm((f) => ({ ...f, group: null, category: null }));
  }, [form.section]);

  // Другая подгруппа — другой набор характеристик.
  useEffect(() => {
    setForm((f) => ({ ...f, attrs: {} }));
  }, [form.section, form.group]);

  // Если юзер загрузился позже и у него есть homeCityId — подставим дефолт.
  useEffect(() => {
    if (user?.homeCityId) {
      setForm((f) => (f.city === 'vyksa' ? { ...f, city: user.homeCityId } : f));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.homeCityId]);

  function reset() {
    setStep(0);
    setForm(emptyForm(user));
    setChecking(false);
    setDone(false);
    setPublishedAdId(null);
    setError(null);
    setUploading(0);
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
        priceTo: priceCfg.range && form.priceTo ? Number(form.priceTo) : undefined,
        priceSuffix: priceCfg.suffix,
        attributes: buildAttributes(attrFields, form.attrs),
        eventDate: isEvent && form.eventDate ? new Date(form.eventDate).toISOString() : undefined,
        address: askAddress ? form.address.trim() || undefined : undefined,
        description: form.description?.trim() || undefined,
        photoUrls: form.photos.map((p) => p.url)
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
    if (step === steps.length - 1) {
      publish();
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  const canNext =
    uploading === 0 &&
    ((stepId === 'city' && form.city) ||
      (stepId === 'section' && form.section) ||
      (stepId === 'category' && form.category) ||
      (stepId === 'details' && !Object.keys(attrErrors).length && (!isEvent || form.eventDate)) ||
      (stepId === 'text' && form.title.trim().length > 3) ||
      stepId === 'photos' ||
      stepId === 'review');

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
          {steps.map((s, i) => (
            <div key={s} title={STEP_LABELS[s]} className="flex items-center gap-1 shrink-0">
              <div
                className={`w-7 h-7 grid place-items-center rounded-full text-xs font-bold shrink-0 ${
                  i <= step ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-500'
                }`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-4 h-[2px] rounded shrink-0 ${i < step ? 'bg-brand-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
          <div className="ml-auto text-xs text-ink-500 shrink-0 pl-2">
            {step + 1} / {steps.length}
          </div>
        </div>

        {/* Body */}
        <div className="mt-5 min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepId + (done ? 'done' : '') + (checking ? 'chk' : '')}
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
              ) : stepId === 'city' ? (
                <div>
                  <div className="text-sm font-semibold text-ink-700 mb-2">Выберите город</div>
                  <div className="grid grid-cols-3 gap-2">
                    {POST_CITIES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setForm((f) => ({ ...f, city: c.id }))}
                        className={`chip h-11 w-full ${form.city === c.id ? 'chip-on' : ''}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : stepId === 'section' ? (
                <div>
                  <div className="text-sm font-semibold text-ink-700 mb-2">Раздел</div>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTIONS.map((s) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setForm((f) => ({ ...f, section: s.id }))}
                          className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2.5 rounded-2xl p-2.5 text-left border-[1.5px] transition-colors min-w-0 ${
                            form.section === s.id
                              ? 'bg-brand-50 border-brand-400'
                              : 'bg-slate-50 border-transparent hover:bg-slate-100'
                          }`}
                        >
                          <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${s.tile}`}>
                            <Icon className="w-5 h-5" />
                          </span>
                          <span className="min-w-0 w-full">
                            <span className="block font-bold text-ink-900 text-sm leading-tight">{s.name}</span>
                            <span className="block text-[11px] text-ink-500 leading-tight truncate">{s.hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[12px] text-ink-500">
                    Отдаёте бесплатно? Выберите раздел по смыслу и не указывайте цену — объявление
                    появится в «Отдам даром».
                  </p>
                </div>
              ) : stepId === 'category' ? (
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
                          className="flex items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
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
                            className={`chip ${form.category === c ? 'chip-on' : ''}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : stepId === 'details' ? (
                <DetailsStep
                  fields={attrFields}
                  values={form.attrs}
                  errors={attrErrors}
                  onChange={(key, value) => setForm((f) => ({ ...f, attrs: { ...f.attrs, [key]: value } }))}
                  isEvent={isEvent}
                  eventDate={form.eventDate}
                  onEventDate={(v) => setForm((f) => ({ ...f, eventDate: v }))}
                  askAddress={askAddress}
                  address={form.address}
                  onAddress={(v) => setForm((f) => ({ ...f, address: v }))}
                />
              ) : stepId === 'text' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-ink-700">Заголовок</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Например: Сдам 2-к квартиру в центре Выксы"
                      className="mt-1 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-ink-700">{priceCfg.label}</label>
                    <div className={`mt-1 grid gap-2 ${priceCfg.range ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      <input
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                        placeholder={priceCfg.range ? 'от' : 'Не указана'}
                        aria-label={priceCfg.range ? 'Зарплата от' : priceCfg.label}
                        inputMode="numeric"
                        className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base"
                      />
                      {priceCfg.range && (
                        <input
                          value={form.priceTo}
                          onChange={(e) => setForm((f) => ({ ...f, priceTo: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                          placeholder="до"
                          aria-label="Зарплата до"
                          inputMode="numeric"
                          className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base"
                        />
                      )}
                    </div>
                    {priceCfg.hint && <div className="mt-1 text-[12px] text-ink-500">{priceCfg.hint}</div>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-ink-700">Описание</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Опишите товар или услугу, состояние, условия…"
                      className="mt-1 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base"
                    />
                  </div>
                </div>
              ) : stepId === 'photos' ? (
                <PhotosStep
                  photos={form.photos}
                  setPhotos={(nextOrFn) =>
                    setForm((f) => ({
                      ...f,
                      photos:
                        typeof nextOrFn === 'function' ? nextOrFn(f.photos) : nextOrFn
                    }))
                  }
                  uploading={uploading}
                  setUploading={setUploading}
                  onError={setError}
                />
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-ink-700">Проверьте объявление</div>
                  <div className="rounded-2xl bg-slate-50 ring-1 ring-black/10 p-4 text-sm space-y-0.5">
                    <div><b>Город:</b> {CITIES.find((c) => c.id === form.city)?.name}</div>
                    <div><b>Раздел:</b> {getSection(form.section)?.name}</div>
                    <div><b>Категория:</b> {form.group} → {form.category}</div>
                    <div><b>Заголовок:</b> {form.title || <span className="text-ink-500">не указан</span>}</div>
                    <div><b>Цена:</b> {formatPrice(previewAd(form, priceCfg))}</div>
                    {isEvent && form.eventDate && (
                      <div><b>Когда:</b> {new Date(form.eventDate).toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' })}</div>
                    )}
                    {askAddress && form.address.trim() && <div><b>Адрес:</b> {form.address.trim()}</div>}
                    {describeAttributes({
                      section: form.section,
                      categoryGroup: form.group,
                      attributes: buildAttributes(attrFields, form.attrs)
                    }).map((r) => (
                      <div key={r.label}><b>{r.label}:</b> {r.value}</div>
                    ))}
                    <div><b>Фото:</b> {form.photos.length}</div>
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
              className="btn-outline inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-700 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </button>
            <button
              onClick={next}
              disabled={!canNext}
              className="ml-auto inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white px-4 py-3 text-sm font-semibold"
            >
              {step === steps.length - 1 ? 'Опубликовать' : 'Далее'}
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
              className="btn-outline rounded-2xl text-ink-700 px-4 py-3 text-sm font-semibold"
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

// Черновик в форме объявления — чтобы показать цену так же, как в ленте.
function previewAd(form, cfg) {
  return {
    section: form.section,
    categoryGroup: form.group,
    price: form.price ? Number(form.price) : 0,
    priceTo: cfg.range && form.priceTo ? Number(form.priceTo) : 0,
    priceSuffix: cfg.suffix
  };
}

// Характеристики из полей ввода → объект для API (пустые не отправляем).
function buildAttributes(fields, raw) {
  const out = {};
  for (const f of fields) {
    const v = parseAttributeInput(f, raw[f.key]);
    if (v !== undefined) out[f.key] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

// Числа вне допустимого диапазона: { key: 'текст ошибки' }.
function attributeErrors(fields, raw) {
  const errors = {};
  for (const f of fields) {
    if (f.type !== 'number' || !String(raw[f.key] ?? '').trim()) continue;
    const v = parseAttributeInput(f, raw[f.key]);
    if (v === undefined) errors[f.key] = 'Введите число';
    else if ((f.min != null && v < f.min) || (f.max != null && v > f.max)) {
      errors[f.key] = `От ${f.min} до ${new Intl.NumberFormat('ru-RU').format(f.max)}`;
    }
  }
  return errors;
}

// ── Шаг «Характеристики»: поля раздела, у афиши — дата, у жилья и афиши — адрес ──
const INPUT =
  'w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-brand-400 outline-none px-4 py-3 text-base';

function DetailsStep({ fields, values, errors, onChange, isEvent, eventDate, onEventDate, askAddress, address, onAddress }) {
  return (
    <div className="space-y-4">
      {isEvent && (
        <div>
          <label className="text-sm font-semibold text-ink-700">Дата и время *</label>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => onEventDate(e.target.value)}
            className={`mt-1 ${INPUT}`}
          />
        </div>
      )}
      {askAddress && (
        <div>
          <label className="text-sm font-semibold text-ink-700">{isEvent ? 'Место' : 'Адрес или район'}</label>
          <input
            value={address}
            onChange={(e) => onAddress(e.target.value.slice(0, 200))}
            placeholder={isEvent ? 'Например, ДК Металлургов' : 'Например, ул. Ленина или Центр'}
            className={`mt-1 ${INPUT}`}
          />
        </div>
      )}
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-sm font-semibold text-ink-700">
            {f.label}
            {f.unit && <span className="font-normal text-ink-500">, {f.unit}</span>}
          </label>
          {f.type === 'select' ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {f.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => onChange(f.key, values[f.key] === o ? '' : o)}
                  className={`chip ${values[f.key] === o ? 'chip-on' : ''}`}
                >
                  {o}
                </button>
              ))}
            </div>
          ) : (
            <input
              value={values[f.key] ?? ''}
              onChange={(e) => onChange(f.key, e.target.value.slice(0, 100))}
              inputMode={f.type === 'number' ? (f.decimals ? 'decimal' : 'numeric') : 'text'}
              placeholder={f.placeholder}
              className={`mt-1 ${INPUT} ${errors[f.key] ? 'ring-rose-300' : ''}`}
            />
          )}
          {errors[f.key] && <div className="mt-1 text-[12px] text-rose-600">{errors[f.key]}</div>}
        </div>
      ))}
      <p className="text-[12px] text-ink-500">
        {isEvent ? 'Остальное' : 'Всё'} необязательно, но с характеристиками объявление находят и понимают быстрее.
      </p>
    </div>
  );
}

// ── Шаг «Фото»: реальная загрузка через POST /uploads/ad-photo ─────
const MAX_PHOTOS = 6;

function PhotosStep({ photos, setPhotos, uploading, setUploading, onError }) {
  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const room = MAX_PHOTOS - photos.length;
    const accepted = files.slice(0, room);

    for (const file of accepted) {
      setUploading((n) => n + 1);
      try {
        const res = await uploadAdPhoto(file);
        setPhotos((prev) => [...prev, { url: res.url, size: res.size }]);
      } catch (err) {
        onError?.(err.message || 'Не удалось загрузить фото');
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }
  }

  function removeAt(idx) {
    setPhotos(photos.filter((_, i) => i !== idx));
  }

  const canAddMore = photos.length < MAX_PHOTOS;

  return (
    <div>
      <div className="text-sm font-semibold text-ink-700 mb-1">
        Фотографии
        <span className="ml-1 font-normal text-ink-500">
          — до {MAX_PHOTOS} штук, JPG/PNG/WebP/HEIC
        </span>
      </div>
      <div className="text-[12px] text-ink-500 mb-3">
        Первое фото станет обложкой. Сжимаем автоматически до 1600 px.
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <div
            key={p.url}
            className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-black/10 bg-slate-50 group"
          >
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            {i === 0 && (
              <div className="absolute top-1 left-1 text-[10px] font-bold uppercase bg-brand-600 text-white rounded-md px-1.5 py-0.5">
                Обложка
              </div>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-white/90 shadow ring-1 ring-black/10 hover:bg-rose-50"
              aria-label="Удалить"
            >
              <X className="w-3.5 h-3.5 text-rose-600" />
            </button>
          </div>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div
            key={`up-${i}`}
            className="aspect-square rounded-2xl grid place-items-center ring-1 ring-brand-200 bg-brand-50 text-brand-700 animate-pulse"
          >
            <div className="text-[11px] font-semibold">Загрузка…</div>
          </div>
        ))}

        {canAddMore && (
          <label className="aspect-square rounded-2xl grid place-items-center ring-1 ring-dashed ring-black/20 bg-slate-50 text-ink-500 hover:bg-brand-50 hover:ring-brand-300 hover:text-brand-700 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="text-center">
              <ImagePlus className="w-6 h-6 mx-auto" />
              <div className="text-[11px] font-semibold mt-1">Добавить</div>
            </div>
          </label>
        )}
      </div>

      <div className="mt-3 text-xs text-ink-500">
        Загружено: <b>{photos.length}</b> из {MAX_PHOTOS}
        {uploading > 0 && (
          <span className="text-brand-700"> · в очереди: {uploading}</span>
        )}
      </div>
    </div>
  );
}
