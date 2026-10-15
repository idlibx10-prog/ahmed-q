/* ==========================================================
   أنس أحمد — adhkar.js
   الأقسام + عرض الأذكار + العدّاد التفاعلي مع الحفظ
   البيانات مُضمَّنة في js/azkar-data.js (حصن المسلم)
   ========================================================== */
(function () {
  'use strict';

  var App = (window.Sakina = window.Sakina || {});
  var $ = App.$, $$ = App.$$, on = App.on;

  var DATA = window.AZKAR_DATA || {};
  var catsScreen = $('#adhkar-cats-screen');
  var listScreen = $('#adhkar-list-screen');
  var catGrid = $('#cat-grid');
  var catTitle = $('#adhkar-cat-title');
  var dhikrList = $('#dhikr-list');
  var resetBtn = $('#adhkar-reset');

  var current = null;   // القسم المفتوح حالياً

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ───────── فتح قسم ───────── */
  function openCat(id) {
    var cat = DATA[id];
    if (!cat) return;

    current = id;
    catTitle.textContent = cat.title;
    dhikrList.innerHTML = '';

    if (!cat.items.length) {
      dhikrList.innerHTML = '<p class="state-msg">لا توجد أذكار في هذا القسم حالياً.</p>';
    }

    cat.items.forEach(function (item, i) {
      var total = Math.max(1, parseInt(item.count, 10) || 1);
      var done = App.counters.get(id, i);

      var row = document.createElement('div');
      row.className = 'dhikr glass';

      var note = (item.note || '') + (item.ref ? ' — ' + item.ref : '');
      row.innerHTML =
        '<div class="dhikr-body">' +
          '<p class="dhikr-text">' + esc(item.text) +
            (note ? '<span class="dhikr-note">' + esc(note) + '</span>' : '') +
          '</p>' +
        '</div>' +
        '<button type="button" class="counter" aria-label="عدّاد الذكر">' +
          '<span class="counter-num">0</span>' +
          '<span class="counter-of">/ ' + total + '</span>' +
        '</button>';

      var btn = $('.counter', row);
      paint(row, btn, done, total);
      on(btn, 'click', function () { bump(id, i, row, btn, total); });

      dhikrList.appendChild(row);
    });

    if (resetBtn) resetBtn.hidden = false;
    catsScreen.hidden = true;
    listScreen.hidden = false;
  }

  /* ───────── رسم العدّاد ───────── */
  function paint(row, btn, value, total) {
    var full = value >= total;
    btn.classList.toggle('done', full);
    row.classList.toggle('is-done', full);
    $('.counter-num', btn).textContent = full ? total : value;
  }

  /* ───────── نقر العدّاد ───────── */
  function bump(cat, i, row, btn, total) {
    if (btn.classList.contains('done')) return;   // انتهى، لا نزيد

    var value = App.counters.get(cat, i) + 1;
    if (value >= total) value = total;
    App.counters.set(cat, i, value);

    paint(row, btn, value, total);
    btn.classList.remove('bump');
    void btn.offsetWidth;          // إعادة تشغيل حركة الضغط
    btn.classList.add('bump');

    if (value >= total) checkDone();
  }

  /* ───────── تنبيه عند إتمام القسم ───────── */
  function checkDone() {
    var cat = DATA[current];
    if (!cat) return;
    var finished = cat.items.every(function (item, i) {
      return App.counters.get(current, i) >= Math.max(1, parseInt(item.count, 10) || 1);
    });
    if (!finished) return;

    var existing = $('.complete-msg');
    if (existing) return;
    var msg = document.createElement('p');
    msg.className = 'complete-msg';
    msg.textContent = 'ما شاء الله، تمّت أذكار هذا القسم 🤍';
    dhikrList.appendChild(msg);
  }

  /* ───────── إعادة العدّ ───────── */
  on(resetBtn, 'click', function () {
    if (!current) return;
    App.counters.clearCat(current);
    openCat(current);   // نعيد الرسم من الصفر
  });

  on($('#adhkar-back'), 'click', function () {
    current = null;
    listScreen.hidden = true;
    catsScreen.hidden = false;
    if (resetBtn) resetBtn.hidden = true;
    if (App.go) App.go('adhkar', true);
  });

  /* ───────── ربط بطاقات الأقسام ───────── */
  on(catGrid, 'click', function (e) {
    var card = e.target.closest('.cat-card');
    if (card) openCat(card.getAttribute('data-cat'));
  });

  /* ───────── تحقّق من وجود البيانات ───────── */
  if (catGrid && !Object.keys(DATA).length) {
    catGrid.innerHTML = '<p class="state-msg">تعذّر تحميل بيانات الأذكار. ' +
      'تأكد من وجود الملف js/azkar-data.js بجانب بقية الملفات.</p>';
  }
})();
