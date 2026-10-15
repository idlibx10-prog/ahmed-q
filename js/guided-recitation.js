(function(){'use strict';
var $=function(s){return document.querySelector(s)}, api='https://api.alquran.cloud/v1';
var recognition=null,active=false,currentSurah=1,words=[],wordStates=[],lastTranscript='',lastPainted='',sessionBase=0;
var surahNames=['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
function norm(s){return (s||'').normalize('NFD').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/[^\u0621-\u064A]/g,'');}
function status(t){var el=$('#recitation-status');if(el)el.textContent=t;}
function buildSelector(){var sel=$('#guided-surah-select');if(!sel)return;sel.innerHTML='';surahNames.forEach(function(n,i){var o=document.createElement('option');o.value=String(i+1);o.textContent=(i+1)+' — '+n;sel.appendChild(o);});sel.value=String(currentSurah);}
function renderPage(data){var holder=$('#guided-surah');holder.innerHTML='';words=[];wordStates=[];window.__nabrAyahWords=[];data.ayahs.forEach(function(a,ai){var parts=a.text.trim().split(/\s+/);var ayahWords=[];parts.forEach(function(w,wi){var token={text:w,ayah:a.numberInSurah};words.push(token);wordStates.push('pending');ayahWords.push({chapter:currentSurah,verse:a.numberInSurah,word:wi+1});});window.__nabrAyahWords.push(ayahWords);var end=document.createElement('span');end.className='ayah-end';end.textContent=' ۞'+toArabic(a.numberInSurah)+'۞ ';holder.appendChild(end);});holder.innerHTML='';words.forEach(function(w,i){var s=document.createElement('span');s.className='guided-word';s.textContent=w.text+' ';s.dataset.index=i;holder.appendChild(s);if(i===words.length-1||words[i+1].ayah!==w.ayah){var end=document.createElement('span');end.className='ayah-end';end.textContent='۞'+toArabic(w.ayah)+'۞ ';holder.appendChild(end);}});$('#guided-surah-name').textContent='سُورَةُ '+surahNames[currentSurah-1];$('#guided-surah-meta').textContent=(data.revelationType==='Meccan'?'مكية':'مدنية')+' • '+data.numberOfAyahs+' آيات';$('#guided-page-meta').textContent='سورة '+surahNames[currentSurah-1];$('#guided-page-number').textContent=toArabic(currentSurah);$('#guided-progress').textContent='جاهز للقراءة — '+words.length+' كلمة تقريبًا';}
function toArabic(n){return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[+d];});}
async function openSurah(){currentSurah=Number($('#guided-surah-select').value)||1;$('#guided-reading-view').hidden=false;$('#guided-open-page').disabled=true;status('جارٍ تحميل نص السورة من مصدر القرآن…');try{var r=await fetch(api+'/surah/'+currentSurah+'/quran-uthmani');if(!r.ok)throw Error('network');var j=await r.json();if(j.code!==200)throw Error('api');renderPage(j.data);lastTranscript='';lastPainted='';status('تم فتح السورة. اضغط قراءة مباشرة وابدأ التلاوة.');$('#recitation-heard').textContent='';}catch(e){status('تعذر تحميل نص السورة. تحقق من اتصال الإنترنت ثم أعد المحاولة.');}finally{$('#guided-open-page').disabled=false;}}
function setWord(i,state,title){var el=$('.guided-word[data-index="'+i+'"]');if(!el)return;el.classList.remove('is-correct','is-error','is-uncertain','is-current');if(state)el.classList.add(state);if(title)el.title=title;wordStates[i]=state||'pending';}
function compareTranscript(text,isInterim){var spoken=(text||'').trim().split(/\s+/).filter(Boolean);if(!spoken.length)return;var exp=words.map(function(w){return norm(w.text)}), got=spoken.map(norm);var n=Math.min(exp.length,got.length);
 // Reset previous live states but retain no fake green marks: each repaint reflects the latest recognized transcript.
 document.querySelectorAll('.guided-word').forEach(function(el){el.classList.remove('is-correct','is-error','is-uncertain','is-current');});
 var i=0,j=0,correct=0,wrong=0,uncertain=0;
 while(i<exp.length&&j<got.length){
   if(!got[j]){j++;continue;}
   if(exp[i]===got[j]){setWord(i,'is-correct','تطابق نصي تقريبي مع الكلام المتعرّف عليه فقط.');correct++;i++;j++;continue;}
   var ahead=-1;for(var k=1;k<=3&&j+k<got.length;k++){if(exp[i]===got[j+k]){ahead=k;break;}}
   var expAhead=-1;for(var q=1;q<=2&&i+q<exp.length;q++){if(exp[i+q]===got[j]){expAhead=q;break;}}
   if(ahead>0){for(var a=0;a<ahead;a++){setWord(i,'is-uncertain','لم يتعرف النظام على هذه الكلمة أو تخطاها؛ راجعها يدويًا.');uncertain++;i++;}continue;}
   if(expAhead>0){j++;continue;}
   // A recognized word that differs from the expected word is shown red as a potential mismatch, never as a definitive tajweed/diacritic diagnosis.
   setWord(i,'is-error','اختلاف محتمل بين النص والتعرف الصوتي. قد يكون خطأ قراءة أو خطأ تعرف؛ راجع التسجيل.');wrong++;i++;j++;
 }
 // If the speech engine exposes a partial word, highlight the next expected token immediately, without waiting for silence.
 var partial= isInterim ? got[got.length-1] : '';
 if(isInterim&&partial&&i<exp.length){var target=exp[i];if(target===partial){setWord(i,'is-correct','تطابق مباشر تقريبي للكلمة الحالية.');correct++;}else if(partial.length>=2){setWord(i,'is-error','الكلمة الحالية تختلف عن النص المتوقع بحسب التعرف المؤقت؛ قد تتغير النتيجة أثناء استمرار الكلام.');wrong++;}else{setWord(i,'is-current','الكلمة قيد التعرف.');}}
 var p=$('#guided-progress');if(p)p.textContent='أخضر: '+correct+' • اختلاف محتمل: '+wrong+' • غير محسوم: '+uncertain+' — لا يشمل ذلك تقييم التشكيل والتجويد.';
 var first=$('.guided-word.is-error, .guided-word.is-uncertain, .guided-word.is-current');if(first&&first.scrollIntoView)first.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});
}
function stop(){if(window.NabrRecitation)window.NabrRecitation.stop();if(recognition&&active){try{recognition.stop()}catch(e){}}}
$('#open-guided-recitation')&&$('#open-guided-recitation').addEventListener('click',function(){var m=$('#recitation-modal');m.hidden=false;$('#guided-reading-view').hidden=true;buildSelector();});
$('#guided-open-page')&&$('#guided-open-page').addEventListener('click',openSurah);
$('#guided-back-cover')&&$('#guided-back-cover').addEventListener('click',function(){stop();$('#guided-reading-view').hidden=true;});
$('#recitation-start')&&$('#recitation-start').addEventListener('click',function(){if(window.NabrRecitation)window.NabrRecitation.start();else status('تعذر تحميل موصل Nabr. أعد تحميل الصفحة.');});
$('#recitation-stop')&&$('#recitation-stop').addEventListener('click',function(){if(window.NabrRecitation)window.NabrRecitation.stop();});
$('#guided-reset')&&$('#guided-reset').addEventListener('click',function(){stop();lastTranscript='';lastPainted='';document.querySelectorAll('.guided-word').forEach(function(el){el.classList.remove('is-correct','is-error','is-uncertain','is-current');});$('#guided-progress').textContent='تمت إعادة العلامات. ابدأ القراءة من أول السورة.';$('#recitation-heard').textContent='';});
$('#guided-font-size')&&$('#guided-font-size').addEventListener('input',function(e){$('#guided-surah').style.fontSize=e.target.value+'px';});
})();