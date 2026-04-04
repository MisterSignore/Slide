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
      // Interleave stories from all categories for a mixed feed
      return brief.categories.flatMap((cat) =>
        cat.stories.map((story) => ({ story, cat }))
      );
    }
    const cat = brief.categories.find((c) => c.id === activeId);
    if (!cat) return [];
    return cat.stories.map((story) => ({ story, cat }));
  }, [brief, activeId]);

  const activeCategory = brief.categories.find((c) => c.id === activeId);
  const activeLabel = activeCategory?.label ?? 'Alle';

  return (
    <div className="flex flex-col min-h-full">
      {/* Category tabs */}
      <div className="sticky top-[64px] z-40 bg-navy/80 backdrop-blur-xl border-b border-white/5 py-2">
        <CategoryBar
          categories={brief.categories}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </div>

      {/* Story count */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] text-slate-500 font-medium">
          {visibleStories.length} {visibleStories.length === 1 ? 'Story' : 'Stories'}
          {activeId !== 'all' && activeCategory && (
            <span> · {activeCategory.emoji} {activeCategory.label}</span>
          )}
        </p>
      </div>

      {/* Stories */}
      {visibleStories.length === 0 ? (
        <EmptyState label={activeLabel} />
      ) : (
        <div className="px-4 pb-8 space-y-3">
          {visibleStories.map(({ story, cat }, i) => (
            <NewsCard
              key={`${cat.id}-${i}`}
              story={story}
              index={i}
              categoryEmoji={cat.emoji}
              categoryLabel={cat.label}
            />
          ))}
        </div>
      )}
    </div>
  );
}
