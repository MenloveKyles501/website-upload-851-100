(function () {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play]');
  if (!video || !button) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var ready = false;
  var hlsInstance = null;

  function prepare() {
    if (ready) {
      return Promise.resolve();
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function () {
          resolve();
        });
      });
    }
    video.src = stream;
    return Promise.resolve();
  }

  function play() {
    button.classList.add('is-hidden');
    video.controls = true;
    prepare().then(function () {
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    });
  }

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
