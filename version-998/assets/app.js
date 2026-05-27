
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function bindMobileMenu() {
    const btn = qs('[data-menu-button]');
    const menu = qs('[data-mobile-menu]');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }

  function initHero() {
    const stage = qs('[data-hero-stage]');
    if (!stage) return;
    const slides = qsa('[data-hero-slide]', stage);
    const dots = qsa('[data-hero-dot]', stage);
    const prevBtn = qs('[data-hero-prev]', stage);
    const nextBtn = qs('[data-hero-next]', stage);
    if (slides.length <= 1) return;
    let index = 0;
    let timer = null;
    function render(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, sidx) => slide.classList.toggle('is-active', sidx === index));
      dots.forEach((dot, sidx) => dot.classList.toggle('is-active', sidx === index));
    }
    function next() { render(index + 1); }
    function prev() { render(index - 1); }
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    dots.forEach((dot, i) => dot.addEventListener('click', () => render(i)));
    timer = window.setInterval(next, 5000);
    stage.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
    stage.addEventListener('mouseleave', () => { timer = window.setInterval(next, 5000); });
    render(0);
  }

  function cardMarkup(m) {
    const tags = (m.tags || []).slice(0, 3).map(t => `<span class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/90">${esc(t)}</span>`).join('');
    return `
      <a href="/${m.path}" class="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 shadow-lg shadow-black/20 backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div class="relative aspect-[2/3] overflow-hidden">
          <div class="absolute inset-0 bg-slate-800 transition-transform duration-500 group-hover:scale-105 poster-cover" style="background-image: linear-gradient(135deg, rgba(17,24,39,.35), rgba(249,115,22,.35)), url('/${m.cover_index}.jpg');"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          <div class="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white">${esc(m.bucket)}</div>
          <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <span class="rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white/90">${esc(m.year || '未知')} · ${esc(m.type)}</span>
            <span class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/90">${esc(m.region)}</span>
          </div>
        </div>
        <div class="space-y-3 p-4">
          <div>
            <h3 class="line-clamp-1 text-lg font-semibold text-white transition-colors group-hover:text-amber-300">${esc(m.title)}</h3>
            <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-300">${esc(m.one_line || m.summary || '')}</p>
          </div>
          <div class="flex flex-wrap gap-2">${tags}</div>
        </div>
      </a>`;
  }

  function initSearch() {
    const root = qs('[data-search-page]');
    if (!root || !window.CATALOG) return;
    const input = qs('[data-search-input]', root);
    const bucketSel = qs('[data-bucket-filter]', root);
    const typeSel = qs('[data-type-filter]', root);
    const yearSel = qs('[data-year-filter]', root);
    const count = qs('[data-search-count]', root);
    const results = qs('[data-search-results]', root);

    const url = new URL(window.location.href);
    if (input && url.searchParams.get('q')) input.value = url.searchParams.get('q');

    function apply() {
      const q = (input?.value || '').trim().toLowerCase();
      const bucket = bucketSel?.value || '';
      const type = typeSel?.value || '';
      const year = yearSel?.value || '';
      let items = window.CATALOG.slice();
      if (bucket) items = items.filter(m => m.bucket === bucket);
      if (type) items = items.filter(m => m.type.includes(type));
      if (year) items = items.filter(m => String(m.year).startsWith(year));
      if (q) {
        items = items.filter(m => {
          const hay = [m.title, m.region, m.type, m.year, m.genre, (m.tags || []).join(' '), m.one_line, m.summary].join(' ').toLowerCase();
          return hay.includes(q);
        });
      }
      items = items.sort((a, b) => b.score - a.score).slice(0, 300);
      if (count) count.textContent = `${items.length} 条结果`;
      if (results) results.innerHTML = items.map(cardMarkup).join('') || '<div class="rounded-2xl border border-white/10 bg-white/5 p-8 text-slate-300">没有找到匹配影片。</div>';
    }

    [input, bucketSel, typeSel, yearSel].forEach(el => el && el.addEventListener('input', apply));
    [bucketSel, typeSel, yearSel].forEach(el => el && el.addEventListener('change', apply));
    apply();
  }

  function initQuickSearchForms() {
    qsa('form[data-quick-search]').forEach(form => {
      form.addEventListener('submit', (e) => {
        const input = qs('input[name="q"]', form);
        const q = input ? input.value.trim() : '';
        if (!q) e.preventDefault();
      });
    });
  }

  function initVideoPlayer() {
    const wrap = qs('[data-video-player]');
    if (!wrap) return;
    const video = qs('video', wrap);
    const playBtn = qs('[data-play-btn]', wrap);
    if (!video) return;

    const hlsSrc = video.getAttribute('data-hls-src');
    const mp4Src = video.getAttribute('data-mp4-src');
    let loaded = false;

    function attachSources() {
      if (loaded) return;
      loaded = true;
      if (window.Hls && hlsSrc && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && mp4Src) {
            video.src = mp4Src;
            video.load();
          }
        });
      } else if (hlsSrc && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsSrc;
      } else if (mp4Src) {
        video.src = mp4Src;
      }
    }

    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        attachSources();
        try { await video.play(); } catch (e) {}
      });
    }
    video.addEventListener('click', () => {
      attachSources();
      if (video.paused) video.play().catch(()=>{});
      else video.pause();
    });
    attachSources();
  }

  function init() {
    bindMobileMenu();
    initHero();
    initSearch();
    initQuickSearchForms();
    initVideoPlayer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
