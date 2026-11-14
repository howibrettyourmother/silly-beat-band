import os,re,base64,shutil
D=os.path.dirname(os.path.abspath(__file__));R=os.path.dirname(D)
VER=open(f'{R}/VERSION').read().strip()
t=open(f'{D}/template.html').read()
files=sorted(f for f in os.listdir(D) if re.match(r'a\d_.*\.js$',f))
game='(function(){"use strict";\n'+'\n'.join(open(f'{D}/{f}').read() for f in files)+'\n})();'
game=game.replace('/*VER*/',VER)
t=t.replace('/*FONT*/',base64.b64encode(open(f'{D}/pm.woff2','rb').read()).decode()).replace('/*GAME*/',game).replace('/*VER*/',VER)
KH='/workspace/kids-hubs'
for tag in ('audio-guard[^*]*','hub-home','kids-play','sw-reload'):
  t=re.sub(r'<script>/\*'+tag+r'\*/.*?</script>\n?','',t,flags=re.S)
ag=open(f'{KH}/audioguard.js').read().strip()
m=re.search(r'<meta charset[^>]*>',t);t=t[:m.end()]+'\n'+ag+'\n'+t[m.end():]
sw="<script>if('serviceWorker' in navigator&&location.protocol==='https:'){addEventListener('load',function(){navigator.serviceWorker.register('sw.js?v=%s').catch(function(){})})}</script>"%VER
home=open(f'{KH}/home.js').read().strip().replace('%OWN%','alex').replace('%POS%','left:calc(8px + env(safe-area-inset-left));top:calc(14px + env(safe-area-inset-top))')
swr=open(f'{KH}/swfix.py').read();swr=re.search(r'SNIP="""(.*?)"""',swr,re.S).group(1)
play=open(f'{KH}/play.js').read().strip().replace('%GAME%','silly-beat-band').replace('%OWN%','alex')
i=t.rfind('</body>');t=t[:i]+sw+'\n'+home+'\n'+swr+'\n'+play+'\n'+t[i:]
open(f'{R}/index.html','w').write(t)
# service worker: precache everything shipped
A=['./','index.html','manifest.json','apple-touch-icon.png','apple-touch-icon-120.png','apple-touch-icon-152.png','apple-touch-icon-167.png','favicon-32.png','icon-192.png','icon-512.png']
for root,_,fs in os.walk(f'{R}/sfx'):
  for f in sorted(fs):
    p=os.path.relpath(os.path.join(root,f),R)
    if p.endswith(('.mp3','.json','.m4a','.ogg','.wav')):A.append(p)
import json
s=open(f'{D}/sw.tmpl.js').read().replace('%V%',VER).replace('%A%',json.dumps(A))
open(f'{R}/sw.js','w').write(s)
print('built',VER,len(t),'precache',len(A))
