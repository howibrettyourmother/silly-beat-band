/* ===== fun buttons: Surprise me!, drum fill, the big ENDING, Dad-listen dance party ===== */
function crash(t,dest){if(!AC)return;var s=AC.createBufferSource();s.buffer=noise();s.loop=true;var hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=4200;var pk=AC.createBiquadFilter();pk.type='peaking';pk.frequency.value=7500;pk.gain.value=6;
 var g=AC.createGain();s.connect(hp);hp.connect(pk);pk.connect(g);g.connect(dest||MASTER);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.32,t+0.004);g.gain.exponentialRampToValueAtTime(0.0008,t+1.8);s.start(t);s.stop(t+1.9)}
/* drum fill over the last quarter of the bar, 16th notes, getting louder; crash on the next downbeat */
function fillStep(t){var n=S.song.n,q=n/4;if(S.fillReq&&step===n-q){S.fillReq=false;S.fillOn=true}if(!S.fillOn)return false;
 var kit=P().kit,sub=n===8?2:1,sd=stepDur()/sub,k=step-(n-q);for(var j=0;j<sub;j++){var idx=k*sub+j,tot=q*sub,tt=t+j*sd,gn=0.45+0.55*idx/(tot-1||1),dest=rowBus('clap');
  if(kit==='chip'){chipDrum(idx%2?'clap':'kick',tt,dest)}else if(idx%3===2||idx===tot-1)smp(KITS[kit].clap||'snare',tt,{dest:dest,gain:gn*0.9});else smp(KITS[kit].kick||'kick',tt,{dest:dest,gain:gn*0.8,rate:[1.9,1.6,1.35,1.15][idx%4]})}
 if(step===n-1){S.fillOn=false;S.crashNext=true}return true}
function doFill(){unlock();if(!playing){start();}S.fillReq=true;var st=$('stage');if(st){st.classList.add('shake');setTimeout(function(){st.classList.remove('shake')},600)}toast(S.mode==='zoe'?'🥁 Drum roll!':'🥁 Fill coming up!')}
/* the big ending: kick + crash + low root + a held chord + cheer, then the band bows */
function endingHit(t){if(!AC)return;var p=P(),k=keyRoot(),sc=SCALES[p.scale],kit=p.kit;
 if(kit==='chip')chipDrum('kick',t,MASTER);else smp(KITS[kit].kick||'kick',t,{gain:1.1});crash(t,MASTER);crash(t+0.01,REVIN);
 if(S.mode!=='zoe')bass(kit==='chip'?'chip':'rock',24+12+k,t,1.4,MASTER);
 [0,2,4].forEach(function(d,j){var h=inst(S.song.inst,60+k+sc[d]+(j?0:12),t+j*0.012,0.75,BUS.show);h&&h.stop(t+1.8)});smp('cheer',t+0.08,{dest:BUS.show,gain:.55})}
function doEnding(){unlock();if(!playing){var t=now()+0.03;endingHit(t);VQ.push({t:t,end:true});setTimeout(finishEnding,1500);return}S.endNext=true;toast(S.mode==='zoe'?'🏁 The end is coming…':'🏁 Big finish at the end of this bar!')}
function finishEnding(){stop();kWithBeat=false;if(S.scr==='keys')buildKeys()}
function endVis(){var host=showOn?$('showBand'):$('stageL');(host?host.querySelectorAll('.cr'):[]).forEach(function(e,i){e.classList.remove('bow');void e.offsetWidth;e.classList.add('bow');setTimeout(function(){e.classList.remove('bow')},1600)});
 confetti(innerWidth*.25,innerHeight*.5,70);confetti(innerWidth*.75,innerHeight*.5,70);if(S.mode==='zoe')sparkle(innerWidth/2,innerHeight/2,60);var st=$('stage');if(st){st.classList.add('boom');setTimeout(function(){st.classList.remove('boom')},400)}}
/* 🎲 Surprise me! A random but musical song (two parts + a chain for big kid) */
function rb(p){return Math.random()<p}
function surprise(){unlock();var z=S.mode==='zoe',pid=rnd(PRESET_ORDER),P0=PRESETS[pid],n=z?8:16,was=JSON.stringify(S.song),sg=fromPreset(pid,S.mode);
 sg.bpm=z?rnd([96,108,120]):Math.max(84,Math.min(160,Math.round((P0.bpm+Math.random()*24-12)/2)*2));
 var insts=z?INST_Z:INST_A;sg.inst=rb(.6)?(z?P0.zinst:P0.inst):rnd(insts).id;
 var silly=['toot','chick','goat','burp'].sort(function(){return Math.random()-.5}).slice(0,z?0:(rb(.5)?2:1)),ml=memeList().filter(function(c){return c.id!=='__voice'||S.voice}),memeV=ml.length?ml.indexOf(rnd(ml))+1:0;
 function part(dense){var o=blankRows(S.mode,n),r16=function(i){return z?i*2:i};
  for(var i=0;i<n;i++){var j=r16(i);
   o.kick[i]=(j%8===0||(dense?rb(.3):rb(.18))&&j%2===0&&j%8!==4)?1:0;
   o.clap[i]=j%8===4?1:(j===15&&rb(.25)?1:0);
   o.hat[i]=dense?(z?1:(j%2===0||rb(.5)?1:0)):(j%2===0?(rb(.85)?1:0):0)}
  if(!z){var hv=rnd(['8','16','off']);if(!dense)for(i=0;i<n;i++)o.hat[i]=hv==='16'?1:hv==='off'?(i%4===2?1:0):(i%2===0?1:0);
   for(i=0;i<n;i++){o.bass[i]=o.kick[i]?(i===0?1:rnd([1,1,2,3,4])):(rb(.08)?3:0)}
   var v=rnd([1,3,5]);for(i=0;i<n;i++){if(i%2===0&&rb(dense?.7:.55)){v=Math.max(1,Math.min(6,v+rnd([-2,-1,-1,1,1,2])));o.mel[i]=v}}
   silly.forEach(function(id){var r=rowById(id),c=rb(.5)?1:2;for(var k2=0;k2<c;k2++)o[id][rnd([3,7,11,14,15])]=1+(Math.random()*r.st|0)});
   if(memeV&&rb(.6))o.meme[rnd([12,15])]=memeV}
  else{for(i=0;i<n;i++)o.mel[i]=rb(dense?.75:.55)?1:0;if(memeV&&rb(.7))o.meme[rnd([3,7])]=memeV}
  return o}
 sg.pats=[part(false)];if(!z){sg.pats.push(part(true));sg.chain=rnd([[0,0,1,0],[0,1,0,1],[0,0,1,1],[0,1]])}else sg.chain=[0];
 ROWS().forEach(function(r){sg.band[r.id]=['kick','clap','hat','bass','mel'].indexOf(r.id)>=0||silly.indexOf(r.id)>=0||(r.id==='meme'&&sg.pats.some(function(p){return p.meme.some(Boolean)}))?1:(z?1:0)});
 if(z)sg.zcRand=1;sg.ed=0;sg.name=genName();S.undo=was;stop();S.song=pats(sg);S.whole=true;kScale=null;applySong();save();
 smp('whee2',0,{dest:BUS.ui,gain:.6});setTimeout(function(){smp('sparkle',0,{dest:BUS.ui,gain:.6})},250);confetti(innerWidth/2,innerHeight*.35,70);if(z)sparkle(innerWidth/2,innerHeight*.4,50);
 toast('🎲 Surprise! "'+sg.name+'"');buildPBar();setTimeout(function(){start(true)},350)}
function undoSurprise(){if(!S.undo){undoVis();return}var o=JSON.parse(S.undo);S.undo=null;stop();S.song=pats(o);applySong();save();smp('pop',0,{dest:BUS.ui});toast('↩️ Back the way it was!');buildPBar();undoVis()}
/* v1.2: big toolbar buttons + the ➕ More menu */
var undoT=0;function undoVis(){var u=$('undoB');if(!u)return;u.style.display=S.undo?'':'none';clearTimeout(undoT);if(S.undo)undoT=setTimeout(function(){u.style.display='none'},12000)}
function mi(h,fn,cls){var b=document.createElement('button');b.className='mi'+(cls?' '+cls:'');b.innerHTML=h;b.addEventListener('click',function(){unlock();fn()});return b}
function buildMore(){var G=$('moreG'),z=S.mode==='zoe';G.innerHTML='';$('moreH').textContent=z?'More fun!':'More fun';
 G.appendChild(mi('<span class="emo">🥁</span>'+(z?'Drum roll!':'Drum fill')+(z?'':'<small>at the end of the bar</small>'),doFill));
 G.appendChild(mi('<span class="emo">🎲</span>'+(z?'Surprise!':'Surprise me')+(z?'':'<small>a brand-new song</small>'),surprise));
 G.appendChild(mi('<span class="emo">🏁</span>'+(z?'The End!':'Big ENDING')+(z?'':'<small>finish with a bang</small>'),doEnding,'end'));
 if(z)G.appendChild(mi('<span class="emo">📒</span>Stickers '+stickers().length,openStickers));
 else{G.appendChild(mi('<span class="emo">🔴</span>Record a tune<small>play keys into the song</small>',function(){goScr('keys');var r=$('keysTop').querySelector('.ib.rec');if(r&&!kRec)r.click()}));
  G.appendChild(mi('<span class="emo">🎬</span>Song Builder<small>parts A-D</small>',openSong))}
 G.appendChild(mi('<span class="emo">↩️</span>Undo'+(z?'':'<small>'+(S.undo?'take back the last magic':'nothing to undo')+'</small>'),function(){if(S.undo)undoSurprise()},S.undo?'':'dis'));
 $('shareM').style.display=z?'none':'';}
function openSong(){if(S.mode==='zoe')return;buildPBar();$('songDrawer').classList.add('on');document.body.classList.add('songOpen');fitDrawer();$('songB').classList.add('on');smp('whee2',0,{dest:BUS.ui,gain:.35,rate:1.3})}
function fitDrawer(){var d=$('songDrawer');if(d&&d.classList.contains('on'))$('gridWrap').style.paddingBottom=(d.getBoundingClientRect().height+8)+'px'}
addEventListener('resize',fitDrawer);
function closeSong(){$('gridWrap').style.paddingBottom='';$('songDrawer').classList.remove('on');document.body.classList.remove('songOpen');$('songB').classList.remove('on')}
$('songB').addEventListener('click',function(){unlock();if($('songDrawer').classList.contains('on'))closeSong();else openSong()});$('songX').addEventListener('click',closeSong);
$('moreB').addEventListener('click',function(){unlock();buildMore();open('moreOv');smp('pop',0,{dest:BUS.ui})});
$('moreOv').addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.mi'))setTimeout(function(){close('moreOv')},0)},true);
$('shareM').addEventListener('click',function(){$('shareB').click()});$('songsM').addEventListener('click',function(){$('saveB').click()});
$('fixB').addEventListener('click',function(){var b=$('fixB');b.classList.remove('zap');void b.offsetWidth;b.classList.add('zap');if(S.scr!=='beat')goScr('beat');fixBeat()});
$('undoB').addEventListener('click',function(){unlock();undoSurprise()});
$('ztB').addEventListener('click',function(){unlock();var T=[84,108,132],i=(T.indexOf(T.filter(function(t){return Math.abs(t-S.song.bpm)<12})[0])+1)%3;S.song.bpm=T[i];syncTempo();setBeatVar();save();smp('boing1',0,{dest:BUS.ui,gain:.5,rate:S.song.bpm/108})});
/* Dad, listen! dance party: spinning lights, a disco ball and a flashing dance floor (soft colour changes, never a hard strobe) */
var FLOOR=[];
function buildParty(){var P2=$('party');if(!P2)return;var F=$('floor');F.innerHTML='';FLOOR=[];for(var i=0;i<24;i++){var d=document.createElement('i');F.appendChild(d);FLOOR.push(d)}}
var PCOLS_A=['#ff4fa3','#ffd23f','#2ee6d6','#a78bfa','#4ade80','#fb923c'],PCOLS_Z=['#ff8ad8','#fff36b','#b388ff','#ffffff','#ffb3dc','#7cf5ff'];
function partyStep(q){if(!showOn||!FLOOR.length)return;var cols=S.mode==='zoe'?PCOLS_Z:PCOLS_A;
 if(q.hits.indexOf('kick')>=0||q.step%4===0)FLOOR.forEach(function(d,i){d.style.background=(Math.random()<.45)?cols[(Math.random()*cols.length)|0]:'transparent'});
 if(q.hits.indexOf('clap')>=0){var s=$('show');s.classList.remove('flash');void s.offsetWidth;s.classList.add('flash')}
 if(q.step===0){var b=$('ball');if(b){b.classList.remove('hit');void b.offsetWidth;b.classList.add('hit')}}
 if(S.mode==='zoe'&&q.hits.length&&Math.random()<.35){var h=document.createElement('span');h.className='heart emo';h.textContent=rnd(['💖','💗','💕','🌸','✨']);h.style.left=(10+Math.random()*80)+'%';$('party').appendChild(h);setTimeout(function(){h.remove()},2200)}}
/* ===== 🪄 Fix my beat (big kid) / ✨ Make it pretty (Zoe): tidy, never wipe ===== */
function fixRows(o,n,z){var ch=[],SIL=['toot','chick','goat','burp','voice','meme'];function set(id,i,v){if(!o[id]||o[id][i]===v)return;o[id][i]=v;ch.push(id+':'+i)}
 function cnt(id){return o[id]?o[id].filter(Boolean).length:0}
 if(!z){
  /* 1. snap stray off-beat notes (tune, bass, silly rows) onto the nearest free 8th-note step */
  ['mel','bass'].concat(SIL).forEach(function(id){var a=o[id];if(!a)return;var on=0,off=0;a.forEach(function(v,i){if(v){if(i%2)off++;else on++}});if(!(off>0&&off*3<=on))return;for(var i=1;i<n;i+=2){if(!a[i])continue;var t=!a[i-1]?i-1:(i+1<n&&!a[i+1]?i+1:-1);if(t>=0&&cnt(id)<=n/2){var v=a[i];set(id,i,0);set(id,t,v)}}});
  /* 2. thin clutter: one silly sound per step, and no row with almost every step */
  for(var i=0;i<n;i++){var on=SIL.filter(function(id){return o[id]&&o[id][i]});on.slice(1).forEach(function(id){var v=o[id][i];set(id,i,0);for(var d=2;d<n;d+=2){var t=(i+d)%n;if(!SIL.some(function(x){return o[x]&&o[x][t]})){set(id,t,v);break}}})}
  SIL.forEach(function(id){if(cnt(id)>5){var k=0;for(var i=0;i<n;i++)if(o[id][i]){k++;if(k>5&&k%2===0)set(id,i,0)}}});
  /* 3. clashing pitches: a tune note a step away from the bass note under it moves to a friendly note; giant leaps get smaller */
  var sc=SCALES[P().scale],root=P().prog[0];
  for(i=0;i<n;i++){var mv=o.mel[i],bv=o.bass[i];if(mv&&bv){var mp=sc[(mv-1)%6]%12,bp=(root+BASSDEG[(bv-1)%4]+120)%12,iv=(mp-bp+12)%12;if(iv===1||iv===2||iv===10||iv===11){var nv=mv<6?mv+1:mv-1,np=sc[(nv-1)%6]%12,iv2=(np-bp+12)%12;if(!(iv2===1||iv2===2||iv2===10||iv2===11))set('mel',i,nv)}}}
  var last=0;for(i=0;i<n;i++){if(!o.mel[i])continue;if(last&&Math.abs(o.mel[i]-last)>3)set('mel',i,last+(o.mel[i]>last?2:-2));last=o.mel[i]}}
 /* 4. a solid backbone if it is missing: kick on 1 (and 3), clap on 2 and 4 */
 var bt=n/4;if(!o.kick[0])set('kick',0,1);if(cnt('kick')<2)set('kick',bt*2,1);
 if(cnt('clap')<1||!o.clap[bt]&&!o.clap[bt*3]){set('clap',bt,1);set('clap',bt*3,1)}
 if(z){if(cnt('hat')<2)for(i=0;i<n;i+=2)set('hat',i+1,1);if(cnt('mel')<2)[0,2,4,6].forEach(function(j){if(j<n)set('mel',j,1)});if(cnt('meme')>2){var k2=0;for(i=0;i<n;i++)if(o.meme[i]&&++k2>2)set('meme',i,0)}}
 else if(cnt('hat')===0&&cnt('kick')+cnt('clap')<6)for(i=0;i<n;i+=2)set('hat',i,1);
 return ch}
function fixBeat(){unlock();var z=S.mode==='zoe',was=JSON.stringify(S.song),ch=fixRows(S.song.rows,S.song.n,z);
 ['kick','clap'].concat(z?['hat','mel']:[]).forEach(function(id){if(S.song.rows[id].some(Boolean)&&S.song.band[id]!==1)S.song.band[id]=1});
 wandFx(ch);if(ch.length){S.undo=was;ROWS().forEach(function(r){refreshRow(r.id)});buildStage();buildPBar();save()}
 ch.forEach(function(k){var p=k.split(':'),c=cellEls[p[0]]&&cellEls[p[0]][+p[1]];if(c){c.classList.remove('magic');void c.offsetWidth;c.classList.add('magic')}});
 toast(z?(ch.length?'✨ So pretty!':'✨ Already super pretty!'):(ch.length?'🪄 Ta-da! Beat polished!':'🪄 Your beat already rocks!'));if(!playing)setTimeout(function(){start()},700)}
function wandFx(ch){var g=$('grid').getBoundingClientRect(),w=document.createElement('div');w.className='wand emo';w.textContent='🪄';document.body.appendChild(w);var t0=performance.now(),D=900;
 (function mv(){var k=Math.min(1,(performance.now()-t0)/D),x=g.left+g.width*k,y=g.top+g.height*(0.5-0.35*Math.sin(k*Math.PI*2));w.style.left=x+'px';w.style.top=y+'px';w.style.transform='rotate('+(-30+60*k)+'deg)';sparkle(x,y,4);if(k<1)requestAnimationFrame(mv);else{w.remove();sparkle(g.left+g.width/2,g.top+g.height/2,50);confetti(g.left+g.width/2,g.top+g.height/2,30)}})();
 if(!AC)return;var t=now()+0.02;smp('sparkle',t,{dest:BUS.ui,gain:.8});[0,4,7,12,16,19,24].forEach(function(d,j){var h=inst('bells',72+d,t+j*0.07,0.5,BUS.ui);h&&h.stop(t+j*0.07+0.3)});smp('boing1',t+0.6,{dest:BUS.ui,gain:.35,rate:1.4})}
/* ===== Zoe: a sticker for every song she finishes, a sticker book, floating hearts ===== */
var STICKERS=['🦄','🌈','🍓','🧁','🌸','⭐','🦋','🍭','🎀','👑','🐬','🐞','🍩','🌻','🐱','🐰','🦩','🍦','💎','🐣','🌙','🎈','🐼','🍒'];
function stickers(){return LS.get('stickers',[])}
function awardSticker(){var have=stickers(),left=STICKERS.filter(function(x){return have.indexOf(x)<0}),e=rnd(left.length?left:STICKERS);if(left.length)have.push(e);LS.set('stickers',have);
 $('stickerE').textContent=e;$('stickerT').textContent=left.length?'You got a sticker! ('+have.length+'/'+STICKERS.length+')':'Super star! All the stickers!';var w=$('stickerWin');w.classList.remove('on');void w.offsetWidth;w.classList.add('on');
 smp('sparkle',0,{dest:BUS.show,gain:.8});[0,4,7,12].forEach(function(d,j){var h=inst('bells',79+d,now()+0.15+j*0.09,0.5,BUS.show);h&&h.stop(now()+0.5+j*0.09)});sparkle(innerWidth/2,innerHeight*.55,70);buildPBar()}
function openStickers(){var G=$('stg'),have=stickers();G.innerHTML='';STICKERS.forEach(function(e){var s=document.createElement('span');s.className='emo'+(have.indexOf(e)<0?' no':'');s.textContent=e;G.appendChild(s)});open('stickOv');smp('pop',0,{dest:BUS.ui})}
function buildFloat(){var F=$('zfloat');if(!F||F.childNodes.length)return;for(var i=0;i<9;i++){var h=document.createElement('i');h.className='emo';h.textContent=['💖','🌸','✨','💗','🦋','⭐'][i%6];h.style.left=(i*11+3)+'%';h.style.animationDuration=(14+i*2.3)+'s';h.style.animationDelay=(-i*3.1)+'s';h.style.fontSize=(24+(i%3)*10)+'px';F.appendChild(h)}}
(function(){var last=0;addEventListener('pointermove',function(e){if(S.mode!=='zoe'||!e.buttons&&e.pointerType==='mouse')return;var t=performance.now();if(t-last<45)return;last=t;sparkle(e.clientX,e.clientY,2)},{passive:true})})();
