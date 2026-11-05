(() => {
  'use strict';
  const $=selector=>document.querySelector(selector), api=window.UauSupabase;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const formatDate=value=>value?value.split('-').reverse().join('/'):'A definir';
  const slugify=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
  const label=(yes,positive='Cadastrado',negative='Pendente')=>`<span class="tag ${yes?'yes':'no'}">${yes?positive:negative}</span>`;
  let rows=[],students=[],grants=[],role='',editingId='',selectedFile=null,previewUrl='',thumbUrls=[],renderVersion=0;

  function status(message,error=false){$('#pageStatus').textContent=message;$('#pageStatus').style.color=error?'#ae414d':'#577363'}
  function friendly(error){if(error?.code==='23505')return 'Já existe uma conquista com esse identificador.';if(error?.code==='42501')return 'Seu acesso não permite alterar conquistas.';return error?.message||'Não foi possível salvar. Tente novamente.'}
  function revokePreview(){if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=''}
  function closeModal(){revokePreview();$('#scrim').hidden=true;selectedFile=null;editingId=''}
  function setPreview(blob,text){revokePreview();$('#logoPreview').hidden=!blob;if(!blob)return;previewUrl=URL.createObjectURL(blob);$('#logoPreviewImage').src=previewUrl;$('#logoPreviewText').textContent=text}

  function render(){
    for(const url of thumbUrls)URL.revokeObjectURL(url);thumbUrls=[];
    const version=++renderVersion;
    $('#totalCount').textContent=rows.length;
    $('#certificateCount').textContent=rows.filter(row=>row.certificate_enabled).length;
    $('#completeCount').textContent=rows.filter(row=>row.panel_logo_path&&(!row.certificate_enabled||row.certificate_image_path)).length;
    $('#tableCount').textContent=`${rows.length} conquista${rows.length===1?'':'s'}`;
    $('#achievementsBody').innerHTML=rows.length?rows.map(row=>`
      <tr><td><div class="ach-title"><span class="thumb" id="thumb-${esc(row.id)}">★</span><span><strong>${esc(row.title)}</strong><small>${esc(row.id)}</small></span></div></td>
      <td>${esc(formatDate(row.release_date))}</td><td><strong>${Number(row.students_released)||0}</strong></td>
      <td>${label(row.certificate_enabled,'Sim','Não')}</td><td>${label(!!row.panel_logo_path)}</td>
      <td>${row.certificate_enabled?label(!!row.certificate_image_path):'<span class="tag no">Não se aplica</span>'}</td>
      <td><div class="row-actions"><button class="btn soft" data-edit="${esc(row.id)}" ${role==='admin'?'':'disabled'}>Editar conquista</button>${row.certificate_enabled&&role==='admin'?`<a class="btn purple" href="uaulingo-admin-certificado.html?id=${encodeURIComponent(row.id)}">Editar certificado →</a>`:''}</div></td></tr>`).join(''):'<tr><td class="empty" colspan="7">Nenhuma conquista cadastrada.</td></tr>';
    for(const row of rows.filter(item=>item.panel_logo_path)){
      api.storageDownload(row.panel_logo_path).then(blob=>{
        if(version!==renderVersion)return;
        const target=document.getElementById('thumb-'+row.id);if(!target)return;
        const url=URL.createObjectURL(blob);thumbUrls.push(url);
        target.outerHTML=`<img class="thumb" src="${url}" alt="Logo de ${esc(row.title)}">`;
      }).catch(()=>{});
    }
  }
  function renderStudentAchievements(){
    const emailQuery=$('#achievementStudentFilter').value.trim().toLowerCase(),achievementId=$('#achievementFilter').value;
    const byStudent=new Map(students.map(item=>[item.id,item]));
    const byAchievement=new Map(rows.map(item=>[item.id,item]));
    const shown=grants.filter(item=>(!emailQuery||byStudent.get(item.student_id)?.purchase_email?.toLowerCase().includes(emailQuery))&&(!achievementId||item.achievement_id===achievementId));
    $('#studentAchievementsBody').innerHTML=shown.length?shown.map(item=>{
      const student=byStudent.get(item.student_id),achievement=byAchievement.get(item.achievement_id);
      const certificate=!!(achievement?.certificate_enabled&&achievement?.certificate_image_path);
      return `<tr><td><strong>${esc(student?.full_name||'Aluno não encontrado')}</strong></td><td>${esc(student?.purchase_email||'—')}</td><td>${esc(achievement?.title||item.achievement_id)}</td><td>${esc(new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo'}).format(new Date(item.released_at)))}</td><td>${certificate?`<button class="btn soft certificate-download" data-certificate-student="${esc(item.student_id)}" data-certificate-achievement="${esc(item.achievement_id)}" title="Baixar certificado em PDF">↓ PDF</button>`:'—'}</td></tr>`;
    }).join(''):'<tr><td colspan="5" class="empty">Nenhuma liberação encontrada.</td></tr>';
    $('#studentAchievementsCount').textContent=`${shown.length} liberaç${shown.length===1?'ão':'ões'}`;
  }
  async function loadStudentAchievements(){
    const result=await Promise.all([
      api.table('uaulingo_student_achievements','?select=student_id,achievement_id,released_at&order=released_at.desc'),
      api.table('uaulingo_students','?select=id,full_name,purchase_email&order=full_name.asc')
    ]);
    grants=result[0];students=result[1];
    const studentFilter=$('#achievementStudentFilter'),achievementFilter=$('#achievementFilter');
    const oldStudent=studentFilter.value,oldAchievement=achievementFilter.value;
    achievementFilter.innerHTML='<option value="">Todas as conquistas</option>'+rows.map(item=>`<option value="${esc(item.id)}">${esc(item.title)}</option>`).join('');
    studentFilter.value=oldStudent;achievementFilter.value=oldAchievement;
    renderStudentAchievements();
  }
  async function downloadStudentCertificate(studentId,achievementId){
    const student=students.find(item=>item.id===studentId),achievement=rows.find(item=>item.id===achievementId);
    const grant=grants.find(item=>item.student_id===studentId&&item.achievement_id===achievementId);
    if(!student||!grant||!achievement?.certificate_enabled||!achievement.certificate_image_path){status('Certificado indisponível para esta liberação.',true);return}
    const template=await window.UauCertificate.getRemote(achievementId);
    if(!template?.backgroundBlob){status('Não foi possível carregar a imagem do certificado.',true);return}
    const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1100;
    const date=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo'}).format(new Date(grant.released_at));
    await window.UauCertificate.renderCustom(canvas,template,student.full_name,date);
    const filename='certificado-'+achievementId+'-'+student.full_name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.pdf';
    window.UauCertificate.downloadPdf(canvas,filename);status('Certificado PDF baixado.');
  }
  async function load(){
    status('Carregando conquistas...');
    try {
      rows=await api.table('uaulingo_achievement_overview','?select=*&order=title.asc');
      render();if(!$('#studentsAchievementsPanel').hidden)await loadStudentAchievements();status('');
    } catch(error) {
      status('Não foi possível carregar as conquistas. Tente novamente em alguns instantes. '+friendly(error),true);
      $('#tableCount').textContent='Falha ao carregar';
    }
  }
  async function openModal(row){
    if(role!=='admin'){status('Seu acesso permite consultar, mas não editar conquistas.',true);return}
    editingId=row?.id||'';selectedFile=null;revokePreview();$('#achievementForm').reset();$('#formError').textContent='';
    $('#modalTitle').textContent=row?'Editar conquista':'Nova conquista';
    $('#modalIntro').textContent=row?'Ajuste a data, o certificado e o logo visível no painel dos alunos.':'Cadastre uma conquista para incluí-la na jornada.';
    $('#achievementTitle').value=row?.title||'';$('#achievementSlug').value=row?.id||'';$('#releaseDate').value=row?.release_date||'';
    $('#certificateEnabled').checked=!!row?.certificate_enabled;$('#slugWrap').hidden=!!row;
    $('#logoPreview').hidden=true;$('#scrim').hidden=false;$('#achievementTitle').focus();
    if(row?.panel_logo_path){
      try{const blob=await api.storageDownload(row.panel_logo_path);if(editingId===row.id)setPreview(blob,'Logo cadastrado.')}catch{$('#formError').textContent='Não foi possível carregar a imagem atual.'}
    }
  }

  $('#addAchievement').addEventListener('click',()=>openModal(null));
  $('#achievementTitle').addEventListener('input',()=>{if(!editingId)$('#achievementSlug').value=slugify($('#achievementTitle').value)});
  $('#panelLogoFile').addEventListener('change',event=>{
    const file=event.target.files?.[0];if(!file)return;
    if(file.type!=='image/png'||file.size>15*1024*1024){$('#formError').textContent='Envie um PNG de até 15 MB.';event.target.value='';return}
    selectedFile=file;setPreview(file,file.name);$('#formError').textContent='';
  });
  $('#achievementForm').addEventListener('submit',async event=>{
    event.preventDefault();
    const id=editingId||$('#achievementSlug').value.trim(),title=$('#achievementTitle').value.trim();
    if(!/^[a-z0-9-]{2,60}$/.test(id)){$('#formError').textContent='Informe um identificador com letras minúsculas, números e hífen.';return}
    const payload={title,release_date:$('#releaseDate').value||null,certificate_enabled:$('#certificateEnabled').checked,updated_at:new Date().toISOString()};
    const button=$('#saveAchievement');button.disabled=true;$('#formError').textContent='';
    try{
      if(editingId){
        await api.table('uaulingo_achievements',`?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});
      }else{
        await api.table('uaulingo_achievements','',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({id,...payload})});
        editingId=id;
      }
      if(selectedFile){
        const path=`panel/${id}.png`;
        await api.storageUpload(path,selectedFile);
        await api.table('uaulingo_achievements',`?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({panel_logo_path:path,updated_at:new Date().toISOString()})});
      }
      closeModal();await load();$('#savedDialog').showModal();$('#savedDialogClose').focus();
    }catch(error){$('#formError').textContent=friendly(error);await load()}
    finally{button.disabled=false}
  });
  $('#achievementsBody').addEventListener('click',event=>{const button=event.target.closest('[data-edit]');if(button)openModal(rows.find(row=>row.id===button.dataset.edit))});
  $('#studentAchievementsBody').addEventListener('click',event=>{const button=event.target.closest('[data-certificate-student]');if(button)downloadStudentCertificate(button.dataset.certificateStudent,button.dataset.certificateAchievement).catch(error=>status(friendly(error),true))});
  $('#achievementsTab').addEventListener('click',()=>{$('#achievementsPanel').hidden=false;$('#studentsAchievementsPanel').hidden=true;$('#achievementsTab').className='btn green';$('#studentsAchievementsTab').className='btn soft'});
  $('#studentsAchievementsTab').addEventListener('click',()=>{$('#achievementsPanel').hidden=true;$('#studentsAchievementsPanel').hidden=false;$('#achievementsTab').className='btn soft';$('#studentsAchievementsTab').className='btn green';loadStudentAchievements().catch(error=>status(friendly(error),true))});
  $('#achievementStudentFilter').addEventListener('input',renderStudentAchievements);
  $('#achievementFilter').addEventListener('change',renderStudentAchievements);
  $('#closeModal').addEventListener('click',closeModal);$('#cancelModal').addEventListener('click',closeModal);
  $('#savedDialogClose').addEventListener('click',()=>$('#savedDialog').close());
  $('#scrim').addEventListener('click',event=>{if(event.target.id==='scrim')closeModal()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#scrim').hidden)closeModal()});
  $('#linksToggle').addEventListener('click',()=>{const nav=$('#navLinks'),open=!nav.classList.contains('open');nav.classList.toggle('open',open);$('#linksToggle').setAttribute('aria-expanded',String(open))});
  $('#logoutButton').addEventListener('click',()=>api.signOut().finally(()=>location.href='uaulingo-admin-alunos.html'));
  (async()=>{
    const current=await api.session();if(!current?.user?.id){location.replace('uaulingo-admin-alunos.html');return}
    const staff=await api.table('uaulingo_staff',`?select=role&user_id=eq.${current.user.id}`);
    if(!staff.length){location.replace('uaulingo-admin-alunos.html');return}
    role=staff[0].role;$('#page').hidden=false;
    if(role!=='admin'){$('#addAchievement').disabled=true;$('#addAchievement').title='Somente administradoras podem alterar conquistas.'}
    await load();await window.UauLoading.complete();
  })().catch(async error=>{if(error?.status===401){location.replace('uaulingo-admin-alunos.html');return}$('#page').hidden=false;status(friendly(error),true);await window.UauLoading.complete()});
})();
