(()=>{
  'use strict';
  const api=window.UauSupabase,$=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const date=value=>value?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(value)):'—';
  let tickets=[],filter='pending',selected='',messages=[];
  function renderList(){
    const email=$('#emailFilter').value.trim().toLowerCase();
    const shown=tickets.filter(item=>(filter==='all'||item.status===filter)&&(!email||item.uaulingo_students?.purchase_email?.toLowerCase().includes(email)));
    $('#ticketList').innerHTML=shown.length?shown.map(item=>`<button type="button" class="ticket ${selected===item.id?'selected':''}" data-ticket="${esc(item.id)}"><strong>${esc(item.subject)}</strong><small>${esc(item.uaulingo_students?.full_name||'Aluno')} · ${esc(item.uaulingo_students?.purchase_email||'')}</small><small>${esc(date(item.updated_at))} · <span class="state ${esc(item.status)}">${item.status==='pending'?'Pendente':item.status==='answered'?'Respondido':'Encerrado'}</span></small></button>`).join(''):'<div class="empty">Nenhum atendimento neste filtro.</div>';
  }
  function renderDetail(){
    const item=tickets.find(row=>row.id===selected);if(!item){$('#ticketDetail').innerHTML='<div class="empty">Selecione um atendimento para ver a conversa.</div>';return}
    $('#ticketDetail').innerHTML=`<h2>${esc(item.subject)}</h2><p class="muted">${esc(item.uaulingo_students?.full_name||'Aluno')} · ${esc(item.uaulingo_students?.purchase_email||'')}</p><div class="thread">${messages.map(message=>`<div class="message ${message.author_kind==='staff'?'staff':''}"><strong>${message.author_kind==='staff'?'Equipe':'Aluno'}</strong><div>${esc(message.body)}</div><small>${esc(date(message.created_at))}</small></div>`).join('')}</div>${item.status==='closed'?'':`<form id="replyForm" class="reply"><label for="replyBody"><strong>Responder ao aluno</strong></label><textarea id="replyBody" required maxlength="4000" placeholder="Escreva sua resposta..."></textarea><button class="btn green" type="submit">Enviar resposta</button></form>`}`;
  }
  async function load(){
    tickets=await api.table('uaulingo_support_tickets','?select=*,uaulingo_students(full_name,purchase_email)&order=updated_at.desc');
    renderList();window.dispatchEvent(new Event('UauAdminQueuesChanged'));
    if(selected&&tickets.some(item=>item.id===selected))await openTicket(selected);else renderDetail();
  }
  async function openTicket(id){selected=id;messages=await api.table('uaulingo_support_messages',`?select=id,author_kind,body,created_at&ticket_id=eq.${encodeURIComponent(id)}&order=created_at.asc`);renderList();renderDetail()}
  document.addEventListener('click',async event=>{const ticket=event.target.closest('[data-ticket]');if(ticket){try{await openTicket(ticket.dataset.ticket)}catch(error){$('#pageStatus').textContent=error.message||'Não foi possível abrir o atendimento.'}}const tab=event.target.closest('[data-filter]');if(tab){filter=tab.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>item.classList.toggle('active',item===tab));renderList()}});
  $('#emailFilter').addEventListener('input',renderList);
  $('#ticketDetail').addEventListener('submit',async event=>{if(event.target.id!=='replyForm')return;event.preventDefault();const body=$('#replyBody').value.trim(),button=event.target.querySelector('button');if(!body)return;button.disabled=true;$('#pageStatus').textContent='Enviando resposta...';try{await api.rpc('uaulingo_reply_support',{p_ticket_id:selected,p_body:body});await load();$('#pageStatus').textContent='Resposta enviada ao aluno.'}catch(error){$('#pageStatus').textContent=error.message||'Não foi possível enviar a resposta.';button.disabled=false}});
  $('#logoutButton').onclick=()=>api.signOut().finally(()=>location.href='uaulingo-admin-alunos.html');
  (async()=>{const session=await api.session();if(!session?.user?.id){location.replace('uaulingo-admin-alunos.html');return}const staff=await api.table('uaulingo_staff',`?select=role&user_id=eq.${session.user.id}`);if(!staff.length){location.replace('uaulingo-admin-alunos.html');return}$('#page').hidden=false;await load();await window.UauLoading.complete()})().catch(async error=>{$('#page').hidden=false;$('#pageStatus').textContent=error.message||'Não foi possível carregar os atendimentos.';await window.UauLoading.complete()});
})();
