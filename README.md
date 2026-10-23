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

## 2. Large-Scale UI System & Visual Polish

To address small interface scaling and ensure high readability and tactile responsiveness on both desktop displays and mobile landscape viewports, DD Game Scratch features a centralized design-token system:

### 2.1 Centralized Typography Tokens
- **Hero Title (`--font-size-title-hero`)**: `clamp(3rem, 6vw, 5.5rem)` (48px–88px) — Used for main game branding and victory headings.
- **Modal Header (`--font-size-modal-header`)**: `clamp(2rem, 4vw, 3.25rem)` (32px–52px) — Used for modal titles, pause screens, and level clear banners.
- **Primary Button Labels (`--font-size-btn-primary`)**: `clamp(1.35rem, 2.5vw, 2rem)` (22px–32px) — Used for `PLAY GAME`, `START STAGE`, and `RESUME GAME`.
- **Secondary Button Labels (`--font-size-btn-secondary`)**: `clamp(1.1rem, 1.8vw, 1.5rem)` (18px–24px) — Used for menu options, restart, settings, and modal controls.
- **Dialogue & Story Body (`--font-size-dialogue-body`)**: `clamp(1.05rem, 1.6vw, 1.35rem)` (17px–22px) — Used for Tanglish dialogue bubbles, mission briefings, and story cards.
- **Labels & Status Badges (`--font-size-label`)**: `clamp(0.95rem, 1.4vw, 1.15rem)` (15px–18px) — Used for stage numbers, encounter tags, character roles, and status feedback.

### 2.2 Touch Controls & Mobile Landscape Ergonomics
- **D-pad Left / Right**: Sized to 72px–88px (`w-18 h-18 sm:w-22 sm:h-22`) with 36px–44px bold directional arrows anchored in the bottom-left corner.
- **Action Buttons (Attack / Jump)**: Sized to 80px–96px (`w-20 h-20 sm:w-24 sm:h-24`) with high-contrast rose/amber backgrounds and clear icons anchored in the bottom-right corner.
- **HUD Pause & Controls**: Sized to a minimum 48px height with generous padding, preventing accidental mis-clicks during intense chases.
- **Unobstructed Viewport**: Controls are strictly pushed to outer screen margins, keeping Dennis, blockers, and hazards fully visible.

### 2.3 Audio Mixer Sliders & Controls
- **Track Geometry**: Custom 14px–16px thick dark slate tracks with subtle rounded corners.
- **Thumb Geometry**: 32px diameter gold/amber orbs with drop shadows and 1.15x hover scale, making volume adjustment intuitive on touch screens.
- **Independent Mute Badges**: Large 44px height buttons with clear visual status (`🔇 MUTED` in rose vs `🔊 ACTIVE` in emerald).

### 2.4 In-Game Phaser UI & World Preservation
- **Speech Bubbles**: Sized to 540x120px with 16px speaker font, 18px body font, and 12px comic pointer tails.
- **Intro & Level Clear Overlays**: Sized to 620x230px and 640x260px with bold 38px stage headings and large action buttons.
- **Zero Coordinate Distortion**: Scaling applied purely to text styles and UI geometry, preserving camera tracking, physics bodies, jump velocities, and blocker collision bounds 1:1.

---

## 3. Complete Audio Architecture

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

## 4. Landscape & Orientation System

- **Primary Landscape Layout**: The UI dynamically adapts to ultra-wide displays, laptops, tablets, and mobile landscape screens.
- **Orientation Lock**: Programmatic lock (`screen.orientation.lock('landscape')`) is requested where supported by browser APIs.
- **Rotate Device Overlay (`RotateOverlay`)**:
  - Automatically covers the viewport when a mobile device is held in portrait (`innerHeight > innerWidth && innerWidth < 850`).
  - Displays an animated rotating smartphone visual with GTA-styled instruction.
  - Underlying Phaser canvas, player coordinates, chasers, blockers, dialogue, and audio are completely preserved without scene resets.
  - Instantly disappears and resumes active gameplay as soon as the player rotates back to landscape.
- **Fullscreen Mode**: Toggleable from the HUD and Settings modal via the standard Fullscreen API with graceful fallback.

---

## 5. Playable Stages & Bengaluru Route

1. **Stage 01: Bengaluru College Street**: Campus perimeter and avenue. Dennis knocks through 3 college blockers (Ajay, Vijay, Sanjay) and outruns the trio to the BMTC Bus Stop.
2. **Stage 02: Thatha Tea, Kalyan Nagar**: Tea shop frontage opposite Dr. Rajkumar Park. Dennis knocks past blockers Vikram & Kiran and dashes to the Kammanahalli crossroad.
3. **Stage 03: MG Road / Brigade Road**: Downtown retail hub and elevated Namma Metro tracks. Features the Annual Day drama rehearsal mix-up reveal, blocker fight with Raghu, and a sprint to the metro train.
4. **Stage 04: Dr. Rajkumar Park**: Parkland jogging track with ornamental railings and tree canopies. Dennis breaks through park blockers and sprints to the Park Main Gate.
5. **Stage 05: Cubbon Park Grand Finale**: Climax along red-dirt paths, bamboo groves, and Gulmohar canopies, culminating at the historic 1868 Bandstand with grand victory fanfare and developer branding.

*Story Boundary*: The Kristu Jayanti University (KJU) epilogue and future Manisha storyline remain reserved for future expansions.

---

## 6. Controls

- **Desktop Keyboard**:
  - `A` / `D` or `←` / `→`: Run Left / Right
  - `Space` or `↑`: Jump
  - `J` or `X`: Attack blockers
  - `ESC` or `P`: Toggle Pause Menu
- **Mobile / Touch Screen**:
  - On-screen D-pad buttons: Left (`◀`), Right (`▶`) — 72px–88px high-visibility touch targets
  - Virtual action buttons: `ATTACK` (rose), `JUMP` (amber) — 80px–96px ergonomic circular/rounded pads
  - HUD buttons: `⏸ PAUSE`, `🔊 BGM`, `⚙ SETTINGS`, `⛶ FULLSCREEN` — 44px–48px minimum touch targets

---

## 7. Windows Desktop Launcher

DD Game Scratch includes a one-click desktop launcher for Windows:

1. **Create Shortcut**:
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\create-desktop-shortcut.ps1
   ```
   Installs `DD Game Scratch.lnk` on your Windows Desktop with the custom application icon.
2. **Launch Game**:
   Double-click the shortcut to start the background Vite server and launch Google Chrome (or default browser) directly into the landscape game interface.

---

## 9. Character Scale Upgrade & Visual Polish (Milestone 19)

To ensure characters are immediately recognizable, visually prominent, and expressive on both laptop screens and mobile landscape displays, DD Game Scratch underwent a full character scale hierarchy upgrade:

### 9.1 Character Scale Matrix

| Entity | Old Visible Dimensions | New Visible Dimensions | Scale Multiplier | Silhouette & Visual Identity |
| :--- | :--- | :--- | :--- | :--- |
| **Dennis (Protagonist)** | 44px × 84px | **60px × 116px** | **~1.38×** | Curly dark hair curls, blue denim shirt with chest pockets & collar, blue jeans, dark shoes, 60×16px ground shadow. |
| **Manish (Chaser)** | 44px × 84px | **58px × 110px** | **~1.32×** | Crisp black shirt, dark slate trousers, neat parted hair, **prominent sky-blue frame rectangular glasses** with cyan tint. |
| **Sathish (Chaser)** | 44px × 84px | **58px × 110px** | **~1.32×** | Black crew-neck T-shirt with **iconic red Lenovo chest badge & readable 10px lettering**, bare forearms, charcoal pants, textured hair. |
| **Rahul (Chaser)** | 44px × 84px | **58px × 110px** | **~1.32×** | Dark teal shirt with **4 prominent bright teal horizontal stripes & sleeve stripes**, dark slate pants, tousled dark fringe hair. |
| **Blockers / Encounter NPCs** | 38px × 80px | **48px × 102px** | **~1.26×** | Bold confrontational stance, hands-on-hips, colored shirts, red HP heart pips at y: -106, 90×19px blocker badge. |
| **Main Menu Characters** | Displayed ~84px | **~110px–116px** | **~1.35×** | Live Thatha Tea scene: Dennis sipping cutting chai from scaled glass, Manish by tea counter, Sathish on stools, Rahul by bench. |
| **Character Roster Avatars** | 56px–64px boxes | **72px–96px boxes** | **~1.40×** | Sized up avatar tiles with character role tags (HERO / CHASER) and 80px–96px header initials in the profile panel. |

### 9.2 Physics & Collision Recalibration
- **Dennis Physics Body**: Sized to `48px × 110px` (previously 38×80) with centered bottom offset `((w - 48)/2, h - 110)`. Dennis's feet stay locked to local `y: 0`, ensuring solid ground contact on sidewalks and asphalt without floating or floor sinking.
- **Blocker Physics Body**: Sized to `44px × 98px` (previously 34×78) with offset `((w - 44)/2, h - 98)`. Solid collision matches the wider 48px body silhouette.
- **CombatSystem Reach**: `ATTACK_RANGE_X` increased from `75px` to `96px` and `ATTACK_TOLERANCE_Y` from `60px` to `80px`. Vertical overlap checks recalibrated from 80px to Dennis's 116px and Blocker's 102px. Forward contact allowance expanded to `-24px` to eliminate deadzones.
- **Chaser Pursuit & Spacing**:
  - Chaser spacing offsets increased from `(0, 45, 90)` to `(0, 55, 110)` to keep pursuers naturally separated.
  - Catch distance threshold increased from `34px` to `46px` (touching bounds without clipping).
  - Dramatic dialogue hold distance increased from `75px` to `95px`.
  - Tension heartbeat SFX radius calibrated to `dist < 95 && dist >= 46`.
- **Camera Follow Framing**: Camera follow vertical offset tuned from `30` to `22` to maintain optimal vertical headroom above Dennis's taller 116px head during sprints and jumps.
- **Dialogue Anchor Clearance**: `resolveSpeakerPosition` updated with `height: 116` (Dennis), `height: 110` (Chasers), and `height: 102` (Blockers), ensuring comic speech bubbles float with a crisp 16px clearance above hair tufts and hairstyles.

---

## 10. Development & Verification

### Scripts
- `npm run dev`: Start local development server with Vite HMR (`http://localhost:5173/`).
- `npm run build`: Typecheck with `tsc -b` and produce optimized production bundle in `dist/`.
- `npm run typecheck`: Run strict TypeScript checks without emit (`tsc -b --noEmit`).
- `npm run lint`: Run high-speed static analysis via `oxlint`.
- `npm run preview`: Serve the production build locally.

### Verification Status
- **Type Safety**: Passed with 0 errors (`tsc -b --noEmit`).
- **Linter**: Passed with 0 errors and 0 warnings on 42 project files (`oxlint`).
- **Production Build**: Passed in 1.28s (`dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js`).
- **Milestone 19 Character Scale & Visibility Audit**:
  - Main Menu: Verified enlarged Dennis (116px) with cutting chai glass, Manish (110px with glasses), Sathish (110px with Lenovo shirt), and Rahul (110px with teal stripes). Dialogue bubbles clear heads cleanly.
  - Character Selection Roster: Verified 72px–80px avatar boxes, Dennis hero badge, and 80px–96px profile headers.
  - Level 1 (College Gate): Verified Dennis running/jumping with solid ground contact, chasers pursuing at 55px/110px separation, attack swoosh connecting with Campus Gate Guard, blocker taking damage and defeat.
  - Level 3 (MG Road): Verified drama rehearsal sequence (`CHASE_ACTIVE → ENCOUNTER_TRIGGERED → DIALOGUE_ACTIVE → REVEAL_COMPLETE → ATTACK_INTERACTION → CHASE_RESUMED`). Raghu encounter and chase resumption verified.
  - Level 5 (Cubbon Park Finale): Verified Cubbon Park Bandstand finish, blocker encounters, dialogue, and Grand Victory Modal trigger.
  - Audio: Looping gameplay BGM `public/assets/audio/music/DD Game BGM.mp3` preserved 100% untouched.
  - Note: Physical touchscreen device testing recommended for testing native touch-digitizer latency.

