Param(
  [string]$DockerContainer = 'godlevel-db',
  [string]$DbUrl = $env:DATABASE_URL
)

function Show-Help {
  @"
Usage: .\scripts\apply-materialized-views.ps1 [-DockerContainer <name>] [-DbUrl <DATABASE_URL>]

This script applies the materialized-views SQL to your database. It supports two modes:
  1) If -DbUrl is provided (or DATABASE_URL env var), it runs psql locally against that URL.
  2) Otherwise it will try to exec into the docker container (default name: godlevel-db) and run psql there.

Examples:
  $env:DATABASE_URL = 'postgresql://challenge:challenge_2024@localhost:5432/challenge_db'; .\scripts\apply-materialized-views.ps1
  .\scripts\apply-materialized-views.ps1 -DockerContainer godlevel-db
"@
}

if ($PSBoundParameters.Help) { Show-Help; exit 0 }

$SqlFile = 'apps/frontend/prisma/migrations/20251103_add_materialized_views.sql'

if ($DbUrl) {
  if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Error 'psql not found in PATH. Install PostgreSQL client or use -DockerContainer.'; exit 2
  }
  Write-Host "Applying materialized views using psql via DbUrl..."
  & psql $DbUrl -f $SqlFile
  Write-Host 'Done.'
  exit 0
}

# Fallback: docker exec
$containers = docker ps --format '{{.Names}}' | Out-String
if ($containers -match [regex]::Escape($DockerContainer)) {
  Write-Host "Found container $DockerContainer. Executing SQL inside container..."
  docker cp $SqlFile "${DockerContainer}:/tmp/mv.sql"
  docker exec -it $DockerContainer psql -U challenge -d challenge_db -f /tmp/mv.sql
  Write-Host 'Done.'
  exit 0
} else {
  Write-Error "Docker container '$DockerContainer' not running and no DATABASE_URL provided. Start the DB or provide -DbUrl."; exit 3
}
