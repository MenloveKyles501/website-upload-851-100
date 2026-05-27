(function () {
  const ready = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  };

  const esc = (s) => String(s || '').replace(/[&<>"]/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

  async function loadCatalog() {
    if (window.__catalogPromise) return window.__catalogPromise;
    window.__catalogPromise = fetch('assets/catalog.json', { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => []);
    return window.__catalogPromise;
  }

  function initNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      nav.classList.remove('open');
    });
  }

  function initActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav] a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href === path) a.classList.add('active');
    });
  }

  function filterCurrentCards(query) {
    const cards = Array.from(document.querySelectorAll('.js-film-card'));
    if (!cards.length) return;
    const q = query.trim().toLowerCase();
    let count = 0;
    cards.forEach((card) => {
      const blob = (card.dataset.blob || card.textContent || '').toLowerCase();
      const hit = !q || blob.includes(q);
      card.style.display = hit ? '' : 'none';
      if (hit) count += 1;
    });
    const counter = document.querySelector('[data-filter-count]');
    if (counter) counter.textContent = String(count);
    const empty = document.querySelector('[data-empty-state]');
    if (empty) empty.style.display = count ? 'none' : 'block';
  }

  function renderSearchHits(results) {
    const box = document.querySelector('[data-search-results]');
    if (!box) return;
    if (!results.length) {
      box.innerHTML = '<div class="empty-state">没有找到匹配内容，换个关键词试试。</div>';
      return;
    }
    box.innerHTML = results.slice(0, 12).map((it) => `
      <a class="search-hit" href="${esc(it.slug)}">
        <div>
          <b>${esc(it.title)}</b>
          <span>${esc([it.region, it.type, it.year, it.genre].filter(Boolean).join(' · '))}</span>
        </div>
        <span class="pill">查看详情</span>
      </a>
    `).join('');
  }

  async function initSearch() {
    const input = document.querySelector('[data-search-input]');
    if (!input) return;
    const scope = document.querySelector('[data-search-scope]');
    const live = scope?.dataset.searchScope === 'catalog';
    const update = async () => {
      const q = input.value.trim();
      if (scope) filterCurrentCards(q);
      if (!live) return;
      const catalog = await loadCatalog();
      if (!q) {
        renderSearchHits(catalog.slice(0, 12));
        return;
      }
      const needle = q.toLowerCase();
      const results = catalog.filter((it) =>
        [it.title, it.region, it.type, it.year, it.genre, it.tags, it.one_line, it.summary, it.review].join(' ').toLowerCase().includes(needle)
      );
      renderSearchHits(results);
    };
    input.addEventListener('input', update);
    update();
  }

  function initBackToTop() {
    const btn = document.querySelector('[data-back-top]');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('show', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function initYear() {
    const el = document.querySelector('[data-current-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  ready(() => {
    initNav();
    initActiveNav();
    initSearch();
    initBackToTop();
    initYear();
  });
})();
