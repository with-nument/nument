#!/usr/bin/env bash
# Builds the editors' handoff package in out/handoff from the current source and mix.
# Run after scripts/mix.py; the H.264 master (Nument_30s_master.mp4) is rendered separately.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=out/handoff
mkdir -p "$OUT/beats" "$OUT/audio"

# 1. ProRes 422 HQ master, rendered natively (no transcode from H.264)
npx remotion render src/index.ts NumentFilm "$OUT/Nument_30s_master_prores.mov" --codec=prores --prores-profile=hq --audio-codec=pcm-16 --log=error

# 2. One clip per beat with 15-frame handles (ProRes is intra-frame, so stream-copy cuts are frame-exact)
HANDLE=0.25
while IFS='|' read -r name start end; do
  a=$(python3 -c "print(max(0, $start - $HANDLE))")
  b=$(python3 -c "print(min(30, $end + $HANDLE))")
  ffmpeg -loglevel error -y -ss "$a" -to "$b" -i "$OUT/Nument_30s_master_prores.mov" -c copy "$OUT/beats/$name.mov"
done <<'BEATS'
01_idea|0|3.0
02_tool_app_agent|3.0|7.6
03_never_made|7.6|12.0
04_nument_changes_that|12.0|14.0
05_tunnel|14.0|18.2
06_idea_to_live_in_weeks|18.2|20.6
07_deploy_ai_core|20.6|23.25
08_built_around_you|23.25|26.0
09_end_card|26.0|30.0
BEATS

# 3. Audio stems (48 kHz, 24-bit; the stems are pre-limiter and sum to the mix)
cp assets/mix/mix.wav assets/mix/vo.wav assets/mix/music.wav assets/mix/sfx.wav "$OUT/audio/"

# 4. Cue sheet
python3 scripts/cuesheet.py
echo "handoff ready in $OUT"
