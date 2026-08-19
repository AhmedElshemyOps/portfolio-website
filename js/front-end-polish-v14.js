
(function(){
  const menuBtn=document.querySelector('[data-menu-button]'); const nav=document.querySelector('[data-nav]');
  if(menuBtn&&nav&&!menuBtn.dataset.navReady){menuBtn.dataset.navReady='true'; menuBtn.addEventListener('click',()=>{const open=nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded',open?'true':'false');});}
  document.querySelectorAll('img').forEach(img=>{ if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy'); });
  const bar=document.querySelector('.article-progress');
  if(bar){ const update=()=>{const h=document.documentElement; const max=h.scrollHeight-h.clientHeight; const p=max>0?(h.scrollTop/max)*100:0; bar.style.width=p+'%';}; document.addEventListener('scroll',update,{passive:true}); update(); }
  const toc=document.querySelector('[data-auto-toc]'); const body=document.querySelector('.article-body,.article-content');
  if(toc&&body){ const hs=[...body.querySelectorAll('h2')].slice(0,10); if(hs.length){ toc.innerHTML='<h3>On this page</h3>'+hs.map((h,i)=>{ if(!h.id){h.id='section-'+(i+1);} return `<a href="#${h.id}">${h.textContent}</a>`; }).join(''); }}
  const current=location.pathname.split('/').pop()||'index.html'; document.querySelectorAll('.nav a').forEach(a=>{const href=(a.getAttribute('href')||'').split('#')[0]; if(href===current || (current==='index.html' && href==='index.html')) a.setAttribute('aria-current','page');});
})();
