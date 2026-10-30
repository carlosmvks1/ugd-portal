export function initShell(){
  const toggle=document.querySelector('#nav-toggle');
  const nav=document.querySelector('#site-nav');
  if(!toggle||!nav)return;

  const setOpen=open=>{
    toggle.setAttribute('aria-expanded',String(open));
    nav.dataset.open=open?'true':'false';
    toggle.querySelector('.sr-only').textContent=open?'Cerrar navegación':'Abrir navegación';
  };

  toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
  window.addEventListener('resize',()=>{if(innerWidth>850)setOpen(false);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setOpen(false);toggle.focus();}});
}
