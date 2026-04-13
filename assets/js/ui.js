/* ============================================================
   PMM 2027 — ui.js  |  News page rendering + article modal
   ============================================================ */
import { formatDate } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('news-grid'))    loadNewsPage();
  if (document.getElementById('article-modal')) initModal();
});

// ── DEBOUNCE ──────────────────────────────────────────────────
function debounce(fn, ms) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}

// ── NEWS PAGE LOADER ──────────────────────────────────────────
async function loadNewsPage() {
  const grid       = document.getElementById('news-grid');
  const filterBtns = document.querySelectorAll('[data-filter]');
  const searchInput = document.getElementById('news-search');
  let allNews = [];

  try {
    const res = await fetch('data/news.json');
    allNews = await res.json();
    renderNews(allNews, grid);
    updateFilterCounts(allNews);
  } catch {
    grid.innerHTML = '<p style="color:var(--ink-muted);padding:32px 0;">Could not load news. Please refresh.</p>';
    return;
  }

  // Combined apply function — reads current filter + search + sort state
  const apply = () => applyFiltersAndSearch(allNews, grid);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      apply();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', apply);
  }

  const sortSelect = document.getElementById('news-sort');
  if (sortSelect) sortSelect.addEventListener('change', apply);

  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const article = allNews.find(n => n.slug === hash);
    if (article) openModal(article);
  }
}

// ── FILTER + SEARCH COMBINATOR ────────────────────────────────
/**
 * Reads the currently active filter button value and the search input,
 * applies both (AND logic), re-renders the grid, and updates the results count.
 * Exported for testability.
 */
export function applyFiltersAndSearch(allNews, grid) {
  const activeBtn   = document.querySelector('[data-filter].active');
  const filterValue = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
  const query       = (document.getElementById('news-search')?.value ?? '').trim();
  const sortValue   = document.getElementById('news-sort')?.value ?? 'date-desc';

  let results = allNews.filter(a => matchesFilter(a, filterValue));
  if (query) results = searchNews(results, query);
  results = sortNews(results, sortValue);

  renderNews(results, grid);
  updateResultsCount(results.length, allNews.length, query, filterValue);
}

// ── FILTER MATCHER ────────────────────────────────────────────
/**
 * Returns true if `article` matches the given filter value.
 * `filterValue` may be:
 *   - "all"                     → always matches
 *   - "Security"                → exact category match
 *   - "Campaign|Announcement"   → matches any listed category (pipe-delimited)
 * Exported for unit testing.
 */
export function matchesFilter(article, filterValue) {
  if (!filterValue || filterValue === 'all') return true;
  const cats = filterValue.split('|').map(s => s.trim());
  return cats.includes(article.category);
}

// ── SEARCH ────────────────────────────────────────────────────
/**
 * Returns articles where `query` appears (case-insensitive) in any of:
 * title, excerpt, or tags (joined as a string).
 * An empty/blank query returns all articles unchanged.
 * Exported for unit testing.
 */
export function searchNews(articles, query) {
  if (!query || !query.trim()) return articles;
  const q = query.trim().toLowerCase();
  return articles.filter(a => {
    const haystack = [
      a.title   ?? '',
      a.excerpt ?? '',
      a.body    ?? '',
      (a.tags   ?? []).join(' '),
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

// ── SORT ──────────────────────────────────────────────────────
/**
 * Returns a sorted copy of `articles` according to `sortValue`:
 *   "date-desc"  → newest first  (default)
 *   "date-asc"   → oldest first
 *   "alpha-asc"  → A → Z by title
 *   "alpha-desc" → Z → A by title
 * Never mutates the input array.
 * Exported for unit testing.
 */
export function sortNews(articles, sortValue) {
  const arr = articles.slice();
  if (sortValue === 'date-asc')   return arr.sort((a, b) => a.date.localeCompare(b.date));
  if (sortValue === 'date-desc')  return arr.sort((a, b) => b.date.localeCompare(a.date));
  if (sortValue === 'alpha-asc')  return arr.sort((a, b) => a.title.localeCompare(b.title));
  if (sortValue === 'alpha-desc') return arr.sort((a, b) => b.title.localeCompare(a.title));
  return arr;
}

// ── FILTER COUNT BADGES ───────────────────────────────────────
/**
 * Computes how many articles match each filter button and injects
 * (or updates) a <span class="count-badge"> inside each button.
 */
export function updateFilterCounts(allNews) {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    const filterValue = btn.getAttribute('data-filter');
    const count = filterValue === 'all'
      ? allNews.length
      : allNews.filter(a => matchesFilter(a, filterValue)).length;

    let badge = btn.querySelector('.count-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'count-badge';
      btn.appendChild(badge);
    }
    badge.textContent = count;
  });
}

// ── RESULTS COUNT LINE ────────────────────────────────────────
function updateResultsCount(showing, total, query, filterValue) {
  const el = document.getElementById('results-count');
  if (!el) return;
  // Hide when showing everything with no search active
  if (showing === total && !query && filterValue === 'all') {
    el.textContent = '';
    return;
  }
  if (showing === 0) {
    el.textContent = query
      ? `No articles found for "${query}"`
      : 'No articles in this category yet.';
  } else {
    el.textContent = `Showing ${showing} of ${total} article${total !== 1 ? 's' : ''}`;
  }
}

// ── RENDER ────────────────────────────────────────────────────
export function renderNews(news, grid) {
  if (!news.length) {
    grid.innerHTML = '<p style="color:var(--ink-muted);padding:32px 0;">No articles found.</p>';
    return;
  }
  grid.innerHTML = news.map((item, i) => `
    <article class="news-card aos" style="transition-delay:${i * 0.07}s" data-slug="${item.slug}"
      onclick="openArticle('${item.slug}')">
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
        <span class="news-card-link">Read Full Story →</span>
      </div>
    </article>
  `).join('');

  setTimeout(() => grid.querySelectorAll('.aos').forEach(el => el.classList.add('visible')), 60);
  window._newsData = news;
}

export function openArticle(slug) {
  const article = window._newsData?.find(n => n.slug === slug);
  if (article) openModal(article);
}

// ── ARTICLE BODY PARSER ───────────────────────────────────────
/**
 * Converts raw article body text to HTML.
 *
 * Rules:
 *  - Paragraphs are separated by double newlines.
 *  - A paragraph whose first non-whitespace character is "-" or "•"
 *    is rendered as a <ul> list; each line becomes a <li>.
 *  - Empty paragraphs (from extra blank lines) are silently dropped.
 *  - Null / undefined / empty input returns "".
 *
 * Exported for unit testing.
 */
export function parseBody(bodyText) {
  if (!bodyText) return '';
  return bodyText
    .split('\n\n')
    .filter(para => para.trim())
    .map(para =>
      para.trim().startsWith('-') || para.trim().startsWith('•')
        ? `<ul>${para.split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^[-•]\s*/, '')}</li>`).join('')}</ul>`
        : `<p>${para}</p>`
    )
    .join('');
}

export function openModal(article) {
  const modal = document.getElementById('article-modal');
  if (!modal) return;

  modal.querySelector('#modal-category').textContent = article.category;
  modal.querySelector('#modal-date').textContent      = formatDate(article.date);
  modal.querySelector('#modal-title').textContent     = article.title;

  const body = modal.querySelector('#modal-body');
  body.innerHTML = parseBody(article.body);

  const tagsEl = modal.querySelector('#modal-tags');
  if (tagsEl && article.tags) {
    tagsEl.innerHTML = article.tags.map(t => `<span class="tag tag-green">${t}</span>`).join('');
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  history.pushState(null, '', `#${article.slug}`);

  const shareText = encodeURIComponent(`${article.title} — PMM 2027 #PMM2027 #ManguBokkos`);
  const shareUrl  = encodeURIComponent(window.location.href);
  modal.querySelector('#modal-share-wa')?.setAttribute('href',
    `https://wa.me/?text=${encodeURIComponent(article.title + '\n\n' + window.location.origin + '/news.html#' + article.slug + '\n\n#PMM2027 #ManguBokkos')}`
  );
  modal.querySelector('#modal-share-tw')?.setAttribute('href',
    `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`
  );
  modal.querySelector('#modal-share-fb')?.setAttribute('href',
    `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
  );
}

export function initModal() {
  const modal = document.getElementById('article-modal');
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

export function closeModal() {
  const modal = document.getElementById('article-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  history.pushState(null, '', window.location.pathname);
}

window.openArticle = openArticle;
window.closeModal  = closeModal;
