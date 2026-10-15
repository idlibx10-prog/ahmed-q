/* ==========================================================
   أنس أحمد — loader.js
   شاشة التحميل: عدّاد من 1% إلى 100% ثم تلاشٍ ناعم.

   مبادئ هذا الملف:
   · لا يعتمد على أي مكتبة خارجية
   · يعمل حتى لو لم يُحمَّل ملف التنسيقات
   · يزيل نفسه في كل الأحوال (حتى لو تعطّل شيء في منتصفه)
   ========================================================== */
(function () {
  'use strict';

  var DURATION = 2600;   // مدة العدّ بالمللي ثانية
  var FADE = 600;        // مدة التلاشي
  var MAX_WAIT = 30000;   // سقف انتظار: لا نبقَ عالقين أبداً
  var memorial = document.getElementById('memorial-card');

  var root = document.documentElement;
  var loader = document.getElementById('loader');
  var fill = document.getElementById('loader-fill');
  var label = document.getElementById('loader-percent');
  var bar = document.getElementById('loader-bar');

  var done = false;      // يمنع الإزالة المزدوجة
  var hardStop = null;   // مؤقّت الأمان

  /* الإزالة النهائية — آمنة للاستدعاء مرّات */
  function remove() {
    if (done) return;
    done = true;
    clearTimeout(hardStop);
    if (root) root.classList.remove('loading');
    var audio = document.getElementById('memorial-audio');
    if (audio) { try { audio.pause(); audio.currentTime = 0; } catch (e) {} }
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    try { document.dispatchEvent(new CustomEvent('sakina:loaded')); } catch (e) { /* لا يهم */ }
  }

  /* ───────── أمان: نُظهر الموقع دائماً ───────── */
  function emergencyRemove() {
    if (!loader) { remove(); return; }
    loader.classList.add('is-hiding');
    setTimeout(remove, FADE + 50);
  }
  hardStop = setTimeout(emergencyRemove, MAX_WAIT);

  // إن غاب أي عنصر من عناصر العدّاد نتخطّى الشاشة فوراً
  if (!loader || !fill || !label) {
    if (root) root.classList.remove('loading');
    remove();
    return;
  }

  /* ───────── الرسم ───────── */
  function paint(p) {
    try { fill.style.width = p + '%'; } catch (e) { /* لا نوقف العدّاد بسبب تنسيق */ }
    label.textContent = p + '%';
    if (bar && (p % 5 === 0 || p === 100)) bar.setAttribute('aria-valuenow', String(p));
  }
  paint(1);

  var ease = function (t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };

  var start = null;
  var last = 1;
  var raf = null;

  function tick(now) {
    if (done) return;
    if (start === null) start = now;

    var t = Math.min(1, (now - start) / DURATION);
    var p = Math.max(1, Math.round(ease(t) * 100));

    if (p !== last) { last = p; paint(p); }

    if (t < 1) {
      raf = window.requestAnimationFrame ? window.requestAnimationFrame(tick)
                                         : setTimeout(function () { tick(Date.now()); }, 16);
    } else {
      finish();
    }
  }

  function finish() {
    paint(100);

    // بعد اكتمال الشريط، نخفي الشريط والعنوان ونوسّط بطاقة الدعاء.
    if (loader) loader.classList.add('memorial-mode');
    if (memorial) {
      memorial.hidden = false;
      memorial.classList.remove('memorial-card-out');
      // تأكيد إظهار البطاقة فوق محتوى الموقع طوال مدة الدعاء.
      memorial.style.display = 'flex';
      memorial.style.opacity = '1';
      memorial.setAttribute('aria-live', 'polite');
    }
    // ننتظر الخطوط (بحد أقصى ثانية) كي لا يظهر الموقع بخط بديل
    var wait = (document.fonts && document.fonts.ready)
      ? Promise.race([
          document.fonts.ready.catch(function () {}),
          new Promise(function (r) { setTimeout(r, 1000); })
        ])
      : Promise.resolve();

    wait.then(function () {
      var dismissed = false;
      var dismissBtn = document.getElementById('memorial-dismiss');
      function hideMemorialAndContinue() {
        if (dismissed || done) return;
        dismissed = true;
        if (memorial) memorial.classList.add('memorial-card-out');
        loader.classList.add('is-hiding');
        root.classList.remove('loading');
        setTimeout(remove, FADE + 50);
      }
      if (dismissBtn) dismissBtn.addEventListener('click', hideMemorialAndContinue, { once: true });
      var audio = document.getElementById('memorial-audio');
      var audioBtn = document.getElementById('memorial-audio-toggle');
      if (audio && audioBtn) {
        // حاول تشغيل التلاوة فور ظهور البطاقة؛ المتصفحات قد تمنع التشغيل الآلي
        // لذلك يبقى زر واضح للتشغيل/الإيقاف إذا احتاج المتصفح إلى تفاعل.
        audio.preload = 'auto';
        audio.volume = 1;
        audio.play().then(function () {
          audioBtn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i> إيقاف التلاوة';
          audioBtn.setAttribute('aria-pressed', 'true');
        }).catch(function () {
          audioBtn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i> تشغيل التلاوة';
        });
        audioBtn.addEventListener('click', function () {
          if (audio.paused) {
            audio.play().then(function () {
              audioBtn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i> إيقاف التلاوة';
              audioBtn.setAttribute('aria-pressed', 'true');
            }).catch(function () {
              audioBtn.textContent = 'تعذّر تشغيل الصوت — اضغط مجددًا';
            });
          } else {
            audio.pause();
            audio.currentTime = 0;
            audioBtn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i> تشغيل التلاوة';
            audioBtn.setAttribute('aria-pressed', 'false');
          }
        });
        audio.addEventListener('ended', function () {
          audioBtn.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i> إعادة التلاوة';
          audioBtn.setAttribute('aria-pressed', 'false');
        });
      }
      setTimeout(function () {
        if (done || dismissed) return;
        if (memorial) memorial.classList.add('memorial-card-out');
        loader.classList.add('is-hiding');
        root.classList.remove('loading');   // تبدأ حركات الموقع أثناء التلاشي
        setTimeout(remove, FADE + 50);
      }, memorial ? 20000 : 250);             // نمنح بطاقة الدعاء وقتاً كافياً للقراءة
    });
  }

  /* ───────── أمان إضافي: أخطاء مفاجئة ───────── */
  // لا نُسقط بطاقة الدعاء بسبب خطأ JavaScript غير متعلق بها في ملف آخر.
  // الإزالة الطارئة محصورة بمهلة الأمان أو بزر الدخول، حتى لا تختفي البطاقة فوراً.
  window.addEventListener('error', function (e) {
    if (e && e.target && e.target.tagName) return;
    try { console.error('[Uns Ahmad loader]', e && (e.message || e.error || e)); } catch (_) {}
  });

  raf = window.requestAnimationFrame ? window.requestAnimationFrame(tick)
                                     : setTimeout(function () { tick(Date.now()); }, 16);
})();
