import test from 'node:test';
import assert from 'node:assert/strict';
import { getBibleBooks, getBibleBook, getBibleChapter, searchBible, getDailyVerse } from '../src/bible.js';

test('Bible API - should retrieve all 66 books in canon order', () => {
  const books = getBibleBooks();
  assert.equal(books.length, 66);
  assert.equal(books[0].id, 'genese');
  assert.equal(books[0].testament, 'AT');
  assert.equal(books[0].chapters_count, 50);

  const matthieu = books.find(b => b.id === 'matthieu');
  assert.ok(matthieu);
  assert.equal(matthieu.testament, 'NT');

  assert.equal(books[65].id, 'apocalypse');
  assert.equal(books[65].testament, 'NT');
});

test('Bible API - should retrieve Genèse 1 completely', () => {
  const chapter = getBibleChapter('genese', 1);
  assert.ok(chapter);
  assert.equal(chapter.book.name, 'Genèse');
  assert.equal(chapter.chapter, 1);
  assert.equal(chapter.verses.length, 31);
  assert.equal(chapter.verses[0].number, 1);
  assert.match(chapter.verses[0].text, /Au commencement, Dieu créa les cieux et la terre/);
  assert.equal(chapter.previous, undefined);
  assert.deepEqual(chapter.next, { bookId: 'genese', chapter: 2 });
});

test('Bible API - should retrieve Jean 15 completely', () => {
  const chapter = getBibleChapter('jean', 15);
  assert.ok(chapter);
  assert.equal(chapter.book.name, 'Jean');
  assert.equal(chapter.chapter, 15);
  assert.equal(chapter.verses.length, 27);
  assert.match(chapter.verses[4].text, /Je suis le cep, vous êtes les sarments/);
  assert.deepEqual(chapter.previous, { bookId: 'jean', chapter: 14 });
  assert.deepEqual(chapter.next, { bookId: 'jean', chapter: 16 });
});

test('Bible API - should handle boundary chapters navigation across books', () => {
  // Genèse 50 next -> Exode 1
  const gen50 = getBibleChapter('genese', 50);
  assert.ok(gen50);
  assert.deepEqual(gen50.next, { bookId: 'exode', chapter: 1 });

  // Exode 1 prev -> Genèse 50
  const ex1 = getBibleChapter('exode', 1);
  assert.ok(ex1);
  assert.deepEqual(ex1.previous, { bookId: 'genese', chapter: 50 });
});

test('Bible API - search should find known verses', () => {
  const result = searchBible('cep sarments');
  assert.ok(result.total > 0);
  const foundJean15 = result.hits.some(h => h.book_id === 'jean' && h.chapter === 15);
  assert.ok(foundJean15, 'Jean 15 should be found');
});

test('Bible API - daily verse should return valid scripture', () => {
  const daily = getDailyVerse();
  assert.ok(daily);
  assert.equal(daily.book_id, 'jean');
  assert.equal(daily.chapter, 15);
  assert.equal(daily.number, 5);
});
