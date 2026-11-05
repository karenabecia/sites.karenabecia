(() => {
  const $ = selector => document.querySelector(selector);
  const api = window.UauSupabase;
  const seed = [
    {id:'a1',name:'Ana Beatriz',email:'ana.beatriz@exemplo.com',status:'active',created:'18/10/2026',lastAccess:'27/10/2026',xp:142,tickets:2},
    {id:'a2',name:'Camila Torres',email:'camila.torres@exemplo.com',status:'active',created:'18/10/2026',lastAccess:'28/10/2026',xp:165,tickets:1},
    {id:'a3',name:'Bruno Rocha',email:'bruno.rocha@exemplo.com',status:'active',created:'19/10/2026',lastAccess:'26/10/2026',xp:157,tickets:0},
    {id:'a4',name:'Lara Monteiro',email:'lara.monteiro@exemplo.com',status:'blocked',created:'20/10/2026',lastAccess:'22/10/2026',xp:78,tickets:3},
    {id:'a5',name:'Felipe Cunha',email:'felipe.cunha@exemplo.com',status:'active',created:'21/10/2026',lastAccess:'—',xp:82,tickets:1}
  ];
  const demoDetails = {
    a1: {
      accesses:['27/10/2026 às 20:14','26/10/2026 às 18:02','23/10/2026 às 09:37','20/10/2026 às 19:21'],
      completed:[{title:'Implementação 01 · Fundamentos de Excel',date:'22/10/2026'},{title:'Exercício 01 · Fórmulas essenciais',date:'23/10/2026'},{title:'Desafio 01 · Minha primeira planilha',date:'25/10/2026'}],
      doubts:[{title:'Como usar PROCV em outra aba?',date:'25/10/2026',status:'Respondida'},{title:'Posso enviar o desafio em PDF?',date:'23/10/2026',status:'Respondida'}],
      achievements:[{id:'primeiros-passos',title:'Primeiros passos no Excel',date:'23/10/2026',released:true},{id:'formula-mestre',title:'Mestre das fórmulas',date:'26/10/2026',released:true},{id:'ia-estrategica',title:'IA estratégica',date:'',released:false}]
    },
    a2: {
      accesses:['28/10/2026 às 21:07','27/10/2026 às 19:42','24/10/2026 às 08:51','21/10/2026 às 20:03'],
      completed:[{title:'Implementação 01 · Fundamentos de Excel',date:'22/10/2026'},{title:'Exercício 01 · Fórmulas essenciais',date:'23/10/2026'},{title:'Desafio 01 · Minha primeira planilha',date:'25/10/2026'},{title:'Implementação 02 · Excel com IA',date:'28/10/2026'}],
      doubts:[{title:'Como organizar os dados para a IA?',date:'28/10/2026',status:'Em atendimento'}],
      achievements:[{id:'primeiros-passos',title:'Primeiros passos no Excel',date:'23/10/2026',released:true},{id:'formula-mestre',title:'Mestre das fórmulas',date:'27/10/2026',released:true},{id:'ia-estrategica',title:'IA estratégica',date:'',released:false}]
    },
    a3: {
      accesses:['26/10/2026 às 20:32','24/10/2026 às 19:10','21/10/2026 às 07:55'],
      completed:[{title:'Implementação 01 · Fundamentos de Excel',date:'22/10/2026'},{title:'Exercício 01 · Fórmulas essenciais',date:'24/10/2026'},{title:'Desafio 01 · Minha primeira planilha',date:'26/10/2026'}],
      doubts:[],
      achievements:[{id:'primeiros-passos',title:'Primeiros passos no Excel',date:'24/10/2026',released:true},{id:'formula-mestre',title:'Mestre das fórmulas',date:'',released:false}]
    },
    a4: {
      accesses:['22/10/2026 às 18:44','21/10/2026 às 10:26'],
      completed:[{title:'Implementação 01 · Fundamentos de Excel',date:'21/10/2026'}],
      doubts:[{title:'Não consigo abrir o material de apoio',date:'22/10/2026',status:'Respondida'},{title:'Onde encontro o vídeo?',date:'21/10/2026',status:'Respondida'},{title:'Preciso de ajuda com meu acesso',date:'22/10/2026',status:'Em atendimento'}],
      achievements:[{id:'primeiros-passos',title:'Primeiros passos no Excel',date:'',released:false}]
    },
    a5: {
      accesses:[],
      completed:[{title:'Implementação 01 · Fundamentos de Excel',date:'22/10/2026'}],
      doubts:[{title:'Como entrar na gravação da aula?',date:'22/10/2026',status:'Respondida'}],
      achievements:[{id:'primeiros-passos',title:'Primeiros passos no Excel',date:'',released:false}]
    }
  };
  let users = [], staffRole = '';
  let importRows = [], pointsImportRows = [], pointBatchId = '', toastTimer;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const today = () => new Intl.DateTimeFormat('pt-BR').format(new Date());
  const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const displayDate = value => value ? new Intl.DateTimeFormat('pt-BR', { timeZone:'America/Sao_Paulo' }).format(new Date(value)) : '—';
  const friendlyError = error => error?.code === '23505' ? 'Este e-mail já está cadastrado.' : error?.code === '42501' ? 'Seu acesso não permite esta operação.' : error?.message === 'Email not confirmed' ? 'Confirme seu e-mail antes de entrar.' : (error?.message || 'Não foi possível salvar. Tente novamente.');
  const fromRow = row => ({
    id:row.id, name:row.full_name, email:row.purchase_email, status:row.status,
    created:displayDate(row.created_at), lastAccess:displayDate(row.last_access_at), xp:0, tickets:0
  });
  async function loadUsers() {
    const rows = await api.table('uaulingo_students','?select=id,full_name,purchase_email,status,created_at,last_access_at&order=created_at.desc');
    users = rows.map(fromRow);
    const ledger = await api.table('uaulingo_xp_ledger','?select=student_id,xp');
    for (const entry of ledger) { const student=users.find(item=>item.id===entry.student_id);if(student)student.xp+=Number(entry.xp)||0; }
    render();
  }
  async function requireStaff() {
    const current = await api.session();
    if (!current?.user?.id) return false;
    const rows = await api.table('uaulingo_staff',`?select=role&user_id=eq.${current.user.id}`);
    staffRole = rows[0]?.role || '';
    return !!staffRole;
  }
  async function enterAdmin() {
    if (!await requireStaff()) throw new Error('Este e-mail não tem acesso à área da equipe.');
    $('#importPoints').hidden=staffRole!=='admin';
    await loadUsers();
    await window.UauLoading.complete();
    $('#adminGate').hidden = true;
    $('#adminShell').hidden = false;
    window.dispatchEvent(new Event('UauAdminAuthenticated'));
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3600);
  }
  function render() {
    const q = $('#search').value.trim().toLocaleLowerCase('pt-BR');
    const filter = $('#statusFilter').value;
    const shown = users.filter(u => (filter === 'all' || u.status === filter) && (!q || (u.name + ' ' + u.email).toLocaleLowerCase('pt-BR').includes(q)));
    $('#totalCount').textContent = users.length;
    $('#activeCount').textContent = users.filter(u => u.status === 'active').length;
    $('#blockedCount').textContent = users.filter(u => u.status === 'blocked').length;
    $('#tableCount').textContent = `${shown.length} de ${users.length} alunos`;
    $('#studentsBody').innerHTML = shown.length ? shown.map(u => `
      <tr>
        <td><div class="person"><span class="avatar">${esc(u.name.charAt(0).toUpperCase())}</span><strong>${esc(u.name)}</strong></div></td>
        <td>${esc(u.email)}</td>
        <td><button class="badge status-btn ${u.status}" data-toggle="${esc(u.id)}" aria-label="Alterar status de ${esc(u.name)}: ${u.status === 'active' ? 'ativo' : 'bloqueado'}" title="Clique para alterar o status">${u.status === 'active' ? 'Ativo' : 'Bloqueado'}</button></td>
        <td>${esc(u.created)}</td><td>${esc(u.lastAccess || '—')}</td>
        <td><div class="row-actions"><button class="btn small soft" data-detail="${esc(u.id)}">Detalhes</button></div></td>
      </tr>`).join('') : '<tr><td colspan="6" class="empty">Nenhum aluno encontrado.</td></tr>';
  }
  function modal(title, subtitle, body) {
    $('#scrim .modal').classList.remove('detail-modal');
    $('#modalTitle').textContent = title;
    $('#modalSubtitle').textContent = subtitle;
    $('#modalContent').innerHTML = body;
    $('#scrim').hidden = false;
    $('#closeModal').focus();
  }
  function closeModal() { $('#scrim').hidden = true; importRows = []; pointsImportRows=[]; }
  function showAdd() {
    modal('Adicionar aluno', 'Cadastre uma pessoa informando nome e e-mail.', `
      <form id="addForm"><label class="field"><span>Nome completo</span><input id="studentName" maxlength="120" required placeholder="Nome do aluno"></label>
      <label class="field"><span>E-mail de compra da Hotmart</span><input id="studentEmail" type="email" maxlength="254" required placeholder="aluno@exemplo.com"></label>
      <p class="form-error" id="formError"></p><div class="modal-actions"><button type="button" class="btn soft" data-close>Cancelar</button><button class="btn green">Adicionar aluno</button></div></form>`);
    $('#studentName').focus();
  }
  function showImport() {
    modal('Importar alunos por CSV', 'O arquivo deve conter as colunas nome e email.', `
      <a class="inline-link" href="modelo-importacao-alunos.csv" download="modelo-importacao-alunos.csv">↓ Baixar arquivo de exemplo</a>
      <label class="file-box"><strong>▤ Escolher arquivo CSV</strong><small>UTF-8 · uma pessoa por linha</small><input id="csvFile" type="file" accept=".csv,text/csv"></label>
      <div id="csvPreview" class="preview">Selecione um arquivo para conferir os registros antes de importar.</div>
      <p class="form-error" id="formError"></p><div class="modal-actions"><button class="btn soft" data-close>Cancelar</button><button class="btn purple" id="confirmImport" disabled>Importar alunos</button></div>`);
  }
  function showPointsImport() {
    if(staffRole!=='admin')return;
    pointsImportRows=[];pointBatchId=crypto.randomUUID();
    modal('Importar pontos por CSV','O arquivo deve conter email, pontos e motivo. Confira todos os lançamentos antes de confirmar.',`
      <a class="inline-link" href="modelo-importacao-pontos.csv" download="modelo-importacao-pontos.csv">↓ Baixar arquivo de exemplo</a>
      <label class="file-box"><strong>▤ Escolher arquivo CSV</strong><small>UTF-8 · até 500 alunos · um lançamento por e-mail</small><input id="pointsCsvFile" type="file" accept=".csv,text/csv"></label>
      <div id="pointsCsvPreview" class="preview">Selecione um arquivo para conferir os lançamentos.</div>
      <p class="form-error" id="formError"></p><div class="modal-actions"><button class="btn soft" data-close>Cancelar</button><button class="btn purple" id="confirmPointsImport" disabled>Importar pontos</button></div>`);
  }
  async function showDetails(id) {
    const u = users.find(item => item.id === id); if (!u) return;
    try {
      const [released,definitions,ledger,implementations]=await Promise.all([
        api.table('uaulingo_student_achievements',`?select=achievement_id,released_at&student_id=eq.${u.id}`),
        api.table('uaulingo_achievements','?select=id,title,certificate_enabled,certificate_image_path'),
        api.table('uaulingo_xp_ledger',`?select=id,implementation_id,source,xp,reason,created_at&student_id=eq.${u.id}&order=created_at.desc`),
        api.table('uaulingo_implementations','?select=id,title,challenge&order=implementation_number.asc')
      ]);
      u.achievementDefinitions=definitions;u.implementations=implementations;
      u.ledger=ledger;u.xp=ledger.reduce((sum,row)=>sum+(Number(row.xp)||0),0);
      u.completed=ledger.filter(row=>row.source==='challenge').map(row=>({title:'Desafio · '+(implementations.find(item=>item.id===row.implementation_id)?.title||'Implementação'),date:displayDate(row.created_at)}));
      const byId=new Map(definitions.map(item=>[item.id,item]));
      u.achievements=released.map(item=>({
        id:item.achievement_id,title:byId.get(item.achievement_id)?.title||item.achievement_id,
        date:displayDate(item.released_at),released:true,
        certificateReady:!!(byId.get(item.achievement_id)?.certificate_enabled&&byId.get(item.achievement_id)?.certificate_image_path),
        certificateEnabled:!!byId.get(item.achievement_id)?.certificate_enabled
      }));
    } catch(error) {u.achievements=[];u.achievementDefinitions=[];u.implementations=[];u.ledger=[];toast('Não foi possível carregar os detalhes: '+friendlyError(error))}
    const activity = {
      accesses: Array.isArray(u.accessHistory) ? u.accessHistory : (demoDetails[u.id]?.accesses || []),
      completed: Array.isArray(u.completed) ? u.completed : (demoDetails[u.id]?.completed || []),
      doubts: Array.isArray(u.doubts) ? u.doubts : (demoDetails[u.id]?.doubts || []),
      achievements: Array.isArray(u.achievements) ? u.achievements : (demoDetails[u.id]?.achievements || [])
    };
    const list = (rows, renderRow, empty) => rows.length ? `<ul class="activity-list">${rows.map(renderRow).join('')}</ul>` : `<p class="empty-detail">${empty}</p>`;
    modal(u.name, 'Cadastro e acesso do aluno', `
      <div class="detail-grid"><div><small>STATUS</small><strong>${u.status === 'active' ? 'Ativo' : 'Bloqueado'}</strong></div><div><small>XP TOTAL</small><strong>${esc(u.xp || 0)}</strong></div><div><small>ITENS CONCLUÍDOS</small><strong>${activity.completed.length}</strong></div><div><small>DÚVIDAS</small><strong>${activity.doubts.length}</strong></div></div>
      <div class="detail-columns"><section class="detail-section"><h3>Histórico de acessos</h3>${list(activity.accesses, date => `<li><span class="activity-dot green-dot"></span><span>${esc(date)}</span></li>`, 'Nenhum acesso registrado.')}</section>
      <section class="detail-section"><h3>Itens concluídos</h3>${list(activity.completed, item => `<li><span class="activity-dot green-dot"></span><span><strong>${esc(item.title)}</strong><small>Concluído em ${esc(item.date)}</small></span></li>`, 'Nenhum item concluído.')}</section></div>
      <section class="detail-section"><h3>Dúvidas</h3>${list(activity.doubts, item => `<li><span class="activity-dot purple-dot"></span><span><strong>${esc(item.title)}</strong><small>${esc(item.date)} · ${esc(item.status)}</small></span></li>`, 'Nenhuma dúvida registrada.')}</section>
      <section class="detail-section"><h3>Conquistas e certificados</h3>${activity.achievements.length ? `<div class="achievement-list">${activity.achievements.map(a => `<article class="achievement-item ${a.released ? 'released' : 'waiting'}"><span class="achievement-icon">${a.released ? '★' : '◇'}</span><div><strong>${esc(a.title)}</strong><small>${a.released ? 'Liberada em '+esc(a.date) : 'Aguardando liberação'}</small></div>${a.certificateReady ? `<button class="btn small purple" data-certificate="${esc(a.id)}" data-user="${esc(u.id)}" aria-label="Emitir certificado PDF de ${esc(a.title)}">↓ Certificado PDF</button>` : `<span class="waiting-tag">${a.certificateEnabled?'Certificado pendente':'Sem certificado'}</span>`}</article>`).join('')}</div>` : '<p class="empty-detail">Nenhuma conquista liberada.</p>'}</section>
      <section class="detail-section"><h3>Histórico de pontos</h3>${list(u.ledger||[],row=>`<li><span class="activity-dot purple-dot"></span><span><strong>+${esc(row.xp)} XP · ${esc(row.reason||row.source)}</strong><small>${esc(displayDate(row.created_at))}</small></span></li>`,'Nenhum ponto lançado.')}</section>
      ${staffRole==='admin'?`<section class="detail-section manual-awards"><h3>Lançamentos da equipe</h3>
        <form id="bonusXpForm" data-user="${esc(u.id)}" class="award-form"><label class="field"><span>Pontos extras</span><input name="points" type="number" min="1" max="2000" required></label><label class="field"><span>Motivo</span><input name="reason" maxlength="300" minlength="3" required placeholder="Ex.: participação na aula"></label><button class="btn green">Atribuir pontos</button></form>
        <form id="grantAchievementForm" data-user="${esc(u.id)}" class="award-form"><label class="field"><span>Conquista manual</span><select name="achievement" required><option value="">Selecione</option>${u.achievementDefinitions.filter(a=>!u.achievements.some(g=>g.id===a.id)).map(a=>`<option value="${esc(a.id)}">${esc(a.title)}</option>`).join('')}</select></label><button class="btn purple">Liberar conquista</button></form>
        <form id="manualChallengeForm" data-user="${esc(u.id)}" class="award-form"><label class="field"><span>Desafio concluído manualmente</span><select name="implementation" required><option value="">Selecione</option>${u.implementations.filter(i=>i.challenge&&!u.ledger.some(l=>l.implementation_id===i.id&&l.source==='challenge')).map(i=>`<option value="${esc(i.id)}">${esc(i.title)} · ${esc(i.challenge.xp_reward||0)} XP</option>`).join('')}</select></label><button class="btn purple">Concluir desafio</button></form><p class="form-error" id="awardError"></p></section>`:''}
      <form id="emailEditForm" data-user="${esc(u.id)}"><label class="field"><span>E-mail de compra</span><input id="editEmail" type="email" maxlength="254" required value="${esc(u.email)}"></label><p class="form-error" id="formError"></p><button class="btn green" type="submit">Salvar e-mail</button></form>
      <div class="detail-actions"><button class="btn soft" data-account="reset" data-user="${esc(u.id)}">Redefinir senha</button><button class="btn purple" data-account="resend" data-user="${esc(u.id)}">Reenviar acesso</button></div>
      <div class="modal-actions"><button class="btn soft" data-close>Fechar</button></div>`);
    $('#scrim .modal').classList.add('detail-modal');
  }
  function confirmStatus(id) {
    const u = users.find(item => item.id === id); if (!u) return;
    const action = u.status === 'active' ? 'bloquear' : 'desbloquear';
    modal('Alterar status', `Aluno: ${u.name}`, `<p class="confirm-text">Gostaria de confirmar a mudança de status para <strong>${action}</strong> o acesso de ${esc(u.name)}?</p><div class="modal-actions"><button class="btn soft" data-close>Cancelar</button><button class="btn ${action === 'bloquear' ? 'warn' : 'green'}" data-confirm-status="${esc(u.id)}">${action === 'bloquear' ? 'Bloquear' : 'Desbloquear'}</button></div>`);
  }
  function showAccountAction(id, action) {
    const u = users.find(item => item.id === id); if (!u) return;
    const title = action === 'reset' ? 'Redefinir senha' : 'Reenviar acesso';
    modal(title, u.name, `<p class="confirm-text">O envio para <strong>${esc(u.email)}</strong> ficará disponível quando ativarmos os convites dos alunos e o serviço de e-mail. Nenhuma mensagem foi enviada.</p><div class="modal-actions"><button class="btn soft" data-close>Fechar</button></div>`);
  }
  function parseCSV(text) {
    const rows=[]; let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if((c===','||c===';')&&!quoted){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell=''}else cell+=c}
    row.push(cell); if(row.some(x=>x.trim()))rows.push(row); if(quoted)throw Error('O CSV tem aspas sem fechamento.'); return rows;
  }
  function prepareCSV(text) {
    const rows=parseCSV(text.replace(/^\uFEFF/,'')); if(!rows.length)throw Error('O arquivo está vazio.');
    const header=rows.shift().map(x=>x.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''));
    const ni=header.indexOf('nome'),ei=header.findIndex(x=>x==='email'||x==='e-mail');
    if(ni<0||ei<0)throw Error('Use as colunas nome e email no cabeçalho.');
    const existing=new Set(users.map(u=>u.email.toLowerCase())),seen=new Set(),valid=[],invalid=[];
    for(const [i,row] of rows.entries()){const name=(row[ni]||'').trim(),email=(row[ei]||'').trim().toLowerCase();if(!name||!validEmail(email)){invalid.push('Linha '+(i+2)+': nome ou e-mail inválido');continue}if(existing.has(email)||seen.has(email)){invalid.push('Linha '+(i+2)+': e-mail duplicado');continue}seen.add(email);valid.push({name,email})}
    return {valid,invalid};
  }
  function preparePointsCSV(text) {
    const rows=parseCSV(text.replace(/^\uFEFF/,''));if(!rows.length)throw Error('O arquivo está vazio.');
    const header=rows.shift().map(x=>x.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''));
    const ei=header.findIndex(x=>x==='email'||x==='e-mail'),pi=header.indexOf('pontos'),mi=header.indexOf('motivo');
    if(ei<0||pi<0||mi<0)throw Error('Use as colunas email, pontos e motivo.');
    if(!rows.length||rows.length>500)throw Error('O arquivo deve ter entre 1 e 500 alunos.');
    const seen=new Set(),result=[];
    for(const [index,row] of rows.entries()){
      const email=(row[ei]||'').trim().toLowerCase(),points=Number((row[pi]||'').trim()),reason=(row[mi]||'').trim();
      if(!validEmail(email)||!users.some(u=>u.email.toLowerCase()===email))throw Error(`Linha ${index+2}: e-mail não cadastrado.`);
      if(seen.has(email))throw Error(`Linha ${index+2}: e-mail repetido.`);
      if(!Number.isInteger(points)||points<1||points>2000)throw Error(`Linha ${index+2}: informe de 1 a 2000 pontos.`);
      if(reason.length<3||reason.length>300)throw Error(`Linha ${index+2}: motivo deve ter de 3 a 300 caracteres.`);
      seen.add(email);result.push({email,pontos:points,motivo:reason});
    }
    return result;
  }
  function downloadUsers() {
    const quote = value => {const text=String(value ?? '');const safe=/^[\s]*[=+\-@]/.test(text)?"'"+text:text;return `"${safe.replace(/"/g,'""')}"`};
    const rows=[['nome','email','status','cadastro','ultimo_acesso'],...users.map(u=>[u.name,u.email,u.status==='active'?'ativo':'bloqueado',u.created,u.lastAccess||''])];
    const csv='\uFEFF'+rows.map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download='uaulingo-alunos.csv'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('Arquivo de alunos baixado.');
  }
  async function issueCertificate(userId, achievementId) {
    const user = users.find(item => item.id === userId);
    const achievements = Array.isArray(user?.achievements) ? user.achievements : (demoDetails[userId]?.achievements || []);
    const achievement = achievements.find(item => item.id === achievementId && item.released && item.date);
    if (!user || !achievement?.certificateReady) { toast('Esta conquista ainda não tem certificado liberado.'); return; }
    const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = 1100;
    const custom = await window.UauCertificate.getRemote(achievementId).catch(() => null);
    if (custom?.backgroundBlob) {
      await window.UauCertificate.renderCustom(canvas,custom,user.name,achievement.completedDate||achievement.date);
      const filename='certificado-'+achievement.id+'-'+user.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.pdf';
      window.UauCertificate.downloadPdf(canvas,filename);
      toast('Certificado PDF emitido com o modelo personalizado.');
      return;
    }
    toast('Não foi possível carregar a imagem do certificado.');
    return;
  }
  document.addEventListener('click', e => {
    if(e.target.closest('[data-close]')||e.target.id==='closeModal'||e.target.id==='scrim'){closeModal();return}
    if(e.target.id==='linksToggle'){const nav=$('#navLinks'),open=!nav.classList.contains('open');nav.classList.toggle('open',open);$('#linksToggle').setAttribute('aria-expanded',String(open));return}
    if(e.target.id==='logoutButton'){api.signOut().finally(()=>{$('#adminShell').hidden=true;$('#adminGate').hidden=false;updateGate('login')});return}
    if(e.target.id==='addUser'){showAdd();return}
    if(e.target.id==='importUsers'){showImport();return}
    if(e.target.id==='importPoints'){showPointsImport();return}
    if(e.target.id==='exportUsers'){downloadUsers();return}
    const detail=e.target.closest('[data-detail]');if(detail){showDetails(detail.dataset.detail).catch(error=>toast(friendlyError(error)));return}
    const toggle=e.target.closest('[data-toggle]');if(toggle){confirmStatus(toggle.dataset.toggle);return}
    const confirmed=e.target.closest('[data-confirm-status]');if(confirmed){const u=users.find(item=>item.id===confirmed.dataset.confirmStatus);if(!u)return;const status=u.status==='active'?'blocked':'active';confirmed.disabled=true;api.table('uaulingo_students',`?id=eq.${u.id}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status})}).then(loadUsers).then(()=>{closeModal();toast(`${u.name}: acesso ${status==='active'?'desbloqueado':'bloqueado'}.`)}).catch(error=>{$('#modalSubtitle').textContent=friendlyError(error);confirmed.disabled=false});return}
    const account=e.target.closest('[data-account]');if(account){showAccountAction(account.dataset.user,account.dataset.account);return}
    const certificate=e.target.closest('[data-certificate]');if(certificate){issueCertificate(certificate.dataset.user,certificate.dataset.certificate).catch(()=>toast('Não foi possível emitir o certificado.'));return}
    if(e.target.id==='confirmImport'&&importRows.length){const rows=[...importRows];e.target.disabled=true;api.table('uaulingo_students','',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(rows.map(r=>({full_name:r.name,purchase_email:r.email})))}).then(loadUsers).then(()=>{closeModal();toast(rows.length+' aluno(s) importado(s).')}).catch(error=>{$('#formError').textContent=friendlyError(error);$('#confirmImport').disabled=false});return}
    if(e.target.id==='confirmPointsImport'&&pointsImportRows.length){const button=e.target,rows=[...pointsImportRows];button.disabled=true;api.rpc('uaulingo_import_bonus_xp',{p_rows:rows,p_batch_id:pointBatchId}).then(loadUsers).then(()=>{closeModal();toast(rows.length+' aluno(s) receberam pontos e notificações.')}).catch(error=>{$('#formError').textContent=friendlyError(error);button.disabled=false});return}
  });
  document.addEventListener('submit', e => {
    if(e.target.id==='addForm'){e.preventDefault();const name=$('#studentName').value.trim(),email=$('#studentEmail').value.trim().toLowerCase();if(users.some(u=>u.email.toLowerCase()===email)){$('#formError').textContent='Este e-mail já está cadastrado.';return}const button=e.target.querySelector('button[type=submit],button:not([type])');button.disabled=true;api.table('uaulingo_students','',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({full_name:name,purchase_email:email})}).then(loadUsers).then(()=>{closeModal();toast(name+' adicionado(a).')}).catch(error=>{$('#formError').textContent=friendlyError(error);button.disabled=false});return}
    if(e.target.id==='emailEditForm'){e.preventDefault();const u=users.find(item=>item.id===e.target.dataset.user),email=$('#editEmail').value.trim().toLowerCase();if(!u)return;if(!validEmail(email)){$('#formError').textContent='Informe um e-mail válido.';return}if(users.some(item=>item.id!==u.id&&item.email.toLowerCase()===email)){$('#formError').textContent='Este e-mail já está cadastrado.';return}const button=e.target.querySelector('button[type=submit]');button.disabled=true;api.table('uaulingo_students',`?id=eq.${u.id}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({purchase_email:email})}).then(loadUsers).then(()=>{showDetails(u.id);toast('E-mail atualizado.')}).catch(error=>{$('#formError').textContent=friendlyError(error);button.disabled=false});return}
    if(['bonusXpForm','grantAchievementForm','manualChallengeForm'].includes(e.target.id)){
      e.preventDefault();const form=e.target,studentId=form.dataset.user,button=form.querySelector('button');button.disabled=true;
      const request=form.id==='bonusXpForm'?api.rpc('uaulingo_award_bonus_xp',{p_student_id:studentId,p_points:Number(form.elements.points.value),p_reason:form.elements.reason.value.trim()}):
        form.id==='grantAchievementForm'?api.rpc('uaulingo_grant_achievement',{p_student_id:studentId,p_achievement_id:form.elements.achievement.value}):
        api.rpc('uaulingo_complete_challenge_manually',{p_student_id:studentId,p_implementation_id:form.elements.implementation.value});
      request.then(loadUsers).then(()=>showDetails(studentId)).then(()=>toast(form.id==='grantAchievementForm'?'Conquista liberada.':'Conclusão e pontos registrados; aluno notificado.')).catch(error=>{const el=$('#awardError');if(el)el.textContent=friendlyError(error);button.disabled=false});return;
    }
  });
  document.addEventListener('change',async e=>{if(e.target.id!=='csvFile'&&e.target.id!=='pointsCsvFile')return;const file=e.target.files?.[0];if(!file)return;
    if(e.target.id==='pointsCsvFile'){try{pointsImportRows=preparePointsCSV(await file.text());$('#pointsCsvPreview').innerHTML='<strong>'+pointsImportRows.length+' aluno(s) · '+pointsImportRows.reduce((sum,row)=>sum+row.pontos,0)+' XP no total</strong><ul>'+pointsImportRows.slice(0,8).map(row=>'<li>'+esc(row.email)+' · +'+row.pontos+' XP · '+esc(row.motivo)+'</li>').join('')+'</ul>';$('#confirmPointsImport').disabled=false;$('#formError').textContent=''}catch(error){pointsImportRows=[];$('#pointsCsvPreview').textContent='Corrija o arquivo e selecione novamente.';$('#formError').textContent=error.message;$('#confirmPointsImport').disabled=true}return}
    try{const result=prepareCSV(await file.text());importRows=result.valid;$('#csvPreview').innerHTML='<strong>'+result.valid.length+' novo(s) aluno(s) · '+result.invalid.length+' linha(s) ignorada(s)</strong>'+(result.valid.length?'<ul>'+result.valid.slice(0,5).map(r=>'<li>'+esc(r.name)+' · '+esc(r.email)+'</li>').join('')+'</ul>':'')+(result.invalid.length?'<small>'+esc(result.invalid.slice(0,3).join(' | '))+'</small>':'');$('#confirmImport').disabled=!result.valid.length;$('#formError').textContent=''}catch(err){importRows=[];$('#csvPreview').textContent='Não foi possível ler o arquivo.';$('#formError').textContent=err.message;$('#confirmImport').disabled=true}});
  $('#search').addEventListener('input',render);
  $('#statusFilter').addEventListener('change',render);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#scrim').hidden)closeModal()});

  let gateMode='login';
  document.querySelectorAll('[data-password-toggle]').forEach(button=>button.addEventListener('click',()=>{
    const input=document.getElementById(button.dataset.passwordToggle),visible=input.type==='password';
    input.type=visible?'text':'password';button.setAttribute('aria-pressed',String(visible));
    const label=button.dataset.passwordToggle==='adminConfirm'?'confirmação da senha':'senha';
    button.setAttribute('aria-label',`${visible?'Ocultar':'Mostrar'} ${label}`);
    button.title=`${visible?'Ocultar':'Mostrar'} ${label}`;
  }));
  function updateGate(mode) {
    gateMode=mode;
    const intro={login:'',recover:'Informe o e-mail da equipe para receber um link e criar sua senha.',sent:'Se o e-mail estiver cadastrado, o link de acesso chegará à sua caixa de entrada.',set:'Crie uma senha com pelo menos 8 caracteres.'};
    $('#gateTitle').textContent={login:'Entrar',recover:'Primeiro acesso',sent:'Verifique seu e-mail',set:'Criar senha'}[mode];
    $('#gateIntro').textContent=intro[mode];$('#gateIntro').hidden=mode==='login';
    $('#adminAuthForm').hidden=mode==='sent';
    $('#emailWrap').hidden=mode==='set';$('#adminEmail').required=mode!=='set';
    $('#passwordWrap').hidden=mode==='recover';$('#adminPassword').required=mode!=='recover';
    $('#adminPassword').autocomplete=mode==='set'?'new-password':'current-password';
    $('#confirmWrap').hidden=mode!=='set';$('#adminConfirm').required=mode==='set';
    $('#gateSubmit').textContent={login:'Entrar',recover:'Enviar link para criar senha',sent:'',set:'Salvar senha'}[mode];
    $('#firstAccessButton').textContent=mode==='login'?'Primeiro acesso? Criar senha':'Voltar para entrar';
    document.querySelectorAll('[data-password-toggle]').forEach(button=>{
      const input=document.getElementById(button.dataset.passwordToggle);input.type='password';button.setAttribute('aria-pressed','false');
      const label=button.dataset.passwordToggle==='adminConfirm'?'confirmação da senha':'senha';
      button.setAttribute('aria-label',`Mostrar ${label}`);button.title=`Mostrar ${label}`;
    });
    $('#gateError').textContent='';$('#adminAuthForm').reset();
  }
  $('#firstAccessButton').addEventListener('click',()=>{updateGate(gateMode==='login'?'recover':'login');$('#adminEmail').focus()});
  $('#adminAuthForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const email=$('#adminEmail').value.trim().toLowerCase(),password=$('#adminPassword').value,error=$('#gateError');
    error.textContent='';$('#gateSubmit').disabled=true;
    try {
      if (gateMode==='recover') {
        await api.sendPasswordLink(email);
        updateGate('sent');
      } else if (gateMode==='set') {
        if(password.length<8)throw new Error('Use pelo menos 8 caracteres.');
        if(password!==$('#adminConfirm').value)throw new Error('As senhas não coincidem.');
        await api.updatePassword(password);
        await enterAdmin();
      } else {
        await api.signIn(email,password);
        await enterAdmin();
      }
    } catch (cause) {
      if(gateMode==='login')await api.signOut();
      error.textContent=cause?.message==='Invalid login credentials'?'E-mail ou senha incorretos.':friendlyError(cause);
    } finally {$('#gateSubmit').disabled=false}
  });
  updateGate('login');
  (async()=>{
    if(await api.acceptPasswordLink()) {
      if(!await requireStaff())throw new Error('Este link não pertence a uma conta da equipe.');
      updateGate('set');await window.UauLoading.complete();$('#adminGate').hidden=false;return;
    }
    if(await api.session()){await enterAdmin();return}
    await window.UauLoading.complete();$('#adminGate').hidden=false;
  })().catch(async error=>{api.clear();updateGate('login');$('#gateError').textContent=friendlyError(error);await window.UauLoading.complete();$('#adminGate').hidden=false});
})();
