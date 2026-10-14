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
export function catalogTable(families, snapshot) {
  const container=node('div',undefined,'catalog-table card');
  const table=node('table');
  table.setAttribute('aria-label','Evaluation catalog');
  const columns=['Benchmark family','What it measures','Creator organization(s)','Variants','ID/OOD','Implementation','Linked work'];
  const colgroup=node('colgroup');
  for(const width of [160,280,170,200,100,210,230]) {
    const col=node('col');col.style.width=`${width}px`;colgroup.append(col);
  }
  const head=node('thead'), header=node('tr');
  for(const title of columns){const th=node('th',title);th.scope='col';header.append(th);}
  head.append(header);table.append(colgroup,head);
  for(const f of [...families].sort((a,b)=>a.name.localeCompare(b.name))) {
    const body=node('tbody');
    f.variants.forEach((v,index)=>{
      const row=node('tr');
      const cell=(content,className)=>{
        const td=node('td',undefined,className);td.append(content);row.append(td);return td;
      };
      if(index===0) {
        for(const content of [familyLink(f),f.description,f.creators.join('; ')])cell(content).rowSpan=f.variants.length;
      }
      cell(link(v.name,`./benchmarks/${f.id}#${v.id}`),'variant-cell');
      cell(node('span',v.assignment || 'Unassigned','badge'),'assignment-cell');
      const implementations=node('div');
      for(const i of v.implementations) {
        const line=node('div',undefined,'implementation-entry');
        line.append(node('small',i.framework),node('span',i.status==='yes'?'Implemented':i.status==='no'?'Not implemented':'Unknown',`badge ${i.status}`));
        implementations.append(line);
      }
      cell(implementations,'implementation-cell');
      if(index===0)cell(workCell(f,snapshot)).rowSpan=f.variants.length;
      body.append(row);
    });
    table.append(body);
  }
  container.append(table);
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
