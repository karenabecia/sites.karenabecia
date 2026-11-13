(() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let knownIds=null,refreshing=false,mapReady=false,popupBusy=false,popupShown=false;
  const lessonHref=row=>`uaulingo-aula.html?implementacao=${Number(row.lesson_implementation_number)}&aula=${Number(row.lesson_number)}&notice=${encodeURIComponent(row.id)}`;
  async function showLessonPopup(box){
    if(!mapReady||popupBusy||popupShown||box.mode!=='student')return;
    const row=box.rows.find(item=>item.category==='lesson'&&item.lesson_implementation_number&&item.lesson_number&&!item.popup_seen_at);
    if(!row)return;
    if(document.querySelector('.tour-overlay:not([hidden]),#modalScrim.show')){setTimeout(()=>showLessonPopup(box),1000);return}
    popupBusy=true;
    try{
      await window.UauSupabase.table('uaulingo_student_notifications',`?id=eq.${encodeURIComponent(row.id)}`,{method:'PATCH',body:JSON.stringify({popup_seen_at:new Date().toISOString()})});
      row.popup_seen_at=new Date().toISOString();popupShown=true;
      const overlay=document.createElement('div');overlay.className='lesson-release-overlay';overlay.innerHTML=`<section class="lesson-release-card" role="dialog" aria-modal="true" aria-labelledby="lessonReleaseTitle"><button type="button" class="lesson-release-close" aria-label="Fechar aviso">×</button><div class="lesson-release-icon">🎬</div><small>NOVA AULA LIBERADA</small><h2 id="lessonReleaseTitle"></h2><p></p><a class="lesson-release-open" href="${lessonHref(row)}">Assistir à aula →</a></section>`;
      overlay.querySelector('h2').textContent=row.title;overlay.querySelector('p').textContent=row.details;
      const close=()=>overlay.remove();overlay.querySelector('button').addEventListener('click',close);overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
      document.body.appendChild(overlay);overlay.querySelector('button').focus();
    }catch(error){console.warn('Aviso da aula indisponível:',error?.message||error)}finally{popupBusy=false}
  }
  async function refresh(){
    if(refreshing){if(mapReady&&!popupShown)setTimeout(refresh,500);return}
    refreshing=true;
    try{
      const box=await window.UauStudentInbox.load(),rows=box.rows;
      const badge=document.getElementById('studentNoticeCount'),panel=document.getElementById('studentNotices');if(!badge||!panel)return;
      const incoming=knownIds&&rows.find(row=>!knownIds.has(row.id));
      knownIds=new Set(rows.map(row=>row.id));
      const unread=rows.filter(row=>!row.read_at).length;badge.textContent=unread;badge.hidden=!unread;
      const short=value=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value));
      const context=box.mode==='staff-preview'?`<small>Visualização de teste: ${esc(box.studentName)}</small>`:box.mode==='demo'?'<small>Exemplos para teste</small>':'';
      panel.innerHTML='<strong>Suas notificações</strong>'+context+(rows.length?rows.slice(0,5).map(row=>`<a class="student-notice-preview ${row.read_at?'read':''}" href="${row.support_ticket_id?`uaulingo.html?view=support&ticket=${encodeURIComponent(row.support_ticket_id)}&notice=${encodeURIComponent(row.id)}`:row.category==='lesson'&&row.lesson_implementation_number&&row.lesson_number?lessonHref(row):`uaulingo-notificacoes.html?id=${encodeURIComponent(row.id)}`}"><span>${esc(row.emoji||'🔔')}</span><span><b>${esc(row.title||'Aviso')}</b><small>${esc(short(row.created_at))}${row.read_at?' · Lida':''}</small></span></a>`).join(''):'<p>Sem notificações.</p>')+'<a class="student-notice-all" href="uaulingo-notificacoes.html">Ver todas →</a>';
      await showLessonPopup(box);
      if(incoming){const toast=document.getElementById('toast');if(toast){toast.textContent=`${incoming.emoji||'🔔'} ${incoming.title||'Nova notificação'}`;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),4500)}}
    }catch(error){console.warn('Notificações indisponíveis:',error?.message||error)}finally{refreshing=false}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const style=document.createElement('style');style.textContent='.student-notice-preview{display:flex;gap:9px;color:#253d30;text-decoration:none;border-bottom:1px solid #ece5f3;padding:10px 4px}.student-notice-preview.read{opacity:.65}.student-notice-preview b,.student-notice-preview small{display:block}.student-notice-preview small{font-size:.68rem;color:#718078}.student-notice-all{display:block;text-align:center;background:#efe4fb;color:#7432a0;text-decoration:none;border-radius:7px;padding:9px;font-weight:900;margin-top:8px}.lesson-release-overlay{position:fixed;inset:0;z-index:10000;background:#091e25a9;display:grid;place-items:center;padding:20px}.lesson-release-card{position:relative;width:min(100%,480px);background:#fff;border:2px solid #8135ad;border-radius:18px;box-shadow:8px 8px 0 #3a146c;padding:32px;text-align:center;color:#063d2e}.lesson-release-card small{font:900 .7rem monospace;color:#7730a3;letter-spacing:.14em}.lesson-release-card h2{font-size:1.5rem;line-height:1.2}.lesson-release-card p{color:#597065}.lesson-release-icon{font-size:2.4rem}.lesson-release-close{position:absolute;right:12px;top:10px;border:0;border-radius:8px;background:#f1e7f9;color:#66308e;font-size:1.4rem;cursor:pointer}.lesson-release-open{display:inline-block;margin-top:12px;background:#12c76a;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:900}';document.head.appendChild(style);
    window.addEventListener('uaulingo:map-loaded',()=>{mapReady=true;setTimeout(refresh,800)},{once:true});window.addEventListener('UauStudentNoticesChanged',refresh);refresh();setInterval(refresh,30000);
  });
})();
