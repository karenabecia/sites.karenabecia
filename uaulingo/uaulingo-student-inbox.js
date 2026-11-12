(() => {
  const api=window.UauSupabase;
  const demoKey='uaulingo-demo-notifications-v1';
  const previewKey=id=>`uaulingo-preview-notification-reads-${id}`;
  const samples=()=>[
    {id:'demo-1',emoji:'⚡',title:'Pontos recebidos',details:'+10 XP · Teste de pontuação extra',created_at:new Date().toISOString(),read_at:null},
    {id:'demo-2',emoji:'⚠️',title:'Seu desafio precisa de correção',details:'Inclua a conferência dos resultados da IA e envie um novo link.',created_at:new Date(Date.now()-3600000).toISOString(),read_at:null},
    {id:'demo-3',emoji:'📚',title:'Aula de Excel amanhã',details:'Confira a data e o horário no cronograma.',created_at:new Date(Date.now()-86400000).toISOString(),read_at:null},
    {id:'demo-terms',category:'terms',emoji:'📄',title:'Leia e aceite o termo vitalício',details:'O documento completo está disponível. Leia e registre seu aceite nos Primeiros passos.',created_at:new Date().toISOString(),read_at:null}
  ];
  async function load(){
    const session=await api?.session();
    if(session?.user?.id){
      const own=await api.table('uaulingo_students',`?select=id,full_name&auth_user_id=eq.${encodeURIComponent(session.user.id)}&status=eq.active`);
      if(own[0])return {mode:'student',studentId:own[0].id,studentName:own[0].full_name,rows:await notifications(own[0].id)};
      const staff=await api.table('uaulingo_staff',`?select=user_id&user_id=eq.${encodeURIComponent(session.user.id)}`);
      if(staff.length){
        const students=await api.table('uaulingo_students','?select=id,full_name,purchase_email&status=eq.active&order=full_name.asc');
        const test=students.find(row=>row.purchase_email?.endsWith('@example.com')&&row.full_name?.includes('Teste'));
        if(test){
          let saved=[];try{saved=JSON.parse(sessionStorage.getItem(previewKey(test.id))||'[]')}catch{}
          const readIds=new Set(Array.isArray(saved)?saved:[]);
          const rows=(await notifications(test.id)).map(row=>readIds.has(row.id)?{...row,read_at:row.read_at||new Date().toISOString()}:row);
          return {mode:'staff-preview',studentId:test.id,studentName:test.full_name,rows};
        }
      }
    }
    if(!/^(localhost|127\.0\.0\.1)$/.test(location.hostname))throw new Error('Entre com uma conta de aluno para consultar suas notificações.');
    let rows;try{rows=JSON.parse(sessionStorage.getItem(demoKey)||'null')||samples()}catch{rows=samples()}
    sessionStorage.setItem(demoKey,JSON.stringify(rows));
    return {mode:'demo',studentId:'',studentName:'',rows};
  }
  function notifications(studentId){
    return api.table('uaulingo_student_notifications',`?select=id,category,emoji,title,details,reason,points,created_at,read_at,support_ticket_id&student_id=eq.${encodeURIComponent(studentId)}&order=created_at.desc`);
  }
  async function markRead(box,id){
    const when=new Date().toISOString();
    if(box.mode==='student')await api.table('uaulingo_student_notifications',`?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify({read_at:when})});
    if(box.mode==='staff-preview'){
      const storageKey=previewKey(box.studentId);let saved=[];try{saved=JSON.parse(sessionStorage.getItem(storageKey)||'[]')}catch{}
      const ids=new Set(Array.isArray(saved)?saved:[]);
      ids.add(id);sessionStorage.setItem(storageKey,JSON.stringify([...ids]));
    }
    const row=box.rows.find(item=>item.id===id);if(row)row.read_at=when;
    if(box.mode==='demo')sessionStorage.setItem(demoKey,JSON.stringify(box.rows));
  }
  window.UauStudentInbox={load,markRead};
})();
