(()=>{
  'use strict';
  const steps=[
    {speaker:'excelo',pose:0,title:'Oi! Eu sou o Excelo.',text:'Vou ajudar você a transformar dados em descobertas. Cada região do mapa é uma implementação da nossa jornada de Excel e IA.'},
    {speaker:'gptina',pose:0,title:'E eu sou a GPTina!',text:'Vamos explorar a inteligência artificial juntos. Mostraremos onde encontrar as aulas, acompanhar seus pontos e pedir ajuda.'},
    {speaker:'excelo',pose:0,view:'map',target:'#chapter-0 .map-stop.lesson',title:'Este é o seu mapa.',text:'Role para descobrir novos cenários. Cada implementação tem três marcadores: aula, exercício e desafio. O ✓ mostra o que você já concluiu.'},
    {speaker:'gptina',pose:2,view:'schedule',target:'#view-schedule .page-head',title:'Aqui está o cronograma.',text:'Abra uma implementação para consultar as datas e os detalhes das aulas. Você pode voltar às etapas anteriores quando quiser.'},
    {speaker:'excelo',pose:5,view:'challenge',target:'#view-challenge .challenge-main',title:'Pronto para um desafio?',text:'Aqui aparece sua próxima tarefa. Quando o desafio pedir uma entrega, envie o link para a equipe avaliar.'},
    {speaker:'excelo',pose:2,view:'ranking',target:'#view-ranking .my-league',title:'Acompanhe sua divisão.',text:'No ranking, você vê seus XP e sua posição na Nebula, Pulsar ou Quasar. As posições mudam conforme as etapas são validadas.'},
    {speaker:'gptina',pose:5,view:'achievements',target:'#view-achievements .page-head',title:'Colecione conquistas!',text:'A página Conquistas reúne as habilidades desbloqueadas ao longo da jornada e os certificados disponíveis.'},
    {speaker:'gptina',pose:1,view:'support',target:'#view-support .page-head',title:'Pode chamar a equipe.',text:'No Suporte VIP, abra uma conversa privada para cada dúvida. Você pode escrever, anexar arquivos e acompanhar as respostas.'},
    {speaker:'excelo',pose:0,view:'map',target:'#studentBell',title:'Fique de olho nos avisos.',text:'As notificações mostram respostas, pontuações e novidades. Agora você já sabe por onde começar: seu primeiro marcador está no mapa!'}
  ];
  const overlay=document.createElement('div');
  overlay.className='tour-overlay';overlay.hidden=true;
  overlay.innerHTML='<div class="tour-spotlight" aria-hidden="true"></div><section class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tourTitle" aria-describedby="tourText"><div class="tour-top"><span id="tourCounter"></span><button class="tour-skip" type="button" data-tour="skip">Pular tutorial</button></div><div class="tour-story"><div class="tour-character" role="img"></div><div class="tour-bubble"><span class="tour-speaker" id="tourSpeaker"></span><h2 id="tourTitle"></h2><p id="tourText"></p></div></div><div class="tour-progress" id="tourProgress" aria-label="Progresso do tutorial"></div><p class="tour-error" id="tourError" role="alert" hidden></p><div class="tour-actions"><button class="tour-back" type="button" data-tour="back">Voltar</button><button class="tour-next" type="button" data-tour="next">Entendi, próximo →</button></div><p class="tour-note">Você pode rever a visita em “Como jogar”.</p></section>';
  const $=selector=>overlay.querySelector(selector);
  let index=0,open=false,busy=false,storageKey='uaulingo-tour-v2-local',previousFocus=null;
  function visibleTarget(selector){return [...document.querySelectorAll(selector)].find(el=>{const box=el.getBoundingClientRect();return box.width>0&&box.height>0&&getComputedStyle(el).visibility!=='hidden'})||null}
  function setView(name){if(!name)return;const current=document.querySelector('.view.active')?.id;if(current==='view-'+name)return;const nav=[...document.querySelectorAll('[data-view="'+name+'"]')].find(el=>el.closest('.sidebar'))||document.querySelector('[data-view="'+name+'"]');nav?.click()}
  function place(){
    if(!open)return;
    const step=steps[index],target=step.target?visibleTarget(step.target):null,spot=$('.tour-spotlight'),card=$('.tour-card');
    if(!target){overlay.classList.remove('is-guided');spot.hidden=true;card.style.removeProperty('top');card.style.removeProperty('left');card.style.removeProperty('right');card.style.removeProperty('bottom');return}
    overlay.classList.add('is-guided');spot.hidden=false;
    const box=target.getBoundingClientRect(),pad=7;
    Object.assign(spot.style,{top:Math.max(3,box.top-pad)+'px',left:Math.max(3,box.left-pad)+'px',width:Math.min(innerWidth-box.left+pad,box.width+pad*2)+'px',height:box.height+pad*2+'px'});
    if(innerWidth<=720){card.style.left='12px';card.style.right='12px';card.style.top=box.top>innerHeight*.55?'14px':'auto';card.style.bottom=box.top>innerHeight*.55?'auto':'max(12px, env(safe-area-inset-bottom))'}
    else{card.style.bottom='auto';card.style.top=Math.max(18,Math.min(innerHeight-card.offsetHeight-18,box.top+box.height/2-card.offsetHeight/2))+'px';if(box.left+box.width/2<innerWidth/2){card.style.left='auto';card.style.right='24px'}else{card.style.left='24px';card.style.right='auto'}}
  }
  function render(){
    const step=steps[index],character=$('.tour-character');
    character.className='tour-character '+step.speaker;
    character.style.setProperty('--pose-x',(step.pose%3)*50+'%');character.style.setProperty('--pose-y',step.pose>=3?'100%':'0%');
    character.setAttribute('aria-label',step.speaker==='excelo'?'Excelo':'GPTina');
    $('#tourCounter').textContent='VISITA GUIADA · '+(index+1)+'/'+steps.length;
    $('#tourSpeaker').textContent=step.speaker==='excelo'?'EXCELO FALA':'GPTINA FALA';
    $('#tourTitle').textContent=step.title;$('#tourText').textContent=step.text;
    $('#tourProgress').innerHTML=steps.map((_,i)=>'<i class="'+(i<index?'done':i===index?'current':'')+'" title="Etapa '+(i+1)+(i<index?' concluída':'')+'"></i>').join('');
    $('[data-tour="back"]').hidden=index===0;
    $('[data-tour="next"]').textContent=index===steps.length-1?'Concluir tutorial':'Entendi, próximo →';
    $('#tourError').hidden=true;
    setView(step.view);
    const target=step.target?visibleTarget(step.target):null;
    target?.scrollIntoView({block:'center',behavior:'auto'});
    requestAnimationFrame(()=>requestAnimationFrame(place));
  }
  function show(){if(open)return;previousFocus=document.activeElement;index=0;open=true;overlay.hidden=false;document.body.style.overflow='hidden';render();$('[data-tour="next"]').focus()}
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
  document.addEventListener('keydown',event=>{if(!open)return;if(event.key==='Escape'){close(true);return}if(event.key==='Tab'){const buttons=[...overlay.querySelectorAll('button:not([hidden])')],first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
  document.addEventListener('click',event=>{if(event.target.closest('[data-open-tour]'))show()});
  window.addEventListener('resize',place);
  document.addEventListener('DOMContentLoaded',async()=>{document.body.appendChild(overlay);const access=await window.UauStudentGate?.ready?.();if(!access)return;try{const session=await window.UauSupabase?.session?.();if(session?.user?.id)storageKey='uaulingo-tour-v2-'+session.user.id}catch{}const forced=new URLSearchParams(location.search).get('tutorial')==='1';let seen=false;try{seen=localStorage.getItem(storageKey)==='1'}catch{}if(forced||!seen)setTimeout(show,700)});
  window.UauTour={open:show};
})();
