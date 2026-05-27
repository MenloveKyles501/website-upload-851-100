(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setQueryParam(url, key, value) {
    var target = new URL(url, window.location.href);
    if (value) {
      target.searchParams.set(key, value);
    } else {
      target.searchParams.delete(key);
    }
    return target.toString();
  }

  function initMobileNavigation() {
    var toggle = document.querySelector('[data-mobile-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          window.location.href = form.getAttribute('action') || 'search.html';
        }
      });
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function nextSlide() {
      show(current + 1);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(nextSlide, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function fillFilterOptions(toolbar, cards, key) {
    var select = toolbar.querySelector('[data-filter-key="' + key + '"]');
    if (!select) {
      return;
    }

    var values = cards
      .map(function (card) {
        return card.getAttribute('data-' + key) || '';
      })
      .filter(Boolean)
      .filter(function (value, index, array) {
        return array.indexOf(value) === index;
      })
      .sort(function (a, b) {
        if (key === 'year') {
          return Number(b) - Number(a);
        }
        return a.localeCompare(b, 'zh-Hans-CN');
      });

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initListFilters() {
    var toolbar = document.querySelector('[data-filter-toolbar]');
    var list = document.querySelector('[data-card-list]');
    if (!toolbar || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var input = toolbar.querySelector('.js-search-input');
    var selects = Array.prototype.slice.call(toolbar.querySelectorAll('.js-filter-select'));
    var count = toolbar.querySelector('[data-filter-count]');
    var emptyState = document.querySelector('[data-empty-state]');

    ['year', 'region', 'type'].forEach(function (key) {
      fillFilterOptions(toolbar, cards, key);
    });

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-key')] = select.value;
      });

      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilters = Object.keys(filters).every(function (key) {
          return !filters[key] || (card.getAttribute('data-' + key) === filters[key]);
        });
        var show = matchesQuery && matchesFilters;
        card.classList.toggle('is-hidden-by-filter', !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' / ' + cards.length + ' 部';
      }
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).join(' ');
    var genres = (movie.genres || []).slice(0, 3).join(' / ') || movie.genreRaw || '';
    return '' +
      '<article class="movie-card">' +
        '<a class="movie-card__link" href="' + escapeHtml(movie.href) + '">' +
          '<div class="movie-card__poster">' +
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="movie-card__category">' + escapeHtml(movie.categoryName) + '</span>' +
            '<span class="movie-card__play">▶</span>' +
            '<span class="movie-card__duration">' + escapeHtml(movie.duration) + '</span>' +
          '</div>' +
          '<div class="movie-card__body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.description) + '</p>' +
            '<div class="movie-card__meta">' +
              '<span>' + escapeHtml(movie.region) + '</span>' +
              '<span>' + escapeHtml(genres) + '</span>' +
            '</div>' +
            '<div class="movie-card__stats">' +
              '<span>⭐ ' + escapeHtml(movie.score) + '</span>' +
              '<span>' + escapeHtml(movie.viewsText) + '观看</span>' +
            '</div>' +
            '<div class="movie-card__tags">' + escapeHtml(tags) + '</div>' +
          '</div>' +
        '</a>' +
      '</article>';
  }

  function initGlobalSearch() {
    var form = document.querySelector('[data-global-search-form]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var empty = document.querySelector('[data-search-empty]');
    var data = window.MOVIE_INDEX || [];

    if (!form || !results || !summary) {
      return;
    }

    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(query) {
      query = query.trim().toLowerCase();
      results.innerHTML = '';
      if (!query) {
        summary.textContent = '请输入关键词开始搜索。';
        if (empty) {
          empty.hidden = true;
        }
        return;
      }

      var matched = data.filter(function (movie) {
        return movie.searchText.indexOf(query) !== -1;
      }).slice(0, 240);

      summary.textContent = '找到 ' + matched.length + ' 个结果' + (matched.length === 240 ? '，已显示前 240 个，请输入更具体关键词。' : '。');
      results.innerHTML = matched.map(cardTemplate).join('');
      attachImageFallbacks(results);
      if (empty) {
        empty.hidden = matched.length > 0;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      window.history.replaceState(null, '', setQueryParam(window.location.href, 'q', query));
      render(query);
    });

    input.addEventListener('input', function () {
      var query = input.value.trim();
      window.history.replaceState(null, '', setQueryParam(window.location.href, 'q', query));
      render(query);
    });

    render(initial);
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function ensureHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    var sources = [
      'https://cdn.jsdelivr.net/npm/hls.js@latest',
      'https://unpkg.com/hls.js@latest/dist/hls.min.js'
    ];

    return sources.reduce(function (promise, source) {
      return promise.catch(function () {
        return loadScript(source).then(function () {
          if (!window.Hls) {
            throw new Error('HLS library loaded without global Hls.');
          }
          return window.Hls;
        });
      });
    }, Promise.reject()).catch(function () {
      return null;
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video[data-hls]');
      var button = player.querySelector('[data-player-button]');
      var status = player.querySelector('[data-player-status]');
      var hls = null;
      var started = false;

      if (!video || !button) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function playVideo() {
        var source = video.getAttribute('data-hls');
        if (!source) {
          setStatus('没有找到播放源。');
          return;
        }

        button.classList.add('is-hidden');
        if (started) {
          video.play().catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击播放器。');
          });
          return;
        }
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('原生 HLS 播放源加载完成。');
            video.play().catch(function () {
              setStatus('播放已准备好，请点击播放器开始。');
            });
          }, { once: true });
          return;
        }

        setStatus('正在加载 HLS 播放内核...');
        ensureHlsLibrary().then(function (Hls) {
          if (!Hls || !Hls.isSupported()) {
            setStatus('当前浏览器不支持 HLS 播放，请使用 Chrome、Edge、Safari 或 Firefox 新版本。');
            return;
          }

          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus('HLS 播放源加载完成。');
            video.play().catch(function () {
              setStatus('播放已准备好，请点击播放器开始。');
            });
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请刷新页面或稍后重试。');
            }
          });
        });
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('click', function () {
        if (!started) {
          playVideo();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function attachImageFallbacks(root) {
    root = root || document;
    root.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        var parent = img.parentElement;
        img.style.display = 'none';
        if (parent) {
          parent.classList.add('no-image');
        }
        var heroSlide = img.closest('.hero-slide');
        if (heroSlide) {
          heroSlide.classList.add('no-image');
        }
      }, { once: true });
    });
  }

  ready(function () {
    initMobileNavigation();
    initSearchForms();
    initHeroSlider();
    initListFilters();
    initGlobalSearch();
    initPlayers();
    attachImageFallbacks(document);
  });
})();
