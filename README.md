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

## Important Project Notes

- **Phase 1 Scope**: This phase establishes the technical foundation, dependency chain, configuration, and responsive starter shell.
- **Upcoming Phases**: Playable levels, character movement, chaser mechanics, combat, dialogue, mobile controls, and audio systems will be implemented in subsequent master prompts.
- **Asset Integration**: Original character reference photos (Dennis as protagonist, Manish in black shirt/glasses, Sathish in black Lenovo T-shirt, Rahul in dark teal striped shirt) and existing BGM audio files will be supplied separately in their respective milestone phases.
