(function(){'use strict';
  var socket=null, recorder=null, stream=null, pack=null, started=false, ready=false, sessionResolver=null, sessionRejecter=null;
  var $=function(s){return document.querySelector(s)};
  function status(s){var e=$('#recitation-status');if(e)e.textContent=s;}
  function send(obj){if(socket&&socket.readyState===WebSocket.OPEN&&pack)socket.send(pack.encode(obj));}
  function handleResult(m){
    var all=[];(m.correct_words||[]).forEach(function(x){all.push({x:x,s:'is-correct',tip:'صنّفت Nabr هذه الكلمة مطابقة'});});
    (m.skipped_words||[]).forEach(function(x){all.push({x:x,s:'is-uncertain',tip:'كلمة متجاوزة بحسب Nabr'});});
    (m.letter_mistakes||[]).forEach(function(x){all.push({x:x,s:'is-error',tip:x.message||'اختلاف حرف بحسب Nabr'});});
    (m.tajweed_mistakes||[]).forEach(function(x){all.push({x:x,s:'is-error',tip:x.message||'ملاحظة تجويد بحسب Nabr'});});
    var flat=[];(window.__nabrAyahWords||[]).forEach(function(a){a.forEach(function(w){flat.push(w);});});
    all.forEach(function(item){var index=flat.findIndex(function(x){return x.chapter===item.x.chapter&&x.verse===item.x.verse&&x.word===item.x.word;});if(index>=0){var el=$('.guided-word[data-index="'+index+'"]');if(el){el.classList.remove('is-correct','is-error','is-uncertain','is-current');el.classList.add(item.s);el.title=item.tip;}}});
    var heard=$('#recitation-heard');if(heard&&m.text)heard.textContent='النص الذي التقطته الخدمة: '+m.text;
    var p=$('#guided-progress');if(p)p.textContent='Nabr • مطابق: '+(m.correct_words||[]).length+' • متجاوز: '+(m.skipped_words||[]).length+' • أخطاء الحروف: '+(m.letter_mistakes||[]).length+' • ملاحظات التجويد: '+(m.tajweed_mistakes||[]).length;
    if(m.exit_code===8)status('اكتملت السورة بحسب Nabr. يمكنك اختيار سورة أخرى أو إعادة القراءة.');
  }
  async function connect(){
    if(socket&&socket.readyState===WebSocket.OPEN)return;
    var proto=location.protocol==='https:'?'wss:':'ws:';
    socket=new WebSocket(proto+'//'+location.hostname+':8787/nabr');socket.binaryType='arraybuffer';
    // Install listeners BEFORE waiting for open so the first server event cannot be missed.
    socket.addEventListener('message',function(ev){try{var m=pack.decode(new Uint8Array(ev.data));switch(m.event){
      case'QRC_CLIENT_CONNECTED':ready=true;status('اتصلت خدمة Nabr. الرصيد: '+(m.credits_balance==null?'غير معروض':m.credits_balance));break;
      case'TILAWA_SESSION_STARTED':if(m.exit_code===6){status('بدأت جلسة تصحيح التلاوة.');if(sessionResolver){sessionResolver();sessionResolver=null;sessionRejecter=null;}}else{var err=new Error('رفضت Nabr بدء الجلسة (رمز '+m.exit_code+').');status(err.message);if(sessionRejecter)sessionRejecter(err);sessionResolver=null;sessionRejecter=null;}break;
      case'TILAWA_RESULT':handleResult(m);break;
      case'QRC_ERROR':status('خطأ من Nabr ('+m.code+'): '+m.message);if(sessionRejecter)sessionRejecter(new Error(m.message||m.code));sessionResolver=null;sessionRejecter=null;break;
    }}catch(e){status('تعذر قراءة رد الخدمة: '+(e.message||e));}});
    socket.addEventListener('close',function(ev){ready=false;if(started){var why=ev&&ev.reason?(' ('+ev.reason+')'):'';status('انقطع اتصال خدمة التصحيح'+(ev&&ev.code?' — الرمز '+ev.code:'')+why+'. أوقف القراءة ثم حاول مجددًا.');}else if(!ready){status('أُغلق اتصال خدمة التصحيح قبل بدء الجلسة. تحقق من تشغيل الخادم ومفتاح API والاشتراك.');}});
    await new Promise(function(resolve,reject){var timer=setTimeout(function(){reject(new Error('timeout'));},12000);socket.addEventListener('open',function(){clearTimeout(timer);resolve();},{once:true});socket.addEventListener('error',function(){clearTimeout(timer);reject(new Error('connection'));},{once:true});});
    // Wait for the upstream provider handshake, not merely the local proxy socket.
    if(!ready)await new Promise(function(resolve,reject){var t=setTimeout(function(){reject(new Error('لم يصل تأكيد اتصال Nabr. تحقق من المفتاح والرصيد والخادم.'));},12000);var old=status;var check=setInterval(function(){if(ready){clearInterval(check);clearTimeout(t);resolve();}},100);});
  }
  async function start(){
    if(started)return;
    if(!$('#guided-surah')||!$('#guided-surah').children.length){status('اختر السورة وافتح صفحة المصحف أولًا.');return;}
    try{
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('المتصفح لا يتيح الميكروفون. افتح الموقع عبر localhost أو HTTPS.');
      status('جارٍ الاتصال بخدمة تصحيح التلاوة…');pack=await import('https://esm.sh/@msgpack/msgpack@3.1.2');await connect();
      var surah=Number($('#guided-surah-select').value)||1;
      var sessionReady=new Promise(function(resolve,reject){sessionResolver=resolve;sessionRejecter=reject;setTimeout(function(){if(sessionResolver){sessionResolver=null;sessionRejecter=null;reject(new Error('لم تؤكد Nabr بدء الجلسة خلال المهلة.'));}},15000);});
      send({method:'START_TILAWA_SESSION',chapter_index:surah,verse_index:1,word_index:1,hafz_level:1,tajweed_level:1});
      status('تم إرسال طلب الجلسة؛ بانتظار تأكيد Nabr…');await sessionReady;
      stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
      // Use the browser default recording format, as in Nabr's documentation.
      recorder=new MediaRecorder(stream);
      recorder.ondataavailable=async function(ev){if(!ev.data||!ev.data.size||!socket||socket.readyState!==WebSocket.OPEN)return;try{var b=await ev.data.arrayBuffer();send({method:'CHECK_TILAWA_AUDIO',audio:new Uint8Array(b)});}catch(e){status('تعذر إرسال مقطع الصوت: '+(e.message||e));}};
      recorder.onerror=function(ev){status('حدث خطأ في تسجيل الصوت: '+(ev.error&&ev.error.message||'غير معروف'));};
      recorder.start(250);started=true;$('#recitation-start').textContent='🎤 التلاوة قيد التصحيح';status('الميكروفون يعمل؛ اقرأ بوضوح وانتظر نتائج Nabr…');
    }catch(e){status('لم يبدأ التصحيح: '+(e&&e.message||'خطأ غير معروف'));if(stream)stream.getTracks().forEach(function(t){t.stop();});stream=null;if(recorder&&recorder.state!=='inactive'){try{recorder.stop()}catch(_){}}recorder=null;}
  }
  function stop(){if(recorder&&recorder.state!=='inactive'){try{recorder.stop()}catch(e){}}if(stream){stream.getTracks().forEach(function(t){t.stop();});stream=null;}recorder=null;if(started)send({method:'RESET_TILAWA_SESSION'});started=false;$('#recitation-start').textContent='🎤 قراءة مباشرة عبر Nabr';status('تم إيقاف جلسة التلاوة.');}
  window.NabrRecitation={start:start,stop:stop};
})();
