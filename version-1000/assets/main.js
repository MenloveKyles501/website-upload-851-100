(function() {
  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function() {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

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

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        var target = parseInt(dot.getAttribute('data-slide'), 10);
        if (!Number.isNaN(target)) {
          show(target);
          start();
        }
      });
    });

    start();
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-global-search-form]'));
    forms.forEach(function(form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var url = './search.html';
        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function setupFilters() {
    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var noResults = document.querySelector('[data-no-results]');
    var clear = document.querySelector('[data-clear-search]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    if (!cards.length) {
      return;
    }

    var activeFilter = 'all';

    function getCardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' '));
    }

    function apply() {
      var query = input ? normalize(input.value) : '';
      var visible = 0;
      cards.forEach(function(card) {
        var matchesText = !query || getCardText(card).indexOf(query) !== -1;
        var matchesFilter = activeFilter === 'all' || card.getAttribute('data-category') === activeFilter;
        var show = matchesText && matchesFilter;
        card.classList.toggle('is-hidden-card', !show);
        if (show) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.hidden = visible !== 0;
      }
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
      input.addEventListener('input', apply);
    }

    if (clear) {
      clear.addEventListener('click', function() {
        if (input) {
          input.value = '';
        }
        activeFilter = 'all';
        filterButtons.forEach(function(button) {
          button.classList.toggle('active', button.getAttribute('data-filter-value') === 'all');
        });
        apply();
      });
    }

    filterButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        activeFilter = button.getAttribute('data-filter-value') || 'all';
        filterButtons.forEach(function(item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    apply();
  }

  document.addEventListener('DOMContentLoaded', function() {
    setupMobileNav();
    setupHero();
    setupSearchForms();
    setupFilters();
  });
})();
