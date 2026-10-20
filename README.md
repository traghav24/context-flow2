# Context Flow

A focus app built on the idea from *Stop Time-Blocking. Start Context-Blocking.*
You name a tiny block (**mode + object + done state + 15/30/45 min**), run a timer, then reflect on how it went. The point isn't finishing everything — it's getting better at **breaking work into one-output, showable, countable, small chunks** and estimating them.

Rewritten as a modern **React + TypeScript + Vite** application.

## Run it

```bash
npm install
npm run dev
```

The app will run on port 3000 (accessible on `0.0.0.0:3000`).
State is persisted in `localStorage` under key `contextflow.v2`.

## The Flow

1. **Name the block** — pick a mode tag (defining, exploring, creating, critiquing, communicating), type the tiny thing + done state, pick a duration (15, 30, or 45 mins).
2. **Timer** — grandma reads to her dog while you work.
   - Tap the **orange starburst** to *log a drift* (select which mode your head wandered into, returning straight back to the clock).
   - Tap the **yellow star** to *end early*.
   - Mute button to toggle sound chime.
   - When the timer ends, it transitions to the check screen automatically.
3. **Did you reach it?** — 100% / ~50% / 0%:
   - **100%** → Earn a **star** (added to the jar), with planned-vs-actual time recorded and a celebratory confetti pop.
   - **~50%** → *Done state was too broad* → Suggests a sharper, one-output version (same mode). "↻ give me another" cycles alternatives; "edit it" opens in home input; "start this →" launches a new block.
   - **0%** → *Too big / undecided question* → Switches you to **defining** a tiny decision first with 3 rule chips.
4. **Star Jar** — Your collection of shipped chunks in a sticker grid. Tap any star to view what you shipped and planned-vs-actual minutes.
5. **History & Breaking-Down Stats** — % of chunks that hit 100%, average time estimation error (±Xm), and a 4-dot breakdown quality score per block (one output · showable · countable · fits the timer).

## Tech Stack & Architecture

- **React 19 + TypeScript**: Modular components, custom hooks, and strict typing.
- **Vite 6 + Tailwind CSS**: Fast builds with faithful reproduction of the original Figma retro aesthetic.
- **Web Audio API**: Built-in pleasant notification chimes without external audio asset dependencies.
- **Canvas Confetti**: Lightweight visual celebration for completed chunks.
- **Deterministic Done-State Intelligence**: Heuristic rule-based scoring engine for instant evaluation, sharpening, and reframing.
