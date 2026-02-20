(function () {
  function setUpServiceTabs() {
    var tabsRoot = document.querySelector('.mp-about-services-tabs');
    if (!tabsRoot) return;
    if (tabsRoot.getAttribute('data-ready') === 'true') return;
    tabsRoot.setAttribute('data-ready', 'true');

    var tabContainer = tabsRoot.querySelector('.apo-tabs-container');
    var links = Array.prototype.slice.call(tabsRoot.querySelectorAll('.apo-tabs-nav a[href^="#service-"]'));
    var panels = Array.prototype.slice.call(tabsRoot.querySelectorAll('.apo-tabs-container .apo-tab'));
    var validTargets = links.map(function (link) {
      return link.getAttribute('href');
    });

    function activate(targetId, syncHash) {
      if (validTargets.indexOf(targetId) === -1) return;

      links.forEach(function (link) {
        var isActive = link.getAttribute('href') === targetId;
        link.classList.toggle('apo-active', isActive);
        if (link.parentElement) link.parentElement.classList.toggle('apo-active', isActive);
        link.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      });

      panels.forEach(function (panel) {
        var isActive = '#' + panel.id === targetId;
        panel.classList.toggle('is-active', isActive);
        panel.classList.toggle('apo-active', isActive);
      });

      if (tabContainer) tabContainer.style.height = 'auto';

      if (syncHash && window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, '', targetId);
        } catch (error) {
          window.location.hash = targetId;
        }
      }
    }

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        activate(link.getAttribute('href'), true);
      });
    });

    var initialTarget = window.location.hash && validTargets.indexOf(window.location.hash) > -1
      ? window.location.hash
      : null;

    if (!initialTarget && links.length) {
      initialTarget = links[0].getAttribute('href');
    }

    if (initialTarget) {
      activate(initialTarget, false);
    }

    tabsRoot.classList.add('is-ready');
  }

  function setUpTestimonialsSlider() {
    var slider = document.querySelector('.mp-about-testimonials-slider');
    if (!slider) return;
    if (slider.getAttribute('data-ready') === 'true') return;
    slider.setAttribute('data-ready', 'true');

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.apo-testimonial'));
    if (!slides.length) return;

    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'mp-about-testimonials-dots';

    var dots = slides.map(function (_, index) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'mp-about-testimonials-dot';
      dot.setAttribute('aria-label', 'Aller au témoignage ' + (index + 1));
      dotsWrap.appendChild(dot);
      return dot;
    });

    slider.parentNode.insertBefore(dotsWrap, slider.nextSibling);

    var current = 0;
    var timer = null;

    function goTo(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        var isActive = i === current;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startAuto() {
      if (slides.length < 2) return;
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        goTo(current + 1);
      }, 5500);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        goTo(index);
        startAuto();
      });
    });

    slider.addEventListener('mouseenter', function () {
      if (timer) clearInterval(timer);
    });

    slider.addEventListener('mouseleave', function () {
      startAuto();
    });

    goTo(0);
    slider.classList.add('is-ready');
    startAuto();
  }

  function setUpStatsCounters() {
    var section = document.querySelector('#stats');
    var counters = Array.prototype.slice.call(document.querySelectorAll('#stats .apo-counter'));
    if (!section || !counters.length) return;
    if (section.getAttribute('data-ready') === 'true') return;
    section.setAttribute('data-ready', 'true');

    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-value'), 10);
      counter.setAttribute('data-target', isNaN(target) ? '0' : String(target));
      counter.setAttribute('data-value', '0');
    });

    var started = false;

    function animateCounter(counter, target, duration) {
      var start = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var value = Math.floor(start + (target - start) * progress);
        counter.setAttribute('data-value', String(value));
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.setAttribute('data-value', String(target));
        }
      }

      requestAnimationFrame(step);
    }

    function startCounting() {
      if (started) return;
      started = true;
      window.removeEventListener('scroll', detectOnScroll);
      window.removeEventListener('resize', detectOnScroll);
      counters.forEach(function (counter, index) {
        var target = parseInt(counter.getAttribute('data-target'), 10) || 0;
        animateCounter(counter, target, 1300 + index * 120);
      });
    }

    function detectOnScroll() {
      if (started) return;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      var rect = section.getBoundingClientRect();
      var entersViewport = rect.top <= viewportHeight * 0.85 && rect.bottom >= 0;
      if (entersViewport) {
        startCounting();
      }
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startCounting();
            observer.disconnect();
          }
        });
      }, {
        threshold: 0.2
      });
      observer.observe(section);
    } else {
      detectOnScroll();
    }

    if (!started) {
      window.addEventListener('scroll', detectOnScroll, {
        passive: true
      });
      window.addEventListener('resize', detectOnScroll);
      detectOnScroll();
    }
  }

  function setUpAppear() {
    if (window.jQuery && jQuery.Apolo && jQuery.Apolo.modules && jQuery.Apolo.modules.appear) {
      var $appearContainers = jQuery('.mp-about-appear');
      if ($appearContainers.length) {
        jQuery.Apolo.modules.appear($appearContainers);
      }
    }
  }

  function bootAboutInteractions() {
    if (bootAboutInteractions._done) return;
    bootAboutInteractions._done = true;
    setUpAppear();
    setUpServiceTabs();
    setUpTestimonialsSlider();
    setUpStatsCounters();
  }

  bootAboutInteractions();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAboutInteractions);
  }

  window.addEventListener('load', bootAboutInteractions);
})();
