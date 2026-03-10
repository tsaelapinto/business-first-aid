#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Validates that the production Vercel deployment matches the local main branch.
    If they differ, it force-deploys main to production.
#>

# Set $env:VERCEL_TOKEN before running, or pass -VercelToken argument
param([string]$VercelToken = $env:VERCEL_TOKEN)
if (-not $VercelToken) { Write-Host "ERROR: Set VERCEL_TOKEN env var or pass -VercelToken" -ForegroundColor Red; exit 1 }
$VERCEL_TOKEN = $VercelToken
$VERCEL_PROJECT = "business-first-aid"

$headers = @{
    Authorization = "Bearer $VERCEL_TOKEN"
    "Content-Type" = "application/json"
}

# ── 1. Get local main HEAD SHA ────────────────────────────────────────────────
Write-Host "`n[1/4] Checking local main branch..." -ForegroundColor Cyan
$localSHA = git rev-parse origin/main 2>&1
if ($LASTEXITCODE -ne 0) {
    $localSHA = git rev-parse HEAD 2>&1
}
Write-Host "  Local  main SHA : $localSHA" -ForegroundColor White

# ── 2. Get latest production deployment from Vercel ───────────────────────────
Write-Host "[2/4] Querying Vercel production deployment..." -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod `
        -Uri "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT&target=production&limit=1&state=READY" `
        -Headers $headers `
        -Method GET
    $prodDeployment = $resp.deployments | Select-Object -First 1
} catch {
    Write-Host "  [WARN] Could not fetch by project name, trying slug..." -ForegroundColor Yellow
    # Try fetching all projects first to get the exact ID
    $projects = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects?limit=20" -Headers $headers -Method GET
    $project = $projects.projects | Where-Object { $_.name -eq $VERCEL_PROJECT } | Select-Object -First 1
    if (-not $project) {
        Write-Host "  [ERROR] Project '$VERCEL_PROJECT' not found on Vercel!" -ForegroundColor Red
        Write-Host "  Available projects:" -ForegroundColor Yellow
        $projects.projects | ForEach-Object { Write-Host "    - $($_.name)" }
        exit 1
    }
    Write-Host "  Found project ID: $($project.id)" -ForegroundColor Green
    $resp = Invoke-RestMethod `
        -Uri "https://api.vercel.com/v6/deployments?projectId=$($project.id)&target=production&limit=1&state=READY" `
        -Headers $headers `
        -Method GET
    $prodDeployment = $resp.deployments | Select-Object -First 1
}

if (-not $prodDeployment) {
    Write-Host "  [ERROR] No production deployment found!" -ForegroundColor Red
    exit 1
}

$prodSHA    = $prodDeployment.meta.githubCommitSha
$prodURL    = "https://$($prodDeployment.url)"
$prodState  = $prodDeployment.state
$prodMsg    = $prodDeployment.meta.githubCommitMessage

Write-Host "  Production SHA   : $prodSHA" -ForegroundColor White
Write-Host "  Production URL   : $prodURL" -ForegroundColor White
Write-Host "  Production State : $prodState" -ForegroundColor White
Write-Host "  Commit message   : $prodMsg" -ForegroundColor DarkGray

# ── 3. Compare ────────────────────────────────────────────────────────────────
Write-Host "`n[3/4] Comparing..." -ForegroundColor Cyan

$shortLocal = $localSHA.Substring(0, [Math]::Min(12, $localSHA.Length))
$shortProd  = if ($prodSHA) { $prodSHA.Substring(0, [Math]::Min(12, $prodSHA.Length)) } else { "(unknown)" }

if ($localSHA -eq $prodSHA) {
    Write-Host "  [PASS] main = production  ($shortLocal)" -ForegroundColor Green
    Write-Host "`n  No deployment needed. Live site is up to date." -ForegroundColor Green
    exit 0
} else {
    Write-Host "  [FAIL] main ($shortLocal) != production ($shortProd)" -ForegroundColor Red
    Write-Host "  Production is BEHIND. Deploying now..." -ForegroundColor Yellow
}

# ── 4. Force deploy main to production ───────────────────────────────────────
Write-Host "`n[4/4] Deploying main to production..." -ForegroundColor Cyan

# Make sure git is in sync first
Write-Host "  Pushing latest commits to GitHub..." -ForegroundColor DarkGray
git push origin main 2>&1 | Write-Host
if ($LASTEXITCODE -ne 0) {
    git push origin master 2>&1 | Write-Host
}

# Trigger Vercel deployment
Write-Host "  Triggering Vercel production deploy..." -ForegroundColor DarkGray
$deployOutput = npx vercel deploy --prod --token $VERCEL_TOKEN --yes 2>&1
$deployOutput | Write-Host

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n  [PASS] Deployment succeeded!" -ForegroundColor Green
    # Re-check after deploy
    Write-Host "  Waiting 5s then re-validating..." -ForegroundColor DarkGray
    Start-Sleep -Seconds 5
    $localSHA2   = git rev-parse origin/main 2>&1
    $resp2       = Invoke-RestMethod `
        -Uri "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT&target=production&limit=1&state=READY" `
        -Headers $headers -Method GET
    $newProdSHA  = $resp2.deployments[0].meta.githubCommitSha
    if ($localSHA2 -eq $newProdSHA) {
        Write-Host "  [PASS] Confirmed: main = production" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Deploy triggered but SHA not yet updated (build may still be running)." -ForegroundColor Yellow
        Write-Host "  Check: https://vercel.com/dashboard" -ForegroundColor DarkGray
    }
} else {
    Write-Host "`n  [ERROR] Deployment failed. See output above." -ForegroundColor Red
    exit 1
}
