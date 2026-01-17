# ═══════════════════════════════════════════════════════════════════════════════
# PAI Status Line (PowerShell Core - Cross-Platform)
# ═══════════════════════════════════════════════════════════════════════════════
#
# Responsive status line with 4 display modes based on terminal width:
#   - nano   (<35 cols): Minimal single-line displays
#   - micro  (35-54):    Compact with key metrics
#   - mini   (55-79):    Balanced information density
#   - normal (80+):      Full display with sparklines
#
# Requires: PowerShell 7+ (cross-platform)
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = 'SilentlyContinue'

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

$PAI_DIR = $env:PAI_DIR ?? "$HOME/.claude"
$SETTINGS_FILE = "$PAI_DIR/settings.json"
$RATINGS_FILE = "$PAI_DIR/MEMORY/LEARNING/SIGNALS/ratings.jsonl"
$LOCATION_CACHE = "$PAI_DIR/MEMORY/STATE/location-cache.json"
$WEATHER_CACHE = "$PAI_DIR/MEMORY/STATE/weather-cache.json"

# Context baseline: preloaded tokens not visible to hooks (~22.6k typical)
$CONTEXT_BASELINE = 22600

# Cache TTL in seconds
$LOCATION_CACHE_TTL = 3600  # 1 hour
$WEATHER_CACHE_TTL = 900    # 15 minutes

# ─────────────────────────────────────────────────────────────────────────────
# COLOR PALETTE (ANSI escape codes for cross-platform support)
# ─────────────────────────────────────────────────────────────────────────────

$ESC = [char]27
$RESET = "$ESC[0m"

# Structural colors
$SLATE_300 = "$ESC[38;2;203;213;225m"
$SLATE_400 = "$ESC[38;2;148;163;184m"
$SLATE_500 = "$ESC[38;2;100;116;139m"
$SLATE_600 = "$ESC[38;2;71;85;105m"

# Semantic colors
$EMERALD = "$ESC[38;2;74;222;128m"
$ROSE = "$ESC[38;2;251;113;133m"

# Rating gradient
$RATING_10 = "$ESC[38;2;74;222;128m"
$RATING_8 = "$ESC[38;2;163;230;53m"
$RATING_7 = "$ESC[38;2;250;204;21m"
$RATING_6 = "$ESC[38;2;251;191;36m"
$RATING_5 = "$ESC[38;2;251;146;60m"
$RATING_4 = "$ESC[38;2;248;113;113m"
$RATING_LOW = "$ESC[38;2;239;68;68m"

# Line themes
$GREET_PRIMARY = "$ESC[38;2;167;139;250m"
$WIELD_PRIMARY = "$ESC[38;2;34;211;238m"
$WIELD_ACCENT = "$ESC[38;2;103;232;249m"
$WIELD_WORKFLOWS = "$ESC[38;2;94;234;212m"
$WIELD_HOOKS = "$ESC[38;2;6;182;212m"
$GIT_PRIMARY = "$ESC[38;2;56;189;248m"
$GIT_VALUE = "$ESC[38;2;186;230;253m"
$GIT_DIR = "$ESC[38;2;147;197;253m"
$GIT_CLEAN = "$ESC[38;2;125;211;252m"
$GIT_MODIFIED = "$ESC[38;2;96;165;250m"
$GIT_ADDED = "$ESC[38;2;59;130;246m"
$GIT_AGE_FRESH = "$ESC[38;2;125;211;252m"
$GIT_AGE_RECENT = "$ESC[38;2;96;165;250m"
$GIT_AGE_STALE = "$ESC[38;2;59;130;246m"
$GIT_AGE_OLD = "$ESC[38;2;99;102;241m"
$LEARN_PRIMARY = "$ESC[38;2;167;139;250m"
$LEARN_SECONDARY = "$ESC[38;2;196;181;253m"
$LEARN_WORK = "$ESC[38;2;192;132;252m"
$LEARN_SIGNALS = "$ESC[38;2;139;92;246m"
$LEARN_SESSIONS = "$ESC[38;2;99;102;241m"
$LEARN_RESEARCH = "$ESC[38;2;129;140;248m"
$LEARN_LABEL = "$ESC[38;2;21;128;61m"
$SIGNAL_PERIOD = "$ESC[38;2;148;163;184m"
$CTX_PRIMARY = "$ESC[38;2;129;140;248m"
$CTX_SECONDARY = "$ESC[38;2;165;180;252m"
$CTX_ACCENT = "$ESC[38;2;139;92;246m"
$CTX_BUCKET_EMPTY = "$ESC[38;2;75;82;95m"

# PAI Branding
$PAI_P = "$ESC[38;2;30;58;138m"
$PAI_A = "$ESC[38;2;59;130;246m"
$PAI_I = "$ESC[38;2;147;197;253m"
$PAI_LABEL = "$ESC[38;2;100;116;139m"
$PAI_CITY = "$ESC[38;2;147;197;253m"
$PAI_STATE = "$ESC[38;2;100;116;139m"
$PAI_TIME = "$ESC[38;2;96;165;250m"
$PAI_WEATHER = "$ESC[38;2;135;206;235m"

# ─────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

function Get-RatingColor($val) {
    if ($null -eq $val -or $val -eq "—") { return $SLATE_400 }
    $rating = [int][Math]::Floor($val)
    switch ($rating) {
        { $_ -ge 9 } { return $RATING_10 }
        { $_ -ge 8 } { return $RATING_8 }
        { $_ -ge 7 } { return $RATING_7 }
        { $_ -ge 6 } { return $RATING_6 }
        { $_ -ge 5 } { return $RATING_5 }
        { $_ -ge 4 } { return $RATING_4 }
        default { return $RATING_LOW }
    }
}

function Get-BucketColor($pos, $max) {
    $pct = [int]($pos * 100 / $max)
    if ($pct -le 33) {
        $r = 74 + (250 - 74) * $pct / 33
        $g = 222 + (204 - 222) * $pct / 33
        $b = 128 + (21 - 128) * $pct / 33
    } elseif ($pct -le 66) {
        $t = $pct - 33
        $r = 250 + (251 - 250) * $t / 33
        $g = 204 + (146 - 204) * $t / 33
        $b = 21 + (60 - 21) * $t / 33
    } else {
        $t = $pct - 66
        $r = 251 + (239 - 251) * $t / 34
        $g = 146 + (68 - 146) * $t / 34
        $b = 60 + (68 - 60) * $t / 34
    }
    return "$ESC[38;2;$([int]$r);$([int]$g);$([int]$b)m"
}

function Get-ContextBar($width, $pct) {
    if ($pct -gt 100) { $pct = 100 }
    $filled = [int]($pct * $width / 100)
    if ($filled -lt 0) { $filled = 0 }

    $output = ""
    $script:LAST_BUCKET_COLOR = $EMERALD

    for ($i = 1; $i -le $width; $i++) {
        if ($i -le $filled) {
            $color = Get-BucketColor $i $width
            $script:LAST_BUCKET_COLOR = $color
            $output += "${color}⛁${RESET}"
        } else {
            $output += "${CTX_BUCKET_EMPTY}⛁${RESET}"
        }
        if ($width -gt 8) { $output += " " }
    }
    return $output.TrimEnd()
}

function Get-CacheAge($filePath, $ttl) {
    if (-not (Test-Path $filePath)) { return [int]::MaxValue }
    $age = ((Get-Date) - (Get-Item $filePath).LastWriteTime).TotalSeconds
    return $age
}

# ─────────────────────────────────────────────────────────────────────────────
# TERMINAL WIDTH DETECTION
# ─────────────────────────────────────────────────────────────────────────────

$termWidth = 80
try {
    if ($Host.UI.RawUI.WindowSize.Width) {
        $termWidth = $Host.UI.RawUI.WindowSize.Width
    }
} catch { }

$MODE = switch ($termWidth) {
    { $_ -lt 35 } { "nano" }
    { $_ -lt 55 } { "micro" }
    { $_ -lt 80 } { "mini" }
    default { "normal" }
}

# ─────────────────────────────────────────────────────────────────────────────
# PARSE INPUT
# ─────────────────────────────────────────────────────────────────────────────

$inputData = [Console]::In.ReadToEnd()
$data = $null
try {
    $data = $inputData | ConvertFrom-Json
} catch {
    Write-Output "Error parsing input"
    exit 1
}

# Get DA name and PAI version from settings
$DA_NAME = "Assistant"
$PAI_VERSION = "—"
if (Test-Path $SETTINGS_FILE) {
    try {
        $settings = Get-Content $SETTINGS_FILE -Raw | ConvertFrom-Json
        $DA_NAME = $settings.daidentity.name ?? $settings.daidentity.displayName ?? "Assistant"
        $PAI_VERSION = $settings.pai.version ?? "—"
    } catch { }
}

# Extract data from JSON
$currentDir = $data.workspace.current_dir ?? $data.cwd ?? (Get-Location).Path
$modelName = $data.model.display_name ?? "Unknown"
$modelId = $data.model.id ?? ""
$ccVersion = $data.version ?? "unknown"
$durationMs = $data.cost.total_duration_ms ?? 0
$usage = $data.context_window.current_usage
$contextMax = $data.context_window.context_window_size ?? 200000

$cacheRead = $usage.cache_read_input_tokens ?? 0
$inputTokens = $usage.input_tokens ?? 0
$cacheCreation = $usage.cache_creation_input_tokens ?? 0
$outputTokens = $usage.output_tokens ?? 0

$dirName = Split-Path -Leaf $currentDir

# Shorten model name
$modelShort = switch -Regex ($modelId) {
    'opus-4' { 'opus-4'; break }
    'sonnet-4' { 'sonnet-4'; break }
    'sonnet-3-5' { 'sonnet-3.5'; break }
    'haiku' { 'haiku'; break }
    default { $modelId -replace 'claude-', '' -replace '-\d{8}', '' }
}

# ─────────────────────────────────────────────────────────────────────────────
# COUNT RESOURCES
# ─────────────────────────────────────────────────────────────────────────────

$skillsCount = (Get-ChildItem "$PAI_DIR/skills" -Directory -ErrorAction SilentlyContinue | Measure-Object).Count
$workflowsCount = (Get-ChildItem "$PAI_DIR/skills/*/workflows/*.md" -ErrorAction SilentlyContinue | Measure-Object).Count
$hooksCount = (Get-ChildItem "$PAI_DIR/hooks/*.ts" -ErrorAction SilentlyContinue | Measure-Object).Count
$workCount = (Get-ChildItem "$PAI_DIR/MEMORY/WORK" -Directory -Recurse -Depth 1 -ErrorAction SilentlyContinue | Measure-Object).Count
$ratingsCount = 0
if (Test-Path $RATINGS_FILE) {
    $ratingsCount = (Get-Content $RATINGS_FILE -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
}
$sessionsCount = (Get-ChildItem "$PAI_DIR/MEMORY" -Filter "*.jsonl" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
$researchCount = (Get-ChildItem "$PAI_DIR/MEMORY/RESEARCH" -Include "*.md","*.json" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count

# ─────────────────────────────────────────────────────────────────────────────
# LOCATION & WEATHER (with caching)
# ─────────────────────────────────────────────────────────────────────────────

$locationCity = "Unknown"
$locationState = ""
$weatherStr = "—"

# Fetch location if cache expired
if ((Get-CacheAge $LOCATION_CACHE $LOCATION_CACHE_TTL) -gt $LOCATION_CACHE_TTL) {
    try {
        $locData = Invoke-RestMethod -Uri "http://ip-api.com/json/?fields=city,regionName,country,lat,lon" -TimeoutSec 2
        if ($locData.city) {
            $null = New-Item -Path (Split-Path $LOCATION_CACHE) -ItemType Directory -Force
            $locData | ConvertTo-Json | Set-Content $LOCATION_CACHE
        }
    } catch { }
}

if (Test-Path $LOCATION_CACHE) {
    try {
        $loc = Get-Content $LOCATION_CACHE -Raw | ConvertFrom-Json
        $locationCity = $loc.city ?? "Unknown"
        $locationState = $loc.regionName ?? ""
    } catch { }
}

# Fetch weather if cache expired
if ((Get-CacheAge $WEATHER_CACHE $WEATHER_CACHE_TTL) -gt $WEATHER_CACHE_TTL) {
    try {
        $lat = "37.7749"; $lon = "-122.4194"  # Default SF
        if (Test-Path $LOCATION_CACHE) {
            $loc = Get-Content $LOCATION_CACHE -Raw | ConvertFrom-Json
            $lat = $loc.lat ?? $lat
            $lon = $loc.lon ?? $lon
        }
        $weather = Invoke-RestMethod -Uri "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&current=temperature_2m,weather_code&temperature_unit=celsius" -TimeoutSec 3
        if ($weather.current) {
            $temp = $weather.current.temperature_2m
            $code = $weather.current.weather_code
            $condition = switch ($code) {
                0 { "Clear" }
                { $_ -in 1,2,3 } { "Cloudy" }
                { $_ -in 45,48 } { "Foggy" }
                { $_ -in 51,53,55,56,57 } { "Drizzle" }
                { $_ -in 61,63,65,66,67 } { "Rain" }
                { $_ -in 71,73,75,77,85,86 } { "Snow" }
                { $_ -in 80,81,82 } { "Showers" }
                { $_ -in 95,96,99 } { "Storm" }
                default { "Clear" }
            }
            $null = New-Item -Path (Split-Path $WEATHER_CACHE) -ItemType Directory -Force
            "${temp}°C $condition" | Set-Content $WEATHER_CACHE
        }
    } catch { }
}

if (Test-Path $WEATHER_CACHE) {
    $weatherStr = Get-Content $WEATHER_CACHE -Raw
    $weatherStr = $weatherStr.Trim()
}

$currentTime = Get-Date -Format "HH:mm"

# ─────────────────────────────────────────────────────────────────────────────
# LINE 0: PAI BRANDING
# ─────────────────────────────────────────────────────────────────────────────

switch ($MODE) {
    "nano" {
        Write-Output "${SLATE_600}── │${RESET} ${PAI_P}P${PAI_A}A${PAI_I}I${RESET} ${SLATE_600}│ ────────────${RESET}"
        Write-Output "${PAI_TIME}${currentTime}${RESET} ${PAI_WEATHER}${weatherStr}${RESET}"
        Write-Output "${SLATE_400}ENV:${RESET} ${SLATE_500}v${PAI_A}${PAI_VERSION}${RESET} ${SLATE_400}S:${SLATE_300}${skillsCount}${RESET}"
    }
    "micro" {
        Write-Output "${SLATE_600}── │${RESET} ${PAI_P}P${PAI_A}A${PAI_I}I${RESET} ${PAI_A}STATUSLINE${RESET} ${SLATE_600}│ ──────────────────${RESET}"
        Write-Output "${PAI_LABEL}LOC:${RESET} ${PAI_CITY}${locationCity}${RESET} ${SLATE_600}│${RESET} ${PAI_TIME}${currentTime}${RESET} ${SLATE_600}│${RESET} ${PAI_WEATHER}${weatherStr}${RESET}"
        Write-Output "${SLATE_400}ENV:${RESET} ${SLATE_400}CC:${RESET} ${PAI_A}${ccVersion}${RESET} ${SLATE_600}│${RESET} ${SLATE_500}PAI:${RESET} ${PAI_A}v${PAI_VERSION}${RESET} ${SLATE_600}│${RESET} ${SLATE_400}S:${SLATE_300}${skillsCount}${RESET} ${SLATE_400}W:${SLATE_300}${workflowsCount}${RESET} ${SLATE_400}H:${SLATE_300}${hooksCount}${RESET}"
    }
    "mini" {
        Write-Output "${SLATE_600}── │${RESET} ${PAI_P}P${PAI_A}A${PAI_I}I${RESET} ${PAI_A}STATUSLINE${RESET} ${SLATE_600}│ ────────────────────────────────────────${RESET}"
        Write-Output "${PAI_LABEL}LOC:${RESET} ${PAI_CITY}${locationCity}${RESET}${SLATE_600},${RESET} ${PAI_STATE}${locationState}${RESET} ${SLATE_600}│${RESET} ${PAI_TIME}${currentTime}${RESET} ${SLATE_600}│${RESET} ${PAI_WEATHER}${weatherStr}${RESET}"
        Write-Output "${SLATE_400}ENV:${RESET} ${SLATE_400}CC:${RESET} ${PAI_A}${ccVersion}${RESET} ${SLATE_600}│${RESET} ${SLATE_500}PAI:${RESET} ${PAI_A}v${PAI_VERSION}${RESET} ${SLATE_600}│${RESET} ${WIELD_ACCENT}Skills:${RESET}${SLATE_300}${skillsCount}${RESET} ${WIELD_WORKFLOWS}Workflows:${RESET}${SLATE_300}${workflowsCount}${RESET} ${WIELD_HOOKS}Hooks:${RESET}${SLATE_300}${hooksCount}${RESET}"
    }
    "normal" {
        Write-Output "${SLATE_600}── │${RESET} ${PAI_P}P${PAI_A}A${PAI_I}I${RESET} ${PAI_A}STATUSLINE${RESET} ${SLATE_600}│ ──────────────────────────────────────────────────${RESET}"
        Write-Output "${PAI_LABEL}LOC:${RESET} ${PAI_CITY}${locationCity}${RESET}${SLATE_600},${RESET} ${PAI_STATE}${locationState}${RESET} ${SLATE_600}│${RESET} ${PAI_TIME}${currentTime}${RESET} ${SLATE_600}│${RESET} ${PAI_WEATHER}${weatherStr}${RESET}"
        Write-Output "${SLATE_400}ENV:${RESET} ${SLATE_400}CC:${RESET} ${PAI_A}${ccVersion}${RESET} ${SLATE_600}│${RESET} ${SLATE_500}PAI:${RESET} ${PAI_A}v${PAI_VERSION}${RESET} ${SLATE_600}│${RESET} ${WIELD_ACCENT}Skills:${RESET} ${SLATE_300}${skillsCount}${RESET} ${SLATE_600}│${RESET} ${WIELD_WORKFLOWS}Workflows:${RESET} ${SLATE_300}${workflowsCount}${RESET} ${SLATE_600}│${RESET} ${WIELD_HOOKS}Hooks:${RESET} ${SLATE_300}${hooksCount}${RESET}"
    }
}
Write-Output "${SLATE_600}────────────────────────────────────────────────────────────────────────${RESET}"

# ─────────────────────────────────────────────────────────────────────────────
# LINE 1: CONTEXT
# ─────────────────────────────────────────────────────────────────────────────

$durationSec = [int]($durationMs / 1000)
$timeDisplay = switch ($durationSec) {
    { $_ -ge 3600 } { "$([int]($durationSec / 3600))h$([int](($durationSec % 3600) / 60))m" }
    { $_ -ge 60 } { "$([int]($durationSec / 60))m$($durationSec % 60)s" }
    default { "${durationSec}s" }
}

$contentTokens = $cacheRead + $inputTokens + $cacheCreation + $outputTokens
$contextUsed = $contentTokens + $CONTEXT_BASELINE

$contextPct = 0
$contextK = 0
$maxK = [int]($contextMax / 1000)
if ($contextMax -gt 0 -and $contextUsed -gt 0) {
    $contextPct = [int]($contextUsed * 100 / $contextMax)
    $contextK = [int]($contextUsed / 1000)
}

$pctColor = if ($contextPct -le 33) { $EMERALD } elseif ($contextPct -le 66) { "$ESC[38;2;251;191;36m" } else { $ROSE }

switch ($MODE) {
    "nano" {
        $bar = Get-ContextBar 5 $contextPct
        Write-Output "${CTX_PRIMARY}◉${RESET} $bar ${pctColor}${contextPct}%${RESET} ${CTX_ACCENT}⏱${RESET} ${SLATE_300}${timeDisplay}${RESET}"
    }
    "micro" {
        $bar = Get-ContextBar 6 $contextPct
        Write-Output "${CTX_PRIMARY}◉${RESET} $bar ${pctColor}${contextPct}%${RESET} ${SLATE_500}(${contextK}k)${RESET} ${CTX_ACCENT}⏱${RESET} ${SLATE_300}${timeDisplay}${RESET}"
    }
    "mini" {
        $bar = Get-ContextBar 8 $contextPct
        Write-Output "${CTX_PRIMARY}◉${RESET} ${CTX_SECONDARY}CONTEXT:${RESET} $bar ${pctColor}${contextPct}%${RESET} ${SLATE_500}(${contextK}k/${maxK}k)${RESET} ${CTX_ACCENT}⏱${RESET} ${SLATE_300}${timeDisplay}${RESET}"
    }
    "normal" {
        $bar = Get-ContextBar 16 $contextPct
        Write-Output "${CTX_PRIMARY}◉${RESET} ${CTX_SECONDARY}CONTEXT:${RESET} $bar ${LAST_BUCKET_COLOR}${contextPct}%${RESET} ${SLATE_500}(${contextK}k/${maxK}k)${RESET} ${SLATE_600}│${RESET} ${CTX_ACCENT}⏱${RESET} ${SLATE_300}${timeDisplay}${RESET}"
    }
}
Write-Output "${SLATE_600}────────────────────────────────────────────────────────────────────────${RESET}"

# ─────────────────────────────────────────────────────────────────────────────
# LINE 2: GIT STATUS
# ─────────────────────────────────────────────────────────────────────────────

$isGitRepo = $false
try {
    $null = git rev-parse --git-dir 2>$null
    $isGitRepo = $LASTEXITCODE -eq 0
} catch { }

if ($isGitRepo) {
    $branch = git branch --show-current 2>$null
    if (-not $branch) { $branch = "detached" }

    $modified = (git diff --name-only 2>$null | Measure-Object -Line).Lines
    $staged = (git diff --cached --name-only 2>$null | Measure-Object -Line).Lines
    $untracked = (git ls-files --others --exclude-standard 2>$null | Measure-Object -Line).Lines
    $totalChanged = $modified + $staged

    # Commit age
    $ageDisplay = ""
    $ageColor = $GIT_AGE_FRESH
    try {
        $lastCommitEpoch = git log -1 --format='%ct' 2>$null
        if ($lastCommitEpoch) {
            $commitTime = [DateTimeOffset]::FromUnixTimeSeconds([long]$lastCommitEpoch).LocalDateTime
            $age = (Get-Date) - $commitTime
            if ($age.TotalMinutes -lt 1) { $ageDisplay = "now"; $ageColor = $GIT_AGE_FRESH }
            elseif ($age.TotalHours -lt 1) { $ageDisplay = "$([int]$age.TotalMinutes)m"; $ageColor = $GIT_AGE_FRESH }
            elseif ($age.TotalHours -lt 24) { $ageDisplay = "$([int]$age.TotalHours)h"; $ageColor = $GIT_AGE_RECENT }
            elseif ($age.TotalDays -lt 7) { $ageDisplay = "$([int]$age.TotalDays)d"; $ageColor = $GIT_AGE_STALE }
            else { $ageDisplay = "$([int]$age.TotalDays)d"; $ageColor = $GIT_AGE_OLD }
        }
    } catch { }

    $gitStatusIcon = if ($totalChanged -gt 0 -or $untracked -gt 0) { "*" } else { "✓" }

    switch ($MODE) {
        "nano" {
            $status = if ($gitStatusIcon -eq "✓") { "${GIT_CLEAN}✓${RESET}" } else { "${GIT_MODIFIED}*${totalChanged}${RESET}" }
            Write-Output "${GIT_PRIMARY}◈${RESET} ${GIT_DIR}${dirName}${RESET} ${GIT_VALUE}${branch}${RESET} $status"
        }
        "micro" {
            $status = if ($gitStatusIcon -eq "✓") { "${GIT_CLEAN}${gitStatusIcon}${RESET}" } else { "${GIT_MODIFIED}${gitStatusIcon}${totalChanged}${RESET}" }
            $ageStr = if ($ageDisplay) { " ${ageColor}${ageDisplay}${RESET}" } else { "" }
            Write-Output "${GIT_PRIMARY}◈${RESET} ${GIT_DIR}${dirName}${RESET} ${GIT_VALUE}${branch}${RESET}${ageStr} $status"
        }
        "mini" {
            $status = if ($gitStatusIcon -eq "✓") { "${GIT_CLEAN}${gitStatusIcon}${RESET}" } else { "${GIT_MODIFIED}${gitStatusIcon}${totalChanged}${RESET}" }
            if ($untracked -gt 0 -and $gitStatusIcon -ne "✓") { $status += " ${GIT_ADDED}+${untracked}${RESET}" }
            $ageStr = if ($ageDisplay) { " ${SLATE_600}│${RESET} ${ageColor}${ageDisplay}${RESET}" } else { "" }
            Write-Output "${GIT_PRIMARY}◈${RESET} ${GIT_DIR}${dirName}${RESET} ${SLATE_600}│${RESET} ${GIT_VALUE}${branch}${RESET}${ageStr} ${SLATE_600}│${RESET} $status"
        }
        "normal" {
            $line = "${GIT_PRIMARY}◈${RESET} ${GIT_PRIMARY}PWD:${RESET} ${GIT_DIR}${dirName}${RESET} ${SLATE_600}│${RESET} ${GIT_PRIMARY}Branch:${RESET} ${GIT_VALUE}${branch}${RESET}"
            if ($ageDisplay) { $line += " ${SLATE_600}│${RESET} ${GIT_PRIMARY}Age:${RESET} ${ageColor}${ageDisplay}${RESET}" }
            if ($totalChanged -gt 0 -or $untracked -gt 0) {
                $line += " ${SLATE_600}│${RESET}"
                if ($totalChanged -gt 0) { $line += " ${GIT_PRIMARY}Mod:${RESET} ${GIT_MODIFIED}${totalChanged}${RESET}" }
                if ($untracked -gt 0) { $line += " ${GIT_PRIMARY}New:${RESET} ${GIT_ADDED}${untracked}${RESET}" }
            } else {
                $line += " ${SLATE_600}│${RESET} ${GIT_CLEAN}✓ clean${RESET}"
            }
            Write-Output $line
        }
    }
}
Write-Output "${SLATE_600}────────────────────────────────────────────────────────────────────────${RESET}"

# ─────────────────────────────────────────────────────────────────────────────
# LINE 3: MEMORY
# ─────────────────────────────────────────────────────────────────────────────

switch ($MODE) {
    "nano" {
        Write-Output "${LEARN_PRIMARY}◎${RESET} ${LEARN_WORK}📁${RESET} ${SLATE_300}${workCount}${RESET} ${LEARN_SIGNALS}✦${RESET} ${SLATE_300}${ratingsCount}${RESET} ${LEARN_SESSIONS}⊕${RESET} ${SLATE_300}${sessionsCount}${RESET} ${LEARN_RESEARCH}◇${RESET} ${SLATE_300}${researchCount}${RESET}"
    }
    "micro" {
        Write-Output "${LEARN_PRIMARY}◎${RESET} ${LEARN_WORK}📁${RESET} ${SLATE_300}${workCount}${RESET} ${LEARN_SIGNALS}✦${RESET} ${SLATE_300}${ratingsCount}${RESET} ${LEARN_SESSIONS}⊕${RESET} ${SLATE_300}${sessionsCount}${RESET} ${LEARN_RESEARCH}◇${RESET} ${SLATE_300}${researchCount}${RESET}"
    }
    "mini" {
        Write-Output "${LEARN_PRIMARY}◎${RESET} ${LEARN_SECONDARY}MEMORY:${RESET} ${LEARN_WORK}📁${RESET} ${SLATE_300}${workCount}${RESET} ${SLATE_600}│${RESET} ${LEARN_SIGNALS}✦${RESET} ${SLATE_300}${ratingsCount}${RESET} ${SLATE_600}│${RESET} ${LEARN_SESSIONS}⊕${RESET} ${SLATE_300}${sessionsCount}${RESET} ${SLATE_600}│${RESET} ${LEARN_RESEARCH}◇${RESET} ${SLATE_300}${researchCount}${RESET}"
    }
    "normal" {
        Write-Output "${LEARN_PRIMARY}◎${RESET} ${LEARN_SECONDARY}MEMORY:${RESET} ${LEARN_WORK}📁${RESET} ${SLATE_300}${workCount}${RESET} ${LEARN_WORK}Work${RESET} ${SLATE_600}│${RESET} ${LEARN_SIGNALS}✦${RESET} ${SLATE_300}${ratingsCount}${RESET} ${LEARN_SIGNALS}Ratings${RESET} ${SLATE_600}│${RESET} ${LEARN_SESSIONS}⊕${RESET} ${SLATE_300}${sessionsCount}${RESET} ${LEARN_SESSIONS}Sessions${RESET} ${SLATE_600}│${RESET} ${LEARN_RESEARCH}◇${RESET} ${SLATE_300}${researchCount}${RESET} ${LEARN_RESEARCH}Research${RESET}"
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# LINE 4: LEARNING (simplified - no sparklines for performance)
# ─────────────────────────────────────────────────────────────────────────────

if ((Test-Path $RATINGS_FILE) -and $ratingsCount -gt 0) {
    try {
        $ratings = Get-Content $RATINGS_FILE | ForEach-Object { $_ | ConvertFrom-Json }
        $now = Get-Date

        # Calculate averages for different periods
        $hourAgo = $now.AddHours(-1)
        $dayAgo = $now.AddDays(-1)
        $weekAgo = $now.AddDays(-7)

        $hourRatings = $ratings | Where-Object { [DateTime]::Parse($_.timestamp) -gt $hourAgo } | Select-Object -ExpandProperty rating
        $dayRatings = $ratings | Where-Object { [DateTime]::Parse($_.timestamp) -gt $dayAgo } | Select-Object -ExpandProperty rating
        $weekRatings = $ratings | Where-Object { [DateTime]::Parse($_.timestamp) -gt $weekAgo } | Select-Object -ExpandProperty rating

        $hourAvg = if ($hourRatings) { [Math]::Round(($hourRatings | Measure-Object -Average).Average, 1) } else { "—" }
        $dayAvg = if ($dayRatings) { [Math]::Round(($dayRatings | Measure-Object -Average).Average, 1) } else { "—" }
        $weekAvg = if ($weekRatings) { [Math]::Round(($weekRatings | Measure-Object -Average).Average, 1) } else { "—" }
        $latest = $ratings[-1].rating

        $HOUR_COLOR = Get-RatingColor $hourAvg
        $DAY_COLOR = Get-RatingColor $dayAvg
        $WEEK_COLOR = Get-RatingColor $weekAvg
        $LATEST_COLOR = Get-RatingColor $latest

        switch ($MODE) {
            "nano" {
                Write-Output "${LEARN_LABEL}✿${RESET} ${LATEST_COLOR}${latest}${RESET} ${SIGNAL_PERIOD}1d:${RESET} ${DAY_COLOR}${dayAvg}${RESET}"
            }
            "micro" {
                Write-Output "${LEARN_LABEL}✿${RESET} ${LATEST_COLOR}${latest}${RESET} ${SIGNAL_PERIOD}1h:${RESET} ${HOUR_COLOR}${hourAvg}${RESET} ${SIGNAL_PERIOD}1d:${RESET} ${DAY_COLOR}${dayAvg}${RESET} ${SIGNAL_PERIOD}1w:${RESET} ${WEEK_COLOR}${weekAvg}${RESET}"
            }
            "mini" {
                Write-Output "${LEARN_LABEL}✿${RESET} ${LEARN_LABEL}LEARNING:${RESET} ${SLATE_600}│${RESET} ${LATEST_COLOR}${latest}${RESET} ${SIGNAL_PERIOD}1h:${RESET} ${HOUR_COLOR}${hourAvg}${RESET} ${SIGNAL_PERIOD}1d:${RESET} ${DAY_COLOR}${dayAvg}${RESET} ${SIGNAL_PERIOD}1w:${RESET} ${WEEK_COLOR}${weekAvg}${RESET}"
            }
            "normal" {
                Write-Output "${LEARN_LABEL}✿${RESET} ${LEARN_LABEL}LEARNING:${RESET} ${SLATE_600}│${RESET} ${LATEST_COLOR}${latest}${RESET} ${SLATE_600}│${RESET} ${SIGNAL_PERIOD}1h:${RESET} ${HOUR_COLOR}${hourAvg}${RESET} ${SIGNAL_PERIOD}1d:${RESET} ${DAY_COLOR}${dayAvg}${RESET} ${SIGNAL_PERIOD}1w:${RESET} ${WEEK_COLOR}${weekAvg}${RESET}"
            }
        }
    } catch {
        Write-Output "${LEARN_LABEL}✿${RESET} ${LEARN_LABEL}LEARNING:${RESET}"
        Write-Output "  ${SLATE_500}No ratings yet${RESET}"
    }
} else {
    Write-Output "${LEARN_LABEL}✿${RESET} ${LEARN_LABEL}LEARNING:${RESET}"
    Write-Output "  ${SLATE_500}No ratings yet${RESET}"
}
