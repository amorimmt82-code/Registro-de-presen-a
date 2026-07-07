try {
    $health = Invoke-RestMethod -Uri "http://localhost:3004/api/health" -Method Get
     "HEALTH_STATUS: $($health.status)"
} catch { "HEALTH_ERROR: $_" }

try {
    $originalLayoutRaw = Invoke-WebRequest -Uri "http://localhost:3004/api/realtime/layout" -Method Get
    $originalLayout = $originalLayoutRaw.Content | ConvertFrom-Json
    $testLayout = @(@(1, 2), @(3, 0))
    $null = Invoke-RestMethod -Uri "http://localhost:3004/api/realtime/layout" -Method Post -Body ($testLayout | ConvertTo-Json) -ContentType "application/json"
    $verifyLayout = Invoke-RestMethod -Uri "http://localhost:3004/api/realtime/layout" -Method Get
    $match = ($verifyLayout[0][0] -eq 1 -and $verifyLayout[0][1] -eq 2 -and $verifyLayout[1][0] -eq 3 -and $verifyLayout[1][1] -eq 0)
    "LAYOUT_TEST: $(if ($match) { 'Success' } else { 'Fail' })"
    if ($null -eq $originalLayout) { Remove-Item -Path "server/cacifos-layout.json" -ErrorAction SilentlyContinue }
    else { $null = Invoke-RestMethod -Uri "http://localhost:3004/api/realtime/layout" -Method Post -Body ($originalLayout | ConvertTo-Json) -ContentType "application/json" }
} catch { "LAYOUT_ERROR: $_" }

try {
    $prod17 = Invoke-RestMethod -Uri "http://localhost:3004/api/realtime/production?date=2026-04-17" -Method Get
    $prod21 = Invoke-RestMethod -Uri "http://localhost:3004/api/realtime/production?date=2026-04-21" -Method Get
    "PROD_17: Count=$($prod17.Count), Samples=$($prod17[0..1].order_code -join ', ')"
    "PROD_21: Count=$($prod21.Count), Samples=$($prod21[0..1].order_code -join ', ')"
} catch { "PROD_ERROR: $_" }

try {
    $histNight = Invoke-RestMethod -Uri "http://localhost:3004/api/realtime/history?date=2026-04-21&shift=night" -Method Get
    $histDay = Invoke-RestMethod -Uri "http://localhost:3004/api/realtime/history?date=2026-04-21&shift=day" -Method Get
    function GetStats($h, $l) { if ($h.Count -gt 0) { $s = $h | % { [DateTime]$_.timestamp } | Sort; return "$l: Count=$($h.Count), Range=$($s[0]) to $($s[-1])" } else { return "$l: Empty" } }
    GetStats $histNight "HIST_NIGHT"
    GetStats $histDay "HIST_DAY"
    if ($histNight.Count -gt 0) {
        $min = [DateTime]"2026-04-20 17:30:00"; $max = [DateTime]"2026-04-21 05:00:00"; $all = $true
        foreach ($e in $histNight) { if ([DateTime]$e.timestamp -lt $min -or [DateTime]$e.timestamp -ge $max) { $all = $false; break } }
        "NIGHT_RANGE_VALID: $all"
        $f=$false; foreach($g in ($histNight | Group employee_id)) { $s=$g.Group|Sort timestamp; for($i=0;$i -lt ($s.Count-1);$i++) {
            if((($s[$i].event -match 'entry|exit') -and $s[$i+1].event -eq 'line-entry' -and $s[$i].line_id -ne $s[$i+1].line_id)) {
                "TRANSITION: $($s[$i].employee_name) ($($s[$i].employee_id)) $($s[$i].event)@$($s[$i].line_id) -> $($s[$i+1].event)@$($s[$i+1].line_id) at $($s[$i+1].timestamp)"; $f=$true; break
        } } if($f){break} }
    }
} catch { "HIST_ERROR: $_" }

try {
    $vac = Invoke-RestMethod -Uri "http://localhost:3004/api/realtime/vacation" -Method Get
    "VACATION_TOP_5:"
    $vac | % { [PSCustomObject]@{n=$_.nome; s=([double](if($null -eq $_.horasBHAcumuladas){0}else{$_.horasBHAcumuladas}) - [double](if($null -eq $_.horasBHGozadas){0}else{$_.horasBHGozadas}))} } | Sort s -Desc | Select -First 5 | % { "$($_.n): $($_.s)" }
} catch { "VACATION_ERROR: $_" }
