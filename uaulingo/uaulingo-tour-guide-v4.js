(()=>{
  'use strict';
  const steps=[
    {speaker:'excelo',pose:0,title:'Oi! Eu sou o Excelo.',text:'Vou ajudar você a criar o Efeito UAU com suas planilhas. No mapa estão as implementações, aulas, exercícios e materiais.'},
    {speaker:'excelo',pose:5,view:'map',title:'Complete os primeiros passos.',text:'Conclua o nível 1 para começar sua jornada e receber todos os avisos.'},
    {speaker:'gptina',pose:0,title:'Eu sou a GPTina!',text:'Vamos usar IA para analisar dados. Cada nível tem três etapas: aulas e materiais, exercício para ganhar XP e desafio prático.'},
    {speaker:'excelo',pose:0,view:'map',targetView:'map',title:'Mapa da Jornada',text:'Role pelo mapa para descobrir novos cenários e desafios. Ao concluir um nível, você desbloqueia uma conquista.'},
    {speaker:'gptina',pose:5,view:'achievements',targetView:'achievements',title:'Conquistas',text:'Cada implementação concluída poderá render um certificado. Compartilhe sua conquista no LinkedIn e mostre seu Efeito UAU.'},
    {speaker:'gptina',pose:2,view:'schedule',targetView:'schedule',title:'Cronograma',text:'Consulte as datas, horários e detalhes das aulas. Adicione os encontros à sua agenda para não perder nada.'},
    {speaker:'excelo',pose:2,view:'ranking',targetView:'ranking',title:'Ranking',text:'Tudo o que você faz rende XP. Ao fim de cada nível, sua posição entre as divisões Bronze, Prata e Ouro pode mudar. Os ganhadores recebem prêmios.'},
    {speaker:'gptina',pose:1,view:'support',targetView:'support',title:'Suporte VIP',text:'Envie sua dúvida com texto, arquivo ou print. A equipe responderá por aqui e você receberá um aviso.'},
    {speaker:'excelo',pose:0,view:'map',target:'#studentBell',title:'Fique de olho nos avisos.',text:'Neste sino você acompanha respostas, pontos e novidades. Agora é só começar pelo mapa!'}
  ];
  const overlay=document.createElement('div');
  overlay.className='tour-overlay';overlay.hidden=true;
  overlay.innerHTML='<div class="tour-spotlight" aria-hidden="true"></div><section class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tourTitle" aria-describedby="tourText"><div class="tour-top"><span id="tourCounter"></span><button class="tour-skip" type="button" data-tour="skip">Pular tutorial</button></div><div class="tour-story"><div class="tour-character" role="img"></div><div class="tour-bubble"><h2 id="tourTitle"></h2><p id="tourText"></p></div></div><div class="tour-progress" id="tourProgress" aria-label="Progresso do tutorial"></div><p class="tour-error" id="tourError" role="alert" hidden></p><div class="tour-actions"><button class="tour-back" type="button" data-tour="back">Voltar</button><button class="tour-next" type="button" data-tour="next">Próximo</button></div><p class="tour-note">Você pode rever a visita em “Como jogar”.</p></section>';
  const $=selector=>overlay.querySelector(selector);
  let index=0,open=false,busy=false,storageKey='uaulingo-tour-v3-local',previousFocus=null,drag=null;
  function visibleTarget(selector){return [...document.querySelectorAll(selector)].find(el=>{const box=el.getBoundingClientRect();return box.width>0&&box.height>0&&getComputedStyle(el).visibility!=='hidden'})||null}
  function stepTarget(step){return step.target?visibleTarget(step.target):step.targetView?visibleTarget('.sidebar .side-nav .nav-item[data-view="'+step.targetView+'"]')||visibleTarget('.mobile-nav button[data-view="'+step.targetView+'"]'):null}
  function setView(name){if(!name)return;const current=document.querySelector('.view.active')?.id;if(current==='view-'+name)return;const nav=[...document.querySelectorAll('[data-view="'+name+'"]')].find(el=>el.closest('.sidebar'))||document.querySelector('[data-view="'+name+'"]');nav?.click()}
  function place(){
    if(!open)return;
    const step=steps[index],target=stepTarget(step),spot=$('.tour-spotlight');
    if(!target){overlay.classList.remove('is-guided');spot.hidden=true;return}
    overlay.classList.add('is-guided');spot.hidden=false;
    const box=target.getBoundingClientRect(),pad=7;
    Object.assign(spot.style,{top:Math.max(3,box.top-pad)+'px',left:Math.max(3,box.left-pad)+'px',width:Math.min(innerWidth-box.left+pad,box.width+pad*2)+'px',height:box.height+pad*2+'px'});
  }
  function render(){
    const step=steps[index],character=$('.tour-character');
    character.className='tour-character '+step.speaker;
    character.style.setProperty('--pose-x',(step.pose%3)*50+'%');character.style.setProperty('--pose-y',step.pose>=3?'100%':'0%');
    character.setAttribute('aria-label',step.speaker==='excelo'?'Excelo':'GPTina');
    $('#tourCounter').textContent='VISITA GUIADA · '+(index+1)+'/'+steps.length;
    $('#tourTitle').textContent=step.title;$('#tourText').textContent=step.text;
    $('#tourProgress').innerHTML=steps.map((_,i)=>'<i class="'+(i<index?'done':i===index?'current':'')+'" title="Etapa '+(i+1)+(i<index?' concluída':'')+'"></i>').join('');
    $('[data-tour="back"]').hidden=index===0;
    $('[data-tour="next"]').textContent=index===steps.length-1?'Concluir tutorial':'Próximo';
    $('#tourError').hidden=true;
    setView(step.view);
    requestAnimationFrame(()=>requestAnimationFrame(place));
  }
  function show(){if(open)return;previousFocus=document.activeElement;index=0;open=true;overlay.hidden=false;document.body.style.overflow='hidden';const card=$('.tour-card');card.style.left='50%';card.style.top='50%';card.style.transform='translate(-50%,-50%)';render();$('[data-tour="next"]').focus()}
  function close(markSeen){if(!open)return;open=false;overlay.hidden=true;document.body.style.overflow='';if(markSeen)try{localStorage.setItem(storageKey,'1')}catch{}document.querySelector('[data-view="map"]')?.click();previousFocus?.focus?.()}
  async function complete(){
    if(busy)return;busy=true;const next=$('[data-tour="next"]');next.disabled=true;next.textContent='Registrando seus pontos…';
    try{
      const context=window.UauStudentContext;let points=0;
      if(context){points=Number(await window.UauSupabase.rpc('uaulingo_complete_tutorial'))||0;context.xp+=points;context.ledger?.push({reason:'Tutorial concluído',xp:points})}
      else{const rewardKey=storageKey+'-reward';if(localStorage.getItem(rewardKey)!=='1'){localStorage.setItem(rewardKey,'1');points=10}}
      window.dispatchEvent(new CustomEvent('uaulingo:tour-reward',{detail:{points,completed:true}}));
      close(true);
    }catch(error){$('#tourError').textContent='Não conseguimos registrar o tutorial agora. Tente novamente. Se persistir, fale com o Suporte VIP.';$('#tourError').hidden=false;console.error('Falha ao concluir tutorial:',error);next.textContent='Tentar novamente'}
    finally{busy=false;next.disabled=false}
  }
  overlay.addEventListener('click',event=>{const action=event.target.closest('[data-tour]')?.dataset.tour;if(!action||busy)return;if(action==='skip')close(true);if(action==='back'){index=Math.max(0,index-1);render()}if(action==='next'){if(index===steps.length-1)complete();else{index++;render()}}});
  $('.tour-top').addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;const card=$('.tour-card'),box=card.getBoundingClientRect();drag={pointerId:event.pointerId,dx:event.clientX-box.left,dy:event.clientY-box.top};card.style.left=box.left+'px';card.style.top=box.top+'px';card.style.transform='none';$('.tour-top').setPointerCapture(event.pointerId);event.preventDefault()});
  $('.tour-top').addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointerId)return;const card=$('.tour-card');card.style.left=Math.max(8,Math.min(innerWidth-card.offsetWidth-8,event.clientX-drag.dx))+'px';card.style.top=Math.max(8,Math.min(innerHeight-card.offsetHeight-8,event.clientY-drag.dy))+'px'});
  $('.tour-top').addEventListener('pointerup',()=>{drag=null});
  $('.tour-top').addEventListener('pointercancel',()=>{drag=null});
  document.addEventListener('keydown',event=>{if(!open)return;if(event.key==='Escape'){close(true);return}if(event.key==='Tab'){const buttons=[...overlay.querySelectorAll('button:not([hidden])')],first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
  document.addEventListener('click',event=>{if(event.target.closest('[data-open-tour]'))show()});
  window.addEventListener('resize',place);
  document.addEventListener('DOMContentLoaded',async()=>{document.body.appendChild(overlay);const access=await window.UauStudentGate?.ready?.();if(!access)return;try{const session=await window.UauSupabase?.session?.();if(session?.user?.id)storageKey='uaulingo-tour-v3-'+session.user.id}catch{}const forced=new URLSearchParams(location.search).get('tutorial')==='1';let seen=false;try{seen=localStorage.getItem(storageKey)==='1'}catch{}if(forced||!seen){const begin=()=>setTimeout(show,450);if(document.documentElement.classList.contains('uau-map-loading'))window.addEventListener('uaulingo:map-loaded',begin,{once:true});else begin()}});
  window.UauTour={open:show};
})();
