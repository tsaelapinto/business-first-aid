<#
.SYNOPSIS
    Validates that Vercel production == local main (by commit SHA).
    If behind, pushes to GitHub and triggers a new prod deployment.
    Usage: powershell -ExecutionPolicy Bypass -File check-vercel.ps1
#>
# Set $env:VERCEL_TOKEN before running, or pass -Token argument
param([string]$Token = $env:VERCEL_TOKEN)
if (-not $Token) { Write-Host "ERROR: Set VERCEL_TOKEN env var or pass -Token" -ForegroundColor Red; exit 1 }
$TOKEN   = $Token
$HEADERS = @{ Authorization = "Bearer $TOKEN" }
Set-Location 'c:\business-first-aid'

# ── 1. Local branch & SHA ─────────────────────────────────────────────────────
$localBranch = (git rev-parse --abbrev-ref HEAD).Trim()
$localSHA    = (git rev-parse HEAD).Trim()
Write-Host ""
Write-Host "LOCAL" -ForegroundColor Cyan
Write-Host "  Branch : $localBranch"
Write-Host "  SHA    : $localSHA"

# ── 2. Fetch last production deployment from Vercel ───────────────────────────
Write-Host ""
Write-Host "VERCEL PRODUCTION" -ForegroundColor Cyan
$projects = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects?limit=20" -Headers $HEADERS
$project  = $projects.projects | Where-Object { $_.name -eq "business-first-aid" } | Select-Object -First 1

if (-not $project) {
    Write-Host "  ERROR: project not found. Available: $($projects.projects.name -join ', ')" -ForegroundColor Red
    exit 1
}

$deps    = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=$($project.id)&target=production&limit=1&state=READY" -Headers $HEADERS
$prodDep = $deps.deployments | Select-Object -First 1

if (-not $prodDep) {
    Write-Host "  ERROR: No READY production deployment found!" -ForegroundColor Red
    exit 1
}

$prodSHA = $prodDep.meta.githubCommitSha
Write-Host "  URL    : https://$($prodDep.url)"
Write-Host "  Branch : $($prodDep.meta.githubCommitRef)"
Write-Host "  SHA    : $prodSHA"
Write-Host "  Commit : $($prodDep.meta.githubCommitMessage)"

# ── 3. Compare & report ───────────────────────────────────────────────────────
Write-Host ""
Write-Host "RESULT" -ForegroundColor Cyan

if ($localSHA -eq $prodSHA) {
    Write-Host "  [PASS] main = production  ($($localSHA.Substring(0,12)))" -ForegroundColor Green
    exit 0
}

$shortL = $localSHA.Substring(0,12)
$shortP = if ($prodSHA) { $prodSHA.Substring(0,[Math]::Min(12,$prodSHA.Length)) } else { "(none)" }
Write-Host "  [FAIL] master($shortL) != production($shortP)" -ForegroundColor Red

# ── 4. Fix: push & redeploy ───────────────────────────────────────────────────
Write-Host ""
Write-Host "DEPLOYING" -ForegroundColor Yellow
Write-Host "  git push origin $localBranch ..."
git push origin $localBranch 2>&1 | ForEach-Object { Write-Host "    $_" }

Write-Host "  vercel deploy --prod ..."
$out = npx vercel deploy --prod --token $TOKEN --yes 2>&1
$out | ForEach-Object { Write-Host "    $_" }

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  [FAIL] Deployment failed. See above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  [PASS] Deployment triggered. Re-run in ~2 min to confirm SHA match." -ForegroundColor Green
