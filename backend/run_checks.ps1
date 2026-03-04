# Run simple health check and then run smoke_test.py twice
$base = 'http://127.0.0.1:5000'
Write-Output "Checking $base/api/health"
try {
  $h = Invoke-RestMethod -Uri "$base/api/health" -TimeoutSec 5
  Write-Output "Health: $($h.status)"
} catch {
  Write-Error "Health check failed. Ensure backend is running."
  exit 2
}

# run smoke tests twice
for ($i=1; $i -le 2; $i++) {
  Write-Output "Running smoke_test run #$i"
  python smoke_test.py
  if ($LASTEXITCODE -ne 0) {
    Write-Error "smoke_test.py failed on run #$i"
    exit 3
  }
}
Write-Output "All checks passed"
