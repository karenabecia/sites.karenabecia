(()=>{
  'use strict';
  const local=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if(!local)document.documentElement.classList.add('uau-student-checking');
  let pending;
  async function ready(){
    if(local)return {preview:true};
    if(pending)return pending;
    pending=(async()=>{
      try{
        const api=window.UauSupabase;
        const session=await api.session();
        if(!session){location.replace('uaulingo-acesso.html');return null}
        const studentId=await api.rpc('uaulingo_claim_student');
        const [students,ledger,implementations,ranking]=await Promise.all([
          api.table('uaulingo_students',`?select=id,full_name,purchase_email,status,division,is_test&auth_user_id=eq.${session.user.id}&limit=1`),
          api.table('uaulingo_xp_ledger',`?select=xp,reason&student_id=eq.${studentId}`),
          api.table('uaulingo_implementations','?select=*&status=eq.published&order=implementation_number.asc'),
          api.rpc('uaulingo_ranking')
        ]);
        const student=students?.[0];
        if(!student||student.status!=='active')throw new Error('Acesso temporariamente indisponível.');
        const context={student,studentId,implementations,ranking,ledger,xp:ledger.reduce((sum,row)=>sum+Number(row.xp||0),0)};
        window.UauStudentContext=context;
        document.documentElement.classList.remove('uau-student-checking');
        return context;
      }catch(error){
        document.documentElement.classList.remove('uau-student-checking');
        document.body.innerHTML='<main class="uau-access-error"><h1>Acesso temporariamente indisponível</h1><p>Entre em contato com a equipe de suporte para podermos ajudar você.</p><a href="https://wa.me/5511958152954">Conversar com o suporte</a><br><a href="uaulingo-acesso.html">Voltar para entrar</a></main>';
        return null;
      }
    })();
    return pending;
  }
  window.UauStudentGate={ready,local};
})();
