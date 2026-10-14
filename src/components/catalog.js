export function filterCatalog(families, query='', framework='All frameworks', status='All states') {
  const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return families.flatMap(f=>{
    const common=[f.name,f.description,...f.creators,...f.notes].join(' ').toLowerCase();
    const variants=f.variants.filter(v=>{
      const text=[common,v.name,v.description,...v.creators,...v.notes,v.assignment || ''].join(' ').toLowerCase();
      return words.every(w=>text.includes(w)) && v.implementations.some(i=>
        (framework==='All frameworks'||i.framework===framework) && (status==='All states'||i.status===status));
    });
    return variants.length?[{...f,variants}]:[];
  });
}

function node(tag,text,className) {
  const element=document.createElement(tag);
  if(text!==undefined)element.textContent=text;
  if(className)element.className=className;
  return element;
}
function link(label,href){const a=node('a',label);a.href=href;return a;}
export function familyLink(f){return link(f.name,`./benchmarks/${f.id}`);}
export function variantCell(f) {
  const container=node('div');
  for(const v of f.variants){
    const block=node('div',undefined,'variant-cell');
    block.append(link(v.name,`./benchmarks/${f.id}#${v.id}`));
    const line=node('small');
    line.append(node('span',v.assignment || 'Unassigned','badge'),' ');
    for(const i of v.implementations){line.append(` ${i.framework}: `,node('span',i.status==='yes'?'Implemented':i.status==='no'?'Not implemented':'Unknown',`badge ${i.status}`));}
    block.append(line);container.append(block);
  }
  return container;
}
export function workCell(f,snapshot) {
  const urls=[...new Set(f.variants.flatMap(v=>v.work))];
  if(!urls.length)return node('span','No linked work','muted');
  const list=node('ul',undefined,'work-list');
  for(const url of urls){
    const item=snapshot.items[url];
    const li=node('li');
    const short=url.split('/').slice(3).join('/');
    li.append(link(item?.title || short,url));
    const meta=node('small',undefined,'muted');
    meta.append(' ',node('span',item?.state || 'Unavailable',`badge ${item?.state || ''}`));
    if(item?.assignees?.length)meta.append(` · ${item.assignees.map(a=>'@'+a).join(', ')}`);
    if(item?.stale)meta.append(' · stale');
    li.append(meta);list.append(li);
  }
  return list;
}
