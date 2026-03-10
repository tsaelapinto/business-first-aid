# Render deployment script for business-first-aid
# Requires: $RENDER_API_KEY, $GITHUB_REPO (set before running)
param(
    [string]$GitHubRepo,   # e.g. "Tsaela/business-first-aid"
    [string]$RenderApiKey = "rnd_jq8FEscMBppi8aiw5woifftmpiON"
)

$headers = @{
    Authorization = "Bearer $RenderApiKey"
    "Content-Type" = "application/json"
}

Write-Host "Fetching Render owner info..." -ForegroundColor Cyan
$me = Invoke-RestMethod -Uri "https://api.render.com/v1/owners?limit=1" -Headers $headers
$ownerId = $me[0].owner.id
Write-Host "Owner ID: $ownerId" -ForegroundColor Green

$body = @{
    type = "web_service"
    name = "business-first-aid"
    ownerId = $ownerId
    repo = "https://github.com/$GitHubRepo"
    autoDeploy = "yes"
    serviceDetails = @{
        env = "node"
        plan = "free"
        envSpecificDetails = @{
            buildCommand = "npm ci && npx prisma generate && npm run build"
            startCommand = "npm start"
            nodeVersion = "20"
        }
        envVars = @(
            @{ key = "NODE_ENV"; value = "production" }
            @{ key = "NEXT_TELEMETRY_DISABLED"; value = "1" }
            @{ key = "DATABASE_URL"; value = "file:./dev.db" }
        )
    }
} | ConvertTo-Json -Depth 10

Write-Host "Creating Render service..." -ForegroundColor Cyan
$svc = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method POST -Headers $headers -Body $body
Write-Host "Service created!" -ForegroundColor Green
Write-Host "Service ID:  $($svc.service.id)"
Write-Host "Service URL: https://$($svc.service.serviceDetails.url)"
Write-Host ""
Write-Host "Next: Add custom domains in Render dashboard:" -ForegroundColor Yellow
Write-Host "  www.harelitos.com   -> front-office (triage + results)"
Write-Host "  admin.harelitos.com -> back-office (/backoffice)"
