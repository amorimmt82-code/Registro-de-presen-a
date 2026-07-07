// Quick API verification
const base = 'http://localhost:3004/api/realtime';

const ops = await fetch(`${base}/operators`).then(r => r.json());
const total = ops.length;
const present = ops.filter(o => o.temMarcacao === 1 || o.temProducao === 1).length;
console.log(`Operators: ${total} total, ${present} present (temMarcacao|temProducao)`);

const warehouseSections = new Set([
  'embalador', 'chefe de linha', 'rotulagem', 'expedição', 'pesagens',
  'operador de porta paletes', 'operador de empilhador', 'chefe de armazém',
  'cargas', 'embalagens', 'auxiliar de chefe de linha', 'controlo de qualidade', 'limpeza',
]);
const whOps = ops.filter(o => warehouseSections.has((o.seccao || '').toLowerCase()));
const whPresent = whOps.filter(o => o.temMarcacao === 1 || o.temProducao === 1).length;
console.log(`Warehouse: ${whOps.length} total, ${whPresent} present`);

const movs = await fetch(`${base}/movements`).then(r => r.json());
const termEvents = movs.filter(m => m.tipo === 'entry' || m.tipo === 'exit');
const lineEvents = movs.filter(m => m.tipo === 'line-entry' || m.tipo === 'line-exit');
console.log(`Movements: ${movs.length} total (${termEvents.length} terminal, ${lineEvents.length} line)`);

const lines = await fetch(`${base}/lines`).then(r => r.json());
console.log(`Lines: ${lines.length} active`);
for (const l of lines) console.log(`  ${l.linha}: ${l.funcionariosHoje} workers`);

const vac = await fetch(`${base}/vacation`).then(r => r.json());
console.log(`Vacation: ${vac.onVacationToday?.length} férias, ${vac.onAbsenceToday?.length} absence`);

// Check some specific people
const onVacCodes = new Set(vac.onVacationToday?.map(v => String(v.codigo).trim()) || []);
const onAbsCodes = new Set(vac.onAbsenceToday?.map(v => String(v.codigo).trim()) || []);
const conflicts = whOps.filter(o => {
  const isPresent = o.temMarcacao === 1 || o.temProducao === 1;
  const onLeave = onVacCodes.has(String(o.codigo).trim()) || onAbsCodes.has(String(o.codigo).trim());
  return isPresent && onLeave;
});
console.log(`Conflicts (present + on leave): ${conflicts.length}`);
for (const c of conflicts.slice(0,5)) {
  const seg = onVacCodes.has(String(c.codigo).trim()) ? 'férias' : 'baixa';
  console.log(`  ${c.nome} (${c.codigo}) - ${seg}`);
}
