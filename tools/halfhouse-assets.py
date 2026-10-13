"""Import business photographs supplied by HALF HOUSE from anonymously readable Drive files.
Never uses credentials, private bearer URLs, or changes Drive permissions.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from io import BytesIO
import json, time
import requests
from PIL import Image, ImageOps, ImageDraw
SOURCES = {
 'f45-gathering':'1HJ40PVQAEq_rKN2rN3EO0uNFulG3AH58',
 'f45-evening':'1wDHo7U4lQ827CairyoN3KAyozkH2Sk4C',
 'f45-community':'1kw_EK44LcLk9Jhwj2fUItITk2W-_6Jle',
 'toss-meeting':'18u4YA8Gr_fvx4-Z6t5xNbt6twYm5LaBm',
 'toss-conversation':'1fTP50PS5x8Nfk3yzg2fFZcLfVAou8Nyp',
 'toss-detail':'1WlGNzxwxgDmOVKGXPRpsIHdu8tBz86-Y',
 'space-44':'1aair5hkyH6GXSRWixu27_DM5SpHn6tVE',
 'space-39':'1kH2ZKM7_UnXcyohXnwS9rcIh4VIWdDiq',
 'space-35':'1h8yI99sKy2QaPhwXMNfQ9U80O4eLfWLM',
 'menu-launch':'1tk5zmM2gKqLKVn1nW3NwFuD-Rg1MDMpT',
 'archive-001':'1hHX6njcrR3amkWl4Q2GkU_zwzFaC1rkl',
 'archive-002':'13za607tJ-cFAiudJFUViA7gILs51Xqp3',
 'archive-003':'1RLKGaw0cGnqHHxJFooFH93I7g0M7OqZK',
 'archive-011':'1v0tM6vPSweKV1Lf8deEKs9EkM2vAjH3M',
 'archive-014':'1VGnVO8mTWQ1xQ_b1bqpNE_H7NqQK18u-',
 'archive-017':'1iS11gHCBA5K7wVRIqSsRL0RbgmcwpOt7',
 'archive-024':'1hiMhs1QadWWGccHcs4ZxDbNaL9Q3JZ6v',
 'archive-027':'1yFkQZmg9n3j94YRs2isFOnjCBSPaKMRA',
 'archive-030':'1lRt86OVHHVrrkQIPcJbkGdw1rBQtIRUu',
}
out = Path('halfhouse/assets/photos'); out.mkdir(parents=True, exist_ok=True)
def process(item):
 name, source_id = item
 urls = [f'https://drive.usercontent.google.com/download?id={source_id}&export=download&confirm=t', f'https://drive.google.com/thumbnail?id={source_id}&sz=w1600']
 for url in urls:
  try:
   r = requests.get(url, timeout=45)
   r.raise_for_status()
   im = ImageOps.exif_transpose(Image.open(BytesIO(r.content))).convert('RGB')
   im.thumbnail((1600,1600), Image.Resampling.LANCZOS)
   if min(im.size) < 150: raise ValueError('Not a usable photograph')
   im.save(out/f'{name}.webp', 'WEBP', quality=83, method=6)
   thumb=im.copy(); thumb.thumbnail((640,640),Image.Resampling.LANCZOS)
   thumb.save(out/f'{name}-640.webp','WEBP',quality=78,method=6)
   return {'name':name,'ok':True,'width':im.width,'height':im.height,'bytes':(out/f'{name}.webp').stat().st_size}
  except Exception as e:
   error=str(e)
 return {'name':name,'ok':False,'error':error}
results=list(ThreadPoolExecutor(max_workers=4).map(process,SOURCES.items()))
Path('halfhouse-photo-results.json').write_text(json.dumps(results,indent=2))
valid=[r for r in results if r['ok']]
canvas=Image.new('RGB',(1280,((len(valid)+3)//4)*270),'white')
d=ImageDraw.Draw(canvas)
for n,r in enumerate(valid):
 im=Image.open(out/f"{r['name']}.webp"); im.thumbnail((310,235))
 x=(n%4)*320; y=(n//4)*270
 canvas.paste(im,(x+(310-im.width)//2,y+(235-im.height)//2));d.text((x+8,y+244),r['name'],fill='black')
canvas.save('halfhouse-photo-contact.jpg',quality=90)
print(json.dumps(results,indent=2))
if not valid: raise SystemExit('No anonymously accessible photos; no permissions changed')
