import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
await mkdir('/tmp/patriot-review', {recursive:true});
const kind = 'paper';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  let payload, fail=false, requests=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**.execute-api.us-west-2.amazonaws.com/**',async route=>{
   const url=new URL(route.request().url());
   if(url.pathname==='/counts')return route.fulfill({json:{counties:{'48381':90,'48375':4},total:94,asOf:new Date().toISOString()}});
   if(url.pathname==='/pledges'){payload=route.request().postDataJSON();return route.fulfill({json:{accepted:true}})}
   if(url.pathname==='/supporters'){
    requests++;if(fail){fail=false;return route.fulfill({status:503,json:{message:'Unavailable'}})}
    const county=url.searchParams.get('county')||'',start=Number(url.searchParams.get('cursor')||0),total=county==='48375'?0:90;
    const end=Math.min(start+40,total);
    return route.fulfill({json:{items:Array.from({length:Math.max(0,end-start)},(_,i)=>({id:`${county}-${start+i}`,firstName:start+i===0?'Ana <img src=x onerror=alert(1)>':'Alex',countyFips:county||'48381'})),nextCursor:end<total?String(end):null}});
   }
   return route.abort();
  });
  await page.route('https://api.emailjs.com/**',route=>route.fulfill({status:200,body:'OK'}));
  await page.goto(process.env.CHECK_URL || (kind==='paper'?'http://127.0.0.1:4182':'http://127.0.0.1:4183'),{waitUntil:'networkidle'});
  const panel=page.locator('.supporter-names'),scroll=panel.locator('[role=region]'),rows=panel.locator('li');
  await panel.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelectorAll('.supporter-names-list li').length===40);
  assert.equal(await panel.locator('img').count(),0);
  for(const count of [80,90]) {await scroll.evaluate(el=>el.scrollTop=el.scrollHeight);await page.waitForFunction(n=>document.querySelectorAll('.supporter-names-list li').length===n,count);}
  assert.equal(await rows.count(),90);assert.equal(await rows.filter({hasText:'Alex'}).count(),89);
  const map=page.locator(kind==='paper'?'#pledge-map svg[role=group]':'#texas-map');
  await map.locator('[data-county="48381"]').click();
  await page.waitForFunction(()=>document.querySelector('#supporter-names-title').textContent.includes('Randall'));
  await page.waitForFunction(()=>document.querySelectorAll('.supporter-names-list li').length===40);
  assert.equal(await rows.locator('span').count(),0);
  await map.locator('[data-county="48375"]').click();
  await page.waitForFunction(()=>document.querySelector('#supporter-names-title').textContent.includes('Potter'));
  await page.waitForFunction(()=>document.querySelector('.supporter-names-status').textContent.includes('No public'));
  fail=true;await panel.getByRole('button',{name:'Show all counties'}).click();
  await panel.getByRole('button',{name:'Try again'}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.supporter-names-list li').length===40);
  const form=page.locator(kind==='paper'?'#pledge form':'#texas-pledge-form');
  await form.locator('input[autocomplete=name]').fill('Test Person');await form.locator('input[autocomplete=email]').fill('test@example.invalid');
  if(kind==='paper'){await form.locator('select').nth(0).selectOption('TX');await form.locator('select').nth(1).selectOption('48381')}
  else {await form.locator('select[name=countyFips]').selectOption('48381');await form.locator('input[name=agreePledge]').check()}
  const consent=form.locator('[name=publishFirstName]');assert.equal(await consent.isChecked(),false);await consent.check();
  await form.locator('[name=publicFirstName]').fill('Test');await form.locator('[name=agreePrivacyPolicy]').check();
  await form.locator('button[type=submit]').click();
  await page.waitForFunction(selector=>document.querySelector(selector).value==='',kind==='paper'?'#pledge input[autocomplete=name]':'#pledge-name');
  assert.equal(payload.publishFirstName,true);assert.equal(payload.publicFirstName,'Test');assert.equal(payload.countyFips,'48381');
  await panel.scrollIntoViewIfNeeded();await page.screenshot({path:`/tmp/patriot-review/supporters-${kind}-${width}.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({kind,width,infiniteScroll:90,countyFilter:true,empty:true,retry:true,optIn:true,requests,errors}));await page.close();
 }
} finally {await browser.close()}
