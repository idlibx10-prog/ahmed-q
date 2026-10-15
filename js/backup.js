/* النسخ الاحتياطي والاستعادة — بيانات الموقع فقط، دون إرسال أي شيء إلى خادم. */
(function () {
  'use strict';
  var PREFIXES = ['sakina:', 'uns-ahmad:', 'unsAhmad:', 'quran:', 'adhkar:', 'nawawi:', 'taj-adhikr:', 'guided-recitation:', 'nabr:'];
  var EXACT = ['theme', 'lastRead', 'quranLastRead', 'readingProgress', 'dailyWird', 'daily-wird', 'bookmarks', 'ayahBookmarks', 'playlist', 'tasbeehCount', 'recitationStats'];
  function isAppKey(key) {
    if (!key) return false;
    if (PREFIXES.some(function (p) { return key.indexOf(p) === 0; })) return true;
    if (EXACT.indexOf(key) !== -1) return true;
    return /^(uns.?ahmad|sakina|quran|adhkar|nawawi|taj.?adhikr|guided.?recitation|nabr)[._:-]/i.test(key);
  }
  function collect() {
    var data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (isAppKey(key)) data[key] = localStorage.getItem(key);
      }
    } catch (e) { throw new Error('تعذّر الوصول إلى التخزين المحلي في هذا المتصفح.'); }
    return data;
  }
  function say(message, bad) {
    var status = document.getElementById('backup-status');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('backup-error', !!bad);
  }
  function downloadBackup() {
    try {
      var payload = { format: 'uns-ahmad-backup', version: 1, createdAt: new Date().toISOString(), data: collect() };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'uns-ahmad-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      say('تم تجهيز النسخة الاحتياطية. احتفظ بالملف في مكان آمن.');
    } catch (e) { say(e.message || 'لم نتمكن من إنشاء النسخة الاحتياطية.', true); }
  }
  function restoreBackup(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onerror = function () { say('تعذّرت قراءة الملف. جرّب ملف JSON آخر.', true); };
    reader.onload = function () {
      var payload;
      try { payload = JSON.parse(reader.result); }
      catch (e) { say('الملف ليس JSON صالحاً.', true); return; }
      if (!payload || payload.format !== 'uns-ahmad-backup' || payload.version !== 1 || !payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
        say('هذا الملف ليس نسخة احتياطية معتمدة من أُنس أحمد.', true); return;
      }
      var entries = Object.keys(payload.data).filter(function (key) { return isAppKey(key) && typeof payload.data[key] === 'string'; });
      if (!entries.length) { say('لم نعثر على بيانات قابلة للاستعادة في الملف.', true); return; }
      if (!window.confirm('سيتم استعادة ' + entries.length + ' عنصر من البيانات. قد تُستبدل بيانات موجودة على هذا الجهاز. هل تريد المتابعة؟')) return;
      var before = {};
      try {
        entries.forEach(function (key) { before[key] = localStorage.getItem(key); });
        entries.forEach(function (key) { localStorage.setItem(key, payload.data[key]); });
        say('تمت استعادة البيانات (' + entries.length + ' عنصر). أعد تحميل الصفحة لتحديث جميع الأقسام.');
        var reload = document.getElementById('backup-reload'); if (reload) reload.hidden = false;
      } catch (e) {
        entries.forEach(function (key) { try { if (before[key] === null) localStorage.removeItem(key); else if (before[key] !== undefined) localStorage.setItem(key, before[key]); } catch (_) {} });
        say('تعذّرت الاستعادة بالكامل؛ أعدنا البيانات التي استطعنا إرجاعها. قد تكون مساحة التخزين ممتلئة.', true);
      }
    };
    reader.readAsText(file);
  }
  function init() {
    var exportBtn = document.getElementById('backup-export');
    var importBtn = document.getElementById('backup-import-trigger');
    var input = document.getElementById('backup-file');
    var reload = document.getElementById('backup-reload');
    if (exportBtn) exportBtn.addEventListener('click', downloadBackup);
    if (importBtn && input) importBtn.addEventListener('click', function () { input.click(); });
    if (input) input.addEventListener('change', function () { restoreBackup(input.files && input.files[0]); input.value = ''; });
    if (reload) reload.addEventListener('click', function () { window.location.reload(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
