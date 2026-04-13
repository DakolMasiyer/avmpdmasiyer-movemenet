/* ============================================================
   PMM 2027 — main.js
   Nav, AOS, language toggle (EN / Mwaghavul / Challa), share
   ============================================================ */
import { formatDate, LANGS, LANG_LABELS, applyLanguage, MWAGHAVUL_POOL, shuffleNames } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  loadComponents();

  // Navbar scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile nav toggle
  document.addEventListener('click', (e) => {
    const burger = e.target.closest('.hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    if (burger && mobileNav) {
      mobileNav.classList.toggle('open');
      burger.classList.toggle('active');
      const spans = burger.querySelectorAll('span');
      if (burger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    }
    if (e.target.closest('#mobile-nav a')) {
      document.getElementById('mobile-nav')?.classList.remove('open');
    }
  });

  // AOS
  const aosEls = document.querySelectorAll('.aos');
  if (aosEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
    aosEls.forEach(el => obs.observe(el));
  }

  // Counter animation
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (counters.length) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => co.observe(el));
  }

  initLanguageToggle();
  initShareButtons();
  setActiveNavLink();
  randomizeTestimonials();

  if (document.getElementById('news-preview')) loadNewsPreview();

  // Form handler
  const form = document.getElementById('join-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitJoinForm(form);
    });
  }
});

// ── COMPONENT LOADER ──────────────────────────────────────────
async function loadComponents() {
  const includes = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(includes).map(async (el) => {
    try {
      const res = await fetch(el.getAttribute('data-include'));
      if (res.ok) el.innerHTML = await res.text();
    } catch {}
  }));
  setActiveNavLink();
  applyLanguage(currentLang);
}

// ── COUNTER ANIMATION ──────────────────────────────────────────
export function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1800;
  const start = performance.now();
  const tick = (now) => {
    const eased = 1 - Math.pow(1 - Math.min((now - start) / duration, 1), 3);
    el.textContent = Math.round(eased * target).toLocaleString() + suffix;
    if (eased < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── LANGUAGE TOGGLE — EN / Mwaghavul (Mangu) / Challa (Bokkos) ──
let currentLangIdx = 0;
let currentLang = localStorage.getItem('pmm-lang') || 'en';
currentLangIdx = LANGS.indexOf(currentLang);
if (currentLangIdx < 0) currentLangIdx = 0;

function initLanguageToggle() {
  applyLanguage(currentLang);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.lang-toggle')) return;
    currentLangIdx = (currentLangIdx + 1) % LANGS.length;
    currentLang = LANGS[currentLangIdx];
    localStorage.setItem('pmm-lang', currentLang);
    applyLanguage(currentLang);
    document.querySelectorAll('.lang-toggle .lang-text').forEach(el => {
      el.textContent = LANG_LABELS[currentLang];
    });
  });
}

// ── SOCIAL SHARE ──────────────────────────────────────────────
function initShareButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-share]');
    if (!btn) return;
    const platform = btn.getAttribute('data-share');
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Join AVM Paul Masiyer (Rtd.) — Service is the promise we make, and unity is the strength that fulfills it. House of Representatives 2027 #PMM2027 #ManguBokkos');
    const waMsg = encodeURIComponent('Join the AVM Paul Masiyer Movement! 🇳🇬\n\n"Service is the promise we make, and unity is the strength that fulfills it"\n\nAVM Paul D. Masiyer (Rtd.) — House of Representatives, Mangu/Bokkos 2027\n\nJoin us: ' + window.location.origin + '\n\n#PMM2027 #ManguBokkos #APC2027');

    const urls = {
      whatsapp: `https://wa.me/?text=${waMsg}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      copy: null
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const orig = btn.innerHTML;
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.innerHTML = orig, 2000);
      });
    } else if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=620,height=420');
    }
  });
}

// ── ACTIVE NAV LINK ───────────────────────────────────────────
/**
 * Marks the nav link matching the current page as active.
 * Handles all three URL forms Netlify may serve:
 *   /news.html  →  news.html
 *   /news       →  news.html  (pretty URL without trailing slash)
 *   /news/      →  news.html  (pretty URL with trailing slash)
 *   /           →  index.html
 */
export function setActiveNavLink() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  let seg = parts.pop() || 'index.html';
  if (!seg.includes('.')) seg += '.html';
  document.querySelectorAll('.nav-links a, #mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href === seg) a.classList.add('active');
  });
}

// ── FORM SUBMISSION ───────────────────────────────────────────
/**
 * Submits the join form to Formspree.
 * Extracted as a named export so it can be unit-tested with a mocked fetch.
 */
export async function submitJoinForm(form) {
  const btn = form.querySelector('[type="submit"]');
  btn.textContent = 'Submitting...';
  btn.disabled = true;
  try {
    const res = await fetch('https://formspree.io/f/mkopqngy', {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      form.style.display = 'none';
      document.getElementById('form-success')?.classList.add('visible');
    } else {
      btn.textContent = 'Error — Try Again';
      btn.disabled = false;
    }
  } catch {
    btn.textContent = 'Error — Try Again';
    btn.disabled = false;
  }
}

// ── TESTIMONIAL NAME RANDOMISER ───────────────────────────────
/**
 * On each page session, picks a fresh shuffle of MWAGHAVUL_POOL names
 * and assigns them to the testimonial cards (name, avatar initial, role).
 * The quote text is authored content and stays fixed; only attribution rotates.
 * Cards must carry a [data-testimonial="0..5"] attribute.
 */
export function randomizeTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('[data-testimonial]');
  if (!cards.length) return;
  const pool = shuffleNames(MWAGHAVUL_POOL);
  cards.forEach((card, i) => {
    const person = pool[i % pool.length];
    const avatarEl = card.querySelector('.testimonial-avatar');
    const nameEl   = card.querySelector('.testimonial-name');
    const roleEl   = card.querySelector('.testimonial-role');
    if (avatarEl) avatarEl.textContent = person.initial;
    if (nameEl)   nameEl.textContent   = person.name;
    if (roleEl)   roleEl.textContent   = person.role;
  });
}

// ── NEWS PREVIEW LOADER ───────────────────────────────────────
async function loadNewsPreview() {
  const container = document.getElementById('news-preview');
  if (!container) return;
  try {
    const res = await fetch('data/news.json');
    const news = await res.json();
    container.innerHTML = news.slice(0, 3).map((item, i) => `
      <div class="news-card aos" style="transition-delay:${i * 0.1}s" onclick="void(0)">
        <div class="news-card-img">
          ${item.image
            ? `<img src="${item.image}" alt="${item.title}" loading="lazy">`
            : `<div class="news-card-img-placeholder"><span>PMM</span></div>`
          }
          <div class="news-card-cat">${item.category}</div>
        </div>
        <div class="news-card-body">
          <div class="news-card-date">${formatDate(item.date)}</div>
          <h3>${item.title}</h3>
          <p>${item.excerpt}</p>
          <a href="news.html#${item.slug}" class="news-card-link">
            <span data-t="cta-read-more">Read More</span> →
          </a>
        </div>
      </div>
    `).join('');
    container.querySelectorAll('.aos').forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
      setTimeout(() => el.classList.add('visible'), 80);
    });
    applyLanguage(currentLang);
  } catch (err) {
    console.warn('News load failed:', err);
  }
}
