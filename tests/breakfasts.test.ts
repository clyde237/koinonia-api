import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllBreakfasts,
  getTodayBreakfast,
  getBreakfastById,
  generateBreakfastPdfBuffer,
  generateSampleAudioBuffer,
  generateSampleVideoBuffer,
} from '../src/breakfasts.js';
import { createApp } from '../src/app.js';

test('Breakfasts API - retrieves list and today featured breakfast', () => {
  const all = getAllBreakfasts('http://localhost:3000');
  assert.ok(all.length >= 4);
  assert.equal(all[0].id, 'peace');
  assert.equal(all[0].format, 'both');
  assert.ok(all[0].videoUrl?.includes('/api/breakfasts/peace/download/video'));
  assert.ok(all[0].audioUrl?.includes('/api/breakfasts/peace/download/audio'));
  assert.ok(all[0].pdfUrl?.includes('/api/breakfasts/peace/download/pdf'));

  const today = getTodayBreakfast('http://localhost:3000');
  assert.equal(today.id, 'peace');
  assert.ok(today.title.length > 0);
  assert.ok(today.scriptureRef.length > 0);
});

test('Breakfasts API - generates compliant PDF document', () => {
  const item = getBreakfastById('peace')!;
  assert.ok(item);
  const pdfBuffer = generateBreakfastPdfBuffer(item);

  assert.ok(Buffer.isBuffer(pdfBuffer));
  assert.ok(pdfBuffer.length > 300, 'PDF buffer must have valid size');
  const pdfStr = pdfBuffer.toString('utf8');
  assert.ok(pdfStr.startsWith('%PDF-1.4'));
  assert.ok(pdfStr.includes('%%EOF'));
  assert.ok(pdfStr.includes('/Type /Catalog'));
  assert.ok(pdfStr.includes('Koinonia'));
});

test('Breakfasts API - generates valid audio and video sample buffers', () => {
  const item = getBreakfastById('peace')!;
  assert.ok(item);

  const audioBuf = generateSampleAudioBuffer(item);
  assert.ok(Buffer.isBuffer(audioBuf));
  assert.equal(audioBuf.slice(0, 3).toString('utf8'), 'ID3');

  const videoBuf = generateSampleVideoBuffer(item);
  assert.ok(Buffer.isBuffer(videoBuf));
  assert.equal(videoBuf.slice(4, 8).toString('utf8'), 'ftyp');
});

test('Breakfasts API HTTP routes return expected payload and content headers', async () => {
  const dummyPool = {} as any;
  const dummyVerifier = (async () => 'user_123') as any;
  const app = createApp({
    config: {
      origins: ['http://localhost:8081'],
      API_URL: 'http://localhost:3000',
      PORT: 3000,
      NODE_ENV: 'test',
    } as any,
    pool: dummyPool,
    verifyIdentity: dummyVerifier,
  });

  // GET /api/breakfasts
  const listRes = await app.request('/api/breakfasts');
  assert.equal(listRes.status, 200);
  const listJson = await listRes.json();
  assert.ok(Array.isArray(listJson));
  assert.ok(listJson.length >= 4);

  // GET /api/breakfasts/today
  const todayRes = await app.request('/api/breakfasts/today');
  assert.equal(todayRes.status, 200);
  const todayJson = await todayRes.json();
  assert.equal(todayJson.id, 'peace');

  // GET /api/breakfasts/peace/download/pdf
  const pdfRes = await app.request('/api/breakfasts/peace/download/pdf');
  assert.equal(pdfRes.status, 200);
  assert.equal(pdfRes.headers.get('content-type'), 'application/pdf');
  assert.ok(pdfRes.headers.get('content-disposition')?.includes('attachment; filename="koinonia-breakfast-peace.pdf"'));

  // GET /api/breakfasts/peace/download/audio
  const audioRes = await app.request('/api/breakfasts/peace/download/audio');
  assert.equal(audioRes.status, 200);
  assert.equal(audioRes.headers.get('content-type'), 'audio/mpeg');

  // GET /api/breakfasts/peace/download/video
  const videoRes = await app.request('/api/breakfasts/peace/download/video');
  assert.equal(videoRes.status, 200);
  assert.equal(videoRes.headers.get('content-type'), 'video/mp4');

  // 404 for unknown breakfast
  const unknownRes = await app.request('/api/breakfasts/inconnu');
  assert.equal(unknownRes.status, 404);
});
