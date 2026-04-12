import { describe, it, expect } from 'vitest';
import { parseBody } from '../assets/js/ui.js';

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
