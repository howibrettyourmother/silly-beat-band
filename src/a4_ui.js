/* ===== UI: stage, grid, top bar, overlays ===== */
var GROOVE={kick:'1000100010001000',clap:'0000100000001000',hat:'1010101010101010',bass:'1000100010003000',mel:'1000300040005000',toot:'0000000000000001',chick:'0000000010000000',goat:'0000000000001000',burp:'0000000000000001',voice:'1000000010000000',meme:'0000000000001000'};
var memeSel={alex:1,zoe:1},cellEls={},crEls={},hdrEls={},dirty=0;
function toast(t){var e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove('on')},1700)}
function save(){if(S.guest)return;clearTimeout(dirty);dirty=setTimeout(function(){LS.set('cur_'+S.mode,encSong(S.song,S.mode))},300)}
function setBeatVar(){var b=(60/S.song.bpm)+'s';document.documentElement.style.setProperty('--beat',b)}
/* ---------- stage ---------- */
function buildStage(){var L=$('stageL'),B=$('bench');L.querySelectorAll('.cr').forEach(function(e){e.remove()});B.innerHTML='';crEls={};
 var on=ROWS().filter(function(r){return S.song.band[r.id]});
 on.forEach(function(r,i){var d=document.createElement('div');d.className='cr'+(S.song.band[r.id]===2?' mute':'');d.style.left=((i+0.5)/on.length*100)+'%';
  d.innerHTML='<span class="zz emo">💤</span><span class="bd emo">'+r.e+'</span><span class="nm">'+r.n+'</span>';d.dataset.id=r.id;L.appendChild(d);crEls[r.id]=d;dragable(d,r,true)});
 ROWS().filter(function(r){return !S.song.band[r.id]}).forEach(function(r){var d=document.createElement('div');d.className='bch';d.innerHTML='<span class="bd emo">'+r.e+'</span><span class="nm">'+r.n+'</span>';d.dataset.id=r.id;B.appendChild(d);dragable(d,r,false)});
 $('hint').textContent=!on.length?'Tap a critter in the waiting room to start the band!':S.mode==='zoe'?'Tap the squares to make music! 🎶':'Drag critters onto the stage · tap one to hush it';
 ROWS().forEach(function(r){var row=hdrEls[r.id];if(!row)return;row.parentNode.classList.toggle('off',S.song.band[r.id]!==1);row.classList.toggle('zz',S.song.band[r.id]===2)})}
function joinBand(id,quiet){var was=S.song.band[id];S.song.band[id]=1;var a=S.song.rows[id];if(!a.some(Boolean)){var g=GROOVE[id]||'1000100010001000';for(var i=0;i<S.song.n;i++){var c=g.charAt(S.song.n===16?i:i*2);a[i]=id==='meme'&&c==='1'?memeSel[S.mode]:(parseInt(c,16)||0)}refreshRow(id)}
 buildStage();if(!quiet&&!was){var r=rowById(id);toast(r.e+' '+r.n+' joined the band!');preview(r);var e=crEls[id];if(e)hop(e)}save()}
function dragable(el,r,onStage){var sx,sy,moved=false,ghost=null,pid=null;
 el.addEventListener('pointerdown',function(e){e.preventDefault();unlock();pid=e.pointerId;sx=e.clientX;sy=e.clientY;moved=false;
  function mv(ev){if(ev.pointerId!==pid)return;if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>12){moved=true;ghost=document.createElement('div');ghost.className='drag emo';ghost.textContent=r.e;document.body.appendChild(ghost);el.style.opacity='.3'}
   if(moved){ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px';var st=$('stageL').getBoundingClientRect();$('stage').classList.toggle('drop',!onStage&&inR(ev,st))}}
  function up(ev){if(ev.pointerId!==pid)return;removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);$('stage').classList.remove('drop');el.style.opacity='';
   if(ghost){ghost.remove();ghost=null}
   if(!moved){if(onStage){S.song.band[r.id]=S.song.band[r.id]===2?1:2;el.classList.toggle('mute',S.song.band[r.id]===2);if(S.song.band[r.id]===1){preview(r);hop(el)}else smp('pop',0,{dest:BUS.ui});
     hdrEls[r.id].parentNode.classList.toggle('off',S.song.band[r.id]!==1);hdrEls[r.id].classList.toggle('zz',S.song.band[r.id]===2);save()}else joinBand(r.id);return}
   var stR=$('stageL').getBoundingClientRect(),bR=$('bench').getBoundingClientRect();
   if(onStage&&inR(ev,bR)){S.song.band[r.id]=0;smp('whee2',0,{dest:BUS.ui,gain:.5});buildStage();save()}
   else if(!onStage&&inR(ev,stR))joinBand(r.id);
   else if(!onStage&&inR(ev,$('grid').getBoundingClientRect()))joinBand(r.id)}
  addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)})}
function inR(e,r){return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom}
function hop(el){el.classList.remove('hit');void el.offsetWidth;el.classList.add('hit');clearTimeout(el._h);el._h=setTimeout(function(){el.classList.remove('hit')},300)}
function noteFx(el,c){if(!el)return;var r=el.getBoundingClientRect(),host=el.parentNode.getBoundingClientRect(),n=document.createElement('span');n.className='note emo';
 n.textContent=c||['🎵','🎶','✨','💥'][Math.random()*4|0];n.style.left=(r.left-host.left+r.width/2-10)+'px';n.style.top=(r.top-host.top)+'px';n.style.setProperty('--dx',((Math.random()-.5)*60)+'px');el.parentNode.appendChild(n);setTimeout(function(){n.remove()},1000)}
/* ---------- grid ---------- */
function buildGrid(){var G=$('grid'),n=S.song.n;G.innerHTML='';cellEls={};hdrEls={};
 var ch=$('colhead');ch.innerHTML='';var lab16=['1','e','&','a','2','e','&','a','3','e','&','a','4','e','&','a'];
 for(var i=0;i<n;i++){var sp=document.createElement('span');sp.textContent=n===8?String(i+1):lab16[i];if(n===16&&i%4===0&&i)sp.style.marginLeft='6px';ch.appendChild(sp)}
 ROWS().forEach(function(r){var row=document.createElement('div');row.className='row';row.style.setProperty('--rc',r.c);
  var h=document.createElement('button');h.className='rh';var pk='';
  if(r.k==='meme'){var ml=memeList(),c=ml[(memeSel[S.mode]-1)%Math.max(1,ml.length)];pk='<span class="pick emo">'+(c?c.emoji:'🤪')+'</span>'}
  if(r.k==='voice')pk='<span class="pick emo">🎤</span>';
  h.innerHTML='<span class="emo">'+r.e+'</span><span><b>'+(S.mode==='zoe'?r.d:r.n)+'</b>'+(S.mode==='zoe'?'':'<small>'+r.d+'</small>')+'</span>'+pk;
  h.addEventListener('pointerdown',function(e){e.preventDefault();unlock();if(r.k==='meme'){openPick(r);return}if(r.k==='voice'&&e.target.classList.contains('pick')){goScr('studio');return}preview(r);var ce=crEls[r.id];if(ce)hop(ce)});
  row.appendChild(h);hdrEls[r.id]=h;cellEls[r.id]=[];
  for(var i=0;i<n;i++){var c2=document.createElement('div');c2.className='cell'+((n===16?Math.floor(i/4):Math.floor(i/2))%2?' g':'')+(n===16&&i%4===0&&i?' b4':'');c2.dataset.r=r.id;c2.dataset.i=i;row.appendChild(c2);cellEls[r.id].push(c2)}
  G.appendChild(row)});
 ROWS().forEach(function(r){refreshRow(r.id)});buildStage()}
function cellFace(r,v){if(!v)return '';if(r.k==='meme'){var ml=memeList(),c=ml[(v-1)%Math.max(1,ml.length)];return '<span class="ce emo">'+(c?c.emoji:'❓')+'</span>'}
 if(r.k==='zmel')return '<span class="ce emo">'+(v>=2?(ZPICS[NOTE_NAMES[SCALES.major[(v-2)%5]]]||'⭐'):'✨')+'</span>';if(r.k==='voice')return '<span class="ce emo">🗣️</span>';
 if(r.st>1)return '<i style="--lv:'+(v-1)*(5/(r.st-1||1))/1+'"></i>';if(S.mode==='zoe')return '<span class="ce emo">'+r.e+'</span>';return ''}
function refreshCell(r,i){var c=cellEls[r.id][i],v=S.song.rows[r.id][i];c.classList.toggle('on',!!v);c.innerHTML=cellFace(r,v);if(v&&r.st>1)c.style.filter='hue-rotate('+((v-1)*22)+'deg)';else c.style.filter=''}
function refreshRow(id){var r=rowById(id);if(!r||!cellEls[id])return;for(var i=0;i<S.song.n;i++)refreshCell(r,i)}
function nextVal(r,v){if(r.k==='meme'){var s=memeSel[S.mode];return v===s?0:s}return v>r.st?0:(v+1)%(r.st+1)}
function preview(r,v,i){if(!AC)return;unlock();v=v||1;var t=AC.currentTime+0.005;trigger(r,v,t,0,i==null?0:i,BUS.ui)}
(function(){var paint=null;
 function at(e){var el=document.elementFromPoint(e.clientX,e.clientY);return el&&el.closest?el.closest('.cell'):null}
 function setC(c,val){var r=rowById(c.dataset.r),i=+c.dataset.i;if(S.song.rows[r.id][i]===val)return;S.song.rows[r.id][i]=val;refreshCell(r,i);c.classList.remove('tap');void c.offsetWidth;c.classList.add('tap');
  if(val){if(S.song.band[r.id]!==1){if(S.song.band[r.id]===2){S.song.band[r.id]=1;buildStage()}else joinBand(r.id,true)}if(!playing)preview(r,val,i);else if(Math.random()<.5)preview(r,val,i);var ce=crEls[r.id];if(ce)hop(ce);
   if(S.mode==='zoe'){var b=c.getBoundingClientRect();sparkle(b.left+b.width/2,b.top+b.height/2,8)}}save()}
 document.addEventListener('pointerdown',function(e){var c=e.target.closest&&e.target.closest('.cell');if(!c)return;e.preventDefault();unlock();var r=rowById(c.dataset.r);paint={r:r.id,v:nextVal(r,S.song.rows[r.id][+c.dataset.i]),id:e.pointerId};setC(c,paint.v)});
 addEventListener('pointermove',function(e){if(!paint||e.pointerId!==paint.id)return;var c=at(e);if(c&&c.dataset.r===paint.r)setC(c,paint.v)});
 addEventListener('pointerup',function(e){if(paint&&e.pointerId===paint.id)paint=null});addEventListener('pointercancel',function(){paint=null})})();
/* meme / sound picker */
function openPick(r){var ml=memeList(),G=$('pickG');G.innerHTML='';G.classList.toggle('many',ml.length>16);$('pickH').textContent=S.mode==='zoe'?'Pick a silly sound!':'Pick a meme sound';
 if(!ml.length){G.innerHTML='<div>Sounds are still loading…</div>'}
 ml.forEach(function(c,i){var b=document.createElement('button');b.className='pc'+(memeSel[S.mode]===i+1?' on':'');b.innerHTML='<span class="emo">'+c.emoji+'</span>'+c.label;
  b.addEventListener('click',function(){memeSel[S.mode]=i+1;smp('meme:'+c.id,0,{dest:BUS.ui});G.querySelectorAll('.pc').forEach(function(x){x.style.outline=''});b.style.outline='4px solid var(--acc)';
   var h=hdrEls[r.id].querySelector('.pick');if(h)h.textContent=c.emoji;LS.set('memeSel',memeSel)});G.appendChild(b)});
 G.querySelectorAll('.pc').forEach(function(x,i){if(i===memeSel[S.mode]-1)x.style.outline='4px solid var(--acc)'});open('pickOv')}
/* ---------- visuals ---------- */
var lastStep=-1;
function frame(){requestAnimationFrame(frame);if(AC&&VQ.length){var ct=AC.currentTime-(AC.outputLatency||0);while(VQ.length&&VQ[0].t<=ct){var q=VQ.shift();onStep(q)}}fxTick()}
function onStep(q){if(q.end){endVis();return}var n=S.song.n;pbarStep(q);if(typeof partyStep==="function")partyStep(q);
 if(lastStep>=0)ROWS().forEach(function(r){var c=cellEls[r.id]&&cellEls[r.id][lastStep];if(c)c.classList.remove('ph')});
 ROWS().forEach(function(r){var c=cellEls[r.id]&&cellEls[r.id][q.step];if(c)c.classList.add('ph')});
 var hs=$('colhead').children;if(hs[lastStep])hs[lastStep].classList.remove('cur');if(hs[q.step])hs[q.step].classList.add('cur');lastStep=q.step;
 q.hits.forEach(function(id){var e=crEls[id];if(e){hop(e);if(Math.random()<.45)noteFx(e,id==='toot'?'💨':id==='burp'?'🫧':id==='goat'?'🎤':null)}var se=showEls[id];if(se){hop(se);if(Math.random()<.5)noteFx(se)}});
 if(q.hits.indexOf('kick')>=0){var st=$('stage');st.classList.add('boom');setTimeout(function(){st.classList.remove('boom')},90)}
 if(S.scr==='keys'&&q.step%(n/4)===0){var sg=$('singer');if(sg)hop(sg)}
 if(showOn){var tot=showBars*n,done=Math.min(tot,barsPlayedVis*n+q.step+1);$('showBar').firstChild.style.width=(done/tot*100)+'%';if(q.step===n-1)barsPlayedVis++;if(q.hits.length>2&&Math.random()<.3)confetti(innerWidth/2,innerHeight*.45,12)}}
function uiPlay(on){var b=$('play');b.classList.toggle('on',on);b.innerHTML=on?'<span class="emo">⏹️</span>Stop':'<span class="emo">▶️</span>Play';$('stage').classList.toggle('live',on);$('show').classList.toggle('live',on);
 if(!on){ROWS().forEach(function(r){(cellEls[r.id]||[]).forEach(function(c){c.classList.remove('ph')})});[].forEach.call($('colhead').children,function(s){s.classList.remove('cur')});lastStep=-1}}
/* ---------- particles (confetti + sparkles) ---------- */
var PT=[],fxc=$('fx'),fx2=fxc.getContext('2d');
function fitFx(){var d=Math.min(2,devicePixelRatio||1);fxc.width=innerWidth*d;fxc.height=innerHeight*d;fxc.style.width=innerWidth+'px';fxc.style.height=innerHeight+'px';fx2.setTransform(d,0,0,d,0,0)}
addEventListener('resize',fitFx);fitFx();
var CC=['#ff4fa3','#ffd23f','#2ee6d6','#a78bfa','#4ade80','#fb923c','#fff'];
function confetti(x,y,n){for(var i=0;i<n;i++)PT.push({k:0,x:x,y:y,vx:(Math.random()-.5)*14,vy:-Math.random()*13-4,r:Math.random()*6.28,vr:(Math.random()-.5)*.4,w:6+Math.random()*7,h:4+Math.random()*5,c:CC[Math.random()*CC.length|0],l:1})}
function sparkle(x,y,n){for(var i=0;i<n;i++){var a=Math.random()*6.28,s=1+Math.random()*4;PT.push({k:1,x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,r:0,vr:.1,w:5+Math.random()*8,c:['#fff','#fff36b','#ff8ad8','#b388ff','#7cf5ff'][Math.random()*5|0],l:1})}}
function star(c,x,y,r){c.beginPath();for(var i=0;i<8;i++){var a=i*Math.PI/4,rr=i%2?r*.38:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill()}
function fxTick(){if(!PT.length&&!fxTick.had)return;fx2.clearRect(0,0,innerWidth,innerHeight);fxTick.had=PT.length>0;
 for(var i=PT.length-1;i>=0;i--){var p=PT[i];p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;if(p.k===0){p.vy+=.35;p.vx*=.99;p.l-=.006}else{p.vy+=.05;p.l-=.025}
  if(p.l<=0||p.y>innerHeight+30){PT.splice(i,1);continue}fx2.globalAlpha=Math.min(1,p.l*2);fx2.fillStyle=p.c;
  if(p.k===0){fx2.save();fx2.translate(p.x,p.y);fx2.rotate(p.r);fx2.fillRect(-p.w/2,-p.h/2,p.w,p.h*Math.abs(Math.cos(p.r*2)));fx2.restore()}else star(fx2,p.x,p.y,p.w*p.l)}fx2.globalAlpha=1}
document.addEventListener('pointerdown',function(e){if(S.mode==='zoe')sparkle(e.clientX,e.clientY,6)},true);
/* ---------- overlays ---------- */
function open(id){$(id).classList.add('on')}function close(id){$(id).classList.remove('on')}
document.querySelectorAll('.ov .x').forEach(function(x){x.addEventListener('click',function(){var o=x.closest('.ov');if(o.id==='show')endShow();else close(o.id)})});
document.querySelectorAll('.ov').forEach(function(o){o.addEventListener('pointerdown',function(e){if(e.target===o&&o.id!=='show'&&o.id!=='splash'&&o.id!=='recvOv')close(o.id)})});
