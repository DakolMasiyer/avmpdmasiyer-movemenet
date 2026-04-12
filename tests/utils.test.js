import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatDate,
  applyLanguage,
  LANGS,
  LANG_LABELS,
  translations,
  fitText,
} from '../assets/js/utils.js';

// ── formatDate ────────────────────────────────────────────────
describe('formatDate', () => {
  it('formats a full ISO date string', () => {
    expect(formatDate('2027-01-15')).toBe('15 January 2027');
  });

  it('formats an early-month date without leading zero', () => {
    expect(formatDate('2025-03-01')).toBe('1 March 2025');
  });

  it('formats a date at end of year', () => {
    expect(formatDate('2024-12-31')).toBe('31 December 2024');
  });

  it('returns "Invalid Date" for an empty string', () => {
    expect(formatDate('')).toBe('Invalid Date');
  });

  it('returns "Invalid Date" for a nonsense string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date');
  });
});

// ── LANGS and LANG_LABELS ─────────────────────────────────────
describe('LANGS and LANG_LABELS', () => {
  it('contains exactly three language codes in the correct order', () => {
    expect(LANGS).toEqual(['en', 'mw', 'ch']);
  });

  it('has a non-empty display label for every language code', () => {
    LANGS.forEach(lang => {
      expect(LANG_LABELS[lang]).toBeDefined();
      expect(typeof LANG_LABELS[lang]).toBe('string');
      expect(LANG_LABELS[lang].length).toBeGreaterThan(0);
    });
  });
});

// ── translations completeness ─────────────────────────────────
describe('translations completeness', () => {
  it('has at least the expected nav and form keys', () => {
    const required = [
      'nav-home', 'nav-about', 'nav-vision', 'nav-community', 'nav-news',
      'form-firstname', 'form-lastname', 'form-phone', 'cta-submit', 'cta-read-more',
    ];
    required.forEach(key => {
      expect(translations[key], `Missing key: "${key}"`).toBeDefined();
    });
  });

  it('every key has an English (en) value', () => {
    Object.entries(translations).forEach(([key, langs]) => {
      expect(langs.en, `Missing EN translation for key "${key}"`).toBeTruthy();
    });
  });

  it('every key has a Mwaghavul (mw) value', () => {
    Object.entries(translations).forEach(([key, langs]) => {
      expect(langs.mw, `Missing MW translation for key "${key}"`).toBeTruthy();
    });
  });

  it('every key has a Challa (ch) value', () => {
    Object.entries(translations).forEach(([key, langs]) => {
      expect(langs.ch, `Missing CH translation for key "${key}"`).toBeTruthy();
    });
  });
});

// ── applyLanguage ─────────────────────────────────────────────
describe('applyLanguage', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('sets textContent for a standard [data-t] element', () => {
    document.body.innerHTML = '<span data-t="nav-home"></span>';
    applyLanguage('en');
    expect(document.querySelector('[data-t="nav-home"]').textContent).toBe('Home');
  });

  it('sets innerHTML for [data-html="true"] elements', () => {
    document.body.innerHTML = '<div data-t="hero-name" data-html="true"></div>';
    applyLanguage('en');
    const el = document.querySelector('[data-t="hero-name"]');
    expect(el.innerHTML).toContain('<br>');
    expect(el.children.length).toBeGreaterThan(0);
  });

  it('does NOT set innerHTML on elements without data-html="true"', () => {
    document.body.innerHTML = '<span data-t="hero-name"></span>';
    applyLanguage('en');
    // textContent sets raw text — no child elements should be created
    expect(document.querySelector('[data-t="hero-name"]').children.length).toBe(0);
  });

  it('applies Mwaghavul (mw) translations', () => {
    document.body.innerHTML = '<span data-t="nav-home"></span>';
    applyLanguage('mw');
    expect(document.querySelector('[data-t="nav-home"]').textContent).toBe('Dang');
  });

  it('applies Challa (ch) translations', () => {
    document.body.innerHTML = '<span data-t="nav-home"></span>';
    applyLanguage('ch');
    expect(document.querySelector('[data-t="nav-home"]').textContent).toBe('Gida');
  });

  it('falls back to English when an unknown language code is given', () => {
    document.body.innerHTML = '<span data-t="nav-home"></span>';
    applyLanguage('zz');
    expect(document.querySelector('[data-t="nav-home"]').textContent).toBe('Home');
  });

  it('emits console.warn and leaves element unchanged for an unknown key', () => {
    document.body.innerHTML = '<span data-t="totally-unknown-key">original</span>';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    applyLanguage('en');
    expect(document.querySelector('[data-t="totally-unknown-key"]').textContent).toBe('original');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('totally-unknown-key'));
    warn.mockRestore();
  });

  it('updates multiple elements in one call', () => {
    document.body.innerHTML = `
      <span data-t="nav-home"></span>
      <span data-t="nav-about"></span>
    `;
    applyLanguage('en');
    expect(document.querySelector('[data-t="nav-home"]').textContent).toBe('Home');
    expect(document.querySelector('[data-t="nav-about"]').textContent).toBe('About');
  });
});

// ── fitText ───────────────────────────────────────────────────
describe('fitText', () => {
  // Helper: creates a mock canvas 2d context that always reports a fixed text width
  function makeCtx(fixedWidth) {
    const ctx = { font: '' };
    ctx.measureText = vi.fn(() => ({ width: fixedWidth }));
    return ctx;
  }

  it('returns baseSize unchanged when text already fits', () => {
    const ctx = makeCtx(100);                  // width 100 < maxWidth 500
    expect(fitText(ctx, 'Short', 500, 48)).toBe(48);
  });

  it('sets ctx.font to the chosen size before returning', () => {
    const ctx = makeCtx(0);                    // always fits
    fitText(ctx, 'Hi', 500, 36);
    expect(ctx.font).toContain('36px');
  });

  it('reduces size until text fits within maxWidth', () => {
    let calls = 0;
    const ctx = {
      font: '',
      // First 4 calls: too wide; after that: fits
      measureText: vi.fn(() => ({ width: calls++ < 4 ? 600 : 50 })),
    };
    const result = fitText(ctx, 'LONG NAME', 200, 48);
    expect(result).toBeLessThan(48);
    expect(result).toBeGreaterThanOrEqual(10);
  });

  it('never returns a size below the minimum of 10', () => {
    const ctx = makeCtx(9999);                 // always too wide
    expect(fitText(ctx, 'text', 1, 48)).toBe(10);
  });

  it('returns baseSize for empty string (zero measured width)', () => {
    const ctx = makeCtx(0);                    // empty string has width 0
    expect(fitText(ctx, '', 500, 48)).toBe(48);
  });

  it('returned size matches the font size set on ctx (no off-by-one)', () => {
    const ctx = makeCtx(0);                    // always fits on first attempt
    const size = fitText(ctx, 'Test', 500, 42);
    // The font property should reflect exactly the returned size
    expect(ctx.font).toContain(`${size}px`);
  });
});
