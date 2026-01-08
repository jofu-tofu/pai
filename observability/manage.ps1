# PAI Observability Dashboard Manager - Windows PowerShell Version
# Usage: .\manage.ps1 <start|stop|restart|status|start-detached>

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'status', 'start-detached')]
    [string]$Action = 'status'
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerDir = Join-Path $ScriptDir "apps\server"
$ClientDir = Join-Path $ScriptDir "apps\client"
$ServerPort = 4000
$ClientPort = 5172

function Test-PortInUse {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

function Get-ProcessOnPort {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        return $connection.OwningProcess
    }
    return $null
}

function Stop-ProcessOnPort {
    param([int]$Port)
    $pid = Get-ProcessOnPort -Port $Port
    if ($pid) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped process on port $Port (PID: $pid)"
    }
}

function Wait-ForPort {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 30
    )
    $startTime = Get-Date
    while (-not (Test-PortInUse -Port $Port)) {
        if (((Get-Date) - $startTime).TotalSeconds -gt $TimeoutSeconds) {
            return $false
        }
        Start-Sleep -Milliseconds 500
    }
    return $true
}

function Start-Observability {
    param([switch]$Detached)

    if (Test-PortInUse -Port $ServerPort) {
        Write-Host "Server already running on port $ServerPort. Use: .\manage.ps1 restart" -ForegroundColor Red
        return
    }

    Write-Host "Starting observability server..." -ForegroundColor Cyan

    # Start server
    Push-Location $ServerDir
    if ($Detached) {
        Start-Process -FilePath "bun" -ArgumentList "run", "dev" -WindowStyle Hidden
    } else {
        $serverJob = Start-Job -ScriptBlock {
            param($dir)
            Set-Location $dir
            bun run dev
        } -ArgumentList $ServerDir
    }
    Pop-Location

    # Wait for server
    Write-Host "Waiting for server to start..."
    if (-not (Wait-ForPort -Port $ServerPort)) {
        Write-Host "Server failed to start" -ForegroundColor Red
        return
    }
    Write-Host "Server started on port $ServerPort" -ForegroundColor Green

    # Start client
    Write-Host "Starting client..." -ForegroundColor Cyan
    Push-Location $ClientDir
    if ($Detached) {
        Start-Process -FilePath "bun" -ArgumentList "run", "dev" -WindowStyle Hidden
    } else {
        $clientJob = Start-Job -ScriptBlock {
            param($dir)
            Set-Location $dir
            bun run dev
        } -ArgumentList $ClientDir
    }
    Pop-Location

    # Wait for client
    Write-Host "Waiting for client to start..."
    if (-not (Wait-ForPort -Port $ClientPort)) {
        Write-Host "Client failed to start" -ForegroundColor Red
        return
    }
    Write-Host "Client started on port $ClientPort" -ForegroundColor Green

    Write-Host ""
    Write-Host "Observability running at http://localhost:$ClientPort" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

    if (-not $Detached) {
        # Keep running until Ctrl+C
        try {
            while ($true) {
                Start-Sleep -Seconds 1
            }
        } finally {
            Stop-Observability
        }
    }
}

function Stop-Observability {
    Write-Host "Stopping observability..." -ForegroundColor Cyan

    Stop-ProcessOnPort -Port $ServerPort
    Stop-ProcessOnPort -Port $ClientPort

    # Also kill any bun processes running observability
    Get-Process -Name "bun" -ErrorAction SilentlyContinue | ForEach-Object {
        $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        if ($cmd -match "observability") {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
    }

    Start-Sleep -Milliseconds 500
    Write-Host "Observability stopped" -ForegroundColor Green
}

function Get-ObservabilityStatus {
    $serverRunning = Test-PortInUse -Port $ServerPort
    $clientRunning = Test-PortInUse -Port $ClientPort

    if ($serverRunning -and $clientRunning) {
        Write-Host "Running at http://localhost:$ClientPort" -ForegroundColor Green
        Write-Host "  Server: port $ServerPort" -ForegroundColor Gray
        Write-Host "  Client: port $ClientPort" -ForegroundColor Gray
    } elseif ($serverRunning) {
        Write-Host "Partially running (server only)" -ForegroundColor Yellow
        Write-Host "  Server: port $ServerPort (running)" -ForegroundColor Gray
        Write-Host "  Client: port $ClientPort (not running)" -ForegroundColor Gray
    } elseif ($clientRunning) {
        Write-Host "Partially running (client only)" -ForegroundColor Yellow
        Write-Host "  Server: port $ServerPort (not running)" -ForegroundColor Gray
        Write-Host "  Client: port $ClientPort (running)" -ForegroundColor Gray
    } else {
        Write-Host "Not running" -ForegroundColor Red
    }
}

# Main execution
switch ($Action) {
    'start' {
        Start-Observability
    }
    'stop' {
        Stop-Observability
    }
    'restart' {
        Write-Host "Restarting..." -ForegroundColor Cyan
        Stop-Observability
        Start-Sleep -Seconds 2
        Start-Observability
    }
    'status' {
        Get-ObservabilityStatus
    }
    'start-detached' {
        Start-Observability -Detached
    }
}
