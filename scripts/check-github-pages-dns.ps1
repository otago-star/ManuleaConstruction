param(
  [string]$Domain = "manuleaconstruction.co.nz",
  [string]$ExpectedWwwCname = "otago-star.github.io"
)

$ErrorActionPreference = "Stop"

$expectedA = @(
  "185.199.108.153",
  "185.199.109.153",
  "185.199.110.153",
  "185.199.111.153"
)

$expectedAAAA = @(
  "2606:50c0:8000::153",
  "2606:50c0:8001::153",
  "2606:50c0:8002::153",
  "2606:50c0:8003::153"
)

function Get-Records {
  param(
    [string]$Name,
    [string]$Type
  )

  try {
    Resolve-DnsName -Name $Name -Type $Type | Select-Object -ExpandProperty IPAddress -ErrorAction Stop
  }
  catch {
    @()
  }
}

function Get-Cname {
  param([string]$Name)

  try {
    $record = Resolve-DnsName -Name $Name -Type CNAME -ErrorAction Stop | Select-Object -First 1
    if ($null -ne $record -and $record.NameHost) {
      return $record.NameHost.TrimEnd('.')
    }
    return ""
  }
  catch {
    return ""
  }
}

function Compare-Set {
  param(
    [string[]]$Actual,
    [string[]]$Expected
  )

  $actualSet = $Actual | Sort-Object -Unique
  $expectedSet = $Expected | Sort-Object -Unique

  $missing = $expectedSet | Where-Object { $_ -notin $actualSet }
  $extra = $actualSet | Where-Object { $_ -notin $expectedSet }

  [PSCustomObject]@{
    IsMatch = ($missing.Count -eq 0 -and $extra.Count -eq 0)
    Missing = $missing
    Extra = $extra
  }
}

Write-Host "Checking GitHub Pages DNS for $Domain..." -ForegroundColor Cyan
Write-Host ""

$apexA = Get-Records -Name $Domain -Type "A"
$apexAAAA = Get-Records -Name $Domain -Type "AAAA"
$wwwCname = Get-Cname -Name "www.$Domain"

$aResult = Compare-Set -Actual $apexA -Expected $expectedA
$aaaaResult = Compare-Set -Actual $apexAAAA -Expected $expectedAAAA
$wwwOk = ($wwwCname -eq $ExpectedWwwCname)

$cnameFilePath = Join-Path (Get-Location) "CNAME"
$cnameFileValue = ""
if (Test-Path $cnameFilePath) {
  $cnameFileValue = (Get-Content $cnameFilePath -Raw).Trim()
}
$cnameFileOk = ($cnameFileValue -eq $Domain)

Write-Host "A records (@):" -ForegroundColor Yellow
$apexA | ForEach-Object { Write-Host "  $_" }
if (-not $aResult.IsMatch) {
  if ($aResult.Missing.Count -gt 0) {
    Write-Host "  Missing: $($aResult.Missing -join ', ')" -ForegroundColor Red
  }
  if ($aResult.Extra.Count -gt 0) {
    Write-Host "  Extra:   $($aResult.Extra -join ', ')" -ForegroundColor Red
  }
}
Write-Host ""

Write-Host "AAAA records (@):" -ForegroundColor Yellow
$apexAAAA | ForEach-Object { Write-Host "  $_" }
if (-not $aaaaResult.IsMatch) {
  if ($aaaaResult.Missing.Count -gt 0) {
    Write-Host "  Missing: $($aaaaResult.Missing -join ', ')" -ForegroundColor Red
  }
  if ($aaaaResult.Extra.Count -gt 0) {
    Write-Host "  Extra:   $($aaaaResult.Extra -join ', ')" -ForegroundColor Red
  }
}
Write-Host ""

Write-Host "CNAME (www):" -ForegroundColor Yellow
Write-Host "  Actual:   $wwwCname"
Write-Host "  Expected: $ExpectedWwwCname"
if (-not $wwwOk) {
  Write-Host "  www CNAME does not match expected GitHub Pages host." -ForegroundColor Red
}
Write-Host ""

Write-Host "CNAME file in repo root:" -ForegroundColor Yellow
Write-Host "  Actual:   $cnameFileValue"
Write-Host "  Expected: $Domain"
if (-not $cnameFileOk) {
  Write-Host "  CNAME file value does not match domain." -ForegroundColor Red
}
Write-Host ""

$allGood = $aResult.IsMatch -and $aaaaResult.IsMatch -and $wwwOk -and $cnameFileOk

if ($allGood) {
  Write-Host "PASS: DNS records and CNAME file match GitHub Pages requirements." -ForegroundColor Green
  Write-Host "Next: in GitHub > Settings > Pages, check Enforce HTTPS when available." -ForegroundColor Green
  exit 0
}

Write-Host "FAIL: One or more checks did not match expected GitHub Pages setup." -ForegroundColor Red
Write-Host "Fix DNS at your registrar, wait for propagation, then run this script again." -ForegroundColor Red
exit 1
