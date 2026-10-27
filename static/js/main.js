(function () {
  'use strict';

  // Mobile menu
  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-btn');
  if (header && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? menuBtn.dataset.close : menuBtn.dataset.open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) {
        header.classList.remove('menu-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', menuBtn.dataset.open);
        menuBtn.focus();
      }
    });
  }

  // Remember language choice
  document.querySelectorAll('.lang a[data-lang]').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('tb-lang', a.dataset.lang); } catch (e) {}
    });
  });

  // Home slideshow
  var slides = document.querySelectorAll('.slide');
  var dots = document.querySelectorAll('.slide-dots button');
  if (slides.length > 1) {
    var cur = 0, timer;
    var show = function (n) {
      slides[cur].classList.remove('is-active');
      slides[cur].setAttribute('aria-hidden', 'true');
      slides[cur].tabIndex = -1;
      dots[cur].removeAttribute('aria-current');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('is-active');
      slides[cur].removeAttribute('aria-hidden');
      slides[cur].removeAttribute('tabindex');
      dots[cur].setAttribute('aria-current', 'true');
    };
    var play = function () {
      clearInterval(timer);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(function () { show(cur + 1); }, 6000);
    };
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); play(); }); });
    play();
  }

  // Works filter
  var filterBar = document.querySelector('.filters');
  if (filterBar) {
    var buttons = filterBar.querySelectorAll('button');
    var cards = document.querySelectorAll('.card[data-cat]');
    var apply = function (cat) {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.cat === cat ? 'true' : 'false'); });
      cards.forEach(function (c) { c.hidden = !(cat === 'all' || c.dataset.cat === cat); });
    };
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        apply(b.dataset.cat);
        history.replaceState(null, '', b.dataset.cat === 'all' ? location.pathname : '#' + b.dataset.cat);
      });
    });
    var fromHash = function () {
      var h = location.hash.replace('#', '');
      if (h && filterBar.querySelector('[data-cat="' + h + '"]')) apply(h);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  // Lightbox
  var lb = document.querySelector('.lightbox');
  var works = Array.prototype.slice.call(document.querySelectorAll('.work'));
  if (lb && works.length) {
    var img = lb.querySelector('img');
    var title = lb.querySelector('.lb-cap p');
    var meta = lb.querySelector('.lb-cap small');
    var count = lb.querySelector('.lb-count');
    var idx = 0, lastFocus = null;
    var show = function (i) {
      idx = (i + works.length) % works.length;
      var w = works[idx];
      img.src = w.dataset.full;
      img.alt = w.dataset.title;
      title.textContent = w.dataset.title;
      meta.textContent = w.dataset.meta || '';
      count.textContent = (idx + 1) + ' / ' + works.length;
    };
    var open = function (i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    };
    var close = function () {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };
    works.forEach(function (w, i) { w.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }
})();
