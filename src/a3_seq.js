/* ===== song state + lookahead scheduler ===== */
var S={mode:KID==='zoe'?'zoe':'alex',song:null,songs:{},scr:'beat',theme:{alex:'',zoe:''},inst:null,voice:null,voiceFx:'normal',chop:'v_hey'};
function blankRows(m,n){var o={};ROWS(m).forEach(function(r){var a=[];for(var i=0;i<n;i++)a.push(0);o[r.id]=a});return o}
function fromPreset(pid,m){var P=PRESETS[pid],z=m==='zoe',n=z?8:16,s={p:pid,bpm:z?Math.min(P.bpm,124):P.bpm,inst:z?P.zinst:P.inst,n:n,rows:blankRows(m,n),band:{},name:''};
 var pat=z?P.z:P.a;for(var id in pat){if(!s.rows[id])continue;for(var i=0;i<n;i++)s.rows[id][i]=parseInt(pat[id].charAt(i),16)||0}
 ROWS(m).forEach(function(r){s.band[r.id]=z?1:(P.band.indexOf(r.id)>=0?1:0)});return s}
function P(){return PRESETS[S.song.p]||PRESETS.silly}
function audible(id){return S.song.band[id]===1}
var playing=false,step=0,bar=0,nextT=0,timer=0,VQ=[],showBars=0,barsPlayed=0;
function stepDur(){return 60/S.song.bpm/(S.song.n===16?4:2)}
function keyRoot(){return P().key||0}
function trigger(r,v,t,b,i,dest){var p=P(),kit=p.kit,sd=stepDur(),sc=SCALES[p.scale],k=keyRoot();
 switch(r.k){
 case 'drum':if(kit==='chip'){chipDrum(r.id,t,dest);break}var nm=KITS[kit][r.id];smp(nm,t,{dest:dest,gain:DRUMVOL[nm]*(S.mode==='zoe'&&r.id==='kick'?0.8:1)});break;
 case 'bass':bass(kit,36+k+p.prog[b%p.prog.length]+BASSDEG[(v-1)%4]+(k<0?12:0),t,sd*1.7,dest);break;
 case 'mel':var h=inst(S.song.inst,72+k+sc[(v-1)%6],t,0.9,dest);h&&h.stop(t+sd*1.8);break;
 case 'zmel':var zc=(p.zc||[1,3,4,3,5,4,3,2])[i%8],h2=inst(S.song.inst,72+k+sc[(zc-1)%6],t,0.85,dest);h2&&h2.stop(t+sd*1.6);break;
 case 'toot':smp(v===2?'toot7':'toot6',t,{dest:dest,gain:0.9,dur:sd*3.5});break;
 case 'chick':smp(v===2?'chick2':'chick1',t,{dest:dest,gain:0.8,dur:sd*3.5});break;
 case 'goat':var tg=72+k+GOATDEG[p.scale][(v-1)%4];smp('goat1',t,{dest:dest,gain:0.85,rate:Math.pow(2,(tg-78.6)/12),dur:sd*3.5});break;
 case 'burp':smp(v===2?'burp2':'burp1',t,{dest:dest,gain:v===2?1:0.9,dur:sd*4});break;
 case 'voice':if(S.voice){var s=AC.createBufferSource();s.buffer=S.voice;var g=AC.createGain();g.gain.value=1;s.connect(g);g.connect(dest);s.start(t);var L=Math.min(S.voice.duration,sd*4);g.gain.setValueAtTime(1,t+L);g.gain.linearRampToValueAtTime(0,t+L+0.06);s.stop(t+L+0.08)}else smp(S.chop,t,{dest:dest,dur:sd*4});break;
 case 'meme':var ml=memeList(),c=ml[(v-1)%Math.max(1,ml.length)];if(c&&c.id==='__voice'){trigger({k:'voice'},1,t,b,i,dest)}else if(c)smp('meme:'+c.id,t,{dest:dest,gain:0.9,dur:Math.max(sd*4,0.6)});break}}
function playStep(t){var hits=[];ROWS().forEach(function(r){var v=S.song.rows[r.id][step];if(v&&audible(r.id)){trigger(r,v,t,bar,step,rowBus(r.id));hits.push(r.id)}});
 VQ.push({t:t,step:step,bar:bar,hits:hits})}
function sched(){if(!playing||!AC)return;var ct=AC.currentTime;if(nextT<ct-0.25)nextT=ct+0.05;
 while(nextT<ct+0.12){playStep(nextT);nextT+=stepDur();step++;if(step>=S.song.n){step=0;bar=(bar+1)%P().prog.length;barsPlayed++;if(showBars&&barsPlayed>=showBars){var endT=nextT;playing=false;setTimeout(function(){showEnd()},Math.max(0,(endT-AC.currentTime)*1000));break}}}}
function start(fromTop){if(!AC)return;unlock();if(playing)return;playing=true;if(fromTop!==false){step=0;bar=0}barsPlayed=0;nextT=AC.currentTime+0.06;sched();timer=setInterval(sched,25);uiPlay(true)}
function stop(){playing=false;clearInterval(timer);timer=0;VQ=[];showBars=0;uiPlay(false)}
/* share code: m(a|z) preset bpm(2) inst band(hex) + rows (hex states, g..v = runs of 1..16 zeros) + ~name */
var B36='0123456789abcdefghijklmnopqrstuvwxyz';
function encRow(a){var s='',z=0;function fl(){while(z>0){var k=Math.min(z,16);s+=String.fromCharCode(102+k);z-=k}}a.forEach(function(v){if(!v)z++;else{fl();s+=(v&15).toString(16)}});fl();return s}
function decRow(s,n){var a=[],i=0;while(i<s.length&&a.length<n){var c=s.charCodeAt(i);if(c>=103&&c<=118){for(var k=0;k<c-102;k++)a.push(0)}else a.push(parseInt(s.charAt(i),16)||0);i++}while(a.length<n)a.push(0);return a.slice(0,n)}
function encSong(sg,m){var rows=ROWS(m),mask=0;rows.forEach(function(r,i){if(sg.band[r.id]===1)mask|=1<<i;if(sg.band[r.id]===2)mask|=1<<(i+16)});
 var insts=m==='zoe'?INST_Z:INST_A,ii=Math.max(0,insts.map(function(x){return x.id}).indexOf(sg.inst));
 var s='2'+(m==='zoe'?'z':'a')+PRESET_ORDER.indexOf(sg.p)+('0'+Math.round(sg.bpm).toString(36)).slice(-2)+ii.toString(36)+mask.toString(36)+'-';
 s+=rows.map(function(r){return encRow(sg.rows[r.id])}).join('.');var nm=(sg.name||'').replace(/[^\w !?'&-]/g,'').slice(0,40);if(nm)s+='~'+encodeURIComponent(nm.replace(/ /g,'_'));return s}
function decSong(code){code=String(code||'').trim();var mm=/[#&?]S=([^&\s]+)/.exec(code);if(mm)code=mm[1];try{code=decodeURIComponent(code)}catch(e){}code=code.replace(/\s+/g,'');
 var nm='',ti=code.indexOf('~');if(ti>=0){nm=code.slice(ti+1).replace(/_/g,' ').replace(/[^\w !?'&-]/g,'');code=code.slice(0,ti)}
 var h=/^2([az])(\d)([0-9a-z]{2})([0-9a-z])([0-9a-z]+)-(.*)$/.exec(code);if(!h)return null;var m=h[1]==='z'?'zoe':'alex',pid=PRESET_ORDER[+h[2]];if(!pid)return null;
 var n=m==='zoe'?8:16,rows=ROWS(m),parts=h[6].split('.'),mask=parseInt(h[5],36),insts=m==='zoe'?INST_Z:INST_A;
 var sg={p:pid,bpm:Math.max(60,Math.min(180,parseInt(h[3],36)||110)),inst:(insts[parseInt(h[4],36)]||insts[0]).id,n:n,rows:{},band:{},name:nm};
 rows.forEach(function(r,i){sg.rows[r.id]=decRow(parts[i]||'',n);sg.band[r.id]=(mask>>(i+16))&1?2:(mask>>i)&1?1:0});return {mode:m,song:sg}}
function shareURL(code){return location.origin+location.pathname.replace(/index\.html$/,'')+'#S='+code}
