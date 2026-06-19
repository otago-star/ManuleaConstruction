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
    $dnsType = switch ($Type.ToUpperInvariant()) {
      "A" { 1 }
      "AAAA" { 28 }
      default { throw "Unsupported record type: $Type" }
    }

    $url = "https://dns.google/resolve?name=$Name&type=$dnsType"
    $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop

    if ($null -eq $response.Answer) {
      return @()
    }

    ($response.Answer | Where-Object { $_.type -eq $dnsType } | Select-Object -ExpandProperty data)
  }
  catch {
    @()
  }
}

function Get-Cname {
  param([string]$Name)

  try {
    $url = "https://dns.google/resolve?name=$Name&type=5"
    $response = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop

    if ($null -eq $response.Answer) {
      return ""
    }

    $record = $response.Answer | Where-Object { $_.type -eq 5 } | Select-Object -First 1
    if ($null -ne $record -and $record.data) {
      return $record.data.TrimEnd('.')
    }

    return ""
  }
  catch {
    return ""
  }
}

function Test-HttpsCertificate {
  param([string]$HostName)

  try {
    Invoke-WebRequest -Uri ("https://" + $HostName) -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop | Out-Null
    return [PSCustomObject]@{
      IsTrusted = $true
      Message = "Trusted TLS certificate and HTTPS response detected."
    }
  }
  catch {
    $message = $_.Exception.Message
    $isTrustError = ($message -match "trust relationship|SSL/TLS secure channel|principal name is incorrect")

    [PSCustomObject]@{
      IsTrusted = (-not $isTrustError)
      Message = $message
    }
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

$repoRoot = Split-Path -Parent $PSScriptRoot
$cnameFilePath = Join-Path $repoRoot "CNAME"
$cnameFileValue = ""
if (Test-Path $cnameFilePath) {
  $cnameFileValue = (Get-Content $cnameFilePath -Raw).Trim()
}
$cnameFileOk = ($cnameFileValue -eq $Domain)

$httpsState = Test-HttpsCertificate -HostName $Domain

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

Write-Host "HTTPS certificate status:" -ForegroundColor Yellow
Write-Host "  $($httpsState.Message)"
if (-not $httpsState.IsTrusted) {
  Write-Host "  HTTPS certificate is not trusted yet (likely pending GitHub cert issuance)." -ForegroundColor Red
}
Write-Host ""

$allGood = $aResult.IsMatch -and $wwwOk -and $cnameFileOk -and $httpsState.IsTrusted

if (-not $aaaaResult.IsMatch -and $apexAAAA.Count -eq 0) {
  Write-Host "Note: AAAA records are optional for GitHub Pages. Add them for full IPv6 support." -ForegroundColor DarkYellow
  Write-Host ""
}

if ($allGood) {
  Write-Host "PASS: DNS records and CNAME file match GitHub Pages requirements." -ForegroundColor Green
  Write-Host "Next: in GitHub > Settings > Pages, check Enforce HTTPS when available." -ForegroundColor Green
  exit 0
}

Write-Host "FAIL: One or more checks did not match expected GitHub Pages setup." -ForegroundColor Red
Write-Host "Fix DNS at your registrar, wait for propagation, then run this script again." -ForegroundColor Red
exit 1
