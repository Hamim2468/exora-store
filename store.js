
(() => {
"use strict";

const C = window.EXORA_CONFIG;
const state = {
  productId: localStorage.getItem("exora_product") || "polo",
  variantKey: localStorage.getItem("exora_variant") || "black",
  size: null,
  filter: "all",
  cancelTimer: null
};

const money = n => "৳" + Number(n || 0).toLocaleString("en-BD");
const qs = s => document.querySelector(s);
const getCart = () => { try{return JSON.parse(localStorage.getItem("exora_cart")||"[]")}catch{return[]} };
const setCart = c => { localStorage.setItem("exora_cart",JSON.stringify(c)); updateBagCount(); };
const getOrders = () => { try{return JSON.parse(localStorage.getItem("exora_orders")||"[]")}catch{return[]} };
const setOrders = o => localStorage.setItem("exora_orders",JSON.stringify(o));
const getWish = () => { try{return JSON.parse(localStorage.getItem("exora_wishlist")||"[]")}catch{return[]} };
const setWish = w => localStorage.setItem("exora_wishlist",JSON.stringify(w));
const productById = id => PRODUCTS.find(p=>p.id===id) || PRODUCTS[0];
const variantOf = (p,k) => p.variants.find(v=>v.key===k) || p.variants[0];

window.EXORA = {state,money,productById,variantOf,getCart,setCart,getOrders,setOrders,getWish,setWish};

function toast(msg){
  const el=qs("#toast"); if(!el)return;
  el.textContent=msg;el.classList.add("show");
  clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),2300);
}
window.showToast=toast;

function updateBagCount(){
  const n=getCart().reduce((a,x)=>a+(Number(x.qty)||0),0);
  document.querySelectorAll("[data-bag-count]").forEach(e=>e.textContent=n);
}

function saveSelection(){
  localStorage.setItem("exora_product",state.productId);
  localStorage.setItem("exora_variant",state.variantKey);
}

function normalizePhone(phone){
  let d=String(phone||"").replace(/\D/g,"");
  if(d.startsWith("00880"))d=d.substring(4);
  else if(d.startsWith("880"))d=d.substring(2);
  let p11=d,p10=d;
  if(d.length===11 && d.startsWith("0"))p10=d.substring(1);
  else if(d.length===10 && d.startsWith("1"))p11="0"+d;
  return {p11,p10};
}
function validBdPhone(phone){return /^01[3-9]\d{8}$/.test(normalizePhone(phone).p11)}
window.validBdPhone=validBdPhone;

function pageMotion(){
  document.querySelectorAll(".motion-reveal:not(.visible)").forEach(el=>{
    if(el.getBoundingClientRect().top < innerHeight*.9) el.classList.add("visible");
  });
}
const revealObserver = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");revealObserver.unobserve(e.target)}})
},{threshold:.1});
function initReveal(){document.querySelectorAll(".motion-reveal").forEach(e=>revealObserver.observe(e));pageMotion()}

function updateProgress(){
  const max=document.documentElement.scrollHeight-innerHeight;
  const bar=qs("#exora-progress");if(bar)bar.style.width=(max?scrollY/max*100:0)+"%";
}
addEventListener("scroll",updateProgress,{passive:true});

function renderCards(list,target){
  const root=qs(target);if(!root)return;
  root.innerHTML=list.length?list.map((p,i)=>{
    const v=p.variants[0],w=getWish().includes(p.id);
    return `<article class="product-card motion-reveal" data-product="${p.id}">
      <div class="product-image" data-open-product="${p.id}">
        ${p.tag?`<span class="badge-tag">${p.tag}</span>`:""}
        <img src="${v.cover}" alt="EXORA ${p.name}" loading="lazy" decoding="async" onerror="this.style.opacity='.12'">
        <span class="photo-count">${v.gallery.length} PHOTOS</span>
        <button class="wish-btn ${w?"active":""}" data-wish="${p.id}" aria-label="Wishlist">${w?"♥":"♡"}</button>
      </div>
      <div class="product-info">
        <div><div class="product-top"><h3 class="product-name">${p.name}</h3><div class="price">${money(p.price)}</div></div>
        <div class="product-color">${p.variants.length} colour options</div></div>
        <div><div class="product-meta">${p.sizes.join(" · ")} AVAILABLE</div>
        <div class="card-actions"><button class="btn dark" data-open-product="${p.id}">View Drop →</button><button class="quick-btn" data-quick="${p.id}">Quick View</button></div></div>
      </div>
    </article>`;
  }).join(""):`<div class="empty" style="grid-column:1/-1">NO DROPS FOUND.</div>`;
  initReveal();
  bindCardEvents();
}

function bindCardEvents(){
  document.querySelectorAll("[data-open-product]").forEach(el=>{
    if(el.dataset.bound)return;el.dataset.bound="1";
    el.addEventListener("click",e=>{if(el.matches("button"))e.preventDefault();openProduct(el.dataset.openProduct)});
  });
  document.querySelectorAll("[data-quick]").forEach(el=>{
    if(el.dataset.bound)return;el.dataset.bound="1";
    el.addEventListener("click",e=>{e.stopPropagation();openQuickView(el.dataset.quick)});
  });
  document.querySelectorAll("[data-wish]").forEach(el=>{
    if(el.dataset.bound)return;el.dataset.bound="1";
    el.addEventListener("click",e=>{e.stopPropagation();toggleWishlist(el.dataset.wish)});
  });
  Motion.bindCards();
}

function renderHome(){
  renderCards(PRODUCTS,"#featuredGrid");
}
function renderShop(filter=state.filter){
  state.filter=filter;
  const list=filter==="all"?PRODUCTS:PRODUCTS.filter(p=>p.type===filter);
  renderCards(list,"#shopGrid");
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("gold",b.dataset.filter===filter));
}
function setShopFilter(filter){renderShop(filter)}
window.setShopFilter=setShopFilter;

function openProduct(id){
  state.productId=id;state.variantKey=productById(id).variants[0].key;state.size=null;saveSelection();
  location.href=`product.html?id=${encodeURIComponent(id)}`;
}
window.openProduct=openProduct;

function renderProduct(){
  const p=productById(state.productId),v=variantOf(p,state.variantKey),root=qs("#productRoot");if(!root)return;
  root.innerHTML=`<div class="variant-layout">
    <div class="gallery motion-reveal">
      <div class="gallery-main" id="galleryMain"><img id="mainImage" src="${v.gallery[0]}" alt="${p.name} ${v.name}"><span class="zoom-hint">TAP TO ZOOM</span></div>
      <div class="thumbs" id="thumbs"></div>
      <div class="gallery-note">${v.gallery.length} photos · Select colour for gallery preview</div>
    </div>
    <div class="product-detail motion-reveal">
      <div class="eyebrow">EXORA / ${p.type.toUpperCase()} COLLECTION</div>
      <h1>${p.name}</h1>
      <div class="selector"><div class="selector-title">COLOUR VARIANT: <span style="color:#fff">${v.name.toUpperCase()}</span></div>
        <div class="swatches">${p.variants.map(x=>`<button class="swatch ${x.key===v.key?"active":""}" data-variant="${x.key}"><span class="dot" style="background:${x.swatch}"></span>${x.name}</button>`).join("")}</div>
      </div>
      <div class="detail-price">${money(p.price)}</div>
      <p class="detail-copy">${p.description}</p>
      <div class="specs">${Object.entries(p.specs).map(([k,val])=>`<div class="spec"><span>${k}</span><b>${val}</b></div>`).join("")}</div>
      <div class="selector"><div class="selector-title">SELECT SIZE · ${p.sizes.join(" · ")}</div>
        <div class="sizes">${p.sizes.map(s=>`<button class="size-btn ${state.size===s?"active":""}" data-size="${s}">${s}</button>`).join("")}</div>
      </div>
      <div class="stock-note"><span class="stock-dot"></span> In stock · Dhaka flat delivery ৳${C.DELIVERY}</div>
      <div class="detail-actions"><button id="addToBag" class="btn gold">Add to Bag</button><a class="btn dark" href="cart.html">View Bag</a></div>
    </div>
  </div>`;
  qs("#thumbs").innerHTML=v.gallery.map((src,i)=>`<button class="${i===0?"active":""}" data-photo="${src}"><img src="${src}" alt="" loading="lazy" decoding="async"><span>${i===0?"FRONT":i===1?"BACK":"HANGER"}</span></button>`).join("");
  qs("#galleryMain").addEventListener("click",()=>openLightbox(v.gallery[0]));
  document.querySelectorAll("[data-photo]").forEach(b=>b.addEventListener("click",()=>{qs("#mainImage").src=b.dataset.photo;document.querySelectorAll("[data-photo]").forEach(x=>x.classList.remove("active"));b.classList.add("active");qs("#galleryMain").onclick=()=>openLightbox(b.dataset.photo)}));
  document.querySelectorAll("[data-variant]").forEach(b=>b.addEventListener("click",()=>{state.variantKey=b.dataset.variant;state.size=null;saveSelection();renderProduct()}));
  document.querySelectorAll("[data-size]").forEach(b=>b.addEventListener("click",()=>{state.size=b.dataset.size;renderProduct()}));
  qs("#addToBag").addEventListener("click",handleAddToCart);
  initReveal();Motion.bindGallery();
}

function handleAddToCart(){
  if(!state.size){toast("PLEASE SELECT A SIZE FIRST");return}
  const p=productById(state.productId),v=variantOf(p,state.variantKey),c=getCart(),key=`${p.id}__${v.key}__${state.size}`;
  const item=c.find(x=>x.key===key);if(item)item.qty++;else c.push({key,productId:p.id,variantKey:v.key,size:state.size,qty:1});
  setCart(c);toast("ADDED TO YOUR BAG");
}
window.handleAddToCart=handleAddToCart;

function cartTotals(){
  const c=getCart(),sub=c.reduce((s,x)=>s+productById(x.productId).price*x.qty,0);
  const delivery=c.length?C.DELIVERY:0;return{sub,delivery,total:sub+delivery};
}
function renderCart(){
  const c=getCart(),list=qs("#cartList");if(!list)return;
  list.innerHTML=c.length?c.map(x=>{const p=productById(x.productId),v=variantOf(p,x.variantKey);return `<div class="cart-row motion-reveal"><img src="${v.cover}" alt="${p.name}" loading="lazy"><div><h3 class="product-name">${p.name}</h3><div class="product-color">${v.name} · Size ${x.size}</div><div class="cart-actions"><div class="qty"><button data-qty="${x.key}" data-d="-1">−</button><span>${x.qty}</span><button data-qty="${x.key}" data-d="1">+</button></div><button class="btn dark" style="min-height:35px;padding:0 11px;font-size:8px" data-remove="${x.key}">Remove</button></div></div><strong>${money(p.price*x.qty)}</strong></div>`}).join(""):`<div class="empty">YOUR BAG IS EMPTY.<br><br><a class="btn dark" href="shop.html">Shop The Collection</a></div>`;
  const t=cartTotals();qs("#cartSub").textContent=money(t.sub);qs("#cartDelivery").textContent=money(t.delivery);qs("#cartTotal").textContent=money(t.total);qs("#checkoutBtn").style.display=c.length?"inline-flex":"none";
  document.querySelectorAll("[data-qty]").forEach(b=>b.addEventListener("click",()=>changeQty(b.dataset.qty,Number(b.dataset.d))));
  document.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>removeCart(b.dataset.remove)));
  initReveal();updateBagCount();
}
function changeQty(key,d){const c=getCart(),x=c.find(i=>i.key===key);if(!x)return;x.qty+=d;if(x.qty<=0)c.splice(c.indexOf(x),1);setCart(c);renderCart()}
function removeCart(key){setCart(getCart().filter(x=>x.key!==key));renderCart();toast("ITEM REMOVED")}

function renderCheckout(){
  const c=getCart(),sum=qs("#checkoutSummary"),btn=qs("#submitOrder");if(!sum||!btn)return;
  if(!c.length){sum.innerHTML='<div class="empty">YOUR BAG IS EMPTY.</div>';btn.disabled=true;return}
  btn.disabled=false;const t=cartTotals();
  sum.innerHTML=c.map(x=>{const p=productById(x.productId),v=variantOf(p,x.variantKey);return `<div style="padding:10px 0;border-bottom:1px solid #282828"><b style="font-size:11px">${p.name}</b><br><span class="muted" style="font-size:10px">${v.name} · ${x.size} · Qty ${x.qty}</span><br><strong style="color:var(--gold);font-size:12px">${money(p.price*x.qty)}</strong></div>`}).join("")+`<div class="line" style="margin-top:15px"><span>Subtotal</span><b>${money(t.sub)}</b></div><div class="line"><span>Delivery</span><b>${money(t.delivery)}</b></div><div class="line total"><span>Total</span><b>${money(t.total)}</b></div>`;
}

function toggleBkash(){
  const on=qs('input[name="pay"]:checked')?.value==="bKash";
  if(qs("#bkashBox"))qs("#bkashBox").style.display=on?"block":"none";
}
window.toggleBkashBox=toggleBkash;

async function submitOrder(e){
  e.preventDefault();
  const name=qs("#name").value.trim(),phone=qs("#phone").value.trim(),area=qs("#area").value.trim(),address=qs("#address").value.trim();
  const payment=qs('input[name="pay"]:checked').value,trx=(qs("#trx")?.value||"").trim();
  if(!validBdPhone(phone)){toast("ENTER A VALID BD PHONE NUMBER");return}
  if(payment==="bKash"&&trx.length<5){toast("ENTER YOUR bKASH TRX ID");return}
  const btn=qs("#submitOrder");btn.disabled=true;btn.textContent="PLACING ORDER...";
  const c=getCart(),t=cartTotals(),orderId="EXO-"+Date.now().toString().slice(-7),now=new Date(),cancel=new Date(Date.now()+C.CANCEL_WINDOW_HOURS*3600000);
  const payload={order_id:orderId,name,phone,area,address,payment,bkash_transaction:trx,items:c.map(x=>{const p=productById(x.productId),v=variantOf(p,x.variantKey);return `${p.name} / ${v.name} / ${x.size} x${x.qty}`}),total:t.total,status:"Pending",date:now.toISOString(),cancel_until:cancel.toISOString()};
  const orders=getOrders();orders.unshift(payload);setOrders(orders);localStorage.setItem("exora_last_order",JSON.stringify({order_id:orderId,phone}));
  let sent=false;
  try{
    await fetch(C.SCRIPT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
    sent=true;
  }catch(err){console.error(err)}
  setCart([]);btn.disabled=false;btn.textContent="Place Order Now";
  toast(sent?"ORDER SENT":"ORDER SAVED LOCALLY — CHECK BACKEND");
  location.href=`order-detail.html?id=${encodeURIComponent(orderId)}`;
}
window.handleCheckoutSubmit=submitOrder;

function statusClass(s){s=String(s||"Pending").toLowerCase();return ["confirmed","processing","shipped","delivered"].includes(s)?"confirmed":s==="cancelled"?"cancelled":"pending"}
function renderTrack(status){
  const s=String(status||"Pending").toLowerCase(),steps=["pending","confirmed","processing","shipped","delivered"],idx=steps.indexOf(s);
  return `<div class="track">${["Order Placed","Confirmed","Processing","Shipped","Delivered"].map((x,i)=>`<div class="track-step ${idx>=i?"done":""}">${x}</div>`).join("")}</div>`;
}
async function fetchJson(url){
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),3500);
  try{const r=await fetch(url,{signal:ctrl.signal});return await r.json()}finally{clearTimeout(timer)}
}
async function lookupOrders(){
  const raw=qs("#lookupPhone")?.value.trim()||"",all=getOrders();
  if(!raw){renderOrdersList(all);return}
  const {p11,p10}=normalizePhone(raw);
  const local=all.filter(o=>{const v=normalizePhone(o.phone);return v.p11===p11||v.p10===p10});
  renderOrdersList(local);
  const btn=qs("#lookupBtn");if(btn)btn.textContent="Searching...";
  try{
    const results=await Promise.allSettled([
      fetchJson(`${C.SCRIPT_URL}?action=my_orders&phone=${encodeURIComponent(p11)}`),
      fetchJson(`${C.SCRIPT_URL}?action=my_orders&phone=${encodeURIComponent(p10)}`)
    ]);
    let remote=[];
    for(const r of results)if(r.status==="fulfilled"&&r.value?.success&&Array.isArray(r.value.orders)&&r.value.orders.length){remote=r.value.orders;break}
    if(remote.length){
      const merged=getOrders();
      remote.forEach(ro=>{const i=merged.findIndex(x=>x.order_id===ro.order_id);if(i>=0)merged[i]={...merged[i],...ro};else merged.push(ro)});
      setOrders(merged);renderOrdersList(remote);
    }
  }catch{}
  if(btn)btn.textContent="Find My Orders";
}
window.lookupOrders=lookupOrders;

function renderOrdersList(items){
  const grid=qs("#ordersGrid");if(!grid)return;
  if(!items?.length){grid.innerHTML='<div class="empty">NO CURRENT ORDER FOUND.<br><br><a class="btn dark" href="shop.html">Explore Collection</a></div>';return}
  const sorted=[...items].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
  grid.innerHTML=sorted.map((o,i)=>`<article class="order-card motion-reveal"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><span class="status ${statusClass(o.status)}">${o.status||"Pending"}</span><span style="font-size:8px;color:var(--gold);letter-spacing:.12em">${i===0?"CURRENT ORDER":"ORDER"}</span></div><h3>${o.order_id}</h3><p>${Array.isArray(o.items)?o.items.join("<br>"):o.items||""}<br><br>Total: <b>${money(o.total)}</b><br>Placed: ${fmtDate(o.date)}</p><div class="order-actions"><a class="btn gold" href="order-detail.html?id=${encodeURIComponent(o.order_id)}">View Order Details →</a></div></article>`).join("");
  initReveal();
}

async function renderOrderDetail(){
  const root=qs("#orderRoot"),id=new URLSearchParams(location.search).get("id");if(!root||!id)return;
  let o=getOrders().find(x=>x.order_id===id);
  const draw=order=>{
    const st=String(order.status||"Pending"),low=st.toLowerCase(),canCancel=low==="pending"&&(!order.cancel_until||new Date(order.cancel_until)>Date.now());
    root.innerHTML=`<div class="eyebrow">05 / ORDER SUMMARY</div><h1 class="page-title">${order.order_id}</h1>
    <div class="order-card motion-reveal" style="margin-top:25px;max-width:850px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="status ${statusClass(st)}">${st}</span><span style="font-size:10px;color:#777">${fmtDate(order.date)}</span></div>
      ${renderTrack(st)}
      <h3>Items Ordered</h3><p style="color:#ddd;line-height:1.7">${Array.isArray(order.items)?order.items.join("<br>"):order.items||""}</p>
      <div style="border-top:1px solid #222;padding-top:15px;margin-top:15px">
        <div class="line"><span>Total Amount</span><b style="color:var(--gold)">${money(order.total)}</b></div>
        <div class="line"><span>Contact Phone</span><span>${order.phone||""}</span></div>
        <div class="line"><span>Payment Method</span><span>${order.payment||""}</span></div>
      </div>
      ${canCancel?`<div class="notice" style="margin-top:18px"><b>Cancellation Window Active</b><br>You can cancel this order within <span id="cancelTimer" style="color:var(--gold);font-weight:900">--:--:--</span>.</div>`:""}
      <div class="order-actions">${canCancel?`<button class="btn danger" id="cancelOrderBtn">Cancel This Order</button>`:""}<a class="btn gold" href="orders.html">Back To My Orders</a></div>
    </div>`;
    if(canCancel){qs("#cancelOrderBtn").addEventListener("click",()=>cancelOrder(order.order_id,order.phone));startCancelCountdown(order.cancel_until)}
    initReveal();
  };
  if(o)draw(o);else root.innerHTML='<div class="notice">Loading live order details...</div>';
  if(o?.phone)try{
    const {p11,p10}=normalizePhone(o.phone);let live=null;
    for(const phone of [p11,p10]){try{const d=await fetchJson(`${C.SCRIPT_URL}?action=track&order_id=${encodeURIComponent(id)}&phone=${encodeURIComponent(phone)}`);if(d?.success&&d.order){live=d.order;break}}catch{}}
    if(live){o={...o,...live};setOrders(getOrders().map(x=>x.order_id===id?{...x,...live}:x));draw(o)}
  }catch{}
  if(!o)draw({order_id:id,status:"Not found",items:"No record found.",total:0});
}

function startCancelCountdown(until){
  clearInterval(state.cancelTimer);
  const target=new Date(until).getTime();
  const update=()=>{const el=qs("#cancelTimer");if(!el)return;let r=target-Date.now();if(r<=0){el.textContent="Expired";clearInterval(state.cancelTimer);return}const h=Math.floor(r/3600000),m=Math.floor(r%3600000/60000),s=Math.floor(r%60000/1000);el.textContent=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`};
  update();state.cancelTimer=setInterval(update,1000);
}
async function cancelOrder(orderId,phone){
  if(!confirm("Are you sure you want to cancel this order?"))return;
  const {p11}=normalizePhone(phone);
  try{await fetch(C.SCRIPT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"cancel",order_id:orderId,phone:p11})})}catch{}
  setOrders(getOrders().map(o=>o.order_id===orderId?{...o,status:"Cancelled"}:o));
  toast("ORDER CANCELLED");renderOrderDetail();
}
window.cancelOrder=cancelOrder;

function fmtDate(d){try{return new Date(d).toLocaleString("en-BD",{dateStyle:"medium",timeStyle:"short"})}catch{return d||""}}

function toggleWishlist(id){
  const w=getWish(),i=w.indexOf(id);
  if(i>=0){w.splice(i,1);toast("REMOVED FROM WISHLIST")}else{w.push(id);toast("SAVED TO WISHLIST")}
  setWish(w);document.querySelectorAll(`[data-wish="${id}"]`).forEach(b=>{b.classList.toggle("active",w.includes(id));b.textContent=w.includes(id)?"♥":"♡"});
}
window.toggleWishlist=toggleWishlist;

function renderWishlist(){
  const ids=getWish(),list=PRODUCTS.filter(p=>ids.includes(p.id));
  renderCards(list,"#wishlistGrid");
}

function openQuickView(id){
  const p=productById(id),v=p.variants[0],box=qs("#quickView");if(!box)return;
  qs("#qvImg").src=v.cover;qs("#qvImg").alt=p.name;qs("#qvName").textContent=p.name;qs("#qvPrice").textContent=money(p.price);qs("#qvDesc").textContent=p.description;
  qs("#qvColours").innerHTML=p.variants.map(x=>`<button data-qv-img="${x.cover}">${x.name}</button>`).join("");
  document.querySelectorAll("[data-qv-img]").forEach(b=>b.addEventListener("click",()=>qs("#qvImg").src=b.dataset.qvImg));
  qs("#qvOpen").onclick=()=>openProduct(id);
  box.classList.add("open");document.body.classList.add("modal-open");
}
function closeQuickView(){qs("#quickView")?.classList.remove("open");document.body.classList.remove("modal-open")}
window.openQuickView=openQuickView;window.closeQuickView=closeQuickView;

function openLightbox(src){qs("#lightboxImg").src=src;qs("#lightbox").classList.add("open");document.body.classList.add("modal-open")}
function closeLightbox(){qs("#lightbox")?.classList.remove("open");document.body.classList.remove("modal-open")}
window.openLightbox=openLightbox;window.closeLightbox=closeLightbox;

function searchProducts(q){
  const box=qs("#searchResults"),term=q.trim().toLowerCase();if(!box)return;
  if(!term){box.innerHTML="";return}
  const m=PRODUCTS.filter(p=>p.name.toLowerCase().includes(term)||p.variants.some(v=>v.name.toLowerCase().includes(term)));
  box.innerHTML=m.length?m.map(p=>`<a class="search-result" href="product.html?id=${encodeURIComponent(p.id)}"><b>${p.name}</b><br><span class="muted" style="font-size:10px">${p.variants.map(v=>v.name).join(", ")}</span></a>`).join(""):'<div class="notice">NO MATCHING DROPS FOUND.</div>';
}
window.searchProducts=searchProducts;
function openSearch(){qs("#searchOverlay")?.classList.add("open");document.body.classList.add("modal-open");setTimeout(()=>qs("#searchInput")?.focus(),40)}
function closeSearch(){qs("#searchOverlay")?.classList.remove("open");document.body.classList.remove("modal-open")}
window.openSearch=openSearch;window.closeSearch=closeSearch;
function toggleMobileNav(){qs("#mainNav")?.classList.toggle("open")}
window.toggleMobileNav=toggleMobileNav;

function initCommon(){
  updateBagCount();updateProgress();initReveal();
  document.querySelectorAll("[data-search-open]").forEach(b=>b.addEventListener("click",openSearch));
  document.querySelectorAll("[data-search-close]").forEach(b=>b.addEventListener("click",closeSearch));
  qs("#searchInput")?.addEventListener("input",e=>searchProducts(e.target.value));
  qs("#lightbox")?.addEventListener("click",e=>{if(e.target.id==="lightbox")closeLightbox()});
  qs("#quickView")?.addEventListener("click",e=>{if(e.target.id==="quickView")closeQuickView()});
  addEventListener("keydown",e=>{if(e.key==="Escape"){closeSearch();closeLightbox();closeQuickView()}});
}

addEventListener("DOMContentLoaded",()=>{
  initCommon();
  const page=document.body.dataset.page;
  if(page==="home")renderHome();
  if(page==="shop")renderShop();
  if(page==="product"){
    const id=new URLSearchParams(location.search).get("id");if(id)state.productId=id;
    state.variantKey=productById(state.productId).variants[0].key;saveSelection();renderProduct();
  }
  if(page==="cart")renderCart();
  if(page==="checkout")renderCheckout();
  if(page==="orders"){
    const last=JSON.parse(localStorage.getItem("exora_last_order")||"null");
    if(last?.phone&&qs("#lookupPhone"))qs("#lookupPhone").value=last.phone;
    lookupOrders();
  }
  if(page==="order-detail")renderOrderDetail();
  if(page==="wishlist")renderWishlist();
  Motion.init();
});
})();
