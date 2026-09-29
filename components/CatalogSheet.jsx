'use client';

import Modal from './Modal';
import { FEED_SECTIONS, getCategoryGroups } from '@/lib/api';

/**
 * Каталог: все разделы с подгруппами. Открывается плиткой «Ещё» и кнопкой «Разделы».
 * onPick(sectionId, groupName | null).
 */
export default function CatalogSheet({ open, onClose, onPick }) {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-5">
        <h3 className="text-xl font-extrabold text-ink-900">Все разделы</h3>
        <div className="mt-3 divide-y divide-slate-100">
          {FEED_SECTIONS.map((s) => {
            const Icon = s.icon;
            const groups = getCategoryGroups(s.id);
            return (
              <div key={s.id} className="py-3">
                <button
                  onClick={() => onPick(s.id, null)}
                  className="w-full flex items-center gap-3 text-left group"
                >
                  <span className={`grid place-items-center w-10 h-10 rounded-xl shrink-0 ${s.tile}`}>
                    <Icon className="w-5 h-5" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-ink-900 group-hover:text-accent-700">{s.name}</span>
                    <span className="block text-[12px] text-ink-500 truncate">{s.hint}</span>
                  </span>
                </button>
                {groups.length > 0 && (
                  <div className="mt-2 pl-[52px] flex flex-wrap gap-1.5">
                    {groups.map((g) => (
                      <button key={g.name} onClick={() => onPick(s.id, g.name)} className="chip chip-sm">
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
