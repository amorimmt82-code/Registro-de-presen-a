import sql from 'mssql';
try {
  console.log('Connecting...');
  const pool = await sql.connect({
    user: 'matheus.amorim', password: 'Apw7124', server: '10.0.0.3',
    database: 'Dcs2nG', options: { encrypt: false, trustServerCertificate: true },
    requestTimeout: 30000, connectionTimeout: 15000
  });
  console.log('Connected');
  
  const r = await pool.request().query(`SELECT TOP 1 Nome FROM dbo.RcsHumanos`);
  console.log('Test:', r.recordset[0].Nome);
  
  const r2 = await pool.request().query(`SELECT TOP 3 * FROM dbo.vwSaldosBHFnc WHERE Ano = 2026 ORDER BY Mes DESC`);
  console.log('BH rows:', r2.recordset.length);
  r2.recordset.forEach(f => console.log(f.Nome, f.BHSaldo));
  
  await pool.close();
  console.log('Done');
} catch(e) {
  console.error('ERROR:', e.message);
}
