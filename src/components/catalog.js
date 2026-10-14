export function selectedVersion(benchmark) {
  return benchmark.variants.find(v=>v.id===benchmark.selected_variant) || (benchmark.variants.length===1?benchmark.variants[0]:undefined);
}
export function trackedCatalog(benchmarks) {
  return benchmarks.map(b=>({...b, variants:[selectedVersion(b)]}));
}

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
const implementationLabel = status => status==='yes'?'Implemented':status==='no'?'Not implemented':'Unknown';
export function catalogTable(families, snapshot, Inputs) {
  // Primitive column values let native Inputs.table sort the displayed content.
  const rows=families.flatMap(f=>f.variants.map(v=>({
    name:f.name, description:f.description, creators:f.creators.join('; '),
    variant:v.name, assignment:v.assignment || 'Unassigned',
    implementation:v.implementations.map(i=>`${implementationLabel(i.status)} (${i.framework})`).join('; '),
    work:v.work.map(url=>snapshot.items[url]?.title || url).join('; ') || 'No linked work',
    family:f, detail:v
  })));
  const container=node('div',undefined,'catalog-table card');
  container.append(Inputs.table(rows, {
    columns:['name','description','creators','variant','assignment','implementation','work'],
    header:{name:'Benchmark',description:'What it measures',creators:'Creator organization(s)',variant:'Version',assignment:'ID/OOD',implementation:'Implementation',work:'Linked work'},
    format:{
      name:(_,i)=>familyLink(rows[i].family),
      variant:(_,i)=>{
        const {family:f,detail:v}=rows[i];
        const a=link(v.name,`./benchmarks/${f.id}#${v.id}`);a.className='variant-cell';return a;
      },
      assignment:value=>node('span',value,'badge'),
      implementation:(_,index)=>{
        const container=node('div');
        for(const i of rows[index].detail.implementations) {
          const line=node('div',undefined,'implementation-entry');
          line.append(node('small',i.framework),node('span',implementationLabel(i.status),`badge ${i.status}`));
          container.append(line);
        }
        return container;
      },
      work:(_,i)=>workCell({variants:[rows[i].detail]},snapshot)
    },
    width:{name:160,description:280,creators:170,variant:200,assignment:100,implementation:210,work:230},
    rows:15,maxHeight:1100,select:false,sort:'implementation'
  }));
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
