import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActiveNavLink, submitJoinForm } from '../assets/js/main.js';

// ── Helpers ───────────────────────────────────────────────────
const NAV_HTML = `
  <nav>
    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="news.html">News</a>
      <a href="vision.html">Vision</a>
    </div>
  </nav>
  <div id="mobile-nav">
    <a href="index.html">Home</a>
    <a href="news.html">News</a>
  </div>
`;

function stubPathname(pathname) {
  Object.defineProperty(globalThis, 'location', {
    value: { pathname },
    configurable: true,
    writable: true,
  });
}

// ── setActiveNavLink ──────────────────────────────────────────
describe('setActiveNavLink', () => {
  beforeEach(() => {
    document.body.innerHTML = NAV_HTML;
  });

  afterEach(() => {
    // Restore links to no active state so tests are independent
    document.querySelectorAll('a').forEach(a => a.classList.remove('active'));
  });

  it('marks the matching .html link as active', () => {
    stubPathname('/news.html');
    setActiveNavLink();
    expect(document.querySelector('[href="news.html"]').classList.contains('active')).toBe(true);
    expect(document.querySelector('.nav-links [href="index.html"]').classList.contains('active')).toBe(false);
  });

  it('marks index.html links active for the root path /', () => {
    stubPathname('/');
    setActiveNavLink();
    const homeLinks = document.querySelectorAll('[href="index.html"]');
    homeLinks.forEach(link => {
      expect(link.classList.contains('active')).toBe(true);
    });
  });

  it('marks the correct link active for a pretty URL with trailing slash (/news/)', () => {
    stubPathname('/news/');
    setActiveNavLink();
    expect(document.querySelector('[href="news.html"]').classList.contains('active')).toBe(true);
  });

  it('marks the correct link active for a pretty URL without extension (/about)', () => {
    stubPathname('/about');
    setActiveNavLink();
    expect(document.querySelector('[href="about.html"]').classList.contains('active')).toBe(true);
  });

  it('marks both desktop and mobile nav links active', () => {
    stubPathname('/news.html');
    setActiveNavLink();
    const newsLinks = document.querySelectorAll('[href="news.html"]');
    newsLinks.forEach(link => {
      expect(link.classList.contains('active')).toBe(true);
    });
  });

  it('does not mark any link active when pathname does not match', () => {
    stubPathname('/nonexistent.html');
    setActiveNavLink();
    const active = document.querySelectorAll('.nav-links a.active, #mobile-nav a.active');
    expect(active.length).toBe(0);
  });
});

// ── submitJoinForm ────────────────────────────────────────────
describe('submitJoinForm', () => {
  let form, btn, successEl;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="join-form">
        <input name="firstName" value="Amara" />
        <button type="submit">Join the Movement</button>
      </form>
      <div id="form-success"></div>
    `;
    form      = document.getElementById('join-form');
    btn       = form.querySelector('[type="submit"]');
    successEl = document.getElementById('form-success');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('disables the submit button and shows loading text immediately', async () => {
    // fetch that never resolves so we can inspect state mid-flight
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    const promise = submitJoinForm(form);
    expect(btn.textContent).toBe('Submitting...');
    expect(btn.disabled).toBe(true);
    vi.unstubAllGlobals();
  });

  it('prevents double-submit: button stays disabled during request', async () => {
    let resolveRequest;
    vi.stubGlobal('fetch', vi.fn(() => new Promise(res => { resolveRequest = res; })));
    submitJoinForm(form);               // start but don't await
    expect(btn.disabled).toBe(true);
    resolveRequest({ ok: true });
    vi.unstubAllGlobals();
  });

  it('hides the form and shows #form-success on a 2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    await submitJoinForm(form);
    expect(form.style.display).toBe('none');
    expect(successEl.classList.contains('visible')).toBe(true);
    vi.unstubAllGlobals();
  });

  it('re-enables the button with error text on a non-ok response (e.g. 422)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await submitJoinForm(form);
    expect(btn.textContent).toBe('Error — Try Again');
    expect(btn.disabled).toBe(false);
    vi.unstubAllGlobals();
  });

  it('re-enables the button with error text on a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    await submitJoinForm(form);
    expect(btn.textContent).toBe('Error — Try Again');
    expect(btn.disabled).toBe(false);
    vi.unstubAllGlobals();
  });

  it('does not show the success element on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await submitJoinForm(form);
    expect(successEl.classList.contains('visible')).toBe(false);
    vi.unstubAllGlobals();
  });
});
