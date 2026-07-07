import http from 'http';
async function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}
async function run() {
  try {
    const ops = await get('http://localhost:3004/api/realtime/operators');
    const hasSegmento = ops && ops.length > 0 && Object.keys(ops[0]).includes('segmentoHoje');
    
    const vac = await get('http://localhost:3004/api/realtime/vacation');
    const vacType = Array.isArray(vac) ? 'Array' : 'Object';
    const vacKeys = vac && (Array.isArray(vac) ? vac.length > 0 : true) ? Object.keys(Array.isArray(vac) ? vac[0] : vac).join(',') : 'N/A';
    
    const linesToday = await get('http://localhost:3004/api/realtime/lines');
    const linesFuture = await get('http://localhost:3004/api/realtime/lines?date=2026-04-17');
    
    console.log('RESULT_START');
    console.log('SegmentoHoje:', hasSegmento);
    console.log('VacType:', vacType);
    console.log('VacKeys:', vacKeys);
    console.log('LinesTodayCount:', linesToday ? linesToday.length : 'null');
    console.log('LinesFutureCount:', linesFuture ? linesFuture.length : 'null');
    console.log('RESULT_END');
  } catch (e) {
    console.log('ERROR:', e.message);
  }
}
run();
