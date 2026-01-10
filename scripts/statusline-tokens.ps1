$rawInput = [Console]::In.ReadToEnd()
$data = $rawInput | ConvertFrom-Json
$total = $data.context_window.total_input_tokens + $data.context_window.total_output_tokens
$usage = $data.context_window.current_usage
$model = $data.model.display_name

function Get-ProgressBar {
    param([int]$Percent, [int]$Width = 10)
    $filled = [math]::Floor($Percent * $Width / 100)
    $empty = $Width - $filled
    return ("=" * $filled) + ("-" * $empty)
}

if ($usage) {
    $current = $usage.input_tokens + $usage.cache_creation_input_tokens + $usage.cache_read_input_tokens
    $size = $data.context_window.context_window_size
    $pct = [math]::Floor($current * 100 / $size)
    $bar = Get-ProgressBar -Percent $pct
    Write-Host ('[{0}] {1:N0} tokens [{2}] {3}%' -f $model, $total, $bar, $pct)
} else {
    $bar = Get-ProgressBar -Percent 0
    Write-Host ('[{0}] {1:N0} tokens [{2}] 0%' -f $model, $total, $bar)
}
