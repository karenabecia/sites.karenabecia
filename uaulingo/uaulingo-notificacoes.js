(() => {
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  document.body.insertAdjacentHTML('afterbegin','<aside class="student-sidebar" aria-label="Navegação do aluno"><a class="student-sidebar-logo" href="uaulingo.html"><img src="uaulingo-logo.png" alt="Uaulingo"></a><span class="student-sidebar-label">SUA JORNADA</span><nav><a href="uaulingo.html?view=map">▧ <span>Mapa da jornada</span></a><a href="uaulingo.html?view=schedule">▤ <span>Cronograma</span></a><a href="uaulingo.html?view=ranking">▥ <span>Ranking</span></a><a href="uaulingo.html?view=achievements">✦ <span>Conquistas</span></a><a href="uaulingo.html?view=support">▦ <span>Suporte VIP</span></a><a class="active" href="uaulingo-notificacoes.html" aria-current="page">♟ <span>Notificações</span></a></nav></aside>');
  const menuStyle=document.createElement('style');menuStyle.textContent='.student-sidebar{position:fixed;inset:0 auto 0 0;width:245px;height:100vh;overflow-y:auto;padding:26px 16px;background:linear-gradient(165deg,#063d2e,#071e22 65%,#1d0a3b);color:#e5f7e9;z-index:10}.student-sidebar:before{content:"";position:absolute;inset:0;background-image:linear-gradient(#ffffff10 1px,transparent 1px),linear-gradient(90deg,#ffffff10 1px,transparent 1px);background-size:26px 26px;pointer-events:none}.student-sidebar>*{position:relative}.student-sidebar-logo{display:block;margin:0 4px 35px}.student-sidebar-logo img{display:block;width:190px;max-width:100%;image-rendering:pixelated}.student-sidebar-label{display:block;padding:0 12px 10px;font:800 .66rem monospace;letter-spacing:.14em;color:#98caaa}.student-sidebar nav{display:grid;gap:5px}.student-sidebar nav a{display:flex;gap:12px;align-items:center;padding:12px;border-radius:9px;color:#e5f7e9;font-weight:800;font-size:.86rem}.student-sidebar nav a:hover{background:#ffffff1c}.student-sidebar nav a.active{background:#b5f8bd;color:#063d2e}.shell{margin-left:245px;max-width:none}.shell main,.shell .topbar{max-width:1120px;margin-left:auto;margin-right:auto}@media(max-width:750px){.student-sidebar{position:sticky;inset:auto;top:0;width:100%;height:auto;padding:7px 12px;display:flex;align-items:center;gap:10px;overflow-x:auto}.student-sidebar:before,.student-sidebar-label{display:none}.student-sidebar-logo{margin:0;flex:none}.student-sidebar-logo img{width:95px}.student-sidebar nav{display:flex;gap:3px;white-space:nowrap}.student-sidebar nav a{padding:8px;font-size:.7rem}.student-sidebar nav a span{display:none}.shell{margin-left:0}}';document.head.appendChild(menuStyle);
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
    $('#noticeDetail').innerHTML=row?`<span class="emoji">${esc(row.emoji||'🔔')}</span><h2>${esc(row.title||'Aviso')}</h2><small>${esc(date(row.created_at))}</small><p>${esc(row.details||((row.points||0)>0?`+${row.points} XP · ${row.reason}`:row.reason||''))}</p>${row.category==='terms'?'<p><a href="uaulingo-termo-vitalicio-2026-11-10.html" target="_blank" rel="noopener">Ler o termo completo ↗</a><br><a href="uaulingo.html?termo=1">Registrar meu aceite →</a></p>':''}${row.support_ticket_id?`<p><a href="uaulingo.html?view=support&ticket=${encodeURIComponent(row.support_ticket_id)}">Abrir conversa no Suporte VIP →</a></p>`:''}${row.category==='lesson'&&row.lesson_implementation_number&&row.lesson_number?`<p><a href="uaulingo-aula.html?implementacao=${Number(row.lesson_implementation_number)}&aula=${Number(row.lesson_number)}" data-lesson-link="${esc(row.id)}">Assistir à aula e ver materiais →</a></p>`:''}${row.read_at?'<span class="read-label">✓ Lida</span>':`<button class="mark" type="button" data-mark="${esc(row.id)}">Marcar como LIDO</button>`}`:'<p>Selecione uma notificação para ver os detalhes.</p>';
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
  $('#noticeList').addEventListener('click',event=>{const button=event.target.closest('[data-id]');if(!button)return;const row=rows.find(item=>item.id===button.dataset.id);if(row?.support_ticket_id){location.href=`uaulingo.html?view=support&ticket=${encodeURIComponent(row.support_ticket_id)}&notice=${encodeURIComponent(row.id)}`;return}if(row?.category==='lesson'&&row.lesson_implementation_number&&row.lesson_number){markRead(row.id).finally(()=>location.href=`uaulingo-aula.html?implementacao=${Number(row.lesson_implementation_number)}&aula=${Number(row.lesson_number)}`);return}select(button.dataset.id)});
  $('#noticeDetail').addEventListener('click',event=>{const button=event.target.closest('[data-mark]');if(button){clearTimeout(readTimer);markRead(button.dataset.mark)}const lessonLink=event.target.closest('[data-lesson-link]');if(lessonLink)markRead(lessonLink.dataset.lessonLink)});
  document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{
    filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(item=>item.classList.toggle('active',item===button));
    if(active&&!rows.some(row=>row.id===active&&(filter==='all'||(filter==='read'&&row.read_at)||(filter==='unread'&&!row.read_at)))){clearTimeout(readTimer);active=''}
    render();
  });
  load().catch(error=>{$('#status').textContent=error.message||'Não foi possível carregar as notificações.'});
})();
