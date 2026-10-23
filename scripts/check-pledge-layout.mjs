import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const api=JSON.parse(await readFile('src/config/pledge-api.json','utf8')).url;
const base=process.env.CHECK_URL || 'http://127.0.0.1:4180';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true});
const checks=[];
await mkdir('/tmp/patriot-paper-layout',{recursive:true});
try {
 for(const path of ['/','/action']) for(const width of [390,1440]) {
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
  let count=0,payload=null,notifications=0;
  await context.route(`${api}/**`,route=>{
   if(route.request().url().endsWith('/pledges')) {payload=route.request().postDataJSON();count=1;return route.fulfill({json:{accepted:true}})}
   return route.fulfill({json:{counties:count?{'48381':1}:{},states:count?{TX:1}:{},total:count,countiesRepresented:count,asOf:new Date().toISOString(),updatedAt:null}});
  });
  await context.route('https://api.emailjs.com/**',route=>{notifications++;return route.fulfill({status:200,body:'OK'})});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+path,{waitUntil:'networkidle'});
  await page.locator('#pledge-map svg[role=group]').waitFor();
  const order=await page.evaluate(()=>{
   const root=document.querySelector('.home-page,.toolkit-page');
   return [...root.children].map(n=>n.id || (n.querySelector('.page-header')?'hero':'other'));
  });
  assert.deepEqual(order.slice(0,3),['hero','pledge-map','pledge']);
  assert.equal(await page.locator('#pledge form').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('#pledge-map a[href$="#pledge"]').click();
  assert.equal(new URL(page.url()).pathname,path);
  const form=page.locator('#pledge form');
  await form.locator('input[autocomplete=name]').fill('Layout Verification');
  await form.locator('input[autocomplete=email]').fill('layout@example.invalid');
  const selects=form.locator('select');
  await selects.nth(0).selectOption('TX');await selects.nth(1).selectOption('48381');
  await selects.nth(0).selectOption('OR');assert.equal(await selects.nth(1).inputValue(),'');
  await selects.nth(0).selectOption('TX');await selects.nth(1).selectOption('48381');
  await form.locator('input[name=agreePrivacyPolicy]').check();
  await form.getByRole('button',{name:'Join pledge'}).click();
  await page.waitForFunction(()=>document.querySelector('#pledge input[autocomplete=name]').value==='');
  assert.equal(payload.countyFips,'48381');assert.equal(payload.state,'TX');assert.equal(payload.agreePrivacyPolicy,true);assert.equal(notifications,1);
  assert.equal(await page.locator('#pledge-map .pledge-stats dd').first().textContent(),'1');
  assert.deepEqual(errors,[]);
  await page.locator('#pledge').scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/patriot-paper-layout/${path==='/'?'home':'action'}-${width}.png`});
  checks.push({path,width,order:order.slice(0,3),form:'existing storage and email flow preserved; mocked submission refreshed map'});
  await context.close();
 }
 await writeFile('docs/pledge-layout-check.json',JSON.stringify({base,at:new Date().toISOString(),checks},null,2)+'\n');
 console.log(JSON.stringify(checks,null,2));
} finally {await browser.close()}
