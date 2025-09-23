// Simple final test script using PowerShell commands
echo "🚀 Testing Code Editor Complete Functionality"
echo ""

$tests = @(
    @{ name = "Python Hello World"; lang = 71; code = 'print("Hello from Python!")'; expected = "Hello from Python!" },
    @{ name = "JavaScript Hello World"; lang = 63; code = 'console.log("Hello from JavaScript!");'; expected = "Hello from JavaScript!" },
    @{ name = "Java Hello World"; lang = 62; code = 'System.out.println("Hello from Java!");'; expected = "Hello from Java!" }
)

$passed = 0
$failed = 0

foreach ($test in $tests) {
    try {
        $body = @{
            language_id = $test.lang
            source_code = $test.code
            stdin = ""
        } | ConvertTo-Json -Depth 2

        $result = Invoke-WebRequest -Uri "http://localhost:5001/api/code/execute" -Method POST -Body $body -ContentType "application/json"
        $resultJson = $result.Content | ConvertFrom-Json
        $output = $resultJson.stdout.Trim()
        
        if ($output -like "*$($test.expected)*") {
            Write-Host "✅ $($test.name): PASSED" -ForegroundColor Green
            Write-Host "   Expected: '$($test.expected)'" -ForegroundColor Gray
            Write-Host "   Got: '$output'" -ForegroundColor Gray
            $passed++
        } else {
            Write-Host "❌ $($test.name): FAILED" -ForegroundColor Red
            Write-Host "   Expected: '$($test.expected)'" -ForegroundColor Gray
            Write-Host "   Got: '$output'" -ForegroundColor Gray
            $failed++
        }
    } catch {
        Write-Host "❌ $($test.name): ERROR - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    Write-Host ""
}

Write-Host "📊 Final Results:" -ForegroundColor Cyan
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
$successRate = [math]::Round(($passed / ($passed + $failed)) * 100)
Write-Host "📈 Success Rate: $successRate%" -ForegroundColor Yellow

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "🎉 All tests passed! Code editor is working perfectly!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️ Some tests failed. Check the issues above." -ForegroundColor Yellow
}