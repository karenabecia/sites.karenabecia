(()=>{
  'use strict';
  const $=selector=>document.querySelector(selector),api=window.UauSupabase;
  const STORE='uaulingo-local-challenge-submissions-v1';
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;'}[char]));
  const date=value=>value?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(value)):'—';
  const local=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch{return []}};
  const targetSubmission=new URLSearchParams(location.search).get('submission');
  let rows=[],filter=targetSubmission?'all':'pending',reviewId='',reviewSource='',reviewApprove=false,busy=false;
  function normalizeLocal(row){return {...row,source:'local',title:`Implementação ${Number(row.module)+1}`,student_name:row.student_name||'Aluno de demonstração',student_email:row.student_email||''};}
  function normalizeLive(row){return {...row,source:'live',title:row.uaulingo_implementations?.title||'Implementação',student_name:row.uaulingo_students?.full_name||'Aluno',student_email:row.uaulingo_students?.purchase_email||'',xp_reward:Number(row.uaulingo_implementations?.challenge?.xp_reward)||60,is_example:row.submission_url?.startsWith('https://example.com/uaulingo/teste-')};}
  async function load(){
    let live=[];
    try{live=await api.table('uaulingo_challenge_submissions','?select=*,uaulingo_students(full_name,purchase_email),uaulingo_implementations(title,challenge)&order=submitted_at.desc')}
    catch(error){if(error.status!==404&&error.code!=='PGRST205')$('#message').textContent='A lista online ainda não está disponível: '+(error.message||'erro de conexão');}
    rows=[...live.map(normalizeLive),...local().map(normalizeLocal)].sort((a,b)=>String(b.submitted_at).localeCompare(String(a.submitted_at)));
    render();if(targetSubmission){const target=document.querySelector('[data-submission-id="'+CSS.escape(targetSubmission)+'"]');target?.scrollIntoView({block:'center'});}
  }
  function render(){
    const count=status=>rows.filter(row=>row.status===status).length;
    $('#pendingCount').textContent=count('pending');$('#approvedCount').textContent=count('approved');$('#rejectedCount').textContent=count('rejected');
    window.dispatchEvent(new Event('UauAdminQueuesChanged'));
    const email=$('#emailFilter').value.trim().toLowerCase();
    const shown=rows.filter(row=>(filter==='all'||row.status===filter)&&(!email||row.student_email.toLowerCase().includes(email)));
    $('#submissionList').innerHTML=shown.length?shown.map(row=>`<article class="submission ${row.id===targetSubmission?'notice-target':''}" data-submission-id="${esc(row.id)}"><div><strong>${esc(row.student_name)} · ${esc(row.title)}</strong><small>${esc(row.student_email||'E-mail de demonstração não informado')}</small><small>Enviado em ${esc(date(row.submitted_at))} · ${row.is_example?'Dado fictício':row.source==='local'?'Teste neste navegador':'Área do aluno'} · ${Number(row.xp_reward)||0} XP</small><p>${row.is_example?'<small>Link fictício para testar a validação.</small>':`<a href="${esc(row.submission_url)}" target="_blank" rel="noopener noreferrer">Abrir trabalho enviado ↗</a>`}</p>${row.review_note?`<small>Observação: ${esc(row.review_note)}</small>`:''}</div><div class="actions"><span class="status ${esc(row.status)}">${row.status==='pending'?'Pendente':row.status==='approved'?'Aprovado':'Revisão'}</span>${row.status==='pending'?`<button class="btn primary" data-review="${esc(row.id)}" data-source="${esc(row.source)}" data-approve="true">Aprovar</button><button class="btn" data-review="${esc(row.id)}" data-source="${esc(row.source)}" data-approve="false">Solicitar revisão</button>`:''}</div></article>`).join(''):'<div class="empty">Nenhuma entrega nesta lista.</div>';
  }
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[data-filter]');if(tab){filter=tab.dataset.filter;document.querySelectorAll('[data-filter]').forEach(button=>button.classList.toggle('active',button===tab));render();return}
    const review=event.target.closest('[data-review]');if(review){reviewId=review.dataset.review;reviewSource=review.dataset.source;reviewApprove=review.dataset.approve==='true';const row=rows.find(item=>item.id===reviewId&&item.source===reviewSource);if(!row)return;$('#reviewTitle').textContent=reviewApprove?'Aprovar desafio':'Solicitar revisão';$('#reviewPrompt').textContent=`${row.student_name} · ${row.title} · ${Number(row.xp_reward)||0} XP`;$('#reviewNote').value='';$('#confirmReview').textContent=reviewApprove?'Aprovar e liberar XP':'Devolver para revisão';$('#reviewDialog').showModal();return}
  });
  $('#cancelReview').onclick=()=>$('#reviewDialog').close();
  $('#emailFilter').addEventListener('input',()=>{if($('#emailFilter').value.trim()){filter='all';document.querySelectorAll('[data-filter]').forEach(button=>button.classList.toggle('active',button.dataset.filter==='all'))}render()});
  window.addEventListener('storage',event=>{if(event.key===STORE)load()});
  $('#confirmReview').onclick=async()=>{
    if(busy)return;const note=$('#reviewNote').value.trim();if(!reviewApprove&&!note){$('#reviewNote').focus();return}
    busy=true;$('#confirmReview').disabled=true;$('#message').textContent='';
    try{
      if(reviewSource==='live')await api.rpc('uaulingo_review_challenge',{p_submission_id:reviewId,p_approve:reviewApprove,p_note:note});
      else{const items=local(),row=items.find(item=>item.id===reviewId);if(!row||row.status!=='pending')throw Error('Esta entrega já foi validada.');row.status=reviewApprove?'approved':'rejected';row.review_note=note;row.reviewed_at=new Date().toISOString();localStorage.setItem(STORE,JSON.stringify(items))}
      $('#reviewDialog').close();await load();$('#message').style.color='#146b43';$('#message').textContent=reviewApprove?'Desafio aprovado. O XP foi liberado.':'Revisão solicitada ao aluno.';
    }catch(error){$('#message').style.color='#ad3548';$('#message').textContent=error.message||'Não foi possível validar a entrega.'}
    finally{busy=false;$('#confirmReview').disabled=false}
  };
  $('#logoutButton').onclick=()=>api.signOut().finally(()=>location.href='uaulingo-admin-alunos.html');
  (async()=>{const session=await api.session();if(!session?.user?.id){location.replace('uaulingo-admin-alunos.html');return}const staff=await api.table('uaulingo_staff',`?select=role&user_id=eq.${session.user.id}`);if(!staff.length){location.replace('uaulingo-admin-alunos.html');return}$('#page').hidden=false;if(targetSubmission)document.querySelector('[data-filter="all"]')?.click();await load();await window.UauLoading.complete();setInterval(()=>{if(!busy&&!$('#reviewDialog').open)load().catch(error=>{$('#message').textContent=error.message||'Não foi possível atualizar os desafios.'})},60000)})().catch(async error=>{$('#page').hidden=false;$('#message').textContent=error.message||'Não foi possível carregar os desafios.';await window.UauLoading.complete()});
  const style=document.createElement('style');style.textContent='.submission.notice-target{outline:3px solid #a837f2;outline-offset:3px;scroll-margin-top:100px}';document.head.appendChild(style);
})();
