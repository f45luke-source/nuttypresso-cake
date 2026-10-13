"""Apply reviewed website text only inside halfhouse/; no secrets or new font files."""
from pathlib import Path
import base64, hashlib, json, zlib
encoded=''.join(Path(f'tools/hh-release-{n}.b64').read_text().strip() for n in range(1,5))
encoded=encoded.replace('OdPTc5cPT3Fao','OdPTc5PT3Fao')
raw=zlib.decompress(base64.b64decode(encoded,validate=True))
assert hashlib.sha256(raw).hexdigest()=='3e06aa49d28be84338bf7827153a3237c14c5319def0cc1f5e9e5ed490a3e6c5','Release checksum mismatch'
data=json.loads(raw)
allowed={'index.html','editorial.css','journey.js','home.js','inquiry.html','inquiry-updates.css','app.js','README.md'}
assert set(data['files'])==allowed
# Browser QA found copied UTM fields must not reset the original landing path.
old="""    data = { landing_path: location.pathname.slice(0,200) };
    UTM.forEach(key => { if(params.has(key)) data[key] = params.get(key).slice(0,200); });"""
new="""    const incoming = {};
    UTM.forEach(key => { if(params.has(key)) incoming[key] = params.get(key).slice(0,200); });
    const sameCampaign = fresh && UTM.every(key => (incoming[key] || '') === (data[key] || ''));
    if (!sameCampaign) data = { landing_path: location.pathname.slice(0,200) };
    Object.assign(data, incoming);"""
assert data['files']['journey.js'].count(old)==1
data['files']['journey.js']=data['files']['journey.js'].replace(old,new)
# Business-specific Naver destination found in the public place link.
naver_search='https://map.naver.com/p/search/%ED%95%98%ED%94%84%ED%95%98%EC%9A%B0%EC%8A%A4'
for name in ('index.html','inquiry.html'):
 data['files'][name]=data['files'][name].replace(naver_search,'https://map.naver.com/p/entry/place/2063685809')
root=Path('halfhouse')
for name,content in data['files'].items():
 assert isinstance(content,str)
 (root/name).write_text(content,encoding='utf-8')
for stem in data['prune']:
 assert stem in {'f45-evening','menu-launch','archive-002','archive-003','archive-027','archive-030'}
 for suffix in ('.webp','-640.webp'):(root/'assets'/'photos'/(stem+suffix)).unlink(missing_ok=True)
print('Verified payload; applied HALF HOUSE files, attribution correction and business-specific map links.')
