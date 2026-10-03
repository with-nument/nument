#!/bin/sh
# Export the first frame of every project video as a WebP poster (shown before playback).
cd "$(dirname "$0")/../.."
for v in public/project*/video*.mp4; do
  tmp="${TMPDIR:-/tmp}/poster-$$.png"
  ffmpeg -loglevel error -y -i "$v" -frames:v 1 "$tmp"
  cwebp -quiet -q 82 "$tmp" -o "${v%.mp4}-poster.webp"
  rm -f "$tmp"
done
