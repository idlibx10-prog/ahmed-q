/* الأربعون النووية — عرض محلي مع بحث ومفضلة */
(function(){
  'use strict';
  var items = [
    ['إنما الأعمال بالنيات','النية والإخلاص','إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى.','عمر بن الخطاب رضي الله عنه','متفق عليه'],
    ['حديث جبريل: مراتب الدين','الإسلام والإيمان والإحسان','أن تعبد الله كأنك تراه، فإن لم تكن تراه فإنه يراك.','عمر بن الخطاب رضي الله عنه','رواه مسلم'],
    ['أركان الإسلام الخمسة','أركان الإسلام','بني الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمدًا رسول الله، وإقام الصلاة، وإيتاء الزكاة، وحج البيت، وصوم رمضان.','عبد الله بن عمر رضي الله عنهما','متفق عليه'],
    ['خلق الإنسان وقدره','القدر والخلق','إن أحدكم يُجمع خلقه في بطن أمه أربعين يومًا... ثم يُرسل إليه الملك فينفخ فيه الروح.','عبد الله بن مسعود رضي الله عنه','متفق عليه'],
    ['رد البدع','اتباع السنة','من أحدث في أمرنا هذا ما ليس منه فهو رد.','عائشة رضي الله عنها','متفق عليه'],
    ['الحلال بيّن والحرام بيّن','الحلال والحرام','إن الحلال بيّن، وإن الحرام بيّن، وبينهما مشتبهات لا يعلمهن كثير من الناس.','النعمان بن بشير رضي الله عنه','متفق عليه'],
    ['الدين النصيحة','النصيحة','الدين النصيحة. قلنا: لمن؟ قال: لله ولكتابه ولرسوله ولأئمة المسلمين وعامتهم.','تميم الداري رضي الله عنه','رواه مسلم'],
    ['حرمة دم المسلم','أحكام الإسلام','أمرت أن أقاتل الناس حتى يشهدوا أن لا إله إلا الله وأن محمدًا رسول الله ويقيموا الصلاة ويؤتوا الزكاة.','عبد الله بن عمر رضي الله عنهما','متفق عليه'],
    ['ما نهيتكم عنه فاجتنبوه','الطاعة والاتباع','ما نهيتكم عنه فاجتنبوه، وما أمرتكم به فأتوا منه ما استطعتم.','أبو هريرة رضي الله عنه','متفق عليه'],
    ['إن الله طيب لا يقبل إلا طيبًا','الكسب الحلال','إن الله تعالى طيب لا يقبل إلا طيبًا.','أبو هريرة رضي الله عنه','رواه مسلم'],
    ['دع ما يريبك','الورع واليقين','دع ما يريبك إلى ما لا يريبك.','الحسن بن علي رضي الله عنهما','رواه الترمذي والنسائي'],
    ['ترك ما لا يعني','حسن الإسلام','من حسن إسلام المرء تركه ما لا يعنيه.','أبو هريرة رضي الله عنه','رواه الترمذي'],
    ['حب الخير للآخرين','الأخوة والإيمان','لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه.','أنس بن مالك رضي الله عنه','متفق عليه'],
    ['حرمة دم المسلم','عصمة الدماء','لا يحل دم امرئ مسلم إلا بإحدى ثلاث...','عبد الله بن مسعود رضي الله عنه','متفق عليه'],
    ['فليقل خيرًا أو ليصمت','آداب الكلام','من كان يؤمن بالله واليوم الآخر فليقل خيرًا أو ليصمت، وليكرم جاره وضيفه.','أبو هريرة رضي الله عنه','متفق عليه'],
    ['لا تغضب','كظم الغيظ','قال: لا تغضب. فردد مرارًا، قال: لا تغضب.','أبو هريرة رضي الله عنه','رواه البخاري'],
    ['الإحسان في كل شيء','الرفق والإحسان','إن الله كتب الإحسان على كل شيء.','شداد بن أوس رضي الله عنه','رواه مسلم'],
    ['اتق الله حيثما كنت','التقوى وحسن الخلق','اتق الله حيثما كنت، وأتبع السيئة الحسنة تمحها، وخالق الناس بخلق حسن.','أبو ذر ومعاذ رضي الله عنهما','رواه الترمذي'],
    ['احفظ الله يحفظك','التوكل والاستعانة','احفظ الله يحفظك، احفظ الله تجده تجاهك، إذا سألت فاسأل الله، وإذا استعنت فاستعن بالله.','عبد الله بن عباس رضي الله عنهما','رواه الترمذي'],
    ['الحياء من الإيمان','الحياء','إذا لم تستح فاصنع ما شئت.','أبو مسعود عقبة بن عمرو رضي الله عنه','رواه البخاري'],
    ['قل آمنت بالله ثم استقم','الاستقامة','قل آمنت بالله ثم استقم.','سفيان بن عبد الله رضي الله عنه','رواه مسلم'],
    ['طريق الجنة','الفرائض والعمل','أرأيت إذا صليت المكتوبات وصمت رمضان وأحللت الحلال وحرمت الحرام... أأدخل الجنة؟ قال: نعم.','جابر بن عبد الله رضي الله عنهما','رواه مسلم'],
    ['الطهور شطر الإيمان','الطهارة والذكر','الطهور شطر الإيمان، والحمد لله تملأ الميزان.','أبو مالك الأشعري رضي الله عنه','رواه مسلم'],
    ['تحريم الظلم','العدل والرحمة','يا عبادي، إني حرمت الظلم على نفسي وجعلته بينكم محرمًا فلا تظالموا.','أبو ذر الغفاري رضي الله عنه','رواه مسلم'],
    ['أبواب الصدقة','الذكر والعمل الصالح','إن بكل تسبيحة صدقة، وكل تكبيرة صدقة، وكل تحميدة صدقة.','أبو ذر رضي الله عنه','رواه مسلم'],
    ['كل سلامى عليه صدقة','أعمال الخير اليومية','كل سلامى من الناس عليه صدقة كل يوم تطلع فيه الشمس.','أبو هريرة رضي الله عنه','متفق عليه'],
    ['البر حسن الخلق','البر والإثم','البر حسن الخلق، والإثم ما حاك في نفسك وكرهت أن يطلع عليه الناس.','النواس بن سمعان رضي الله عنه','رواه مسلم'],
    ['عليكم بسنتي','اتباع السنة','فعليكم بسنتي وسنة الخلفاء الراشدين المهديين، عضوا عليها بالنواجذ.','العرباض بن سارية رضي الله عنه','رواه أبو داود والترمذي'],
    ['أبواب الخير','أعمال تقرب إلى الجنة','تعبد الله لا تشرك به شيئًا، وتقيم الصلاة، وتؤتي الزكاة، وتصوم رمضان، وتحج البيت.','معاذ بن جبل رضي الله عنه','رواه الترمذي'],
    ['الفرائض والحدود','أحكام الشريعة','إن الله تعالى فرض فرائض فلا تضيعوها، وحد حدودًا فلا تعتدوها.','أبو ثعلبة الخشني رضي الله عنه','رواه الدارقطني'],
    ['ازهد في الدنيا يحبك الله','الزهد','ازهد في الدنيا يحبك الله، وازهد فيما عند الناس يحبك الناس.','سهل بن سعد رضي الله عنه','رواه ابن ماجه'],
    ['لا ضرر ولا ضرار','رفع الضرر','لا ضرر ولا ضرار.','أبو سعيد الخدري رضي الله عنه','رواه ابن ماجه والدارقطني'],
    ['البينة على المدعي','العدل والقضاء','البينة على المدعي، واليمين على من أنكر.','عبد الله بن عباس رضي الله عنهما','رواه البيهقي وغيره'],
    ['تغيير المنكر','النصيحة والمسؤولية','من رأى منكم منكرًا فليغيره بيده، فإن لم يستطع فبلسانه، فإن لم يستطع فبقلبه.','أبو سعيد الخدري رضي الله عنه','رواه مسلم'],
    ['لا تحاسدوا ولا تباغضوا','الأخوة وحقوق المسلم','كونوا عباد الله إخوانًا. المسلم أخو المسلم، لا يظلمه ولا يخذله ولا يكذبه ولا يحقره.','أبو هريرة رضي الله عنه','رواه مسلم'],
    ['فضل قضاء حوائج الناس','التعاون والتيسير','من نفس عن مؤمن كربة من كرب الدنيا نفس الله عنه كربة من كرب يوم القيامة.','أبو هريرة رضي الله عنه','رواه مسلم'],
    ['كتابة الحسنات والسيئات','النية والجزاء','من هم بحسنة فلم يعملها كتبها الله عنده حسنة كاملة، وإن عملها كتبها الله عشر حسنات.','عبد الله بن عباس رضي الله عنهما','متفق عليه'],
    ['ولاية الله','محبة الله وأوليائه','من عادى لي وليًا فقد آذنته بالحرب، وما تقرب إلي عبدي بشيء أحب إلي مما افترضته عليه.','أبو هريرة رضي الله عنه','رواه البخاري'],
    ['التجاوز عن الخطأ','رحمة الله بالأمة','إن الله تجاوز لي عن أمتي الخطأ والنسيان وما استكرهوا عليه.','عبد الله بن عباس رضي الله عنهما','رواه ابن ماجه والبيهقي'],
    ['كن في الدنيا كأنك غريب','الزهد والاستعداد للآخرة','كن في الدنيا كأنك غريب أو عابر سبيل.','عبد الله بن عمر رضي الله عنهما','رواه البخاري'],
    ['اتباع الوحي','الاستقامة على الشرع','لا يؤمن أحدكم حتى يكون هواه تبعًا لما جئت به.','عبد الله بن عمرو رضي الله عنهما','رواه في كتاب الحجة بإسناد صحيح'],
    ['سعة مغفرة الله','الرجاء والاستغفار','يا ابن آدم، إنك ما دعوتني ورجوتني غفرت لك على ما كان منك ولا أبالي.','أنس بن مالك رضي الله عنه','رواه الترمذي وقال حسن صحيح']
  ].map(function(x,i){return {n:i+1,title:x[0],topic:x[1],text:x[2],narrator:x[3],source:x[4]};});
  var root=document.getElementById('nawawi-list'), search=document.getElementById('nawawi-search');
  if(!root||!search)return;
  var filter='all', memorizeMode=false, revealed={}, favs=readFavs(), readItems=readState('unsAhmadNawawiRead'), notes=readState('unsAhmadNawawiNotes');
  function readState(key){try{return JSON.parse(localStorage.getItem(key)|| (key==='unsAhmadNawawiNotes'?'{}':'[]'))}catch(e){return key==='unsAhmadNawawiNotes'?{}:[]}}
  function saveState(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
  var lessons={
    'النية والإخلاص':'اجعل قصدك لله، وراجع نيتك قبل العمل وأثناءه وبعده.', 'الإسلام والإيمان والإحسان':'اجمع بين صحة العمل، وصدق الإيمان، ومراقبة الله في السر والعلن.',
    'أركان الإسلام':'حافظ على أركان الإسلام؛ فهي أساس بناء حياة المسلم.', 'اتباع السنة':'زن الأعمال بالدليل، ولا تنسب إلى الدين ما ليس منه.',
    'الحلال والحرام':'تعلّم أحكام ما تحتاج إليه، وابتعد عما يوقعك في الشبهة.', 'النصيحة':'قدّم النصيحة بعلم وإخلاص ورفق، مع إرادة الخير للمنصوح.',
    'الطاعة والاتباع':'اترك ما نهى الشرع عنه، وافعل المأمور به بحسب استطاعتك.', 'الكسب الحلال':'تحرّ الحلال في طعامك ومالك، فصلاح الكسب من أسباب قبول العمل.',
    'الورع واليقين':'إذا التبس عليك أمر، فاطلب البيان واترك ما يوقعك في القلق حتى يتضح.', 'حسن الإسلام':'اشغل نفسك بما ينفعك، واترك التدخل فيما لا يعنيك.',
    'الأخوة والإيمان':'أحب للناس الخير الذي تحبه لنفسك، وابدأ بذلك في أقرب الناس إليك.', 'آداب الكلام':'تكلّم بخير نافع، وإن لم يكن الكلام خيرًا فالصمت أسلم.',
    'كظم الغيظ':'درّب نفسك على التوقف قبل الرد، وابتعد عن أسباب الغضب ما استطعت.', 'التقوى وحسن الخلق':'راقب الله في كل مكان، وأتبع الخطأ بتوبة وعمل صالح.',
    'التوكل والاستعانة':'استعن بالله مع الأخذ بالأسباب المشروعة، ولا تعلّق قلبك إلا به.', 'الاستقامة':'الثبات على الحق يحتاج إلى تجديد التوبة والعمل الصالح كل يوم.',
    'الطهارة والذكر':'اجمع بين طهارة الظاهر وذكر الله وحمده.', 'العدل والرحمة':'لا تظلم أحدًا، وردّ الحقوق، وابدأ بإصلاح ما تستطيع.',
    'الزهد':'لا تجعل الدنيا أكبر همك، ولا تتطلع إلى ما في أيدي الناس.', 'رفع الضرر':'تجنّب إيذاء الآخرين، وأزل الضرر بقدر استطاعتك.',
    'اتباع السنة':'اجعل مرجعك الوحي بفهم صحيح، وابتعد عن الأهواء المخالفة له.'
  };
  function lessonFor(h){return lessons[h.topic]||'تأمل معنى الحديث، وتحقق من شرحه من مصدر علمي موثوق، ثم اختر عملًا صغيرًا تطبّقه اليوم مما يدل عليه.'}
  function readFavs(){try{return JSON.parse(localStorage.getItem('unsAhmadNawawiFavs')||'[]')}catch(e){return []}}
  function saveFavs(){try{localStorage.setItem('unsAhmadNawawiFavs',JSON.stringify(favs))}catch(e){}}
  function render(){
    var q=search.value.trim().toLowerCase();
    var shown=items.filter(function(h){var hay=[h.n,h.title,h.topic,h.text,h.narrator,h.source].join(' ').toLowerCase();return (!q||hay.indexOf(q)!==-1)&&(filter!=='favorites'||favs.indexOf(h.n)!==-1)});
    document.getElementById('nawawi-visible').textContent=shown.length;
    var readCount=document.getElementById('nawawi-read-count');if(readCount)readCount.textContent=readItems.length;
    root.innerHTML='';
    if(!shown.length){root.innerHTML='<div class="nawawi-empty glass-lg">لا توجد أحاديث مطابقة. جرّب كلمة أخرى أو أزل فلتر المفضلة.</div>';return;}
    shown.forEach(function(h){var card=document.createElement('article');card.className='nawawi-card glass-lg';
      var top=document.createElement('div');top.className='nawawi-card-top';
      var num=document.createElement('span');num.className='nawawi-number';num.textContent='الحديث '+h.n;
      var fav=document.createElement('button');fav.type='button';fav.className='nawawi-fav';fav.setAttribute('aria-label',favs.indexOf(h.n)!==-1?'إزالة من المفضلة':'إضافة إلى المفضلة');fav.setAttribute('aria-pressed',String(favs.indexOf(h.n)!==-1));fav.innerHTML=favs.indexOf(h.n)!==-1?'<i class="fa-solid fa-bookmark"></i> محفوظ':'<i class="fa-regular fa-bookmark"></i> حفظ';
      fav.addEventListener('click',function(){var idx=favs.indexOf(h.n);if(idx===-1)favs.push(h.n);else favs.splice(idx,1);saveFavs();render();});top.appendChild(num);top.appendChild(fav);
      var title=document.createElement('h3');title.textContent=h.title;
      var topic=document.createElement('span');topic.className='nawawi-topic';topic.textContent=h.topic;
      var text=document.createElement('p');text.className='nawawi-hadith-text';text.textContent='«'+h.text+'»';text.hidden=memorizeMode&&!revealed[h.n];
      var recall=document.createElement('button');recall.type='button';recall.className='btn btn-glass btn-sm nawawi-recall';recall.innerHTML=memorizeMode?(revealed[h.n]?'<i class="fa-solid fa-eye-slash"></i> إخفاء الحديث':'<i class="fa-solid fa-eye"></i> إظهار الحديث'):'<i class="fa-solid fa-brain"></i> اختبر حفظك';recall.setAttribute('aria-expanded',String(!text.hidden));recall.addEventListener('click',function(){if(!memorizeMode){memorizeMode=true;revealed[h.n]=false;var toggle=document.getElementById('nawawi-memorize-toggle');if(toggle){toggle.setAttribute('aria-pressed','true');toggle.classList.add('is-selected');toggle.innerHTML='<i class="fa-solid fa-brain"></i> إيقاف وضع الحفظ';}render();return;}revealed[h.n]=!revealed[h.n];render();});
      var lesson=document.createElement('div');lesson.className='nawawi-lesson';lesson.innerHTML='<strong><i class="fa-solid fa-lightbulb"></i> فائدة للتأمل</strong>';var lessonText=document.createElement('p');lessonText.textContent=lessonFor(h);lesson.appendChild(lessonText);
      var noteWrap=document.createElement('details');noteWrap.className='nawawi-note-wrap';var noteSummary=document.createElement('summary');noteSummary.textContent='ملاحظتي على الحديث';var note=document.createElement('textarea');note.className='nawawi-note';note.rows=2;note.placeholder='اكتب فائدة أو تطبيقًا تريد تذكّره…';note.value=notes[h.n]||'';note.addEventListener('change',function(){notes[h.n]=note.value;saveState('unsAhmadNawawiNotes',notes)});noteWrap.appendChild(noteSummary);noteWrap.appendChild(note);
      var readBtn=document.createElement('button');readBtn.type='button';readBtn.className='btn btn-glass btn-sm nawawi-read';readBtn.innerHTML=readItems.indexOf(h.n)!==-1?'<i class="fa-solid fa-check"></i> تمت المراجعة':'<i class="fa-regular fa-circle"></i> علّم كمقروء';readBtn.setAttribute('aria-pressed',String(readItems.indexOf(h.n)!==-1));readBtn.addEventListener('click',function(){var ix=readItems.indexOf(h.n);if(ix===-1)readItems.push(h.n);else readItems.splice(ix,1);saveState('unsAhmadNawawiRead',readItems);render()});
      var meta=document.createElement('div');meta.className='nawawi-meta';var narrator=document.createElement('span');narrator.textContent='الراوي: '+h.narrator;var source=document.createElement('span');source.textContent='التخريج: '+h.source;meta.appendChild(narrator);meta.appendChild(source);
      var actions=document.createElement('div');actions.className='nawawi-card-actions';var copy=document.createElement('button');copy.type='button';copy.className='btn btn-glass btn-sm';copy.innerHTML='<i class="fa-regular fa-copy"></i> نسخ الحديث';copy.addEventListener('click',function(){var str='الحديث '+h.n+' — '+h.title+'\n'+h.text+'\nالراوي: '+h.narrator+' — '+h.source;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(str).then(function(){copy.innerHTML='<i class="fa-solid fa-check"></i> تم النسخ'}).catch(function(){fallbackCopy(str,copy)})}else fallbackCopy(str,copy)});actions.appendChild(copy);
      card.appendChild(top);card.appendChild(title);card.appendChild(topic);card.appendChild(text);card.appendChild(recall);card.appendChild(lesson);card.appendChild(noteWrap);card.appendChild(meta);actions.appendChild(readBtn);card.appendChild(actions);root.appendChild(card);
    });
  }
  function fallbackCopy(str,btn){var ta=document.createElement('textarea');ta.value=str;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');btn.textContent='تم النسخ'}catch(e){btn.textContent='تعذر النسخ'}ta.remove();}
  var memorizeToggle=document.getElementById('nawawi-memorize-toggle');if(memorizeToggle)memorizeToggle.addEventListener('click',function(){memorizeMode=!memorizeMode;revealed={};memorizeToggle.setAttribute('aria-pressed',String(memorizeMode));memorizeToggle.classList.toggle('is-selected',memorizeMode);memorizeToggle.innerHTML=memorizeMode?'<i class="fa-solid fa-brain"></i> إيقاف وضع الحفظ':'<i class="fa-solid fa-brain"></i> وضع الحفظ';render();});
  search.addEventListener('input',render);
  document.querySelectorAll('[data-hadith-filter]').forEach(function(btn){btn.addEventListener('click',function(){filter=btn.getAttribute('data-hadith-filter');document.querySelectorAll('[data-hadith-filter]').forEach(function(b){b.classList.toggle('is-selected',b===btn);b.classList.toggle('btn-light',b===btn);b.classList.toggle('btn-glass',b!==btn)});render()})});
  document.getElementById('nawawi-clear').addEventListener('click',function(){search.value='';filter='all';document.querySelectorAll('[data-hadith-filter]').forEach(function(b){var active=b.getAttribute('data-hadith-filter')==='all';b.classList.toggle('is-selected',active);b.classList.toggle('btn-light',active);b.classList.toggle('btn-glass',!active)});render();search.focus()});
  render();
})();
