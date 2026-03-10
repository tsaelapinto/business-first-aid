param(
  [Parameter(Mandatory=$false)]
  [string]$Token = $env:VERCEL_TOKEN
)
$token = $Token
$headers = @{ Authorization = "Bearer $token" }

Write-Host "Fetching build logs for last failed deployment..." -ForegroundColor Cyan

# Get the latest deployment
$deps = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=prj_kyMXPN9A3qgMtuhoYAbj55gTCCHK&limit=5" -Headers $headers
$failed = $deps.deployments | Where-Object { $_.state -eq "ERROR" } | Select-Object -First 1

if (-not $failed) {
    Write-Host "No failed deployment found recently."
    $failed = $deps.deployments | Select-Object -First 1
    Write-Host "Using latest deployment: $($failed.uid) - $($failed.state)"
}

Write-Host "Deployment: $($failed.uid)" -ForegroundColor Yellow

$events = Invoke-RestMethod -Uri "https://api.vercel.com/v2/deployments/$($failed.uid)/events" -Headers $headers
$events | ForEach-Object {
    if ($_.type -eq "stderr" -or ($_.text -like "*error*") -or ($_.text -like "*Error*") -or ($_.text -like "*failed*")) {
        Write-Host $_.text -ForegroundColor Red
    }
}
