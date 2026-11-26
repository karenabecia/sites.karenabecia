(()=>{'use strict';
const URL_BASE='https://wlrhefombygibmnluqck.supabase.co';
const API_KEY='sb_publishable_LI-_haPjLOssbXc39PcUpg_OGxCPCJ0';
const PIXEL='1484706788221857',RECEIPT='live500_receipt',page=document.documentElement.dataset.page;
function read(key,storageName='localStorage'){try{return JSON.parse(window[storageName].getItem(key));}catch{return null;}}
function write(key,value,storageName='localStorage'){try{window[storageName].setItem(key,JSON.stringify(value));}catch{}}
function receipt(){const r=read(RECEIPT,'sessionStorage');return r&&r.confirmed===true&&typeof r.id==='string'&&Date.now()-r.at>=0&&Date.now()-r.at<86400000?r:null;}
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('set','autoConfig',false,PIXEL);fbq('init',PIXEL);fbq('track','PageView',{campaign:'live500'});
if(page==='obrigado'){const r=receipt();if(r){document.getElementById('confirmation').textContent='✓ INSCRIÇÃO CONFIRMADA';const key='live500_lead_'+r.id;if(!read(key)&&!read(key,'sessionStorage')){write(key,true);write(key,true,'sessionStorage');fbq('track','Lead',{content_name:'Live 500',campaign:'live500'},{eventID:r.id});}}}
const form=document.getElementById('signup');if(!form)return;
const fields=form.elements,phone=fields.telefone,status=form.querySelector('.status'),button=form.querySelector('[type=submit]');let busy=false,pending=null;
const phoneInput=window.intlTelInput(phone,{initialCountry:'br',separateDialCode:true,countryNameLocale:'pt-BR',countryOrder:['br','pt','us','gb','es','ca'],numberDisplayFormat:'NATIONAL',strictMode:false,allowedNumberTypes:null,customPlaceholder:(_,country)=>country?.iso2==='br'?'DDD e número':'Número de telefone',uiTranslations:{selectedCountryAriaLabel:'Selecionar país. Atual: '+String.fromCharCode(36)+'{countryName} ('+String.fromCharCode(36)+'{dialCode})',searchPlaceholder:'Buscar país',countryListAriaLabel:'Países',closeCountrySelectorAriaLabel:'Fechar'}});
phone.addEventListener('countrychange',()=>{phone.setCustomValidity('');phone.placeholder=phoneInput.getSelectedCountry()?.iso2==='br'?'DDD e número':'Número de telefone';});
function confetti(){
try{
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches,canvas=document.createElement('canvas');canvas.className='confetti-canvas';canvas.setAttribute('aria-hidden','true');document.body.appendChild(canvas);
const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return;}const w=window.innerWidth,h=window.innerHeight,dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);
const colors=['#ff7100','#ffad37','#5dbb62','#a6e887','#fffaf0','#ffffff'];
const pieces=Array.from({length:reduced?55:280},(_,i)=>{const left=i%2===0,angle=left?-Math.PI/3+Math.random()*.8:-Math.PI*2/3-Math.random()*.8,speed=8+Math.random()*18;return{x:reduced?Math.random()*w:left?w*.12:w*.88,y:reduced?Math.random()*h:h*.65,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:Math.random()*6.28,spin:(Math.random()-.5)*.3,size:5+Math.random()*9,color:colors[i%colors.length]};});
let started=performance.now(),last=started;
function frame(now){const elapsed=now-started,delta=Math.min((now-last)/16.67,2);last=now;ctx.clearRect(0,0,w,h);ctx.globalAlpha=Math.min(1,(2300-elapsed)/500);for(const p of pieces){if(!reduced){p.x+=p.vx*delta;p.y+=p.vy*delta;p.vy+=.27*delta;p.vx*=.994;p.r+=p.spin*delta;}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.55);ctx.restore();}if(elapsed<(reduced?700:2300))requestAnimationFrame(frame);else canvas.remove();}
requestAnimationFrame(frame);
}catch{/* A inscrição continua disponível mesmo sem suporte à animação. */}
}
form.addEventListener('input',e=>{e.target.setCustomValidity?.('');});
form.addEventListener('submit',async e=>{
e.preventDefault();if(busy||fields.website.value)return;
const nome=fields.nome.value.trim(),email=fields.email.value.trim().toLowerCase();
fields.nome.setCustomValidity(nome.length<2?'Informe seu nome com pelo menos 2 caracteres.':'');
await phoneInput.promise;
const localDigits=phone.value.replace(/\D/g,'');
const isBrazil=phoneInput.getSelectedCountry()?.iso2==='br';
phone.setCustomValidity(phoneInput.isValidNumber()!==true||(isBrazil&&!/^[1-9]\d{9,10}$/.test(localDigits))?(isBrazil?'Confira o DDD e o número do telefone.':'Confira o país e o número do telefone.'):'');
if(!form.reportValidity())return;
const digits=phoneInput.getNumber().replace(/\D/g,'');
const utm={};for(const [k,v]of new URLSearchParams(location.search)){if(['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].includes(k))utm[k]=v.slice(0,300);}
const data={nome,email,telefone:digits,consentimento:false,utm},signature=JSON.stringify(data);
if(!pending||pending.signature!==signature)pending={id:crypto.randomUUID(),signature};
busy=true;button.disabled=true;button.textContent='Confirmando sua inscrição…';status.textContent='';const started=Date.now();confetti();const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
try{
const response=await fetch(URL_BASE+'/rest/v1/live500_inscricoes',{method:'POST',headers:{apikey:API_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({id:pending.id,...data}),signal:controller.signal});
if(!response.ok){let result={};try{result=await response.json();}catch{}if(!(response.status===409&&result.code==='23505'))throw new Error('Não foi possível confirmar sua inscrição. Tente novamente em instantes.');}
write(RECEIPT,{confirmed:true,id:pending.id,at:Date.now()},'sessionStorage');await new Promise(resolve=>setTimeout(resolve,Math.max(0,1800-(Date.now()-started))));location.assign('obrigado.html');
}catch(error){status.textContent=error.name==='AbortError'?'A conexão demorou mais que o esperado. Tente novamente; seus dados continuam no formulário.':error.message||'Verifique sua conexão e tente novamente.';}
finally{clearTimeout(timeout);busy=false;button.disabled=false;button.textContent='Quero participar';}
});
})();