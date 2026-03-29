import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'news.db');

import fs from 'fs';
fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    category TEXT NOT NULL,
    source_name TEXT,
    source_url TEXT,
    image_keyword TEXT,
    fetched_at TEXT NOT NULL,
    published_date TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_category ON articles(category);
  CREATE INDEX IF NOT EXISTS idx_fetched_at ON articles(fetched_at);
`);

export function insertArticles(articles) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO articles
      (external_id, title, summary, why_it_matters, category, source_name, source_url, image_keyword, fetched_at, published_date)
    VALUES
      (@external_id, @title, @summary, @why_it_matters, @category, @source_name, @source_url, @image_keyword, @fetched_at, @published_date)
  `);
  const insertMany = db.transaction((items) => {
    for (const item of items) stmt.run(item);
  });
  insertMany(articles);
}

export function getArticles({ category, limit = 30, offset = 0, since } = {}) {
  let query = 'SELECT * FROM articles';
  const params = [];
  const conditions = [];

  if (category && category !== 'all') {
    conditions.push('category = ?');
    params.push(category);
  }
  if (since) {
    conditions.push('fetched_at >= ?');
    params.push(since);
  }

  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY fetched_at DESC, id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(...params);
}

export function getLatestFetchDate() {
  const row = db.prepare('SELECT MAX(fetched_at) as latest FROM articles').get();
  return row?.latest ?? null;
}

export function countArticles() {
  return db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
}

export default db;
