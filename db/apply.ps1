param(
  [string]$User = "postgres",
  [string]$DbHost = "127.0.0.1",
  [int]$Port = 5432,
  [string]$Database = "customerhub",
  [string]$Password
)

$ErrorActionPreference = "Stop"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path $psql)) {
  throw "No se encontró psql en $psql"
}

if ($Password) {
  $env:PGPASSWORD = $Password
}

if (-not $env:PGPASSWORD) {
  throw "Pasa -Password o define la variable de entorno PGPASSWORD con la clave del usuario $User."
}

$common = @("-h", $DbHost, "-p", "$Port", "-U", $User, "-v", "ON_ERROR_STOP=1", "-w")

Write-Host "Comprobando si existe la base $Database..."
$exists = (& $psql @common -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$Database'").Trim()
if ($LASTEXITCODE -ne 0) { throw "No se pudo conectar a PostgreSQL como $User." }

if ($exists -ne "1") {
  Write-Host "Creando base $Database..."
  & $psql @common -d postgres -c "CREATE DATABASE $Database"
  if ($LASTEXITCODE -ne 0) { throw "No se pudo crear la base $Database" }
} else {
  Write-Host "La base $Database ya existe."
}

Write-Host "Aplicando esquema..."
& $psql @common -d $Database -f (Join-Path $root "schema.sql")
if ($LASTEXITCODE -ne 0) { throw "Falló schema.sql" }

Write-Host "Cargando datos de demostración..."
& $psql @common -d $Database -f (Join-Path $root "seed.sql")
if ($LASTEXITCODE -ne 0) { throw "Falló seed.sql" }

Write-Host "Listo. Conexión: postgres://${User}@${DbHost}:${Port}/${Database}"
