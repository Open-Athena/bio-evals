(() => {
  const key='bio-evals-theme';
  const valid=value=>['system','light','dark'].includes(value)?value:'system';
  const apply=value=>{
    const mode=valid(value);
    document.documentElement.dataset.theme=mode;
    const picker=document.getElementById('theme-preference');
    if(picker)picker.value=mode;
  };
  let saved='system';
  try {saved=localStorage.getItem(key);} catch {}
  apply(saved);
  document.addEventListener('DOMContentLoaded',()=>{
    const picker=document.getElementById('theme-preference');
    if(!picker)return;
    picker.value=document.documentElement.dataset.theme;
    picker.addEventListener('change',()=>{
      apply(picker.value);
      try {localStorage.setItem(key,picker.value);} catch {}
    });
  });
  window.addEventListener('storage',event=>{
    if(event.key===key || event.key===null)apply(event.newValue);
  });
})();
