param(
    [int]$Port = 3000
)

function Normalize-PathForCmd {
    param([string]$Path)
    if ($Path.StartsWith("\\?\")) {
        return $Path.Substring(4)
    }
    return $Path
}

$frontendDir = Normalize-PathForCmd -Path $PSScriptRoot
Set-Location -LiteralPath $frontendDir

Write-Host "Checking port $Port..." -ForegroundColor Cyan
$listeners = netstat -ano | Select-String ":$Port\s+.*LISTENING"
if ($listeners) {
    $procIds = $listeners | ForEach-Object {
        $parts = ($_ -split "\s+") | Where-Object { $_ -ne "" }
        $parts[-1]
    } | Select-Object -Unique

    Write-Host "Port $Port is in use. Stopping process(es): $($procIds -join ', ')" -ForegroundColor Yellow
    foreach ($procId in $procIds) {
        try {
            Stop-Process -Id $procId -Force -ErrorAction Stop
        } catch {
            Write-Host "Could not stop process ${procId}: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Port $Port is free." -ForegroundColor Green
}

$lockPath = Join-Path $frontendDir ".next\dev\lock"
if (Test-Path $lockPath) {
    Remove-Item -Force $lockPath
    Write-Host "Removed stale Next.js lock file." -ForegroundColor Yellow
}

Write-Host "Starting frontend..." -ForegroundColor Cyan
cmd /c "cd /d `"$frontendDir`" && npm run dev"
