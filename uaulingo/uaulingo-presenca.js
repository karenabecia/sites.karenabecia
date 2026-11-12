(()=>{
  'use strict';
  const api=window.UauSupabase;
  const $=selector=>document.querySelector(selector);
  const params=new URLSearchParams(location.search);
  const onboarding=params.get('onboarding')==='1';
  let listId=params.get('lista');

  function showError(message){
    $('#listStatus').hidden=false;
    $('#listStatus').textContent=message;
    $('#listStatus').className='notice error';
  }
  function showSuccess(){
    document.querySelector('.card').innerHTML='<h1 class="attendance-confirmed" role="status">Presença confirmada</h1><a class="btn" href="uaulingo.html">Voltar para o Uau Língo</a>';
    setTimeout(()=>location.assign('uaulingo.html'),7000);
  }
  async function register(){
    if(onboarding&&!listId)listId=await api.rpc('uaulingo_onboarding_attendance_list');
    if(!listId)throw new Error('A lista de presença será liberada durante a aula.');
    await api.rpc('uaulingo_register_attendance',{p_list_id:listId});
    showSuccess();
  }
  $('#loginForm').addEventListener('submit',async event=>{
    event.preventDefault();
    const button=event.submitter;
    button.disabled=true;
    button.textContent='Confirmando…';
    $('#message').textContent='';
    try{
      await api.signIn($('#email').value.trim(),$('#password').value);
      $('#password').value='';
      await register();
    }catch(error){
      showError(error.message||'Não foi possível confirmar sua presença.');
      button.disabled=false;
      button.textContent='Receber XP';
    }
  });
  if(!onboarding&&!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(listId||'')){
    showError('Use o link da lista de presença enviado pela equipe.');
  }else{
    $('#listStatus').hidden=true;
    $('#loginForm').hidden=false;
  }
})();
