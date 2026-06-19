param(
  [Parameter(Mandatory = $true)]
  [string]$Keyword,

  [string]$Domain = "manuleaconstruction.co.nz",
  [string]$Gl = "nz",
  [string]$Hl = "en",
  [int]$MaxResults = 100
)

$ErrorActionPreference = "Stop"

if ($MaxResults -lt 10 -or $MaxResults -gt 100) {
  throw "MaxResults must be between 10 and 100."
}

$apiKey = $env:SERPAPI_API_KEY
if ([string]::IsNullOrWhiteSpace($apiKey)) {
  throw "SERPAPI_API_KEY is not set. Create an API key at serpapi.com and set it before running this script."
}

$encodedKeyword = [System.Uri]::EscapeDataString($Keyword)
$resultsPerPage = 10
$globalPosition = 0
$bestMatch = $null

Write-Host "Checking Google rankings..." -ForegroundColor Cyan
Write-Host "Keyword: $Keyword" -ForegroundColor Cyan
Write-Host "Domain:  $Domain" -ForegroundColor Cyan
Write-Host "Locale:  gl=$Gl hl=$Hl" -ForegroundColor Cyan
Write-Host ""

for ($start = 0; $start -lt $MaxResults; $start += $resultsPerPage) {
  $url = "https://serpapi.com/search.json?engine=google&q=$encodedKeyword&gl=$Gl&hl=$Hl&num=$resultsPerPage&start=$start&api_key=$apiKey"
  $response = Invoke-RestMethod -Uri $url -Method Get

  if ($null -eq $response.organic_results) {
    break
  }

  foreach ($result in $response.organic_results) {
    $globalPosition += 1

    $link = ""
    if ($null -ne $result.link) {
      $link = [string]$result.link
    }

    if ($link -match [Regex]::Escape($Domain)) {
      $bestMatch = [PSCustomObject]@{
        Position = $globalPosition
        Title = [string]$result.title
        Link = $link
      }
      break
    }
  }

  if ($null -ne $bestMatch) {
    break
  }

  if ($response.organic_results.Count -lt $resultsPerPage) {
    break
  }
}

if ($null -ne $bestMatch) {
  Write-Host "FOUND" -ForegroundColor Green
  Write-Host "Position: $($bestMatch.Position)" -ForegroundColor Green
  Write-Host "Title:    $($bestMatch.Title)"
  Write-Host "URL:      $($bestMatch.Link)"
  exit 0
}

Write-Host "NOT FOUND" -ForegroundColor Yellow
Write-Host "No result for '$Domain' was found in the top $MaxResults results for '$Keyword'."
exit 1
