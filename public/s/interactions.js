// Interactions: menu, modal, loading progress
document.addEventListener('DOMContentLoaded',()=>{

  // loading simulation
  const loading = document.getElementById('loadingScreen');
  const prog = document.querySelector('.loader-progress');
  let p=0; const int=setInterval(()=>{p+=10; prog.style.width=p+'%'; if(p>=100){clearInterval(int); loading.style.opacity='0'; setTimeout(()=>loading.style.display='none',600)}},120);

  // menu toggle
  const menuBtn=document.getElementById('menuToggle');
  const mobile=document.getElementById('mobileMenu');
  menuBtn.addEventListener('click',()=>{
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!open));
    if(!open){ mobile.classList.add('open'); mobile.setAttribute('aria-hidden','false') } else { mobile.classList.remove('open'); mobile.setAttribute('aria-hidden','true') }
  });

  // modal
  const modal=document.getElementById('modal');
  const closeModal=document.getElementById('closeModal');
  document.getElementById('finalCta').addEventListener('click', ()=>{ modal.classList.add('open'); modal.setAttribute('aria-hidden','false') });
  closeModal.addEventListener('click', ()=>{ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true') });

  // support keyboard accessibility
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape'){ modal.classList.remove('open'); mobile.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false') } });
});
