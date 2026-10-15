/* المرحلة الختامية: ورد يومي، تثبيت PWA، ومؤشر اتصال واضح. يعمل دون أي مكتبات. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var KEY = 'uns_ahmad_daily_plan_v1';
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
  var today = new Date().toLocaleDateString('en-CA');
  if (state.day !== today) { state.day = today; state.progress = 0; }
  state.goal = Number(state.goal || 10);
  state.progress = Math.max(0, Number(state.progress || 0));
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }
  function paintPlan() {
    var goal = $('#daily-goal'), fill = $('#plan-progress-fill'), track = $('#plan-progress-bar');
    if (goal) goal.value = String(state.goal);
    var amount = Math.min(state.goal, state.progress), pct = Math.min(100, Math.round(amount / state.goal * 100));
    if (fill) fill.style.width = pct + '%';
    if (track) track.setAttribute('aria-valuenow', String(amount));
    var label = $('#plan-progress-label');
    if (label) label.textContent = amount + ' من ' + state.goal + ' آيات اليوم' + (amount >= state.goal ? ' — أحسنت، أتممت هدفك اليومي 🌙' : ' · ' + pct + '%');
    var date = $('#plan-date'); if (date) date.textContent = new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long' }).format(new Date());
  }
  $('#daily-goal') && $('#daily-goal').addEventListener('change', function () { state.goal = Math.max(1, Number(this.value) || 10); save(); paintPlan(); });
  $('#plan-progress-add') && $('#plan-progress-add').addEventListener('click', function () { state.progress = Math.min(state.goal, state.progress + 1); save(); paintPlan(); });
  paintPlan();

  function connection() {
    var el = $('#connection-status'); if (!el) return;
    el.textContent = navigator.onLine ? 'متصل بالإنترنت' : 'أنت غير متصل — المحتوى المحفوظ فقط متاح';
    el.classList.toggle('is-online', !!navigator.onLine);
    el.classList.toggle('is-offline', !navigator.onLine);
  }
  window.addEventListener('online', connection); window.addEventListener('offline', connection); connection();

  var installPrompt = null, installButton = $('#pwa-install');
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault(); installPrompt = event;
    if (installButton) installButton.hidden = false;
  });
  if (installButton) installButton.addEventListener('click', async function () {
    if (!installPrompt) {
      alert('على الهاتف: افتح قائمة المتصفح ثم اختر «إضافة إلى الشاشة الرئيسية» أو «تثبيت التطبيق».');
      return;
    }
    installPrompt.prompt();
    try { await installPrompt.userChoice; } catch (_) {}
    installPrompt = null; installButton.hidden = true;
  });
  window.addEventListener('appinstalled', function () { if (installButton) installButton.hidden = true; });

  // يحفظ جلسة نشاط يومية دون تسجيل أي بيانات شخصية.
  var activityKey = 'uns_ahmad_activity_days_v1', days = [];
  try { days = JSON.parse(localStorage.getItem(activityKey) || '[]'); } catch (_) { days = []; }
  if (!Array.isArray(days)) days = [];
  if (!days.includes(today)) days.push(today);
  days = days.slice(-400);
  try { localStorage.setItem(activityKey, JSON.stringify(days)); } catch (_) {}
})();
