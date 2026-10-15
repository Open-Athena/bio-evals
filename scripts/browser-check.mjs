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
  const launchBrowser=()=>chromium.launchPersistentContext('',{executablePath:process.env.CHROMIUM_PATH || '/home/exedev/.local/bin/chromium',headless:true,
    viewport:{width:1440,height:1000},
    args:process.env.GITHUB_ACTIONS?[]:['--disable-gpu','--disable-software-rasterizer','--use-gl=disabled','--no-zygote','--single-process','--renderer-process-limit=1','--js-flags=--max-old-space-size=96']});
  browser=await launchBrowser();
  page=browser.pages()[0] || await browser.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400 && response.url().startsWith(base))failed.push(`${response.status()} ${response.url()}`);});
  assert.equal((await page.goto(base)).status(),200);
  await page.waitForSelector('.catalog-table tbody tr',{timeout:20000});
  assert.equal(await page.locator('.observablehq--error').count(),0,await page.locator('body').innerText());
  for(let index=0;index<4;index++)assert.equal(await page.locator('.catalog-table tbody tr').nth(index).locator('.badge.yes').count(),1,'Implemented benchmarks sort first');
  assert.ok(!(await page.getByLabel('Implementation',{exact:true}).innerText()).includes('Unknown'));
  await page.getByLabel('Implementation',{exact:true}).selectOption({label:'Blocked'});
  await page.waitForFunction(()=>document.querySelector('.catalog-table tbody tr')?.textContent.includes('Blocked'));
  assert.equal(await page.locator('.catalog-table .badge.yes').count(),0);
  await page.getByLabel('Implementation',{exact:true}).selectOption({label:'In progress'});
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-table tbody tr').length===3);
  assert.equal(await page.locator('.catalog-table .badge.in_progress').count(),3);
  await page.getByLabel('Implementation',{exact:true}).selectOption({label:'All states'});
  const filterPositions=await page.locator('.filters > form').evaluateAll(forms=>forms.map(f=>f.getBoundingClientRect().top));
  assert.equal(filterPositions.length,3);
  assert.ok(Math.max(...filterPositions)-Math.min(...filterPositions)<2,'Desktop filters share one row');
  await page.waitForFunction(()=>document.querySelector('.status-chart svg')?.getAttribute('aria-label')?.includes('Implemented 4'));
  assert.match(await page.locator('.status-chart svg').getAttribute('aria-label'), /Implemented 4/);
  const search=page.getByLabel('Search evaluations');
  await search.fill('BixBench');
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-table tbody tr').length===1 && document.querySelector('.catalog-table tbody')?.textContent.includes('BixBench v1.5'));
  await page.waitForFunction(()=>document.querySelector('.status-chart svg')?.getAttribute('aria-label')?.includes('Implemented 1'));
  assert.match(await page.locator('.framework-chart svg').getAttribute('aria-label'), /Harbor 1/);
  assert.equal(await page.locator('.catalog-table tbody').count(),1);
  assert.equal(await page.locator('.catalog-table tbody tr').count(),1);
  for(const title of ['Benchmark','Organization','What it measures','ID/OOD','Framework','Implementation','Version','Linked work']) {
    assert.equal(await page.getByRole('columnheader',{name:title,exact:false}).count(),1);
  }
  await search.fill('MMLU');
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-table tbody tr').length===3);
  const variantHeader=page.getByRole('columnheader',{name:'Version',exact:false});
  await variantHeader.click();
  const ascending=await page.locator('.variant-cell').allTextContents();
  await variantHeader.click();
  const descending=await page.locator('.variant-cell').allTextContents();
  assert.deepEqual(descending,[...ascending].reverse(),'Native column sorting reverses variant order');
  await search.fill('BixBench');
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-table tbody tr').length===1);
  assert.match(await page.locator('.catalog-table').innerText(),/merged/);
  await page.getByLabel('Implementation',{exact:true}).selectOption({label:'Implemented'});
  await page.waitForFunction(()=>document.querySelector('.catalog-table tbody')?.querySelectorAll('.variant-cell').length===1);
  await page.getByLabel('Framework',{exact:true}).selectOption({label:'Evalchemy'});
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-table tbody tr').length===0);
  await page.waitForFunction(()=>document.querySelector('.status-chart svg')?.getAttribute('aria-label')?.includes('Implemented 0'));
  await page.getByLabel('Framework',{exact:true}).selectOption({label:'All frameworks'});
  await page.getByLabel('Implementation',{exact:true}).selectOption({label:'All states'});
  await search.fill('');
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-table tbody tr').length>4);
  for(let attempt=0;attempt<5 && await page.locator('.catalog-table tbody tr').count()<95;attempt++) {
    const before=await page.locator('.catalog-table tbody tr').count();
    await page.locator('.catalog-table form').evaluate(form=>{form.scrollTop=form.scrollHeight;});
    await page.waitForFunction(n=>document.querySelectorAll('.catalog-table tbody tr').length>n,before);
  }
  assert.equal(await page.locator('.catalog-table tbody tr').count(),95,'All catalog benchmarks are reachable by scrolling');
  await page.locator('.catalog-table form').evaluate(form=>{form.scrollTop=0;});
  await search.focus();await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(()=>document.activeElement?.tagName==='SELECT'));
  await page.screenshot({path:artifacts+'/catalog-desktop.png',fullPage:true});
  await search.fill('BixBench');
  await page.getByRole('link',{name:'BixBench',exact:true}).first().click();
  await page.waitForURL('**/benchmarks/bixbench');
  assert.equal(await page.locator('.variant-detail').count(),1);
  assert.equal(await page.locator('.variant-notes details').count(),3);
  assert.match(await page.locator('.variant-notes').innerText(),/Verified-50/);
  assert.match(await page.getByRole('link',{name:'Edit this entry'}).getAttribute('href'),/benchmarks\/bixbench.yaml$/);
  await page.locator('.variant-detail summary').first().click();
  assert.ok(await page.locator('.variant-detail details').first().getAttribute('open')!==null);
  await page.screenshot({path:artifacts+'/family-desktop.png',fullPage:true});
  await page.getByRole('link',{name:'← All evaluations'}).click();
  await page.waitForSelector('.catalog-table tbody tr');
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:artifacts+'/catalog-mobile.png',fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'Page should not overflow horizontally; table has its own scroll container');
  // Exercise every option in the original multi-example collections.
  for(const benchmark of ['mmlu','bixbench','scicode','scienceagentbench','genebench']) {
    await browser.close();
    browser=await launchBrowser();page=browser.pages()[0] || await browser.newPage();
    page.setDefaultTimeout(20000);
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400 && response.url().startsWith(base))failed.push(`${response.status()} ${response.url()}`);});
    await page.setViewportSize({width:390,height:844});
    await page.goto(`${base}benchmarks/${benchmark}`);
    await page.waitForSelector('.task-example h3');
    const picker=page.getByLabel('Example task');
    const options=await picker.locator('option').evaluateAll(xs=>xs.map(x=>x.value));
    assert.equal(options.length,3);
    for(const value of options) {
      await picker.selectOption(value);
      assert.ok((await page.locator('.task-prompt').innerText()).length>60);
      assert.ok(await page.locator('.task-source a').count()>0);
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),`${benchmark} mobile overflow`);
    if(benchmark==='mmlu') {
      assert.equal(await page.locator('.task-choices li').count(),4);
      const answer=page.locator('.task-example details').filter({has:page.getByText('Reveal reference answer',{exact:true})});
      assert.equal(await answer.getAttribute('open'),null);
      await answer.locator('summary').click();assert.notEqual(await answer.getAttribute('open'),null);
    }
    if(benchmark==='genebench')assert.ok(await page.locator('.task-example .hljs-attr').count()>0);
    if(benchmark==='scicode')assert.ok(await page.locator('.task-example .hljs-keyword').count()>0);
  }
  await page.screenshot({path:artifacts+'/example-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${base}benchmarks/scicode`);await page.waitForSelector('.task-example h3');
  await page.screenshot({path:artifacts+'/example-desktop.png',fullPage:true});
  // Fresh contexts bound memory while covering the newly supported formats.
  for(const benchmark of ['microvqa','mmmu','bioreasonbench','genomeqa','biology-instructions','naturebench','biomnibench-da','lifescibench']) {
    await browser.close();browser=await launchBrowser();page=browser.pages()[0] || await browser.newPage();
    page.setDefaultTimeout(20000);
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400 && response.url().startsWith(base))failed.push(`${response.status()} ${response.url()}`);});
    await page.setViewportSize({width:390,height:844});
    await page.goto(`${base}benchmarks/${benchmark}`);
    await page.waitForSelector('#task-examples');
    assert.equal(await page.getByLabel('Example task',{exact:true}).count(),0,'Single examples and gaps need no picker');
    if(['microvqa','mmmu','bioreasonbench'].includes(benchmark)) {
      await page.locator('[data-task-image]').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>[...document.querySelectorAll('[data-task-image]')].every(img=>img.complete && img.naturalWidth>0));
      assert.ok((await page.locator('[data-task-image]').getAttribute('src')).includes('/_file/assets/task-examples/'));
      await page.screenshot({path:`${artifacts}/${benchmark}-mobile.png`,fullPage:true});
    }
    if(benchmark==='genomeqa')assert.equal(await page.locator('.task-choices li').count(),2);
    if(['biomnibench-da','lifescibench'].includes(benchmark)) {
      assert.equal(await page.locator('.task-example').count(),0);
      assert.ok((await page.locator('.task-availability').innerText()).length>30);
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),`${benchmark} mobile overflow`);
  }
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
