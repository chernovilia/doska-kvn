'use client';

import { useEffect } from 'react';

// Блокировка прокрутки страницы, пока открыто окно (Modal и другие шторки).
// overflow: hidden на body хватает на компьютере и Android; на iPhone страница под окном всё равно
// едет от касания — поэтому гасим touchmove везде, кроме того, что само прокручивается внутри окна.
// Счётчик — на случай двух окон сразу (форма объявления и окно установки поверх).
let locks = 0;
let prevOverflow = '';

function canScroll(el) {
  const st = getComputedStyle(el);
  return (
    (/(auto|scroll)/.test(st.overflowY) && el.scrollHeight > el.clientHeight) ||
    (/(auto|scroll)/.test(st.overflowX) && el.scrollWidth > el.clientWidth)
  );
}

function onTouchMove(e) {
  // Жест двумя пальцами (масштаб) не трогаем
  if (e.touches && e.touches.length > 1) return;
  for (let el = e.target; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (el.nodeType === 1 && canScroll(el)) return; // внутри прокручиваемой области окна — можно
  }
  e.preventDefault();
}

export function lockScroll() {
  if (locks++ > 0) return;
  prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  document.addEventListener('touchmove', onTouchMove, { passive: false });
}

export function unlockScroll() {
  if (locks === 0) return;
  if (--locks > 0) return;
  document.body.style.overflow = prevOverflow;
  document.removeEventListener('touchmove', onTouchMove);
}

// Открыто ли сейчас какое-нибудь окно (AppShell не показывает своё окно поверх чужого).
export function isScrollLocked() {
  return locks > 0;
}

export function useScrollLock(open) {
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
  }, [open]);
}
