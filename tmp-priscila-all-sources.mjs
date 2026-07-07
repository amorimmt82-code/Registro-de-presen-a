import sql from "mssql";
const config = { user: "matheus.amorim", password: "Apw7124", server: "10.0.0.3", database: "Dcs2nG", options: { encrypt: false, trustServerCertificate: true }, requestTimeout: 180000 };
const pool = await sql.connect(config);
const result = await pool.request().query(`
DECLARE @Dia date = '2026-05-14';
SELECT fonte, codigo, nome, momento, detalhe FROM (
  SELECT 'SvlMarcacoesLG' AS fonte, rh.CdRcsHumano AS codigo, rh.Nome AS nome, CONVERT(varchar(19), s.DtHrMarcacao, 120) AS momento, ISNULL(e.DsEquipamento, '') AS detalhe
  FROM dbo.SvlMarcacoesLG s WITH(NOLOCK)
  INNER JOIN dbo.RcsHumanos rh WITH(NOLOCK) ON rh.UIRcsHumano = s.UIUtente
  LEFT JOIN dbo.AqdEquipamentos e WITH(NOLOCK) ON e.UIEquipamento = s.UITerminal
  WHERE (rh.CdRcsHumano IN ('0034','034','34') OR rh.Nome LIKE '%Priscila%Vieira%Oliveira%')
    AND s.DtHrMarcacao >= DATEADD(DAY,-1,@Dia) AND s.DtHrMarcacao < DATEADD(DAY,1,@Dia)
  UNION ALL
  SELECT 'TskMarcacoesLG', rh.CdRcsHumano, rh.Nome, CONVERT(varchar(19), t.DtHrMarcacao, 120), RTRIM(ISNULL(pt.DsPostoTrb,''))
  FROM dbo.TskMarcacoesLG t WITH(NOLOCK)
  INNER JOIN dbo.RcsHumanos rh WITH(NOLOCK) ON rh.UIRcsHumano = t.UIFuncionario
  LEFT JOIN dbo.RcsPostosTrb pt WITH(NOLOCK) ON pt.UIPostoTrb = t.UIPostoTrb
  WHERE (rh.CdRcsHumano IN ('0034','034','34') OR rh.Nome LIKE '%Priscila%Vieira%Oliveira%')
    AND t.DtHrMarcacao >= DATEADD(DAY,-1,@Dia) AND t.DtHrMarcacao < DATEADD(DAY,1,@Dia)
  UNION ALL
  SELECT 'CthMarcacoesLG', rh.CdRcsHumano, rh.Nome, CONVERT(varchar(19), CAST(m.DtMarcacao AS datetime), 120), CAST(m.UIFuncionario AS varchar(50))
  FROM dbo.CthMarcacoesLG m WITH(NOLOCK)
  INNER JOIN dbo.RcsHumanos rh WITH(NOLOCK) ON rh.UIRcsHumano = m.UIFuncionario
  WHERE (rh.CdRcsHumano IN ('0034','034','34') OR rh.Nome LIKE '%Priscila%Vieira%Oliveira%')
    AND m.DtMarcacao = @Dia
  UNION ALL
  SELECT 'vwHorasProducaoPHC', vp.CdRcsHumano, rh.Nome, CONCAT(vp.DtMaxInicio,' ',CONVERT(varchar(8),vp.HrMaxInicio,108)), RTRIM(ISNULL(vp.DsPostoTrb,''))
  FROM dbo.vwHorasProducaoPHC vp WITH(NOLOCK)
  INNER JOIN dbo.RcsHumanos rh WITH(NOLOCK) ON rh.CdRcsHumano = vp.CdRcsHumano
  WHERE (vp.CdRcsHumano IN ('0034','034','34') OR rh.Nome LIKE '%Priscila%Vieira%Oliveira%')
    AND vp.DtMaxInicio IN ('2026-05-13','2026-05-14')
) x
ORDER BY momento, fonte;
`);
console.log(JSON.stringify(result.recordset, null, 2));
await pool.close();
