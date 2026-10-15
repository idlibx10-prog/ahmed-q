/* ==========================================================
   أنس أحمد — quran.js
   قائمة السور + البحث + عرض السورة + مشغل التلاوة
   المصدر: api.alquran.cloud  |  القارئ: Mishary Alafasy
   ========================================================== */
(function () {
  'use strict';

  var App = (window.Sakina = window.Sakina || {});
  var $ = App.$, $$ = App.$$, on = App.on;

  var API = 'https://api.alquran.cloud/v1';
  var EDITION = 'ar.alafasy';
  var RECITER = 'المصحف المرتل — مشاري راشد العفاسي';
  var TIMEOUT = 15000;   // لا ننتظر الشبكة إلى الأبد

  var listScreen = $('#surah-list-screen');
  var viewScreen = $('#surah-view-screen');
  var grid = $('#surah-grid');
  var search = $('#surah-search');
  var heading = $('#surah-heading');
  var meta = $('#surah-meta');
  var basmala = $('#basmala');
  var ayahList = $('#ayah-list');

  // المشغل
  var player = $('#player');
  var pSurah = $('#player-surah');
  var pReciter = $('#player-reciter');
  var pPlay = $('#player-play');
  var pPrev = $('#player-prev');
  var pNext = $('#player-next');
  var pCurrent = $('#player-current');
  var pTotal = $('#player-total');
  var pSeek = $('#player-seek');
  var pFill = $('#player-fill');

  var surahs = [];        // كل السور
  var queue = [];         // روابط الصوت للسورة الحالية
  var idx = -1;           // رقم الآية قيد التشغيل
  var curName = '';       // اسم السورة الحالية
  var curSurahNumber = 1;
  var audio = null;       // عنصر الصوت الوحيد
  var seeking = false;    // أثناء السحب على شريط التقدّم
  var savedAyahTime = 0;
  var repeatIndex = -1, repeatRemaining = 0;

  /* ───────── أدوات ───────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fetchJSON(url) {
    // نضيف مؤقّتاً حتى لا تعلق الواجهة لو الشبكة انقطعت
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT);
    var opt = ctrl ? { signal: ctrl.signal } : {};

    return fetch(url, opt)
      .then(function (r) {
        clearTimeout(timer);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (err && err.name === 'AbortError') throw new Error('انتهت مهلة الاتصال');
        throw err;
      });
  }

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* تطبيع النص العربي للبحث: نُزيل التشكيل ونوحّد الهمزات
     وإلا فإن كتابة "الكهف" لن تطابق "الكَهْفِ" القادمة من الـ API */
  function normalizeAr(s) {
    return String(s == null ? '' : s)
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')  // تشكيل
      .replace(/[آأإٱٲٳ]/g, 'ا')
      .replace(/[ؤئ]/g, 'ي')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[ـ\s]+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function fail(message) {
    if (grid) {
      grid.innerHTML = '<p class="state-msg">' + esc(message) +
        '<br><button type="button" class="btn btn-glass btn-sm" id="retry-surahs" ' +
        'style="margin-top:14px"><i class="fa-solid fa-rotate-right"></i> إعادة المحاولة</button></p>';
      on($('#retry-surahs'), 'click', function () { loadSurahs(true); });
    }
  }

  /* ───────── 1) قائمة السور ───────── */
  function loadSurahs(force) {
    if (!grid) return;

    if (!force && surahs.length) { renderList(); return; }

    // نخزّن القائمة في sessionStorage لتكون فورية عند العودة للصفحة
    var cached = !force && App.store.getJSON('surahList', null);
    if (cached && cached.length) {
      surahs = cached;
      renderList();
      return;
    }

    grid.innerHTML = '<p class="state-msg">جارٍ تحميل السور…</p>';

    fetchJSON(API + '/surah')
      .then(function (res) {
        if (!res || res.code !== 200 || !res.data) throw new Error('رد غير متوقع من الخادم');
        surahs = res.data;
        App.store.setJSON('surahList', surahs);   // قد تفشل بصمت — لا بأس
        renderList();
      })
      .catch(function () {
        fail('تعذّر تحميل قائمة السور. تحقّق من اتصالك بالإنترنت ثم أعد المحاولة.');
      });
  }

  function renderList() {
    if (!grid) return;
    var q = normalizeAr((search && search.value) || '');
    grid.innerHTML = '';

    var shown = 0;
    surahs.forEach(function (s) {
      if (q) {
        // بحث بالاسم أو بالرقم (يدعم الأرقام العربية ٠-٩ والإنجليزية 0-9)
        var arNum = String(s.number).replace(/[0-9]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; });
        var hay = normalizeAr(s.name + ' ' + s.englishName + ' ' + s.number + ' ' + arNum);
        if (hay.indexOf(q) === -1) return;
      }
      shown++;

      var place = s.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'surah-card glass';
      card.innerHTML =
        '<span class="surah-num">' + s.number + '</span>' +
        '<span><span class="surah-name">' + esc(s.name) + '</span>' +
        '<span class="surah-info">' + s.numberOfAyahs + ' آية · ' + place + '</span></span>';
      on(card, 'click', function () { openSurah(s); });
      grid.appendChild(card);
    });

    if (!shown) {
      grid.innerHTML = '<p class="state-msg">لا توجد سورة بهذا الاسم.</p>';
    }
  }

  on(search, 'input', function () { renderList(); });

  /* ───────── 2) عرض السورة ───────── */
  var BASMALA_RE = /^\uFEFF?\s*بِسْمِ\s+ٱللَّهِ\s+ٱلرَّحْمَٰنِ\s+ٱلرَّحِيمِ\s*/;

  function openSurah(surah) {
    if (!viewScreen || !ayahList) return;

    listScreen.hidden = true;
    viewScreen.hidden = false;
    ayahList.innerHTML = '<p class="state-msg">جارٍ تحميل السورة…</p>';
    heading.textContent = surah.name;
    meta.textContent = surah.englishNameTranslation + ' · ' + surah.numberOfAyahs + ' آية';

    fetchJSON(API + '/surah/' + surah.number + '/' + EDITION)
      .then(function (res) {
        if (!res || res.code !== 200 || !res.data) throw new Error('رد غير متوقع');
        renderSurah(res.data);
      })
      .catch(function () {
        ayahList.innerHTML = '<p class="state-msg">تعذّر تحميل السورة. تحقّق من الإنترنت ثم أعد المحاولة.</p>';
      });
  }

  function renderSurah(data) {
    curSurahNumber = data.number;
    App.quran = App.quran || {}; App.quran.currentSurahNumber = data.number;
    var isFatiha = data.number === 1;
    var isTawbah = data.number === 9;

    heading.textContent = data.name;

    var place = data.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
    meta.textContent = data.englishNameTranslation + ' · ' + data.numberOfAyahs + ' آية · ' + place;

    // البسملة: مستقلة في الفاتحة، وغير موجودة في التوبة
    basmala.hidden = isFatiha || isTawbah;

    ayahList.innerHTML = '';
    queue = [];

    data.ayahs.forEach(function (a, i) {
      var text = a.text;

      // الـ API يُلحق البسملة بأول آية؛ نفصلها لتُعرض في مكانها
      if (i === 0 && !isFatiha && !isTawbah) {
        var stripped = text.replace(BASMALA_RE, '');
        if (stripped !== text) text = stripped;
      }

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ayah';
      btn.dataset.i = String(i);
      btn.innerHTML =
        '<span class="ayah-num">' + esc(a.numberInSurah) + '</span>' +
        '<span class="ayah-text">' + esc(text) + '</span>';
      on(btn, 'click', function () { playFrom(i); });
      ayahList.appendChild(btn);

      if (a.audio) queue.push(a.audio);
    });

    App.lastRead.save(data.number, data.name);
    curName = data.name;
    hidePlayer();
  }

  on($('#back-to-list'), 'click', function () {
    stopAudio();
    viewScreen.hidden = true;
    listScreen.hidden = false;
    if (App.go) App.go('quran', true);
  });

  /* ───────── 3) المشغل ───────── */
  function ensureAudio() {
    if (audio) return audio;
    var A = window.Audio || window.webkitAudio;
    if (!A) return null;
    audio = new A();
    audio.preload = 'auto';

    on(audio, 'timeupdate', function () {
      if (idx >= 0 && audio.currentTime > 0) { savedAyahTime = audio.currentTime; try { localStorage.setItem('anas_quran_resume_v1', JSON.stringify({ mode: 'ayah', surah: curSurahNumber, index: idx, time: savedAyahTime, name: curName })); } catch (e) {} }
      if (!audio.duration || !isFinite(audio.duration)) return;
      pFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
      pCurrent.textContent = fmtTime(audio.currentTime);
      if (!seeking) pSeek.setAttribute('aria-valuenow', String(Math.round(audio.currentTime / audio.duration * 100)));
    });

    on(audio, 'loadedmetadata', function () {
      pTotal.textContent = fmtTime(audio.duration);
    });

    on(audio, 'ended', function () { if (repeatRemaining > 1 && repeatIndex === idx) { repeatRemaining--; loadAudio(repeatIndex); } else { repeatRemaining = 0; repeatIndex = -1; next(); } });

    on(audio, 'play', function () { setPlayIcon(true); });
    on(audio, 'pause', function () { setPlayIcon(false); });

    on(audio, 'error', function () {
      if (!queue.length) return;
      pSurah.textContent = 'تعذّر تشغيل التلاوة — تأكد من اتصالك بالإنترنت';
    });

    return audio;
  }

  function setPlayIcon(playing) {
    if (pPlay) pPlay.innerHTML = playing ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
  }

  function markCurrent(i) {
    $$('.ayah').forEach(function (el) {
      el.classList.toggle('is-playing', Number(el.dataset.i) === i);
    });
    var cur = $('.ayah[data-i="' + i + '"]');
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function playFrom(i) {
    if (!queue[i]) return;
    if (idx !== i || !audio || !audio.src) { loadAudio(i); return; }
    // نفس الآية: نعيد تشغيلها من البداية
    audio.currentTime = 0;
    audio.play().catch(function () { setPlayIcon(false); });
  }

  function loadAudio(i) {
    var a = ensureAudio();
    if (!a || !queue[i]) return;
    idx = i;
    if (pSurah) pSurah.textContent = curName || 'التلاوة';
    if (pReciter) pReciter.textContent = RECITER;
    showPlayer();                 // إظهار المشغل العائم
    markCurrent(i);               // تمييز الآية الجارية
    a.src = queue[i];
    a.play().catch(function () { setPlayIcon(false); });
  }

  function showPlayer() {
    if (!player) return;
    player.hidden = false;
    document.body.classList.add('has-player');
  }
  function hidePlayer() {
    if (!player) return;
    player.hidden = true;
    document.body.classList.remove('has-player');
  }
  function stopAudio() {
    if (!audio) return;
    audio.pause();
    audio.removeAttribute('src');
    try { audio.load(); } catch (e) { /* لا يهم */ }
    idx = -1;
    markCurrent(-1);
    setPlayIcon(false);
    hidePlayer();
  }

  function next() {
    if (idx + 1 < queue.length) loadAudio(idx + 1);
    else {
      // انتهت السورة
      setPlayIcon(false);
      markCurrent(-1);
    }
  }
  function prev() {
    if (idx > 0) loadAudio(idx - 1);
    else if (idx === 0 && audio) audio.currentTime = 0;   // ارجع لأول الآية
  }

  on(pNext, 'click', next);
  on(pPrev, 'click', prev);
  on(pPlay, 'click', function () {
    var a = ensureAudio();
    if (!a) return;
    if (idx === -1 || !queue.length) { if (queue.length) loadAudio(0); return; }
    if (a.paused) a.play().catch(function () {}); else a.pause();
  });

  /* ───────── شريط التقدّم: نقر + سحب ───────── */
  function seekTo(e) {
    var a = ensureAudio();
    if (!a || !a.duration || !isFinite(a.duration)) return;
    var rect = pSeek.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    var ratio = Math.min(1, Math.max(0, x / rect.width));
    a.currentTime = ratio * a.duration;
    pFill.style.width = (ratio * 100) + '%';
  }
  on(pSeek, 'mousedown', function () { seeking = true; seekTo(arguments[0]); });
  on(pSeek, 'touchstart', function () { seeking = true; seekTo(arguments[0]); });
  on(document, 'mousemove', function (e) { if (seeking) seekTo(e); });
  on(document, 'touchmove', function (e) { if (seeking) seekTo(e); });
  on(document, 'mouseup', function () { seeking = false; });
  on(document, 'touchend', function () { seeking = false; });
  on(pSeek, 'click', function (e) { e.stopPropagation(); seekTo(e); });
  on(pSeek, 'keydown', function (e) {
    var a = ensureAudio();
    if (!a || !isFinite(a.duration)) return;
    if (e.key === 'ArrowRight') a.currentTime = Math.min(a.duration, a.currentTime + 5);
    else if (e.key === 'ArrowLeft') a.currentTime = Math.max(0, a.currentTime - 5);
    else return;
    e.preventDefault();
  });

  /* ───────── 4) شريحة "آخر قراءة" في الرئيسية ───────── */
  function paintResume() {
    var chip = $('#resume-chip');
    var text = $('#resume-text');
    var last = App.lastRead.load();
    if (!chip || !text || !last || !last.n) return;
    text.textContent = 'متابعة القراءة: ' + last.name;
    chip.hidden = false;
  }
  App.bus.on('lastread', paintResume);

  /* ───────── 5) التشغيل عند دخول القسم ───────── */
  App.bus.on('page:quran', function () {
    // لا نحمّل السور إلا عند فتح القسم فعلاً (توفير للبيانات)
    if (viewScreen && viewScreen.hidden) loadSurahs();
  });

  if (pReciter) pReciter.textContent = RECITER;
  App.quran = App.quran || {};
  Object.defineProperty(App.quran, 'currentSurahNumber', { configurable: true, get: function(){ return curSurahNumber; } });
  App.quran.stop = stopAudio;
  App.quran.pause = function () { if (audio) { savedAyahTime = audio.currentTime || savedAyahTime; try { localStorage.setItem('anas_quran_resume_v1', JSON.stringify({ mode: 'ayah', surah: curSurahNumber, index: idx, time: savedAyahTime, name: curName })); } catch (e) {} audio.pause(); } };
  App.quran.resume = function () { if (audio && audio.src && idx >= 0) { if (savedAyahTime > 0) { try { audio.currentTime = savedAyahTime; } catch (e) {} } audio.play().catch(function () {}); } else { var saved = null; try { saved = JSON.parse(localStorage.getItem('anas_quran_resume_v1') || 'null'); } catch (e) {} if (saved && saved.mode === 'ayah' && Number(saved.surah) === curSurahNumber && Number(saved.index) >= 0 && queue[Number(saved.index)]) { loadAudio(Number(saved.index)); var restore = function () { try { audio.currentTime = Math.max(0, Number(saved.time) || 0); } catch (e) {} audio.removeEventListener('loadedmetadata', restore); }; audio.addEventListener('loadedmetadata', restore); } } };
  App.quran.playAyah = playFrom;
  App.quran.repeatAyah = function(i, count){ repeatIndex=i; repeatRemaining=Math.max(1,Number(count)||1); loadAudio(i); };
})();
