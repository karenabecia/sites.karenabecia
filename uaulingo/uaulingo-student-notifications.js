(() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let knownIds=null,refreshing=false;
  async function refresh(){
    if(refreshing)return;
    refreshing=true;
    try{
      const box=await window.UauStudentInbox.load(),rows=box.rows;
      const badge=document.getElementById('studentNoticeCount'),panel=document.getElementById('studentNotices');if(!badge||!panel)return;
      const incoming=knownIds&&rows.find(row=>!knownIds.has(row.id));
      knownIds=new Set(rows.map(row=>row.id));
      const unread=rows.filter(row=>!row.read_at).length;badge.textContent=unread;badge.hidden=!unread;
      const short=value=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
      const context=box.mode==='staff-preview'?`<small>Visualização de teste: ${esc(box.studentName)}</small>`:box.mode==='demo'?'<small>Exemplos para teste</small>':'';
      panel.innerHTML='<strong>Suas notificações</strong>'+context+(rows.length?rows.slice(0,5).map(row=>`<a class="student-notice-preview ${row.read_at?'read':''}" href="${row.support_ticket_id?`uaulingo.html?view=support&ticket=${encodeURIComponent(row.support_ticket_id)}&notice=${encodeURIComponent(row.id)}`:`uaulingo-notificacoes.html?id=${encodeURIComponent(row.id)}`}"><span>${esc(row.emoji||'🔔')}</span><span><b>${esc(row.title||'Aviso')}</b><small>${esc(short(row.created_at))}${row.read_at?' · Lida':''}</small></span></a>`).join(''):'<p>Sem notificações.</p>')+'<a class="student-notice-all" href="uaulingo-notificacoes.html">Ver todas →</a>';
      if(incoming){const toast=document.getElementById('toast');if(toast){toast.textContent=`${incoming.emoji||'🔔'} ${incoming.title||'Nova notificação'}`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4500)}}
    }catch(error){console.warn('Notificações indisponíveis:',error?.message||error)}finally{refreshing=false}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const style=document.createElement('style');style.textContent='.student-notice-preview{display:flex;gap:9px;color:#253d30;text-decoration:none;border-bottom:1px solid #ece5f3;padding:10px 4px}.student-notice-preview.read{opacity:.65}.student-notice-preview b,.student-notice-preview small{display:block}.student-notice-preview small{font-size:.68rem;color:#718078}.student-notice-all{display:block;text-align:center;background:#efe4fb;color:#7432a0;text-decoration:none;border-radius:7px;padding:9px;font-weight:900;margin-top:8px}';document.head.appendChild(style);
    window.addEventListener('UauStudentNoticesChanged',refresh);refresh();setInterval(refresh,30000);
  });
})();
