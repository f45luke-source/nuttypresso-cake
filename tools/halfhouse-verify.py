"""Browser UI tests use mocked submissions. One labelled live fixture is verified separately."""
from pathlib import Path
import json, re, uuid, time
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, expect
ROOT=Path('halfhouse'); OUT=Path('qa');OUT.mkdir(exist_ok=True)
BASE='http://127.0.0.1:8765/halfhouse/'
API='https://hpexprhlyikznqaptqww.supabase.co/functions/v1/halfhouse-inquiry'
KEY=re.search(r"const KEY = '([^']+)'",(ROOT/'app.js').read_text()).group(1)
results=[]
for name in ['index.html','inquiry.html']:
 soup=BeautifulSoup((ROOT/name).read_text(),'html.parser')
 ids=[x['id'] for x in soup.select('[id]')]
 assert len(ids)==len(set(ids)),('duplicate IDs',name)
 assert len(soup.select('h1'))==1
 for a in soup.select('a[href]'):
  href=a['href']
  if href.startswith('#'):assert href[1:] in ids,(name,href)
  elif not href.startswith(('https:','http:','tel:','mailto:')):
   target=ROOT/href.split('?')[0].split('#')[0]
   if target.is_dir():target=target/'index.html'
   assert target.is_file(),(name,href)

def settle(page):
 page.evaluate("async()=>{document.documentElement.style.scrollBehavior='auto';for(const i of document.images){if(i.id!=='viewer-image')i.loading='eager';}await Promise.all([...document.images].filter(i=>i.id!=='viewer-image').map(i=>i.decode().catch(()=>{})));for(let y=0;y<document.body.scrollHeight;y+=800){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,25));}window.scrollTo(0,0)}")
 page.wait_for_timeout(150)

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for width,height in [(1440,1000),(390,844),(360,780),(768,1024)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.goto(BASE,wait_until='networkidle',timeout=60000);settle(page)
  info=page.evaluate("()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.body.scrollHeight,broken:[...document.images].filter(i=>i.id!=='viewer-image'&&(!i.complete||!i.naturalWidth)).map(i=>i.src)})")
  info['errors']=errors;results.append(info)
  assert info['scrollWidth']==width,info
  assert not info['broken'],info
  assert not errors,errors
  if width in [1440,390]:page.screenshot(path=str(OUT/f'home-{width}.png'),full_page=True)
  if width==390:
   page.locator('.nav-toggle').click();expect(page.locator('#mobile-nav')).to_be_visible()
   page.locator('#mobile-nav a[href="#orders"]').click();expect(page.locator('#mobile-nav')).to_be_hidden()
   page.locator('.photo-tile').first.click();expect(page.locator('#photo-viewer')).to_be_visible()
   page.keyboard.press('ArrowRight');expect(page.locator('#viewer-count')).to_have_text('2 / 6')
   page.keyboard.press('Escape');expect(page.locator('#photo-viewer')).to_be_hidden()
  page.close()
 page=browser.new_page(viewport={'width':1440,'height':1000})
 page.goto(BASE+'?utm_source=instagram&utm_medium=paid_social&utm_campaign=november&utm_content=panini_a',wait_until='networkidle')
 page.locator('[data-track="panini_bulk"]').click();page.wait_for_load_state('networkidle')
 expect(page.locator('input[name=service][value=bulk]')).to_be_checked()
 assert page.locator('[name=product]:enabled').input_value().startswith('수제 사워도우')
 assert page.evaluate('HHJourney.getAttribution().utm_campaign')=='november'
 assert page.evaluate('HHJourney.getAttribution().landing_path')=='/halfhouse/'
 settle(page);page.screenshot(path=str(OUT/'inquiry-1440.png'),full_page=True)
 page.set_viewport_size({'width':390,'height':844});settle(page);page.screenshot(path=str(OUT/'inquiry-390.png'),full_page=True)
 assert page.evaluate('document.documentElement.scrollWidth')==390
 payloads=[]
 def mock(route):
  if route.request.method=='OPTIONS':
   route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'http://127.0.0.1:8765','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'content-type,apikey'});return
  payloads.append(route.request.post_data_json)
  route.fulfill(status=200,content_type='application/json',headers={'Access-Control-Allow-Origin':'http://127.0.0.1:8765'},body=json.dumps({'ok':True,'receipt':'HH-261014-ABCDEF1234'}))
 page.route(API,mock)
 page.locator('[name=contact_name]').fill('테스트담당자');page.locator('[name=phone]').fill('010-0000-0000')
 page.locator('[name=consent]').check();page.locator('#submit-button').click()
 expect(page.locator('#success')).to_be_visible(timeout=10000)
 assert payloads[0]['attribution']['utm_source']=='instagram' and len(payloads)==1
 assert page.evaluate("dataLayer.filter(x=>x.event==='generate_lead').length")==1
 page.locator('#new-inquiry').click();expect(page.locator('[name=consent]')).not_to_be_checked()
 for service in ['venue','bulk','gifts','popup','group','cake']:
  page.locator(f'input[name=service][value={service}]').locator('..').click()
  assert page.locator('[name=requested_date]').evaluate('(el)=>el.required')==(service=='cake')
  assert page.locator('[name=quantity]').evaluate('(el)=>el.required')==(service=='cake')
 page.unroute(API)
 page.route(API,lambda r:r.fulfill(status=503,content_type='application/json',headers={'Access-Control-Allow-Origin':'http://127.0.0.1:8765'},body='{"error":"접수 지연 테스트"}'))
 page.locator('input[name=service][value=bulk]').locator('..').click()
 page.locator('[name=contact_name]').fill('테스트담당자');page.locator('[name=phone]').fill('01000000000')
 page.locator('[name=consent]').check();page.locator('#submit-button').click()
 expect(page.locator('#form-error')).to_be_visible(timeout=10000);expect(page.locator('#success')).to_be_hidden()
 assert page.evaluate("dataLayer.filter(x=>x.event==='generate_lead').length")==1
 page.screenshot(path=str(OUT/'inquiry-error.png'),full_page=True)
 browser.close()
(OUT/'ui-results.json').write_text(json.dumps({'viewports':results,'interactions':'passed','mocked_submissions':True,'attribution':'passed','conditional_types':6},ensure_ascii=False,indent=2))
# No customer information and no email or SMS. Existing endpoint has no notifications.
headers={'apikey':KEY,'Content-Type':'application/json','Origin':'https://f45luke-source.github.io'}
health=requests.get(API,timeout=30);assert health.status_code==200,health.status_code
assert health.json().get('service')=='halfhouse-inquiry'
cors=requests.options(API,headers={**headers,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'apikey,content-type'},timeout=30)
assert cors.status_code==204
assert cors.headers.get('Access-Control-Allow-Origin')==headers['Origin']
token=str(uuid.uuid4())
payload={'request_token':token,'service':'bulk','contact_name':'__HALFHOUSE_SITE_QA_20261014__','phone':'01000000000','email':'','company':'TEST - NOT A CUSTOMER','requested_date':'','quantity':1,'budget':'','message':'Synthetic website release verification. Remove this fixture. No order or booking.','details':{'product':'QA test only'},'attribution':{'utm_source':'site_qa','utm_medium':'test','utm_campaign':'site_qa_20261014','landing_path':'/halfhouse/'},'consent':True,'website':''}
reject=requests.post(API,headers=headers,json={**payload,'consent':False},timeout=30);assert reject.status_code==400
first=requests.post(API,headers=headers,json=payload,timeout=30)
report={'request_token':token,'health_status':health.status_code,'cors_status':cors.status_code,'consent_rejection':reject.status_code,'first_status':first.status_code,'first_result':first.json()}
(OUT/'live-test-result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
assert first.status_code==200 and first.json().get('ok'),report
second=requests.post(API,headers=headers,json=payload,timeout=30)
assert second.status_code==200 and second.json().get('duplicate') is True
assert first.json()['receipt']==second.json()['receipt']
report['duplicate_status']=second.status_code;report['same_receipt']=True
anon=requests.get('https://hpexprhlyikznqaptqww.supabase.co/rest/v1/halfhouse_inquiries',headers={'apikey':KEY},params={'select':'id','request_token':'eq.'+token},timeout=30)
report['anonymous_read_status']=anon.status_code;assert anon.status_code in [401,403],anon.status_code
(OUT/'live-test-result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'ui':'passed','live':report},ensure_ascii=False,indent=2))
