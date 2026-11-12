(() => {
  function addAttendanceLink(){
    if(location.pathname.endsWith('uaulingo-admin-presenca.html'))return;
    const sidebar=document.querySelector('.sidebar');
    if(!sidebar||sidebar.querySelector('a[href="uaulingo-admin-presenca.html"]'))return;
    const contentLink=[...sidebar.querySelectorAll('.nav-item')].find(item=>item.textContent?.includes('Conteúdos'));
    const link=document.createElement('a');link.className='nav-item';link.href='uaulingo-admin-presenca.html';link.innerHTML='<span class="glyph">✓</span>Lista de presença';
    if(contentLink)contentLink.after(link);else sidebar.querySelector('.nav-label')?.after(link);
  }
  async function showName(){
    try{
      const session=await window.UauSupabase?.session();if(!session?.user)return;
      const user=session.user;
      let saved='';
      try{const rows=await window.UauSupabase.table('uaulingo_staff',`?select=display_name&user_id=eq.${encodeURIComponent(user.id)}`);saved=rows[0]?.display_name||''}catch{}
      const raw=saved||user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'Equipe';
      const name=saved?String(saved).trim():String(raw).trim().replace(/[._-]+/g,' ').toLocaleLowerCase('pt-BR').replace(/\b\p{L}/gu,letter=>letter.toLocaleUpperCase('pt-BR'));
      document.querySelectorAll('.admin-chip,.top-actions .chip').forEach(element=>{element.textContent=name});
      window.UauAdminProfile={name};
      window.dispatchEvent(new CustomEvent('UauAdminProfileReady',{detail:{name}}));
    }catch{}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{addAttendanceLink();showName()});else{addAttendanceLink();showName()}
  window.addEventListener('UauAdminAuthenticated',showName);
})();
