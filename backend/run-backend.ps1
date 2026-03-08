param(
    [int]$Port = 8081
)

function Normalize-PathForCmd {
    param([string]$Path)
    if ($Path.StartsWith("\\?\")) {
        return $Path.Substring(4)
    }
    return $Path
}

$backendDir = Normalize-PathForCmd -Path $PSScriptRoot
Set-Location -LiteralPath $backendDir

Write-Host "Checking port $Port..." -ForegroundColor Cyan

$listeningPids = @()

try {
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
    $listeningPids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
} catch {
    $netstatLines = netstat -ano | Select-String ":$Port\s+.*LISTENING"
    if ($netstatLines) {
        $listeningPids = $netstatLines | ForEach-Object {
            $parts = ($_ -split "\s+") | Where-Object { $_ -ne "" }
            $parts[-1]
        } | Select-Object -Unique
    }
}

if ($listeningPids.Count -gt 0) {
    Write-Host "Port $Port is in use. Stopping existing process(es): $($listeningPids -join ', ')" -ForegroundColor Yellow
    foreach ($procId in $listeningPids) {
        try {
            Stop-Process -Id $procId -Force -ErrorAction Stop
        } catch {
            Write-Host "Could not stop process ${procId}: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Port $Port is free." -ForegroundColor Green
}

Write-Host "Starting backend..." -ForegroundColor Cyan
cmd /c "cd /d `"$backendDir`" && mvn spring-boot:run"
