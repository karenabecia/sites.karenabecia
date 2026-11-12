(()=>{'use strict';
const api=window.UauSupabase,$=selector=>document.querySelector(selector);
let board=null,implementations=[],rounds=[],rewards=[],pendingClose=null;
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
const localDate=value=>{if(!value)return 'Data da segunda aula pendente';const date=new Date(value);return Number.isNaN(date.getTime())?'Data pendente':new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(date)};
const divisionName=code=>({Quasar:'Ouro',Pulsar:'Prata',Nebula:'Bronze'}[code]||'A definir');
const roundTitle=row=>String(row.implementation_number-1).padStart(2,'0')+' · '+row.title;
function estimate(row){const lessons=row.lessons||[];const lesson=lessons.at(-1);if(!lesson)return null;if(lesson.scheduled_at){const date=new Date(lesson.scheduled_at);return Number.isNaN(date.getTime())?null:new Date(date.getTime()+(Number(lesson.duration_minutes)||60)*60000+15*86400000).toISOString()}if(lesson.scheduled_date){const date=new Date(lesson.scheduled_date+'T00:00:00-03:00');return Number.isNaN(date.getTime())?null:new Date(date.getTime()+16*86400000).toISOString()}return null}
function render(){
  $('#activeTotal').textContent=board.active_total;
  $('#lastClosed').textContent=board.last_closed_number?('Implementação '+(board.last_closed_number-1)):'Nenhuma';
  $('#nextClose').textContent=board.next_number<=11?localDate(board.next_eligible_at):'Todas concluídas';
  $('#roundList').innerHTML=implementations.filter(row=>row.implementation_number>=2&&row.implementation_number<=11).map(row=>{
    const number=row.implementation_number,closed=rounds.find(item=>item.implementation_number===number),next=number===board.next_number;
    const eligible=next?board.next_eligible_at:estimate(row),ready=next&&eligible&&Date.now()>=Date.parse(eligible);
    return '<div class="round '+(closed?'closed':next?'active':'')+'"><div><strong>'+esc(roundTitle(row))+'</strong><small>'+(closed?'Fechada em '+localDate(closed.closed_at):'Fechamento: '+localDate(eligible)+(next&&!ready?' · aguardando prazo':''))+'</small></div>'+(closed?'<span>✓ Fechada</span>':next?'<button class="btn" data-close="'+number+'" '+(ready?'':'disabled')+'>Fechar rodada</button>':'<span>Aguardando rodadas anteriores</span>')+'</div>';
  }).join('');
  const rows=board.rows||[];
  $('#board').innerHTML='<div class="board-row board-header"><span>#</span><span>Aluno</span><span>Divisão</span><span>XP</span></div>'+(rows.length?rows.map(row=>'<div class="board-row"><span>'+esc(row.position)+'</span><span>'+esc(row.full_name)+'</span><span>'+divisionName(row.division)+'</span><span>'+esc(row.points)+'</span></div>').join(''):'<p>Assim que os alunos pontuarem, a classificação aparecerá aqui.</p>');
  const previous=$('#rewardRound').value;
  $('#rewardRound').innerHTML=implementations.filter(row=>row.implementation_number>=2&&row.implementation_number<=11).map(row=>'<option value="'+row.implementation_number+'">'+esc(roundTitle(row))+'</option>').join('');
  $('#rewardRound').value=previous||String(board.next_number<=11?board.next_number:11);
  fillRewardForm();fillFinalForm();
}
function rewardValue(number,key){return rewards.find(row=>row.implementation_number===number&&row.reward_key===key)?.description||''}
function fillRewardForm(){const number=Number($('#rewardRound').value);for(let i=1;i<=3;i++)$('#roundGold'+i).value=rewardValue(number,'round_gold_'+i)}
function fillFinalForm(){$('#finalGold').value=rewardValue(12,'final_gold');$('#finalTop3').value=rewardValue(12,'final_top3');$('#finalFirst').value=rewardValue(12,'final_first')}
async function load(){[board,implementations,rounds,rewards]=await Promise.all([
  api.rpc('uaulingo_league_board'),
  api.table('uaulingo_implementations','?select=implementation_number,title,lessons&order=implementation_number.asc'),
  api.table('uaulingo_league_rounds','?select=implementation_number,closed_at&order=implementation_number.asc'),
  api.table('uaulingo_league_rewards','?select=implementation_number,reward_key,description')
]);render()}
async function saveRewards(number,values,statusId,button){const status=$(statusId);status.textContent='';button.disabled=true;try{
  const rows=Object.entries(values).map(([reward_key,description])=>({implementation_number:number,reward_key,description:description.trim(),updated_at:new Date().toISOString()}));
  await api.table('uaulingo_league_rewards','?on_conflict=implementation_number,reward_key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(rows)});
  rewards=await api.table('uaulingo_league_rewards','?select=implementation_number,reward_key,description');
  status.style.color='#087744';status.textContent='✓ Prêmios salvos.';
}catch(error){status.style.color='#8b2551';status.textContent=error.message||'Não foi possível salvar.'}finally{button.disabled=false}}
function askClose(number){const row=implementations.find(item=>item.implementation_number===number);if(!row)return;pendingClose=number;
  const dialog=document.createElement('div');dialog.className='confirm';dialog.id='closeConfirm';dialog.innerHTML='<div class="confirm-box" role="dialog" aria-modal="true" aria-labelledby="closeTitle"><h2 id="closeTitle">Fechar esta rodada?</h2><p>'+esc(roundTitle(row))+'</p><p>O fechamento classificará todos os alunos ativos, atualizará as divisões e enviará o resultado por notificação. Esta ação não pode ser desfeita pelo painel.</p><div class="confirm-actions"><button type="button" class="btn secondary" id="cancelClose">Cancelar</button><button type="button" class="btn" id="confirmClose">Confirmar fechamento</button></div></div>';
  document.body.appendChild(dialog);$('#cancelClose').onclick=()=>{dialog.remove();pendingClose=null};$('#confirmClose').onclick=async()=>{const button=$('#confirmClose');button.disabled=true;button.textContent='Fechando…';try{await api.rpc('uaulingo_close_league_round',{p_implementation_number:pendingClose});dialog.remove();pendingClose=null;await load();$('#pageStatus').style.color='#087744';$('#pageStatus').textContent='✓ Rodada fechada. As divisões e notificações foram atualizadas.'}catch(error){button.disabled=false;button.textContent='Tentar novamente';$('#pageStatus').style.color='#8b2551';$('#pageStatus').textContent=error.message||'Não foi possível fechar a rodada.'}};
}
$('#rewardRound').addEventListener('change',fillRewardForm);
$('#rewardsForm').addEventListener('submit',event=>{event.preventDefault();saveRewards(Number($('#rewardRound').value),{round_gold_1:$('#roundGold1').value,round_gold_2:$('#roundGold2').value,round_gold_3:$('#roundGold3').value},'#rewardStatus',event.submitter)});
$('#finalForm').addEventListener('submit',event=>{event.preventDefault();saveRewards(12,{final_gold:$('#finalGold').value,final_top3:$('#finalTop3').value,final_first:$('#finalFirst').value},'#finalStatus',event.submitter)});
$('#roundList').addEventListener('click',event=>{const button=event.target.closest('[data-close]');if(button&&!button.disabled)askClose(Number(button.dataset.close))});
$('#logoutButton').addEventListener('click',async()=>{await api.signOut();location.replace('uaulingo-admin-alunos.html')});
(async()=>{try{const session=await api.session();if(!session?.user){location.replace('uaulingo-admin-alunos.html');return}const staff=await api.table('uaulingo_staff',`?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`);if(!staff?.length){location.replace('uaulingo-admin-alunos.html');return}$('#page').hidden=false;await load()}catch(error){$('#page').hidden=false;$('#pageStatus').textContent=error.message||'Não foi possível carregar o ranking.'}})();
})();
