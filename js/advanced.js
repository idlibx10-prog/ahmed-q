/* أنس أحمد — أدوات إضافية مستقلة، دون إطار عمل */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var KEY = 'anas_advanced_v1';
  var data = {};
  try { data = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {} }
  function setText(id, value) { var el = $('#' + id); if (el) el.textContent = value; }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }

  /* آية اليوم ثابتة خلال اليوم، وتتغير حسب تاريخ الجهاز */
  var daily = [
    ['إِنَّ مَعَ الْعُسْرِ يُسْرًا','سورة الشرح · ٦'],
    ['فَاذْكُرُونِي أَذْكُرْكُمْ','سورة البقرة · ١٥٢'],
    ['وَهُوَ مَعَكُمْ أَيْنَ مَا كُنْتُمْ','سورة الحديد · ٤'],
    ['لَا تَقْنَطُوا مِنْ رَحْمَةِ اللَّهِ','سورة الزمر · ٥٣'],
    ['وَقُلْ رَبِّ زِدْنِي عِلْمًا','سورة طه · ١١٤'],
    ['إِنَّ اللَّهَ مَعَ الصَّابِرِينَ','سورة البقرة · ١٥٣']
  ];
  var day = Math.floor(Date.now() / 86400000);
  var ayah = daily[day % daily.length];
  setText('daily-ayah-text', ayah[0]); setText('daily-ayah-ref', ayah[1]);
  $('#daily-ayah-read')?.addEventListener('click', function () { location.hash = '#quran'; });
  $('#daily-ayah-share')?.addEventListener('click', async function () {
    var text = ayah[0] + '\n' + ayah[1] + '\nأنس أحمد';
    try { if (navigator.share) await navigator.share({ title: 'آية اليوم', text: text }); else if (navigator.clipboard) { await navigator.clipboard.writeText(text); alert('تم نسخ آية اليوم للمشاركة.'); } else alert(text); } catch (_) {}
  });

  /* السبحة */
  var count = Number(data.tasbeehCount || 0), total = Number(data.tasbeehTotal || 0);
  function paintTasbeeh() { setText('tasbeeh-count', count); setText('tasbeeh-total', 'المجموع: ' + total); setText('stat-tasbeeh', total); }
  $('#tasbeeh-tap')?.addEventListener('click', function () {
    count++; total++; data.tasbeehCount = count; data.tasbeehTotal = total; save(); paintTasbeeh();
    this.classList.remove('pulse'); void this.offsetWidth; this.classList.add('pulse');
    if (navigator.vibrate) navigator.vibrate(12);
  });
  $('#tasbeeh-reset')?.addEventListener('click', function () { count = 0; data.tasbeehCount = 0; save(); paintTasbeeh(); });
  paintTasbeeh();

  /* مظهر نهاري قابل للرجوع، محفوظ محلياً */
  function themePaint() {
    var light = data.theme === 'light'; document.documentElement.classList.toggle('light-mode', light);
    setText('theme-label', light ? 'المظهر النهاري' : 'المظهر الليلي');
    var b = $('#theme-toggle'); if (b) b.innerHTML = light ? '<i class="fa-solid fa-moon"></i> العودة للمظهر الليلي' : '<i class="fa-solid fa-sun"></i> تفعيل المظهر النهاري';
  }
  $('#theme-toggle')?.addEventListener('click', function () { data.theme = data.theme === 'light' ? 'dark' : 'light'; save(); themePaint(); });
  themePaint();

  /* بحث شامل عبر AlQuran Cloud */
  $('#quran-global-search')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    var q = ($('#quran-search-word').value || '').trim(), box = $('#quran-search-results');
    if (!q || !box) return;
    box.textContent = 'جارٍ البحث في القرآن الكريم…';
    try {
      var res = await fetch('https://api.alquran.cloud/v1/search/' + encodeURIComponent(q) + '/all/ar');
      if (!res.ok) throw new Error('تعذر الاتصال');
      var json = await res.json(), hits = json.data && json.data.matches || [];
      if (!hits.length) { box.textContent = 'لم نعثر على نتائج لهذه العبارة.'; return; }
      box.innerHTML = '';
      hits.slice(0, 30).forEach(function (hit) {
        var item = document.createElement('button'); item.type = 'button'; item.className = 'search-hit';
        item.innerHTML = '<span class="search-hit-text">' + escapeHTML(hit.text) + '</span><small>' + escapeHTML(hit.surah.name) + ' · الآية ' + hit.numberInSurah + '</small>';
        item.addEventListener('click', function () { location.hash = '#quran'; var input = $('#surah-search'); if (input) { input.value = hit.surah.name; input.dispatchEvent(new Event('input')); } });
        box.appendChild(item);
      });
    } catch (_) { box.textContent = 'تعذر إكمال البحث. تحقق من اتصال الإنترنت وحاول مجدداً.'; }
  });

  /* النطق العربي باستخدام الصوت المتاح في الجهاز */
  $('#tts-play')?.addEventListener('click', function () {
    if (!('speechSynthesis' in window)) { setText('tts-status', 'ميزة النطق غير مدعومة في هذا المتصفح.'); return; }
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance($('#tts-text').value); u.lang = 'ar-SA'; u.rate = 0.85;
    var voices = window.speechSynthesis.getVoices(); var v = voices.find(function (x) { return /^ar/i.test(x.lang); }); if (v) u.voice = v;
    u.onerror = function () { setText('tts-status', 'تعذر تشغيل الصوت على هذا الجهاز.'); };
    u.onstart = function () { setText('tts-status', 'جارٍ النطق بالصوت العربي المتاح على جهازك…'); };
    u.onend = function () { setText('tts-status', 'انتهى النطق.'); };
    window.speechSynthesis.speak(u);
  });
  $('#tts-stop')?.addEventListener('click', function () { if (window.speechSynthesis) window.speechSynthesis.cancel(); setText('tts-status', 'تم إيقاف النطق.'); });

  /* محفوظات نصية محلية */
  data.bookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : [];
  function paintBookmarks() {
    var box = $('#bookmark-list'); if (!box) return; box.innerHTML = '';
    data.bookmarks.forEach(function (txt, i) {
      var row = document.createElement('div'); row.className = 'bookmark-item';
      var p = document.createElement('p'); p.textContent = txt;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-glass btn-sm'; b.textContent = 'حذف';
      b.addEventListener('click', function () { data.bookmarks.splice(i, 1); save(); paintBookmarks(); paintStats(); });
      row.append(p, b); box.appendChild(row);
    });
    setText('stat-bookmarks', data.bookmarks.length);
  }
  $('#bookmark-add')?.addEventListener('click', function () {
    var field = $('#bookmark-text'), text = (field.value || '').trim(); if (!text) return;
    data.bookmarks.unshift(text); data.bookmarks = data.bookmarks.slice(0, 100); field.value = ''; save(); paintBookmarks(); paintStats();
  });
  paintBookmarks();

  /* أسماء حسنى: بطاقات تعليمية مختارة مع عدم ادعاء شرح غير موثق */
  var names = [['الرَّحْمَٰن','واسع الرحمة'], ['الرَّحِيم','كثير الرحمة'], ['الْمَلِك','المالك المتصرف'], ['الْقُدُّوس','المنزّه عن كل نقص'], ['السَّلَام','المنزّه عن العيوب'], ['الْمُؤْمِن','واهب الأمن'], ['الْمُهَيْمِن','الرقيب الحافظ'], ['الْعَزِيز','الغالب القوي'], ['الْجَبَّار','النافذ أمره'], ['الْمُتَكَبِّر','المتعالي عن النقص'], ['الْخَالِق','موجد الخلق'], ['الْبَارِئ','منشئ الخلق'], ['الْمُصَوِّر','معطي الصور'], ['الْغَفَّار','كثير المغفرة'], ['الْقَهَّار','الغالب لكل شيء'], ['الْوَهَّاب','كثير العطاء'], ['الرَّزَّاق','واهب الأرزاق'], ['الْفَتَّاح','يفتح أبواب الخير'], ['الْعَلِيم','المحيط بكل شيء علماً'], ['الْقَابِض','يقبض بحكمته'], ['الْبَاسِط','يبسط فضله'], ['الْخَافِض','يخفض بحكمته'], ['الرَّافِع','يرفع من يشاء'], ['الْمُعِزّ','مانح العزة'], ['الْمُذِلّ','يذل من يشاء بعدله'], ['السَّمِيع','يسمع كل شيء'], ['الْبَصِير','يرى كل شيء'], ['الْحَكَم','الحاكم بالحق'], ['الْعَدْل','كامل العدل'], ['اللَّطِيف','الرفيق بعباده'], ['الْخَبِير','العالم ببواطن الأمور'], ['الْحَلِيم','لا يعجل بالعقوبة'], ['الْعَظِيم','عظيم الشأن'], ['الْغَفُور','واسع المغفرة'], ['الشَّكُور','يجزي على القليل الكثير'], ['الْعَلِيّ','المتعالي القدر'], ['الْكَبِير','العظيم الجليل'], ['الْحَفِيظ','الحافظ لكل شيء'], ['الْمُقِيت','الموصل الأقوات'], ['الْحَسِيب','الكافي والمحاسب'], ['الْجَلِيل','عظيم القدر'], ['الْكَرِيم','كثير الخير'], ['الرَّقِيب','المطلع على عباده'], ['الْمُجِيب','يجيب الدعاء'], ['الْوَاسِع','واسع الفضل والعلم'], ['الْحَكِيم','ذو الحكمة'], ['الْوَدُود','المحب لعباده الصالحين'], ['الْمَجِيد','كامل المجد'], ['الْبَاعِث','يبعث الخلق'], ['الشَّهِيد','لا يغيب عنه شيء'], ['الْحَقّ','الثابت الذي لا شك فيه'], ['الْوَكِيل','المتولي للأمور'], ['الْقَوِيّ','كامل القوة'], ['الْمَتِين','شديد القوة'], ['الْوَلِيّ','ناصر المؤمنين'], ['الْحَمِيد','المستحق للحمد'], ['الْمُحْصِي','أحصى كل شيء'], ['الْمُبْدِئ','يبدأ الخلق'], ['الْمُعِيد','يعيد الخلق'], ['الْمُحْيِي','واهب الحياة'], ['الْمُمِيت','خالق الموت'], ['الْحَيّ','كامل الحياة'], ['الْقَيُّوم','القائم بنفسه المقيم لغيره'], ['الْوَاجِد','لا يعوزه شيء'], ['الْمَاجِد','كثير الإحسان والشرف'], ['الْوَاحِد','المتفرد'], ['الأَحَد','الفرد الذي لا نظير له'], ['الصَّمَد','المقصود في الحوائج'], ['الْقَادِر','تام القدرة'], ['الْمُقْتَدِر','كامل القدرة'], ['الْمُقَدِّم','يقدم من يشاء بحكمته'], ['الْمُؤَخِّر','يؤخر ما يشاء بحكمته'], ['الأَوَّل','ليس قبله شيء'], ['الآخِر','ليس بعده شيء'], ['الظَّاهِر','العالي فوق خلقه'], ['الْبَاطِن','المحيط بكل شيء'], ['الْوَالِي','المتولي تدبير الخلق'], ['الْمُتَعَالِي','المنزه عن صفات النقص'], ['الْبَرّ','كثير الإحسان'], ['التَّوَّاب','يقبل التوبة'], ['الْمُنْتَقِم','يعاقب من يستحق بعدله'], ['الْعَفُوّ','يمحو الذنوب'], ['الرَّؤُوف','شديد الرحمة'], ['مَالِكُ الْمُلْك','مالك الملك كله'], ['ذُو الْجَلَالِ وَالإِكْرَام','صاحب العظمة والكرم'], ['الْمُقْسِط','القائم بالقسط'], ['الْجَامِع','يجمع الخلق ليوم الحساب'], ['الْغَنِيّ','المستغني عن الخلق'], ['الْمُغْنِي','يغني من يشاء'], ['الْمَانِع','يمنع بحكمته'], ['الضَّارّ','لا يقع ضر إلا بإذنه وحكمته'], ['النَّافِع','بيده النفع'], ['النُّور','هادي أهل السماوات والأرض'], ['الْهَادِي','يهدي إلى الحق'], ['الْبَدِيع','منشئ بلا مثال سابق'], ['الْبَاقِي','الدائم'], ['الْوَارِث','الباقي بعد فناء الخلق'], ['الرَّشِيد','يهدي إلى الصواب'], ['الصَّبُور','لا يعجل بالعقوبة']];
  var namesBox = $('#names-grid');
  if (namesBox) names.forEach(function (n) { var card = document.createElement('div'); card.className = 'name-tile'; card.innerHTML = '<strong>' + n[0] + '</strong><small>' + n[1] + '</small>'; namesBox.appendChild(card); });

  /* إحصائيات استخدام الأدوات */
  data.sessions = Number(data.sessions || 0) + 1; save();
  function paintStats() { setText('stat-tasbeeh', data.tasbeehTotal || 0); setText('stat-sessions', data.sessions || 1); setText('stat-bookmarks', (data.bookmarks || []).length); }
  paintStats();

  /* مواقيت الصلاة: تحديد الموقع بطلب واضح من المستخدم */
  var coordinates = null;
  function getPosition() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) return reject(new Error('المتصفح لا يدعم تحديد الموقع.'));
      navigator.geolocation.getCurrentPosition(function (p) { resolve({ lat: p.coords.latitude, lon: p.coords.longitude }); }, function (e) { reject(new Error(e.code === 1 ? 'لم تمنح إذن الموقع.' : 'تعذر تحديد الموقع.')); }, { enableHighAccuracy: true, timeout: 12000 });
    });
  }
  async function loadPrayer() {
    var status = $('#prayer-status'), list = $('#prayer-times-list');
    if (status) status.textContent = 'جارٍ تحديد الموقع وحساب المواقيت…';
    try {
      coordinates = await getPosition();
      var date = new Date(), stamp = [date.getDate(), date.getMonth()+1, date.getFullYear()].map(function (x) { return String(x).padStart(2,'0'); }).join('-');
      var r = await fetch('https://api.aladhan.com/v1/timings/' + stamp + '?latitude=' + coordinates.lat + '&longitude=' + coordinates.lon);
      if (!r.ok) throw new Error('تعذر جلب المواقيت.');
      var j = await r.json(), t = j.data.timings, keys = [['الفجر','Fajr'],['الشروق','Sunrise'],['الظهر','Dhuhr'],['العصر','Asr'],['المغرب','Maghrib'],['العشاء','Isha']];
      if (list) list.innerHTML = keys.map(function (k) { return '<div><span>' + k[0] + '</span><strong>' + escapeHTML(t[k[1]]) + '</strong></div>'; }).join('');
      if (status) status.textContent = 'المواقيت محسوبة حسب موقعك وطريقة الحساب الافتراضية للخدمة.';
      var nextBox = $('#prayer-next-countdown'); if (!nextBox) { nextBox=document.createElement('p'); nextBox.id='prayer-next-countdown'; nextBox.className='muted'; if(list) list.after(nextBox); }
      if (window.__prayerTick) clearInterval(window.__prayerTick);
      function tickPrayer(){ var now=new Date(), candidates=keys.filter(function(k){return k[1]!=='Sunrise'}).map(function(k){var hm=String(t[k[1]]).split(' ')[0].split(':');var d=new Date();d.setHours(Number(hm[0]),Number(hm[1]),0,0);if(d<=now)d.setDate(d.getDate()+1);return {name:k[0],time:d}}).sort(function(a,b){return a.time-b.time});var n=candidates[0],sec=Math.max(0,Math.floor((n.time-now)/1000)),hh=Math.floor(sec/3600),mm=Math.floor(sec%3600/60),ss=sec%60;nextBox.textContent='الصلاة القادمة: '+n.name+' · بعد '+hh+':'+String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0'); }
      tickPrayer(); window.__prayerTick=setInterval(tickPrayer,1000);
      if (!$('#prayer-notify')) { var nb=document.createElement('button'); nb.type='button'; nb.id='prayer-notify'; nb.className='btn btn-glass btn-sm'; nb.textContent='السماح بإشعارات المتصفح'; if(list)list.after(nb); nb.addEventListener('click',async function(){if(!('Notification' in window)){setText('prayer-status','الإشعارات غير مدعومة.');return}var perm=await Notification.requestPermission();setText('prayer-status',perm==='granted'?'تم السماح بالإشعارات؛ يتطلب التنبيه في موعد الصلاة بقاء الصفحة مفتوحة.':'لم يتم السماح بالإشعارات.');if(perm==='granted')new Notification('أنس أحمد',{body:'تم تفعيل إذن الإشعارات. أبقِ الموقع مفتوحاً للتنبيهات.'});}); }
    } catch (e) { if (status) status.textContent = e.message || 'تعذر حساب المواقيت.'; }
  }
  $('#prayer-locate')?.addEventListener('click', loadPrayer);

  /* اتجاه القبلة بالحساب الجغرافي إلى الكعبة */
  function bearing(lat, lon) {
    var kaabaLat = 21.4225 * Math.PI / 180, kaabaLon = 39.8262 * Math.PI / 180;
    var p = lat * Math.PI / 180, dl = kaabaLon - lon * Math.PI / 180;
    var y = Math.sin(dl), x = Math.cos(p) * Math.tan(kaabaLat) - Math.sin(p) * Math.cos(dl);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }
  $('#qibla-calc')?.addEventListener('click', async function () {
    try {
      var pos = coordinates || await getPosition(), deg = bearing(pos.lat, pos.lon);
      $('#qibla-needle').style.transform = 'translateX(-50%) rotate(' + deg + 'deg)';
      setText('qibla-status', 'اتجاه القبلة التقريبي: ' + Math.round(deg) + '° من الشمال الحقيقي. لا يتوفر تصحيح البوصلة تلقائياً.');
    } catch (e) { setText('qibla-status', e.message || 'تعذر حساب الاتجاه.'); }
  });

  /* عرض تحذير واضح إذا لم يدعم المتصفح التعرف على الكلام */
  if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    var note = document.createElement('p'); note.className = 'feature-note'; note.textContent = 'للتدريب على القراءة بالصوت، استخدم Chrome أو Edge على اتصال آمن HTTPS. التعرف على الكلام غير متاح في هذا المتصفح.';
    var grid = $('.feature-grid'); if (grid) grid.appendChild(note);
  }
})();