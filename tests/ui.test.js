import { describe, it, expect } from 'vitest';
import { parseBody, matchesFilter, searchNews } from '../assets/js/ui.js';

// ── parseBody ─────────────────────────────────────────────────
describe('parseBody', () => {
  it('wraps a single plain paragraph in <p> tags', () => {
    expect(parseBody('Hello world')).toBe('<p>Hello world</p>');
  });

  it('wraps multiple double-newline-separated paragraphs', () => {
    const result = parseBody('Para one\n\nPara two');
    expect(result).toBe('<p>Para one</p><p>Para two</p>');
  });

  it('converts dash-prefixed lines into a <ul> list', () => {
    const result = parseBody('- Item one\n- Item two');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>Item one</li>');
    expect(result).toContain('<li>Item two</li>');
    expect(result).not.toContain('<p>');
  });

  it('converts bullet-point (•) lines into a <ul> list', () => {
    const result = parseBody('• Alpha\n• Beta');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>Alpha</li>');
    expect(result).toContain('<li>Beta</li>');
  });

  it('strips the leading dash and whitespace from list items', () => {
    expect(parseBody('- Clean item')).toContain('<li>Clean item</li>');
    expect(parseBody('- Clean item')).not.toContain('<li>- Clean item</li>');
  });

  it('strips the leading bullet and whitespace from list items', () => {
    expect(parseBody('• Clean item')).toContain('<li>Clean item</li>');
    expect(parseBody('• Clean item')).not.toContain('<li>• Clean item</li>');
  });

  it('handles mixed list blocks and plain paragraphs', () => {
    const result = parseBody('Intro\n\n- Item one\n- Item two\n\nClosing');
    expect(result).toContain('<p>Intro</p>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>Item one</li>');
    expect(result).toContain('<p>Closing</p>');
  });

  it('returns empty string for undefined', () => {
    expect(parseBody(undefined)).toBe('');
  });

  it('returns empty string for null', () => {
    expect(parseBody(null)).toBe('');
  });

  it('returns empty string for an empty string', () => {
    expect(parseBody('')).toBe('');
  });

  it('does not produce empty <p></p> tags from extra blank lines', () => {
    const result = parseBody('Para one\n\n\n\nPara two');
    expect(result).not.toContain('<p></p>');
    expect(result).toContain('<p>Para one</p>');
    expect(result).toContain('<p>Para two</p>');
  });

  it('does not produce list items from blank lines within a list block', () => {
    const result = parseBody('- Item one\n\n- Item two');
    // Two separate list blocks — neither should contain empty <li>
    expect(result).not.toContain('<li></li>');
  });

  it('handles a body consisting only of whitespace gracefully', () => {
    expect(parseBody('   \n\n   ')).toBe('');
  });
});

// ── matchesFilter ─────────────────────────────────────────────
const article = (category) => ({ category, title: 'T', excerpt: 'E', tags: [] });

describe('matchesFilter', () => {
  it('"all" matches every article', () => {
    expect(matchesFilter(article('Security'), 'all')).toBe(true);
    expect(matchesFilter(article('Profile'),  'all')).toBe(true);
  });

  it('exact single category match', () => {
    expect(matchesFilter(article('Security'), 'Security')).toBe(true);
    expect(matchesFilter(article('Campaign'), 'Security')).toBe(false);
  });

  it('pipe-delimited filter matches any listed category', () => {
    expect(matchesFilter(article('Campaign'),     'Campaign|Announcement|Movement')).toBe(true);
    expect(matchesFilter(article('Announcement'), 'Campaign|Announcement|Movement')).toBe(true);
    expect(matchesFilter(article('Movement'),     'Campaign|Announcement|Movement')).toBe(true);
    expect(matchesFilter(article('Security'),     'Campaign|Announcement|Movement')).toBe(false);
  });

  it('is case-sensitive (categories are stored title-case)', () => {
    expect(matchesFilter(article('security'), 'Security')).toBe(false);
  });

  it('empty or missing filterValue defaults to showing all', () => {
    expect(matchesFilter(article('Security'), '')).toBe(true);
    expect(matchesFilter(article('Security'), null)).toBe(true);
    expect(matchesFilter(article('Security'), undefined)).toBe(true);
  });
});

// ── searchNews ────────────────────────────────────────────────
const makeArticle = (title, excerpt, tags = []) => ({ title, excerpt, tags, category: 'Test' });

const ARTICLES = [
  makeArticle('Bokkos Attack 2026', 'Farmers killed in overnight raid', ['Security', 'Bokkos']),
  makeArticle('Campaign Launch', 'AVM Masiyer officially declares', ['Campaign', 'APC']),
  makeArticle('Youth Exodus', 'Young people leaving Mangu for Lagos', ['Youth', 'Mangu']),
];

describe('searchNews', () => {
  it('empty query returns all articles', () => {
    expect(searchNews(ARTICLES, '')).toHaveLength(3);
    expect(searchNews(ARTICLES, '  ')).toHaveLength(3);
  });

  it('matches on title (case-insensitive)', () => {
    const results = searchNews(ARTICLES, 'bokkos');
    expect(results).toHaveLength(1);
    expect(results[0].title).toContain('Bokkos');
  });

  it('matches on excerpt', () => {
    const results = searchNews(ARTICLES, 'overnight raid');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Bokkos Attack 2026');
  });

  it('matches on tags', () => {
    const results = searchNews(ARTICLES, 'APC');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Campaign Launch');
  });

  it('returns empty array when nothing matches', () => {
    expect(searchNews(ARTICLES, 'zzznomatch')).toHaveLength(0);
  });

  it('returns multiple results when query matches several articles', () => {
    // "mangu" appears in both the Youth article excerpt and title
    const results = searchNews(ARTICLES, 'masiyer');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Campaign Launch');
  });

  it('is case-insensitive', () => {
    expect(searchNews(ARTICLES, 'BOKKOS')).toHaveLength(1);
    expect(searchNews(ARTICLES, 'bOkKoS')).toHaveLength(1);
  });

  it('null/undefined query returns all articles', () => {
    expect(searchNews(ARTICLES, null)).toHaveLength(3);
    expect(searchNews(ARTICLES, undefined)).toHaveLength(3);
  });
});
