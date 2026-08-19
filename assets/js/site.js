
(function(){
  const btn=document.getElementById('menuButton');
  const nav=document.getElementById('siteNav');
  const dropdowns=[...document.querySelectorAll('.dropdown')];
  const header=document.querySelector('.site-header');
  if(btn&&nav){
    btn.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
      if(!open){dropdowns.forEach(d=>d.classList.remove('open'));}
    });
  }
  dropdowns.forEach(drop=>{
    const toggle=drop.querySelector('.dropbtn');
    if(!toggle) return;
    toggle.setAttribute('aria-expanded','false');
    toggle.addEventListener('click',()=>{
      const willOpen=!drop.classList.contains('open');
      dropdowns.forEach(d=>{d.classList.remove('open'); const t=d.querySelector('.dropbtn'); if(t) t.setAttribute('aria-expanded','false');});
      if(willOpen){drop.classList.add('open'); toggle.setAttribute('aria-expanded','true');}
    });
  });
  if(nav){
    nav.addEventListener('click',(e)=>{
      if(e.target.closest('a')&&nav.classList.contains('open')){
        nav.classList.remove('open');
        if(btn) btn.setAttribute('aria-expanded','false');
      }
    });
  }
  document.addEventListener('click',(e)=>{
    if(dropdowns.some(d=>d.contains(e.target))) return;
    dropdowns.forEach(d=>{d.classList.remove('open'); const t=d.querySelector('.dropbtn'); if(t) t.setAttribute('aria-expanded','false');});
  });
  const updateHeader=()=>{ if(header) header.classList.toggle('scrolled',window.scrollY>12); };
  updateHeader();
  window.addEventListener('scroll',updateHeader,{passive:true});
})();

window.addEventListener('DOMContentLoaded',()=>{
  const existing=document.getElementById('backToTop');
  const b=existing||document.createElement('button');
  if(!existing){
    b.id='backToTop';
    b.type='button';
    b.className='back-to-top site-back-top';
    b.setAttribute('aria-label','Back to top');
    b.textContent='↑';
    document.body.appendChild(b);
  }else{
    b.classList.add('site-back-top');
  }
  b.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  const toggleBackTop=()=>b.classList.toggle('visible',window.scrollY>520);
  toggleBackTop();
  window.addEventListener('scroll',toggleBackTop,{passive:true});

  const revealItems=[...document.querySelectorAll('.card,.project-side,.project-card,.article-index-card,.library-side,.timeline-item,.boundary-panel,.fit-panel,.proof-list>div,.quote-step')];
  revealItems.forEach(el=>el.classList.add('reveal-on-scroll'));
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.08,rootMargin:'0px 0px -40px 0px'});
    revealItems.forEach(el=>observer.observe(el));
  }else{
    revealItems.forEach(el=>el.classList.add('visible'));
  }
});
(function(){
  function addProjectFallbackMenu(){
    if(document.querySelector('.dropdown-menu')) return;
    var nav=document.querySelector('[data-nav], .nav, .nav-links');
    if(!nav) return;
    var links=[].slice.call(nav.querySelectorAll('a'));
    var projectLink=links.find(function(a){return /projects/i.test((a.textContent||'').trim());});
    if(!projectLink || projectLink.dataset.projectFallback==='true') return;
    var depth=location.pathname.split('/').filter(Boolean).length>1?'../':'';
    var menu=document.createElement('div');
    menu.className='legacy-project-menu';
    menu.innerHTML='<a href="'+depth+'projects.html">All Projects</a><a href="'+depth+'infradispatch/">InfraDispatch · Dispatch Planner</a><a href="'+depth+'infracluster.html">InfraCluster · Hotel Clustering</a><a href="'+depth+'infrasky.html">InfraSky · Stargazing Planner</a><a href="'+depth+'infraquote.html">InfraQuote · Quotation Tool</a>';
    projectLink.dataset.projectFallback='true';
    projectLink.setAttribute('aria-haspopup','true');
    projectLink.setAttribute('aria-expanded','false');
    projectLink.parentNode.insertBefore(menu, projectLink.nextSibling);
    projectLink.addEventListener('click',function(event){
      event.preventDefault();
      var open=menu.classList.toggle('open');
      projectLink.setAttribute('aria-expanded',open?'true':'false');
    });
    document.addEventListener('click',function(event){
      if(event.target===projectLink || menu.contains(event.target)) return;
      menu.classList.remove('open');
      projectLink.setAttribute('aria-expanded','false');
    });
  }
  var style=document.createElement('style');
  style.textContent='.legacy-project-menu{display:none;position:absolute;z-index:80;background:#fff;color:#101828;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 20px 50px rgba(8,17,31,.16);padding:8px;min-width:270px}.legacy-project-menu.open{display:grid}.legacy-project-menu a{display:block!important;color:#101828!important;padding:9px 12px!important;border-radius:10px!important}.legacy-project-menu a:hover{background:#f3f5f8!important}@media(max-width:900px){.legacy-project-menu{position:static;box-shadow:none;border-radius:12px;margin:6px 0}}';
  if(document.head) document.head.appendChild(style);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addProjectFallbackMenu); else addProjectFallbackMenu();
}());
