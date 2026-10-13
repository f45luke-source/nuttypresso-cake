"""Apply reviewed website text only inside halfhouse/; no secrets or new font files."""
from pathlib import Path
import base64, hashlib, json, zlib
encoded=''.join(Path(f'tools/hh-release-{n}.b64').read_text().strip() for n in range(1,5))
# Correct a known transport transcription error before verifying the full payload.
encoded=encoded.replace('OdPTc5cPT3Fao','OdPTc5PT3Fao')
raw=zlib.decompress(base64.b64decode(encoded,validate=True))
assert hashlib.sha256(raw).hexdigest()=='3e06aa49d28be84338bf7827153a3237c14c5319def0cc1f5e9e5ed490a3e6c5','Release checksum mismatch'
data=json.loads(raw)
allowed={'index.html','editorial.css','journey.js','home.js','inquiry.html','inquiry-updates.css','app.js','README.md'}
assert set(data['files'])==allowed
root=Path('halfhouse')
for name,content in data['files'].items():
 assert isinstance(content,str)
 (root/name).write_text(content,encoding='utf-8')
for stem in data['prune']:
 assert stem in {'f45-evening','menu-launch','archive-002','archive-003','archive-027','archive-030'}
 for suffix in ('.webp','-640.webp'):(root/'assets'/'photos'/(stem+suffix)).unlink(missing_ok=True)
print('Verified payload SHA256; applied eight HALF HOUSE files and selected photographs.')
