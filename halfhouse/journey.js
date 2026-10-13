'use strict';
(() => {
  // First-party, session-only campaign continuity. No pixels, cookies or network calls.
  const KEY = 'halfhouse_journey_v1';
  const UTM = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  const allowed = [...UTM,'landing_path','referrer_host'];
  const params = new URLSearchParams(location.search);
  let previous = null;
  try { previous = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (_) {}
  const fresh = previous && Date.now() - previous.time < 2 * 3600000 && previous.data;
  let data = fresh ? previous.data : {};
  if (UTM.some(key => params.has(key))) {
    const incoming = {};
    UTM.forEach(key => { if(params.has(key)) incoming[key] = params.get(key).slice(0,200); });
    const sameCampaign = fresh && UTM.every(key => (incoming[key] || '') === (data[key] || ''));
    if (!sameCampaign) data = { landing_path: location.pathname.slice(0,200) };
    Object.assign(data, incoming);
  } else if (!data.landing_path) data.landing_path = location.pathname.slice(0,200);
  try { if(document.referrer) { const host=new URL(document.referrer).hostname; if(host!==location.hostname) data.referrer_host=host; } } catch (_) {}
  data = Object.fromEntries(allowed.filter(k=>typeof data[k]==='string').map(k=>[k,data[k].slice(0,200)]));
  try { sessionStorage.setItem(KEY,JSON.stringify({time:Date.now(),data})); } catch (_) {}
  window.dataLayer = window.dataLayer || [];
  const track = (name,context) => window.dataLayer.push({event:name,hh_context:String(context||'').slice(0,80)});
  window.HHJourney = Object.freeze({getAttribution:()=>({...data}),track});
  // Retain campaign fields even when sessionStorage is disabled.
  document.querySelectorAll('a[href]').forEach(a=>{
    try {
      const u=new URL(a.href);
      if(u.origin===location.origin && u.pathname.endsWith('/halfhouse/inquiry.html')) {
        UTM.forEach(key=>{if(data[key]&&!u.searchParams.has(key))u.searchParams.set(key,data[key]);});
        a.href=u.href;
      }
    } catch (_) {}
    if(a.dataset.track) a.addEventListener('click',()=>track('hh_cta_click',a.dataset.track));
  });
})();
