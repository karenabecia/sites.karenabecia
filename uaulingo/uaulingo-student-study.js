(()=>{
  'use strict';
  const questions=[
    ['Quando você pensa no seu trabalho com dados hoje, qual dessas situações te representa melhor?','Perco muito tempo fazendo coisas repetitivas que já deveriam ser automáticas','Tenho números, mas queria transformá-los em Dashboards que façam sentido visualmente','Já entrego análises boas, mas sinto que não sou valorizado como deveria','Tudo funciona, mas queria organizar melhor meu fluxo e ganhar velocidade'],
    ['Quando alguém te pede uma atualização de dados ou relatório, o que geralmente acontece?','Preciso atualizar tudo manualmente ou refazer fórmulas','Consigo atualizar, mas demora porque ainda organizo tudo na mão','Já tenho meu processo montado, mas a apresentação final não causa impacto','Atualizo rápido, mas queria entregar algo mais estratégico do que só números'],
    ['Quando o assunto é Dashboard, qual é sua relação atual?','Ainda nem cheguei na parte de Dashboard, estou tentando organizar minha rotina primeiro','Já criei alguns, mas ainda não chegam no nível visual ou profissional que eu gostaria','Sei fazer, mas queria deixar mais inteligente, automático e com menos trabalho manual','Já faço bem, agora quero usar isso para crescer na carreira e ser reconhecido'],
    ['Sobre repetição de tarefas no trabalho, o que melhor descreve sua rotina?','Faço as mesmas coisas toda semana e sinto que poderia ser automático','Tenho processos, mas ainda gasto tempo copiando, limpando ou organizando dados','Já automatizei algumas partes, mas queria ir além da planilha e conectar tudo de forma inteligente','Não é só sobre automatizar… quero usar meu trabalho para me destacar'],
    ['Se você tivesse que escolher uma prioridade para evoluir agora, qual seria?','Parar de perder tempo com tarefas manuais','Construir Dashboards profissionais que impressionem','Me tornar referência no que faço, dentro ou fora da empresa','Organizar meus dados de um jeito que facilite qualquer análise ou automação'],
    ['Como você descreveria seu reconhecimento no trabalho hoje?','Eu entrego muito, mas quase ninguém vê o valor disso','Veem meu trabalho, mas não como algo estratégico — é só relatório','Estou crescendo, mas ainda não sou visto como alguém indispensável','Quero deixar de ser a pessoa que resolve planilha e virar alguém consultado para decisões'],
    ['Quando precisa explicar um resultado ou análise para alguém, como se sente?','Tenho os dados, mas não sei como apresentar de forma clara','Consigo explicar, mas queria que fosse mais visual e autoexplicativo','Já explico bem, mas queria que o próprio relatório falasse por mim','Não quero só apresentar — quero influenciar quem decide'],
    ['Sobre tempo disponível para estudar, qual é a sua realidade?','Tenho pouco tempo, preciso de coisas práticas que resolvam meu problema real','Consigo estudar, mas preciso ver resultado rápido para valer a pena','Consigo estudar, mas só se o aprendizado gerar impacto direto na minha carreira','Estudo com foco total em crescimento profissional e posicionamento'],
    ['Quando você vê alguém sendo promovido ou chamado para projetos, o que pensa?','Se eu tivesse um fluxo de trabalho melhor, também poderia estar ali','Se eu soubesse apresentar melhor meus dados, já teria sido percebido','Tenho habilidade, só falta abrir espaço e mostrar isso','Eu quero ser a pessoa que o mercado procura, não a que precisa correr atrás'],
    ['Quando lida com erros ou inconsistências em dados, como reage?','Já sei onde costuma dar problema, mas ainda corrijo manualmente','Eu conserto, mas sei que isso poderia ser automatizado','Tento criar uma estrutura mais inteligente, mas ainda não cheguei lá','Eu quero parar de apagar incêndio e trabalhar só com sistema confiável'],
    ['Se você pudesse apertar um botão e resolver um problema hoje, qual seria?','Quero eliminar tarefas repetitivas e ganhar horas por semana','Quero criar Dashboards que gerem impacto imediato e reconhecimento','Quero parar de depender de planilhas e fazer tudo rodar sozinho','Quero transformar tudo isso em crescimento, oportunidade e valorização'],
    ['Quando você pensa no seu futuro profissional daqui a 1 ano, qual cenário faz mais sentido?','Trabalhando com muito mais velocidade e menos retrabalho','Sendo reconhecido como a pessoa dos Dashboards e análises visuais','Tendo processos automatizados e sendo visto como especialista técnico','Sendo chamado para projetos, indicações, consultorias ou promoções']
  ];
  const courseHelp={
    'Excel Scout':'Organize planilhas e crie uma base confiável para trabalhar com dados.',
    'Excel Target':'Ganhe segurança com fórmulas e reduza correções repetidas.',
    'Conexão Power Query':'Padronize bases e automatize a preparação dos dados.',
    'I.A. com Dados':'Use inteligência artificial para analisar e interpretar informações.',
    'Scout for Google Sheets':'Aplique organização e produtividade às planilhas Google.',
    'Scout for Sheets':'Organize seus fluxos no Google Sheets.',
    'Multiplicador Efeito UAU':'Amplie a visibilidade do seu conhecimento e da sua entrega.',
    'Multiplicador':'Desenvolva posicionamento, liderança e visibilidade.',
    'DashBusiness':'Transforme dados do negócio em decisões mais claras.',
    'DashWay':'Construa Dashboards profissionais e comunique resultados.',
    'PPT Efeito UAU':'Apresente conclusões com mais clareza e impacto.',
    'Office 365 Explorer':'Conecte ferramentas do dia a dia e melhore seu fluxo.',
    'Gráficos Efeito UAU':'Escolha gráficos que deixem a mensagem dos dados evidente.',
    'Excel Money':'Transforme sua habilidade em oportunidades de renda e consultoria.',
    'OnPower':'Crie Dashboards e relatórios automatizados com modelagem e conexão profissional.'
  };
  const routes={
    produtividade:{title:'Produtividade nota 11',theme:'excel',eyebrow:'TRILHA DE ACELERAÇÃO',summary:'Sua rotina já envolve dados, mas tarefas manuais e correções consomem tempo que poderia ir para análises melhores. A prioridade é criar um fluxo confiável e repetível antes de aumentar a complexidade das entregas.',challenges:['Você dedica esforço demais a atividades operacionais.','Atualizações parecidas exigem refazer etapas do zero.','Planilhas e arquivos chegam sem um padrão consistente.','Erros são corrigidos manualmente e atrasam a entrega.'],courses:['Excel Scout','Excel Target','Conexão Power Query'],matrix:{urgent:['Excel Scout','Excel Target','Conexão Power Query'],important:['Scout for Google Sheets','I.A. com Dados'],relevant:['DashWay','DashBusiness','Multiplicador Efeito UAU'],extras:['Gráficos Efeito UAU','Office 365 Explorer','PPT Efeito UAU']},expected:'Com a trilha em prática, você organiza as bases, reduz o retrabalho e entrega resultados com mais rapidez. O tempo economizado abre espaço para um trabalho mais visível e valorizado.'},
    dashboards:{title:'Dashboards Pro',theme:'excel',eyebrow:'TRILHA DE ACELERAÇÃO',summary:'Você já reúne dados e quer que eles contem uma história clara. Seu próximo passo é transformar tabelas e indicadores em Dashboards que ajudem outras pessoas a entender o cenário e decidir.',challenges:['A informação existe, mas a apresentação não evidencia o que importa.','O visual dos relatórios ainda exige ajustes frequentes.','É difícil escolher os gráficos certos para cada pergunta.','Atualizar o Dashboard pode tomar tempo demais.'],courses:['DashWay','OnPower','Conexão Power Query'],matrix:{urgent:['DashWay','OnPower','Conexão Power Query'],important:['I.A. com Dados','Gráficos Efeito UAU','Multiplicador'],relevant:['Excel Money','Scout for Sheets','Office 365 Explorer'],extras:['PPT Efeito UAU','DashBusiness']},expected:'Você passa a apresentar indicadores claros, com visual consistente e foco na decisão. Seus Dashboards deixam de ser apenas uma coleção de gráficos e passam a explicar o resultado.'},
    automacao:{title:'Mestre das Automações',theme:'ai',eyebrow:'TRILHA DE ACELERAÇÃO',summary:'Você reconhece padrões no trabalho e quer que as ferramentas executem a parte repetitiva. A trilha começa pela estrutura dos dados, avança para a automação e depois conecta inteligência artificial à análise.',challenges:['Copiar, limpar e consolidar arquivos ainda depende de você.','Os processos quebram quando muda a estrutura de uma planilha.','As ferramentas trabalham separadas e exigem passos manuais entre elas.','Você quer usar I.A. com dados reais, mantendo um fluxo confiável.'],courses:['Conexão Power Query','OnPower','Excel Target'],matrix:{urgent:['Conexão Power Query','OnPower','Excel Target'],important:['DashWay','Scout for Sheets','I.A. com Dados'],relevant:['Excel Money','Office 365 Explorer'],extras:['Multiplicador','PPT Efeito UAU']},expected:'Você cria rotinas mais estáveis, gasta menos tempo em tarefas repetidas e consegue usar I.A. para ampliar a análise, em vez de apenas acelerar o trabalho manual.'},
    profissional_uau:{title:'Profissional UAU',theme:'ai',eyebrow:'TRILHA DE ACELERAÇÃO',summary:'Você já trabalha com dados com autonomia. Agora é hora de transformar sua capacidade técnica em reconhecimento, confiança e oportunidades. O foco está em comunicar o impacto das suas entregas e se posicionar profissionalmente.',challenges:['Você entrega bons resultados, mas seu valor nem sempre é percebido.','Sua experiência não aparece quando surgem projetos ou oportunidades.','Você sente que poderia contribuir em decisões maiores.','Falta uma forma consistente de apresentar sua autoridade.','Pessoas com menos domínio técnico às vezes ganham mais destaque.'],courses:['Multiplicador','Excel Money','DashWay'],matrix:{urgent:['Multiplicador','Excel Money','DashWay'],important:['DashBusiness','I.A. com Dados','Gráficos Efeito UAU'],relevant:['Scout for Sheets','OnPower','Conexão Power Query'],extras:['Excel Target','Office 365 Explorer']},expected:'Você mostra suas análises com mais clareza, transforma conhecimento em oportunidades e constrói uma presença profissional compatível com o valor que entrega.'}
  };
  const keys=['produtividade','dashboards','automacao','profissional_uau'];
  const weights=[
    [0,1,3,0],[0,0,1,3],[0,1,2,3],[0,0,2,3],
    [0,1,3,2],[3,3,3,3],[1,1,2,3],[0,1,3,3],
    [0,1,3,3],[0,2,2,2],[0,1,2,3],[0,1,2,3]
  ];
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const box=()=>document.getElementById('studyContent');
  const context=()=>window.UauStudentContext||{preview:true};
  const state={loaded:false,loading:false,saving:false,record:null,step:-1,answers:Array(questions.length).fill(null),progress:new Set(),expanded:new Set()};
  const previewProgressKey='uaulingo-study-progress-preview';
  const allCourses=route=>[...new Set(Object.values(route.matrix).flat())];
  function resultMarkup(route){
    const courseNames=allCourses(route),done=courseNames.filter(name=>state.progress.has(name)).length;
    const progress=Math.round(done/courseNames.length*100);
    const mark=name=>`<button type="button" class="study-mark ${state.progress.has(name)?'done':''}" data-study-course="${escape(name)}" aria-pressed="${state.progress.has(name)}">${state.progress.has(name)?'✓ Estudado':'Marcar como estudado'}</button>`;
    const groups=[['urgent','Urgente · Comece agora','Os treinamentos que resolvem a necessidade mais imediata.'],['important','Importante · Próximo passo','Construa a base que sustenta sua evolução.'],['relevant','Relevante · Aprofunde','Amplie o alcance das suas entregas.'],['extras','Extras · Explore depois','Complementos para quando sua base estiver pronta.']];
    const groupStart={urgent:0,important:route.matrix.urgent.length,relevant:route.matrix.urgent.length+route.matrix.important.length,extras:route.matrix.urgent.length+route.matrix.important.length+route.matrix.relevant.length};
    return `<div class="study-path ${route.theme}">
      <section class="study-card study-result-hero"><span class="study-eyebrow">${escape(route.eyebrow)} · ${escape(new Date(state.record.completed_at).toLocaleDateString('pt-BR'))}</span><h2>${escape(route.title)}</h2><p>${escape(route.summary)}</p><div class="study-route-progress"><div><strong>${done} de ${courseNames.length} treinamentos marcados</strong><small>Seu acompanhamento pessoal da trilha</small></div><span>${progress}%</span></div><div class="study-progress"><span style="width:${progress}%"></span></div></section>
      <section class="study-section"><div class="study-section-title"><span>01</span><div><small>O QUE TRAVA SEU AVANÇO</small><h2>Principais desafios</h2></div></div><div class="study-challenges">${route.challenges.map((challenge,index)=>`<article><span>0${index+1}</span><p>${escape(challenge)}</p></article>`).join('')}</div></section>
      <section class="study-section"><div class="study-section-title"><span>02</span><div><small>SUAS PRIMEIRAS MISSÕES</small><h2>Por onde começar</h2></div></div><p>Faça esses três treinamentos na ordem sugerida. Abra um curso para estudar na sua área de treinamentos e marque aqui quando terminar.</p><div class="study-start-grid">${route.courses.map((name,index)=>`<article class="study-start-card"><span class="study-start-number">${String(index+1).padStart(2,'0')}</span><h3>${escape(name)}</h3><p>${escape(courseHelp[name]||'Aprofunde sua prática com este treinamento.')}</p><div class="study-start-actions"><a href="https://hotmart.com/pt-br/club/karenabecia" target="_blank" rel="noopener noreferrer">Abrir treinamentos ↗</a>${mark(name)}</div></article>`).join('')}</div></section>
      <section class="study-section"><div class="study-section-title"><span>03</span><div><small>SEU MAPA DE ESTUDOS</small><h2>Matriz de prioridades</h2></div></div><p>Explore as quatro áreas e abra cada treinamento para ver como ele contribui para o seu objetivo. Você pode marcar o que já estudou em qualquer ordem.</p><div class="study-matrix">${groups.map(([key,label,description])=>`<div class="study-matrix-group ${key}"><div class="study-matrix-head"><h3>${label}</h3><p>${description}</p></div>${route.matrix[key].map((name,index)=>`<details data-study-matrix="${escape(key+'-'+index)}" ${state.expanded.has(key+'-'+index)?'open':''}><summary><span>${String(groupStart[key]+index+1).padStart(2,'0')}</span><strong>${escape(name)}</strong><em>${state.progress.has(name)?'✓':''}</em></summary><div class="study-matrix-detail"><p>${escape(courseHelp[name]||'Treinamento complementar para sua jornada.')}</p>${mark(name)}</div></details>`).join('')}</div>`).join('')}</div></section>
      <section class="study-card study-outcome"><span class="study-eyebrow">DEPOIS DE SEGUIR ESTA TRILHA</span><h2>Resultado esperado</h2><p>${escape(route.expected)}</p><div class="study-actions"><a class="btn btn-primary" href="https://hotmart.com/pt-br/club/karenabecia" target="_blank" rel="noopener noreferrer">Acessar meus treinamentos ↗</a><button class="btn btn-ghost" type="button" data-view="support">Falar com o Suporte VIP</button><button class="btn btn-ghost" type="button" data-study="restart">Refazer diagnóstico</button></div><p id="studySaveNote" class="study-error" role="status"></p></section>
    </div>`;
  }
  function calculate(answers){
    const scores=[0,0,0,0];
    answers.forEach((answer,index)=>{scores[weights[index][answer]]+=(index===4||index>=10)?2:1});
    return keys[scores.indexOf(Math.max(...scores))];
  }
  async function load(){
    if(state.loaded||state.loading)return;
    state.loading=true;
    try{
      if(context().preview){state.record=JSON.parse(localStorage.getItem('uaulingo-study-preview')||'null');state.progress=new Set(JSON.parse(localStorage.getItem(previewProgressKey)||'[]').filter(row=>row.result_key===state.record?.result_key).map(row=>row.course_name))}
      else{const rows=await window.UauSupabase.table('uaulingo_study_diagnoses',`?select=result_key,completed_at&student_id=eq.${context().studentId}&order=completed_at.desc&limit=1`);state.record=rows[0]||null;if(state.record){const progress=await window.UauSupabase.table('uaulingo_study_course_progress',`?select=course_name&student_id=eq.${context().studentId}&result_key=eq.${state.record.result_key}`);state.progress=new Set(progress.map(row=>row.course_name))}}
      state.loaded=true;
    }catch(error){box().innerHTML=`<div class="study-card"><p>Não foi possível carregar sua trilha agora. ${escape(error.message)}</p><button class="btn btn-primary" data-study="retry">Tentar novamente</button></div>`}
    finally{state.loading=false;if(state.loaded)draw()}
  }
  function draw(){
    const root=box();if(!root)return;
    if(state.step<0){
      const result=routes[state.record?.result_key];
      root.innerHTML=result?resultMarkup(result)
        :`<div class="study-card study-intro"><span class="study-eyebrow">DIAGNÓSTICO PERSONALIZADO</span><h2>Por onde começar?</h2><p>Conte como é sua rotina com dados. Ao final, indicaremos três treinamentos gravados para começar sua trilha.</p><p class="muted">12 perguntas · cerca de 4 minutos</p><button class="btn btn-primary" data-study="start">Descobrir minha trilha →</button></div>`;
      return;
    }
    const q=questions[state.step];
    root.innerHTML=`<div class="study-card study-question"><div class="study-progress-label"><span>PERGUNTA ${state.step+1} DE ${questions.length}</span><strong>${Math.round(state.step/questions.length*100)}%</strong></div><div class="study-progress"><span style="width:${Math.round(state.step/questions.length*100)}%"></span></div><h2>${escape(q[0])}</h2><div class="study-options">${q.slice(1).map((answer,index)=>`<button type="button" class="study-option ${state.answers[state.step]===index?'selected':''}" data-study-answer="${index}" aria-pressed="${state.answers[state.step]===index}"><span>${String.fromCharCode(65+index)}</span>${escape(answer)}</button>`).join('')}</div><div class="study-actions"><button class="btn btn-ghost" data-study="back" ${state.step===0?'disabled':''}>Voltar</button><button class="btn btn-primary" data-study="next" ${state.answers[state.step]===null||state.saving?'disabled':''}>${state.step===questions.length-1?'Ver meu resultado':'Próximo'} →</button></div><p class="study-error" role="alert"></p></div>`;
  }
  async function finish(){
    if(state.saving)return;state.saving=true;draw();
    const record={student_id:context().studentId,answers:state.answers,result_key:calculate(state.answers)};
    try{
      if(context().preview){record.completed_at=new Date().toISOString();localStorage.setItem('uaulingo-study-preview',JSON.stringify(record));}
      else{const saved=await window.UauSupabase.table('uaulingo_study_diagnoses','?select=result_key,completed_at',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(record)});record.completed_at=saved[0]?.completed_at||new Date().toISOString()}
      if(state.record?.result_key!==record.result_key){
        if(context().preview)state.progress=new Set(JSON.parse(localStorage.getItem(previewProgressKey)||'[]').filter(row=>row.result_key===record.result_key).map(row=>row.course_name));
        else{const progress=await window.UauSupabase.table('uaulingo_study_course_progress',`?select=course_name&student_id=eq.${context().studentId}&result_key=eq.${record.result_key}`).catch(()=>[]);state.progress=new Set(progress.map(row=>row.course_name))}
      }
      state.record=record;state.step=-1;state.answers=Array(questions.length).fill(null);
    }catch(error){const note=box().querySelector('.study-error');if(note)note.textContent='Não foi possível salvar seu resultado. Tente novamente. '+error.message}
    finally{state.saving=false;if(state.step<0)draw()}
  }
  async function toggleCourse(name){
    const resultKey=state.record?.result_key,route=routes[resultKey];
    if(state.saving||!route||!allCourses(route).includes(name))return;
    state.saving=true;
    const completed=state.progress.has(name);
    try{
      if(context().preview){
        const current=JSON.parse(localStorage.getItem(previewProgressKey)||'[]');
        const next=completed?current.filter(row=>!(row.result_key===resultKey&&row.course_name===name)):[...current,{result_key:resultKey,course_name:name}];
        localStorage.setItem(previewProgressKey,JSON.stringify(next));
      }else if(completed){
        await window.UauSupabase.table('uaulingo_study_course_progress',`?student_id=eq.${context().studentId}&result_key=eq.${resultKey}&course_name=eq.${encodeURIComponent(name)}`,{method:'DELETE'});
      }else{
        await window.UauSupabase.table('uaulingo_study_course_progress','?on_conflict=student_id,result_key,course_name',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({student_id:context().studentId,result_key:resultKey,course_name:name})});
      }
      if(completed)state.progress.delete(name);else state.progress.add(name);
      draw();
      box().querySelector(`[data-study-course="${CSS.escape(name)}"]`)?.focus({preventScroll:true});
    }catch(error){const note=box().querySelector('#studySaveNote');if(note)note.textContent='Não foi possível salvar esse progresso. Tente novamente. '+error.message}
    finally{state.saving=false}
  }
  document.addEventListener('toggle',event=>{
    const detail=event.target;
    if(!detail.matches?.('#studyContent details[data-study-matrix]'))return;
    if(detail.open)state.expanded.add(detail.dataset.studyMatrix);else state.expanded.delete(detail.dataset.studyMatrix);
  },true);
  document.addEventListener('click',event=>{
    const target=event.target.closest('#studyContent [data-study], #studyContent [data-study-answer], #studyContent [data-study-course]');if(!target)return;
    if(target.dataset.studyCourse!==undefined){toggleCourse(target.dataset.studyCourse);return}
    if(target.dataset.studyAnswer!==undefined){state.answers[state.step]=Number(target.dataset.studyAnswer);draw();return}
    const action=target.dataset.study;
    if(action==='retry'){state.loaded=false;load()}
    if(action==='start'||action==='restart'){state.step=0;state.answers=Array(questions.length).fill(null);draw()}
    if(action==='back'&&state.step>0){state.step--;draw()}
    if(action==='next'&&state.answers[state.step]!==null){if(state.step===questions.length-1)finish();else{state.step++;draw()}}
  });
  window.UauStudy={render(){if(state.loaded)draw();else{box().innerHTML='<div class="study-card">Carregando sua trilha…</div>';load()}}};
})();
