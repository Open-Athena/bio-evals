export function taskExamples(collection, Inputs, assets={}) {
  const root=document.createElement('section');root.className='task-examples card';root.id='task-examples';
  const heading=document.createElement('h2');heading.textContent='Example tasks';root.append(heading);
  const intro=document.createElement('p');intro.className='muted';intro.textContent=collection.selection;root.append(intro);
  if(!collection.examples.length) {
    const notice=document.createElement('p');notice.className='task-availability';notice.textContent=collection.availability.reason;root.append(notice);
    const links=document.createElement('ul');
    for(const source of collection.availability.sources) {
      const item=document.createElement('li'),a=document.createElement('a');a.href=source.url;a.textContent=source.label;item.append(a);links.append(item);
    }
    root.append(links);
  } else {
  const picker=collection.examples.length>1?Inputs.select(collection.examples,{label:'Example task',format:e=>`${e.id} · ${e.title}`}):null;if(picker)root.append(picker);
  const content=document.createElement('article');content.className='task-example';root.append(content);
  // HTML is produced at build time by the renderer with raw source HTML disabled.
  const update=()=>{
    content.innerHTML=(picker?.value||collection.examples[0]).html;
    for(const img of content.querySelectorAll('[data-task-image]'))img.src=assets[img.dataset.taskImage];
    for(const a of content.querySelectorAll('[data-task-image-link]'))a.href=assets[a.dataset.taskImageLink];
  };picker?.addEventListener('input',update);update();
  }
  const credit=document.createElement('p');credit.className='muted';credit.textContent=`${collection.attribution} License: ${collection.license}. Source checked ${collection.checked_at}.`;const license=document.createElement('a');license.href='https://github.com/Open-Athena/bio-evals/tree/main/data/task-examples#readme';license.textContent=' Attribution and license details';credit.append(license);root.append(credit);
  return root;
}
