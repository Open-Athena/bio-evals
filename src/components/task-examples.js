export function taskExamples(collection, Inputs) {
  const root=document.createElement('section');root.className='task-examples card';root.id='task-examples';
  const heading=document.createElement('h2');heading.textContent='Example tasks';root.append(heading);
  const intro=document.createElement('p');intro.className='muted';intro.textContent=collection.selection;root.append(intro);
  const picker=Inputs.select(collection.examples,{label:'Example task',format:e=>`${e.id} · ${e.title}`});root.append(picker);
  const content=document.createElement('article');content.className='task-example';root.append(content);
  // HTML is produced at build time by the renderer with raw source HTML disabled.
  const update=()=>{content.innerHTML=picker.value.html;};picker.addEventListener('input',update);update();
  const credit=document.createElement('p');credit.className='muted';credit.textContent=`${collection.attribution} License: ${collection.license}. Source checked ${collection.checked_at}.`;const license=document.createElement('a');license.href='https://github.com/Open-Athena/bio-evals/tree/main/data/task-examples#readme';license.textContent=' Attribution and license details';credit.append(license);root.append(credit);
  return root;
}
