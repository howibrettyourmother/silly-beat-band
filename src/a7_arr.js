/* ===== Song Builder bar: parts A-D + the song chain (big kid), recording Magic Keys into the song ===== */
var PCOL=['#ff5d5d','#38bdf8','#4ade80','#fb923c'],PL='ABCD';
function setEd(i,quiet){S.song.ed=Math.max(0,Math.min(i,S.song.pats.length-1));S.song.rows=S.song.pats[S.song.ed];ROWS().forEach(function(r){refreshRow(r.id)});buildPBar();if(!quiet)smp('pop',0,{dest:BUS.ui,gain:.6,rate:1+S.song.ed*.12})}
function pb(cls,html,fn){var b=document.createElement('button');b.className='pb '+cls;b.innerHTML=html;b.addEventListener('click',function(e){unlock();fn(e,b)});return b}
function buildPBar(){var B=$('pbar');if(!B)return;B.innerHTML='';if(!S.song)return;pats(S.song);
 if(S.mode==='zoe'){if(typeof buildZBar==="function")buildZBar(B);return}
 var L=document.createElement('span');L.className='pbl';L.textContent='Parts';B.appendChild(L);
 S.song.pats.forEach(function(pt,i){var b=pb('part'+(i===S.song.ed?' on':''),PL[i],function(){S.whole=false;setEd(i);toast('🔁 Looping part '+PL[i])});b.style.setProperty('--pc',PCOL[i]);b.dataset.p=i;B.appendChild(b)});
 if(S.song.pats.length<4)B.appendChild(pb('add','＋',function(){var n=S.song.pats.length,cp=JSON.parse(JSON.stringify(S.song.rows));S.song.pats.push(cp);if(S.song.chain.length<8)S.song.chain.push(n);S.whole=true;setEd(n,true);
  smp('sparkle',0,{dest:BUS.ui,gain:.7});toast('✨ Part '+PL[n]+' is a copy of '+PL[n-1]+'. Change it up!');save()}));
 if(S.song.pats.length>1)B.appendChild(pb('del','🗑️',function(e,b){if(!b.dataset.sure){b.dataset.sure=1;b.textContent='❓';toast('Tap again to throw away part '+PL[S.song.ed]);return}
  var k=S.song.ed;S.song.pats.splice(k,1);S.song.chain=S.song.chain.filter(function(x){return x!==k}).map(function(x){return x>k?x-1:x});pats(S.song);setEd(Math.max(0,k-1),true);smp('whee2',0,{dest:BUS.ui,gain:.5});save()}));
 var L2=document.createElement('span');L2.className='pbl';L2.textContent='Song';L2.style.marginLeft='10px';B.appendChild(L2);
 var ch=document.createElement('div');ch.id='chain';S.song.chain.forEach(function(p,j){var c=pb('cs',PL[p],function(){S.song.chain[j]=(S.song.chain[j]+1)%S.song.pats.length;buildPBar();smp('click',0,{dest:BUS.ui,gain:.6});save()});c.style.setProperty('--pc',PCOL[p]);c.dataset.j=j;ch.appendChild(c)});B.appendChild(ch);
 if(S.song.chain.length<8&&S.song.pats.length>1)B.appendChild(pb('mini','＋',function(){S.song.chain.push(S.song.ed);S.whole=true;buildPBar();save()}));
 if(S.song.chain.length>1)B.appendChild(pb('mini','－',function(){S.song.chain.pop();buildPBar();save()}));
 if(S.song.chain.length>1)B.appendChild(pb('whole'+(songMode()?' on':''),'🎬 Whole song',function(){S.whole=!songMode();if(S.whole){ci=0}buildPBar();toast(S.whole?'🎬 Playing the whole song':'🔁 Looping part '+PL[S.song.ed])}));
 var sp=document.createElement('span');sp.style.flex='1';B.appendChild(sp);if(typeof buildFunBtns==="function")buildFunBtns(B)}
function pbarStep(q){var B=$('pbar');if(!B)return;if(songMode()&&q.pat!==S.song.ed&&q.pat<S.song.pats.length)setEd(q.pat,true);
 B.querySelectorAll('.cs').forEach(function(c){c.classList.toggle('cur',songMode()&&+c.dataset.j===q.ci)});B.querySelectorAll('.part').forEach(function(c){c.classList.toggle('cur',+c.dataset.p===q.pat)})}
/* Magic Keys recording: notes snap to the nearest beat step that was heard and land in Birdie's (or Unicorn's) row */
var kRec=false;
function keyRecord(i){if(!kRec||!playing||!AC)return;var tgt=AC.currentTime-(AC.outputLatency||0)-0.03,best=null,bd=1e9;RECQ.forEach(function(q){var d=Math.abs(q.t-tgt);if(d<bd){bd=d;best=q}});
 if(!best||bd>stepDur()*0.75)return;var z=S.mode==='zoe',d=i%5,o=Math.floor(i/5),v=z?i+2:(o>=1&&d===0?6:d+1);var pt=S.song.pats[best.pat]||S.song.rows;pt.mel[best.step]=v;
 if(best.t>AC.currentTime)recSkip={pat:best.pat,step:best.step};if(S.song.band.mel!==1){S.song.band.mel=1}if(best.pat===S.song.ed&&cellEls.mel)refreshCell(rowById('mel'),best.step);save()}
