/**
 * Хелперы для отображения типа аккаунта на UI.
 * См. /BUSINESS-MODEL.md → «Типы аккаунтов».
 */

/**
 * @param {'personal' | 'master' | 'shop' | undefined} type
 */
export function accountTypeLabel(type) {
  if (type === 'master') return 'Мастер';
  if (type === 'shop') return 'Магазин';
  if (type === 'personal') return 'Пользователь';
  return null;
}

/**
 * Мастер → эмодзи молотка
 * Магазин → эмодзи витрины
 * Личный → без бейджа на карточке
 */
export function accountTypeEmoji(type) {
  if (type === 'master') return '🛠';
  if (type === 'shop') return '🏬';
  return null;
}

export function accountTypeBadgeClass(type) {
  if (type === 'master')
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (type === 'shop')
    return 'bg-brand-50 text-brand-700 ring-brand-200';
  return 'bg-slate-100 text-ink-500 ring-black/5';
}

export function isBusiness(type) {
  return type === 'master' || type === 'shop';
}

/**
 * Данные о тарифе для отображения бейджа в профиле.
 */
export function tierLabel(name) {
  if (name === 'top') return 'ТОП';
  if (name === 'premium') return 'Премиум';
  if (name === 'start') return 'Старт';
  return null;
}

export function tierColor(name) {
  if (name === 'top') return 'text-amber-700 bg-amber-50 ring-amber-200';
  if (name === 'premium') return 'text-brand-700 bg-brand-50 ring-brand-200';
  return 'text-slate-600 bg-slate-100 ring-black/5';
}

/**
 * Уровни продвижения — для плашек и стилей.
 */
export function promoLabel(level) {
  if (level >= 4) return 'VIP';
  if (level === 3) return 'VIP';
  if (level === 2) return 'Срочно';
  if (level === 1) return 'Поднято';
  return null;
}
