import { DatabaseSync } from 'node:sqlite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '../data/bible.db');

export type BibleBookRow = {
  id: string;
  code: string;
  name: string;
  abbr: string;
  testament: 'AT' | 'NT';
  chapters_count: number;
  book_order: number;
};

export type BibleVerseRow = {
  id: number;
  book_id: string;
  chapter: number;
  number: number;
  text: string;
};

export type BibleSearchHit = BibleVerseRow & {
  book_name: string;
  book_abbr: string;
  testament: 'AT' | 'NT';
};

let dbInstance: DatabaseSync | null = null;

function ensureDailyVersesTable(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_verses (
      date TEXT PRIMARY KEY,
      verse_id INTEGER NOT NULL,
      book_id TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      number INTEGER NOT NULL,
      text TEXT NOT NULL,
      book_name TEXT NOT NULL,
      book_abbr TEXT NOT NULL,
      testament TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (verse_id) REFERENCES bible_verses(id)
    );
    CREATE INDEX IF NOT EXISTS idx_daily_verses_date ON daily_verses(date);
  `);
}

export function getBibleDb(): DatabaseSync {
  if (!dbInstance) {
    if (!existsSync(DB_PATH)) {
      throw new Error(`La base de données biblique est introuvable à ${DB_PATH}. Exécutez npm run db:bible.`);
    }
    dbInstance = new DatabaseSync(DB_PATH);
    ensureDailyVersesTable(dbInstance);
  }
  return dbInstance;
}

export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .trim();
}

/** Récupère la liste ordonnée des 66 livres bibliques */
export function getBibleBooks(): BibleBookRow[] {
  const db = getBibleDb();
  return db.prepare('SELECT * FROM bible_books ORDER BY book_order ASC').all() as unknown as BibleBookRow[];
}

/** Récupère un livre par son identifiant */
export function getBibleBook(bookId: string): BibleBookRow | undefined {
  const db = getBibleDb();
  const row = db.prepare('SELECT * FROM bible_books WHERE id = ?').get(bookId);
  return row ? (row as unknown as BibleBookRow) : undefined;
}

/** Récupère tous les versets d'un chapitre donné */
export function getBibleChapter(bookId: string, chapter: number): {
  book: BibleBookRow;
  chapter: number;
  verses: { number: number; text: string }[];
  previous?: { bookId: string; chapter: number };
  next?: { bookId: string; chapter: number };
} | null {
  const db = getBibleDb();
  const book = getBibleBook(bookId);
  if (!book || chapter < 1 || chapter > book.chapters_count) {
    return null;
  }

  const rows = db.prepare(
    'SELECT number, text FROM bible_verses WHERE book_id = ? AND chapter = ? ORDER BY number ASC'
  ).all(bookId, chapter) as unknown as { number: number; text: string }[];

  const allBooks = getBibleBooks();
  const currentIndex = allBooks.findIndex(b => b.id === bookId);

  // Chapitre précédent
  let previous: { bookId: string; chapter: number } | undefined;
  if (chapter > 1) {
    previous = { bookId, chapter: chapter - 1 };
  } else if (currentIndex > 0) {
    const prevBook = allBooks[currentIndex - 1];
    previous = { bookId: prevBook.id, chapter: prevBook.chapters_count };
  }

  // Chapitre suivant
  let next: { bookId: string; chapter: number } | undefined;
  if (chapter < book.chapters_count) {
    next = { bookId, chapter: chapter + 1 };
  } else if (currentIndex < allBooks.length - 1) {
    const nextBook = allBooks[currentIndex + 1];
    next = { bookId: nextBook.id, chapter: 1 };
  }

  return {
    book,
    chapter,
    verses: rows,
    previous,
    next,
  };
}

/** Recherche plein texte dans les versets de la Bible */
export function searchBible(
  query: string,
  options: { testament?: 'AT' | 'NT'; bookId?: string; limit?: number; offset?: number } = {}
): {
  total: number;
  limit: number;
  offset: number;
  hits: BibleSearchHit[];
} {
  const db = getBibleDb();
  const normalized = normalizeSearchQuery(query);
  if (!normalized || normalized.length < 2) {
    return { total: 0, limit: options.limit ?? 20, offset: options.offset ?? 0, hits: [] };
  }

  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);

  const words = normalized.split(/\s+/).filter(Boolean);
  const likeConditions: string[] = [];
  const params: (string | number | null)[] = [];

  for (const word of words) {
    likeConditions.push('v.text_normalized LIKE ?');
    params.push(`%${word}%`);
  }

  let filterClause = '';
  if (options.testament) {
    filterClause += ' AND b.testament = ?';
    params.push(options.testament);
  }
  if (options.bookId) {
    filterClause += ' AND v.book_id = ?';
    params.push(options.bookId);
  }

  const whereSql = `WHERE ${likeConditions.join(' AND ')} ${filterClause}`;

  const countRow = db.prepare(
    `SELECT COUNT(*) as total FROM bible_verses v JOIN bible_books b ON b.id = v.book_id ${whereSql}`
  ).get(...params) as { total: number } | undefined;

  const total = countRow?.total ?? 0;

  const queryParams = [...params, limit, offset];
  const hits = db.prepare(`
    SELECT v.id, v.book_id, v.chapter, v.number, v.text, b.name as book_name, b.abbr as book_abbr, b.testament
    FROM bible_verses v
    JOIN bible_books b ON b.id = v.book_id
    ${whereSql}
    ORDER BY b.book_order ASC, v.chapter ASC, v.number ASC
    LIMIT ? OFFSET ?
  `).all(...queryParams) as unknown as BibleSearchHit[];

  return {
    total,
    limit,
    offset,
    hits,
  };
}

export type DailyVerseRecord = BibleSearchHit & {
  date: string;
  bookId: string;
  bookName: string;
  bookAbbr: string;
};

/**
 * Récupère ou génère le verset du jour.
 * Idempotent pour une date donnée (YYYY-MM-DD) : tous les utilisateurs du même jour
 * reçoivent le même verset inspirant. Le paramètre force permet au cron de régénérer.
 */
export function getDailyVerse(dateStr?: string, force = false): DailyVerseRecord {
  const db = getBibleDb();
  const dateKey = dateStr || new Date().toISOString().slice(0, 10);

  if (!force) {
    const existing = db.prepare(`
      SELECT date, verse_id as id, book_id, chapter, number, text, book_name, book_abbr, testament
      FROM daily_verses
      WHERE date = ?
    `).get(dateKey) as unknown as (DailyVerseRecord & { verse_id?: number }) | undefined;

    if (existing) {
      return {
        ...existing,
        id: existing.id ?? (existing as any).verse_id,
        bookId: existing.book_id,
        bookName: existing.book_name,
        bookAbbr: existing.book_abbr,
      };
    }
  }

  // Sélection aléatoire d'un verset inspirant parmi les livres d'édification
  const candidate = db.prepare(`
    SELECT v.id, v.book_id, v.chapter, v.number, v.text, b.name as book_name, b.abbr as book_abbr, b.testament
    FROM bible_verses v
    JOIN bible_books b ON b.id = v.book_id
    WHERE b.id IN (
      'psaumes', 'proverbes', 'esaie', 'jeremie', 'lamentations', 'habacuc', 'sophonie',
      'matthieu', 'marc', 'luc', 'jean', 'actes', 'romains', '1corinthiens', '2corinthiens',
      'galates', 'ephesiens', 'philippiens', 'colossiens', '1thessaloniciens', '1timothee',
      '2timothee', 'hebreux', 'jacques', '1pierre', '1jean', 'apocalypse'
    )
      AND LENGTH(v.text) >= 40 AND LENGTH(v.text) <= 260
      AND v.text_normalized NOT LIKE '%engendra%'
      AND v.text_normalized NOT LIKE '%voici la posterite%'
    ORDER BY RANDOM()
    LIMIT 1
  `).get() as unknown as BibleSearchHit | undefined;

  const selected = candidate || (db.prepare(`
    SELECT v.id, v.book_id, v.chapter, v.number, v.text, b.name as book_name, b.abbr as book_abbr, b.testament
    FROM bible_verses v
    JOIN bible_books b ON b.id = v.book_id
    WHERE v.book_id = 'jean' AND v.chapter = 15 AND v.number = 4
  `).get() as unknown as BibleSearchHit);

  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO daily_verses (date, verse_id, book_id, chapter, number, text, book_name, book_abbr, testament, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      verse_id = excluded.verse_id,
      book_id = excluded.book_id,
      chapter = excluded.chapter,
      number = excluded.number,
      text = excluded.text,
      book_name = excluded.book_name,
      book_abbr = excluded.book_abbr,
      testament = excluded.testament,
      created_at = excluded.created_at
  `).run(
    dateKey,
    selected.id,
    selected.book_id,
    selected.chapter,
    selected.number,
    selected.text,
    selected.book_name,
    selected.book_abbr,
    selected.testament,
    createdAt
  );

  return {
    ...selected,
    date: dateKey,
    bookId: selected.book_id,
    bookName: selected.book_name,
    bookAbbr: selected.book_abbr,
  };
}
