#!/usr/bin/env node
/**
 * PMM 2027 — Image Compression Script
 * Run: node scripts/compress-images.js
 * Requires: sharp (npm install --save-dev sharp)
 */

import sharp from 'sharp';
import { writeFile, stat } from 'fs/promises';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;

// Tasks: each describes one file to compress in-place
const TASKS = [
  // Campaign poster — 1.1MB hero image, biggest win
  {
    input:  'assets/img/poster/campaign-poster.jpg',
    encode: s => s.jpeg({ quality: 72, progressive: true, mozjpeg: true }),
    label:  'campaign-poster.jpg',
  },
  // Portrait: APC (PNG, 1188×1600) — LCP element on homepage hero
  {
    input:  'assets/img/portraits/portrait-apc.png',
    encode: s => s.png({ compressionLevel: 9, palette: false }),
    label:  'portrait-apc.png',
  },
  // Portrait: formal (PNG, 1188×1600) — used in OG meta tag
  {
    input:  'assets/img/portraits/portrait-formal.png',
    encode: s => s.png({ compressionLevel: 9, palette: false }),
    label:  'portrait-formal.png',
  },
  // Portrait: kaftan (JPEG)
  {
    input:  'assets/img/portraits/portrait-kaftan.jpg',
    encode: s => s.jpeg({ quality: 80, progressive: true }),
    label:  'portrait-kaftan.jpg',
  },
  // Portrait: suit (JPEG)
  {
    input:  'assets/img/portraits/portrait-suit.jpg',
    encode: s => s.jpeg({ quality: 80, progressive: true }),
    label:  'portrait-suit.jpg',
  },
  // News images (JPEG)
  {
    input:  'assets/img/news/news-masiyer-presidential-condolence-visit-2026.jpg',
    encode: s => s.jpeg({ quality: 78, progressive: true }),
    label:  'news-presidential-condolence.jpg',
  },
  {
    input:  'assets/img/news/news-masiyer-mbwelle-kwatas-condolence-2026.jpg',
    encode: s => s.jpeg({ quality: 78, progressive: true }),
    label:  'news-mbwelle-kwatas-condolence.jpg',
  },
  {
    input:  'assets/img/news/news-masiyer-bokkos-consultations-party-can-jni-2026.jpg',
    encode: s => s.jpeg({ quality: 78, progressive: true }),
    label:  'news-bokkos-consultations.jpg',
  },
];

async function getSize(path) {
  try { return (await stat(path)).size; } catch { return 0; }
}

function fmt(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return Math.round(bytes / 1024) + ' KB';
}

console.log('\nPMM 2027 — Image Compression\n');
console.log('  ' + 'File'.padEnd(46) + '  ' + 'Before'.padStart(8) + '   ' + 'After'.padStart(8) + '  Savings');
console.log('  ' + '─'.repeat(76));

for (const task of TASKS) {
  const absIn = join(ROOT, task.input);
  const before = await getSize(absIn);

  // Compress to buffer (no second sharp encode step)
  const buffer = await task.encode(sharp(absIn)).toBuffer();

  // Write buffer directly — avoids sharp re-encoding based on filename extension
  await writeFile(absIn, buffer);

  const after = buffer.length;
  const saved = before - after;
  const pct   = before > 0 ? Math.round((saved / before) * 100) : 0;
  const arrow = saved >= 0 ? `(-${pct}%)` : `(+${Math.abs(pct)}%)`;
  console.log(`  ${task.label.padEnd(46)} ${fmt(before).padStart(8)} → ${fmt(after).padStart(8)}  ${arrow}`);
}

console.log('\nDone.\n');
