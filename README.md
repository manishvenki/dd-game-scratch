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
2. **Stage 02: Roadside Market Corridor**: A tight street bottleneck where Dennis neutralizes two blocking boys (Vikram and Kiran) before reaching the avenue crossroad.
3. **Stage 03: MG Road / Brigade Road**: Downtown retail hub featuring elevated Namma Metro tracks, a hilarious drama club rehearsal mix-up dialogue, and a frantic sprint to the metro station.
4. **Stage 04: Koramangala Café Date**: Dennis meets his date Ananya for Bun Maska at an outdoor patio before the chasers crash the date, forcing an escape to the 80ft Road junction.
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

## Important Project Notes & Limitations

- **Physical Device Orientation Testing**: Mobile landscape behavior and orientation locking were validated via browser devtools emulation. Behavior on physical iOS Safari devices relies on graceful CSS landscape fallbacks, as Apple WebKit restricts programmatic `screen.orientation.lock`.
- **Character Sprites**: Dennis, Manish, Sathish, and Rahul remain custom vector procedural entities matching the established anime-inspired art direction, ready for future sprite sheet integration.

