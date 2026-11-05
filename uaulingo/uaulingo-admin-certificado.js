(() => {
  const $ = selector => document.querySelector(selector);
  const api = window.UauCertificate;
  const db = window.UauSupabase;
  const fields = ['name','date'];
  const currentId = new URLSearchParams(location.search).get('id') || '';
  let template, previewUrl = '', dirty = false, imageChanged = false, loading = false;
  function status(message,error=false) {
    const el=$('#saveStatus'); el.textContent=message; el.classList.toggle('error',error);
  }
  function formatDate(value) {
    if(!value)return '29/10/2026';
    const [year,month,day]=value.split('-'); return `${day}/${month}/${year}`;
  }
  function setBackground(blob) {
    if(previewUrl)URL.revokeObjectURL(previewUrl);
    previewUrl=blob?URL.createObjectURL(blob):'';
    const image=$('#backgroundPreview');
    image.hidden=!blob;
    image.src=previewUrl;
    $('#emptyBackground').hidden=!!blob;
    $('#fileInfo').textContent=blob?(template.backgroundName||'PNG carregado'):'Nenhuma imagem selecionada.';
    $('#saveTemplate').disabled=!blob;
    $('#testPdf').disabled=!blob;
  }
  function setDirty() {dirty=true;status('Alterações ainda não salvas.');}
  function syncInputs() {
    for(const field of fields){
      for(const key of ['x','y','size'])$(`#${field}${key[0].toUpperCase()+key.slice(1)}`).value=template[field][key];
      $(`#${field}Color`).value=template[field].color;
    }
  }
  function preview() {
    if(!template)return;
    const box=$('#certificatePreview'),scale=box.clientWidth/api.width;
    $('#nameOverlay').textContent=$('#sampleName').value.trim()||'Nome do aluno';
    $('#dateOverlay').textContent=formatDate($('#sampleDate').value);
    for(const field of fields){
      const overlay=$(`#${field}Overlay`),p=template[field];
      overlay.style.left=p.x+'%';overlay.style.top=p.y+'%';
      overlay.style.fontSize=Math.max(10,p.size*scale)+'px';
      overlay.style.color=p.color;
    }
  }
  async function load() {
    loading=true;
    try {
      if(!/^[a-z0-9-]{2,60}$/.test(currentId))throw Error('Conquista inválida.');
      const rows=await db.table('uaulingo_achievements',`?select=id,title,certificate_enabled,certificate_image_path,name_layout,date_layout&id=eq.${encodeURIComponent(currentId)}`);
      const row=rows[0];if(!row||!row.certificate_enabled)throw Error('Esta conquista não tem certificado habilitado.');
      $('#achievementName').value=row.title;$('#achievementHeading').textContent=row.title;
      template={id:currentId,backgroundBlob:null,backgroundName:'',name:{...api.defaults().name,...row.name_layout},date:{...api.defaults().date,...row.date_layout}};
      if(row.certificate_image_path){template.backgroundBlob=await db.storageDownload(row.certificate_image_path);template.backgroundName='Imagem cadastrada';}
      else {
        const local=await api.get(currentId).catch(()=>null);
        if(local?.backgroundBlob){template.backgroundBlob=local.backgroundBlob;template.backgroundName=local.backgroundName||'Modelo antigo deste navegador';template.name={...template.name,...local.name};template.date={...template.date,...local.date};imageChanged=true;}
      }
      setBackground(template.backgroundBlob);
      syncInputs();preview();dirty=false;
      status(row.certificate_image_path?'Modelo salvo.':imageChanged?'Modelo antigo encontrado neste navegador. Clique em Salvar modelo para disponibilizá-lo à equipe.':'Envie um PNG para criar o certificado desta conquista.');
    } catch(error) {
      $('#achievementHeading').textContent='Não foi possível abrir a conquista.';
      $('#saveTemplate').disabled=true;$('#testPdf').disabled=true;
      status(error.message||'Não foi possível carregar o certificado.',true);
    } finally {loading=false;await window.UauLoading.complete()}
  }
  function numericInput(field,key) {
    if(!template)return;
    const input=$(`#${field}${key[0].toUpperCase()+key.slice(1)}`),value=Number(input.value);
    if(!Number.isFinite(value))return;
    const limit=key==='size'?[12,180]:[0,100];
    template[field][key]=Math.max(limit[0],Math.min(limit[1],value));
    preview();setDirty();
  }
  for(const field of fields){
    for(const key of ['x','y','size'])$(`#${field}${key[0].toUpperCase()+key.slice(1)}`).addEventListener('input',()=>numericInput(field,key));
    $(`#${field}Color`).addEventListener('input',event=>{if(!template)return;template[field].color=event.target.value;preview();setDirty()});
    const overlay=$(`#${field}Overlay`);
    overlay.addEventListener('pointerdown',event=>{event.preventDefault();overlay.setPointerCapture(event.pointerId);overlay.classList.add('dragging')});
    overlay.addEventListener('pointermove',event=>{
      if(!overlay.hasPointerCapture(event.pointerId))return;
      const rect=$('#certificatePreview').getBoundingClientRect();
      template[field].x=Math.round(Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100))*10)/10;
      template[field].y=Math.round(Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100))*10)/10;
      syncInputs();preview();setDirty();
    });
    overlay.addEventListener('pointerup',()=>overlay.classList.remove('dragging'));
    overlay.addEventListener('pointercancel',()=>overlay.classList.remove('dragging'));
    overlay.addEventListener('keydown',event=>{
      const changes={ArrowLeft:['x',-1],ArrowRight:['x',1],ArrowUp:['y',-1],ArrowDown:['y',1]};
      if(!changes[event.key]||!template)return;event.preventDefault();const [key,delta]=changes[event.key];
      template[field][key]=Math.max(0,Math.min(100,template[field][key]+delta));syncInputs();preview();setDirty();
    });
  }
  $('#sampleName').addEventListener('input',preview);
  $('#sampleDate').addEventListener('input',preview);
  new ResizeObserver(preview).observe($('#certificatePreview'));
  $('#backgroundFile').addEventListener('change',async event=>{
    if(!template){status('Aguarde a conquista carregar.',true);event.target.value='';return}
    const file=event.target.files?.[0];if(!file)return;
    if(file.type!=='image/png'){status('Envie um arquivo PNG.',true);event.target.value='';return}
    if(file.size>15*1024*1024){status('O PNG deve ter até 15 MB.',true);event.target.value='';return}
    const url=URL.createObjectURL(file);
    try {
      const image=new Image();image.src=url;
      await image.decode();
      template.backgroundBlob=file;template.backgroundName=file.name;
      imageChanged=true;setBackground(file);preview();setDirty();
    } catch {status('Não foi possível ler esse PNG.',true)}
    finally {URL.revokeObjectURL(url)}
    event.target.value='';
  });
  $('#resetPositions').addEventListener('click',()=>{if(!template)return;const defaults=api.defaults();template.name=defaults.name;template.date=defaults.date;syncInputs();preview();setDirty()});
  $('#saveTemplate').addEventListener('click',async()=>{
    if(!template?.backgroundBlob)return;
    try {
      $('#saveTemplate').disabled=true;
      const path=`certificates/${currentId}.png`;
      if(imageChanged)await db.storageUpload(path,template.backgroundBlob);
      await db.table('uaulingo_achievements',`?id=eq.${encodeURIComponent(currentId)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({certificate_image_path:path,name_layout:template.name,date_layout:template.date,updated_at:new Date().toISOString()})});
      imageChanged=false;dirty=false;status('Modelo salvo. Toda a equipe usará esta imagem e estas posições.');
      $('#savedDialog').showModal();$('#savedDialogClose').focus();
    } catch(error) {status('Não foi possível salvar: '+(error.message||'tente novamente.'),true)}
    finally {$('#saveTemplate').disabled=false}
  });
  $('#testPdf').addEventListener('click',async()=>{
    if(!template?.backgroundBlob)return;
    try {
      status('Gerando PDF de teste...');
      const canvas=document.createElement('canvas');
      await api.renderCustom(canvas,template,$('#sampleName').value.trim()||'Nome do aluno',formatDate($('#sampleDate').value));
      api.downloadPdf(canvas,'certificado-teste-'+currentId+'.pdf');
      status('PDF de teste baixado com os dados de exemplo.');
    } catch {status('Não foi possível gerar o PDF de teste.',true)}
  });
  $('#linksToggle').addEventListener('click',()=>{const nav=$('#navLinks'),open=!nav.classList.contains('open');nav.classList.toggle('open',open);$('#linksToggle').setAttribute('aria-expanded',String(open))});
  $('#savedDialogClose').addEventListener('click',()=>$('#savedDialog').close());
  $('#logoutButton').addEventListener('click',()=>{window.UauSupabase.signOut().finally(()=>location.href='uaulingo-admin-alunos.html')});
  load();
})();
