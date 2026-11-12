(() => {
  const api=window.UauSupabase,$=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let currentUser='',notices=[],readIds=new Set(),filter='all';
  const previewLink=document.createElement('a');previewLink.href='uaulingo.html';previewLink.textContent='Ver avisos na área do aluno de teste →';previewLink.style.cssText='display:inline-block;margin-top:12px;color:#7432a0;font-size:.82rem;font-weight:900;text-decoration:none';$('#sendPanel').appendChild(previewLink);
  const date=value=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(value));
  function render(){
    const shown=notices.filter(item=>filter==='all'||(filter==='read'&&readIds.has(item.id))||(filter==='unread'&&!readIds.has(item.id)));
    const unread=notices.filter(item=>!readIds.has(item.id)).length;
    $('#receivedTab').textContent=`Minhas notificações${unread?` (${unread} não lidas)`:''}`;
    $('#receivedList').innerHTML=shown.length?shown.map(item=>{const href=item.challenge_submission_id?`uaulingo-admin-desafios.html?submission=${encodeURIComponent(item.challenge_submission_id)}`:item.support_ticket_id?`uaulingo-admin-atendimentos.html?ticket=${encodeURIComponent(item.support_ticket_id)}`:item.category?.startsWith('support_')?'uaulingo-admin-atendimentos.html':item.category?.startsWith('challenge')?'uaulingo-admin-desafios.html':'';return `<article class="notice-row ${readIds.has(item.id)?'':'unread'}"><div>${href?`<a class="notice-destination" href="${href}">`:''}<strong>${esc(item.title)}</strong><small>${esc(date(item.created_at))} · ${readIds.has(item.id)?'Lida':'Não lida'}</small><p>${esc(item.details)}</p>${href?'<span class="notice-open">Abrir '+(item.category?.startsWith('support_')?'atendimento':'desafio')+' →</span></a>':''}</div>${readIds.has(item.id)?'':`<button class="btn purple" type="button" data-read="${esc(item.id)}">Marcar como lida</button>`}</article>`}).join(''):'<div class="empty">Nenhuma notificação neste filtro.</div>';
  }
  async function load(){
    const [messages,reads]=await Promise.all([
      api.table('uaulingo_staff_notifications','?select=id,category,title,details,created_at,challenge_submission_id,support_ticket_id&order=created_at.desc&limit=100'),
      api.table('uaulingo_staff_notification_reads',`?select=notification_id&staff_user_id=eq.${currentUser}`)
    ]);
    notices=messages;readIds=new Set(reads.map(item=>item.notification_id));render();
  }
  function tab(name){
    $('#receivedPanel').hidden=name!=='received';$('#sendPanel').hidden=name!=='send';
    $('#receivedTab').classList.toggle('active',name==='received');$('#sendTab').classList.toggle('active',name==='send');
  }
  $('#receivedTab').onclick=()=>tab('received');$('#sendTab').onclick=()=>tab('send');
  document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>item.classList.toggle('active',item===button));render()});
  $('#receivedList').addEventListener('click',async event=>{
    const button=event.target.closest('[data-read]');if(!button)return;button.disabled=true;$('#receivedStatus').textContent='';
    try{await api.table('uaulingo_staff_notification_reads','',{method:'POST',body:JSON.stringify({notification_id:button.dataset.read,staff_user_id:currentUser})});readIds.add(button.dataset.read);render();window.dispatchEvent(new Event('UauStaffNoticesChanged'))}
    catch(error){$('#receivedStatus').textContent=error.message||'Não foi possível marcar como lida.';button.disabled=false}
  });
  $('#noticeForm').onsubmit=async event=>{
    event.preventDefault();const form=event.target,button=form.querySelector('button');button.disabled=true;$('#sendStatus').textContent='Enviando aviso...';
    try{const count=await api.rpc('uaulingo_send_announcement',{p_emoji:form.elements.emoji.value.trim(),p_title:form.elements.title.value.trim(),p_details:form.elements.details.value.trim()});$('#sendStatus').textContent=`Aviso enviado para ${count} aluno(s) ativos.`;form.reset();form.elements.emoji.value='📣'}
    catch(error){$('#sendStatus').textContent=error.message||'Não foi possível enviar o aviso.'}
    finally{button.disabled=false}
  };
  $('#logoutButton').onclick=()=>api.signOut().finally(()=>location.href='uaulingo-admin-alunos.html');
  const style=document.createElement('style');style.textContent='.notice-destination{display:block;color:inherit}.notice-destination:hover strong,.notice-destination:focus-visible strong{text-decoration:underline}.notice-open{display:inline-block;margin-top:7px;color:#147c4b;font-size:.8rem;font-weight:900}';document.head.appendChild(style);
  (async()=>{
    const session=await api.session();if(!session?.user?.id){location.replace('uaulingo-admin-alunos.html');return}
    currentUser=session.user.id;
    const staff=await api.table('uaulingo_staff',`?select=role&user_id=eq.${currentUser}`);
    if(!staff.length){location.replace('uaulingo-admin-alunos.html');return}
    if(staff[0].role!=='admin')$('#sendTab').hidden=true;
    $('#page').hidden=false;await load();await window.UauLoading.complete();setInterval(()=>load().catch(error=>{$('#receivedStatus').textContent=error.message||'Não foi possível atualizar as notificações.'}),60000);
  })().catch(async error=>{$('#page').hidden=false;$('#receivedStatus').textContent=error.message||'Não foi possível carregar as notificações.';await window.UauLoading.complete()});
})();
