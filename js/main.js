/* ==========================================================
   أنس أحمد — main.js
   التبديل بين الأقسام + قائمة الجوال + تهيئة الصفحة
   ========================================================== */
(function () {
  'use strict';

  /* ───────── نافذة الأسماء المشتركة بين كل الملفات ─────────
     نعرّفها هنا لأنه أول ملف يُحمّل بعد شاشة التحميل */
  var App = (window.Sakina = window.Sakina || {});

  /* ───────── أدوات مختصرة ───────── */
  App.$ = function (sel, root) { return (root || document).querySelector(sel); };
  App.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  App.on = function (el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt); };

  /* ناقل أحداث بسيط للتواصل بين الملفات بدون أي مكتبة خارجية */
  var listeners = {};
  App.bus = {
    on: function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); },
    emit: function (name, detail) {
      (listeners[name] || []).forEach(function (fn) {
        try { fn(detail); } catch (e) { /* لا نُسقط باقي المستمعين */ }
      });
    }
  };

  /* ───────── الأقسام ───────── */
  var pages = App.$$('.page');
  var navLinks = App.$$('.nav-link[data-nav]');

  function go(name, push) {
    var target = pages.filter(function (p) { return p.getAttribute('data-page') === name; })[0];
    if (!target) return;

    pages.forEach(function (p) { p.classList.toggle('is-active', p === target); });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-nav') === name);
    });

    if (push && location.hash !== '#' + name) {
      history.pushState(null, '', '#' + name);
    }
    // نُعلم باقي الملفات أن القسم تغيّر (تحميل البيانات عند أول فتح)
    App.bus.emit('page:' + name);
    // إعادة التمرير للأعلى عند تغيير القسم
    window.scrollTo({ top: 0, behavior: 'auto' });
    closeMenu();
  }
  App.go = go; // يستعمله quran.js و adhkar.js

  /* ───────── التنقل ───────── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-nav]') : null;
    if (!a) return;
    var name = a.getAttribute('data-nav');
    if (!name) return;
    e.preventDefault();
    go(name, true);
  });

  window.addEventListener('popstate', function () {
    var name = (location.hash || '#home').slice(1);
    go(pages.some(function (p) { return p.getAttribute('data-page') === name; }) ? name : 'home', false);
  });

  /* ───────── قائمة الجوال ───────── */
  var menuBtn = App.$('#menu-toggle');
  var nav = App.$('#main-nav');

  function closeMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'فتح القائمة');
  }
  App.closeMenu = closeMenu;

  App.on(menuBtn, 'click', function () {
    var open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  });

  // نقرة خارج القائمة تغلقها
  document.addEventListener('click', function (e) {
    if (!nav || !nav.classList.contains('is-open')) return;
    if (nav.contains(e.target) || (menuBtn && menuBtn.contains(e.target))) return;
    closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ───────── فتح مساعد الـ AI ───────── */
  function openAI() {
    var ov = App.$('#ai-overlay');
    if (!ov) return;
    ov.hidden = false;
    document.body.style.overflow = 'hidden';
    if (App.AI && App.AI.open) App.AI.open();
    setTimeout(function () {
      var inp = App.$('#ai-input');
      if (inp) inp.focus();
    }, 80);
  }
  function closeAI() {
    var ov = App.$('#ai-overlay');
    if (!ov) return;
    ov.hidden = true;
    document.body.style.overflow = '';
  }
  App.openAI = openAI;
  App.closeAI = closeAI;

  App.on(App.$('#open-ai-nav'), 'click', function (e) { e.preventDefault(); openAI(); });
  App.on(App.$('#open-ai-hero'), 'click', openAI);
  App.on(App.$('#ai-close'), 'click', closeAI);

  /* ───────── تهيئة عامة ───────── */
  var year = App.$('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // القسم الحالي عند فتح الصفحة على رابط مباشر مثل #quran
  go((location.hash || '#home').slice(1) || 'home', false);
})();
