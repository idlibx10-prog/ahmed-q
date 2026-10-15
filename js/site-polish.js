/* Lightweight daily continuity and install support. No framework or server required. */
(function () {
  'use strict';
  var KEY = 'anasAhmad.dailyContinuity.v1';
  var today = new Date();
  var day = [today.getFullYear(), String(today.getMonth()+1).padStart(2,'0'), String(today.getDate()).padStart(2,'0')].join('-');
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (_) { return {}; } }
  function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (_) {} }
  var state = read();
  if (!Array.isArray(state.days)) state.days = [];
  if (!state.days.includes(day)) state.days.push(day);
  state.days = state.days.slice(-120);
  if (!state.actions || state.actionDay !== day) { state.actions = {quran:false,adhkar:false,tasbeeh:false}; state.actionDay = day; }
  write(state);

  function streak(days) {
    var set = new Set(days || []), count = 0, cursor = new Date();
    var key = function(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
    if (!set.has(key(cursor))) cursor.setDate(cursor.getDate()-1);
    while (set.has(key(cursor)) && count < 365) { count++; cursor.setDate(cursor.getDate()-1); }
    return count;
  }
  function mount() {
    var hero = document.querySelector('.hero');
    if (hero && !document.getElementById('daily-continuity')) {
      var panel = document.createElement('div'); panel.className='daily-progress'; panel.id='daily-continuity';
      panel.innerHTML='<div class="daily-progress-head"><span class="daily-progress-title"><i class="fa-solid fa-seedling" aria-hidden="true"></i> وردك اليومي</span><strong id="daily-progress-count">0 / 3</strong></div><div class="daily-progress-track" role="progressbar" aria-label="إنجاز الورد اليومي" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0"><div class="daily-progress-fill" id="daily-progress-fill"></div></div><small id="daily-progress-note">خطوات بسيطة كل يوم تصنع أثراً جميلاً. اختر القرآن والأذكار والتسبيح.</small>';
      var resume = document.getElementById('resume-chip');
      if (resume && resume.parentNode === hero) resume.insertAdjacentElement('afterend', panel); else hero.appendChild(panel);
    }
    paint();
  }
  function paint() {
    var actions = state.actions || {}, done = ['quran','adhkar','tasbeeh'].filter(function(k){return actions[k];}).length;
    var count = document.getElementById('daily-progress-count'), fill = document.getElementById('daily-progress-fill'), track = document.querySelector('#daily-continuity [role="progressbar"]'), note = document.getElementById('daily-progress-note');
    if (count) count.textContent = done + ' / 3';
    if (fill) fill.style.width = (done/3*100)+'%';
    if (track) track.setAttribute('aria-valuenow', String(done));
    if (note) note.textContent = done === 3 ? 'ما شاء الله، أتممت خطوات وردك اليومي. تقبّل الله منك.' : 'أيام النشاط المتتالية: '+streak(state.days)+' · أكمل '+(3-done)+' خطوة للوصول إلى هدفك اليومي.';
  }
  function mark(k) { if (!state.actions) state.actions={}; state.actions[k]=true; state.actionDay=day; write(state); paint(); }
  document.addEventListener('click', function(e) {
    var target=e.target && e.target.closest ? e.target.closest('a,button') : null; if (!target) return;
    var nav = target.getAttribute('data-nav') || (target.getAttribute('href') || '').replace(/^#/, '');
    if (nav === 'quran') mark('quran');
    if (nav === 'adhkar') mark('adhkar');
    if (target.id === 'tasbeeh-tap') mark('tasbeeh');
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  window.addEventListener('storage', function(e){if(e.key===KEY){state=read();paint();}});
})();
