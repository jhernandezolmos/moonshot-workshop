#!/usr/bin/env bash
# Re-encodes the generated clips for scroll scrubbing: frequent keyframes and no
# B-frames keep seeking smooth in both directions; audio is dropped entirely.
set -euo pipefail

cd "$(dirname "$0")/.."
RAW_DIR="../generated/raw"
OUT_DIR="public/media"
mkdir -p "$OUT_DIR"

shopt -s nullglob
clips=("$RAW_DIR"/*.mp4)
if [ ${#clips[@]} -eq 0 ]; then
  echo "No clips in $RAW_DIR. Run 'npm run moonshot:generate' from the repository root first."
  exit 1
fi

for src in "${clips[@]}"; do
  id="$(basename "$src" .mp4)"
  out="$OUT_DIR/$id.mp4"
  poster="$OUT_DIR/$id.jpg"
  if [ -f "$out" ] && [ "$out" -nt "$src" ]; then
    echo "[$id] up to date"
    continue
  fi
  echo "[$id] encoding"
  ffmpeg -loglevel error -y -i "$src" -an \
    -vf "scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,format=yuv420p" \
    -c:v libx264 -preset slow -crf 23 -g 4 -keyint_min 4 -sc_threshold 0 -bf 0 \
    -movflags +faststart "$out"
  ffmpeg -loglevel error -y -i "$out" -frames:v 1 -q:v 3 "$poster"
done

du -sh "$OUT_DIR"
