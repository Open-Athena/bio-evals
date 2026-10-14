import {readFile, writeFile, rename} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {pathToFileURL} from 'node:url';
import {loadCatalog, linkedWork, root, workPattern} from './catalog.mjs';

const run = promisify(execFile);
export class ApiError extends Error {
  constructor(status) { super(`GitHub request failed (${status})`); this.status=status; }
}
export async function request(path) {
  if (process.argv.includes('--gh')) {
    try {
      const {stdout}=await run('gh',['api','--hostname','github.com',path],{timeout:20000,maxBuffer:2*1024*1024});
      return JSON.parse(stdout);
    } catch { throw new ApiError('unavailable'); }
  }
  const token=process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const response=await fetch(`https://api.github.com/${path}`,{
    headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',
      ...(token?{Authorization:`Bearer ${token}`}:{})}, signal:AbortSignal.timeout(20000)
  });
  if(!response.ok)throw new ApiError(response.status);
  return response.json();
}

export async function refresh(urls, previous={items:{}}, api=request, now=new Date().toISOString()) {
  const items={}, repositories=new Map();
  let successes=0, limited=false;
  for(const url of [...new Set(urls)].sort()) {
    const match=url.match(workPattern);
    if(!match)throw new Error(`Invalid work URL: ${url}`);
    const [,owner,repo,type,number]=match, repository=`${owner}/${repo}`;
    let publicVerified=repositories.get(repository)===true;
    try {
      if(limited)throw new ApiError(429);
      if(!repositories.has(repository)) {
        const result=await api(`repos/${repository}`);
        repositories.set(repository, result.private===false);
      }
      if(!repositories.get(repository)) {
        items[url]={url,error:'Repository is not public',fetched_at:null,stale:false};
        continue;
      }
      publicVerified=true;
      const item=await api(`repos/${repository}/${type==='pull'?'pulls':'issues'}/${number}`);
      if(!['open','closed'].includes(item.state)||typeof item.title!=='string'||item.number!==Number(number))throw new ApiError('invalid response');
      items[url]={url,kind:type==='pull'?'pr':'issue',number:Number(number),title:item.title,
        state:type==='pull'?(item.merged_at?'merged':item.state==='closed'?'closed':item.draft?'draft':'open'):item.state,
        assignees:(item.assignees || []).map(a=>a.login).filter(a=>typeof a==='string'),
        updated_at:item.updated_at, fetched_at:now,stale:false,error:null};
      successes++;
    } catch(error) {
      limited ||= error.status===403 || error.status===429;
      // Never copy API bodies or authentication errors into public artifacts.
      const message=error instanceof ApiError?error.message:'GitHub request unavailable';
      const old=previous.items?.[url];
      items[url]=publicVerified && old?.fetched_at && ![404,410].includes(error.status)
        ? {...old,stale:true,error:message}
        : {url,error:message,fetched_at:null,stale:false};
    }
  }
  const retained=Object.values(items).filter(i=>i.fetched_at).length;
  return {schema_version:1,attempted_at:now,last_successful_fetch_at:successes?now:previous.last_successful_fetch_at || null,
    complete:Object.values(items).every(i=>!i.error),items,usable:!urls.length || retained>0};
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const path=new URL('data/github-status.json',root);
  let previous={items:{}};
  try {previous=JSON.parse(await readFile(path,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  const snapshot=await refresh(linkedWork(await loadCatalog()),previous);
  if(!snapshot.usable)throw new Error('No usable GitHub status snapshot; preserving previous file and deployment.');
  const temp=new URL('data/github-status.json.tmp',root);
  await writeFile(temp,JSON.stringify(snapshot,null,2)+'\n');
  await rename(temp,path);
  console.log(`GitHub snapshot: ${Object.keys(snapshot.items).length} linked items; complete=${snapshot.complete}`);
}
