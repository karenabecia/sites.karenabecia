(()=>{
 'use strict';
 const config=window.BLACK_CONFIG;
 const key=config.experiment;
 function read(){try{const v=localStorage.getItem(key);if(v==='A'||v==='B')return v;}catch(e){}const match=document.cookie.match(new RegExp('(?:^|; )'+key+'=([AB])(?:;|$)'));return match?match[1]:null;}
 function save(value){let saved=false;try{localStorage.setItem(key,value);saved=localStorage.getItem(key)===value;}catch(e){}document.cookie=key+'='+value+'; Max-Age=31536000; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');return saved||read()===value;}
 let variant=read();
 if(!variant){variant=crypto.getRandomValues(new Uint8Array(1))[0]<128?'A':'B';if(!save(variant)){document.body.textContent='Permita o armazenamento deste site no navegador e recarregue a página para continuar.';return;}}
 const current=document.documentElement.dataset.variant;
 if(document.body.hasAttribute('data-router')||(current&&current!==variant)){location.replace(variant.toLowerCase()+'.html'+location.search+location.hash);return;}
 let visitor;try{visitor=localStorage.getItem(key+'-visitor');if(!visitor){visitor=crypto.randomUUID();localStorage.setItem(key+'-visitor',visitor);}}catch(e){visitor=null;}
 const params=new URLSearchParams(location.search);
 const attribution={};for(const name of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){attribution[name]=(params.get(name)||'').slice(0,300);}
 async function send(payload){
  if(!config.endpoint)throw Error('O cadastro ainda não está disponível. Tente novamente quando a campanha abrir.');
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
  try{const response=await fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:controller.signal,redirect:'follow',credentials:'omit'});if(!response.ok)throw Error('Não foi possível confirmar seu cadastro. Tente novamente.');const result=await response.json();if(result.ok!==true||result.requestId!==payload.requestId)throw Error('Não foi possível confirmar seu cadastro. Tente novamente.');return result;}finally{clearTimeout(timeout);}
 }
 let busy=false;let pending=null;
 document.querySelectorAll('.signup').forEach(form=>{
  form.addEventListener('submit',async event=>{
   event.preventDefault();if(busy)return;
   const name=form.elements.name,phone=form.elements.phone,email=form.elements.email;
   name.setCustomValidity(name.value.trim().length<2?'Informe seu nome.':'');
   const digits=phone.value.replace(/\D/g,'');phone.setCustomValidity(digits.length<10||digits.length>15?'Informe um WhatsApp válido com DDD.':'');if(!form.reportValidity())return;
   const data={name:name.value.trim(),phone:digits,email:email.value.trim().toLowerCase()};
   if(!pending||JSON.stringify(pending.data)!==JSON.stringify(data))pending={id:crypto.randomUUID(),data};
   const status=form.querySelector('.status');const buttons=[...document.querySelectorAll('.signup button')];busy=true;buttons.forEach(b=>b.disabled=true);status.textContent='Enviando seu cadastro…';
   try{await send({event:'lead',experiment:key,variant,visitorId:visitor,requestId:pending.id,...data,...attribution});try{sessionStorage.setItem('black2026_receipt',JSON.stringify({confirmed:true,at:Date.now()}));}catch(e){}location.assign('obrigado.html');}
   catch(error){status.textContent=error.name==='AbortError'?'A confirmação demorou mais do que o esperado. Tente novamente.':error.message;}
   finally{busy=false;buttons.forEach(b=>b.disabled=false);}
  });
  form.addEventListener('input',event=>{if(event.target.setCustomValidity)event.target.setCustomValidity('');});
 });
})();
