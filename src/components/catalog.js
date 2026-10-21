export function selectedVersion(benchmark) {
  return benchmark.variants.find(v=>v.id===benchmark.selected_variant) || (benchmark.variants.length===1?benchmark.variants[0]:undefined);
}
export function trackedCatalog(benchmarks) {
  return benchmarks.map(b=>({...b, variants:[selectedVersion(b)]}));
}

export function filterCatalog(families, query='', framework='All frameworks', status='All states', assignment='All ID/OOD') {
  const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return families.flatMap(f=>{
    const common=[f.name,f.description,...f.creators,...f.notes].join(' ').toLowerCase();
    const variants=f.variants.filter(v=>{
      const text=[common,v.name,v.description,...v.creators,...v.notes,v.assignment || ''].join(' ').toLowerCase();
      return words.every(w=>text.includes(w)) &&
        (assignment==='All ID/OOD'||(v.assignment || 'Unassigned')===assignment) && v.implementations.some(i=>
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
export const implementationLabel = status => ({yes:'Implemented',in_progress:'In progress',no:'To do',blocked:'Blocked'})[status];
const implementationRank = status => ({yes:0,in_progress:1,no:2,blocked:3})[status];
export function catalogColors(Plot) {
  const palette=Plot.scale({color:{type:'categorical',scheme:'Observable10',domain:Array.from({length:10},(_,i)=>i)}});
  return {category:'var(--catalog-category-fill)',yes:palette.apply(4),
    in_progress:palette.apply(0),blocked:palette.apply(2),no:'var(--theme-foreground-muted)'};
}
const categoryColor = (key,colors) => colors[key] || 'var(--theme-foreground-muted)';
function categoryBadge(label,key,className,colors) {
  const badge=node('span',undefined,`badge category-badge ${className}`);
  const swatch=node('span',undefined,'category-swatch');
  swatch.style.backgroundColor=categoryColor(key,colors);swatch.setAttribute('aria-hidden','true');
  badge.append(swatch,document.createTextNode(label));return badge;
}
export function catalogTable(families, snapshot, Inputs, colors={}) {
  // Primitive column values let native Inputs.table sort the displayed content.
  const rows=families.flatMap(f=>f.variants.map(v=>({
    name:f.name, description:f.description, creators:f.creators.join('; '),
    framework:v.implementations.map(i=>i.framework).join('; '),
    variant:v.name, assignment:v.assignment || 'Unassigned',
    implementation:v.implementations.map(i=>`${implementationRank(i.status)} ${implementationLabel(i.status)}`).sort().join('; '),
    work:v.work.map(url=>snapshot.items[url]?.title || url).join('; ') || 'No linked work',
    family:f, detail:v
  })));
  const container=node('div',undefined,'catalog-table card');
  container.append(Inputs.table(rows, {
    columns:['name','creators','description','assignment','framework','implementation','variant','work'],
    header:{name:'Benchmark',description:'What it measures',creators:'Organization',variant:'Version',assignment:'ID/OOD',framework:'Framework',implementation:'Implementation',work:'Linked work'},
    format:{
      name:(_,i)=>familyLink(rows[i].family),
      variant:(_,i)=>{
        const {family:f,detail:v}=rows[i];
        const a=link(v.name,`./benchmarks/${f.id}#${v.id}`);a.className='variant-cell';return a;
      },
      implementation:(_,index)=>{
        const container=node('div');
        for(const i of rows[index].detail.implementations) {
          const line=node('div',undefined,'implementation-entry');
          line.append(categoryBadge(implementationLabel(i.status),i.status,i.status,colors));
          if(i.assessment) {
            const details=node('details',undefined,'status-reason');
            details.append(node('summary','Status details'),node('p',i.assessment.reason));
            for(const source of i.assessment.sources)details.append(link(source.label,source.url),node('br'));
            details.append(node('small',`Checked ${i.assessment.checked_at}`));
            line.append(details);
          }
          container.append(line);
        }
        return container;
      },
      work:(_,i)=>workCell({variants:[rows[i].detail]},snapshot)
    },
    width:{name:160,description:280,creators:170,variant:200,assignment:80,framework:110,implementation:190,work:230},
    rows:Math.max(1,rows.length),maxHeight:1100,select:false,sort:'implementation'
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
    meta.append(' ',node('span',item?.state || 'Unavailable','badge'));
    if(item?.assignees?.length)meta.append(` · ${item.assignees.map(a=>'@'+a).join(', ')}`);
    if(item?.stale)meta.append(' · stale');
    li.append(meta);list.append(li);
  }
  return list;
}

// Count benchmarks once per category, even if future entries have multiple integrations.
export function catalogCounts(benchmarks, field, domain) {
  return domain.map(key=>({key, label:field==='status'?implementationLabel(key):key,
    count:benchmarks.filter(b=>b.variants.some(v=>field==='assignment'
      ? (v.assignment || 'Unassigned')===key
      : v.implementations.some(i=>i[field]===key))).length}));
}
export function countChart(data, Plot, width, label, colors=catalogColors(Plot), colorByStatus=false) {
  return Plot.plot({width, height:170, marginLeft:100, marginRight:32, marginTop:8, marginBottom:30,
    ariaLabel:`${label}: ${data.map(d=>`${d.label} ${d.count}`).join(', ')}`,
    x:{domain:[0,Math.max(1,...data.map(d=>d.count))], label:'Benchmarks', grid:true, ticks:4, tickFormat:d=>Number.isInteger(d)?d:''},
    y:{domain:data.map(d=>d.label), label:null},
    marks:[Plot.barX(data,{x:'count',y:'label',fill:colorByStatus?d=>categoryColor(d.key,colors):colors.category,insetTop:5,insetBottom:5}),
      Plot.text(data,{x:'count',y:'label',text:d=>String(d.count),textAnchor:'start',dx:5}),Plot.ruleX([0])]
  });
}
