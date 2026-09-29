'use client';

import { Bird, Cat, Dog, Fish, Flower2, Rabbit, Rocket, Snail, Squirrel, Sun, TreePine, Turtle } from 'lucide-react';

// Готовые аватары: id совпадают с AVATAR_PRESETS в API (auth/avatars.ts).
export const AVATAR_PRESETS = [
  { id: 'cat', icon: Cat, cls: 'bg-amber-100 text-amber-700' },
  { id: 'dog', icon: Dog, cls: 'bg-orange-100 text-orange-700' },
  { id: 'rabbit', icon: Rabbit, cls: 'bg-pink-100 text-pink-700' },
  { id: 'bird', icon: Bird, cls: 'bg-sky-100 text-sky-700' },
  { id: 'fish', icon: Fish, cls: 'bg-cyan-100 text-cyan-700' },
  { id: 'squirrel', icon: Squirrel, cls: 'bg-red-100 text-red-700' },
  { id: 'turtle', icon: Turtle, cls: 'bg-emerald-100 text-emerald-700' },
  { id: 'snail', icon: Snail, cls: 'bg-lime-100 text-lime-700' },
  { id: 'flower', icon: Flower2, cls: 'bg-fuchsia-100 text-fuchsia-700' },
  { id: 'tree', icon: TreePine, cls: 'bg-green-100 text-green-700' },
  { id: 'sun', icon: Sun, cls: 'bg-yellow-100 text-yellow-700' },
  { id: 'rocket', icon: Rocket, cls: 'bg-indigo-100 text-indigo-700' }
];

const SIZES = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-20 h-20 text-3xl'
};

/**
 * Аватар везде на сайте: своё фото, готовый вариант («preset:cat») или первая буква имени.
 * person — { name, avatar }. size — xs | sm | md | lg | xl.
 */
export default function Avatar({ person, size = 'md', className = '' }) {
  const box = `${SIZES[size] || SIZES.md} rounded-full shrink-0 ${className}`;
  const avatar = person?.avatar;

  if (avatar?.startsWith('preset:')) {
    const preset = AVATAR_PRESETS.find((p) => `preset:${p.id}` === avatar);
    if (preset) {
      const Icon = preset.icon;
      return (
        <span className={`${box} grid place-items-center ${preset.cls}`} aria-hidden>
          <Icon className="w-[55%] h-[55%]" strokeWidth={1.8} />
        </span>
      );
    }
  }
  if (avatar) {
    return <img src={avatar} alt="" className={`${box} object-cover ring-1 ring-black/5 bg-slate-100`} />;
  }
  return (
    <span className={`${box} grid place-items-center bg-brand-600 text-white font-black`} aria-hidden>
      {(person?.name || '?').trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}
