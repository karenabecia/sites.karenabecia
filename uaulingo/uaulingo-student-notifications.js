(() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  async function refresh(){
    try{
      const box=await window.UauStudentInbox.load(),rows=box.rows;
      const badge=document.getElementById('studentNoticeCount'),panel=document.getElementById('studentNotices');if(!badge||!panel)return;
      const unread=rows.filter(row=>!row.read_at).length;badge.textContent=unread;badge.hidden=!unread;
      const short=value=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
      const context=box.mode==='staff-preview'?`<small>Visualização de teste: ${esc(box.studentName)}</small>`:box.mode==='demo'?'<small>Exemplos para teste</small>':'';
      panel.innerHTML='<strong>Suas notificações</strong>'+context+(rows.length?rows.slice(0,5).map(row=>`<a class="student-notice-preview ${row.read_at?'read':''}" href="uaulingo-notificacoes.html?id=${encodeURIComponent(row.id)}"><span>${esc(row.emoji||'🔔')}</span><span><b>${esc(row.title||'Aviso')}</b><small>${esc(short(row.created_at))}${row.read_at?' · Lida':''}</small></span></a>`).join(''):'<p>Sem notificações.</p>')+'<a class="student-notice-all" href="uaulingo-notificacoes.html">Ver todas →</a>';
    }catch(error){console.warn('Notificações indisponíveis:',error?.message||error)}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const style=document.createElement('style');style.textContent='.student-notice-preview{display:flex;gap:9px;color:#253d30;text-decoration:none;border-bottom:1px solid #ece5f3;padding:10px 4px}.student-notice-preview.read{opacity:.65}.student-notice-preview b,.student-notice-preview small{display:block}.student-notice-preview small{font-size:.68rem;color:#718078}.student-notice-all{display:block;text-align:center;background:#efe4fb;color:#7432a0;text-decoration:none;border-radius:7px;padding:9px;font-weight:900;margin-top:8px}';document.head.appendChild(style);
    window.addEventListener('UauStudentNoticesChanged',refresh);refresh();setInterval(refresh,30000);
  });
})();
