import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '../..');
const SOURCE_TXT = resolve(ROOT_DIR, 'fraLSG_vpl/fraLSG_vpl.txt');
const TARGET_DB = resolve(__dirname, '../data/bible.db');

export const BIBLE_BOOKS = [
  // Ancien Testament (39 livres)
  { id: 'genese', code: 'GEN', name: 'Genèse', abbr: 'Gn', testament: 'AT', chaptersCount: 50 },
  { id: 'exode', code: 'EXO', name: 'Exode', abbr: 'Ex', testament: 'AT', chaptersCount: 40 },
  { id: 'levitique', code: 'LEV', name: 'Lévitique', abbr: 'Lv', testament: 'AT', chaptersCount: 27 },
  { id: 'nombres', code: 'NUM', name: 'Nombres', abbr: 'Nb', testament: 'AT', chaptersCount: 36 },
  { id: 'deuteronome', code: 'DEU', name: 'Deutéronome', abbr: 'Dt', testament: 'AT', chaptersCount: 34 },
  { id: 'josue', code: 'JOS', name: 'Josué', abbr: 'Jos', testament: 'AT', chaptersCount: 24 },
  { id: 'juges', code: 'JDG', name: 'Juges', abbr: 'Jg', testament: 'AT', chaptersCount: 21 },
  { id: 'ruth', code: 'RUT', name: 'Ruth', abbr: 'Rt', testament: 'AT', chaptersCount: 4 },
  { id: '1samuel', code: '1SA', name: '1 Samuel', abbr: '1S', testament: 'AT', chaptersCount: 31 },
  { id: '2samuel', code: '2SA', name: '2 Samuel', abbr: '2S', testament: 'AT', chaptersCount: 24 },
  { id: '1rois', code: '1KI', name: '1 Rois', abbr: '1R', testament: 'AT', chaptersCount: 22 },
  { id: '2rois', code: '2KI', name: '2 Rois', abbr: '2R', testament: 'AT', chaptersCount: 25 },
  { id: '1chroniques', code: '1CH', name: '1 Chroniques', abbr: '1Ch', testament: 'AT', chaptersCount: 29 },
  { id: '2chroniques', code: '2CH', name: '2 Chroniques', abbr: '2Ch', testament: 'AT', chaptersCount: 36 },
  { id: 'esdras', code: 'EZR', name: 'Esdras', abbr: 'Esd', testament: 'AT', chaptersCount: 10 },
  { id: 'nehemie', code: 'NEH', name: 'Néhémie', abbr: 'Né', testament: 'AT', chaptersCount: 13 },
  { id: 'esther', code: 'EST', name: 'Esther', abbr: 'Est', testament: 'AT', chaptersCount: 10 },
  { id: 'job', code: 'JOB', name: 'Job', abbr: 'Jb', testament: 'AT', chaptersCount: 42 },
  { id: 'psaumes', code: 'PSA', name: 'Psaumes', abbr: 'Ps', testament: 'AT', chaptersCount: 150 },
  { id: 'proverbes', code: 'PRO', name: 'Proverbes', abbr: 'Pr', testament: 'AT', chaptersCount: 31 },
  { id: 'ecclesiaste', code: 'ECC', name: 'Ecclésiaste', abbr: 'Ec', testament: 'AT', chaptersCount: 12 },
  { id: 'cantique', code: 'SOL', name: 'Cantique des Cantiques', abbr: 'Ct', testament: 'AT', chaptersCount: 8 },
  { id: 'esaie', code: 'ISA', name: 'Ésaïe', abbr: 'És', testament: 'AT', chaptersCount: 66 },
  { id: 'jeremie', code: 'JER', name: 'Jérémie', abbr: 'Jér', testament: 'AT', chaptersCount: 52 },
  { id: 'lamentations', code: 'LAM', name: 'Lamentations', abbr: 'Lm', testament: 'AT', chaptersCount: 5 },
  { id: 'ezechiel', code: 'EZE', name: 'Ézéchiel', abbr: 'Éz', testament: 'AT', chaptersCount: 48 },
  { id: 'daniel', code: 'DAN', name: 'Daniel', abbr: 'Da', testament: 'AT', chaptersCount: 12 },
  { id: 'osee', code: 'HOS', name: 'Osée', abbr: 'Os', testament: 'AT', chaptersCount: 14 },
  { id: 'joel', code: 'JOE', name: 'Joël', abbr: 'Jl', testament: 'AT', chaptersCount: 3 },
  { id: 'amos', code: 'AMO', name: 'Amos', abbr: 'Am', testament: 'AT', chaptersCount: 9 },
  { id: 'abdias', code: 'OBA', name: 'Abdias', abbr: 'Ab', testament: 'AT', chaptersCount: 1 },
  { id: 'jonas', code: 'JON', name: 'Jonas', abbr: 'Jon', testament: 'AT', chaptersCount: 4 },
  { id: 'michee', code: 'MIC', name: 'Michée', abbr: 'Mi', testament: 'AT', chaptersCount: 7 },
  { id: 'nahum', code: 'NAH', name: 'Nahum', abbr: 'Na', testament: 'AT', chaptersCount: 3 },
  { id: 'habacuc', code: 'HAB', name: 'Habacuc', abbr: 'Ha', testament: 'AT', chaptersCount: 3 },
  { id: 'sophonie', code: 'ZEP', name: 'Sophonie', abbr: 'So', testament: 'AT', chaptersCount: 3 },
  { id: 'aggee', code: 'HAG', name: 'Aggée', abbr: 'Ag', testament: 'AT', chaptersCount: 2 },
  { id: 'zacharie', code: 'ZEC', name: 'Zacharie', abbr: 'Za', testament: 'AT', chaptersCount: 14 },
  { id: 'malachie', code: 'MAL', name: 'Malachie', abbr: 'Ml', testament: 'AT', chaptersCount: 4 },

  // Nouveau Testament (27 livres)
  { id: 'matthieu', code: 'MAT', name: 'Matthieu', abbr: 'Mt', testament: 'NT', chaptersCount: 28 },
  { id: 'marc', code: 'MAR', name: 'Marc', abbr: 'Mc', testament: 'NT', chaptersCount: 16 },
  { id: 'luc', code: 'LUK', name: 'Luc', abbr: 'Lc', testament: 'NT', chaptersCount: 24 },
  { id: 'jean', code: 'JOH', name: 'Jean', abbr: 'Jn', testament: 'NT', chaptersCount: 21 },
  { id: 'actes', code: 'ACT', name: 'Actes des Apôtres', abbr: 'Ac', testament: 'NT', chaptersCount: 28 },
  { id: 'romains', code: 'ROM', name: 'Romains', abbr: 'Rm', testament: 'NT', chaptersCount: 16 },
  { id: '1corinthiens', code: '1CO', name: '1 Corinthiens', abbr: '1Co', testament: 'NT', chaptersCount: 16 },
  { id: '2corinthiens', code: '2CO', name: '2 Corinthiens', abbr: '2Co', testament: 'NT', chaptersCount: 13 },
  { id: 'galates', code: 'GAL', name: 'Galates', abbr: 'Ga', testament: 'NT', chaptersCount: 6 },
  { id: 'ephesiens', code: 'EPH', name: 'Éphésiens', abbr: 'Ép', testament: 'NT', chaptersCount: 6 },
  { id: 'philippiens', code: 'PHI', name: 'Philippiens', abbr: 'Ph', testament: 'NT', chaptersCount: 4 },
  { id: 'colossiens', code: 'COL', name: 'Colossiens', abbr: 'Col', testament: 'NT', chaptersCount: 4 },
  { id: '1thessaloniciens', code: '1TH', name: '1 Thessaloniciens', abbr: '1Th', testament: 'NT', chaptersCount: 5 },
  { id: '2thessaloniciens', code: '2TH', name: '2 Thessaloniciens', abbr: '2Th', testament: 'NT', chaptersCount: 3 },
  { id: '1timothee', code: '1TI', name: '1 Timothée', abbr: '1Tm', testament: 'NT', chaptersCount: 6 },
  { id: '2timothee', code: '2TI', name: '2 Timothée', abbr: '2Tm', testament: 'NT', chaptersCount: 4 },
  { id: 'tite', code: 'TIT', name: 'Tite', abbr: 'Tt', testament: 'NT', chaptersCount: 3 },
  { id: 'philemon', code: 'PHM', name: 'Philémon', abbr: 'Phm', testament: 'NT', chaptersCount: 1 },
  { id: 'hebreux', code: 'HEB', name: 'Hébreux', abbr: 'Hé', testament: 'NT', chaptersCount: 13 },
  { id: 'jacques', code: 'JAM', name: 'Jacques', abbr: 'Jc', testament: 'NT', chaptersCount: 5 },
  { id: '1pierre', code: '1PE', name: '1 Pierre', abbr: '1P', testament: 'NT', chaptersCount: 5 },
  { id: '2pierre', code: '2PE', name: '2 Pierre', abbr: '2P', testament: 'NT', chaptersCount: 3 },
  { id: '1jean', code: '1JO', name: '1 Jean', abbr: '1Jn', testament: 'NT', chaptersCount: 5 },
  { id: '2jean', code: '2JO', name: '2 Jean', abbr: '2Jn', testament: 'NT', chaptersCount: 1 },
  { id: '3jean', code: '3JO', name: '3 Jean', abbr: '3Jn', testament: 'NT', chaptersCount: 1 },
  { id: 'jude', code: 'JUD', name: 'Jude', abbr: 'Jude', testament: 'NT', chaptersCount: 1 },
  { id: 'apocalypse', code: 'REV', name: 'Apocalypse', abbr: 'Ap', testament: 'NT', chaptersCount: 22 },
];

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .trim();
}

export function buildDatabase() {
  mkdirSync(dirname(TARGET_DB), { recursive: true });
  const db = new DatabaseSync(TARGET_DB);

  db.exec(`
    DROP TABLE IF EXISTS daily_verses;
    DROP TABLE IF EXISTS bible_verses;
    DROP TABLE IF EXISTS bible_books;

    CREATE TABLE bible_books (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      abbr TEXT NOT NULL,
      testament TEXT NOT NULL,
      chapters_count INTEGER NOT NULL,
      book_order INTEGER NOT NULL
    );

    CREATE TABLE bible_verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      number INTEGER NOT NULL,
      text TEXT NOT NULL,
      text_normalized TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES bible_books(id)
    );

    CREATE INDEX idx_verses_lookup ON bible_verses(book_id, chapter, number);
    CREATE INDEX idx_verses_norm ON bible_verses(text_normalized);

    CREATE TABLE daily_verses (
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
    CREATE INDEX idx_daily_verses_date ON daily_verses(date);
  `);

  const insertBook = db.prepare(`
    INSERT INTO bible_books (id, code, name, abbr, testament, chapters_count, book_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const codeToId = new Map<string, string>();
  BIBLE_BOOKS.forEach((b, index) => {
    insertBook.run(b.id, b.code, b.name, b.abbr, b.testament, b.chaptersCount, index + 1);
    codeToId.set(b.code, b.id);
  });

  const insertVerse = db.prepare(`
    INSERT INTO bible_verses (book_id, chapter, number, text, text_normalized)
    VALUES (?, ?, ?, ?, ?)
  `);

  const raw = readFileSync(SOURCE_TXT, 'utf-8');
  const lines = raw.split(/\r?\n/);

  db.exec('BEGIN TRANSACTION');
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const firstSpace = trimmed.indexOf(' ');
    if (firstSpace === -1) continue;
    const code = trimmed.slice(0, firstSpace);
    const rest = trimmed.slice(firstSpace + 1);
    const secondSpace = rest.indexOf(' ');
    if (secondSpace === -1) continue;
    const ref = rest.slice(0, secondSpace);
    const text = rest.slice(secondSpace + 1).trim();

    const [chapStr, verseStr] = ref.split(':');
    const chapter = parseInt(chapStr, 10);
    const number = parseInt(verseStr, 10);
    const bookId = codeToId.get(code);

    if (!bookId) {
      throw new Error(`Code VPL inconnu: ${code}`);
    }

    insertVerse.run(bookId, chapter, number, text, normalizeText(text));
    count++;
  }
  db.exec('COMMIT');

  console.log(`Base de données biblique générée avec succès : ${count} versets dans ${TARGET_DB}`);
  db.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildDatabase();
}
