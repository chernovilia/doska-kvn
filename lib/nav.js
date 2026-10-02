// «Назад» в шапках страниц. Если человек пришёл по прямой ссылке (из ВК, мессенджера) и по сайту
// ещё не ходил, истории внутри сайта нет — router.back() ничего бы не сделал или увёл с сайта.
// Тогда ведём на запасную страницу (обычно главную).
let navigatedInApp = false;

// AppShell вызывает при каждом переходе между страницами сайта (кроме первой загрузки).
export function markInAppNavigation() {
  navigatedInApp = true;
}

export function goBack(router, fallback = '/') {
  if (navigatedInApp) router.back();
  else router.push(fallback);
}
