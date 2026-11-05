(()=>{
  'use strict';
  const existing=document.getElementById('loader');
  if(!existing){
    const style=document.createElement('style');
    style.textContent='.uau-load[hidden]{display:none!important}.uau-load{position:fixed;z-index:90;inset:0;background:#f7f8f1f4;display:grid;place-items:center;backdrop-filter:blur(5px)}.uau-load-box{width:min(86vw,370px);padding:28px;background:white;border:2px solid #8c38b4;border-radius:15px;box-shadow:7px 7px 0 #1d0a3b25;text-align:center}.uau-load-label{font:900 .72rem monospace;letter-spacing:.08em;color:#7439a0;margin:0 0 16px}.uau-load-track{display:grid;grid-template-columns:repeat(12,1fr);gap:3px;background:#1d0a3b;padding:3px;border:2px solid #63338d;border-radius:5px;height:23px}.uau-load-track span{background:#e7dcf4}.uau-load-track span.filled{background:var(--fill);box-shadow:inset 0 -3px 0 #0002}.uau-load-percent{display:block;margin-top:11px;color:#744a92;font:900 .7rem monospace}';
    document.head.appendChild(style);
    const overlay=document.createElement('div');overlay.className='uau-load';overlay.id='loader';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');overlay.innerHTML='<div class="uau-load-box"><p class="uau-load-label" id="loadLabel">CARREGANDO</p><div class="uau-load-track" id="loadTrack" aria-hidden="true"></div><span class="uau-load-percent" id="loadPercent">0%</span></div>';
    document.body.appendChild(overlay);
  }
  const loader=document.getElementById('loader'),track=document.getElementById('loadTrack'),percent=document.getElementById('loadPercent');
  track.innerHTML=Array.from({length:12},(_,i)=>`<span style="--fill:${i<7?'#16c76a':'#a837f2'}"></span>`).join('');
  const cells=[...track.children],reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const started=performance.now();let value=0,finishing=false,finishAt=0,finishFrom=0,resolveFinish;
  const finished=new Promise(resolve=>{resolveFinish=resolve});
  loader.hidden=false;
  function draw(now){
    if(finishing){const duration=reduced?0:Math.max(180,480-(finishAt-started));value=duration?Math.min(1,finishFrom+(1-finishFrom)*(now-finishAt)/duration):1;}
    else value=reduced?0.9:Math.min(0.9,(now-started)/680*0.9);
    const count=value>=1?12:Math.floor(value*12);
    cells.forEach((cell,index)=>cell.classList.toggle('filled',index<count));
    percent.textContent=Math.round(value*100)+'%';
    if(value<1)requestAnimationFrame(draw);
    else setTimeout(()=>{loader.hidden=true;resolveFinish()},reduced?0:100);
  }
  requestAnimationFrame(draw);
  window.UauLoading={
    complete(){if(!finishing){finishing=true;finishAt=performance.now();finishFrom=value}return finished},
    label(text){document.getElementById('loadLabel').textContent=text}
  };
})();
