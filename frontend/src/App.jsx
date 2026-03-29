import React, { useState } from 'react';
import Header from './components/Header.jsx';
import CategoryBar from './components/CategoryBar.jsx';
import CardFeed from './components/CardFeed.jsx';
import LoadingScreen, { EmptyState } from './components/LoadingScreen.jsx';
import { useNews, useCategories } from './hooks/useNews.js';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { articles, loading, error, refresh, refreshing } = useNews(activeCategory);
  const categories = useCategories();

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
  };

  return (
    <div style={styles.app}>
      <Header onRefresh={refresh} refreshing={refreshing} />

      <CategoryBar
        active={activeCategory}
        onChange={handleCategoryChange}
        categoryMeta={categories}
      />

      <div style={styles.feed}>
        {loading ? (
          <LoadingScreen
            message={
              articles.length === 0
                ? 'Claude kuratiert deine News…\nDas kann 30–60 Sekunden dauern.'
                : 'Lade…'
            }
          />
        ) : error ? (
          <EmptyState onRefresh={refresh} refreshing={refreshing} />
        ) : articles.length === 0 ? (
          <EmptyState onRefresh={refresh} refreshing={refreshing} />
        ) : (
          <CardFeed articles={articles} />
        )}
      </div>
    </div>
  );
}

const styles = {
  app: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: '#0a0a0f',
    position: 'relative',
  },
  feed: {
    position: 'absolute',
    inset: 0,
  },
};
