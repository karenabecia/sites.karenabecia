(() => {
  'use strict';
  const projectUrl = 'https://thfquebauiygbmfxhypk.supabase.co';
  const publishableKey = 'sb_publishable_IfOiosx75f6v-_Te9fpv-w_UsPIO8_M';
  const storageKey = 'uaulingo-supabase-session-v1';
  let refreshPromise = null;

  const read = () => { try { return JSON.parse(sessionStorage.getItem(storageKey)); } catch { return null; } };
  const write = session => sessionStorage.setItem(storageKey, JSON.stringify(session));
  const clear = () => sessionStorage.removeItem(storageKey);
  const message = (body, status) => {
    const error = new Error(body?.msg || body?.message || body?.error_description || body?.error || `Erro ${status} no Supabase.`);
    error.status = status;
    error.code = body?.code || '';
    return error;
  };
  async function raw(path, options = {}) {
    let response;
    try {
      response = await fetch(projectUrl + path, {
        ...options,
        headers: { apikey: publishableKey, 'Content-Type': 'application/json', ...options.headers }
      });
    } catch {
      throw new Error('Sem conexão com o Supabase. Confira a internet e tente novamente.');
    }
    const body = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) throw message(body, response.status);
    return body;
  }
  async function refresh() {
    if (refreshPromise) return refreshPromise;
    const current = read();
    if (!current?.refresh_token) { clear(); throw new Error('Sua sessão expirou. Entre novamente.'); }
    refreshPromise = raw('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', body: JSON.stringify({ refresh_token: current.refresh_token })
    }).then(data => {
      write({ ...data, expires_at: Math.floor(Date.now() / 1000) + data.expires_in });
      return read();
    }).catch(error => { clear(); throw error; }).finally(() => { refreshPromise = null; });
    return refreshPromise;
  }
  async function session() {
    const current = read();
    if (!current) return null;
    return current.expires_at <= Math.floor(Date.now() / 1000) + 60 ? refresh() : current;
  }
  async function signIn(email, password) {
    const data = await raw('/auth/v1/token?grant_type=password', {
      method: 'POST', body: JSON.stringify({ email, password })
    });
    write({ ...data, expires_at: Math.floor(Date.now() / 1000) + data.expires_in });
    return data.user;
  }
  async function signUp(email, password) {
    const redirectTo = location.origin + location.pathname + location.search;
    return raw(`/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: 'POST', body: JSON.stringify({ email, password })
    });
  }
  async function sendPasswordLink(email) {
    const redirectTo = location.origin + location.pathname + location.search;
    return raw(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method:'POST', body:JSON.stringify({ email })
    });
  }
  async function acceptPasswordLink() {
    const hash = new URLSearchParams(location.hash.slice(1));
    if (!['recovery','invite','signup'].includes(hash.get('type'))) return false;
    const accessToken=hash.get('access_token'),refreshToken=hash.get('refresh_token');
    if (!accessToken || !refreshToken) throw new Error('O link de acesso está incompleto. Solicite outro.');
    const user=await raw('/auth/v1/user',{headers:{Authorization:`Bearer ${accessToken}`}});
    write({access_token:accessToken,refresh_token:refreshToken,user,expires_at:Math.floor(Date.now()/1000)+Number(hash.get('expires_in')||3600)});
    history.replaceState(null,'',location.pathname+location.search);
    return true;
  }
  async function updatePassword(password) {
    const current=await session();
    if (!current) throw new Error('O link expirou. Solicite outro.');
    return raw('/auth/v1/user',{
      method:'PUT', headers:{Authorization:`Bearer ${current.access_token}`},
      body:JSON.stringify({password})
    });
  }
  async function signOut() {
    const current = read();
    clear();
    if (current?.access_token) {
      await raw('/auth/v1/logout', { method: 'POST', headers: { Authorization: `Bearer ${current.access_token}` } }).catch(() => {});
    }
  }
  async function table(name, query = '', options = {}) {
    const current = await session();
    if (!current) throw new Error('Sua sessão expirou. Entre novamente.');
    const request = token => raw(`/rest/v1/${name}${query}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...options.headers }
    });
    try { return await request(current.access_token); }
    catch (error) {
      if (error.status !== 401) throw error;
      const renewed = await refresh();
      return request(renewed.access_token);
    }
  }
  async function rpc(name,payload={}) {
    const current=await session();
    if(!current)throw new Error('Sua sessão expirou. Entre novamente.');
    const request=token=>raw(`/rest/v1/rpc/${name}`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:JSON.stringify(payload)});
    try{return await request(current.access_token)}catch(error){if(error.status!==401)throw error;const renewed=await refresh();return request(renewed.access_token)}
  }
  async function invokeFunction(name,payload={}) {
    if(!/^uaulingo-[a-z0-9-]+$/.test(name))throw new Error('Função inválida.');
    const current=await session();
    if(!current)throw new Error('Sua sessão expirou. Entre novamente.');
    const request=token=>raw(`/functions/v1/${name}`,{
      method:'POST',headers:{Authorization:`Bearer ${token}`},body:JSON.stringify(payload)
    });
    try{return await request(current.access_token)}
    catch(error){if(error.status!==401)throw error;const renewed=await refresh();return request(renewed.access_token)}
  }
  async function redeemAccessCode(email,code,password) {
    return raw('/functions/v1/uaulingo-access-code',{
      method:'POST',body:JSON.stringify({action:'redeem',email,code,password})
    });
  }
  async function storageRequest(path, options = {}) {
    if (!/^(panel|certificates)\/[a-z0-9-]{2,60}\.png$/.test(path)) throw new Error('Caminho de imagem inválido.');
    const current=await session();
    if (!current) throw new Error('Sua sessão expirou. Entre novamente.');
    const url=projectUrl+'/storage/v1/object/'+(options.method==='POST'?'':'authenticated/')+'uaulingo-achievements/'+path;
    const request=async token=>{
      let response;
      try { response=await fetch(url,{method:options.method||'GET',body:options.body,cache:'no-store',headers:{apikey:publishableKey,Authorization:`Bearer ${token}`,...(options.method==='POST'?{'Content-Type':'image/png','x-upsert':'true'}:{})}}); }
      catch { throw new Error('Sem conexão com o Supabase. Confira a internet e tente novamente.'); }
      if (!response.ok) throw message(await response.json().catch(()=>null),response.status);
      return options.method==='POST' ? response.json() : response.blob();
    };
    try { return await request(current.access_token); }
    catch(error) { if(error.status!==401)throw error;const renewed=await refresh();return request(renewed.access_token); }
  }
  const storageUpload=(path,blob)=>storageRequest(path,{method:'POST',body:blob});
  const storageDownload=path=>storageRequest(path);
  async function supportFile(path,file,upload=false) {
    if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}-[^/]{1,100}$/.test(path)) throw new Error('Caminho de anexo inválido.');
    const current=await session();if(!current)throw new Error('Entre novamente para acessar o anexo.');
    const request=async token=>{
      const response=await fetch(projectUrl+'/storage/v1/object/'+(upload?'':'authenticated/')+'uaulingo-support/'+path,{
        method:upload?'POST':'GET',body:upload?file:undefined,
        headers:{apikey:publishableKey,Authorization:`Bearer ${token}`,...(upload?{'Content-Type':file.type||'application/octet-stream'}:{})}
      });
      if(!response.ok)throw message(await response.json().catch(()=>null),response.status);
      return upload?response.json():response.blob();
    };
    try{return await request(current.access_token)}catch(error){if(error.status!==401)throw error;const renewed=await refresh();return request(renewed.access_token)}
  }
  const supportUpload=(path,file)=>supportFile(path,file,true);
  const supportDownload=path=>supportFile(path,null,false);
  window.UauSupabase = { session, signIn, signUp, signOut, sendPasswordLink, acceptPasswordLink, updatePassword, table, rpc, invokeFunction, redeemAccessCode, storageUpload, storageDownload, supportUpload, supportDownload, clear };
})();
