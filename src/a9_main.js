/* ===== screens, songs, sharing, Dad listen, modes, boot ===== */
function goScr(s){if(s!=='keys')kRec=false;S.scr=s;['beat','keys','studio'].forEach(function(x){$('s-'+x).classList.toggle('on',x===s)});document.querySelectorAll('#tabs .tb').forEach(function(b){b.classList.toggle('on',b.dataset.s===s)});
 if(s==='keys'){buildKeys();kWithBeat=playing;var wb=$('keysTop').querySelectorAll('.ib');}if(s==='studio')buildStudio();smp('click',0,{dest:BUS.ui,gain:.6})}
document.querySelectorAll('#tabs .tb').forEach(function(b){b.addEventListener('click',function(){unlock();goScr(b.dataset.s)})});
$('play').addEventListener('click',function(){unlock();if(playing){stop();kWithBeat=false}else start()});
$('bpm').addEventListener('input',function(){S.song.bpm=+this.value;$('bpmv').textContent=this.value;setBeatVar();save()});
document.querySelectorAll('#ztempo .tb').forEach(function(b){b.addEventListener('click',function(){unlock();S.song.bpm=+b.dataset.t;syncTempo();setBeatVar();save();smp('boing1',0,{dest:BUS.ui,gain:.5,rate:S.song.bpm/108})})});
function syncTempo(){$('bpm').value=S.song.bpm;$('bpmv').textContent=S.song.bpm;document.querySelectorAll('#ztempo .tb').forEach(function(b){b.classList.toggle('on',Math.abs(+b.dataset.t-S.song.bpm)<12)})}
/* presets */
function buildPresets(){var G=$('pg');G.innerHTML='';PRESET_ORDER.forEach(function(id){var p=PRESETS[id],b=document.createElement('button');b.className='pc';b.innerHTML='<span class="emo">'+p.e+'</span>'+(S.mode==='zoe'?p.zn:p.n)+'<small>'+(S.mode==='zoe'?'':p.bpm+' beats a minute')+'</small>';
 b.addEventListener('click',function(){unlock();var was=playing;stop();var nm=S.song.name;S.song=fromPreset(id,S.mode);kScale=null;applySong();close('presetOv');confetti(innerWidth/2,innerHeight/2,60);smp('sparkle',0,{dest:BUS.ui});setTimeout(start,250);save()});G.appendChild(b)})}
$('presetB').addEventListener('click',function(){unlock();buildPresets();open('presetOv')});
$('clearB').addEventListener('click',function(){stop();var p=S.song.p,b=S.song.bpm,ins=S.song.inst,band=S.song.band;S.song.pats=[blankRows(S.mode,S.song.n)];S.song.chain=[0];S.song.ed=0;pats(S.song);S.song.name='';applySong();close('presetOv');smp('whee2',0,{dest:BUS.ui,gain:.6});save()});
function applySong(){pats(S.song);setBeatVar();syncTempo();buildGrid();buildPBar();if(S.scr==='keys')buildKeys()}
/* names */
var NA=[['Funky','Stinky','Rocket','Turbo','Wobbly','Mega','Sneaky','Cosmic','Silly','Giant','Spicy','Ninja'],['Goat','Frog','Burp','Banana','Robot','Dino','Taco','Pickle','Noodle','Monster','Hippo','Chicken'],['Party','Jam','Boogie','Groove','Blast','Dance','Song','Remix','Stomp','Rap']];
var NZ=[['Sparkle','Rainbow','Princess','Sunny','Glitter','Fluffy','Pink','Happy','Twinkle','Magic'],['Bunny','Kitty','Unicorn','Puppy','Butterfly','Cupcake','Star','Piggy','Fairy'],['Song','Dance','Party','Twirl','Twinkle']];
function rnd(a){return a[Math.random()*a.length|0]}function genName(){var N=S.mode==='zoe'?NZ:NA;return rnd(N[0])+' '+rnd(N[1])+' '+rnd(N[2])}
var zNames=[];
function buildNameRow(){var R=$('nmrow');R.innerHTML='';
 if(S.mode==='zoe'){zNames=[S.song.name||genName(),genName(),genName()];zNames.forEach(function(n,i){var b=document.createElement('button');b.className='zn'+(i===0?' on':'');b.textContent=n;b.addEventListener('click',function(){R.querySelectorAll('.zn').forEach(function(x){x.classList.remove('on')});b.classList.add('on');S.song.name=n;smp('pop',0,{dest:BUS.ui})});R.appendChild(b)});S.song.name=zNames[0]}
 else{R.innerHTML='<input id="nameIn" maxlength="30" placeholder="Name your song" autocomplete="off" spellcheck="false">';$('nameIn').value=S.song.name||genName()}
 var d=document.createElement('button');d.className='zn';d.textContent='🎲';d.title='new name';d.addEventListener('click',function(){if(S.mode==='zoe')buildNameRow();else $('nameIn').value=genName();smp('boing1',0,{dest:BUS.ui,gain:.5})});R.appendChild(d)}
function curName(){if(S.mode!=='zoe'&&$('nameIn'))S.song.name=$('nameIn').value.replace(/[^\w !?'&-]/g,'').trim().slice(0,30)||genName();return S.song.name}
function songs(){return LS.get('songs',[])}
function buildSongs(){var L=$('songList'),a=songs();L.innerHTML=a.length?'':'<div style="text-align:center;opacity:.8">No saved songs yet. Make a beat and tap 💾!</div>';
 a.slice().reverse().forEach(function(s){var r=document.createElement('div');r.className='sr';r.innerHTML='<span class="emo" style="font-size:26px">'+(s.mode==='zoe'?'🦄':'🦖')+'</span><b></b><button class="emo" data-a="play">▶️</button><button class="emo" data-a="load">🎛️</button><button class="emo" data-a="del">🗑️</button>';
  r.querySelector('b').textContent=s.name+(s.v?' 🎤':'');r.addEventListener('click',function(e){var a2=e.target.dataset.a;if(!a2)return;var d=decSong(s.code);if(!d)return;
   if(a2==='del'){if(e.target.dataset.sure){LS.set('songs',songs().filter(function(x){return x.id!==s.id}));dropVoice('song:'+s.id);buildSongs()}else{e.target.dataset.sure=1;e.target.textContent='❓';toast('Tap again to throw it away')}return}
   stop();setMode(d.mode,true,d.song);save();close('songsOv');var go=function(){if(a2==='play')openShow()};if(s.v)loadVoice('song:'+s.id).then(function(){storeVoice();go()});else go()});L.appendChild(r)})}
$('saveB').addEventListener('click',function(){unlock();buildNameRow();buildSongs();$('codeWrap').style.display='none';open('songsOv')});
$('doSave').addEventListener('click',function(){var n=curName(),a=songs(),code=encSong(S.song,S.mode),ex=a.filter(function(x){return x.name===n})[0];
 if(ex){ex.code=code;ex.ts=Date.now();ex.mode=S.mode}else a.push(ex={id:Date.now().toString(36),name:n,mode:S.mode,code:code,ts:Date.now()});ex.v=usesVoice()&&!!RAW?1:0;if(ex.v)storeVoice('song:'+ex.id);if(a.length>60)a.shift();LS.set('songs',a);save();buildSongs();
 smp('cheer',0,{dest:BUS.ui,gain:.6});confetti(innerWidth/2,innerHeight/3,80);toast('💾 Saved "'+n+'"!')});
$('shareB').addEventListener('click',function(){curName();var code=encSong(S.song,S.mode),u=shareURL(code);$('shareUrl').textContent=u;$('codeBox').textContent=code;$('shareSys').style.display=navigator.share?'':'none';close('songsOv');open('shareOv')});
$('copyB').addEventListener('click',function(){var u=$('shareUrl').textContent;function ok(){toast('📋 Copied! Paste it in a message to Dad.')}
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,fallback);else fallback();
 function fallback(){var r=document.createRange();r.selectNodeContents($('shareUrl'));var s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand('copy');ok()}catch(e){toast('Press and hold the link to copy it')}}});
$('shareSys').addEventListener('click',function(){try{navigator.share({title:'Silly Beat Band',text:KNAME+' made a song: '+(S.song.name||'My song'),url:$('shareUrl').textContent}).catch(function(){})}catch(e){}});
$('codeB').addEventListener('click',function(){$('codeWrap').style.display='block';$('codeMsg').textContent='';try{$('codeIn').focus()}catch(e){}});
$('codeGo').addEventListener('click',function(){var d=decSong($('codeIn').value);if(!d){$('codeMsg').textContent='Hmm, that code didn\'t work. Check it and try again!';smp('trombone',0,{dest:BUS.ui,gain:.5,dur:1.2});return}
 stop();setMode(d.mode,true,d.song);save();close('songsOv');toast('🎵 Loaded "'+(d.song.name||'a song')+'"!');start()});
/* themes */
$('themeB').addEventListener('click',function(){var G=$('thg');G.innerHTML='';(S.mode==='zoe'?THEMES_Z:THEMES_A).forEach(function(t){var b=document.createElement('button');b.className='th';b.style.background=t.b;b.textContent=t.n;
 b.addEventListener('click',function(){S.theme[S.mode]=t.id;applyTheme();savePrefs();smp('sparkle',0,{dest:BUS.ui,gain:.7});sparkle(innerWidth/2,innerHeight/2,40)});G.appendChild(b)});open('themeOv')});
function applyTheme(){var c=document.body.classList;['t-lava','t-ocean','t-space','t-unicorn','t-rainbow','t-mermaid'].forEach(function(x){c.remove(x)});if(S.theme[S.mode])c.add(S.theme[S.mode]);
 var m=document.querySelector('meta[name=theme-color]');if(m)m.content=getComputedStyle(document.body).getPropertyValue('--bg1').trim()||'#2a1250'}
function savePrefs(){LS.set('prefs',{mode:S.mode,theme:S.theme})}
/* modes */
function loadCur(m){var c=LS.get('cur_'+m,null),d=c&&decSong(c);return d&&d.mode===m?d.song:fromPreset('silly',m)}
function setMode(m,keepSong,newSong){if(S.song&&!S.guest)try{LS.set('cur_'+S.mode,encSong(S.song,S.mode))}catch(e){}S.mode=m;document.body.classList.toggle('zoe',m==='zoe');
 $('modeE').textContent=m==='zoe'?'🦖':'🦄';$('modeL').textContent=m==='zoe'?'Big kid':'Zoe mode';$('tempo').style.display=m==='zoe'?'none':'flex';$('ztempo').style.display=m==='zoe'?'flex':'none';
 $('dadL').textContent=KID==='zoe'||m==='zoe'?'Daddy, listen!':'Dad, listen!';
 if(newSong)S.song=newSong;else if(!keepSong||!S.song||!S.song.rows[ROWS(m)[0].id]||S.song.n!==(m==='zoe'?8:16))S.song=loadCur(m);applyTheme();savePrefs();if(S.song)applySong()}
$('mode').addEventListener('click',function(){unlock();stop();setMode(S.mode==='zoe'?'alex':'zoe');goScr(S.scr);smp(S.mode==='zoe'?'sparkle':'boing1',0,{dest:BUS.ui});if(S.mode==='zoe')sparkle(innerWidth-60,40,40);toast(S.mode==='zoe'?'🦄 Zoe mode!':'🦖 Big kid mode!')});
/* Dad, listen! */
var showOn=false,showEls={},barsPlayedVis=0;
function openShow(){unlock();stop();var B=$('showBand');B.innerHTML='';showEls={};var band=ROWS().filter(function(r){return S.song.band[r.id]===1&&S.song.pats.some(function(pt){return pt[r.id].some(Boolean)})});
 if(!band.length){toast('Put some critters in the band first!');return}
 band.forEach(function(r){var d=document.createElement('div');d.className='cr';d.innerHTML='<span class="bd emo">'+r.e+'</span><span class="nm">'+r.n+'</span>';B.appendChild(d);showEls[r.id]=d});
 $('showName').textContent='"'+(S.song.name||genName())+'"';if(!S.song.name)S.song.name=$('showName').textContent.slice(1,-1);$('showBy').textContent='🎤 '+(S.guest?'A song made just for you':'A song by '+(S.mode==='zoe'?'Zoe':KNAME))+'!';
 $('showEnd').style.display='none';$('showBar').firstChild.style.width='0';open('show');showOn=true;barsPlayedVis=0;smp('cheer',0,{dest:BUS.show,gain:.45});
 setTimeout(function(){if(!showOn)return;if(S.song.chain.length>1)S.whole=true;var sb=songMode()?S.song.chain.length*Math.max(1,Math.ceil(8/S.song.chain.length)):P().prog.length*2;showBars=sb;start(true);showBars=sb},900)}
function showEnd(){stop();if(!showOn)return;$('showBar').firstChild.style.width='100%';smp('cheer',0,{dest:BUS.show,gain:.9});confetti(innerWidth*.3,innerHeight*.6,90);confetti(innerWidth*.7,innerHeight*.6,90);$('showEnd').style.display='flex'}
function endShow(){showOn=false;stop();close('show');showEls={};if(S.guest){S.guest=false;if(S.guestBack){var gb=S.guestBack;S.mode=gb.mode;S.song=gb.song;setMode(gb.mode,true,gb.song)}S.guestBack=null;open('recvOv')}}
$('dad').addEventListener('click',function(){openShow()});$('showAgain').addEventListener('click',function(){openShow()});$('showDone').addEventListener('click',endShow);
/* opening a shared song link */
var RECV=null;
function checkRecv(){var d=/[#&]S=/.test(location.hash)&&decSong(location.hash);if(!d)return false;RECV=d;$('recvName').textContent='"'+(d.song.name||'A silly song')+'"';$('recvH').textContent='🎵 Someone made you a song!';open('recvOv');return true}
$('recvPlay').addEventListener('click',function(){unlock();close('recvOv');S.guestBack={mode:S.mode,song:S.song};S.guest=true;document.body.classList.toggle('zoe',RECV.mode==='zoe');S.mode=RECV.mode;S.song=JSON.parse(JSON.stringify(RECV.song));buildGrid();openShow()});
$('recvRemix').addEventListener('click',function(){unlock();close('recvOv');if(S.song&&ROWS().some(function(r){return S.song.rows[r.id].some(Boolean)})){var a=songs();a.push({id:Date.now().toString(36),name:'My last song',mode:S.mode,code:encSong(S.song,S.mode),ts:Date.now()});LS.set('songs',a)}
 setMode(RECV.mode,true,JSON.parse(JSON.stringify(RECV.song)));save();clearHash();toast('🎛️ Remix time!')});
$('recvNo').addEventListener('click',function(){close('recvOv');clearHash();setMode(S.mode,true)});
function clearHash(){try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
/* boot */
(function boot(){var pr=LS.get('prefs',null);if(pr&&pr.theme)S.theme=pr.theme;var m=KID==='zoe'?'zoe':(pr&&pr.mode)||'alex';if(/[?&]mode=zoe\b/.test(Q))m='zoe';
 memeSel=LS.get('memeSel',memeSel);mk();setMode(m);
 var sb=$('splBand');(m==='zoe'?['🐻','🐱','🦄','🐥','🐷']:['🐘','🐸','🐐','🐔','🦨','🦛']).forEach(function(e,i){var s=document.createElement('span');s.textContent=e;s.style.animationDelay=(i*0.12)+'s';sb.appendChild(s)});
 var loaded=loadAll().then(function(){buildGrid()});loadVoice();requestAnimationFrame(frame);
 $('splGo').addEventListener('click',function(){unlock();close('splash');smp('sparkle',0,{dest:BUS.ui,gain:.8});confetti(innerWidth/2,innerHeight/2,70);if(!checkRecv()){loaded.then(function(){setTimeout(function(){if(!playing&&S.scr==='beat')start()},400)})}});
 window.hubSave=function(){if(S.guest)return;try{LS.set('cur_'+S.mode,encSong(S.song,S.mode))}catch(e){}};addEventListener('pagehide',window.hubSave);
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){window.hubSave();if(recState===1)recStop()}});
 document.addEventListener('gesturestart',function(e){e.preventDefault()});document.addEventListener('dblclick',function(e){e.preventDefault()});
 window.__SBB={S:S,start:start,stop:stop,goScr:goScr,setMode:setMode,enc:function(){return encSong(S.song,S.mode)},dec:decSong,openShow:openShow,BUF:BUF,MEME:MEME,memeList:memeList,AC:function(){return AC},ready:function(){return ready},VQlen:function(){return VQ.length},peak:function(){if(!METER)return 0;var a=new Float32Array(METER.fftSize);METER.getFloatTimeDomainData(a);var m=0;for(var i=0;i<a.length;i++)m=Math.max(m,Math.abs(a[i]));return m},setEd:setEd,rawChop:function(){return RAW?RAW.chop||'mic':null},meter:function(){return METER},preset:function(id){S.song=fromPreset(id,S.mode);applySong()},songMode:songMode,keyRecord:keyRecord,setRec:function(v){kRec=v},NG:NG,openShow:openShow}})();
