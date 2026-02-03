# Transcription Workflow

Extract transcripts from audio and video files using local faster-whisper or OpenAI's Whisper API.

## Key Tools

Three primary options:
- **extract-transcript.py** - Local transcription (recommended)
- **ExtractTranscript.ts** - API-based transcription
- **SplitAndTranscribe.ts** - For files exceeding 25MB

## Model Options

| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| tiny.en | 75MB | Fastest | Basic |
| base.en | 150MB | Fast | Good (recommended) |
| small.en | 500MB | Medium | Better |
| medium.en | 1.5GB | Slow | High |
| large-v3 | 3GB | Slowest | Highest |

**Recommendation:** Use `base.en` for general use as balanced default.

## Supported Formats

### Audio
- m4a, mp3, wav, flac
- ogg, wma, aac

### Video
- mp4, mov, mkv
- avi, webm

### Output Formats
- Plain text (.txt)
- JSON with timestamps
- SRT subtitles
- WebVTT

## Quick Start

### Local Transcription (Recommended)

```bash
cd skills/PAI/Tools
uv run extract-transcript.py /path/to/audio.m4a
```

Options:
```bash
# Specify model
uv run extract-transcript.py audio.m4a --model base.en

# Output format
uv run extract-transcript.py audio.m4a --format srt

# Custom output path
uv run extract-transcript.py audio.m4a -o transcript.txt
```

### API Transcription

```bash
bun skills/PAI/Tools/ExtractTranscript.ts audio.m4a
```

Requires `OPENAI_API_KEY` environment variable.

### Large Files (>25MB)

```bash
bun skills/PAI/Tools/SplitAndTranscribe.ts large-video.mp4
```

Automatically splits, transcribes segments, and merges results.

## Performance Comparison

| Method | Speed | Cost | Offline |
|--------|-------|------|---------|
| Local (faster-whisper) | 4x realtime | Free | Yes |
| API (OpenAI) | 1x realtime | ~$0.006/min | No |

**Local processing is preferred** unless:
- Specific API features required
- Hardware limitations exist
- Network-only environment

## Use Cases

### Meeting Transcription

```bash
uv run extract-transcript.py meeting.m4a --format txt
```

### Video Subtitles

```bash
uv run extract-transcript.py video.mp4 --format srt -o subtitles.srt
```

### Podcast Processing

```bash
uv run extract-transcript.py episode.mp3 --model medium.en --format json
```

### Batch Processing

```bash
for f in *.m4a; do
  uv run extract-transcript.py "$f" -o "${f%.m4a}.txt"
done
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| Model not found | First run | Model downloads automatically |
| CUDA error | GPU issue | Falls back to CPU |
| File too large | >25MB for API | Use SplitAndTranscribe.ts |
| Unsupported format | Unknown codec | Convert with ffmpeg first |

## Dependencies

### Local Processing
- Python 3.8+
- faster-whisper (`pip install faster-whisper`)
- ffmpeg (for video extraction)

### API Processing
- Node.js / Bun
- OPENAI_API_KEY environment variable

## Related

- Content extraction workflows
- Research skill audio analysis
- Meeting summary pipelines
