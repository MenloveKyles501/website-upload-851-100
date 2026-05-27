document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.hasAttribute('hidden');
      if (open) {
        mobileNav.removeAttribute('hidden');
      } else {
        mobileNav.setAttribute('hidden', '');
      }
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll('.global-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  var searchInput = document.getElementById('movie-search');
  var yearFilter = document.getElementById('year-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  function runFilter() {
    if (!cards.length) {
      return;
    }
    var term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matched = (!term || text.indexOf(term) !== -1) && (!year || cardYear === year);
      card.classList.toggle('is-hidden', !matched);
    });
  }
  if (searchInput || yearFilter) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
    }
    if (searchInput) {
      searchInput.addEventListener('input', runFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', runFilter);
    }
    runFilter();
  }

  var backTop = document.querySelector('.back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
