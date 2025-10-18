// Animations: Lenis smooth scroll + GSAP ScrollTrigger appearances + Splitting
document.addEventListener('DOMContentLoaded',()=>{

  // Splitting for headings
  Splitting();

  // Lenis smooth scroll
  const lenis = new Lenis({duration:1.2,easing:(t)=>Math.min(1.001-Math.pow(1-t,3),1)});
  function raf(time){
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // GSAP defaults
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ease:'power3.out',duration:0.9});

  // reveal each section on scroll with direction-aware animation
  const sections = document.querySelectorAll('[data-section]');
  sections.forEach((sec, i)=>{
    const elems = sec.querySelectorAll('h2, h1, p, .btn, .feature, .pricing-card, .why-item');
    gsap.set(elems,{y:40,opacity:0});
    ScrollTrigger.create({
      trigger:sec,
      start:'top 75%',
      end:'bottom 25%',
      onEnter:()=> gsap.to(elems,{y:0,opacity:1,stagger:0.08}),
      onEnterBack:()=> gsap.to(elems,{y:0,opacity:1,stagger:0.06}),
      onLeave:()=> gsap.to(elems,{y:-40,opacity:0,stagger:0.04}),
      onLeaveBack:()=> gsap.to(elems,{y:40,opacity:0,stagger:0.04})
    });
  });

  // hero specific cinematic intro
  const heroTitle = document.querySelector('.hero-title');
  if(heroTitle){
    gsap.fromTo(heroTitle.children, {y:40,opacity:0}, {y:0,opacity:1,stagger:0.04,delay:0.2,duration:0.9});
  }

  // subtle parallax backgrounds
  gsap.to('.hero-gradient', {yPercent:10, ease:'none', scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});

  // feature cards small pop
  gsap.utils.toArray('.feature').forEach((el)=>{
    ScrollTrigger.create({
      trigger:el, start:'top 85%',
      onEnter:()=> gsap.to(el,{y:0,opacity:1,scale:1,boxShadow:'0 10px 40px rgba(0,0,0,0.5)',duration:0.8})
    });
  });

  // header hide on scroll down, show on up
  let lastScroll=0;
  const header=document.getElementById('mainHeader');
  ScrollTrigger.create({
    start:0, end:'99999', onUpdate: self=>{
      const st = self.scroll();
      if(st > lastScroll && st > 80){ header.style.transform='translateY(-88px)'; header.style.transition='transform .4s ease' } else { header.style.transform='translateY(0)'; header.style.transition='transform .4s ease' }
      lastScroll = st;
    }
  });
});
