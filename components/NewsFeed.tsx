'use client';

import { useState, useMemo } from 'react';
import type { NewsBrief } from '@/types/news';
import CategoryBar from './CategoryBar';
import NewsCard from './NewsCard';
import { EmptyState } from './LoadingState';

interface NewsFeedProps {
  brief: NewsBrief;
}

export default function NewsFeed({ brief }: NewsFeedProps) {
  const [activeId, setActiveId] = useState('all');

  const visibleStories = useMemo(() => {
    if (activeId === 'all') {
      return brief.categories.flatMap((cat) =>
        cat.stories.map((story) => ({ story, cat }))
      );
    }
    const cat = brief.categories.find((c) => c.id === activeId);
    if (!cat) return [];
    return cat.stories.map((story) => ({ story, cat }));
  }, [brief, activeId]);

  const activeCategory = brief.categories.find((c) => c.id === activeId);

  return (
    <>
      {/* Fixed category bar — sits right below the fixed header */}
      <div className="fixed top-[68px] left-0 right-0 z-40 bg-navy/85 backdrop-blur-xl border-b border-white/5">
        <CategoryBar
          categories={brief.categories}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </div>

      {/* Story list */}
      <div className="px-4 pb-10">
        {/* Count */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] text-slate-500 font-medium">
            {visibleStories.length} {visibleStories.length === 1 ? 'Story' : 'Stories'}
            {activeId !== 'all' && activeCategory && (
              <> · {activeCategory.emoji} {activeCategory.label}</>
            )}
          </span>
          {activeId === 'all' && (
            <span className="ml-auto text-[10px] text-slate-600">← scrolle durch alle Kategorien</span>
          )}
        </div>

        {visibleStories.length === 0 ? (
          <EmptyState label={activeCategory?.label ?? 'Alle'} />
        ) : (
          <div className="space-y-3">
            {visibleStories.map(({ story, cat }, i) => (
              <NewsCard
                key={`${cat.id}-${i}`}
                story={story}
                index={i}
                categoryId={cat.id}
                categoryEmoji={cat.emoji}
                categoryLabel={cat.label}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
