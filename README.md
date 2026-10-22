# DD Game Scratch (Darling Dennis Game)

A web-based 2D game application built with React, Phaser 3, TypeScript, Vite, and Tailwind CSS v4.

In DD Game Scratch, React manages the web application shell, menus, and responsive page layouts, while Phaser 3 operates the canvas, game loop, physics, input, animation, camera, and audio rendering.

---

## Technology Stack

- **UI Shell**: [React 19](https://react.dev/)
- **Game Engine**: [Phaser 3](https://phaser.io/) (v3.90+)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Linter**: [oxlint](https://oxc.rs/)
- **Version Control**: Git

---

## Prerequisites

- **Node.js**: `v20.19.0+` or `v22.12.0+` (Vite 8 requirement; tested and verified on Node `v20.20.0`)
- **npm**: `v10+` (tested and verified on npm `11.7.0`)
- **Git**: Installed for local version control

---

## Getting Started

### 1. Installation

Install all project dependencies:

```bash
npm install
```

### 2. Development Server

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

### 3. Production Build

Compile TypeScript and generate the optimized production bundle in `dist/`:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### 4. Code Quality & Type Checking

Run static linting checks:

```bash
npm run lint
```

Run TypeScript verification without emitting output:

```bash
npm run typecheck
```

---

## Folder Structure Overview

```
dd-game-scratch/
├── public/
│   ├── assets/
│   │   ├── characters/
│   │   │   └── references/   # Character reference images (Dennis, Manish, Sathish, Rahul)
│   │   ├── backgrounds/      # Environment artwork, parallax layers, and tilesets
│   │   ├── audio/            # Background music (BGM) and sound effects (SFX)
│   │   └── ui/               # Game HUD elements, icons, and dialog frames
├── src/
│   ├── components/           # React UI components (shell, overlays, HUD, controls)
│   ├── pages/                # Top-level screen views (e.g., GameView)
│   ├── game/
│   │   ├── config/           # Typed Phaser game configuration factories
│   │   ├── scenes/           # Phaser Scene classes (Boot, Preload, Game)
│   │   ├── entities/         # Game characters, sprites, and interactables
│   │   ├── systems/          # Physics, collision, audio, and camera systems
│   │   ├── data/             # Static game data, level tuning, and dialog scripts
│   │   └── README.md         # Architecture notes & React-Phaser lifecycle cleanup
│   ├── styles/               # Custom CSS styles and design tokens
│   ├── App.tsx               # Main application starter interface
│   ├── main.tsx              # React application entry point
│   └── index.css             # Tailwind CSS v4 entry point (@import "tailwindcss";)
├── index.html                # Application HTML root
├── package.json              # Project dependencies and npm scripts
├── tsconfig.json             # TypeScript root project references
└── vite.config.ts            # Vite configuration with React and Tailwind v4 plugins
```

---

## Phaser Integration & React Lifecycle

React and Phaser are strictly decoupled:
- **Game Loop Isolation**: The game loop is handled entirely inside Phaser 3 and is never driven by React state or effects.
- **Component Lifecycle**: When Phaser is mounted in a React component, the instance is referenced via `useRef<Phaser.Game | null>(null)`. Upon component unmount, `game.destroy(true)` is invoked to cleanly tear down WebGL contexts, event listeners, and textures, preventing memory leaks and duplicate canvas instances.
- **Configuration**: Engine setup is centralized in [`src/game/config/gameConfig.ts`](src/game/config/gameConfig.ts).

---

## Developer Credit

**Developed by its2much Mv**

Official game branding is prominently and tastefully integrated into:
- Home page hero badge and main navigation.
- Persistent site footer across all views.
- Level 5 Grand Finale Victory screen celebrating all 5 completed stages.

---

## Playable Stages & Adventure Overview

DD Game Scratch features a 5-level comedy chase adventure inspired by prominent Bengaluru landmarks:

1. **Stage 01: Bengaluru College Street**: Dennis must knock through 3 blocking boys (Ajay, Vijay, Sanjay) and outrun the trio (Manish, Sathish, Rahul) to the BMTC Bus Stop.
2. **Stage 02: Thatha Tea, Kalyan Nagar**: An iconic Bengaluru tea stall opposite Dr. Rajkumar Park in the Kalyan Nagar / Kammanahalli area. Dennis knocks past blockers Vikram & Kiran and sprints to the Kammanahalli crossroad.
3. **Stage 03: MG Road / Brigade Road**: Downtown retail hub featuring elevated Namma Metro tracks, a hilarious Annual Day drama club rehearsal reveal encounter, a blocker fight with Raghu, and a frantic sprint to the metro station.
4. **Stage 04: Dr. Rajkumar Park**: Lush neighborhood park with ornamental cast-iron gates, tree canopies, walking paths, and park benches. Dennis breaks through park blockers and sprints to the Park Main Gate exit.
5. **Stage 05: Cubbon Park Grand Finale**: The adventure's climax! Dennis dashes along winding red-dirt trails, bamboo groves, flowering Gulmohar canopies, and park benches under warm late-afternoon sunset lighting to reach the historic 1868 Cubbon Park Bandstand.

---

## Final Victory Sequence & Story Boundary

When Dennis clears the required objectives in Level 5 and reaches the Cubbon Park Bandstand:
1. Active gameplay and chaser pursuit safely stop.
2. A short, original comic Tanglish dialogue sequence triggers between Dennis and the panting trio, ending with a friendly truce and a promise of Masala Puri and Filter Coffee at the park gate.
3. The **Grand Victory Screen** presents:
   - Full 5-stage adventure completion checklist (`STAGE 01` to `STAGE 05` cleared).
   - Official developer branding: **Developed by its2much Mv**.
   - A subtle teaser: *"More of Dennis's story coming soon..."*
   - Working buttons to **Replay Level 5**, **Replay from Level 1**, and return to the **Main Menu**.

*Story Boundary*: The Kristu Jayanti University (KJU) epilogue and Manisha love-story arc are reserved for a future expansion prompt and are intentionally not revealed prematurely.

---

## Background Music (BGM) System

- **Asset Location**: `public/assets/audio/music/DD Game BGM.mp3`.
- **User Gesture Playback**: BGM initiates on deliberate user interaction (e.g. clicking the "Play Game" button or first canvas tap), adhering to modern browser autoplay policies.
- **Centralized Singleton**: Managed via [`src/game/systems/AudioManager.ts`](src/game/systems/AudioManager.ts), ensuring exactly one audio instance that loops seamlessly across React re-renders, scene restarts, and level switches without restarting playback from 0:00.
- **Mute & Volume Controls**: An accessible HUD button allows instant mute/unmute toggling, with preferences persisted in `localStorage` (`dd_game_bgm_muted`).
- **Resilience**: Audio errors or browser play promise rejections are caught gracefully without affecting gameplay physics or progression.

---

## Full-Screen Landscape & Mobile Experience

- **Widescreen Viewport**: Active gameplay takes full advantage of available landscape screen space, adapting Phaser cameras and `Scale.RESIZE` dynamically without stretching.
- **Screen Orientation Lock**: When entering fullscreen, the game requests a landscape orientation lock via `screen.orientation.lock('landscape')` when supported.
- **Portrait Advisory Overlay**: On mobile devices in portrait mode, a clear rotation advisory overlay prompts the player to rotate their phone sideways for optimal widescreen controls, with a graceful dismiss option.
- **Responsive Controls**: Ergonomic virtual touch buttons (Left, Right, Jump, Attack) are docked at the screen corners to prevent overlapping the HUD, dialogue bubbles, or protagonist.
- **Desktop Keyboard Support**: Movement (`A`/`D` or `←`/`→`), Jump (`Space` or `↑`), and Directional Attack (`J` or `X`).

---

## Combat System & Cross-Level Blocker Health

- **Input & Triggers**: Attack is triggered via `J` or `X` keys on desktop, or the dedicated virtual attack button on mobile touch devices.
- **Unified Combat Architecture**: Handled centrally through [`src/game/systems/CombatSystem.ts`](src/game/systems/CombatSystem.ts) across all 5 levels.
- **Attack Geometry & Range**:
  - Horizontal range: `dx <= 75px` in Dennis's current facing direction (`facing = 1` or `-1`).
  - Contact tolerance: Allows up to `16px` overlap behind origin to eliminate deadzones at point-blank collision range.
  - Vertical tolerance: `60px` vertical alignment or vertical span overlap, allowing grounded Dennis and slight airborne hops to strike blockers while preventing hits on targets far above or below.
- **Damage & Defeat Lifecycle**:
  - Each valid hit applies `1` damage point and triggers white flash recoil, floating `★ POW!` arcade indicator, and health pip reduction (`♥ ♥`).
  - At `0` HP, blocker enters `defeated` state, displays `★ DOWN!` and slumped graphics, completely disables Arcade physics collision, and stops receiving further damage.
  - Defeated blockers no longer obstruct exits or trigger collision callbacks.

---

## Character-Anchored Dialogue System

- **World-to-Screen Tracking**: Dialogue bubbles in [`src/game/systems/DialogueSystem.ts`](src/game/systems/DialogueSystem.ts) dynamically calculate world coordinates for any speaking entity (Dennis, Manish, Sathish, Rahul, blockers, or story NPCs) and convert them to camera screen coordinates each frame.
- **Positioning & Head Offset**: Anchors above the speaker's head with a `16px` vertical offset, automatically flipping below the character if near the top viewport boundary.
- **Speech Tail**: Renders an animated triangular comic pointer tail targeting the speaker's exact horizontal position.
- **Viewport Boundary Clamping**: Prevents bubbles from clipping off screen edges regardless of camera scrolling, player movement, or mobile aspect ratio.
- **Multi-Line Tanglish Support**: Responsive card width with clean line-wrapping and speaker badge color coding.

---

## Level 3 Special Story Encounter State Machine

In Level 3 (MG Road / Brigade Road), Dennis encounters the Annual Day drama rehearsal group:
1. `CHASE_ACTIVE`: Normal chase with Sathish, Manish, and Rahul pursuing Dennis.
2. `ENCOUNTER_TRIGGERED`: At `x = 920`, Dennis enters the drama encounter trigger zone.
3. `DIALOGUE_ACTIVE`:
   - Chasers cleanly freeze in place at their saved positions (no teleportation or resets).
   - Dennis is frozen to prevent skipping dialogue.
   - Character-anchored Tanglish dialogue sequence plays revealing the drama rehearsal mix-up.
4. `ATTACK_INTERACTION`:
   - Dennis unfreezes to confront the rehearsal blocker Raghu (`2 HP`) at `x = 980`.
   - Chasers remain held while Dennis fights Raghu.
5. `CHASE_RESUMED`:
   - Upon defeating Raghu, chasers immediately resume full continuous pursuit from their saved positions.
   - Dennis sprints to the Namma Metro Station exit (`x = 2500`).

---

## Level Progression, Exit Gating & Retry Reliability

### 1. Exit Gating & Completion Conditions
- **State-Driven Exit Goal**: The exit goal visual dynamically reflects the stage objective:
  - `[LOCKED]`: If any required blocking enemies remain undefeated, the exit gate remains locked with amber warning indicators, and Dennis is constrained from exiting prematurely.
  - `[OPEN]`: Defeating all stage blockers automatically unlocks the exit portal with a glowing emerald banner and pulsing beacon. Dennis crossing the exit line completes the stage.
- **Idempotent Transitions**: `isLevelCompleting` guard ensures level completion transitions and dialogue triggers execute exactly once, even with rapid frame loops or multiple trigger touches.
- **3-Button Stage Complete Modal**:
  - `PLAY NEXT STAGE →`: Advances sequentially along the 5-stage Bangalore route (L1 $\to$ L2 $\to$ L3 $\to$ L4 $\to$ L5).
  - `REPLAY STAGE`: Fully resets and replays the current stage.
  - `LEVEL SELECT`: Returns to the level selection menu (`#/levels`).
- **Debounced Interaction**: Modals implement a 180ms input debounce and exact bounding-box hit testing, preventing dialogue-advance taps from accidentally dismissing the overlay or triggering premature navigation.

### 2. Comprehensive Retry & Reset Lifecycle
When a stage is restarted (via Retry button, level switch, or catch recovery):
- **Player Controller**: `playerController.reset()` resets Dennis's physics coordinates, zeroes horizontal and vertical velocity, resets grounded and facing state (`facing = 1`), clears attack cooldown timers, restores the `idle` animation, and resets the virtual input bridge.
- **Blockers & Physics Colliders**: Completely clears old blocker containers and Arcade colliders from memory and freshly reinstantiates blocker entities with full configured HP and active collision bodies.
- **Chasers**: Resets Sathish, Manish, and Rahul to their stage spawn coordinates, unfreezes pause flags, restores facing direction (`facing = 1`), and synchronizes pursuit speeds.
- **Dialogue & Story State**: Fully disposes of active speech bubbles and sequence callbacks, resets `l3EncounterState = 'CHASE_ACTIVE'`, and resets interaction flags.
- **URL Hash Synchronization**: URL hash updates automatically (e.g. `#/play?level=2`), synchronizing React stage navigation tabs and browser history without redundant reloads.

---

## End-to-End Verification & Regression Testing

The 5-stage adventure was verified end-to-end through automated static checks and browser testing:
- **Type Safety**: `npm run typecheck` passed with 0 errors (`tsc -b --noEmit`).
- **Linter**: `npm run lint` passed with 0 warnings and 0 errors across all 32 project files.
- **Production Bundle**: `npm run build` compiled cleanly in 1.94s (`dist/index.html`, `dist/assets/index-*.css`, `dist/assets/index-*.js`).
- **Browser Playtesting**:
  - **Stage 01 (College Gate)**: Intro overlay displays Tanglish text, combat against Ajay, Vijay, and Sanjay decrements health pips, exit gate transitions from `[LOCKED]` to `[OPEN]`, and completing the stage presents the 3-button modal.
  - **Stage 02 (Thatha Tea)**: Clean progression to Kalyan Nagar environment with tea stall frontage, samovar, and Kammanahalli crossroad exit.
  - **Stage 03 (MG Road)**: Encounter at $x=920$ freezes chasers, plays comic reveal dialogue above characters, defeating Raghu resumes pursuit, and Dennis escapes to Namma Metro.
  - **Stage 04 (Dr. Rajkumar Park)**: Park environment, iron boundary railings, walking trails, and park blocker combat verified.
  - **Stage 05 (Cubbon Park Finale)**: Sunset lighting, Bandstand exit, victory dialogue, and Grand Victory screen featuring **Developed by its2much Mv** and stage completion summary verified.
  - **Audio & BGM**: Continuous loop across stage transitions, user-gesture startup, and responsive mute/unmute verified.

---

## Important Project Notes & Limitations

- **Physical Device Orientation Testing**: Mobile landscape behavior and orientation locking were validated via browser devtools emulation. Behavior on physical iOS Safari devices relies on graceful CSS landscape fallbacks, as Apple WebKit restricts programmatic `screen.orientation.lock`.
- **Character Sprites**: Dennis, Manish, Sathish, and Rahul remain custom vector procedural entities matching the established anime-inspired art direction, ready for future sprite sheet integration.

