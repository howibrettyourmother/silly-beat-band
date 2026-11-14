# Silly Beat Band

A music-making game for Alex and Zoe. Built for iPad, landscape, touch.

- **Beat Blocks**: a step sequencer (16 steps for Alex, 8 big steps in Zoe mode) with a Web Audio lookahead scheduler. Rows: Boom, Clap, Tss, Bass, Tune, Toot, Rubber chicken, Goat singer, Burp, My voice, Meme.
- **Band of Critters**: each row is a critter on the stage. Drag critters between the stage and the waiting room; tap one to hush it. They dance on their hits.
- **Magic Keys**: a rainbow keyboard locked to a pentatonic scale (happy or spooky). Instruments: piano, guitar, robot, kazoo, 8-bit, bells, ghost (Zoe: piano, sparkle, kitty, beepy). Can play along with the beat.
- **Styles**: Rock, Video Game, Spooky, Christmas and Silly Band starting songs, each with its own kit, scale and chords.
- **Silly Studio**: record up to 3 s from the mic, make it chipmunk, robot or monster, and drop it into the beat. If the mic is blocked or missing, silly voice clips are offered instead.
- **My songs**: save and name songs (per kid, `?kid=alex|zoe`), replay them, share a link or code (`#S=...`), and the big **Dad, listen!** show.
- **Zoe mode**: a big toggle with fewer rows, huge buttons, pink/sparkle themes, simple tempo buttons and only gentle sounds.

Source: `src/a*_*.js` + `src/template.html`, built with `python3 src/build.py` into `index.html` and `sw.js` (the service worker precaches everything; bump `VERSION` each release).
