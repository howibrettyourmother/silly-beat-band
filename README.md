# Silly Beat Band

A music-making game for Alex and Zoe. Built for iPad, landscape, touch.

- **Beat Blocks**: a step sequencer (16 steps for Alex, 8 big steps in Zoe mode) with a Web Audio lookahead scheduler. Rows: Boom, Clap, Tss, Bass, Tune, Toot, Rubber chicken, Goat singer, Burp, My voice, Meme.
- **Band of Critters**: each row is a critter on the stage. Drag critters between the stage and the waiting room; tap one to hush it. They dance on their hits.
- **Magic Keys**: a rainbow keyboard locked to a pentatonic scale (happy or spooky). Instruments: piano, guitar, robot, kazoo, 8-bit, bells, ghost (Zoe: piano, sparkle, kitty, beepy). Can play along with the beat.
- **Styles**: Rock, Video Game, Spooky, Christmas and Silly Band starting songs, each with its own kit, scale and chords.
- **Silly Studio**: record up to 3 s from the mic, make it chipmunk, robot or monster, and drop it into the beat. If the mic is blocked or missing, silly voice clips are offered instead.
- **My songs**: save and name songs (per kid, `?kid=alex|zoe`), replay them, share a link or code (`#S=...`), and the big **Dad, listen!** show.
- **Song Builder** (v1.1): up to 4 parts (A-D, one bar each) and a song chain of up to 8 parts; "＋" copies the current part, "🎬 Whole song" plays the chain and the grid follows along. Share codes v4 carry every part and the chain (v2/v3 codes still load).
- **Record into song** (v1.1): on Magic Keys, notes snap to the nearest heard step and land in Birdie's row (Unicorn's in Zoe mode).
- **Voices in saves** (v1.1): saving a song that uses a recorded voice keeps that voice with the song in IndexedDB on this iPad. Share links never carry the voice; a shared song plays a silly voice clip instead.
- **Audio** (v1.1): any first touch unlocks audio, `navigator.audioSession` is set to playback where supported, one-shot and meme clips are loudness-normalized at load, and the master bus runs glue compressor, limiter and soft clip.
- **Zoe mode**: a big toggle with fewer rows, huge buttons, pink/sparkle themes, simple tempo buttons and only gentle sounds.

Source: `src/a*_*.js` + `src/template.html`, built with `python3 src/build.py` into `index.html` and `sw.js` (the service worker precaches everything; bump `VERSION` each release).
