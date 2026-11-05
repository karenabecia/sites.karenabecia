(() => {
  const width = 1600, height = 1100;
  const achievements = [
    {id:'primeiros-passos',title:'Primeiros passos no Excel'},
    {id:'formula-mestre',title:'Mestre das fórmulas'},
    {id:'ia-estrategica',title:'IA estratégica'}
  ];
  const defaults = () => ({
    name:{x:50,y:49,size:76,color:'#063d2e'},
    date:{x:50,y:76,size:38,color:'#063d2e'}
  });
  function openDB() {
    return new Promise((resolve,reject) => {
      const request=indexedDB.open('uaulingo-certificates-v1',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('templates',{keyPath:'id'});
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
  }
  async function get(id) {
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('templates','readonly');
      const req=tx.objectStore('templates').get(id);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
      tx.oncomplete=()=>db.close();
    });
  }
  async function save(template) {
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('templates','readwrite');
      tx.objectStore('templates').put(template);
      tx.oncomplete=()=>{db.close();resolve()};
      tx.onerror=()=>{db.close();reject(tx.error)};
    });
  }
  async function getRemote(id) {
    const db=window.UauSupabase;
    if(!db)return null;
    const rows=await db.table('uaulingo_achievements',`?select=id,certificate_enabled,certificate_image_path,name_layout,date_layout&id=eq.${encodeURIComponent(id)}`);
    const row=rows[0];
    if(!row?.certificate_enabled||!row.certificate_image_path)return null;
    const backgroundBlob=await db.storageDownload(row.certificate_image_path);
    return {id,backgroundBlob,name:{...defaults().name,...row.name_layout},date:{...defaults().date,...row.date_layout}};
  }
  async function imageFromBlob(blob) {
    const url=URL.createObjectURL(blob),image=new Image();
    image.src=url;
    try { await image.decode(); return image; }
    finally { URL.revokeObjectURL(url); }
  }
  async function renderCustom(canvas,template,name,date) {
    if(!template?.backgroundBlob)throw Error('Nenhum PNG foi configurado.');
    canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d');
    const image=await imageFromBlob(template.backgroundBlob);
    ctx.drawImage(image,0,0,width,height);
    const fields=[['name',name],['date',date]];
    for(const [key,text] of fields){
      const p=template[key]||defaults()[key];
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle=p.color||'#063d2e';
      ctx.font=`bold ${Math.max(12,Math.min(180,Number(p.size)||40))}px Arial, Helvetica, sans-serif`;
      ctx.fillText(String(text),Number(p.x)/100*width,Number(p.y)/100*height,width*.88);
    }
    return canvas;
  }
  function pdfBlob(canvas) {
    const jpeg=Uint8Array.from(atob(canvas.toDataURL('image/jpeg',.94).split(',')[1]),ch=>ch.charCodeAt(0));
    const parts=[],offsets=[0],encoder=new TextEncoder();let size=0;
    const push=value=>{parts.push(value);size+=typeof value==='string'?encoder.encode(value).length:value.length};
    const object=(n,body)=>{offsets[n]=size;push(`${n} 0 obj\n${body}\nendobj\n`)};
    push('%PDF-1.4\n');
    object(1,'<< /Type /Catalog /Pages 2 0 R >>');
    object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>');
    const content='q\n842 0 0 595 0 0 cm\n/Im0 Do\nQ\n';
    object(4,`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream`);
    offsets[5]=size;
    push(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
    push(jpeg);push('\nendstream\nendobj\n');
    const xref=size;push('xref\n0 6\n0000000000 65535 f \n');
    for(let i=1;i<=5;i++)push(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
    push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(parts,{type:'application/pdf'});
  }
  function downloadPdf(canvas,filename) {
    const url=URL.createObjectURL(pdfBlob(canvas));
    const link=document.createElement('a');link.href=url;link.download=filename;
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  window.UauCertificate={achievements,defaults,get,save,getRemote,renderCustom,pdfBlob,downloadPdf,width,height};
})();
