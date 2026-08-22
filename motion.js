
window.Motion = (() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const mobile = matchMedia("(max-width:640px)").matches;
  let pointerRaf=0, px=0, py=0, tx=0, ty=0;

  function init(){
    if(reduce)return;
    initHeroDepth();
    if(fine)initMagnetic();
    if(mobile)initMobileDepth();
  }

  function initHeroDepth(){
    const hero=document.querySelector(".hero");if(!hero)return;
    const title=hero.querySelector(".hero-title"),layers=hero.querySelectorAll(".depth-ring,.depth-orb");
    if(!layers.length)return;
    if(!fine)return;
    hero.addEventListener("pointermove",e=>{
      const r=hero.getBoundingClientRect();
      tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;
      if(!pointerRaf)pointerRaf=requestAnimationFrame(render);
    },{passive:true});
    hero.addEventListener("pointerleave",()=>{tx=ty=0;if(!pointerRaf)pointerRaf=requestAnimationFrame(render)},{passive:true});
    function render(){
      pointerRaf=0;px+=(tx-px)*.08;py+=(ty-py)*.08;
      layers.forEach((el,i)=>{const d=(i+1)*5;el.style.transform=`translate3d(${px*d}px,${py*d}px,0)`});
      if(title)title.style.transform=`translate3d(${px*-7}px,${py*-5}px,0)`;
      if(Math.abs(tx-px)>.001||Math.abs(ty-py)>.001)pointerRaf=requestAnimationFrame(render);
    }
  }

  function initMobileDepth(){
    const hero=document.querySelector(".hero");if(!hero)return;
    const rings=hero.querySelectorAll(".depth-ring");if(!rings.length)return;
    let raf=0;
    function update(){
      raf=0;const r=hero.getBoundingClientRect(),p=Math.max(-1,Math.min(1,-r.top/Math.max(1,hero.offsetHeight)));
      rings.forEach((el,i)=>el.style.transform=`translate3d(0,${p*(i+1)*4}px,0)`);
    }
    addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});update();
  }

  function initMagnetic(){
    document.querySelectorAll(".magnetic").forEach(el=>{
      let raf=0,x=0,y=0,tx=0,ty=0;
      el.addEventListener("pointermove",e=>{
        const r=el.getBoundingClientRect();tx=(e.clientX-(r.left+r.width/2))*.055;ty=(e.clientY-(r.top+r.height/2))*.055;
        if(!raf)raf=requestAnimationFrame(render);
      },{passive:true});
      el.addEventListener("pointerleave",()=>{tx=ty=0;if(!raf)raf=requestAnimationFrame(render)},{passive:true});
      function render(){raf=0;x+=(tx-x)*.22;y+=(ty-y)*.22;el.style.transform=`translate3d(${x}px,${y}px,0)`;if(Math.abs(tx-x)>.05||Math.abs(ty-y)>.05)raf=requestAnimationFrame(render)}
    });
  }

  function bindCards(){
    if(reduce||!fine)return;
    document.querySelectorAll(".product-card").forEach(card=>{
      if(card.dataset.motionBound)return;card.dataset.motionBound="1";
      let raf=0,x=0,y=0,tx=0,ty=0;
      card.addEventListener("pointermove",e=>{
        const r=card.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;
        if(!raf)raf=requestAnimationFrame(render);
      },{passive:true});
      card.addEventListener("pointerleave",()=>{tx=ty=0;if(!raf)raf=requestAnimationFrame(render)},{passive:true});
      function render(){raf=0;x+=(tx-x)*.18;y+=(ty-y)*.18;card.style.transform=`perspective(1100px) rotateX(${-y*5}deg) rotateY(${x*6}deg) translateY(-5px)`;if(Math.abs(tx-x)>.001||Math.abs(ty-y)>.001)raf=requestAnimationFrame(render)}
    });
  }

  function bindGallery(){
    if(reduce||!fine)return;
    const g=document.querySelector(".gallery-main");if(!g||g.dataset.motionBound)return;
    g.dataset.motionBound="1";let raf=0,x=0,y=0,tx=0,ty=0;
    g.addEventListener("pointermove",e=>{const r=g.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;if(!raf)raf=requestAnimationFrame(render)},{passive:true});
    g.addEventListener("pointerleave",()=>{tx=ty=0;if(!raf)raf=requestAnimationFrame(render)},{passive:true});
    function render(){raf=0;x+=(tx-x)*.16;y+=(ty-y)*.16;g.style.transform=`perspective(950px) rotateX(${-y*2.4}deg) rotateY(${x*3.2}deg)`;if(Math.abs(tx-x)>.001||Math.abs(ty-y)>.001)raf=requestAnimationFrame(render)}
  }
  return {init,bindCards,bindGallery};
})();
