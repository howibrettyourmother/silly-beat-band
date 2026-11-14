/* ===== Silly Beat Band v/*VER*/ : data ===== */
var VER='/*VER*/';
var $=function(id){return document.getElementById(id)};
var Q=location.search;
var KID=(Q.match(/[?&](?:kid|mode)=(alex|zoe)\b/)||[])[1];
if(!KID){try{KID=localStorage.kidsHub}catch(e){}}
if(KID!=='alex'&&KID!=='zoe')KID='alex';
var KNAME=KID==='zoe'?'Zoe':'Alex';
var LS={get:function(k,d){try{var v=localStorage.getItem('sbb_'+KID+'_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem('sbb_'+KID+'_'+k,JSON.stringify(v))}catch(e){}}};
/* scales: 6 melody states, goat 4, bass degrees relative to the chord root */
var SCALES={major:[0,2,4,7,9,12],minor:[0,3,5,7,10,12]};
var GOATDEG={major:[0,4,7,12],minor:[0,3,7,12]};
var BASSDEG=[0,7,12,-5];
/* rows: id, critter, name, kind, states (taps cycle through), colour */
var ROWS_A=[
 {id:'kick',e:'🐘',n:'Ellie',d:'Boom',k:'drum',st:1,c:'#ff5d5d'},
 {id:'clap',e:'🐵',n:'Momo',d:'Clap',k:'drum',st:1,c:'#ff9f1c'},
 {id:'hat',e:'🐭',n:'Squeaks',d:'Tss',k:'drum',st:1,c:'#ffd23f'},
 {id:'bass',e:'🐸',n:'Frog',d:'Bass',k:'bass',st:4,c:'#4ade80'},
 {id:'mel',e:'🐦',n:'Birdie',d:'Tune',k:'mel',st:6,c:'#38bdf8'},
 {id:'toot',e:'🦨',n:'Stinky',d:'Toot',k:'toot',st:3,c:'#a78bfa'},
 {id:'chick',e:'🐔',n:'Cluck',d:'Rubber chicken',k:'chick',st:2,c:'#fb7185'},
 {id:'goat',e:'🐐',n:'Billy',d:'Goat singer',k:'goat',st:4,c:'#e9d5a1'},
 {id:'burp',e:'🦛',n:'Hippo',d:'Burp',k:'burp',st:2,c:'#86efac'},
 {id:'voice',e:'🦜',n:'Polly',d:'My voice',k:'voice',st:1,c:'#f472b6'},
 {id:'meme',e:'🐶',n:'Doggo',d:'Meme',k:'meme',st:0,c:'#facc15'}];
var ROWS_Z=[
 {id:'kick',e:'🐻',n:'Bear',d:'Boom',k:'drum',st:1,c:'#ff6fae'},
 {id:'clap',e:'🐱',n:'Kitty',d:'Clap',k:'drum',st:1,c:'#c084fc'},
 {id:'hat',e:'🐥',n:'Chicky',d:'Shake',k:'drum',st:1,c:'#fde047'},
 {id:'mel',e:'🦄',n:'Unicorn',d:'Sing',k:'zmel',st:1,c:'#60a5fa'},
 {id:'meme',e:'🐷',n:'Piggy',d:'Silly',k:'meme',st:0,c:'#34d399'}];
function ROWS(m){return (m||S.mode)==='zoe'?ROWS_Z:ROWS_A}
function rowById(id,m){var r=ROWS(m);for(var i=0;i<r.length;i++)if(r[i].id===id)return r[i];return null}
/* instruments for the melody row + Magic Keys */
var INST_A=[{id:'piano',e:'🎹',n:'Piano'},{id:'guitar',e:'🎸',n:'Guitar'},{id:'robot',e:'🤖',n:'Robot'},{id:'kazoo',e:'🎺',n:'Kazoo'},{id:'chip',e:'👾',n:'8-bit'},{id:'bells',e:'🔔',n:'Bells'},{id:'ghost',e:'👻',n:'Ghost'},{id:'catchoir',e:'😺',n:'Cat choir'},{id:'tootophone',e:'💨',n:'Toot-o-phone'},{id:'digger',e:'🚜',n:'Digger horn'},{id:'airhorn',e:'📯',n:'Air horn'},{id:'honk',e:'🤡',n:'Honker'}];
var INST_Z=[{id:'piano',e:'🎹',n:'Piano'},{id:'bells',e:'✨',n:'Sparkle'},{id:'kitty',e:'🐱',n:'Kitty'},{id:'chip',e:'👾',n:'Beepy'},{id:'catchoir',e:'😺',n:'Kitty choir'},{id:'tootophone',e:'💨',n:'Toots'}];
/* presets: rows as strings of states (hex digits); Zoe ones are 8 steps */
var PRESETS={
 rock:{e:'🎸',n:'Rock',zn:'Rock Star',bpm:116,kit:'rock',inst:'guitar',zinst:'piano',scale:'major',key:0,prog:[0,0,5,7],
  a:{kick:'1000000110100000',clap:'0000100000001000',hat:'1010101010101010',bass:'1010101010103040',mel:'4004005004003020',toot:'0000000000000002'},
  z:{kick:'10001010',clap:'00100010',hat:'11111111',mel:'10101010',meme:'00000001'},zc:[1,3,4,3,5,4,3,2],
  band:['kick','clap','hat','bass','mel','toot']},
 game:{e:'🎮',n:'Video Game',zn:'Game Time',bpm:140,kit:'chip',inst:'chip',zinst:'chip',scale:'major',key:0,prog:[0,9,5,7],
  a:{kick:'1000100010001000',clap:'0000100000001000',hat:'0010001000100010',bass:'1030103010301030',mel:'1346134613461643',chick:'0000000000000100'},
  z:{kick:'10101010',clap:'00100010',hat:'01010101',mel:'11111111'},zc:[1,3,4,6,4,3,1,3],
  band:['kick','clap','hat','bass','mel','chick']},
 spooky:{e:'👻',n:'Spooky',zn:'Spooky-Cute',bpm:96,kit:'spooky',inst:'ghost',zinst:'bells',scale:'minor',key:-3,prog:[0,0,8,10],
  a:{kick:'1000000010000000',clap:'0000100000001000',hat:'0010001000100010',bass:'1000000010000040',mel:'6000500040003000',goat:'0000000000000003'},
  z:{kick:'10001000',clap:'00100010',hat:'01010101',mel:'10010010'},zc:[6,5,4,5,6,4,3,1],
  band:['kick','clap','hat','bass','mel','goat']},
 xmas:{e:'🎄',n:'Christmas',zn:'Jingle Bells',bpm:120,kit:'xmas',inst:'bells',zinst:'bells',scale:'major',key:0,prog:[0,0,5,7],
  a:{kick:'1000100010001000',clap:'0000100000001000',hat:'1010101010101010',bass:'1000200010002000',mel:'3330333034123000'},
  z:{kick:'10001000',clap:'00100010',hat:'11111111',mel:'11101110'},zc:[3,3,3,3,3,3,3,3],
  band:['kick','clap','hat','bass','mel']},
 silly:{e:'🤪',n:'Silly Band',zn:'Silly Party',bpm:108,kit:'acoustic',inst:'piano',zinst:'piano',scale:'major',key:0,prog:[0,5,9,7],
  a:{kick:'1000001010000000',clap:'0000100000001000',hat:'1010101010101011',bass:'1000003010000020',mel:'3000200010000000',toot:'0000000100000000',chick:'0000000000001000',burp:'0000000000000001'},
  z:{kick:'10001000',clap:'00100010',hat:'01110111',mel:'10101000',meme:'00010001'},zc:[3,2,1,2,3,3,3,3],
  band:['kick','clap','hat','bass','mel','toot','chick','burp']}};
var PRESET_ORDER=['rock','game','spooky','xmas','silly'];
var THEMES_A=[{id:'',n:'Neon Night',b:'linear-gradient(135deg,#3b1670,#1b0b3a)'},{id:'t-lava',n:'Lava',b:'linear-gradient(135deg,#ff6b35,#6b1a00)'},{id:'t-ocean',n:'Ocean',b:'linear-gradient(135deg,#4cf2ff,#035a7a)'},{id:'t-space',n:'Space',b:'linear-gradient(135deg,#1d1146,#000814)'}];
var THEMES_Z=[{id:'',n:'Pink Sparkle',b:'linear-gradient(135deg,#ffd6ec,#ff7fbf)'},{id:'t-unicorn',n:'Unicorn',b:'linear-gradient(135deg,#ead9ff,#9d72ff)'},{id:'t-rainbow',n:'Rainbow',b:'linear-gradient(90deg,#ff8fab,#ffd166,#9bf6ff,#bdb2ff)'},{id:'t-mermaid',n:'Mermaid',b:'linear-gradient(135deg,#c8fff4,#33c3b0)'}];
/* Zoe Magic Keys: letter + picture (just for fun) */
var ZPICS={C:'🐱',D:'🐶',E:'🐘',G:'🦒',A:'🐊'};
var NOTE_NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
/* sample files (CC0, see CREDITS.md) */
var SAMPLES=['kick','kick808','snare','clap','hat','sleigh','piano_c4','piano_c5','bell_f5','meow','toot6','toot7','chick1','chick2','goat1','goat3','burp1','burp2','boing1','cheer','sparkle','pop','duck','squeak','click','wow','trombone','whee2','v_hey','v_yeah','v_woohoo','v_uhoh','fart1','fart2','toot8','honk1','horn_dig'];
var CHOPS=[{id:'v_hey',n:'Hey!'},{id:'v_yeah',n:'Yeah!'},{id:'v_woohoo',n:'Woo hoo!'},{id:'v_uhoh',n:'Uh oh!'}];
var FX=[{id:'normal',e:'🙂',n:'Normal'},{id:'chip',e:'🐿️',n:'Chipmunk'},{id:'robot',e:'🤖',n:'Robot'},{id:'monster',e:'👹',n:'Monster'}];
