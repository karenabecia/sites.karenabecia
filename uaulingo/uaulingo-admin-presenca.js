(()=>{'use strict';const api=window.UauSupabase,$=s=>document.querySelector(s);let implementations=[],lists=[],user,editingId=null;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDate=value=>{const d=new Date(value);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(d)};
const toInput=value=>{const d=new Date(value);if(Number.isNaN(d.getTime()))return '';const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`};
const link=id=>new URL('uaulingo-presenca.html?lista='+encodeURIComponent(id),location.href).href;
async function load(){
  implementations=await api.table('uaulingo_implementations','?select=id,implementation_number,title,lessons&order=implementation_number.asc');
  $('#lessonSelect').innerHTML='<option value="">Selecione a aula</option>'+implementations.flatMap(row=>(row.lessons||[]).map((lesson,index)=>`<option value="${escape(row.id)}:${index}">${String(row.implementation_number).padStart(2,'0')} · ${escape(row.title)} · Aula ${index+1}: ${escape(lesson.title||'Aula')}</option>`)).join('');
  const first=implementations.find(row=>row.implementation_number===1);if(first){$('#lessonSelect').value=first.id+':0';$('#opensAt').value=toInput(first.lessons?.[0]?.scheduled_at||'');$('#closesAt').value=toInput(new Date(new Date(first.lessons?.[0]?.scheduled_at).getTime()+90*60000));}
  await loadLists();
}
async function loadLists(){
  lists=await api.table('uaulingo_attendance_lists','?select=*&order=opens_at.desc');
  const counts=await api.table('uaulingo_attendance_records','?select=list_id');
  $('#attendanceList').innerHTML=lists.length?lists.map(row=>{const now=Date.now(),open=row.manual_state==='open'||(row.manual_state!=='closed'&&now>=Date.parse(row.opens_at)&&now<Date.parse(row.closes_at)),ended=now>=Date.parse(row.closes_at);const count=counts.filter(item=>item.list_id===row.id).length;return `<div class="row"><div><span class="badge ${open?'open':ended?'closed':''}">${open?'Aberta':row.manual_state==='closed'?'Fechada manualmente':ended?'Encerrada':'Programada'}</span><strong>${escape(row.lesson_title)} · até ${row.xp_reward} XP</strong><small>${localDate(row.opens_at)} até ${localDate(row.closes_at)} · ${count} presença${count===1?'':'s'}</small></div><div class="row-actions"><button class="btn secondary" type="button" data-list-action="copy" data-id="${escape(row.id)}">Copiar link</button><button class="btn secondary" type="button" data-list-action="edit" data-id="${escape(row.id)}">Editar lista</button><button class="btn ${open?'secondary':''}" type="button" data-list-action="${open?'close':'open'}" data-id="${escape(row.id)}">${open?'Fechar lista':'Abrir lista'}</button><button class="btn secondary" type="button" data-list-action="download" data-id="${escape(row.id)}">Baixar lista de presença</button></div></div>`}).join(''):'<p>Nenhuma lista programada.</p>';
}
async function save(){
  const button=$('#scheduleButton'),status=$('#formStatus');status.textContent='';
  const [implementationId,indexText]=$('#lessonSelect').value.split(':');
  const row=implementations.find(item=>item.id===implementationId),index=Number(indexText);
  if(!row||!Number.isInteger(index)||!row.lessons?.[index]){status.textContent='Selecione uma aula.';return}
  const opens=new Date($('#opensAt').value),closes=new Date($('#closesAt').value),xp=Number($('#xpReward').value);
  if(!Number.isFinite(opens.getTime())||!Number.isFinite(closes.getTime())||closes<=opens){status.textContent='O fechamento precisa ser posterior à abertura.';return}
  if(!Number.isInteger(xp)||xp<0||xp>2000){status.textContent='Informe uma pontuação entre 0 e 2000.';return}
  button.disabled=true;
  try{
    const current=lists.find(item=>item.id===editingId)||lists.find(item=>item.implementation_id===implementationId&&item.lesson_index===index);
    const payload={implementation_id:implementationId,lesson_index:index,lesson_title:row.lessons[index].title,opens_at:opens.toISOString(),closes_at:closes.toISOString(),xp_reward:xp,manual_state:'auto'};
    if(current)await api.table('uaulingo_attendance_lists',`?id=eq.${current.id}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});
    else{payload.created_by=user.id;await api.table('uaulingo_attendance_lists','',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)})}
    editingId=null;button.textContent='Programar lista';$('#lessonSelect').disabled=false;
    await loadLists();status.style.color='#087744';status.textContent='✓ Lista salva. A abertura seguirá o horário programado.';
  }catch(error){status.style.color='#8b2551';status.textContent=error.message||'Não foi possível salvar a lista.'}
  finally{button.disabled=false}
}
function editList(row){
  editingId=row.id;
  $('#lessonSelect').value=row.implementation_id+':'+row.lesson_index;
  $('#lessonSelect').disabled=true;
  $('#opensAt').value=toInput(row.opens_at);
  $('#closesAt').value=toInput(row.closes_at);
  $('#xpReward').value=row.xp_reward;
  $('#scheduleButton').textContent='Salvar alterações';
  $('#formStatus').textContent='Ajuste os horários ou o XP e salve. A lista voltará a seguir o horário programado.';
  $('#scheduleForm').scrollIntoView({behavior:'smooth',block:'start'});
}
function csvCell(value){
  const raw=String(value??'');
  const safe=/^[=+\-@]/.test(raw)?"'"+raw:raw;
  return '"'+safe.replaceAll('"','""')+'"';
}
async function downloadList(row){
  const records=await api.table('uaulingo_attendance_records',`?select=student_id,attended_at&list_id=eq.${row.id}&order=attended_at.asc`);
  const ids=records.map(item=>item.student_id);
  const [students,ledger]=records.length?await Promise.all([
    api.table('uaulingo_students',`?select=id,full_name,purchase_email&id=in.(${ids.join(',')})`),
    api.table('uaulingo_xp_ledger',`?select=student_id,xp,reason&source=eq.bonus&student_id=in.(${ids.join(',')})`)
  ]):[[],[]];
  const names=new Map(students.map(item=>[item.id,item]));
  const awarded=new Map(ledger.filter(item=>item.reason?.startsWith(`Presença na aula [${row.id}]`)).map(item=>[item.student_id,item.xp]));
  const lines=[['Nome','E-mail','Aula','Data e hora da presença','XP'].map(csvCell).join(',')];
  records.forEach(item=>{const student=names.get(item.student_id)||{};lines.push([student.full_name||'',student.purchase_email||'',row.lesson_title,localDate(item.attended_at),awarded.get(item.student_id)??0].map(csvCell).join(','))});
  const url=URL.createObjectURL(new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download=`presenca-${row.lesson_title.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-')}.csv`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function actOnList(event){
  const button=event.target.closest('[data-list-action]');if(!button)return;
  const row=lists.find(item=>item.id===button.dataset.id);if(!row)return;
  const action=button.dataset.listAction;
  if(action==='edit'){editList(row);return}
  button.disabled=true;
  try{
    if(action==='copy'){await navigator.clipboard.writeText(link(row.id));button.textContent='Copiado!'}
    if(action==='download')await downloadList(row);
    if(action==='open'||action==='close'){
      await api.table('uaulingo_attendance_lists',`?id=eq.${row.id}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({manual_state:action==='open'?'open':'closed'})});
      await loadLists();
    }
  }catch(error){$('#formStatus').style.color='#8b2551';$('#formStatus').textContent=error.message||'Não foi possível concluir esta ação.'}
  finally{button.disabled=false}
}
$('#scheduleForm').addEventListener('submit',event=>{event.preventDefault();save()});
$('#openNow').addEventListener('click',()=>{$('#opensAt').value=toInput(new Date(Date.now()-60000));$('#closesAt').value=toInput(new Date(Date.now()+90*60000));save()});
$('#lessonSelect').addEventListener('change',()=>{const [id,index]=$('#lessonSelect').value.split(':');const row=implementations.find(item=>item.id===id),at=row?.lessons?.[Number(index)]?.scheduled_at;if(at){$('#opensAt').value=toInput(at);$('#closesAt').value=toInput(new Date(new Date(at).getTime()+90*60000))}$('#xpReward').value=row?.implementation_number===1?'30':''});
$('#attendanceList').addEventListener('click',actOnList);
$('#linksToggle').addEventListener('click',()=>{$('#importantLinks').hidden=!$('#importantLinks').hidden});
$('#logoutButton').addEventListener('click',async()=>{await api.signOut();location.replace('uaulingo-admin-alunos.html')});
(async()=>{try{const session=await api.session();if(!session?.user){location.replace('uaulingo-admin-alunos.html');return}user=session.user;const staff=await api.table('uaulingo_staff',`?select=user_id&user_id=eq.${user.id}&limit=1`);if(!staff?.length){location.replace('uaulingo-admin-alunos.html');return}$('#page').hidden=false;await load()}catch(error){$('#page').hidden=false;$('#formStatus').textContent=error.message||'Não foi possível carregar a lista de presença.'}})();
})();
