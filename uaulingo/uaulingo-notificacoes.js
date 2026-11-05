(() => {
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let box,rows=[],filter='all',active='',readTimer;
  const date=value=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(value));
  async function load(){
    box=await window.UauStudentInbox.load();rows=box.rows;
    $('#demoLabel').hidden=box.mode==='student';
    $('#demoLabel').textContent=box.mode==='staff-preview'?`VISUALIZAÇÃO DE TESTE · ${box.studentName}`:'EXEMPLOS PARA TESTE';
    active=new URLSearchParams(location.search).get('id')||'';
    render();if(active)select(active);
  }
  function render(){
    const shown=rows.filter(row=>filter==='all'||(filter==='read'&&row.read_at)||(filter==='unread'&&!row.read_at));
    $('#noticeList').innerHTML=shown.length?shown.map(row=>`<button type="button" class="notice ${row.read_at?'':'unread'} ${row.id===active?'active':''}" data-id="${esc(row.id)}"><span class="emoji">${esc(row.emoji||'🔔')}</span><span><strong>${esc(row.title||'Aviso')}</strong><small>${esc(date(row.created_at))} · ${row.read_at?'Lida':'Não lida'}</small></span></button>`).join(''):'<p class="empty">Nenhuma notificação neste filtro.</p>';
    const row=rows.find(item=>item.id===active);
    $('#noticeDetail').innerHTML=row?`<span class="emoji">${esc(row.emoji||'🔔')}</span><h2>${esc(row.title||'Aviso')}</h2><small>${esc(date(row.created_at))}</small><p>${esc(row.details||((row.points||0)>0?`+${row.points} XP · ${row.reason}`:row.reason||''))}</p>${row.support_ticket_id?`<p><a href="uaulingo.html?view=support&ticket=${encodeURIComponent(row.support_ticket_id)}">Abrir conversa no Suporte VIP →</a></p>`:''}${row.read_at?'<span class="read-label">✓ Lida</span>':`<button class="mark" type="button" data-mark="${esc(row.id)}">Marcar como LIDO</button>`}`:'<p>Selecione uma notificação para ver os detalhes.</p>';
  }
  function select(id){
    clearTimeout(readTimer);active=id;render();
    const row=rows.find(item=>item.id===id);
    if(row&&!row.read_at)readTimer=setTimeout(()=>{if(active===id)markRead(id)},10000);
  }
  async function markRead(id){
    const row=rows.find(item=>item.id===id);if(!row||row.read_at)return;
    try{await window.UauStudentInbox.markRead(box,id);render()}
    catch(error){$('#status').textContent=error.message||'Não foi possível marcar como lida.'}
  }
  $('#noticeList').addEventListener('click',event=>{const button=event.target.closest('[data-id]');if(button)select(button.dataset.id)});
  $('#noticeDetail').addEventListener('click',event=>{const button=event.target.closest('[data-mark]');if(button){clearTimeout(readTimer);markRead(button.dataset.mark)}});
  document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{
    filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>item.classList.toggle('active',item===button));
    if(active&&!rows.some(row=>row.id===active&&(filter==='all'||(filter==='read'&&row.read_at)||(filter==='unread'&&!row.read_at)))){clearTimeout(readTimer);active=''}
    render();
  });
  load().catch(error=>{$('#status').textContent=error.message||'Não foi possível carregar as notificações.'});
})();
