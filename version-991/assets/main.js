(function () {
  const body = document.body;
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const target = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.location.href = target;
    });
  });

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  function startHero() {
    if (heroTimer || slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  function resetHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
      heroTimer = null;
    }
    startHero();
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        resetHero();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showHero(heroIndex - 1);
        resetHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showHero(heroIndex + 1);
        resetHero();
      });
    }
    startHero();
  }

  const cardList = document.querySelector('[data-card-list]');
  const searchInput = document.querySelector('.catalog-search');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const emptyState = document.querySelector('[data-empty-state]');

  function applyCatalogFilter() {
    if (!cardList) {
      return;
    }
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const activeButton = filterButtons.find(function (button) {
      return button.classList.contains('is-active');
    });
    const filter = activeButton ? activeButton.getAttribute('data-filter') : 'all';
    let visible = 0;

    cardList.querySelectorAll('.movie-card').forEach(function (card) {
      const text = (card.getAttribute('data-search') || '').toLowerCase();
      const type = card.getAttribute('data-type') || '';
      const matchesQuery = !query || text.indexOf(query) !== -1;
      const matchesFilter = filter === 'all' || type === filter || text.indexOf(filter.toLowerCase()) !== -1;
      const show = matchesQuery && matchesFilter;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener('input', applyCatalogFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      applyCatalogFilter();
    });
  });

  applyCatalogFilter();
})();
