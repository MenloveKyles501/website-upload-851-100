import { H as Hls } from './js/player-dru42stk.js';

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function toText(v) { return (v ?? '').toString(); }
function escapeHtml(str) {
  return toText(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function truncate(str, len) {
  const s = toText(str).replace(/\s+/g, ' ').trim();
  return s.length > len ? s.slice(0, len - 1) + '…' : s;
}
function byQuery() {
  const params = new URLSearchParams(location.search);
  return params.get('q') || '';
}
function normalize(v) {
  return toText(v).toLowerCase();
}

function renderCards(items, target, options = {}) {
  if (!target) return;
  const prefix = options.prefix || '';
  target.innerHTML = items.map((m, idx) => `
    <article class="movie-card">
      <a href="${prefix}video/${m.id}.html" aria-label="${escapeHtml(m.title)}">
        <div class="movie-poster">
          <img src="${prefix}assets/covers/${m.id}.svg" alt="${escapeHtml(m.title)}" loading="lazy">
        </div>
      </a>
      <div class="movie-body">
        <h3 class="movie-title"><a href="${prefix}video/${m.id}.html">${escapeHtml(m.title)}</a></h3>
        <div class="movie-meta">
          <span>${escapeHtml(m.year || '')}</span>
          <span>${escapeHtml(m.region || '')}</span>
          <span>${escapeHtml(m.type || '')}</span>
        </div>
        <p class="movie-desc">${escapeHtml(truncate(m.one_line || m.summary || m.review || m.title, 92))}</p>
        <div class="movie-actions">
          <a class="btn btn-primary" href="${prefix}video/${m.id}.html">立即观看</a>
          <span class="mini">${escapeHtml((m.tags || []).slice(0,2).join(' · '))}</span>
        </div>
      </div>
    </article>
  `).join('');
}

function filterMovies(movies, query, type, region) {
  const q = normalize(query);
  return movies.filter(m => {
    const hay = [m.title, m.region, m.type, m.year, m.genre, m.one_line, m.summary, m.review, ...(m.tags || [])].map(normalize).join(' ');
    const okQ = !q || hay.includes(q);
    const okType = !type || type === 'all' || normalize(m.type) === normalize(type);
    const okRegion = !region || region === 'all' || normalize(m.region) === normalize(region);
    return okQ && okType && okRegion;
  });
}

function initSearchPage() {
  const root = qs('[data-search-page]');
  if (!root || !window.MOVIES_DATA) return;
  const input = qs('[data-search-input]', root);
  const type = qs('[data-search-type]', root);
  const region = qs('[data-search-region]', root);
  const count = qs('[data-search-count]', root);
  const results = qs('[data-search-results]', root);
  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';
  if (input && q) input.value = q;

  const run = () => {
    const items = filterMovies(window.MOVIES_DATA, input ? input.value : '', type ? type.value : 'all', region ? region.value : 'all');
    count.textContent = `${items.length}`;
    renderCards(items.slice(0, 120), results, { prefix: '' });
  };
  [input, type, region].forEach(el => el && el.addEventListener('input', run));
  run();
}

function initFilters() {
  qsa('[data-filter-group]').forEach(group => {
    const buttons = qsa('button', group);
    const targetSel = group.getAttribute('data-target');
    const target = targetSel ? qs(targetSel) : null;
    const cards = target ? qsa('[data-filter-item]', target) : [];
    if (!buttons.length || !cards.length) return;
    const apply = val => {
      buttons.forEach(b => b.classList.toggle('active', b.dataset.filter === val));
      cards.forEach(card => {
        const ok = val === 'all' || card.dataset.filter === val;
        card.style.display = ok ? '' : 'none';
      });
    };
    buttons.forEach(btn => btn.addEventListener('click', () => apply(btn.dataset.filter || 'all')));
    apply('all');
  });
}

function initMobileNav() {
  const btn = qs('[data-menu-btn]');
  const nav = qs('[data-nav]');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
}

function initInlineSearch() {
  qsa('[data-inline-search]').forEach(form => {
    form.addEventListener('submit', (e) => {
      const input = qs('input', form);
      const q = input ? input.value.trim() : '';
      if (!q) {
        e.preventDefault();
        return;
      }
      form.action = form.dataset.inlineSearch || 'search.html';
      const target = form.querySelector('input[name="q"]');
      if (target) target.value = q;
    });
  });
}

function initAutoScroll() {
  qsa('[data-autoscroll]').forEach(track => {
    let timer = null;
    const step = () => {
      if (!track.isConnected) return;
      track.scrollLeft += 1;
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 1) track.scrollLeft = 0;
      timer = window.requestAnimationFrame(step);
    };
    timer = window.requestAnimationFrame(step);
    track.addEventListener('mouseenter', () => { if (timer) cancelAnimationFrame(timer); timer = null; });
    track.addEventListener('mouseleave', () => { if (!timer) timer = window.requestAnimationFrame(step); });
  });
}

async function initPlayer() {
  const video = qs('video[data-m3u8]');
  if (!video) return;
  const m3u8 = video.dataset.m3u8;
  const mp4 = video.dataset.mp4;
  try {
    if (window.Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(m3u8);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (data.fatal) {
          if (mp4) video.src = mp4;
        }
      });
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = m3u8;
      return;
    }
  } catch (err) {
    console.warn('HLS init failed', err);
  }
  if (mp4) video.src = mp4;
}

function setMeta(list) {
  list.forEach(({ sel, value }) => {
    const el = qs(sel);
    if (el) el.textContent = value;
  });
}

function initDetailExtras() {
  const root = qs('[data-detail-page]');
  if (!root || !window.MOVIES_DATA) return;
  const id = root.dataset.movieId;
  const current = window.MOVIES_DATA.find(m => m.id === id);
  if (!current) return;
  const relatedIds = (root.dataset.relatedIds || '').split(',').map(s => s.trim()).filter(Boolean);
  let related = relatedIds.map(rid => window.MOVIES_DATA.find(m => m.id === rid)).filter(Boolean);
  if (related.length < 6) {
    const pool = window.MOVIES_DATA.filter(m => m.id !== current.id && m.genre === current.genre);
    related = related.concat(pool.slice(0, 6 - related.length));
  }
  if (related.length < 6) {
    related = related.concat(window.MOVIES_DATA.filter(m => m.id !== current.id).slice(0, 6 - related.length));
  }
  const holder = qs('[data-related-holder]', root);
  if (holder) renderCards(related.slice(0, 6), holder, { prefix: '../' });
}

window.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initInlineSearch();
  initAutoScroll();
  initSearchPage();
  initFilters();
  initPlayer();
  initDetailExtras();
});
