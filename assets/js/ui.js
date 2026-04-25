/* ============================================================
   PMM 2027 — ui.js  |  News page rendering + article modal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('news-grid'))    loadNewsPage();
  if (document.getElementById('article-modal')) initModal();
});

async function loadNewsPage() {
  const grid      = document.getElementById('news-grid');
  const filterBtns = document.querySelectorAll('[data-filter]');
  let allNews = [];

  try {
    const res = await fetch('data/news.json');
    allNews = await res.json();
    renderNews(allNews, grid);
  } catch {
    grid.innerHTML = '<p style="color:var(--ink-muted);padding:32px 0;">Could not load news. Please refresh.</p>';
    return;
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      renderNews(cat === 'all' ? allNews : allNews.filter(n => n.category === cat), grid);
    });
  });

  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const article = allNews.find(n => n.slug === hash);
    if (article) openModal(article);
  }
}

function renderNews(news, grid) {
  if (!news.length) {
    grid.innerHTML = '<p style="color:var(--ink-muted);padding:32px 0;">No articles in this category yet.</p>';
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

function openArticle(slug) {
  const article = window._newsData?.find(n => n.slug === slug);
  if (article) openModal(article);
}

function openModal(article) {
  const modal = document.getElementById('article-modal');
  if (!modal) return;

  modal.querySelector('#modal-category').textContent = article.category;
  modal.querySelector('#modal-date').textContent      = formatDate(article.date);
  modal.querySelector('#modal-title').textContent     = article.title;

  const body = modal.querySelector('#modal-body');
  body.innerHTML = article.body.split('\n\n').map(para =>
    para.trim().startsWith('-') || para.trim().startsWith('•')
      ? `<ul>${para.split('\n').filter(l => l.trim()).map(l => `<li>${l.replace(/^[-•]\s*/, '')}</li>`).join('')}</ul>`
      : `<p>${para}</p>`
  ).join('');

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

function initModal() {
  const modal = document.getElementById('article-modal');
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function closeModal() {
  const modal = document.getElementById('article-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  history.pushState(null, '', window.location.pathname);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

window.openArticle = openArticle;
window.closeModal  = closeModal;
