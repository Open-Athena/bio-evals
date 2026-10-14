import {createServer} from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';

const directory=resolve('dist'), artifacts=resolve('artifacts/browser');
await mkdir(artifacts,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try {
    const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(!path.startsWith('/bio-evals/')){res.writeHead(404).end();return;}
    let file=resolve(directory,path.slice('/bio-evals/'.length) || 'index.html');
    if(!file.startsWith(directory+'/')){res.writeHead(403).end();return;}
    try {if((await stat(file)).isDirectory())file+='/index.html';} catch {file+='.html';}
    const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'}).end(data);
  } catch {res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.SITE_URL || `http://127.0.0.1:${server.address().port}/bio-evals/`;
let browser;
let page;
const errors=[], failed=[];
try {
  browser=await chromium.launchPersistentContext('',{executablePath:process.env.CHROMIUM_PATH || '/home/exedev/.local/bin/chromium',headless:true,
    viewport:{width:1440,height:1000},
    args:['--disable-gpu','--disable-software-rasterizer','--use-gl=disabled','--no-zygote','--single-process','--renderer-process-limit=1','--js-flags=--max-old-space-size=96']});
  page=browser.pages()[0] || await browser.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400 && response.url().startsWith(base))failed.push(`${response.status()} ${response.url()}`);});
  assert.equal((await page.goto(base)).status(),200);
  await page.waitForSelector('.catalog-table tbody tr',{timeout:20000});
  assert.equal(await page.locator('.observablehq--error').count(),0,await page.locator('body').innerText());
  const search=page.getByLabel('Search evaluations');
  await search.fill('BixBench');
  await page.waitForFunction(()=>document.querySelector('.catalog-table tbody')?.textContent.includes('Verified-50'));
  assert.equal(await page.locator('.catalog-table tbody tr').count(),1);
  assert.match(await page.locator('.catalog-table').innerText(),/merged/);
  await page.getByLabel('Implementation',{exact:true}).selectOption({label:'Implemented'});
  await page.waitForFunction(()=>document.querySelector('.catalog-table tbody')?.querySelectorAll('.variant-cell').length===2);
  await page.getByLabel('Framework',{exact:true}).selectOption({label:'Evalchemy'});
  await page.waitForFunction(()=>document.querySelector('.catalog-table tbody')?.children.length===0);
  await page.getByLabel('Framework',{exact:true}).selectOption({label:'All frameworks'});
  await page.getByLabel('Implementation',{exact:true}).selectOption({label:'All states'});
  await search.fill('');
  await page.waitForFunction(()=>document.querySelector('.catalog-table tbody')?.children.length>1);
  await search.focus();await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(()=>document.activeElement?.tagName==='SELECT'));
  await page.screenshot({path:artifacts+'/catalog-desktop.png',fullPage:true});
  await search.fill('BixBench');
  await page.getByRole('link',{name:'BixBench',exact:true}).click();
  await page.waitForURL('**/benchmarks/bixbench');
  assert.equal(await page.locator('.variant-detail').count(),4);
  assert.match(await page.getByRole('link',{name:'Edit this entry'}).getAttribute('href'),/benchmarks\/bixbench.yaml$/);
  await page.locator('summary').first().click();
  assert.ok(await page.locator('details').first().getAttribute('open')!==null);
  await page.screenshot({path:artifacts+'/family-desktop.png',fullPage:true});
  await page.getByRole('link',{name:'← All evaluations'}).click();
  await page.waitForSelector('.catalog-table tbody tr');
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:artifacts+'/catalog-mobile.png',fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'Page should not overflow horizontally; table has its own scroll container');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('Browser checks passed: search, combined filters, work state, keyboard focus, family links, notes, mobile layout; screenshots in artifacts/browser.');
} catch(error) {
  console.error(JSON.stringify({errors,failed,body:await page?.locator('body').innerText().catch(()=>'' )}));
  await page?.screenshot({path:artifacts+'/failure.png',fullPage:true}).catch(()=>{});
  throw error;
} finally {
  await browser?.close();
  await new Promise(r=>server.close(r));
}
