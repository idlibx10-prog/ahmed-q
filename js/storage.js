/* ==========================================================
   أنس أحمد — storage.js
   غلاف آمن حول localStorage + حفظ آخر قراءة وعدّاد الأذكار
   ========================================================== */
(function () {
  'use strict';

  var App = (window.Sakina = window.Sakina || {});

  /* ───────── غلاف آمن للتخزين ─────────
     بعض المتصفحات تمنع localStorage عند فتح الملف عبر file://
     أو في وضع التصفح الخاص، فكل عملية داخل try/catch.       */
  var mem = {};   // ذاكرة احتياطية لو تعذّر التخزين الدائم
  var ok = (function () {
    try {
      var t = '__sakina_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;   // سنحفظ في الذاكرة فقط حتى لا يتعطّل الموقع
    }
  })();

  var KEY = 'sakina:';

  App.store = {
    get: function (name, fallback) {
      try {
        var v = ok ? window.localStorage.getItem(KEY + name) : mem[KEY + name];
        return v === null || v === undefined ? fallback : v;
      } catch (e) {
        return fallback;
      }
    },

    set: function (name, value) {
      var v = String(value);
      try {
        if (ok) window.localStorage.setItem(KEY + name, v);
        else mem[KEY + name] = v;
        return true;
      } catch (e) {
        mem[KEY + name] = v;   // الحصة ممتلئة أو محظورة: نكمل في الذاكرة
        return false;
      }
    },

    getJSON: function (name, fallback) {
      try {
        var raw = App.store.get(name, null);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;   // بيانات تالفة: نتجاهلها بصمت
      }
    },

    setJSON: function (name, obj) {
      try { return App.store.set(name, JSON.stringify(obj)); }
      catch (e) { return false; }
    },

    del: function (name) {
      try {
        if (ok) window.localStorage.removeItem(KEY + name);
        else delete mem[KEY + name];
      } catch (e) { /* لا يهم */ }
    }
  };

  /* ───────── آخر سورة مقروءة ───────── */
  App.lastRead = {
    save: function (number, name) {
      App.store.setJSON('lastRead', { n: number, name: name, at: Date.now() });
      App.bus.emit('lastread', { n: number, name: name });
    },
    load: function () { return App.store.getJSON('lastRead', null); }
  };

  /* ───────── عدّاد الأذكار ─────────
     يُحفظ لكل ذكر على حدة حتى لا يضيع عند إعادة تحميل الصفحة */
  App.counters = {
    key: function (cat, index) { return 'count:' + cat + ':' + index; },
    get: function (cat, index) {
      var v = parseInt(App.store.get(App.counters.key(cat, index), '0'), 10);
      return isNaN(v) || v < 0 ? 0 : v;
    },
    set: function (cat, index, value) {
      App.store.set(App.counters.key(cat, index), String(value));
    },
    clearCat: function (cat) {
      // نحذف مفاتيح القسم فقط دون المرور على كل مفاتيح التخزين
      try {
        if (ok) {
          var kill = [];
          for (var i = 0; i < window.localStorage.length; i++) {
            var k = window.localStorage.key(i);
            if (k && k.indexOf(KEY + 'count:' + cat + ':') === 0) kill.push(k);
          }
          kill.forEach(function (k) { window.localStorage.removeItem(k); });
        } else {
          var prefix = KEY + 'count:' + cat + ':';
          Object.keys(mem).forEach(function (k) {
            if (k.indexOf(prefix) === 0) delete mem[k];
          });
        }
      } catch (e) { /* لا يهم */ }
    }
  };

  /* نُبلغ الصفحة إن كان التخزين الدائم معطلاً (مهم أثناء الاختبار فقط) */
  if (!ok) {
    App.store.setJSON('storageDisabled', true);
  }
})();
