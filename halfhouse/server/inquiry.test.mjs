import assert from 'node:assert/strict';
let handler;let saved;
globalThis.Deno={serve(fn){handler=fn},env:{get(k){return k==='SUPABASE_URL'?'https://test.invalid':'test-only-secret'}}};
globalThis.fetch=async(url,opts)=>{saved=JSON.parse(opts.body);return new Response(JSON.stringify({receipt:'HH-261030-0123456789',duplicate:false}),{status:200})};
await import('./inquiry.ts');
const today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
const year=Number(today.slice(0,4));const seasonDate=`${year+1}-01-15`;const offSeason=`${year+1}-05-15`;
const base={service:'cake',contact_name:'LOCAL TEST',phone:'01000000000',email:'',company:'',requested_date:seasonDate,quantity:1,budget:'',message:'LOCAL ONLY',details:{product:'strawberry'},consent:true,website:'',request_token:'11111111-1111-4111-8111-111111111111'};
const send=(patch={},origin='https://nuttypresso.com')=>handler(new Request('https://test.invalid',{method:'POST',headers:{origin,'content-type':'application/json',apikey:'sb_publishable_fJzGi38yo76T3kGgjBuvUg_BVb0RwGD'},body:JSON.stringify({...base,...patch})}));
for(const product of ['basque','matcha','strawberry','blueberry','consult']){const r=await send({details:{product}});assert.equal(r.status,200);assert.equal(saved.p_payload.details.product,product);}
assert.equal((await send({requested_date:today})).status,400);
assert.equal((await send({requested_date:offSeason})).status,400);
assert.equal((await send({details:{product:'unknown'}})).status,400);
assert.equal((await send({consent:false})).status,400);
assert.equal((await send({},'https://not-our-site.invalid')).status,403);
assert.equal((await send({service:'bulk',requested_date:today,details:{product:'panini'}})).status,200);
const options=await handler(new Request('https://test.invalid',{method:'OPTIONS',headers:{origin:'https://nuttypresso.com'}}));assert.equal(options.status,204);assert.equal(options.headers.get('access-control-allow-origin'),'https://nuttypresso.com');
console.log('PASS: 12 local checks. No remote requests or records created.');
