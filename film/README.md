# Nument brand film (30 s)

"Built in India, for the world": a single continuous motion-graphics shot in [Remotion](https://www.remotion.dev) (React), with a Cartesia voiceover, an original score synthesised in code, and the website's own UI sounds as sound design. The master is 1920×1080 at 60 fps, mixed to -14 LUFS with true peak ≤ -1 dBTP.

## Handoff package (`out/handoff/`, built by `scripts/handoff.sh`)

| File | What |
|---|---|
| `Nument_30s_master.mp4` | Final film, H.264, with the final mix |
| `Nument_30s_master_prores.mov` | Same, ProRes 422 HQ, for editing |
| `beats/*.mov` | Each beat as ProRes 422 HQ with 15-frame handles |
| `audio/mix.wav`, `vo.wav`, `music.wav`, `sfx.wav` | 48 kHz, 24-bit. The stems are pre-limiter and sum to the mix |
| `cue-sheet.csv`, `cue-sheet.md` | Every shot, voice line, music marker and sound cue with timecode |
| `style-sheet.md` | Palette, type, motion rules and the final script |

## Rebuild

Generated audio (`assets/mix`, `assets/music`, `assets/sfx`, voice `.wav` takes) is not committed; the steps below regenerate it. The voice takes need a Cartesia API key; the job files and word timings in `assets/vo/takes` are kept.

```bash
npm install                                        # once
node scripts/vo.mjs <jobs.json> assets/vo/takes    # voice takes (CARTESIA_API_KEY in .env.local)
python3 scripts/pick_takes.py                      # one take per line -> assets/vo/picks.json
python3 scripts/build_cues.py                      # place lines on the timeline -> src/generated/vo-cues.json
python3 scripts/music.py                           # original score -> assets/music
node scripts/sfx_render.mjs                        # the website's UI sounds -> assets/sfx/site
python3 scripts/mix.py                             # sound design + final mix + stems -> assets/mix
npx remotion render src/index.ts Animatic out/preview.mp4 --scale=0.5   # quick 30 fps preview
npx remotion render src/index.ts NumentFilm out/nument-film.mp4 --codec=h264 --crf=14
python3 scripts/qa.py out/nument-film.mp4          # quality checks + contact sheet
python3 scripts/cuesheet.py                        # editors' cue sheet -> out/handoff
```

`npx remotion studio src/index.ts` opens a live preview with a timeline scrubber.

## Where things live

- `src/v3/Film3.tsx`: the whole film. Every beat is keyed to the voiceover word timings.
- `src/v3/look.tsx`, `src/v3/parts.tsx`: the building blocks (focus-pull words, glass icons, progress bar, confetti, screen tunnel, sparkle, cursor, product cards).
- `src/vo-lines.json`: the locked script and voice (Cartesia "Lauren - Lively Narrator").
- `src/timeline.json`: duration, sections and music markers. `src/generated/` holds the placed voice and sound cues.
- `scripts/mix.py`: the sound design cue list (`sfx_cues`) and the mix.

The product screens in the tunnel and on the cards are the website's own project images (`../public/project*`). Fonts come from `../public/fonts` and `assets/fonts`.

## Before this goes public

- **Voice licence.** The takes were generated on Cartesia's free plan, which does not include commercial rights. Regenerate them on a paid plan with the same voice and lines (`assets/vo/takes/jobs*.json`), or replace them with a recorded voiceover.
- **Client names.** Brightlane, Pulse Scribe, Freightmind, Lumora and Vault Search are the website's fictional showcase projects.

## Licences

- Inter (`assets/fonts`) and Inter Display: SIL Open Font License 1.1 (`assets/fonts/LICENSE-Inter.txt`).
- Score and sound effects: original, synthesised in `scripts/music.py`. The UI sounds are the website's own (`src/sound/recipes.js`).
- Remotion: free for companies of up to 3 employees; larger companies need a company licence (remotion.pro).
