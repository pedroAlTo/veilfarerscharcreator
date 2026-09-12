export function setupBookIllustrations(){
  const dialog=document.querySelector('[data-book-dialog]');
  if(!dialog||typeof dialog.showModal!=='function')return null;
  document.querySelectorAll('[data-book-art]').forEach(link=>link.addEventListener('click',event=>{
    if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    const img=dialog.querySelector('img');img.src=link.href;img.alt=link.querySelector('img').alt;
    dialog.querySelector('h2').textContent=link.dataset.title;
    dialog.querySelector('footer a').href=link.href;
    dialog.showModal();
  }));
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  return dialog;
}
