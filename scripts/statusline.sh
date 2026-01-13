#!/usr/bin/env bash
# Status line generator for Claude Code
# Reads JSON input from stdin and outputs formatted status line

# Read all input from stdin
input_data=$(cat)

# Parse JSON and extract model info
model_id=$(echo "$input_data" | jq -r '.model.id')

# Shorten model name
case "$model_id" in
  *opus-4*)
    model_short="opus-4"
    ;;
  *sonnet-4*)
    model_short="sonnet-4"
    ;;
  *sonnet-3-5*)
    model_short="sonnet-3.5"
    ;;
  *haiku*)
    model_short="haiku"
    ;;
  *)
    model_short=$(echo "$model_id" | sed 's/claude-//' | sed 's/-[0-9]\{8\}//')
    ;;
esac

# Calculate token usage
current_tokens=$(echo "$input_data" | jq -r '
  (.context_window.current_usage.input_tokens // 0) +
  (.context_window.current_usage.cache_creation_input_tokens // 0) +
  (.context_window.current_usage.cache_read_input_tokens // 0)
')

window_size=$(echo "$input_data" | jq -r '.context_window.context_window_size // 0')

if [ "$current_tokens" != "null" ] && [ "$current_tokens" != "0" ] && [ "$window_size" != "0" ]; then
  percent=$(echo "scale=0; ($current_tokens * 100) / $window_size" | bc)
  echo "[$model_short] $current_tokens tokens (${percent}%)"
else
  echo "[$model_short] 0 tokens (0%)"
fi
