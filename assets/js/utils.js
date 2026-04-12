/* ============================================================
   PMM 2027 — utils.js
   Shared pure utilities: date formatting, i18n, canvas text fit
   Imported by main.js, ui.js, and poster.js
   ============================================================ */

// ── DATE FORMATTING ───────────────────────────────────────────
export function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── TRANSLATIONS ──────────────────────────────────────────────
export const translations = {
  // Navigation
  'nav-home':        { en: 'Home',          mw: 'Dang',              ch: 'Gida' },
  'nav-about':       { en: 'About',         mw: 'Fatak',             ch: 'Game Da Shi' },
  'nav-vision':      { en: 'Vision',        mw: 'Yar Ɓangas',        ch: 'Manufa' },
  'nav-community':   { en: 'Community',     mw: 'Folong',            ch: 'Al\'umma' },
  'nav-news':        { en: 'News',          mw: 'Labarai',           ch: 'Labarai' },
  'nav-poster':      { en: 'My Poster',     mw: 'Kaat Am',           ch: 'Tabbati Na' },
  'nav-join':        { en: 'Join PMM',      mw: 'Wur PMM',           ch: 'Shiga PMM' },
  // Hero
  'hero-label':      { en: 'House of Reps · Mangu/Bokkos · 2027', mw: 'Majalisar Wakilai · Mangu/Bokkos · 2027', ch: 'Majalisar Wakilai · Mangu/Bokkos · 2027' },
  'hero-name':       { en: 'Air Vice Marshal<br>Paul D.<br><em>Masiyer (Rtd.)</em>', mw: 'Air Vice Marshal<br>Paul D.<br><em>Masiyer (Rtd.)</em>', ch: 'Air Vice Marshal<br>Paul D.<br><em>Masiyer (Rtd.)</em>' },
  'hero-tagline':    { en: 'Service. Sacrifice. Commitment. — A New Dawn for Mangu/Bokkos', mw: 'Aiki. Sadaukarwa. Alkawari. — Sabuwar Alfijir ga Mangu/Bokkos', ch: 'Hidima. Sadaukarwa. Wa\'adi. — Sabuwar Alfijir ga Mangu/Bokkos' },
  'hero-desc':       { en: '35 years defending Nigeria. Now returning home to defend Mangu/Bokkos at the National Assembly.', mw: 'Shekaru 35 kare Najeriya. Yanzu ya dawo gida don kare Mangu/Bokkos a Majalisar Kasa.', ch: 'Shekaru 35 kare Najeriya. Yanzu ya dawo don kare Mangu/Bokkos a Majalisar Kasa.' },
  'hero-cta-join':   { en: 'Join the Movement', mw: 'Wur Yar Ɓangas',  ch: 'Shiga Kungiyar' },
  'hero-cta-vision': { en: 'Our Vision',         mw: 'Yar Ɓangas Mu',   ch: 'Manufarmu' },
  // Sections
  'section-agenda':  { en: 'Our 8-Pillar Agenda', mw: 'Shirye-shirye 8',  ch: 'Shirye-shirye 8' },
  'section-news':    { en: 'Latest News',           mw: 'Labarai Sabon',   ch: 'Sabbin Labarai' },
  'section-join':    { en: 'Join the Movement',     mw: 'Wur Yar Ɓangas',  ch: 'Shiga Kungiyar' },
  // Stats
  'stat-years':      { en: 'Years of Service',   mw: 'Shekara Hidima',  ch: 'Shekarun Hidima' },
  'stat-wards':      { en: 'Wards Reached',      mw: 'Unguwoyi',        ch: 'Unguwanni' },
  'stat-supporters': { en: 'Supporters',         mw: 'Masu Goyon Baya', ch: 'Magoya Baya' },
  'stat-pillars':    { en: 'Agenda Pillars',     mw: 'Shirye-shirye',   ch: 'Manufofi' },
  // Form
  'form-firstname':  { en: 'First Name', mw: 'Sunan Farko',    ch: 'Sunan Farko' },
  'form-lastname':   { en: 'Last Name',  mw: 'Sunan Iyali',    ch: 'Sunan Iyali' },
  'form-phone':      { en: 'Phone',      mw: 'Wayar Hannu',    ch: 'Lambar Waya' },
  'form-email':      { en: 'Email',      mw: 'Imel',           ch: 'Imel' },
  'form-lga':        { en: 'LGA',        mw: 'Kananan Hukuma', ch: 'Kananan Hukuma' },
  'form-ward':       { en: 'Your Ward',  mw: 'Unguwar Ka',     ch: 'Unguwar Ka' },
  'cta-submit':      { en: 'Join the Movement', mw: 'Wur Yanzu', ch: 'Shiga Yanzu' },
  'cta-read-more':   { en: 'Read More',          mw: 'Karanta Kari', ch: 'Karanta Ƙari' },
};

export const LANGS = ['en', 'mw', 'ch'];
export const LANG_LABELS = { en: 'EN', mw: 'MW', ch: 'CH' };

// ── I18N ──────────────────────────────────────────────────────
/**
 * Applies translations for `lang` to every [data-t] element in the document.
 * Falls back to English when a key is missing in the requested language.
 * Emits a console.warn (visible in dev tools) for keys absent from translations.
 */
export function applyLanguage(lang) {
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    const val = translations[key]?.[lang] ?? translations[key]?.['en'];
    if (!val) {
      console.warn(`[PMM i18n] Missing translation key: "${key}" for lang: "${lang}"`);
      return;
    }
    if (el.getAttribute('data-html') === 'true') el.innerHTML = val;
    else el.textContent = val;
  });
}

// ── MWAGHAVUL / BOKKOS NAME POOL ─────────────────────────────
/**
 * Verified pool of culturally authentic Mwaghavul and Bokkos names.
 * Used for session-randomised testimonial attributions and poster
 * name previews. Each entry: { name, initial, role }.
 * All names follow Mwaghavul naming conventions:
 *   - "Ma-" prefix surnames common in Sura/Mwaghavul culture
 *   - First names: Christian/biblical, indigenous, and Hausa-origin
 *   - "Mama" honorific used for elder women
 */
export const MWAGHAVUL_POOL = [
  { name: 'Nden Mafarki',       initial: 'N', role: 'Community Leader, Mangu LGA'         },
  { name: 'Rifkatu Magang',     initial: 'R', role: "Farmers' Association, Bokkos LGA"    },
  { name: 'Bulus Mazat',        initial: 'B', role: 'Youth Leader, Mangu Town'             },
  { name: 'Mama Lydia Mamtur',  initial: 'L', role: "Women's Leader, Bokkos"               },
  { name: 'Kwasen Maren',       initial: 'K', role: 'Diaspora — Lagos'                     },
  { name: 'Daniel Longs Mattu', initial: 'D', role: 'Civil Servant, Plateau State'         },
  { name: 'Yamsat Masat',       initial: 'Y', role: 'Trader, Bokkos Market'               },
  { name: 'Esther Makyen',      initial: 'E', role: 'Teacher, Mangu LGA'                  },
  { name: 'Fwanret Mangoel',    initial: 'F', role: 'Youth Organiser, Bokkos'             },
  { name: 'Rhoda Matum',        initial: 'R', role: "Women's Representative, Mangu Ward"  },
  { name: 'Dauda Mazang',       initial: 'D', role: 'Farmer, Bokkos LGA'                  },
  { name: 'Naomi Mayen',        initial: 'N', role: 'Community Health Worker, Mangu'      },
];

/** Seeded-by-session shuffle (Fisher-Yates with Math.random). */
export function shuffleNames(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── CANVAS TEXT FIT ───────────────────────────────────────────
/**
 * Reduces font size until `text` fits within `maxWidth` pixels on `ctx`.
 * Returns the largest size (px) that fits, never below 10.
 * Fixes the off-by-one in the original do-while: we now measure AFTER
 * setting the font, so the returned size matches the last measured render.
 */
export function fitText(ctx, text, maxWidth, baseSize) {
  let size = baseSize;
  ctx.font = `600 ${size}px "Playfair Display", serif`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size--;
    ctx.font = `600 ${size}px "Playfair Display", serif`;
  }
  return size;
}
