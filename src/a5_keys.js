/* ===== Magic Keys ===== */
var kSilly=false,kScale=null,kWithBeat=false,KEYS=[],held={};
function keyNotes(){var z=S.mode==='zoe',sc=kScale||P().scale,b=SCALES[sc].slice(0,5),out=[];var cnt=z?8:11;for(var i=0;i<cnt;i++)out.push(60+(z?0:keyRoot())+b[i%5]+12*Math.floor(i/5));return out}
function buildKeys(){var T=$('keysTop'),K=$('keys'),z=S.mode==='zoe';T.innerHTML='';
 var IL=z?INST_Z:INST_A.filter(function(x,i){return kSilly?i>=7:i<7});if(!z&&INST_A.slice(7).some(function(x){return x.id===S.song.inst})&&!kSilly&&!buildKeys.seen){kSilly=true;buildKeys.seen=1;return buildKeys()}
 IL.forEach(function(it){var b=document.createElement('button');b.className='ib'+(S.song.inst===it.id?' on':'');b.innerHTML='<span class="emo">'+it.e+'</span>'+it.n;
  b.addEventListener('click',function(){unlock();S.song.inst=it.id;T.querySelectorAll('.ib').forEach(function(x){x.classList.remove('on')});b.classList.add('on');var h=inst(it.id,72,now()+0.01,0.9,BUS.keys);h&&h.stop(now()+0.4);save();
   if(!z)toast('🐦 Birdie plays '+it.n+' now!')});T.appendChild(b)});
 if(!z){var sw=document.createElement('button');sw.className='ib swap';sw.innerHTML='<span class="emo">'+(kSilly?'🎹':'🤪')+'</span>'+(kSilly?'Normal':'Silly ones');sw.addEventListener('click',function(){unlock();kSilly=!kSilly;smp('boing1',0,{dest:BUS.ui,gain:.5});buildKeys()});T.appendChild(sw)}
 if(!z){var sb=document.createElement('button');sb.className='ib';var sc=kScale||P().scale;sb.innerHTML='<span class="emo">'+(sc==='minor'?'🌙':'☀️')+'</span>'+(sc==='minor'?'Spooky':'Happy');
  sb.addEventListener('click',function(){kScale=(kScale||P().scale)==='minor'?'major':'minor';buildKeys()});T.appendChild(sb)}
 var rb=document.createElement('button');rb.className='ib rec'+(kRec?' on':'');rb.innerHTML='<span class="emo">'+(kRec?'⏺️':'🔴')+'</span>'+(kRec?'Recording!':(z?'Record':'Record into song'));
 rb.addEventListener('click',function(){unlock();kRec=!kRec;if(kRec){kWithBeat=true;if(!playing)start();if(S.song.band.mel!==1){S.song.band.mel=1;save()}toast(z?'🔴 Play the keys! Unicorn will remember!':'🔴 Play along! Birdie learns your tune');}else toast(z?'🦄 Saved in your song!':'🐦 Tune saved in the song!');buildKeys()});T.appendChild(rb);
 var cb=document.createElement('button');cb.className='ib';cb.innerHTML='<span class="emo">🧽</span>'+(z?'Clear':'Clear tune');cb.addEventListener('click',function(){unlock();S.song.rows.mel=S.song.rows.mel.map(function(){return 0});S.song.pats[S.song.ed]=S.song.rows;smp('whee2',0,{dest:BUS.ui,gain:.5});save();toast('🧽 Tune cleared')});T.appendChild(cb);
 var wb=document.createElement('button');wb.className='ib'+(kWithBeat?' on':'');wb.innerHTML='<span class="emo">🔁</span>'+(z?'With music':'Play with my beat');
 wb.addEventListener('click',function(){unlock();kWithBeat=!kWithBeat;if(kWithBeat)start();else{stop();kRec=false;buildKeys()}wb.classList.toggle('on',kWithBeat)});T.appendChild(wb);
 var sg=document.createElement('div');sg.id='singer';sg.className='emo';sg.textContent=z?'🦄':'🐦';T.appendChild(sg);
 K.querySelectorAll('.key').forEach(function(k){k.remove()});KEYS=keyNotes();
 KEYS.forEach(function(m,i){var k=document.createElement('div');k.className='key';var hue=(i*(360/KEYS.length))%360;k.style.background='linear-gradient(180deg,hsl('+hue+',95%,72%),hsl('+hue+',85%,55%))';k.dataset.i=i;
  var nm=NOTE_NAMES[((m%12)+12)%12];k.innerHTML=z?'<span class="kp emo">'+(ZPICS[nm]||'⭐')+'</span><span class="kl">'+nm+'</span>':'<span class="kl" style="font-size:20px;opacity:.85">'+nm+'</span>';K.appendChild(k)})}
(function(){function keyAt(e){var el=document.elementFromPoint(e.clientX,e.clientY);return el&&el.closest?el.closest('.key'):null}
 function on(pid,k){off(pid);if(!k)return;var i=+k.dataset.i,m=KEYS[i];keyRecord(i);held[pid]={k:k,h:inst(S.song.inst,m,now()+0.003,0.95,BUS.keys)};k.classList.add('dn');
  var sg=$('singer');if(sg)hop(sg);var r=k.getBoundingClientRect(),host=$('keys').getBoundingClientRect(),n=document.createElement('span');n.className='note emo';n.textContent=S.mode==='zoe'?['💖','✨','🌸','⭐','🦋'][i%5]:['🎵','🎶','⭐','💥'][i%4];
  n.style.left=(r.left-host.left+r.width/2-12)+'px';n.style.top=(r.top-host.top+r.height*0.35)+'px';n.style.fontSize='34px';n.style.setProperty('--dx',((Math.random()-.5)*50)+'px');$('kparts').appendChild(n);setTimeout(function(){n.remove()},1000);
  if(S.mode==='zoe')sparkle(r.left+r.width/2,r.top+r.height*.4,5)}
 function off(pid){var h=held[pid];if(!h)return;h.k.classList.remove('dn');h.h&&h.h.stop(now()+0.02);delete held[pid]}
 $('keys').addEventListener('pointerdown',function(e){e.preventDefault();unlock();var k=keyAt(e);if(k)on(e.pointerId,k)});
 addEventListener('pointermove',function(e){var h=held[e.pointerId];if(!h)return;var k=keyAt(e);if(k&&k!==h.k)on(e.pointerId,k)});
 function up(e){off(e.pointerId)}addEventListener('pointerup',up);addEventListener('pointercancel',up)})();
