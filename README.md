# DD Game Scratch (Darling Dennis Game)

A standalone 2D anime comedy-adventure chase game built with React 19, Phaser 3.90, TypeScript, Vite 8, and Tailwind CSS v4.

DD Game Scratch is designed as a **pure, immersive landscape-only game**. All visible website conventions (headers, footers, page scroll, content cards, and webpage navigation) have been completely removed in favor of a unified arcade game-shell architecture.

---

## Developer Credit

**Developed by its2much Mv**

Official branding is prominently and tastefully integrated across:
- Main Menu HUD and Thatha Tea status bar.
- In-game HUD overlay and Pause Menu.
- Stage selection briefings and Character Roster.
- Level 5 Grand Finale Victory screen celebrating all 5 completed Bengaluru stages.

---

## 1. Pure Landscape Game Experience

DD Game Scratch runs exclusively inside a fixed, full-viewport landscape game canvas with zero document scrolling:

- **100% Full-Viewport Shell**: Root elements (`html, body, #root`) are locked to `100vw` by `100vh` with `overflow: hidden`, `position: fixed`, and `touch-action: manipulation`.
- **Zero Website Conventions**: No website headers, footers, long-scrolling pages, cards, or external webpage links.
- **Cohesive 12-State Game Architecture**:
  1. **Main Menu**: Live animated Thatha Tea backdrop scene in Kalyan Nagar, with high-impact arcade menu panel (`Play Game`, `Stages`, `Cast`, `Settings`, `Credits`).
  2. **Level Selection**: Game-native landscape modal (`StageSelectModal`) featuring all 5 Bengaluru missions, objectives, encounter details, and launch controls.
  3. **Character Selection**: Game-native landscape roster (`CharacterSelectModal`) profiling protagonist **Dennis** and pursuers **Manish**, **Sathish**, and **Rahul**.
  4. **Settings**: Dual-channel audio mixer, fullscreen toggle, controls guide, and restore defaults.
  5. **Credits**: Official credits modal featuring developer attribution (`Developed by its2much Mv`), sound design, typography, and engine credits.
  6. **Gameplay**: Full-bleed live Phaser 3 viewport with minimalist in-game HUD bar (`⏸ PAUSE`, stage indicator, sound toggle, fullscreen toggle).
  7. **Pause Menu**: In-game modal (`PauseMenuModal`) that cleanly freezes physics, player input, chasers, and blockers without resetting coordinates or dialogue. Options: `RESUME GAME`, `RESTART LEVEL`, `AUDIO & SETTINGS`, `MAIN MENU`.
  8. **Dialogue & Story Events**: Dynamic character-anchored Tanglish speech bubbles tracking speakers with head offsets and comic tails.
  9. **Stage Complete**: Interactive 3-button modal (`PLAY NEXT STAGE →`, `REPLAY STAGE`, `LEVEL SELECT`).
  10. **Game Over**: Catch event screen with character-anchored Tanglish capture lines, defeat sound, `RETRY LEVEL`, `LEVEL SELECT`, and `MAIN MENU`.
  11. **Victory Finale**: Historic Cubbon Park Bandstand grand victory screen with full 5-stage checklist, victory fanfare, and developer branding.
  12. **Retry & Confirmation Dialogues**: Debounced input overlays for seamless restart and stage navigation.

---

## 2. Complete Audio Architecture

Audio is centralized in [`src/game/systems/AudioManager.ts`](src/game/systems/AudioManager.ts) and [`src/game/systems/SoundSynthesizer.ts`](src/game/systems/SoundSynthesizer.ts), featuring dual independent channels with Web Audio synthesis and original asset playback:

### 2.1 Dual-Channel Audio Mixer & Persistence
- **Music Channel**: Dedicated volume slider (0–100%) and mute toggle, controlling all BGM tracks. Persisted to `localStorage` (`dd_game_music_volume`, `dd_game_music_muted`).
- **Sound Effects (SFX) Channel**: Dedicated volume slider (0–100%) and mute toggle, controlling interaction, combat, dialogue, and environment sounds. Persisted to `localStorage` (`dd_game_sfx_volume`, `dd_game_sfx_muted`).
- **Channel Independence**: Adjusting music volume never affects SFX volume, and muting SFX never mutes music.

### 2.2 Music States & Tracks
1. **Gameplay BGM (CRITICAL PRESERVATION)**:
   - File: `public/assets/audio/music/DD Game BGM.mp3` (original source: `C:\DD Game\DD Game BGM.mp3`).
   - 100% preserved in its original format, pitch, speed, and continuous looping behavior.
2. **Main Menu BGM (`main-menu`)**:
   - Original warm, lighthearted acoustic marimba & kalimba procedural synthesis evoking Dennis relaxing at Thatha Tea.
3. **Level Selection BGM (`level-select`)**:
   - Energetic, adventurous minor-pentatonic synth arpeggios building anticipation for the Bengaluru chase.
4. **Character Selection BGM (`character-select`)**:
   - Playful, bouncy comedic groove highlighting the banter between Dennis and the trio.
5. **Victory Fanfare (`victory`)**:
   - Grand celebratory brass-style fanfare for the Level 5 Cubbon Park finale.
6. **Game Over Sting (`game-over`)**:
   - Comedic downward trombone slide when Dennis gets caught by the trio.

### 2.3 Interactive Sound Effects (SFX)
- **Menu & Navigation**: `click` (crisp UI tick), `confirm` (bright arcade chime), `cancel` (subtle low blip), `pause` (gentle chime), `resume` (ascending pitch blip).
- **Dennis Locomotion & Combat**: `jump` (upward pitch sweep), `land` (soft ground thud), `attack` (whoosh swipe), `hit` (impact punch), `defeat` (knockout burst).
- **Story & Stage**: `dialogue` (subtle comic typewriter pop), `unlock` (sparkling chime when blockers are cleared), `tension` (dramatic low pulse when chasers close within 75px), `stage-complete` (victorious ascending arpeggio).
- **Anti-Fatigue Rate Limiting**: Repeated actions (attacks, footsteps, tension checks) use timestamp-based throttling to prevent noise clutter.

---

## 3. Landscape & Orientation System

- **Primary Landscape Layout**: The UI dynamically adapts to ultra-wide displays, laptops, tablets, and mobile landscape screens.
- **Orientation Lock**: Programmatic lock (`screen.orientation.lock('landscape')`) is requested where supported by browser APIs.
- **Rotate Device Overlay (`RotateOverlay`)**:
  - Automatically covers the viewport when a mobile device is held in portrait (`innerHeight > innerWidth && innerWidth < 850`).
  - Displays an animated rotating smartphone visual with GTA-styled instruction.
  - Underlying Phaser canvas, player coordinates, chasers, blockers, dialogue, and audio are completely preserved without scene resets.
  - Instantly disappears and resumes active gameplay as soon as the player rotates back to landscape.
- **Fullscreen Mode**: Toggleable from the HUD and Settings modal via the standard Fullscreen API with graceful fallback.

---

## 4. Playable Stages & Bengaluru Route

1. **Stage 01: Bengaluru College Street**: Campus perimeter and avenue. Dennis knocks through 3 college blockers (Ajay, Vijay, Sanjay) and outruns the trio to the BMTC Bus Stop.
2. **Stage 02: Thatha Tea, Kalyan Nagar**: Tea shop frontage opposite Dr. Rajkumar Park. Dennis knocks past blockers Vikram & Kiran and dashes to the Kammanahalli crossroad.
3. **Stage 03: MG Road / Brigade Road**: Downtown retail hub and elevated Namma Metro tracks. Features the Annual Day drama rehearsal mix-up reveal, blocker fight with Raghu, and a sprint to the metro train.
4. **Stage 04: Dr. Rajkumar Park**: Parkland jogging track with ornamental railings and tree canopies. Dennis breaks through park blockers and sprints to the Park Main Gate.
5. **Stage 05: Cubbon Park Grand Finale**: Climax along red-dirt paths, bamboo groves, and Gulmohar canopies, culminating at the historic 1868 Bandstand with grand victory fanfare and developer branding.

*Story Boundary*: The Kristu Jayanti University (KJU) epilogue and future Manisha storyline remain reserved for future expansions.

---

## 5. Controls

- **Desktop Keyboard**:
  - `A` / `D` or `←` / `→`: Run Left / Right
  - `Space` or `↑`: Jump
  - `J` or `X`: Attack blockers
  - `ESC` or `P`: Toggle Pause Menu
- **Mobile / Touch Screen**:
  - On-screen D-pad buttons: Left (`◀`), Right (`▶`)
  - Virtual action buttons: `ATTACK` (rose), `JUMP` (amber)
  - HUD buttons: `⏸ PAUSE`, `🔊 BGM`, `⚙ SETTINGS`, `⛶ FULLSCREEN`

---

## 6. Windows Desktop Launcher

DD Game Scratch includes a one-click desktop launcher for Windows:

1. **Create Shortcut**:
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\create-desktop-shortcut.ps1
   ```
   Installs `DD Game Scratch.lnk` on your Windows Desktop with the custom application icon.
2. **Launch Game**:
   Double-click the shortcut to start the background Vite server and launch Google Chrome (or default browser) directly into the landscape game interface.

---

## 7. Development & Verification

### Scripts
- `npm run dev`: Start local development server with Vite HMR (`http://localhost:5173/`).
- `npm run build`: Typecheck with `tsc -b` and produce optimized production bundle in `dist/`.
- `npm run typecheck`: Run strict TypeScript checks without emit (`tsc -b --noEmit`).
- `npm run lint`: Run high-speed static analysis via `oxlint`.
- `npm run preview`: Serve the production build locally.

### Verification Status
- **Type Safety**: Passed with 0 errors (`tsc -b --noEmit`).
- **Linter**: Passed with 0 errors and 0 warnings on 42 project files (`oxlint`).
- **Production Build**: Passed in 4.83s (`dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js`).
- **Browser Playtesting**:
  - Unified landscape interface verified; zero website elements present.
  - Main menu, Stages modal, Cast modal, Settings modal, Credits modal verified.
  - Level 1 gameplay launch, in-game HUD, pause menu (`ESC`, `P`, button), and resume verified.
  - Dual-channel volume and mute persistence verified.
  - Original gameplay BGM `public/assets/audio/music/DD Game BGM.mp3` preserved.
  - Note: Physical iOS/Android device testing recommended for hardware-specific orientation lock behavior.
