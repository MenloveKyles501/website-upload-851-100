(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupPlayer() {
    var video = document.getElementById('moviePlayer');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.getElementById('playerButton');
    var status = document.querySelector('[data-player-status]');
    var hlsInstance = null;
    var loaded = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function loadSource() {
      if (loaded || !source) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('高清播放源已就绪');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus('正在切换播放方式');
            hlsInstance.destroy();
            hlsInstance = null;
            video.src = source;
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('高清播放源已就绪');
      } else {
        video.src = source;
        setStatus('正在加载播放源');
      }
    }

    function playVideo() {
      loadSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          setStatus('点击视频画面开始播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      setStatus('正在播放');
    });
    video.addEventListener('pause', function () {
      setStatus('已暂停');
    });
    video.addEventListener('ended', function () {
      setStatus('播放结束');
    });
    video.addEventListener('click', function () {
      if (!loaded) {
        playVideo();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function createResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-frame" href="./movie-' + movie.id + '.html" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'">',
      '<span class="poster-shade"></span>',
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3><a href="./movie-' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupSearchPage() {
    var results = document.getElementById('searchResults');
    var input = document.getElementById('searchPageInput');
    var form = document.getElementById('searchPageForm');
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (input) {
      input.value = initialQuery;
    }

    function runSearch(query) {
      var normalized = query.trim().toLowerCase();
      var pool = window.SEARCH_INDEX;
      var matched = normalized ? pool.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')]
          .join(' ')
          .toLowerCase()
          .indexOf(normalized) !== -1;
      }) : pool.slice(0, 80);
      results.innerHTML = matched.length ? matched.slice(0, 120).map(createResultCard).join('') : '<div class="empty-state">没有找到匹配影片</div>';
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value : '';
        var url = new URL(window.location.href);
        if (query.trim()) {
          url.searchParams.set('q', query.trim());
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState(null, '', url.toString());
        runSearch(query);
      });
    }
    runSearch(initialQuery);
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupPlayer();
    setupSearchPage();
  });
})();
