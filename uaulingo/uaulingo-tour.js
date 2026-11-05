(()=>{
  'use strict';
  const steps=[
    {icon:'★',title:'Boas-vindas ao Uau Língo!',text:'Excelo e GPTina vão acompanhar você em uma jornada de Excel e inteligência artificial. Cada região do mapa é uma implementação.',theme:'green'},
    {icon:'▧',title:'Siga o mapa',text:'Role para baixo para encontrar as próximas implementações. O destaque “Continuar de onde parou” leva você ao próximo passo; as etapas anteriores continuam disponíveis.',theme:'green'},
    {icon:'✓',title:'Três passos por implementação',text:'Abra a aula, responda ao exercício e envie o link do desafio. Um ✓ indica o que você já concluiu. Seus pontos aparecem no topo quando a etapa for validada.',theme:'purple'},
    {icon:'▤',title:'Acompanhe as datas',text:'No Cronograma, toque em uma implementação para ver suas aulas e as datas de liberação. O mapa também mostra a próxima aula em destaque.',theme:'green'},
    {icon:'▦',title:'Conte com o Suporte VIP',text:'Ficou com uma dúvida? Abra o Suporte VIP e inicie uma conversa privada com a equipe. Acompanhe respostas e avisos pelas notificações.',theme:'purple'}
  ];
  let index=0,open=false,storageKey='uaulingo-tour-v1-local',previousFocus=null;
  const overlay=document.createElement('div');
  overlay.className='tour-overlay';overlay.hidden=true;
  overlay.innerHTML='<section class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tourTitle" aria-describedby="tourText"><div class="tour-top"><span id="tourCounter"></span><button type="button" class="tour-skip" data-tour="skip">Pular tutorial</button></div><div class="tour-art" aria-hidden="true"><span class="tour-art-icon" id="tourIcon"></span></div><h2 id="tourTitle"></h2><p id="tourText"></p><div class="tour-progress" id="tourProgress" aria-hidden="true"></div><div class="tour-actions"><button class="tour-back" type="button" data-tour="back">Voltar</button><button class="tour-next" type="button" data-tour="next">Próximo →</button></div><p class="tour-note">Você pode rever este guia em “Como jogar”.</p></section>';
  const $=s=>overlay.querySelector(s);
  function render(){const step=steps[index];$('.tour-card').dataset.theme=step.theme;$('#tourCounter').textContent=`COMO JOGAR · ${index+1}/${steps.length}`;$('#tourIcon').textContent=step.icon;$('#tourTitle').textContent=step.title;$('#tourText').textContent=step.text;$('#tourProgress').innerHTML=steps.map((_,i)=>`<i class="${i<index?'active':i===index?'current':''}"></i>`).join('');$('[data-tour="back"]').hidden=index===0;$('[data-tour="next"]').textContent=index===steps.length-1?'Começar jornada →':'Próximo →';}
  function show(){previousFocus=document.activeElement;index=0;render();overlay.hidden=false;open=true;document.body.style.overflow='hidden';$('[data-tour="next"]').focus();}
  function close(){if(!open)return;overlay.hidden=true;open=false;document.body.style.overflow='';try{localStorage.setItem(storageKey,'1')}catch{}previousFocus?.focus?.();}
  async function complete(){
    const next=$('[data-tour="next"]');next.disabled=true;next.textContent='Salvando…';
    try{
      const context=window.UauStudentContext;
      let points=0;
      if(context){points=Number(await window.UauSupabase.rpc('uaulingo_complete_tutorial'))||0;context.xp+=points;const xp=document.querySelector('#topXP');if(xp)xp.textContent=context.xp}
      else {
        const rewardKey=storageKey+'-reward';
        if(localStorage.getItem(rewardKey)!=='1'){localStorage.setItem(rewardKey,'1');points=10}
      }
      if(points)window.dispatchEvent(new CustomEvent('uaulingo:tour-reward',{detail:{points}}));
      close();document.querySelector('[data-view="map"]')?.click();
    }catch(error){next.disabled=false;next.textContent='Tentar novamente';$('#tourText').textContent='Não foi possível salvar os pontos agora. Confira sua conexão e tente novamente.'}
  }
  overlay.addEventListener('click',event=>{const action=event.target.closest('[data-tour]')?.dataset.tour;if(action==='skip'){close();return}if(action==='back'){index=Math.max(0,index-1);render();return}if(action==='next'){if(index===steps.length-1){complete();return}index++;render();}});
  document.addEventListener('keydown',event=>{if(!open)return;if(event.key==='Escape')close();if(event.key==='Tab'){const buttons=[...overlay.querySelectorAll('button:not([hidden])')];const first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
  document.addEventListener('click',event=>{if(event.target.closest('[data-open-tour]'))show()});
  document.addEventListener('DOMContentLoaded',async()=>{document.body.appendChild(overlay);const access=await window.UauStudentGate?.ready?.();if(!access)return;try{const session=await window.UauSupabase?.session?.();if(session?.user?.id)storageKey='uaulingo-tour-v1-'+session.user.id}catch{}const forced=new URLSearchParams(location.search).get('tutorial')==='1';let seen=false;try{seen=localStorage.getItem(storageKey)==='1'}catch{}if(forced||!seen)setTimeout(show,450)});
  window.UauTour={open:show};
})();
