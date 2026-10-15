/* ==========================================================
   أنس أحمد — ai.js
   المساعد الذكي عبر Puter.js + deepseek-chat مع بثّ حيّ
   ملاحظة: نحمّل المكتبة عند أول فتح فقط لتسريع تحميل الصفحة
   ========================================================== */
(function () {
  'use strict';

  var App = (window.Sakina = window.Sakina || {});
  var $ = App.$, on = App.on;

  var SRC = 'https://js.puter.com/v2/';
  var MODEL = 'deepseek-chat';

  var box = $('#ai-messages');
  var form = $('#ai-form');
  var input = $('#ai-input');
  var typing = $('#ai-typing');
  var sendBtn = $('#ai-send');
  var statusDot = $('.ai-status');

  var busy = false;
  var history = [];   // [{role:'user'|'assistant', content:'...'}]
  var loadingLib = null;

  var SYSTEM = 'أنت مساعد إسلامي لطيف. أجب بالعربية الفصحى المبسطة، ' +
    'واقتصر في معلوماتك الدينية على ما هو ثابت في القرآن والسنة، ' +
    'وإن سُئلت عن أمر فيه خلاف فاذكر الخلاف بوضوح. اجعل الرد موجزاً ومريحاً.';

  /* ───────── تحميل المكتبة عند الحاجة ───────── */
  function loadPuter() {
    if (window.puter && window.puter.ai) return Promise.resolve(window.puter);
    if (loadingLib) return loadingLib;

    loadingLib = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      var done = false;
      var timer = setTimeout(function () {
        if (!done) { done = true; reject(new Error('انتهت مهلة تحميل المساعد')); }
      }, 20000);

      s.onload = function () {
        clearTimeout(timer);
        done = true;
        if (window.puter && window.puter.ai) resolve(window.puter);
        else reject(new Error('المكتبة لم تُحمّل بشكل صحيح'));
      };
      s.onerror = function () {
        clearTimeout(timer);
        done = true;
        reject(new Error('تعذّر الوصول إلى خدمة المساعد الذكي'));
      };
      document.head.appendChild(s);
    });

    return loadingLib;
  }

  /* ───────── فقاعات المحادثة ───────── */
  function bubble(role, text) {
    var b = document.createElement('div');
    b.className = 'bubble ' + (role === 'user' ? 'user' : 'ai');
    b.textContent = text;          // textContent يمنع أي HTML من الرد
    box.appendChild(b);
    box.scrollTop = box.scrollHeight;
    return b;
  }

  function setStatus(text, isError) {
    if (!statusDot) return;
    statusDot.innerHTML = '<i class="dot" aria-hidden="true"></i> ' + text;
    if (isError) {
      var dot = $('.dot', statusDot);
      if (dot) dot.style.background = '#f87171';
    }
  }

  /* ───────── الإرسال ───────── */
  function send() {
    var text = (input.value || '').trim();
    if (!text || busy) return;

    bubble('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    busy = true;
    typing.hidden = false;
    setStatus('يكتب…', false);

    // نبني الرسائل: النظام + آخر 12 رسالة فقط حتى لا تطول الطلبات
    var msgs = [{ role: 'system', content: SYSTEM }]
      .concat(history.slice(-12))
      .map(function (m) { return { role: m.role, content: m.content }; });

    var out = bubble('ai', '');
    var acc = '';

    loadPuter()
      .then(function (puter) {
        return puter.ai.chat(msgs, { model: MODEL, stream: true });
      })
      .then(function (stream) {
        return (async function () {
          if (!stream) throw new Error('لا يوجد رد من الخادم');
          // الصيغة غير المتزامنة هي المتوقعة مع stream:true
          if (typeof stream[Symbol.asyncIterator] === 'function') {
            for await (var part of stream) {
              if (part && part.text) {
                acc += part.text;
                out.textContent = acc;
                box.scrollTop = box.scrollHeight;
              }
            }
          } else {
            // احتياطي: رد كامل بلا بثّ
            var txt = (stream.message && stream.message.content) ||
                      (stream.text && (typeof stream.text === 'string' ? stream.text : stream.text.content)) ||
                      stream.choices && stream.choices[0] && stream.choices[0].message.content;
            if (typeof txt !== 'string' || !txt) throw new Error('رد فارغ');
            acc = txt;
            out.textContent = acc;
          }
        })();
      })
      .then(function () {
        if (!acc.trim()) throw new Error('لم يصل رد، حاول مرة أخرى');
        history.push({ role: 'assistant', content: acc });
        setStatus('متصل', false);
      })
      .catch(function (err) {
        var msg = (err && err.message) || 'حدث خطأ غير متوقع';
        if (out) out.remove();
        bubble('ai', 'عذراً، ' + msg + '.\nجرّب مرة أخرى بعد قليل. 🤍');
        setStatus('غير متصل', true);
      })
      .then(function () {
        busy = false;
        typing.hidden = true;
        input.focus();
      });
  }

  on(form, 'submit', function (e) { e.preventDefault(); send(); });
  on(sendBtn, 'click', send);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  /* ───────── فتح/إغلاق ───────── */
  App.AI = {
    open: function () {
      if (!box.children.length) {
        bubble('ai', 'السلام عليكم ورحمة الله وبركاته 🌙\nاسألني عن أي شيء من القرآن والأذكار…');
      }
      // نُحمّل المكتبة مسبقاً عند الفتح لتسريع أول رسالة
      loadPuter().then(function () { setStatus('متصل', false); })
                  .catch(function () { setStatus('غير متصل', true); });
      setTimeout(function () { if (input) input.focus(); }, 100);
    },
    close: function () { if (App.closeAI) App.closeAI(); }
  };

  on(document, 'keydown', function (e) {
    var ov = $('#ai-overlay');
    if (e.key === 'Escape' && ov && !ov.hidden) App.AI.close();
  });

  setStatus('متصل', false);
})();
