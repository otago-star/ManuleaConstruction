param(
  [string]$Domain = "manuleaconstruction.co.nz",
  [string]$CustomDomain = "www.manuleaconstruction.co.nz",
  [string]$ExpectedWwwCname = "otago-star.github.io",
  [int]$IntervalSeconds = 180,
  [int]$MaxChecks = 120
)

$ErrorActionPreference = "Stop"

if ($IntervalSeconds -lt 10) {
  throw "IntervalSeconds must be 10 or greater."
}

if ($MaxChecks -lt 1) {
  throw "MaxChecks must be 1 or greater."
}

$checkerPath = Join-Path $PSScriptRoot "check-github-pages-dns.ps1"
if (-not (Test-Path $checkerPath)) {
  throw "Checker script not found at $checkerPath"
}

Write-Host "Waiting for GitHub Pages HTTPS readiness..." -ForegroundColor Cyan
Write-Host "Root Domain: $Domain" -ForegroundColor Cyan
Write-Host "Custom Domain: $CustomDomain" -ForegroundColor Cyan
Write-Host "Interval: $IntervalSeconds seconds | Max checks: $MaxChecks" -ForegroundColor Cyan
Write-Host ""

for ($i = 1; $i -le $MaxChecks; $i++) {
  Write-Host "Check $i of $MaxChecks" -ForegroundColor Yellow

  & $checkerPath -Domain $Domain -CustomDomain $CustomDomain -ExpectedWwwCname $ExpectedWwwCname
  $exitCode = $LASTEXITCODE

  if ($exitCode -eq 0) {
    Write-Host "" 
    Write-Host "READY: HTTPS should now be enforceable in GitHub Pages settings." -ForegroundColor Green
    exit 0
  }

  if ($i -lt $MaxChecks) {
    Write-Host "Not ready yet. Rechecking in $IntervalSeconds seconds..." -ForegroundColor DarkYellow
    Write-Host ""
    Start-Sleep -Seconds $IntervalSeconds
  }
}

Write-Host "" 
Write-Host "Timed out waiting for HTTPS readiness." -ForegroundColor Red
Write-Host "Next step: verify GitHub Pages custom domain settings and DNS host records, then run again." -ForegroundColor Red
exit 1
