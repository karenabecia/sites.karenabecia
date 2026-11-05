(()=>{
  'use strict';
  const topbar=document.querySelector('.topbar');if(!topbar||document.getElementById('adminBell'))return;
  const style=document.createElement('style');style.textContent='.shared-notice{position:relative;margin-left:auto;margin-right:10px}.shared-notice button{position:relative;border:1px solid #dce8de;background:#fff;border-radius:10px;width:40px;height:40px;font-size:1.2rem;cursor:pointer}.shared-notice button span{position:absolute;right:-6px;top:-6px;background:#8432b4;color:#fff;border-radius:50%;min-width:18px;height:18px;font:900 .65rem Arial;display:grid;place-items:center}.shared-notice button span[hidden],.shared-notice-panel[hidden]{display:none!important}.shared-notice-panel{position:absolute;right:0;top:46px;width:min(300px,85vw);z-index:30;background:#fff;border:1px solid #dce8de;border-radius:12px;padding:15px;box-shadow:0 12px 30px #142d2533;color:#173a2d;font:500 .82rem Arial}.shared-notice-panel strong{display:block;margin-bottom:8px}.shared-notice-panel a{color:#7530a4;font-weight:900}';document.head.appendChild(style);
  const wrap=document.createElement('div');wrap.className='shared-notice';wrap.innerHTML='<button type="button" aria-label="Notificações da equipe" aria-expanded="false">🔔<span hidden>0</span></button><div class="shared-notice-panel" hidden></div>';
  topbar.insertBefore(wrap,topbar.lastElementChild);
  const button=wrap.querySelector('button'),badge=button.querySelector('span'),panel=wrap.querySelector('.shared-notice-panel');
  button.onclick=()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden))};
  async function update(){let count=0;try{count=JSON.parse(localStorage.getItem('uaulingo-local-challenge-submissions-v1')||'[]').filter(row=>row.status==='pending').length}catch{}
    try{if(await window.UauSupabase.session()){const rows=await window.UauSupabase.table('uaulingo_challenge_submissions','?select=id&status=eq.pending');count+=rows.length}}catch{}
    badge.textContent=count;badge.hidden=!count;panel.innerHTML='<strong>Pendências da equipe</strong><p>'+(count?`${count} desafio${count===1?'':'s'} aguardando validação.`:'Nenhuma entrega pendente.')+'</p><a href="uaulingo-admin-desafios.html">Abrir validações →</a>';
  }
  update();window.addEventListener('storage',update);
})();
