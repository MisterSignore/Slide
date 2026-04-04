'use client';

import { useRef, useEffect } from 'react';
import type { Category } from '@/types/news';

interface CategoryBarProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

const ALL_TAB = { id: 'all', label: 'Alle', emoji: '⚡' };

export default function CategoryBar({ categories, activeId, onSelect }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view when it changes
  useEffect(() => {
    if (!activeRef.current || !scrollRef.current) return;
    const container = scrollRef.current;
    const button = activeRef.current;
    const { left, width } = button.getBoundingClientRect();
    const containerLeft = container.getBoundingClientRect().left;
    const scrollLeft = container.scrollLeft + left - containerLeft - container.clientWidth / 2 + width / 2;
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, [activeId]);

  const tabs = [ALL_TAB, ...categories];

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 px-4 overflow-x-auto no-scrollbar py-1"
    >
      {tabs.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSelect(cat.id)}
            className={`
              flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5
              rounded-full text-[13px] font-semibold transition-all duration-200
              ${isActive
                ? 'bg-cyan text-navy shadow-tab-active'
                : 'bg-navy-light text-slate-400 hover:text-white hover:bg-navy-lighter'
              }
            `}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
