import {createServer} from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {loadCatalog} from './catalog.mjs';
import {loadExamples} from './task-examples.mjs';
import {selectedVersion,trackedCatalog,filterCatalog,implementationLabel} from '../src/components/catalog.js';

const catalog=await loadCatalog();
const entriesWithStatus=status=>catalog.filter(b=>selectedVersion(b).implementations.some(i=>i.status===status));
const implementedCount=entriesWithStatus('yes').length;
const examples=await loadExamples(catalog);

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
  const theme=page.getByLabel('Color theme');
  const scheme=()=>page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme);
  assert.equal(await theme.inputValue(),'system');
  await page.emulateMedia({colorScheme:'dark'});
  assert.equal(await scheme(),'dark');
  await theme.selectOption('light');
  assert.equal(await scheme(),'light');
  await page.reload();
  assert.equal(await theme.inputValue(),'light');
  assert.equal(await scheme(),'light');
  await page.emulateMedia({colorScheme:'light'});
  await theme.selectOption('dark');
  assert.equal(await scheme(),'dark');
  await page.goto(base+'benchmarks/'+catalog[0].id);
  assert.equal(await theme.inputValue(),'dark','Preference survives benchmark navigation');
  assert.equal(await scheme(),'dark');
  await theme.selectOption('system');
  assert.equal(await scheme(),'light');
  await page.emulateMedia({colorScheme:'dark'});
  assert.equal(await scheme(),'dark');
  await page.emulateMedia({colorScheme:'light'});
  await page.goto(base);
  await page.waitForSelector('.catalog-table tbody tr');
  for(let index=0;index<implementedCount;index++)assert.ok(await page.locator('.catalog-table tbody tr').nth(index).locator('.badge.yes').count()>0,'Implemented benchmarks sort first');
  assert.ok(!(await page.getByLabel('Implementation',{exact:true}).innerText()).includes('Unknown'));
  // Derive expectations from input data, never from particular benchmark states.
  for(const status of ['yes','in_progress','blocked','no']) {
    await page.getByLabel('Implementation',{exact:true}).selectOption({label:implementationLabel(status)});
    const expected=entriesWithStatus(status);
    await page.waitForFunction(({count,status})=>{
      const rows=[...document.querySelectorAll('.catalog-table tbody tr')];
      return count===0?rows.length===0:rows.length>0 && rows.every(r=>r.querySelector(`.badge.${status}`));
    },{count:expected.length,status});
  }
  await page.getByLabel('Implementation',{exact:true}).selectOption({label:'All states'});
  const search=page.getByLabel('Search evaluations');
  const sample=catalog[0];
  await search.fill(sample.name);
  const matches=filterCatalog(trackedCatalog(catalog),sample.name);
  await page.waitForFunction(name=>document.querySelector('.catalog-table tbody')?.textContent.includes(name),sample.name);
  const visible=await page.locator('.catalog-table tbody tr').evaluateAll(rows=>rows.map(row=>row.querySelector('a').textContent));
  assert.ok(visible.every(name=>matches.some(b=>b.name===name)));
  await search.fill('no-match-synthetic-query-928174');
  await page.waitForFunction(()=>document.querySelectorAll('.catalog-table tbody tr').length===0);
  await search.fill('');
  await page.waitForSelector('.catalog-table tbody tr');
  for(let attempt=0;attempt<catalog.length && await page.locator('.catalog-table tbody tr').count()<catalog.length;attempt++) {
    const before=await page.locator('.catalog-table tbody tr').count();
    await page.locator('.catalog-table form').evaluate(form=>{form.scrollTop=form.scrollHeight;});
    await page.waitForFunction(n=>document.querySelectorAll('.catalog-table tbody tr').length>n,before);
  }
  assert.equal(await page.locator('.catalog-table tbody tr').count(),catalog.length);
  await search.focus();await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(()=>document.activeElement?.tagName==='SELECT'));
  await page.screenshot({path:artifacts+'/catalog-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:artifacts+'/catalog-mobile.png',fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
  await page.goto(`${base}benchmarks/${sample.id}`);
  assert.equal(await page.locator('.variant-detail').count(),1);
  assert.equal(await page.locator('.variant-notes details').count(),sample.variants.length-1);
  assert.ok((await page.getByRole('link',{name:'Edit this entry'}).getAttribute('href')).endsWith(`/benchmarks/${sample.id}.yaml`));
  // Select representative rendering shapes dynamically, without requiring specific entries.
  const collections=[...examples.values()];
  const samples=[
    collections.find(c=>c.examples.length>1),
    collections.find(c=>c.examples.length===1),
    collections.find(c=>c.assets.length),
    collections.find(c=>!c.examples.length)
  ].filter(Boolean);
  for(const c of new Set(samples)) {
    await browser.close();browser=await launchBrowser();page=browser.pages()[0] || await browser.newPage();
    page.setDefaultTimeout(20000);
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400 && response.url().startsWith(base))failed.push(`${response.status()} ${response.url()}`);});
    await page.setViewportSize({width:390,height:844});
    await page.goto(`${base}benchmarks/${c.benchmark}`);
    await page.waitForSelector('#task-examples');
    if(!c.examples.length) {
      await page.waitForSelector('.task-availability');
      assert.equal(await page.locator('.task-example').count(),0);
    } else {
      await page.waitForSelector('.task-example h3');
      const picker=page.getByLabel('Example task',{exact:true});
      assert.equal(await picker.count(),c.examples.length>1?1:0);
      if(c.examples.length>1) {
        const options=await picker.locator('option').evaluateAll(xs=>xs.map(x=>x.value));
        assert.equal(options.length,c.examples.length);
        for(const value of options) {
          await picker.selectOption(value);
          assert.ok(await page.locator('.task-source a').count()>0);
        }
      }
      for(const img of await page.locator('[data-task-image]').all())await img.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>[...document.querySelectorAll('[data-task-image]')].every(img=>img.complete && img.naturalWidth>0));
      const answer=page.locator('.task-example details').filter({has:page.getByText('Reveal reference answer',{exact:true})});
      if(await answer.count()) {
        assert.equal(await answer.getAttribute('open'),null);
        await answer.locator('summary').click();assert.notEqual(await answer.getAttribute('open'),null);
      }
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2));
    await page.screenshot({path:`${artifacts}/${c.benchmark}-mobile.png`,fullPage:true});
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('Browser checks passed: search, status filters, keyboard focus, family links, notes, examples, mobile layout; screenshots in artifacts/browser.');
} catch(error) {
  console.error(JSON.stringify({errors,failed,body:await page?.locator('body').innerText().catch(()=>'' )}));
  await page?.screenshot({path:artifacts+'/failure.png',fullPage:true}).catch(()=>{});
  throw error;
} finally {
  await browser?.close();
  await new Promise(r=>server.close(r));
}
