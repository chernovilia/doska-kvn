'use client';

import { motion } from 'framer-motion';
import { CITIES, REGIONS, SECTIONS, getCategoryGroups, getSection, createAd, updateAd, uploadAdPhoto, getSiteSettings, adminCreateAdForUser } from '@/lib/api';
import { FREE_FROM_SECTIONS } from '@/data/categories';
import { formatPrice, formatEventDate, thumbUrl, fallbackToFull, pluralRu, adPath } from '@/lib/format';
import { getAttributeFields, describeAttributes, parseAttributeInput, fieldOptions } from '@/data/attributes';
import ComboField from '@/components/ComboField';
import { CheckCircle2, Clock, Sparkles, ArrowLeft, ArrowRight, ChevronRight, AlertCircle, X, ImagePlus, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import { useApp } from './AppShell';
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
const ADDRESS_SECTIONS = ['realty', 'events', 'lost'];

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
  if (form.section === 'lost') return { label: 'Вознаграждение, ₽', hint: 'Необязательно. Оставьте пустым, если вознаграждения нет.' };
  if (form.section === 'food') return { label: 'Цена, ₽', hint: 'За что цена (кг, литр, штука) — выберите на следующем шаге.' };
  return { label: 'Цена, ₽', hint: 'Без цены — «Договорная».' };
}

// Пример заголовка под раздел — чтобы было понятно, что писать.
const TITLE_HINTS = {
  auto: 'Например: Lada Vesta 2019, один хозяин',
  realty: 'Например: Сдам 2-к квартиру в центре Выксы',
  jobs: 'Например: Продавец-консультант в магазин одежды',
  services: 'Например: Электрик с выездом, работаю без выходных',
  electronics: 'Например: iPhone 13, 128 ГБ, отличное состояние',
  home: 'Например: Диван угловой, раскладной',
  clothes: 'Например: Зимняя куртка женская, размер 46',
  kids: 'Например: Коляска 2 в 1, после одного ребёнка',
  pets: 'Например: Котята в добрые руки',
  hobby: 'Например: Горный велосипед Stels, 21 скорость',
  food: 'Например: Мёд липовый, свой, 3 литра',
  business: 'Например: Холодильная витрина, 1,5 м',
  lost: 'Например: Найдены ключи у магазина на Ленина',
  events: 'Например: Концерт в ДК, 12 октября'
};

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
    autoBump: false, // поднимать автоматически, когда наступает срок подъёма
    photos: [] // { key, url?, local?, status: 'uploading' | 'done' } — порядок = порядок в объявлении
  };
}

// Форма из существующего объявления — для правки.
function formFromAd(ad) {
  const attrs = Object.fromEntries(
    Object.entries(ad.attributes || {}).map(([k, v]) => [k, v == null ? '' : String(v)])
  );
  return {
    city: ad.cityId || ad.city,
    section: ad.section,
    group: ad.categoryGroup || null,
    category: ad.category || null,
    title: ad.title || '',
    price: ad.price ? String(ad.price) : '',
    priceTo: ad.priceTo ? String(ad.priceTo) : '',
    attrs,
    eventDate: ad.eventDate ? moscowLocalInput(ad.eventDate) : '',
    address: ad.address && ad.address !== CITIES.find((c) => c.id === (ad.cityId || ad.city))?.name ? ad.address : '',
    description: ad.description || '',
    autoBump: !!ad.autoBump,
    photos: (ad.photos?.map((p) => p.url) || ad.gallery || []).map((url, i) => ({ key: `old-${i}-${url}`, url, status: 'done' }))
  };
}

// ISO → значение для <input type="datetime-local"> по Москве (UTC+3, без перехода на летнее время).
function moscowLocalInput(iso) {
  const d = new Date(new Date(iso).getTime() + 3 * 3_600_000);
  return d.toISOString().slice(0, 16);
}

function defaultCity(user) {
  return user?.homeCityId || 'vyksa';
}

// editAd — объявление для правки: форма заполнена, шаги можно открыть тапом по номеру,
// «Сохранить» отправляет PUT /ads/:id (модерация — как при подаче). onSaved(ad) — после сохранения.
// adminFor — { email, name, phone, contactMethod }: админ размещает объявление за этого продавца
// (POST /admin/ads/for-user): публикуется сразу от его имени, продавцу уходит письмо.
export default function PostAdModal({ open, onClose, editAd = null, onSaved, adminFor = null }) {
  const router = useRouter();
  const { user } = useAuth();
  const editing = !!editAd;
  // Что доступно авторам (из админки): автоподнятие и его срок
  const [features, setFeatures] = useState({ autoBump: false, bumpCooldownDays: 10 });
  useEffect(() => {
    if (open) getSiteSettings().then((s) => setFeatures((f) => ({ ...f, ...s.features })));
  }, [open]);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => emptyForm(user));
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);
  const [publishedAdId, setPublishedAdId] = useState(null);
  const [publishedStatus, setPublishedStatus] = useState(null);
  const [error, setError] = useState(null);
  const headerRef = useRef(null);
  const { afterAdPublished } = useApp();
  // Опубликовали — когда окно закроется (кнопкой, крестиком, фоном, жестом «назад» или уходом
  // со страницы), предложим установку приложения или уведомления.
  const publishedRef = useRef(false);
  const afterPublishRef = useRef(afterAdPublished);
  afterPublishRef.current = afterAdPublished;
  function firePublished() {
    if (!publishedRef.current) return;
    publishedRef.current = false;
    setTimeout(() => afterPublishRef.current?.(), 600);
  }
  useEffect(() => {
    if (!open) firePublished();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => firePublished, []); // eslint-disable-line react-hooks/exhaustive-deps
  function closeModal() {
    onClose?.();
    setTimeout(reset, 300);
    firePublished();
  }

  const uploading = form.photos.filter((p) => p.status === 'uploading').length;
  const groups = getCategoryGroups(form.section);
  const priceCfg = priceConfig(form);
  const attrFields = getAttributeFields(form.section, form.group, form.category);
  const isEvent = form.section === 'events';
  const askAddress = ADDRESS_SECTIONS.includes(form.section);
  const steps = [
    'city',
    'section',
    'category',
    // Всегда: число шагов не должно прыгать с 6 на 7 после выбора раздела.
    'details',
    'text',
    'photos',
    'review'
  ];
  const stepId = steps[step];

  // Новый шаг открываем с начала, а не с места, где прокрутили предыдущий.
  useEffect(() => {
    const box = headerRef.current?.closest('.overflow-y-auto');
    if (box) box.scrollTop = 0;
  }, [stepId, done]);
  const attrErrors = attributeErrors(attrFields, form.attrs);

  // Правка: при открытии — шаг «Описание» с заполненной формой. Только в момент открытия:
  // после сохранения страница обновляет объявление, и форма не должна сбрасываться.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current && editAd) {
      setForm(formFromAd(editAd));
      setStep(4);
      setDone(false);
      setError(null);
    }
    wasOpen.current = open;
  }, [open, editAd]);

  // Если юзер загрузился позже и у него есть homeCityId — подставим дефолт.
  useEffect(() => {
    if (user?.homeCityId) {
      setForm((f) => (f.city === 'vyksa' ? { ...f, city: user.homeCityId } : f));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.homeCityId]);

  function reset() {
    setStep(0);
    setForm(editAd ? formFromAd(editAd) : emptyForm(user));
    setChecking(false);
    setDone(false);
    setPublishedAdId(null);
    setPublishedStatus(null);
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
        priceTo: priceCfg.range && form.priceTo ? Number(form.priceTo) : undefined,
        priceSuffix: priceCfg.suffix,
        attributes: buildAttributes(attrFields, form.attrs),
        // Поле без часового пояса — считаем время московским (все события в КВН).
        eventDate: isEvent && form.eventDate ? `${form.eventDate}:00+03:00` : undefined,
        address: askAddress ? form.address.trim() || undefined : undefined,
        description: form.description?.trim() || undefined,
        photoUrls: form.photos.filter((p) => p.status === 'done').map((p) => p.url),
        autoBump: features.autoBump ? !!form.autoBump : undefined
      };
      const ad = adminFor
        ? { ...(await adminCreateAdForUser({ ...adminFor, ad: payload })), status: 'approved' }
        : editing
          ? await updateAd(editAd.id, payload)
          : await createAd(payload);
      setPublishedAdId(ad.id);
      setPublishedStatus(ad.status);
      setDone(true);
      if (editing || adminFor) onSaved?.(ad);
      else publishedRef.current = true;
    } catch (err) {
      setError(err.message || (editing ? 'Не удалось сохранить' : 'Не удалось опубликовать'));
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

  // Выбор города, раздела или категории — один тап, без прокрутки к «Далее».
  function goNext() {
    setStep((st) => Math.min(st + 1, steps.length - 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  // Пока фото грузятся, между шагами ходить можно — ждёт загрузки только публикация.
  const canNext =
    (stepId === 'city' && form.city) ||
    (stepId === 'section' && form.section) ||
    (stepId === 'category' && form.category) ||
    (stepId === 'details' && !Object.keys(attrErrors).length && (!isEvent || form.eventDate)) ||
    (stepId === 'text' && form.title.trim().length > 3) ||
    stepId === 'photos' ||
    (stepId === 'review' && uploading === 0);

  return (
    <Modal
      open={open}
      onClose={closeModal}
      size="md"
    >
      <div className="px-5 md:px-6 pb-5 md:pb-6">
        {/* Шапка с шагами закреплена, прокручивается только содержимое шага.
            z-[5] — ниже крестика модалки (z-10), чтобы он оставался кликабельным. */}
        <div
          ref={headerRef}
          className="sticky top-0 z-[5] -mx-5 md:-mx-6 px-5 md:px-6 pt-5 md:pt-6 pb-3 pr-14 bg-white border-b border-slate-100"
        >
          <div className="text-xs uppercase tracking-wide text-accent-700 font-bold">
            {editing ? 'Редактирование' : adminFor ? `За продавца: ${adminFor.name}` : 'Подать объявление'}{!done && ` · шаг ${step + 1} из ${steps.length}`}
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-ink-900 mt-1">
            {done ? 'Готово' : STEP_LABELS[stepId]}
          </h3>

          <div className="mt-3 flex items-center gap-0.5 md:gap-1 overflow-x-auto no-scrollbar">
            {steps.map((s, i) => (
              <div key={s} title={STEP_LABELS[s]} className="flex items-center gap-0.5 md:gap-1 shrink-0">
                {/* При правке всё уже заполнено — к любому шагу можно перейти тапом по номеру */}
                <button
                  type="button"
                  disabled={!editing || done || checking}
                  onClick={() => setStep(i)}
                  aria-label={`Шаг ${i + 1}: ${STEP_LABELS[s]}`}
                  className={`w-6 h-6 md:w-7 md:h-7 grid place-items-center rounded-full text-[11px] md:text-xs font-bold shrink-0 disabled:cursor-default ${
                    i <= step ? 'bg-accent-500 text-white' : 'bg-slate-100 text-ink-500'
                  } ${i === step && editing ? 'ring-2 ring-offset-1 ring-accent-300' : ''}`}
                >
                  {i + 1}
                </button>
                {i < steps.length - 1 && (
                  <div className={`w-2.5 md:w-4 h-[2px] rounded shrink-0 ${i < step ? 'bg-accent-500' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="mt-4 min-h-[280px]">
          {/* Шаг меняется сразу, без ожидания анимации ухода: AnimatePresence mode="wait"
              застревал на старом шаге, если анимации тормозились (фоновая вкладка, встроенный браузер). */}
          <motion.div
            key={stepId + (done ? 'done' : '') + (checking ? 'chk' : '')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {done ? (
              <div className="text-center py-6">
                {publishedStatus === 'pending' ? (
                  <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-amber-100 text-amber-700">
                    <Clock className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                )}
                {/* Статус — из ответа API: при выключенной автопубликации объявление ждёт проверки */}
                <div className="mt-3 text-lg font-extrabold text-ink-900">
                  {publishedStatus === 'pending'
                    ? 'Отправлено на проверку'
                    : editing
                      ? 'Изменения сохранены'
                      : adminFor
                        ? 'Объявление размещено'
                        : 'Объявление опубликовано!'}
                </div>
                <div className="mt-1 text-sm text-ink-500">
                  {publishedStatus === 'pending'
                    ? editing
                      ? 'Пока модератор проверяет изменения, объявления нет в ленте — пришлём уведомление.'
                      : 'Модератор посмотрит его в ближайшее время — пришлём уведомление, когда оно появится в ленте.'
                    : editing
                      ? 'Объявление в ленте с новыми данными.'
                      : adminFor
                        ? `Опубликовано от имени продавца. Письмо со ссылкой отправлено на ${adminFor.email}.`
                        : 'Оно уже видно всем в вашем городе.'}
                </div>
              </div>
            ) : checking ? (
              <div className="text-center py-8">
                <div className="mx-auto w-14 h-14 grid place-items-center rounded-full bg-accent-100 text-accent-700 animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="mt-3 text-lg font-extrabold text-ink-900">
                  {editing ? 'Сохраняем…' : 'Публикуем…'}
                </div>
                <div className="mt-1 text-sm text-ink-500">
                  {editing ? 'Отправляем изменения' : 'Сохраняем объявление и отправляем на витрину'}
                </div>
              </div>
            ) : stepId === 'city' ? (
              <div>
                <div className="text-sm font-semibold text-ink-700 mb-2">Выберите город</div>
                <div className="grid grid-cols-3 gap-2">
                  {POST_CITIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                          setForm((f) => ({ ...f, city: c.id }));
                          goNext();
                        }}
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
                        onClick={() => {
                          // Другой раздел — заново подкатегория и характеристики.
                          setForm((f) => (f.section === s.id ? f : { ...f, section: s.id, group: null, category: null, attrs: {} }));
                          goNext();
                        }}
                        className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2.5 rounded-2xl p-2.5 text-left border-[1.5px] transition-colors min-w-0 ${
                          form.section === s.id
                            ? 'bg-accent-50 border-accent-400'
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
                    <span className="ml-2 text-accent-700">
                      {form.group} → {form.category}
                    </span>
                  )}
                </div>

                {!form.group ? (
                  <div className="grid grid-cols-1 gap-1.5">
                    {groups.map((g) => (
                      <button
                        key={g.name}
                        onClick={() => setForm((f) => (f.group === g.name ? f : { ...f, group: g.name, category: null, attrs: {} }))}
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
                          onClick={() => {
                              setForm((f) => ({ ...f, category: c }));
                              goNext();
                            }}
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
                onChange={(key, value) =>
                  setForm((f) => {
                    const attrs = { ...f.attrs, [key]: value };
                    // Сменили марку — модель от прежней марки больше не подходит
                    for (const d of attrFields) if (d.dependsOn === key && f.attrs[key] !== value) attrs[d.key] = '';
                    return { ...f, attrs };
                  })
                }
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
                    placeholder={TITLE_HINTS[form.section] || 'Коротко: что продаёте или предлагаете'}
                    className="mt-1 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 py-3 text-base"
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
                      className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 py-3 text-base"
                    />
                    {priceCfg.range && (
                      <input
                        value={form.priceTo}
                        onChange={(e) => setForm((f) => ({ ...f, priceTo: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                        placeholder="до"
                        aria-label="Зарплата до"
                        inputMode="numeric"
                        className="w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 py-3 text-base"
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
                    className="mt-1 w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 py-3 text-base"
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
                    <div><b>Когда:</b> {formatEventDate(`${form.eventDate}:00+03:00`)}</div>
                  )}
                  {askAddress && form.address.trim() && <div><b>Адрес:</b> {form.address.trim()}</div>}
                  {describeAttributes({
                    section: form.section,
                    categoryGroup: form.group,
                    attributes: buildAttributes(attrFields, form.attrs)
                  }).map((r) => (
                    <div key={r.label}><b>{r.label}:</b> {r.value}</div>
                  ))}
                  <div><b>Фото:</b> {form.photos.length ? '' : 'нет'}</div>
                    {form.photos.length > 0 && (
                      <div className="mt-1.5 flex gap-1.5 overflow-x-auto no-scrollbar">
                        {form.photos.map((p, i) => (
                          <div key={p.key} className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 ring-1 ring-black/10">
                            <img src={p.status === 'done' ? thumbUrl(p.url) : p.local} onError={fallbackToFull(p.url)} alt="" className="w-full h-full object-cover" />
                            {i === 0 && <span className="absolute inset-x-0 bottom-0 bg-accent-500/90 text-white text-[9px] font-bold text-center">обложка</span>}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
                {/* Автоподнятие: объявление само поднимается, когда наступает срок подъёма (из админки) */}
                {features.autoBump && (
                  <label className="flex items-start gap-3 rounded-2xl bg-white ring-1 ring-black/10 p-3 cursor-pointer">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink-900">Поднимать автоматически</div>
                      <div className="text-[12px] text-ink-500">
                        Раз в {features.bumpCooldownDays} {pluralRu(features.bumpCooldownDays, ['день', 'дня', 'дней'])} объявление
                        само поднимается в ленте — бесплатно
                      </div>
                    </div>
                    <Switch checked={!!form.autoBump} onChange={(v) => setForm((f) => ({ ...f, autoBump: v }))} label="Поднимать автоматически" />
                  </label>
                )}
                {uploading > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2 text-[13px] text-amber-900">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Догружаем фото ({uploading}) — {editing ? 'сохранить' : 'опубликовать'} можно после загрузки
                  </div>
                )}
                <p className="text-[12px] text-ink-500">
                  {editing
                    ? 'После сохранения объявление может снова уйти на проверку модератору — как при подаче.'
                    : 'Нажимая «Опубликовать», вы соглашаетесь с правилами платформы «Доска/КВН».'}
                </p>
              </div>
            )}
          </motion.div>
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
              className="ml-auto inline-flex items-center gap-1.5 rounded-2xl btn-primary px-4 py-3 text-sm"
            >
              {step === steps.length - 1 ? (editing ? 'Сохранить' : 'Опубликовать') : 'Далее'}
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
              onClick={closeModal}
              className="btn-outline rounded-2xl text-ink-700 px-4 py-3 text-sm font-semibold"
            >
              Закрыть
            </button>
            {publishedAdId && !editing && (
              <button
                onClick={() => {
                  closeModal();
                  router.push(adPath(publishedAdId));
                }}
                className="ml-auto inline-flex items-center gap-1.5 rounded-2xl btn-primary px-4 py-3 text-sm"
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

// Переключатель (как в настройках): зелёный — включено.
export function Switch({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
      className={`relative w-12 h-7 rounded-full transition-colors shrink-0 disabled:opacity-50 ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
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
    const v = parseAttributeInput(f, raw[f.key], raw);
    if (v !== undefined) out[f.key] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

// Числа вне допустимого диапазона: { key: 'текст ошибки' }.
function attributeErrors(fields, raw) {
  const errors = {};
  for (const f of fields) {
    if (f.type !== 'number' || !String(raw[f.key] ?? '').trim()) continue;
    const v = parseAttributeInput(f, raw[f.key], raw);
    if (v === undefined) errors[f.key] = 'Введите число';
    else if ((f.min != null && v < f.min) || (f.max != null && v > f.max)) {
      errors[f.key] = `От ${f.min} до ${new Intl.NumberFormat('ru-RU').format(f.max)}`;
    }
  }
  return errors;
}

// ── Шаг «Характеристики»: поля раздела, у афиши — дата, у жилья и афиши — адрес ──
const INPUT =
  'w-full rounded-2xl bg-white ring-1 ring-black/10 focus:ring-accent-400 outline-none px-4 py-3 text-base';

function DetailsStep({ fields, values, errors, onChange, isEvent, eventDate, onEventDate, askAddress, address, onAddress }) {
  return (
    <div className="space-y-4">
      {isEvent && (
        <div>
          <label className="text-sm font-semibold text-ink-700">
            Дата и время <span className="font-normal text-ink-500">по Москве</span> *
          </label>
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
          ) : f.type === 'combo' ? (
            <div className="mt-1">
              <ComboField
                value={values[f.key] ?? ''}
                onChange={(v) => onChange(f.key, v)}
                options={fieldOptions(f, values)}
                placeholder={f.placeholder}
                inputClass={INPUT}
                invalid={!!errors[f.key]}
              />
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
        {fields.length || askAddress
          ? `${isEvent ? 'Остальное' : 'Всё'} необязательно, но с характеристиками объявление находят и понимают быстрее.`
          : 'Для этой категории характеристик нет — просто нажмите «Далее».'}
      </p>
    </div>
  );
}

// ── Шаг «Фото»: параллельная загрузка, у каждого фото своё превью и спиннер ──
// Порядок меняется долгим нажатием и перетаскиванием; первое фото — обложка.
const MAX_PHOTOS = 6;
const UPLOAD_CONCURRENCY = 3;
const LONG_PRESS_MS = 350;

function PhotosStep({ photos, setPhotos, onError }) {
  const gridRef = useRef(null);
  const [dragKey, setDragKey] = useState(null);
  const dragRef = useRef(null);
  const pressRef = useRef(null);

  // Пока тащим фото — страница не прокручивается (обработчик должен быть не passive).
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const stop = (e) => {
      if (dragRef.current) e.preventDefault();
    };
    el.addEventListener('touchmove', stop, { passive: false });
    return () => el.removeEventListener('touchmove', stop);
  }, []);

  function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    onError?.(null);
    const room = MAX_PHOTOS - photos.length;
    if (files.length > room) onError?.(`Можно добавить не больше ${MAX_PHOTOS} фото`);
    const accepted = files.slice(0, Math.max(0, room));
    const items = accepted.map((file) => ({
      key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      local: URL.createObjectURL(file),
      status: 'uploading',
      file
    }));
    // Все выбранные сразу видны с превью и спиннером, грузятся по 3 одновременно.
    setPhotos((prev) => [...prev, ...items.map(({ file, ...rest }) => rest)]);
    let next = 0;
    const worker = async () => {
      while (next < items.length) {
        const item = items[next++];
        try {
          const res = await uploadAdPhoto(item.file);
          setPhotos((prev) => prev.map((p) => (p.key === item.key ? { ...p, url: res.url, status: 'done' } : p)));
        } catch (err) {
          setPhotos((prev) => prev.filter((p) => p.key !== item.key));
          onError?.(err.message || 'Не удалось загрузить фото');
        }
      }
    };
    for (let i = 0; i < Math.min(UPLOAD_CONCURRENCY, items.length); i++) worker();
  }

  function remove(key) {
    setPhotos((prev) => prev.filter((p) => p.key !== key));
  }

  // ── Перестановка: долгое нажатие → тащим → отпускаем ──
  function onPointerDown(e, key) {
    const start = { x: e.clientX, y: e.clientY };
    clearTimeout(pressRef.current?.timer);
    pressRef.current = {
      start,
      timer: setTimeout(() => {
        dragRef.current = key;
        setDragKey(key);
        navigator.vibrate?.(15);
      }, LONG_PRESS_MS)
    };
  }

  function onPointerMove(e) {
    if (!dragRef.current) {
      // Палец сдвинулся до долгого нажатия — это прокрутка, не перестановка.
      const p = pressRef.current;
      if (p && Math.hypot(e.clientX - p.start.x, e.clientY - p.start.y) > 8) clearTimeout(p.timer);
      return;
    }
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-photo-key]');
    const overKey = over?.getAttribute('data-photo-key');
    if (!overKey || overKey === dragRef.current) return;
    setPhotos((prev) => {
      const from = prev.findIndex((p) => p.key === dragRef.current);
      const to = prev.findIndex((p) => p.key === overKey);
      if (from < 0 || to < 0) return prev;
      const nextList = [...prev];
      const [moved] = nextList.splice(from, 1);
      nextList.splice(to, 0, moved);
      return nextList;
    });
  }

  function onPointerEnd() {
    clearTimeout(pressRef.current?.timer);
    pressRef.current = null;
    dragRef.current = null;
    setDragKey(null);
  }

  const canAddMore = photos.length < MAX_PHOTOS;
  const uploading = photos.filter((p) => p.status === 'uploading').length;

  return (
    <div>
      <div className="text-sm font-semibold text-ink-700 mb-1">
        Фотографии
        <span className="ml-1 font-normal text-ink-500">— до {MAX_PHOTOS} штук</span>
      </div>
      <div className="text-[12px] text-ink-500 mb-3">
        Первое фото — обложка. {photos.length > 1 ? 'Удерживайте фото и перетащите, чтобы поменять порядок.' : 'Можно выбрать сразу несколько.'}
      </div>

      <div ref={gridRef} className="grid grid-cols-3 gap-2 select-none">
        {photos.map((p, i) => (
          <div
            key={p.key}
            data-photo-key={p.key}
            onPointerDown={(e) => onPointerDown(e, p.key)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onContextMenu={(e) => e.preventDefault()}
            style={{ WebkitTouchCallout: 'none' }}
            className={`relative aspect-square rounded-2xl overflow-hidden ring-1 bg-slate-100 transition-transform ${
              dragKey === p.key ? 'scale-105 ring-2 ring-accent-500 shadow-soft z-10' : 'ring-black/10'
            }`}
          >
            <img
              src={p.status === 'done' ? thumbUrl(p.url) : p.local}
              onError={fallbackToFull(p.url)}
              alt=""
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
            />
            {p.status === 'uploading' && (
              <div className="absolute inset-0 grid place-items-center bg-white/60">
                <Loader2 className="w-7 h-7 text-accent-600 animate-spin" />
              </div>
            )}
            {i === 0 && (
              <div className="absolute top-1 left-1 text-[10px] font-bold uppercase bg-accent-500 text-white rounded-md px-1.5 py-0.5">
                Обложка
              </div>
            )}
            {p.status === 'done' && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => remove(p.key)}
                className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-white/90 shadow ring-1 ring-black/10 hover:bg-rose-50"
                aria-label="Удалить фото"
              >
                <X className="w-3.5 h-3.5 text-rose-600" />
              </button>
            )}
          </div>
        ))}

        {canAddMore && (
          <label className="aspect-square rounded-2xl grid place-items-center ring-1 ring-dashed ring-black/20 bg-slate-50 text-ink-500 hover:bg-accent-50 hover:ring-accent-300 hover:text-accent-700 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <div className="text-center">
              <ImagePlus className="w-6 h-6 mx-auto" />
              <div className="text-[11px] font-semibold mt-1">Добавить</div>
            </div>
          </label>
        )}
      </div>

      <div className="mt-3 text-xs text-ink-500">
        Фото: <b>{photos.length}</b> из {MAX_PHOTOS}
        {uploading > 0 && <span className="text-accent-700"> · загружается {uploading}</span>}
      </div>
    </div>
  );
}
