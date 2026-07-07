import sql from "mssql";
const config = { user: "matheus.amorim", password: "Apw7124", server: "10.0.0.3", database: "Dcs2nG", options: { encrypt: false, trustServerCertificate: true }, requestTimeout: 180000 };
const pool = await sql.connect(config);
const result = await pool.request().query(`
DECLARE @Dia date = '2026-05-14';
SELECT TOP 200
  rh.CdRcsHumano AS codigo,
  rh.Nome AS nome,
  CONVERT(varchar(19), s.DtHrMarcacao, 120) AS timestamp,
  ISNULL(e.DsEquipamento, '') AS terminalNome,
  s.UITerminal
FROM dbo.SvlMarcacoesLG s WITH(NOLOCK)
INNER JOIN dbo.RcsHumanos rh WITH(NOLOCK) ON rh.UIRcsHumano = s.UIUtente
LEFT JOIN dbo.AqdEquipamentos e WITH(NOLOCK) ON e.UIEquipamento = s.UITerminal
WHERE rh.CdRcsHumano IN ('0034','034','34') OR rh.Nome LIKE '%Priscila%Vieira%Oliveira%'
  AND s.DtHrMarcacao >= DATEADD(DAY,-1,@Dia) AND s.DtHrMarcacao < DATEADD(DAY,1,@Dia)
ORDER BY s.DtHrMarcacao;
`);
console.log(JSON.stringify(result.recordset, null, 2));
await pool.close();
