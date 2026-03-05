;(function () {
  'use strict';

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initTabs() {
    var groups = document.querySelectorAll('[data-mp-tabs]');
    if (!groups.length) return;

    groups.forEach(function (group) {
      var buttons = group.querySelectorAll('[data-tab-target]');
      var panels = group.querySelectorAll('[data-tab-panel]');
      if (!buttons.length || !panels.length) return;

      function activate(target) {
        buttons.forEach(function (button) {
          var isActive = button.getAttribute('data-tab-target') === target;
          button.classList.toggle('is-active', isActive);
          button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        panels.forEach(function (panel) {
          var isActive = panel.getAttribute('data-tab-panel') === target;
          panel.classList.toggle('is-active', isActive);
          panel.hidden = !isActive;
        });
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activate(button.getAttribute('data-tab-target'));
        });
      });
    });
  }

  function initReveal() {
    var elements = document.querySelectorAll('.mp-reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (element) {
        element.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initImageLightbox() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll('.mp-media-open'));
    if (!triggers.length) return;

    var items = triggers.map(function (trigger) {
      var image = trigger.querySelector('img');
      return {
        src: image ? image.getAttribute('src') : '',
        alt: image ? image.getAttribute('alt') : '',
        caption: ''
      };
    }).filter(function (item) {
      return !!item.src;
    });

    if (!items.length) return;

    var lightbox = document.createElement('div');
    lightbox.className = 'mp-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = ''
      + '<div class="mp-lightbox-backdrop"></div>'
      + '<div class="mp-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Aperçu image">'
      + '  <button type="button" class="mp-lightbox-close" aria-label="Fermer">×</button>'
      + '  <button type="button" class="mp-lightbox-nav mp-lightbox-prev" aria-label="Image précédente">‹</button>'
      + '  <img class="mp-lightbox-image" src="" alt="" />'
      + '  <button type="button" class="mp-lightbox-nav mp-lightbox-next" aria-label="Image suivante">›</button>'
      + '  <p class="mp-lightbox-caption"></p>'
      + '</div>';

    document.body.appendChild(lightbox);

    var imageElement = lightbox.querySelector('.mp-lightbox-image');
    var captionElement = lightbox.querySelector('.mp-lightbox-caption');
    var closeButton = lightbox.querySelector('.mp-lightbox-close');
    var previousButton = lightbox.querySelector('.mp-lightbox-prev');
    var nextButton = lightbox.querySelector('.mp-lightbox-next');
    var backdrop = lightbox.querySelector('.mp-lightbox-backdrop');

    var currentIndex = 0;

    function render() {
      var currentItem = items[currentIndex];
      imageElement.setAttribute('src', currentItem.src);
      imageElement.setAttribute('alt', currentItem.alt || '');
      captionElement.textContent = currentItem.caption || '';
      captionElement.style.display = currentItem.caption ? 'block' : 'none';
    }

    function open(index) {
      currentIndex = index;
      render();
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('mp-lightbox-open');
    }

    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('mp-lightbox-open');
    }

    function next() {
      currentIndex = (currentIndex + 1) % items.length;
      render();
    }

    function previous() {
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      render();
    }

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener('click', function () {
        open(index);
      });
    });

    closeButton.addEventListener('click', close);
    previousButton.addEventListener('click', previous);
    nextButton.addEventListener('click', next);
    backdrop.addEventListener('click', close);

    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') previous();
    });
  }

  function initVideoModal() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll('.mp-media-video-launch[data-video-id]'));
    if (!triggers.length) return;

    var modal = document.createElement('div');
    modal.className = 'mp-media-video-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = ''
      + '<div class="mp-media-video-modal-backdrop"></div>'
      + '<div class="mp-media-video-modal-dialog" role="dialog" aria-modal="true" aria-label="Lecture vidéo">'
      + '  <button type="button" class="mp-media-video-modal-close" aria-label="Fermer">×</button>'
      + '  <div class="mp-media-video-modal-frame-wrap">'
      + '    <iframe class="mp-media-video-modal-frame" src="" title="Lecture vidéo" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
      + '  </div>'
      + '</div>';

    document.body.appendChild(modal);

    var closeButton = modal.querySelector('.mp-media-video-modal-close');
    var backdrop = modal.querySelector('.mp-media-video-modal-backdrop');
    var frame = modal.querySelector('.mp-media-video-modal-frame');

    function buildEmbedUrl(videoId, start) {
      var url = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?autoplay=1&rel=0&playsinline=1';
      var startValue = parseInt(start, 10);
      if (!isNaN(startValue) && startValue > 0) {
        url += '&start=' + startValue;
      }
      return url;
    }

    function open(trigger) {
      var videoId = trigger.getAttribute('data-video-id');
      if (!videoId) return;

      var videoTitle = trigger.getAttribute('data-video-title') || 'Lecture vidéo';
      var videoStart = trigger.getAttribute('data-video-start');

      frame.setAttribute('src', buildEmbedUrl(videoId, videoStart));
      frame.setAttribute('title', videoTitle);

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('mp-video-modal-open');
    }

    function close() {
      frame.setAttribute('src', '');
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('mp-video-modal-open');
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        open(trigger);
      });
    });

    closeButton.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    document.addEventListener('keydown', function (event) {
      if (!modal.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        close();
      }
    });
  }

  onReady(function () {
    initTabs();
    initReveal();
    initVideoModal();
    initImageLightbox();
  });
})();
