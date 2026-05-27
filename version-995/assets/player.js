(function() {
  function bindVideo(video) {
    var stream = video.getAttribute('data-stream');
    if (!stream || video.getAttribute('data-bound') === 'yes') {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = stream;
    }
    video.setAttribute('data-bound', 'yes');
  }

  function startPlayer(frame) {
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('.player-overlay');
    if (!video) {
      return;
    }
    bindVideo(video);
    video.controls = true;
    if (overlay) {
      overlay.hidden = true;
    }
    var play = video.play();
    if (play && play.catch) {
      play.catch(function() {
        if (overlay) {
          overlay.hidden = false;
        }
      });
    }
  }

  document.addEventListener('click', function(event) {
    var trigger = event.target.closest('[data-play-trigger]');
    if (!trigger) {
      return;
    }
    var frame = trigger.closest('.player-frame');
    if (frame) {
      startPlayer(frame);
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    var frames = Array.prototype.slice.call(document.querySelectorAll('.player-frame'));
    frames.forEach(function(frame) {
      var video = frame.querySelector('video');
      if (video) {
        video.addEventListener('click', function() {
          startPlayer(frame);
        });
      }
    });
  });
})();
