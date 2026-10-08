'use strict';
/* Text-based A4 export. Shared document data keeps screen, text and PDF output aligned.
   jsPDF and licensed Unicode fonts load only when a PDF is requested. */
(function(root) {
  const navy=[16,40,63], muted=[83,96,109], gold=[121,91,32], warm=[247,244,237];
  function create(model, jsPDF, fonts) {
    const doc = new jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
    doc.addFileToVFS('DejaVuSans.ttf',fonts.regular); doc.addFont('DejaVuSans.ttf','QuoteSans','normal');
    doc.addFileToVFS('DejaVuSans-Bold.ttf',fonts.bold); doc.addFont('DejaVuSans-Bold.ttf','QuoteSans','bold');
    doc.setProperties({title:model.title,subject:'Client tour quotation',author:model.preparedBy,creator:'InfraQuote'});
    let y=20; const left=18,width=174,bottom=270;
    const font=(size=9.2,bold=false,color=navy)=>{doc.setFont('QuoteSans',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);};
    const clean=value=>String(value??'').replace(/[\u2010-\u2015]/g,'-').replace(/\u00a0/g,' ');
    const split=(value,w=width,size=9.2,bold=false)=>{font(size,bold);return doc.splitTextToSize(clean(value),w);};
    function header(continued=false) {
      doc.setFillColor(...navy);doc.rect(0,0,210,4,'F');
      const identity=clean(model.company||'InfraQuote').slice(0,60);font(identity.length>20?11:17,true);doc.text(identity,left,17,{maxWidth:120});font(8,false,muted);doc.text(clean(model.reference),192,17,{align:'right'});
      doc.setDrawColor(222,213,197);doc.line(left,23,192,23);y=continued?34:32;
      if(continued){font(8,false,muted);doc.text('CLIENT QUOTATION - CONTINUED',left,y);y+=9;}
    }
    function newPage(){doc.addPage();header(true);}
    function ensure(height){if(y+height>bottom)newPage();}
    function text(value,{size=9.2,bold=false,color=navy,x=left,w=width,after=4}={}) {
      const lines=split(value,w,size,bold); const lineHeight=size*.48;
      for(const line of lines){ensure(lineHeight+1);font(size,bold,color);doc.text(line,x,y);y+=lineHeight;}
      y+=after;
    }
    function heading(value){ensure(20);y+=3;text(value,{size:12,bold:true,after:4});}
    function section(title,values){if(!values?.length)return;heading(title);for(const value of values)text(value,{size:9.1,color:muted,after:3});}
    header();
    text(`${model.theme} tour quotation`,{size:8,bold:true,color:gold,after:4});
    text(model.title,{size:21,bold:true,after:4});
    text(model.description,{size:9.2,color:muted,after:5});
    text(`Prepared for ${model.client}`,{size:10,bold:true,after:2});
    text(`Issued ${model.quoteDate}  |  Valid until ${model.validity}`,{size:8.2,color:muted,after:5});
    ensure(30);doc.setFillColor(...warm);doc.rect(left,y-2,width,27,'F');font(8,false,muted);doc.text('TOTAL QUOTATION',left+5,y+4);font(20,true);doc.text(clean(model.total),left+5,y+14);
    font(8,false,muted);doc.text((model.hideVat ? [model.vatLabel==='bijzondere regeling reisbureaus'?'bijzondere regeling':'Dutch tax treatment',model.vatLabel==='bijzondere regeling reisbureaus'?'reisbureaus':'pending review'] : [`Before VAT: ${model.beforeVat}`,`VAT: ${model.vat}`,model.vatLabel]).map(clean),left+105,y+4,{lineHeightFactor:1.5});y+=31;
    text(model.draft+(model.unresolved?' '+model.unresolved:''),{size:8,color:muted,after:5});
    for(let i=0;i<model.details.length;i+=2){
      const row=model.details.slice(i,i+2);const valueLines=row.map(([label,value])=>split(value,80,9,true));const height=Math.max(...valueLines.map(lines=>lines.length))*4.4+12;ensure(height);
      row.forEach(([label,value],j)=>{const x=left+j*90;font(7.8,false,muted);doc.text(clean(label).toUpperCase(),x,y);font(9,true);doc.text(valueLines[j],x,y+5,{lineHeightFactor:1.4});});y+=height;
    }
    heading('Your itinerary');
    model.itinerary.forEach((stop,index)=>{
      const title=`${index+1}. ${stop.name} (${stop.status})`;const lines=split(title,width,9.8,true);const notes=split(stop.note,width-7,8.7);ensure(Math.min(60,lines.length*4.7+notes.length*4.2+8));
      text(title,{size:9.8,bold:true,after:1});if(stop.note)text(stop.note,{size:8.7,color:muted,x:left+7,w:width-7,after:4});
    });
    section('Guest arrangements',model.guestNotes);
    section('Included',String(model.inclusions||'').split('\n').filter(Boolean));
    section('Not included',String(model.exclusions||'').split('\n').filter(Boolean));
    section('Cancellation and amendments',[model.cancellation].filter(Boolean));
    section('Booking notes',model.notes.filter(Boolean));
    const pages=doc.getNumberOfPages();
    for(let page=1;page<=pages;page++){doc.setPage(page);doc.setDrawColor(222,213,197);doc.line(left,278,192,278);font(7.3,false,muted);doc.text(clean(model.contact),left,284);doc.text(`${page} / ${pages}`,192,284,{align:'right'});}
    return doc;
  }
  let assets;
  async function loadAssets(){
    if(!assets)assets=(async()=>{
      if(!root.jspdf)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/assets/vendor/jspdf-4.2.1.umd.min.js';script.onload=resolve;script.onerror=reject;document.head.appendChild(script);});
      const base64=async(path)=>{const response=await fetch(path);if(!response.ok)throw new Error('Font fetch failed');const bytes=new Uint8Array(await response.arrayBuffer());let value='';for(let offset=0;offset<bytes.length;offset+=8192)value+=String.fromCharCode(...bytes.subarray(offset,offset+8192));return btoa(value);};
      const [regular,bold]=await Promise.all([base64('/assets/vendor/fonts/DejaVuSans.ttf'),base64('/assets/vendor/fonts/DejaVuSans-Bold.ttf')]);
      return {jsPDF:root.jspdf.jsPDF,fonts:{regular,bold}};
    })().catch(error=>{assets=null;throw error;});return assets;
  }
  async function download(model){const deps=await loadAssets();create(model,deps.jsPDF,deps.fonts).save(`${String(model.reference).replace(/[^a-z0-9_-]/gi,'-')}-client-quotation.pdf`);}
  const api={create,download};if(typeof module==='object'&&module.exports)module.exports=api;else root.INFRAQUOTE_PDF=api;
})(typeof window==='object'?window:globalThis);
