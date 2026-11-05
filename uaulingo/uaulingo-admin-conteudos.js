(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const api = window.UauSupabase;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const isHttps = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
  const dateLabel = (value,day) => value ? new Intl.DateTimeFormat('pt-BR', {dateStyle:'medium',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(value)) : day ? new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(`${day}T12:00:00Z`))+' · horário a definir' : 'Data a definir';
  const localInput = value => {
    if (!value) return '';
    const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value));
    const p = Object.fromEntries(parts.map(item => [item.type,item.value]));
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
  };
  const lessonDate = item => item?.scheduled_date || localInput(item?.scheduled_at).slice(0,10);
  const lessonTime = item => localInput(item?.scheduled_at).slice(11,16);
  const googleIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="#4285f4" d="M10 2a8 8 0 0 1 5.5 2.1l-2.2 2.2A4.8 4.8 0 0 0 10 5.1z"/><path fill="#34a853" d="M3.1 10A6.9 6.9 0 0 0 10 16.9v-3.1A3.8 3.8 0 0 1 6.2 10z"/><path fill="#fbbc05" d="M3.1 10A6.9 6.9 0 0 1 5 5.2l2.2 2.2A3.8 3.8 0 0 0 6.2 10z"/><path fill="#ea4335" d="M5 5.2A6.9 6.9 0 0 1 10 3.1v3.1a3.8 3.8 0 0 0-2.8 1.2z"/><path fill="#4285f4" d="M10 9h7.4c.3 5-2.7 8-7.4 8v-3.2c2.2 0 3.5-1 4-2H10z"/></svg>';
  const outlookIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path fill="#0879c9" d="M7 2h11v15H7z"/><path fill="#35a5e5" d="M8 5h9l-4.5 4z"/><path fill="#0563a8" d="M8 6l4.5 4L17 6v8H8z"/><path fill="#0b5ca7" d="M2 4h9v12H2z"/><text x="3.3" y="13.1" fill="white" font-size="8" font-weight="bold">O</text></svg>';
  let implementations = [], achievements = [], role = '', editingId = '', saving = false;
  function status(message,error=false) { $('#pageStatus').textContent=message; $('#pageStatus').style.color=error?'#ae414d':'#577363'; }
  function friendly(error) { if (error?.code==='42501') return 'Seu acesso não permite alterar conteúdos.'; if(['PGRST204','42703','PGRST205'].includes(error?.code))return 'A atualização de conteúdos ainda não foi ativada. Conclua a configuração antes de salvar.'; return error?.message || 'Não foi possível salvar. Tente novamente.'; }
  function addPreClass(container,item={}) {
    const row = document.createElement('div'); row.className='material-row';
    row.innerHTML=`<label class="field"><span>Nome do conteúdo</span><input class="pre-title" maxlength="120" placeholder="Ex.: Leitura inicial" value="${esc(item.title)}"></label><label class="field"><span>Link</span><input class="pre-url" type="url" placeholder="https://..." value="${esc(item.url)}"></label><button class="remove" type="button" aria-label="Remover conteúdo pré-aula" title="Remover conteúdo pré-aula">×</button>`;
    container.appendChild(row);
  }
  function addQuestion(item={}) {
    const card=document.createElement('div');card.className='question-card';
    const options=Array.isArray(item.options)?item.options:[];
    card.innerHTML=`<div class="question-head"><strong>Pergunta</strong><button class="btn soft remove-question" type="button">Remover</button></div><label class="field"><span>Enunciado</span><input class="question-prompt" maxlength="500" value="${esc(item.prompt)}" placeholder="Digite a pergunta"></label><div class="question-options">${['A','B','C','D'].map((letter,index)=>`<label class="field"><span>Alternativa ${letter}</span><input class="question-option" maxlength="300" value="${esc(options[index])}"></label>`).join('')}</div><label class="field"><span>Resposta correta</span><select class="question-correct">${['A','B','C','D'].map((letter,index)=>`<option value="${index}">${letter}</option>`).join('')}</select></label>`;
    card.querySelector('.question-correct').value=String(Number(item.correct_index)||0);
    card.querySelectorAll('input,select').forEach(input=>input.disabled=role!=='admin');
    card.querySelector('.remove-question').hidden=role!=='admin';
    $('#questionList').appendChild(card);updateQuestionControls();
  }
  function updateQuestionControls(){[...$('#questionList').children].forEach((card,index)=>card.querySelector('.question-head strong').textContent=`Pergunta ${index+1}`);$('#addQuestion').hidden=$('#questionList').children.length>=20||role!=='admin'}
  function updateLessonControls() {
    const cards=[...$('#lessons').children];
    cards.forEach((card,index) => { card.querySelector('.lesson-card-header strong').textContent=`Aula ${index+1}`; card.querySelector('.remove-lesson').hidden=cards.length===1 || role!=='admin'; });
    $('#addLessonInImplementation').hidden=cards.length>=3 || role!=='admin';
  }
  function addLesson(data={}) {
    if ($('#lessons').children.length>=3) return;
    const card=document.createElement('section'); card.className='lesson-card'; card.dataset.completedAt=data.completed_at || '';
    card.innerHTML=`<div class="lesson-card-header"><strong>Aula</strong><button class="btn soft remove-lesson" type="button">Remover aula</button></div><label class="field"><span>Nome da aula</span><input class="lesson-title" maxlength="160" placeholder="Ex.: Primeiros passos no Excel" value="${esc(data.title)}" required></label><div class="field-grid"><label class="field"><span>Data</span><input class="lesson-day" type="date" value="${esc(lessonDate(data))}"></label><label class="field"><span>Horário</span><input class="lesson-time" type="time" value="${esc(lessonTime(data))}"></label></div><div class="field-grid"><label class="field"><span>Quem apresenta</span><input class="lesson-instructors" maxlength="120" placeholder="Karen, Jéssica..." value="${esc(data.instructors)}"></label><label class="field"><span>Duração (min)</span><input class="lesson-duration" type="number" min="15" max="600" value="${Number(data.duration_minutes)||60}" required></label></div><label class="field"><span>O que você vai aprender</span><textarea class="lesson-outcomes" maxlength="10000" placeholder="Descreva o que esta aula ensina.">${esc(data.learning_outcomes)}</textarea></label><div class="section-title">CONTEÚDO PRÉ-AULA</div><p class="section-note">Opcional. Se ficar vazio, não aparecerá para o aluno.</p><div class="pre-class-list"></div><button class="btn soft add-pre-class" type="button">+ Adicionar conteúdo pré-aula</button><div class="section-title">APÓS A AULA AO VIVO</div><label class="completed-check"><input class="lesson-completed" type="checkbox" ${data.completed_at?'checked':''}> Aula realizada</label><div class="lesson-page-field" ${data.completed_at?'':'hidden'}><label class="field"><span>Gravação da aula na Hotmart</span><input class="lesson-recording" type="url" inputmode="url" placeholder="https://..." value="${esc(data.recording_url)}"></label><label class="field"><span>Material completo da aula</span><input class="lesson-materials" type="url" inputmode="url" placeholder="https://..." value="${esc(data.materials_url||data.lesson_page_url)}"></label></div>`;
    $('#lessons').appendChild(card);
    (Array.isArray(data.pre_class_content)?data.pre_class_content:[]).forEach(item=>addPreClass(card.querySelector('.pre-class-list'),item));
    card.querySelectorAll('input,textarea').forEach(input=>input.disabled=role!=='admin');
    card.querySelector('.add-pre-class').hidden=role!=='admin'; updateLessonControls();
  }
  function render() {
    const query=$('#search').value.trim().toLocaleLowerCase('pt-BR');
    const shown=implementations.filter(row=>!query || `${row.implementation_number} ${row.title}`.toLocaleLowerCase('pt-BR').includes(query));
    $('#totalCount').textContent=implementations.length;
    $('#publishedCount').textContent=implementations.filter(row=>row.status==='published').length;
    $('#draftCount').textContent=implementations.filter(row=>row.status==='draft').length;
    $('#lessonList').innerHTML=shown.length ? shown.map(row=>{
      const award=achievements.find(item=>item.id===row.achievement_id),lessons=Array.isArray(row.lessons)?row.lessons:[];
      return `<article class="lesson ${row.theme==='ai'?'theme-ai':'theme-excel'}"><div class="implementation-top"><span class="lesson-num">${String(Number(row.implementation_number)).padStart(2,'0')}</span><div class="implementation-main"><strong>${esc(row.title)}</strong><span class="theme-tag ${row.theme==='ai'?'ai':''}">${row.theme==='ai'?'✦ IA · GPTina':'▦ Excel · Excelo'}</span><small>${lessons.length} aula${lessons.length===1?'':'s'} · ${award?`Conquista: ${esc(award.title)}`:'Conquista não vinculada'}</small></div><div class="implementation-side"><span class="tag ${row.status==='published'?'published':'draft'}">${row.status==='published'?'Publicada':'Rascunho'}</span><button class="btn soft" type="button" data-edit="${esc(row.id)}">${role==='admin'?'Editar':'Visualizar'}</button></div></div><div class="implementation-lessons">${lessons.map((item,index)=>`<div class="mini-lesson ${item.completed_at?'done':''}"><strong>Aula ${index+1}</strong><span>${esc(item.title||'Sem título')}</span><time>${esc(dateLabel(item.scheduled_at))}</time>${item.completed_at?'<span class="lesson-state">✓ Aula realizada</span>':''}${item.completed_at&&isHttps(item.recording_url)?`<a class="lesson-page-link" href="${esc(item.recording_url)}" target="_blank" rel="noopener noreferrer">Gravação Hotmart ↗</a>`:''}${item.completed_at&&isHttps(item.materials_url||item.lesson_page_url)?`<a class="lesson-page-link" href="${esc(item.materials_url||item.lesson_page_url)}" target="_blank" rel="noopener noreferrer">Material completo ↗</a>`:''}</div>`).join('')}</div><div class="calendar-links">${row.google_calendar_url&&isHttps(row.google_calendar_url)?`<a class="calendar-button" href="${esc(row.google_calendar_url)}" target="_blank" rel="noopener noreferrer">${googleIcon} Google Agenda</a>`:''}${row.outlook_calendar_url&&isHttps(row.outlook_calendar_url)?`<a class="calendar-button" href="${esc(row.outlook_calendar_url)}" target="_blank" rel="noopener noreferrer">${outlookIcon} Outlook</a>`:''}${row.join_url&&isHttps(row.join_url)?`<a class="join-link" href="${esc(row.join_url)}" target="_blank" rel="noopener noreferrer">Participar das aulas ao vivo ↗</a>`:''}</div></article>`;
    }).join('') : `<div class="empty"><strong>${query?'Nenhuma implementação encontrada.':'A jornada começa com a primeira implementação.'}</strong>${query?'Tente outra busca.':'Cadastre a implementação e suas aulas para montar o cronograma.'}</div>`;
    $('#lessonList').querySelectorAll('article.lesson').forEach((article,index)=>{
      const row=shown[index];
      if(row.theme==='both'){
        article.classList.add('theme-both');
        article.querySelector('.theme-tag').classList.add('both');
        article.querySelector('.theme-tag').textContent='▦✦ Excel + IA · Excelo e GPTina';
      }
      article.querySelectorAll('.mini-lesson time').forEach((element,lessonIndex)=>{const lesson=row.lessons?.[lessonIndex];element.textContent=dateLabel(lesson?.scheduled_at,lesson?.scheduled_date)});
    });
  }
  async function load() {
    status('Carregando implementações...');
    try { [implementations,achievements]=await Promise.all([api.table('uaulingo_implementations','?select=*&order=implementation_number.asc'),api.table('uaulingo_achievements','?select=id,title&order=title.asc')]); render(); status(''); }
    catch(error) { status('Não foi possível carregar as implementações. Confira se a estrutura desta etapa foi ativada. '+friendly(error),true); }
  }
  function openEditor(row) {
    editingId=row?.id||''; $('#lessonForm').reset(); $('#lessons').replaceChildren(); $('#formError').textContent='';
    $('#editorTitle').textContent=row?'Editar implementação':'Nova implementação';
    $('#implementationNumber').value=row?.implementation_number||Math.max(1,...implementations.map(item=>Number(item.implementation_number)+1));
    $('#implementationTitle').value=row?.title||'';
    $('#implementationTheme').value=row?.theme||'excel';
    $('#achievementId').innerHTML='<option value="">Selecione uma conquista</option>'+achievements.map(item=>`<option value="${esc(item.id)}">${esc(item.title)}</option>`).join('');
    $('#achievementId').value=row?.achievement_id||''; $('#implementationJoinUrl').value=row?.join_url||row?.lessons?.[0]?.join_url||'';$('#googleCalendarUrl').value=row?.google_calendar_url||'';$('#outlookCalendarUrl').value=row?.outlook_calendar_url||'';
    $('#implementationStatus').value=row?.status||'draft';
    (Array.isArray(row?.lessons)&&row.lessons.length?row.lessons:[{}]).forEach(addLesson);
    $('#questionList').replaceChildren();
    $('#exerciseEnabled').checked=!!row?.exercise;
    $('#exerciseFields').hidden=!row?.exercise;
    $('#exerciseTitle').value=row?.exercise?.title||'';
    $('#exerciseXpPerCorrect').value=Number.isInteger(row?.exercise?.xp_per_correct)?row.exercise.xp_per_correct:10;
    $('#exerciseOpens').value=localInput(row?.exercise?.opens_at);
    $('#exerciseDue').value=localInput(row?.exercise?.due_at);
    (Array.isArray(row?.exercise?.questions)?row.exercise.questions:[]).forEach(addQuestion);
    updateQuestionControls();$('#exerciseSection').open=!!row?.exercise;
    $('#challengeEnabled').checked=!!row?.challenge;
    $('#challengeFields').hidden=!row?.challenge;
    $('#challengeTitle').value=row?.challenge?.title||'';
    $('#challengeInstructions').value=row?.challenge?.instructions||'';
    $('#challengeResourcesUrl').value=row?.challenge?.resources_url||'';$('#challengeXpReward').value=Number.isInteger(row?.challenge?.xp_reward)?row.challenge.xp_reward:60;
    $('#challengeOpens').value=localInput(row?.challenge?.opens_at);
    $('#challengeDue').value=localInput(row?.challenge?.due_at);
    $('#challengeSection').open=!!row?.challenge;
    $('#lessonForm').querySelectorAll('input,textarea,select').forEach(input=>input.disabled=role!=='admin');
    $('#addQuestion').hidden=role!=='admin'||$('#questionList').children.length>=20;
    $('#saveLesson').hidden=role!=='admin'; $('#editor').hidden=false; $('#implementationTitle').focus();
  }
  function closeEditor() { if(saving)return; $('#editor').hidden=true; editingId=''; }
  function collectLessons() {
    const cards=[...$('#lessons').children];
    if(cards.length<1||cards.length>3)throw Error('Cadastre de uma a três aulas.');
    return cards.map((card,index)=>{
      const title=card.querySelector('.lesson-title').value.trim(),date=card.querySelector('.lesson-day').value,time=card.querySelector('.lesson-time').value,instructors=card.querySelector('.lesson-instructors').value.trim();
      const duration=Number(card.querySelector('.lesson-duration').value),pre=[];
      const completed=card.querySelector('.lesson-completed').checked,recording=card.querySelector('.lesson-recording').value.trim(),materials=card.querySelector('.lesson-materials').value.trim();
      if(title.length<2)throw Error(`Informe o nome da aula ${index+1}.`);
      if(date&&Number.isNaN(new Date(`${date}T12:00:00`).getTime()))throw Error(`Informe uma data válida para a aula ${index+1}.`);
      if(time&&!date)throw Error(`Informe a data da aula ${index+1} para definir o horário.`);
      if($('#implementationStatus').value==='published'&&(!date||!time))throw Error(`Informe data e hora da aula ${index+1} antes de publicar.`);
      if(!Number.isInteger(duration)||duration<15||duration>600)throw Error(`A duração da aula ${index+1} deve ficar entre 15 e 600 minutos.`);
      if(completed&&(!isHttps(recording)||!isHttps(materials)))throw Error(`Informe os links da gravação e do material completo da aula ${index+1}.`);
      if(recording&&!isHttps(recording)||materials&&!isHttps(materials))throw Error(`Os links da aula ${index+1} devem começar com https://.`);
      for(const row of card.querySelectorAll('.material-row')){
        const name=row.querySelector('.pre-title').value.trim(),url=row.querySelector('.pre-url').value.trim();
        if(!name&&!url)continue;
        if(!name||!isHttps(url))throw Error(`Preencha o nome e um link https:// em cada conteúdo pré-aula da aula ${index+1}.`);
        pre.push({title:name,url});
      }
      return {title,scheduled_date:date||null,scheduled_at:date&&time?new Date(`${date}T${time}:00`).toISOString():null,instructors,duration_minutes:duration,learning_outcomes:card.querySelector('.lesson-outcomes').value.trim(),pre_class_content:pre,completed_at:completed?(card.dataset.completedAt||new Date().toISOString()):null,recording_url:completed?recording:'',materials_url:completed?materials:''};
    });
  }
  function activityDates(prefix,label) {
    const start=$(`#${prefix}Opens`).value,end=$(`#${prefix}Due`).value;
    if($('#implementationStatus').value==='published'&&!start)throw Error(`Informe quando o ${label} ficará disponível.`);
    if(start&&Number.isNaN(new Date(start).getTime()))throw Error(`Data de liberação do ${label} inválida.`);
    if(end&&Number.isNaN(new Date(end).getTime()))throw Error(`Prazo do ${label} inválido.`);
    if(start&&end&&new Date(end)<=new Date(start))throw Error(`O prazo do ${label} deve ser posterior à liberação.`);
    return {opens_at:start?new Date(start).toISOString():null,due_at:end?new Date(end).toISOString():null};
  }
  function collectExercise() {
    if(!$('#exerciseEnabled').checked)return null;
    const title=$('#exerciseTitle').value.trim(),cards=[...$('#questionList').children];
    if(title.length<2)throw Error('Informe o título do exercício.');
    if(cards.length<1||cards.length>20)throw Error('Cadastre de 1 a 20 perguntas no exercício.');
    const questions=cards.map((card,index)=>{
      const prompt=card.querySelector('.question-prompt').value.trim();
      const options=[...card.querySelectorAll('.question-option')].map(input=>input.value.trim());
      const correct=Number(card.querySelector('.question-correct').value);
      if(prompt.length<2||options.some(value=>value.length<1)||!Number.isInteger(correct)||correct<0||correct>3)throw Error(`Complete o enunciado, as quatro alternativas e a resposta correta da pergunta ${index+1}.`);
      return {prompt,options,correct_index:correct};
    });
    const xp=Number($('#exerciseXpPerCorrect').value);if(!Number.isInteger(xp)||xp<0||xp>100)throw Error('Defina de 0 a 100 XP por acerto.');
    return {title,xp_per_correct:xp,...activityDates('exercise','exercício'),questions};
  }
  function collectChallenge() {
    if(!$('#challengeEnabled').checked)return null;
    const title=$('#challengeTitle').value.trim(),instructions=$('#challengeInstructions').value.trim(),resources=$('#challengeResourcesUrl').value.trim(),xp=Number($('#challengeXpReward').value);
    if(title.length<2||instructions.length<10)throw Error('Informe o título e as instruções do desafio.');
    if(resources&&!isHttps(resources))throw Error('O link dos materiais do desafio deve começar com https://.');
    if(!Number.isInteger(xp)||xp<0||xp>1000)throw Error('Defina de 0 a 1000 XP para o desafio.');
    return {title,instructions,resources_url:resources,xp_reward:xp,...activityDates('challenge','desafio'),submission:'link_review'};
  }
  $('#addLesson').addEventListener('click',()=>openEditor(null));
  $('#addLessonInImplementation').addEventListener('click',()=>addLesson());
  $('#closeEditor').addEventListener('click',closeEditor); $('#cancelEditor').addEventListener('click',closeEditor);
  $('#editor').addEventListener('click',event=>{if(event.target.id==='editor')closeEditor()});
  $('#lessons').addEventListener('click',event=>{
    const remove=event.target.closest('.remove-lesson');
    if(remove){if($('#lessons').children.length>1){remove.closest('.lesson-card').remove();updateLessonControls()}return}
    const add=event.target.closest('.add-pre-class');
    if(add){addPreClass(add.closest('.lesson-card').querySelector('.pre-class-list'));return}
    const removePre=event.target.closest('.material-row .remove');
    if(removePre)removePre.closest('.material-row').remove();
  });
  $('#lessons').addEventListener('change',event=>{
    if(event.target.matches('.lesson-completed'))event.target.closest('.lesson-card').querySelector('.lesson-page-field').hidden=!event.target.checked;
  });
  $('#exerciseEnabled').addEventListener('change',event=>{
    $('#exerciseFields').hidden=!event.target.checked;
    if(event.target.checked&&!$('#questionList').children.length)addQuestion();
  });
  $('#challengeEnabled').addEventListener('change',event=>$('#challengeFields').hidden=!event.target.checked);
  $('#addQuestion').addEventListener('click',()=>{if($('#questionList').children.length<20)addQuestion()});
  $('#questionList').addEventListener('click',event=>{
    const remove=event.target.closest('.remove-question');
    if(remove){remove.closest('.question-card').remove();updateQuestionControls()}
  });
  $('#lessonList').addEventListener('click',event=>{
    const edit=event.target.closest('[data-edit]');
    if(edit)openEditor(implementations.find(row=>row.id===edit.dataset.edit));
  });
  $('#search').addEventListener('input',render);
  $('#savedDialogClose').addEventListener('click',()=>$('#savedDialog').close());
  $('#lessonForm').addEventListener('submit',async event=>{
    event.preventDefault(); if(role!=='admin'||saving)return;
    const number=Number($('#implementationNumber').value),title=$('#implementationTitle').value.trim();
    const achievementId=$('#achievementId').value,joinUrl=$('#implementationJoinUrl').value.trim(),googleUrl=$('#googleCalendarUrl').value.trim(),outlookUrl=$('#outlookCalendarUrl').value.trim();
    try {
      if(!Number.isInteger(number)||number<1||number>999||title.length<2)throw Error('Informe um número e um nome válidos.');
      if(joinUrl&&!isHttps(joinUrl))throw Error('O link da implementação deve começar com https://.');
      if(googleUrl&&!isHttps(googleUrl)||outlookUrl&&!isHttps(outlookUrl))throw Error('Os links das agendas devem começar com https://.');
      if($('#implementationStatus').value==='published'&&!achievementId)throw Error('Vincule uma conquista antes de publicar.');
      const lessons=collectLessons();
      const exercise=collectExercise(),challenge=collectChallenge();
      const payload={implementation_number:number,title,theme:$('#implementationTheme').value,achievement_id:achievementId||null,join_url:joinUrl,google_calendar_url:googleUrl,outlook_calendar_url:outlookUrl,lessons,exercise,challenge,status:$('#implementationStatus').value,updated_at:new Date().toISOString()};
      saving=true; $('#saveLesson').disabled=true; $('#formError').textContent='';
      if(editingId)await api.table('uaulingo_implementations',`?id=eq.${encodeURIComponent(editingId)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});
      else await api.table('uaulingo_implementations','',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});
      saving=false; closeEditor(); await load(); $('#savedDialog').showModal(); $('#savedDialogClose').focus();
    } catch(error) { $('#formError').textContent=friendly(error); }
    finally { saving=false; $('#saveLesson').disabled=false; }
  });
  $('#linksToggle').addEventListener('click',()=>{const nav=$('#navLinks'),open=!nav.classList.contains('open');nav.classList.toggle('open',open);$('#linksToggle').setAttribute('aria-expanded',String(open))});
  $('#logoutButton').addEventListener('click',()=>api.signOut().finally(()=>location.href='uaulingo-admin-alunos.html'));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#editor').hidden)closeEditor()});
  (async()=>{
    const current=await api.session(); if(!current?.user?.id){location.replace('uaulingo-admin-alunos.html');return}
    const staff=await api.table('uaulingo_staff',`?select=role&user_id=eq.${current.user.id}`);
    if(!staff.length){location.replace('uaulingo-admin-alunos.html');return}
    role=staff[0].role; $('#page').hidden=false;
    if(role!=='admin'){$('#addLesson').disabled=true;$('#addLesson').title='Somente administradoras podem alterar conteúdos.'}
    await load();await window.UauLoading.complete();
  })().catch(async error=>{if(error?.status===401){location.replace('uaulingo-admin-alunos.html');return}$('#page').hidden=false;status(friendly(error),true);await window.UauLoading.complete()});
})();
