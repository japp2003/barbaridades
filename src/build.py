import sys,glob,os
def QEXTRA():
    return ''.join(open(f).read()+'\n' for f in sorted(glob.glob(os.path.dirname(os.path.abspath(__file__))+'/q_*.js')))
W=os.path.dirname(os.path.abspath(__file__))+'/'
r=lambda f: open(W+f).read()
def build(gh):
    head=r('head.html')
    if gh:
        head+='\n<link rel="manifest" href="manifest.json"><meta name="theme-color" content="#D42E1B"><link rel="apple-touch-icon" href="icon-192.png">'
    else:
        head=head.replace('<script src="peerjs.min.js"></script>\n','').replace('<script src="peerjs.min.js"></script>','')
    s=head+'\n'+r('style.css')+'\n'+r('body.html')+'\n<script>\n'
    if gh: s+="window.ROOM_WS_URL='wss://barbaridades-salas.joseantonioparedes2003.workers.dev';\n"
    s+=r('qlib.js')+'\n'+QEXTRA()+r('net.js')+'\n'+r('game.js')+'\n</script>\n'
    if gh: s+="<script>if('serviceWorker' in navigator){addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}</script>\n"
    return s
open(os.path.join(W,'..','index.html'),'w').write(build(True))
open(W+'artifact.html','w').write(build(False))
