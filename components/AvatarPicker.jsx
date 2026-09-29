'use client';

import { useRef, useState } from 'react';
import { Camera, Check, Loader2 } from 'lucide-react';
import Avatar, { AVATAR_PRESETS } from './Avatar';
import { uploadAvatar } from '@/lib/api';

/**
 * Выбор аватара: своё фото (загружается сразу, сохраняется вместе с формой) или готовый.
 * value — текущее значение (URL, «preset:…» или null); onChange(newValue).
 */
export default function AvatarPicker({ value, name, onChange, onError }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadAvatar(file);
      onChange(url);
    } catch (err) {
      onError?.(err.message || 'Не удалось загрузить фото');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar person={{ name, avatar: value }} size="xl" />
          {uploading && (
            <span className="absolute inset-0 grid place-items-center rounded-full bg-white/70">
              <Loader2 className="w-6 h-6 text-accent-600 animate-spin" />
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-outline h-9 px-3.5 text-sm"
          >
            <Camera className="w-4 h-4" />
            Загрузить фото
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)} className="block text-[13px] font-semibold text-ink-500 hover:text-ink-800">
              Убрать аватар
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onFile} />
      </div>

      <div className="mt-3 text-[13px] text-ink-500">Или выберите готовый:</div>
      <div className="mt-1.5 grid grid-cols-6 gap-2">
        {AVATAR_PRESETS.map((p) => {
          const id = `preset:${p.id}`;
          const on = value === id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(id)}
              aria-label={`Аватар ${p.id}`}
              aria-pressed={on}
              className={`relative rounded-full p-0.5 ring-2 transition ${on ? 'ring-accent-500' : 'ring-transparent'}`}
            >
              <Avatar person={{ avatar: id }} size="md" className="w-full h-auto aspect-square" />
              {on && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 grid place-items-center rounded-full bg-accent-500 text-white">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
