/* ===== audio engine ===== */
var AC=null,MASTER,COMP,LIM,METER,NG={},REV,REVIN,BUF={},OFF={},BUS={},ready=false,unlocked=false;
var MEME=[];/* {id,label,emoji,gentle,file} */
function mk(){var C=window.AudioContext||window.webkitAudioContext;if(!C)return;try{AC=new C({latencyHint:'interactive'})}catch(e){AC=new C()}
 try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
 /* master bus: headroom gain -> glue compressor -> makeup -> brickwall-ish limiter -> soft clip -> meter -> out */
 MASTER=AC.createGain();MASTER.gain.value=0.55;COMP=AC.createDynamicsCompressor();COMP.threshold.value=-18;COMP.knee.value=10;COMP.ratio.value=3;COMP.attack.value=0.006;COMP.release.value=0.2;
 var mu=AC.createGain();mu.gain.value=0.9;LIM=AC.createDynamicsCompressor();LIM.threshold.value=-5;LIM.knee.value=0;LIM.ratio.value=20;LIM.attack.value=0.001;LIM.release.value=0.09;
 var sc=AC.createWaveShaper(),n=2048,cv=new Float32Array(n);for(var i=0;i<n;i++){var x=i/(n-1)*2-1,a=Math.abs(x);cv[i]=(a<0.8?a:0.8+0.2*Math.tanh((a-0.8)/0.2))*(x<0?-1:1)}sc.curve=cv;
 METER=AC.createAnalyser();METER.fftSize=2048;MASTER.connect(COMP);COMP.connect(mu);mu.connect(LIM);LIM.connect(sc);sc.connect(METER);METER.connect(AC.destination);
 REV=AC.createConvolver();REV.buffer=impulse(2.2,2.8);REVIN=AC.createGain();REVIN.gain.value=1;var ro=AC.createGain();ro.gain.value=0.5;REVIN.connect(REV);REV.connect(ro);ro.connect(MASTER);
 BUS.keys=bus(0.9,0.25);BUS.ui=bus(0.7,0);BUS.show=bus(1,0.1)}
function impulse(sec,decay){var r=AC.sampleRate,n=Math.floor(r*sec),b=AC.createBuffer(2,n,r);for(var c=0;c<2;c++){var d=b.getChannelData(c);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay)}return b}
function bus(g,send){var x=AC.createGain();x.gain.value=g;x.connect(MASTER);var s=AC.createGain();s.gain.value=send||0;x.connect(s);s.connect(REVIN);x._send=s;return x}
function rowBus(id){if(!BUS['r_'+id]){var sends={kick:0,clap:.18,hat:.05,bass:0,mel:.28,toot:.05,chick:.1,goat:.18,burp:.05,voice:.12,meme:.08};BUS['r_'+id]=bus(1,sends[id]||0)}return BUS['r_'+id]}
function decode(ab){return new Promise(function(res,rej){try{var p=AC.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej)}catch(e){rej(e)}})}
function onsetOf(b){var d=b.getChannelData(0),pk=0,i;for(i=0;i<d.length;i++){var a=Math.abs(d[i]);if(a>pk)pk=a}
 var th=pk*0.03;for(i=0;i<d.length;i++)if(Math.abs(d[i])>th)break;return Math.max(0,(i/b.sampleRate)-0.0015)}
/* per-sample loudness: loudest 300 ms window RMS -> gain to a common target (one-shots, memes, voices; drums/instruments keep their hand-set balance) */
var NORMSET=/^(meme:|v_|toot|chick|goat|burp|boing|cheer|sparkle|pop|duck|squeak|wow|trombone|whee|fart|horn|honk|catc)/;
function loudGain(d,sr,target){var w=Math.floor(sr*0.3),hop=Math.floor(sr*0.05),best=0,pk=0,i;for(i=0;i<d.length;i++){var a=Math.abs(d[i]);if(a>pk)pk=a}
 if(d.length<=w){var e=0;for(i=0;i<d.length;i++)e+=d[i]*d[i];best=Math.sqrt(e/Math.max(1,d.length))}else for(var s0=0;s0+w<=d.length;s0+=hop){var e2=0;for(i=s0;i<s0+w;i+=2)e2+=d[i]*d[i];var r=Math.sqrt(e2/(w/2));if(r>best)best=r}
 if(best<1e-4)return 1;var g=Math.pow(10,((target||-17)-20*Math.log10(best))/20);return Math.max(0.3,Math.min(3,g,1.6/Math.max(pk,1e-3)))}
function loadOne(name,url){return fetch(url).then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}).then(decode).then(function(b){BUF[name]=b;OFF[name]=onsetOf(b);if(NORMSET.test(name))NG[name]=loudGain(b.getChannelData(0),b.sampleRate)}).catch(function(){})}
function loadMemes(){
 function grab(dir,fam){return fetch(dir+'manifest.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(m){var a=Array.isArray(m)?m:(m.clips||m.sounds||[]);
  a.forEach(function(c){var f=c.file||c.path||c.src;if(!f)return;var id=(fam?'f_':'')+(c.id||f.replace(/\.\w+$/,'').replace(/\W/g,'_'));if(MEME.some(function(x){return x.id===id}))return;
   MEME.push({id:id,label:c.label||c.name||c.title||id,emoji:c.emoji||'🤪',gentle:!!(c.gentle||c.zoe),alex:c.alex!==false,fam:!!fam,file:/^(\/|https?:)/.test(f)||f.indexOf('sfx/')===0?f:dir+f})})}).catch(function(){})}
 return grab('sfx/meme/',0).then(function(){return grab('sfx/family-only/',1)}).then(function(){return Promise.all(MEME.map(function(c){return loadOne('meme:'+c.id,c.file)}))}).then(function(){MEME=MEME.filter(function(c){return BUF['meme:'+c.id]});buildGrid&&S&&buildGrid()})}
function loadAll(){if(!AC)return Promise.resolve();return Promise.all(SAMPLES.map(function(n){return loadOne(n,'sfx/'+n+'.mp3')})).then(function(){ready=true}).then(loadMemes)}
function memeList(m){var z=(m||S.mode)==='zoe',a=MEME.filter(function(c){return z?c.gentle:c.alex}).slice(0,z?14:61);if((m||S.mode)==='zoe')a.push({id:'__voice',label:'My voice',emoji:'🎤',gentle:true});return a}
var introBuf=null,introSrc=null,introDone=false,introLoading=false;
function playIntro(){if(introDone||introSrc||!AC)return;function go(){if(introDone||introSrc||!introBuf)return;try{var s=AC.createBufferSource(),g=AC.createGain();s.buffer=introBuf;g.gain.value=0.85;s.connect(g);g.connect(MASTER);s._g=g;s.onended=function(){if(introSrc===s){introSrc=null;introDone=true}};s.start(0);introSrc=s}catch(e){introDone=true}}
 if(introBuf){go();return}if(introLoading)return;introLoading=true;fetch('music/intro.mp3').then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}).then(decode).then(function(b){introBuf=b;go()}).catch(function(){introDone=true})}
function skipIntro(){introDone=true;if(introSrc){try{var tm=AC&&AC.currentTime||0,g=introSrc._g;if(g&&AC){g.gain.cancelScheduledValues(tm);g.gain.setValueAtTime(g.gain.value,tm);g.gain.linearRampToValueAtTime(0.0001,tm+0.25)}introSrc.stop(tm+0.3)}catch(e){}introSrc=null}}
function unlock(){if(!AC)return;try{if(AC.state!=='running')AC.resume()}catch(e){}if(unlocked)return;unlocked=true;try{var b=AC.createBuffer(1,1,22050),s=AC.createBufferSource();s.buffer=b;s.connect(AC.destination);s.start(0)}catch(e){}playIntro()}
['touchstart','touchend','pointerdown','mousedown','keydown','click'].forEach(function(t){addEventListener(t,function(){if(AC&&(AC.state!=='running'||!unlocked))unlock()},{capture:true,passive:true})});
function now(){return AC?AC.currentTime:0}
/* play a sample */
function smp(name,t,o){o=o||{};var b=BUF[name];if(!b||!AC)return null;var s=AC.createBufferSource();s.buffer=b;var r=o.rate||1;s.playbackRate.value=r;var g=AC.createGain();g.gain.value=(o.gain==null?1:o.gain)*(o.raw?1:(NG[name]||1));
 s.connect(g);g.connect(o.dest||MASTER);var st=Math.max(t||0,AC.currentTime);s.start(st,OFF[name]||0);if(o.dur){g.gain.setValueAtTime(g.gain.value,st+o.dur);g.gain.linearRampToValueAtTime(0,st+o.dur+0.08);s.stop(st+o.dur+0.1)}
 return {s:s,g:g,stop:function(tt){tt=Math.max(tt||AC.currentTime,AC.currentTime);try{g.gain.cancelScheduledValues(tt);g.gain.setValueAtTime(g.gain.value,tt);g.gain.linearRampToValueAtTime(0,tt+0.12);s.stop(tt+0.15)}catch(e){}}}}
function mtof(m){return 440*Math.pow(2,(m-69)/12)}
function osc(type,f,t,dest){var o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(dest)o.connect(dest);return o}
function env(g,t,a,peak,d,sus){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setTargetAtTime(peak*sus,t+a,d)}
var CURVE=null;function dist(){if(CURVE)return CURVE;var n=1024,c=new Float32Array(n);for(var i=0;i<n;i++){var x=i/(n-1)*2-1;c[i]=Math.tanh(x*4)}return CURVE=c}
/* Karplus-Strong pluck buffers for the guitar (cached per note) */
var KS={};function ksBuf(m){if(KS[m])return KS[m];var sr=AC.sampleRate,f=mtof(m),N=Math.round(sr/f),len=Math.floor(sr*1.4),b=AC.createBuffer(1,len,sr),d=b.getChannelData(0),ring=new Float32Array(N);
 for(var i=0;i<N;i++)ring[i]=Math.random()*2-1;var p=0;for(i=0;i<len;i++){var nx=(p+1)%N,v=0.4985*(ring[p]+ring[nx]);d[i]=ring[p];ring[p]=v;p=nx}return KS[m]=b}
/* instruments: returns a handle with stop(t) */
function inst(id,m,t,vel,dest){if(!AC)return null;vel=vel==null?1:vel;dest=dest||MASTER;var g=AC.createGain(),nodes=[],stopFn;g.connect(dest);t=Math.max(t,AC.currentTime);
 function done(rel){return function(tt){tt=Math.max(tt||AC.currentTime,AC.currentTime);try{g.gain.cancelScheduledValues(tt);g.gain.setValueAtTime(Math.max(g.gain.value,0.0001),tt);g.gain.setTargetAtTime(0.0001,tt,rel);nodes.forEach(function(n){n.stop(tt+rel*6)})}catch(e){}}}
 if(id==='piano'||id==='bells'||id==='kitty'){var nm=id==='piano'?(m<66?'piano_c4':'piano_c5'):id==='bells'?'bell_f5':'meow',base=id==='piano'?(m<66?60:72.2):id==='bells'?77:74.4;
  if(!BUF[nm])return inst('chip',m,t,vel,dest);var s=AC.createBufferSource();s.buffer=BUF[nm];s.playbackRate.value=Math.pow(2,(m-base)/12);s.connect(g);
  g.gain.value=vel*(id==='kitty'?0.8:id==='bells'?0.9:1);s.start(t,OFF[nm]||0);nodes.push(s);return {stop:done(id==='bells'?0.35:id==='kitty'?0.08:0.12)}}
 var SI={tootophone:['fart2',67,0.9,0.06],digger:['horn_dig',66.7,0.8,0.12],airhorn:['meme:airhorn',76,0.7,0.1],honk:['honk1',78.5,0.8,0.08]}[id];
 if(SI){var bf=BUF[SI[0]];if(!bf)return inst('chip',m,t,vel,dest);var sx=AC.createBufferSource();sx.buffer=bf;sx.playbackRate.value=Math.max(0.25,Math.min(4,Math.pow(2,(m-SI[1])/12)));sx.connect(g);g.gain.value=vel*SI[2]*(NG[SI[0]]||1);sx.start(t,OFF[SI[0]]||0);nodes.push(sx);return {stop:done(SI[3])}}
 if(id==='catchoir'){if(!BUF.meow)return inst('chip',m,t,vel,dest);[[0,0,1],[7,0.025,0.8],[12,0.05,0.7]].forEach(function(v,j){var c=AC.createBufferSource();c.buffer=BUF.meow;c.playbackRate.value=Math.pow(2,(m+v[0]-74.4+(j-1)*0.08)/12);var cg=AC.createGain();cg.gain.value=v[2]*0.42;c.connect(cg);cg.connect(g);c.start(t+v[1],OFF.meow||0);nodes.push(c)});g.gain.value=vel;return {stop:done(0.08)}}
 if(id==='guitar'){var s2=AC.createBufferSource();s2.buffer=ksBuf(Math.round(m));var ws=AC.createWaveShaper();ws.curve=dist();var lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;
  var pre=AC.createGain();pre.gain.value=1.2;s2.connect(pre);pre.connect(ws);ws.connect(lp);lp.connect(g);g.gain.value=0.32*vel;s2.start(t);nodes.push(s2);return {stop:done(0.08)}}
 if(id==='chip'){var o=osc('square',mtof(m),t,g);o.frequency.setValueAtTime(mtof(m+12),t);o.frequency.setValueAtTime(mtof(m),t+0.03);env(g,t,0.005,0.16*vel,0.25,0.5);o.start(t);nodes.push(o);return {stop:done(0.04)}}
 if(id==='robot'){var o1=osc('sawtooth',mtof(m),t,null),o2=osc('square',mtof(m)*1.005,t,null);var rm=AC.createGain();rm.gain.value=0;var lfo=osc('square',55,t,rm.gain);
  var bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1200;bp.Q.value=2;o1.connect(rm);o2.connect(rm);rm.connect(bp);bp.connect(g);
  var bp2=AC.createBiquadFilter();bp2.type='lowpass';bp2.frequency.value=900;o1.connect(bp2);bp2.connect(g);env(g,t,0.01,0.22*vel,0.3,0.7);[o1,o2,lfo].forEach(function(n){n.start(t);nodes.push(n)});return {stop:done(0.05)}}
 if(id==='kazoo'){var o3=osc('sawtooth',mtof(m),t,null);var vib=osc('sine',6,t,null);var vg=AC.createGain();vg.gain.value=mtof(m)*0.012;vib.connect(vg);vg.connect(o3.frequency);
  var w=AC.createWaveShaper();w.curve=dist();var pg=AC.createGain();pg.gain.value=0.6;o3.connect(pg);pg.connect(w);var mix=AC.createGain();mix.gain.value=1;
  [[650,6,1],[1080,7,.7],[2650,8,.35]].forEach(function(f){var b=AC.createBiquadFilter();b.type='bandpass';b.frequency.value=f[0];b.Q.value=f[1];var gg=AC.createGain();gg.gain.value=f[2]*3;w.connect(b);b.connect(gg);gg.connect(mix)});
  mix.connect(g);env(g,t,0.03,0.2*vel,0.3,0.85);o3.frequency.setValueAtTime(mtof(m-0.6),t);o3.frequency.linearRampToValueAtTime(mtof(m),t+0.06);[o3,vib].forEach(function(n){n.start(t);nodes.push(n)});return {stop:done(0.05)}}
 if(id==='ghost'){var o4=osc('sine',mtof(m+12),t,g),o5=osc('triangle',mtof(m+12)*2.002,t,null);var g5=AC.createGain();g5.gain.value=0.15;o5.connect(g5);g5.connect(g);var v2=osc('sine',5.2,t,null);var vg2=AC.createGain();vg2.gain.value=mtof(m+12)*0.02;v2.connect(vg2);vg2.connect(o4.frequency);
  o4.frequency.setValueAtTime(mtof(m+11),t);o4.frequency.exponentialRampToValueAtTime(mtof(m+12),t+0.12);env(g,t,0.06,0.2*vel,0.4,0.8);[o4,o5,v2].forEach(function(n){n.start(t);nodes.push(n)});return {stop:done(0.18)}}
 return inst('piano',m,t,vel,dest)}
/* bass synth per kit */
function bass(kit,m,t,dur,dest){var g=AC.createGain();g.connect(dest);var f=mtof(m),o,o2,lp=AC.createBiquadFilter();lp.type='lowpass';
 if(kit==='chip'){o=osc('triangle',f,t,g);env(g,t,0.004,0.5,dur*0.6,0.6)}
 else if(kit==='spooky'){o=osc('sine',f,t,g);o2=osc('triangle',f*2,t,null);var g2=AC.createGain();g2.gain.value=0.15;o2.connect(g2);g2.connect(g);env(g,t,0.01,0.6,dur*0.8,0.7);o2.start(t);o2.stop(t+dur+0.3)}
 else{o=osc('sawtooth',f,t,null);o2=osc('square',f/2,t,null);var g3=AC.createGain();g3.gain.value=0.5;o2.connect(g3);g3.connect(lp);o.connect(lp);lp.connect(g);
  lp.Q.value=kit==='rock'?6:3;lp.frequency.setValueAtTime(kit==='rock'?1800:1100,t);lp.frequency.exponentialRampToValueAtTime(180,t+dur);env(g,t,0.004,0.42,dur*0.7,0.5);o2.start(t);o2.stop(t+dur+0.3)}
 o.start(t);g.gain.setTargetAtTime(0.0001,t+dur,0.05);o.stop(t+dur+0.3)}
/* 8-bit drums */
var NOISE=null;function noise(){if(NOISE)return NOISE;var n=AC.sampleRate,b=AC.createBuffer(1,n,n),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;return NOISE=b}
function chipDrum(kind,t,dest){var g=AC.createGain();g.connect(dest);
 if(kind==='kick'){var o=osc('square',160,t,g);o.frequency.exponentialRampToValueAtTime(38,t+0.12);g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.18);o.start(t);o.stop(t+0.2);return}
 var s=AC.createBufferSource();s.buffer=noise();var f=AC.createBiquadFilter();f.type=kind==='hat'?'highpass':'bandpass';f.frequency.value=kind==='hat'?7000:1800;s.connect(f);f.connect(g);
 var L=kind==='hat'?0.05:0.16;g.gain.setValueAtTime(kind==='hat'?0.28:0.55,t);g.gain.exponentialRampToValueAtTime(0.001,t+L);s.start(t);s.stop(t+L+0.02)}
var KITS={rock:{kick:'kick',clap:'snare',hat:'hat'},acoustic:{kick:'kick',clap:'clap',hat:'hat'},spooky:{kick:'kick808',clap:'clap',hat:'hat'},xmas:{kick:'kick',clap:'clap',hat:'sleigh'},chip:{}};
var DRUMVOL={kick:1,kick808:0.95,snare:0.75,clap:0.7,hat:0.42,sleigh:0.5};
