(()=>{
  'use strict';
  const html=document.documentElement;
  html.classList.add('uau-map-loading');
  let ready=false,percent=0,timer;
  const assets=['uaulingo-logo.png','uaulingo-cenario-bosque-v2.png','uaulingo-cenario-vale-v2.png','uaulingo-cenario-prompts.png','uaulingo-cenario-graficos.png','uaulingo-cenario-oraculo.png','uaulingo-excelo-poses-implementacoes.png','uaulingo-gptina-poses-implementacoes.png','uaulingo-marcadores-excelo.png','uaulingo-marcadores-gptina.png','uaulingo-tutorial-icone.png','uaulingo-grupo-icone.png','uaulingo-onboarding-icone.png','uaulingo-seta-continuar.png'];
  function paint(value){percent=Math.max(percent,Math.min(100,value));const cells=document.querySelectorAll('.uau-map-loading-track i');cells.forEach((cell,index)=>cell.classList.toggle('filled',index<Math.floor(percent/100*cells.length)));}
  function start(){timer=setInterval(()=>{if(percent<88)paint(percent+2)},90)}
  async function imageReady(src){const img=new Image();img.src=src;try{if(img.decode)await img.decode();else await new Promise(resolve=>{img.onload=resolve;img.onerror=resolve})}catch{}}
  async function finish(){if(ready)return;ready=true;await Promise.allSettled([document.fonts?.ready||Promise.resolve(),...assets.map(imageReady)]);clearInterval(timer);paint(100);requestAnimationFrame(()=>requestAnimationFrame(()=>{html.classList.remove('uau-map-loading');document.querySelector('.uau-map-loading-screen')?.remove();window.dispatchEvent(new Event('uaulingo:map-loaded'))}))}
  window.UauMapLoading={finish};
  document.addEventListener('DOMContentLoaded',start,{once:true});
})();
