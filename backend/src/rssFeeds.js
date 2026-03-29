// Curated RSS feeds per category
export const RSS_FEEDS = [
  // === POLITIK ===
  {
    category: 'politik',
    name: 'BBC World News',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  },
  {
    category: 'politik',
    name: 'DW Nachrichten',
    url: 'https://rss.dw.com/xml/rss-de-news',
  },
  {
    category: 'politik',
    name: 'Spiegel Ausland',
    url: 'https://www.spiegel.de/ausland/index.rss',
  },

  // === WIRTSCHAFT ===
  {
    category: 'wirtschaft',
    name: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
  },
  {
    category: 'wirtschaft',
    name: 'Reuters Business',
    url: 'https://feeds.reuters.com/reuters/businessNews',
  },

  // === TECH / AI ===
  {
    category: 'tech',
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
  },
  {
    category: 'tech',
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
  },
  {
    category: 'tech',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
  },
  {
    category: 'tech',
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
  },

  // === FASZINIEREND ===
  {
    category: 'faszinierend',
    name: 'BBC Future',
    url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  },
  {
    category: 'faszinierend',
    name: 'New Scientist',
    url: 'https://www.newscientist.com/feed/home/',
  },

  // === FUN / KURIOS ===
  {
    category: 'fun',
    name: 'Reddit Today I Learned',
    url: 'https://www.reddit.com/r/todayilearned/.rss',
  },
  {
    category: 'fun',
    name: 'Reddit Interesting',
    url: 'https://www.reddit.com/r/interestingasfuck/.rss',
  },
];

export const CATEGORY_META = {
  all: { label: 'Alles', color: '#ffffff', gradient: ['#1a1a2e', '#16213e'] },
  politik: { label: 'Politik', color: '#4a9eff', gradient: ['#0f0c29', '#302b63'] },
  wirtschaft: { label: 'Wirtschaft', color: '#00d4aa', gradient: ['#0f2027', '#203a43'] },
  tech: { label: 'Tech & AI', color: '#a855f7', gradient: ['#1a0533', '#2d1b69'] },
  faszinierend: { label: 'Faszinierend', color: '#f97316', gradient: ['#2d1200', '#7c2d12'] },
  fun: { label: 'Fun', color: '#facc15', gradient: ['#1a1400', '#3d3300'] },
};
