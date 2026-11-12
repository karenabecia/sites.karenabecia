(() => {
  const sidebar=document.querySelector('.sidebar');if(!sidebar)return;
  const logout=sidebar.querySelector('#logoutButton');
  let navLinks=sidebar.querySelector('#navLinks');
  if(!navLinks){
    sidebar.querySelector('details.nav-item')?.remove();
    navLinks=document.createElement('div');navLinks.className='nav-links';navLinks.id='navLinks';
    navLinks.innerHTML='<button type="button" class="nav-item nav-link-toggle" id="linksToggle" aria-expanded="false" aria-controls="importantLinks"><span class="glyph">↗</span>Links importantes<span class="chevron">⌄</span></button><div class="nav-subitems" id="importantLinks"><a href="uaulingo-acesso.html" target="_blank" rel="noopener">Acesso do aluno ↗</a><a href="https://wa.me/5511958152954" target="_blank" rel="noopener noreferrer">WhatsApp do suporte ↗</a></div>';
    sidebar.insertBefore(navLinks,logout||null);
    navLinks.querySelector('#linksToggle').addEventListener('click',()=>{const open=navLinks.classList.toggle('open');navLinks.querySelector('#linksToggle').setAttribute('aria-expanded',String(open))});
  }
  const symbols={Alunos:'▦',Conteúdos:'▣',Desafios:'◆',Conquistas:'★',Atendimentos:'▤'};
  for(const item of sidebar.querySelectorAll(':scope > .nav-item:not(.logout)')){
    const name=Object.keys(symbols).find(label=>item.textContent.includes(label));
    if(name&&!item.querySelector('.glyph'))item.innerHTML=`<span class="glyph">${symbols[name]}</span>${name}`;
  }
  const link=document.createElement('a');
  link.className='nav-item nav-anchor uau-menu-counter-link'+(location.pathname.endsWith('/uaulingo-admin-notificacoes.html')?' active':'');
  link.href='uaulingo-admin-notificacoes.html';
  link.innerHTML='<svg class="glyph uau-bell" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a2 2 0 0 0-2 2.1A7 7 0 0 0 5 11v4l-2 2v1h18v-1l-2-2v-4a7 7 0 0 0-5-6.9A2 2 0 0 0 12 2Zm-3 18a3 3 0 0 0 6 0H9Z"/></svg>Notificações<span class="uau-unread-count" hidden>0</span>';
  sidebar.insertBefore(link,navLinks);
  let support=[...sidebar.querySelectorAll('.nav-item')].find(item=>item.textContent.includes('Atendimentos'));
  if(support?.tagName==='BUTTON'){
    const replacement=document.createElement('a');replacement.className='nav-item';replacement.href='uaulingo-admin-atendimentos.html';replacement.innerHTML='<span class="glyph">▤</span>Atendimentos';support.replaceWith(replacement);support=replacement;
  }
  if(!support){support=document.createElement('a');support.className='nav-item';support.href='uaulingo-admin-atendimentos.html';support.innerHTML='<span class="glyph">▤</span>Atendimentos';sidebar.insertBefore(support,link)}
  if(location.pathname.endsWith('/uaulingo-admin-atendimentos.html'))support.classList.add('active');
  const termsLink=document.createElement('a');
  termsLink.className='nav-item nav-anchor'+(location.pathname.endsWith('/uaulingo-admin-termos.html')?' active':'');
  termsLink.href='uaulingo-admin-termos.html';
  termsLink.innerHTML='<span class="glyph" aria-hidden="true">▤</span>Termos de acesso';
  sidebar.insertBefore(termsLink,link);
  const challenges=[...sidebar.querySelectorAll('.nav-item')].find(item=>item.textContent.includes('Desafios'));
  for(const item of [challenges,support])if(item){item.classList.add('uau-menu-counter-link');item.insertAdjacentHTML('beforeend','<span class="uau-unread-count" hidden>0</span>')}
  const style=document.createElement('style');style.textContent=`
  .shell{background:radial-gradient(circle at 96% 1%,#ecddff,transparent 27%),#f7f8f1}
  .sidebar{position:fixed!important;inset:0 auto 0 0!important;width:235px!important;height:100vh!important;overflow-y:auto!important;overflow-x:hidden!important;display:block!important;background:linear-gradient(160deg,#063d2e,#071e22 65%,#1d0a3b)!important;padding:27px 18px!important;color:#fff!important;z-index:20!important}
  .sidebar:before{content:"";position:absolute;inset:0;background-image:linear-gradient(#ffffff12 1px,transparent 1px),linear-gradient(90deg,#ffffff12 1px,transparent 1px);background-size:26px 26px;pointer-events:none}
  .sidebar>*:not(.pixel-field){position:relative;z-index:1}
  .sidebar .logo{display:block;width:195px;max-width:100%;max-height:none;object-fit:contain;image-rendering:pixelated;margin:0 0 42px}
  .sidebar .nav-label{font:800 .65rem monospace;letter-spacing:.14em;color:#95c6a9;margin:0 10px 10px;padding:0}
  .sidebar>.nav-item,.sidebar .nav-link-toggle{width:100%;display:flex!important;align-items:center;gap:10px;text-align:left;text-decoration:none;background:transparent;border:1px solid transparent;color:#d8efe1;padding:12px;border-radius:10px;font-weight:800;font-size:.87rem;margin:0 0 5px}
  .sidebar>.nav-item:hover,.sidebar .nav-link-toggle:hover{background:#ffffff18}
  .sidebar>.nav-item.active{color:#073e2d;background:#b5f8bd;border-color:#64d47b}
  .sidebar .glyph{display:inline-grid;place-items:center;flex:0 0 24px;width:24px;height:24px;font:900 1.2rem monospace;text-align:center}
  .sidebar .uau-bell{width:21px;height:21px;padding:2px;color:inherit}
  .sidebar .nav-links{margin-top:20px;position:relative;z-index:2}
  .sidebar .nav-subitems{max-height:0;overflow:hidden;transition:max-height .24s ease}
  .sidebar .nav-links:hover .nav-subitems,.sidebar .nav-links:focus-within .nav-subitems,.sidebar .nav-links.open .nav-subitems{max-height:130px}
  .sidebar .nav-subitems a{display:block;color:#d7f5e5;text-decoration:none;font-size:.76rem;font-weight:800;padding:10px 11px 10px 46px;border-radius:8px}
  .sidebar .nav-subitems a:hover{background:#ffffff1a}
  .sidebar .chevron{margin-left:auto}
  .sidebar #logoutButton{margin-top:20px}
  .uau-unread-count[hidden]{display:none!important}.uau-unread-count{margin-left:auto;display:inline-grid;place-items:center;min-width:21px;height:21px;padding:0 5px;border-radius:50px;background:#a837f2;color:white;font:900 .7rem Arial}
  .sidebar .uau-menu-counter-link{display:flex!important;align-items:center;gap:8px}
  @media(max-width:750px){.sidebar{position:sticky!important;inset:auto!important;top:0!important;width:100%!important;height:auto!important;max-height:125px;display:flex!important;align-items:center;gap:6px;flex-wrap:wrap;padding:10px!important;overflow:visible!important}.sidebar:before{display:none}.sidebar .logo{width:115px;margin:0}.sidebar .nav-label{display:none}.sidebar>.nav-item,.sidebar .nav-link-toggle{width:auto;padding:8px;margin:0}.sidebar .nav-links{margin:0}.sidebar .nav-subitems{position:absolute;top:100%;right:0;min-width:190px;background:#0c302b;border-radius:9px}.sidebar .nav-subitems a{padding:10px 14px}.sidebar #logoutButton{margin:0}.shell{padding-left:0!important;display:block!important;grid-template-columns:none!important}}
  `;document.head.appendChild(style);
  async function update(){
    try{
      const session=await window.UauSupabase?.session();if(!session?.user?.id)return;
      const [notices,reads]=await Promise.all([
        window.UauSupabase.table('uaulingo_staff_notifications','?select=id'),
        window.UauSupabase.table('uaulingo_staff_notification_reads',`?select=notification_id&staff_user_id=eq.${encodeURIComponent(session.user.id)}`)
      ]);
      const readIds=new Set(reads.map(row=>row.notification_id)),count=notices.filter(row=>!readIds.has(row.id)).length;
      const badge=link.querySelector('.uau-unread-count');badge.textContent=count;badge.hidden=!count;
      window.dispatchEvent(new CustomEvent('UauStaffUnreadCount',{detail:{count}}));
    }catch(error){console.warn('Contagem de avisos indisponível:',error?.message||error)}
  }
  async function updateQueues(){
    try{
      const session=await window.UauSupabase?.session();if(!session?.user?.id)return;
      const [pendingChallenges,pendingSupport]=await Promise.all([
        window.UauSupabase.table('uaulingo_challenge_submissions','?select=id&status=eq.pending'),
        window.UauSupabase.table('uaulingo_support_tickets','?select=id&status=eq.pending')
      ]);
      let localCount=0;try{localCount=JSON.parse(localStorage.getItem('uaulingo-local-challenge-submissions-v1')||'[]').filter(row=>row.status==='pending').length}catch{}
      for(const [item,count] of [[challenges,pendingChallenges.length+localCount],[support,pendingSupport.length]])if(item){const badge=item.querySelector('.uau-unread-count');badge.textContent=count;badge.hidden=!count}
    }catch(error){console.warn('Contagem de pendências indisponível:',error?.message||error)}
  }
  window.addEventListener('UauAdminAuthenticated',update);
  window.addEventListener('UauAdminAuthenticated',updateQueues);
  window.addEventListener('UauStaffNoticesChanged',update);
  window.addEventListener('UauAdminQueuesChanged',updateQueues);
  window.addEventListener('storage',event=>{if(event.key==='uaulingo-local-challenge-submissions-v1')updateQueues()});
  update();updateQueues();setInterval(()=>{update();updateQueues()},30000);
})();
