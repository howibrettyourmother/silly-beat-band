/* ===== Silly Studio: record a voice, make it silly, drop it in the beat ===== */
var RAW=null,recState=0,recStream=null,recNode=null,recSrc=null,recChunks=[],recT0=0,recTimer=0,MAXREC=3;
function micMsg(t){$('micMsg').textContent=t}
function buildStudio(){var F=$('fxg');F.innerHTML='';FX.forEach(function(f){var b=document.createElement('button');b.className='fxb'+(S.voiceFx===f.id?' on':'');b.innerHTML='<span class="emo">'+f.e+'</span>'+f.n;
  b.addEventListener('click',function(){unlock();S.voiceFx=f.id;F.querySelectorAll('.fxb').forEach(function(x){x.classList.remove('on')});b.classList.add('on');render().then(hear);storeVoice()});F.appendChild(b)});
 var C=$('chops');C.innerHTML='<div style="width:100%;text-align:center;font-weight:800;opacity:.85">…or use a silly voice:</div>';
 CHOPS.forEach(function(c){var b=document.createElement('button');b.className='chop'+(!RAW||RAW.chop!==c.id?'':' on');b.textContent=c.n;
  b.addEventListener('click',function(){unlock();var bf=BUF[c.id];if(!bf)return;var d=bf.getChannelData(0),o=Math.floor((OFF[c.id]||0)*bf.sampleRate);RAW={d:new Float32Array(d.subarray(o)),sr:bf.sampleRate,chop:c.id};S.chop=c.id;
   C.querySelectorAll('.chop').forEach(function(x){x.classList.remove('on')});b.classList.add('on');render().then(hear);storeVoice()});C.appendChild(b)})}
function hear(){if(!S.voice||!AC)return;var s=AC.createBufferSource();s.buffer=S.voice;s.connect(BUS.ui);s.start();var p=$('polly');hop(p);var f=FX.filter(function(x){return x.id===S.voiceFx})[0];$('pollySay').textContent=f?f.e+' '+f.n+'!':'';var n=Math.ceil(S.voice.duration/0.25);for(var i=1;i<n;i++)setTimeout(function(){hop(p)},i*250)}
function OAC(ch,len,sr){var C=window.OfflineAudioContext||window.webkitOfflineAudioContext;return new C(ch,len,sr)}
function render(){if(!RAW||!AC)return Promise.resolve();var fx=S.voiceFx,rate=fx==='chip'?1.6:fx==='monster'?0.68:1,sr=AC.sampleRate,src=RAW;
 var dur=src.d.length/src.sr/rate+(fx==='robot'?0.25:0.05),oc=OAC(1,Math.ceil(dur*sr),sr),b=oc.createBuffer(1,src.d.length,src.sr);b.getChannelData(0).set(src.d);
 var s=oc.createBufferSource();s.buffer=b;s.playbackRate.value=rate;var out=oc.createGain();out.connect(oc.destination);var head=s;
 if(fx==='chip'){var hs=oc.createBiquadFilter();hs.type='highshelf';hs.frequency.value=3000;hs.gain.value=4;s.connect(hs);hs.connect(out)}
 else if(fx==='monster'){var ls=oc.createBiquadFilter();ls.type='lowshelf';ls.frequency.value=220;ls.gain.value=9;var ws=oc.createWaveShaper();var c=new Float32Array(512);for(var i=0;i<512;i++){var x=i/255.5-1;c[i]=Math.tanh(x*2.2)}ws.curve=c;var lp=oc.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;s.connect(ls);ls.connect(ws);ws.connect(lp);lp.connect(out)}
 else if(fx==='robot'){var rm=oc.createGain();rm.gain.value=0;var lfo=oc.createOscillator();lfo.frequency.value=62;lfo.connect(rm.gain);lfo.start(0);var dl=oc.createDelay(0.1);dl.delayTime.value=0.011;var fb=oc.createGain();fb.gain.value=0.55;
  s.connect(rm);rm.connect(out);rm.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(out);var dry=oc.createGain();dry.gain.value=0.25;s.connect(dry);dry.connect(out)}
 else s.connect(out);
 s.start(0);
 return new Promise(function(res){oc.oncomplete=function(e){res(e.renderedBuffer)};var p=oc.startRendering();if(p&&p.then)p.then(res,function(){res(null)})}).then(function(buf){if(!buf)return;
  var d=buf.getChannelData(0),pk=0;for(var i=0;i<d.length;i++)pk=Math.max(pk,Math.abs(d[i]));if(pk>0){var g=0.9/pk;for(i=0;i<d.length;i++)d[i]*=g}S.voice=buf})}
function trim(d,sr){var w=Math.floor(sr*0.01),pk=0,i;for(i=0;i<d.length;i++)pk=Math.max(pk,Math.abs(d[i]));if(pk<0.01)return null;var th=pk*0.08,a=0,b=d.length-1;
 for(i=0;i<d.length;i++)if(Math.abs(d[i])>th){a=i;break}for(i=d.length-1;i>0;i--)if(Math.abs(d[i])>th){b=i;break}
 a=Math.max(0,a-Math.floor(sr*0.012));b=Math.min(d.length,b+Math.floor(sr*0.12));var o=d.slice(a,b),f=Math.min(o.length,w*3);for(i=0;i<f;i++)o[o.length-1-i]*=i/f;return o}
function recStart(){unlock();var md=navigator.mediaDevices;
 if(!md||!md.getUserMedia){micMsg('No microphone here. Pick a silly voice below instead!');$('chops').style.animation='dadp 1s 3';return}
 micMsg('Asking for the microphone…');
 md.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true}}).then(function(st){recStream=st;recSrc=AC.createMediaStreamSource(st);
  recNode=(AC.createScriptProcessor||AC.createJavaScriptNode).call(AC,4096,1,1);recChunks=[];recNode.onaudioprocess=function(e){if(recState!==1)return;recChunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));drawMeter(e.inputBuffer.getChannelData(0))};
  var z=AC.createGain();z.gain.value=0;recSrc.connect(recNode);recNode.connect(z);z.connect(AC.destination);recState=1;recT0=Date.now();$('rec').classList.add('rec');$('recL').textContent='Tap to stop';micMsg('Recording! Say something silly!');
  recTimer=setInterval(function(){var left=MAXREC-(Date.now()-recT0)/1000;if(left<=0)recStop();else $('recL').textContent='Stop ('+Math.ceil(left)+')'},100)})
 .catch(function(err){var n=err&&err.name;recState=0;
  micMsg(n==='NotAllowedError'||n==='SecurityError'?'The microphone is turned off. A grown-up can allow it in Settings › Safari › Microphone. Pick a silly voice below for now!':'Couldn\'t find a microphone. Pick a silly voice below instead!');$('chops').style.animation='dadp 1s 3'})}
function recStop(){if(recState!==1)return;recState=0;clearInterval(recTimer);$('rec').classList.remove('rec');$('recL').textContent='Tap to record';
 try{recSrc.disconnect();recNode.disconnect()}catch(e){}try{recStream.getTracks().forEach(function(t){t.stop()})}catch(e){}
 var n=0;recChunks.forEach(function(c){n+=c.length});var d=new Float32Array(n),o=0;recChunks.forEach(function(c){d.set(c,o);o+=c.length});var tr=trim(d,AC.sampleRate);
 if(!tr){micMsg('Hmm, that was too quiet. Try again, LOUDER!');return}
 RAW={d:tr,sr:AC.sampleRate,chop:null};$('chops').querySelectorAll('.chop').forEach(function(x){x.classList.remove('on')});micMsg('Got it! Pick a silly voice effect →');render().then(hear);storeVoice();confetti(innerWidth*.3,innerHeight*.5,30)}
function drawMeter(d){var c=$('meter'),g=c.getContext('2d'),w=c.width,h=c.height;g.clearRect(0,0,w,h);g.strokeStyle=S.mode==='zoe'?'#fff':'#2ee6d6';g.lineWidth=3;g.beginPath();for(var i=0;i<w;i++){var v=d[Math.floor(i/w*d.length)]||0;g.lineTo(i,h/2+v*h*1.4)}g.stroke()}
$('rec').addEventListener('click',function(){if(recState===1)recStop();else recStart()});
$('hear').addEventListener('click',function(){unlock();if(!S.voice){micMsg('Record something first, or pick a silly voice!');return}hear()});
$('toBeat').addEventListener('click',function(){unlock();if(!S.voice&&!RAW){var c=CHOPS[0];S.chop=c.id}
 if(S.mode==='zoe'){var ml=memeList(),vi=ml.map(function(x){return x.id}).indexOf('__voice');if(vi>=0)memeSel.zoe=vi+1;var a=S.song.rows.meme;for(var i=0;i<a.length;i++)if(i%4===3||a[i])a[i]=memeSel.zoe;LS.set('memeSel',memeSel);joinBand('meme',true);buildGrid()}
 else{var v=S.song.rows.voice;if(!v.some(Boolean)){v[0]=1;v[8]=1}joinBand('voice',true);buildGrid()}
 goScr('beat');toast(S.mode==='zoe'?'🐷 Piggy sings your voice!':'🦜 Polly says it in your beat!');start()});
/* keep the voice per kid in IndexedDB (raw at 22 kHz + effect) */
function idb(){return new Promise(function(res,rej){try{var r=indexedDB.open('sbb',1);r.onupgradeneeded=function(){r.result.createObjectStore('v')};r.onsuccess=function(){res(r.result)};r.onerror=rej}catch(e){rej(e)}})}
function storeVoice(){if(!RAW)return;var step=RAW.sr>30000?2:1,n=Math.floor(RAW.d.length/step),d=new Float32Array(n);for(var i=0;i<n;i++)d[i]=RAW.d[i*step];
 idb().then(function(db){db.transaction('v','readwrite').objectStore('v').put({d:d,sr:RAW.sr/step,fx:S.voiceFx,chop:RAW.chop},KID)}).catch(function(){})}
function loadVoice(){return idb().then(function(db){return new Promise(function(res){var q=db.transaction('v').objectStore('v').get(KID);q.onsuccess=function(){var v=q.result;if(v&&v.d){RAW={d:v.d,sr:v.sr,chop:v.chop};S.voiceFx=v.fx||'normal';if(v.chop)S.chop=v.chop}res()};q.onerror=function(){res()}})}).then(function(){if(RAW)return render()}).catch(function(){})}
