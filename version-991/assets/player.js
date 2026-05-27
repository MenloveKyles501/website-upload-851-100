(function () {
  const panels = document.querySelectorAll('[data-stream]');

  panels.forEach(function (panel) {
    const video = panel.querySelector('video');
    const button = panel.querySelector('.play-overlay');
    const source = panel.getAttribute('data-stream');
    let ready = false;
    let hls = null;

    function attach() {
      if (ready || !video || !source) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function play() {
      attach();
      if (button) {
        button.classList.add('is-hidden');
      }
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button && video) {
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
