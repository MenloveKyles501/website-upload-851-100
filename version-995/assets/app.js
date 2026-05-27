(function() {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var cards = all('[data-movie-card]');
    var search = panel.querySelector('[data-search-input]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var category = panel.querySelector('[data-filter-category]');
    var clear = panel.querySelector('[data-clear-search]');
    var empty = panel.querySelector('[data-empty-state]');

    function value(el) {
      return el ? el.value.trim().toLowerCase() : '';
    }

    function matches(card) {
      var q = value(search);
      var hay = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.category
      ].join(' ').toLowerCase();
      var okSearch = !q || hay.indexOf(q) !== -1;
      var okRegion = !value(region) || (card.dataset.region || '').toLowerCase().indexOf(value(region)) !== -1;
      var okType = !value(type) || (card.dataset.type || '').toLowerCase().indexOf(value(type)) !== -1;
      var okYear = !value(year) || (card.dataset.year || '').toLowerCase() === value(year);
      var okCategory = !value(category) || (card.dataset.category || '').toLowerCase() === value(category);
      return okSearch && okRegion && okType && okYear && okCategory;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function(card) {
        var keep = matches(card);
        card.hidden = !keep;
        if (keep) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, region, type, year, category].forEach(function(el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });

    if (clear) {
      clear.addEventListener('click', function() {
        if (search) {
          search.value = '';
        }
        apply();
      });
    }
  }

  function setupImageFallback() {
    all('img').forEach(function(img) {
      img.addEventListener('error', function() {
        img.remove();
      }, { once: true });
    });
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    window.addEventListener('scroll', function() {
      button.classList.toggle('show', window.scrollY > 420);
    }, { passive: true });
    button.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    setupMenu();
    setupHero();
    setupFilters();
    setupImageFallback();
    setupBackTop();
  });
})();
