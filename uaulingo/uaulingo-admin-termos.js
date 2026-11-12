(() => {
  'use strict';
  const api=window.UauSupabase,$=selector=>document.querySelector(selector);
  let students=[];
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const date=value=>new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const csvCell=value=>'"'+String(value??'').replace(/^[\s\t\r\n]*[=+@-]/,match=>"'"+match).replace(/"/g,'""')+'"';
  function downloadReport(){
    const header=['Nome','E-mail','Status do aceite','Data do aceite'];
    const lines=[header,...students.map(row=>[row.name,row.email,row.acceptedAt?'Aceito':'Pendente',row.acceptedAt?date(row.acceptedAt):''])];
    const csv='\uFEFF'+lines.map(row=>row.map(csvCell).join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='uaulingo-termos-de-acesso-'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function render(){
    const search=$('#search').value.trim().toLocaleLowerCase('pt-BR'),filter=$('#statusFilter').value;
    const rows=students.filter(row=>(filter==='all'||(filter==='accepted')===!!row.acceptedAt)&&(!search||(row.name+' '+row.email).toLocaleLowerCase('pt-BR').includes(search)));
    $('#termsBody').innerHTML=rows.length?rows.map(row=>`<tr><td><strong>${esc(row.name)}</strong></td><td>${esc(row.email)}</td><td><span class="badge ${row.acceptedAt?'yes':'no'}">${row.acceptedAt?'Aceito':'Pendente'}</span></td><td>${row.acceptedAt?esc(date(row.acceptedAt)):'—'}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">Nenhum aluno encontrado.</td></tr>';
    $('#pageStatus').textContent=`${rows.length} de ${students.length} alunos`;
  }
  $('#search').addEventListener('input',render);
  $('#statusFilter').addEventListener('change',render);
  $('#exportTerms').addEventListener('click',downloadReport);
  $('#logoutButton').addEventListener('click',()=>api.signOut().finally(()=>location.href='uaulingo-admin-alunos.html'));
  (async()=>{
    const session=await api.session();
    if(!session?.user?.id){location.replace('uaulingo-admin-alunos.html');return}
    const staff=await api.table('uaulingo_staff',`?select=role&user_id=eq.${session.user.id}`);
    if(!staff.length){location.replace('uaulingo-admin-alunos.html');return}
    const [studentRows,acceptances]=await Promise.all([
      api.table('uaulingo_students','?select=id,full_name,purchase_email&order=full_name.asc'),
      api.table('uaulingo_term_acceptances','?select=student_id,accepted_at,document_version&document_version=eq.2026-11-10')
    ]);
    const acceptedByStudent=new Map(acceptances.map(row=>[row.student_id,row.accepted_at]));
    students=studentRows.map(row=>({name:row.full_name,email:row.purchase_email,acceptedAt:acceptedByStudent.get(row.id)||null}));
    render();$('#page').hidden=false;window.dispatchEvent(new Event('UauAdminAuthenticated'));await window.UauLoading.complete();
  })().catch(async error=>{$('#page').hidden=false;$('#pageStatus').textContent=error.message||'Não foi possível carregar os termos.';await window.UauLoading.complete()});
})();
