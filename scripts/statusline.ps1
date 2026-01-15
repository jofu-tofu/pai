# Status line generator for Claude Code
# Reads JSON input from stdin and outputs formatted status line

$inputData = [Console]::In.ReadToEnd()

try {
    $data = $inputData | ConvertFrom-Json

    # Extract model name and shorten it
    $modelId = $data.model.id
    $modelShort = switch -Regex ($modelId) {
        'opus-4' { 'opus-4'; break }
        'sonnet-4' { 'sonnet-4'; break }
        'sonnet-3-5' { 'sonnet-3.5'; break }
        'haiku' { 'haiku'; break }
        default { ($modelId -replace 'claude-', '' -replace '-\d{8}', '') }
    }

    # Calculate token usage
    $usage = $data.context_window.current_usage
    $cwd = Get-Location | Select-Object -ExpandProperty Path
    if ($usage) {
        $currentTokens = $usage.input_tokens + $usage.cache_creation_input_tokens + $usage.cache_read_input_tokens
        $windowSize = $data.context_window.context_window_size
        $percent = [math]::Floor(($currentTokens * 100) / $windowSize)
        Write-Output "[$modelShort] $currentTokens tokens ($percent%) | $cwd"
    } else {
        Write-Output "[$modelShort] 0 tokens (0%) | $cwd"
    }
} catch {
    Write-Output "Error: $_"
}
