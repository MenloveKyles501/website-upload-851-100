(function() {
  window.setupMoviePlayer = function(source) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('.player-overlay');
    var playButton = document.querySelector('.play-button');
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      load();
      video.controls = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
      overlay.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          start();
        }
      });
    }

    if (playButton) {
      playButton.addEventListener('click', function(event) {
        event.stopPropagation();
        start();
      });
    }

    video.addEventListener('click', function() {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('pagehide', function() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
