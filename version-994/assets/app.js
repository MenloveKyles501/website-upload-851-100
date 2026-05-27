(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupCarousel() {
    var root = document.querySelector("[data-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dotsRoot = root.querySelector("[data-carousel-dots]");
    var prev = root.querySelector("[data-carousel-prev]");
    var next = root.querySelector("[data-carousel-next]");
    var index = 0;
    var timer = null;

    function render() {
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      if (dotsRoot) {
        Array.prototype.slice.call(dotsRoot.children).forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }
    }

    function go(step) {
      index = (index + step + slides.length) % slides.length;
      render();
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        go(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (dotsRoot) {
      slides.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.className = "hero-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", "切换推荐" + (i + 1));
        dot.addEventListener("click", function () {
          index = i;
          render();
          start();
        });
        dotsRoot.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        go(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        go(1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    render();
    start();
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player]");
    var button = document.querySelector("[data-play-button]");
    var message = document.querySelector("[data-player-message]");
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute("data-play") || button.getAttribute("data-play");
    var initialized = false;
    var player = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    function start() {
      if (!source) {
        setMessage("视频暂时无法加载");
        return;
      }
      button.classList.add("is-hidden");
      if (initialized) {
        playVideo();
        return;
      }
      initialized = true;
      setMessage("");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(source);
        player.attachMedia(video);
        player.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        player.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setMessage("视频暂时无法加载");
            button.classList.remove("is-hidden");
            if (player) {
              player.destroy();
              player = null;
            }
            initialized = false;
          }
        });
        return;
      }
      setMessage("当前设备暂不支持此视频播放");
      button.classList.remove("is-hidden");
      initialized = false;
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (initialized) {
        button.classList.remove("is-hidden");
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      results.innerHTML = "<p class=\"rank-card\">输入关键词后即可查看相关影片。</p>";
      return;
    }
    var lowered = query.toLowerCase();
    var found = window.SEARCH_ITEMS.filter(function (item) {
      return [item.title, item.category, item.region, item.type, item.year, item.genre, item.tags, item.description].join(" ").toLowerCase().indexOf(lowered) !== -1;
    }).slice(0, 80);
    if (!found.length) {
      results.innerHTML = "<p class=\"rank-card\">没有找到相关影片。</p>";
      return;
    }
    results.innerHTML = found.map(function (item) {
      return "<article class=\"rank-card\"><a class=\"rank-title\" href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a><p>" + escapeHtml(item.description) + "</p><div class=\"rank-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.category) + "</div></article>";
    }).join("");
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupPlayer();
    setupSearchPage();
  });
})();
