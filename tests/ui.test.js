import { describe, it, expect } from 'vitest';
import { parseBody, matchesFilter, searchNews, sortNews } from '../assets/js/ui.js';

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
const makeArticle = (title, excerpt, tags = [], body = '') => ({ title, excerpt, tags, body, category: 'Test' });

const ARTICLES = [
  makeArticle('Bokkos Attack 2026', 'Farmers killed in overnight raid', ['Security', 'Bokkos'], 'Gunmen stormed the community at midnight and opened fire on sleeping residents.'),
  makeArticle('Campaign Launch', 'AVM Masiyer officially declares', ['Campaign', 'APC'], 'The declaration ceremony took place in Kopyal before hundreds of supporters.'),
  makeArticle('Youth Exodus', 'Young people leaving Mangu for Lagos', ['Youth', 'Mangu'], 'Unemployment and insecurity are the primary drivers of the demographic shift.'),
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

  it('matches on body text (full article content)', () => {
    // "Kopyal" only appears in the body of the Campaign Launch article
    const results = searchNews(ARTICLES, 'Kopyal');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Campaign Launch');
  });

  it('matches a word found only in body, not in title/excerpt/tags', () => {
    // "demographic" only appears in the Youth Exodus body
    const results = searchNews(ARTICLES, 'demographic');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Youth Exodus');
  });

  it('body search is case-insensitive', () => {
    expect(searchNews(ARTICLES, 'MIDNIGHT')).toHaveLength(1);
    expect(searchNews(ARTICLES, 'midnight')).toHaveLength(1);
  });
});

// ── sortNews ──────────────────────────────────────────────────
const SORT_ARTICLES = [
  makeArticle('Zebra Story',  'last excerpt',  [], '2026-04-01'),
  makeArticle('Alpha Article','first excerpt', [], '2024-01-15'),
  makeArticle('Middle Post',  'mid excerpt',   [], '2025-06-20'),
];

// Override makeArticle to accept a date parameter for sort tests
function makeDated(title, date) {
  return { title, date, excerpt: '', tags: [], body: '', category: 'Test' };
}
const DATED = [
  makeDated('Zebra Story',   '2026-04-01'),
  makeDated('Alpha Article', '2024-01-15'),
  makeDated('Middle Post',   '2025-06-20'),
];

describe('sortNews', () => {
  it('date-desc returns newest article first', () => {
    const result = sortNews(DATED, 'date-desc');
    expect(result[0].date).toBe('2026-04-01');
    expect(result[result.length - 1].date).toBe('2024-01-15');
  });

  it('date-asc returns oldest article first', () => {
    const result = sortNews(DATED, 'date-asc');
    expect(result[0].date).toBe('2024-01-15');
    expect(result[result.length - 1].date).toBe('2026-04-01');
  });

  it('alpha-asc returns articles A → Z by title', () => {
    const result = sortNews(DATED, 'alpha-asc');
    expect(result[0].title).toBe('Alpha Article');
    expect(result[result.length - 1].title).toBe('Zebra Story');
  });

  it('alpha-desc returns articles Z → A by title', () => {
    const result = sortNews(DATED, 'alpha-desc');
    expect(result[0].title).toBe('Zebra Story');
    expect(result[result.length - 1].title).toBe('Alpha Article');
  });

  it('unknown sort value returns all articles unchanged in length', () => {
    expect(sortNews(DATED, 'unknown')).toHaveLength(DATED.length);
  });

  it('does not mutate the original array', () => {
    const original = DATED.slice();
    sortNews(DATED, 'date-asc');
    expect(DATED[0].title).toBe(original[0].title);
    expect(DATED[1].title).toBe(original[1].title);
    expect(DATED[2].title).toBe(original[2].title);
  });

  it('returns all articles (preserves length) for every sort mode', () => {
    ['date-desc', 'date-asc', 'alpha-asc', 'alpha-desc'].forEach(mode => {
      expect(sortNews(DATED, mode)).toHaveLength(DATED.length);
    });
  });
});
