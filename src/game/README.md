# Phaser 3 Game Architecture

This directory houses all game-side code, configuration, entities, and scenes powered by Phaser 3.

## Directory Structure

- `config/`: Engine configuration factory (`gameConfig.ts`), scale settings (960×540, `Scale.RESIZE`), and renderer settings.
- `scenes/`: Phaser `Scene` subclasses. Currently active: `BootScene.ts` (engine test, scaling & 4-character stage lineup).
- `entities/`: Game sprites and actors.
  - [`Dennis.ts`](entities/Dennis.ts): Playable protagonist entity.
  - [`Chaser.ts`](entities/Chaser.ts): Abstract base class for recurring pursuers.
  - [`Manish.ts`](entities/Manish.ts): Chaser with black shirt and prominent glasses.
  - [`Sathish.ts`](entities/Sathish.ts): Chaser with black Lenovo T-shirt and readable lettering.
  - [`Rahul.ts`](entities/Rahul.ts): Chaser with dark teal multi-striped shirt.
- `systems/`: Decoupled subsystems. Implemented: [`characterAnimations.ts`](systems/characterAnimations.ts) (animation states & registration).
- `data/`: Game constants and metadata. Implemented: [`characterRegistry.ts`](data/characterRegistry.ts) (authoritative character definitions).

## React Lifecycle Integration & Cleanup Strategy

The game engine is integrated through the reusable React component [`src/components/GameCanvas.tsx`](../components/GameCanvas.tsx):

1. **Mounting:**
   - On component mount, `GameCanvas` instantiates `new Phaser.Game(createGameConfig(container, scenes))`.
   - The game instance is stored in a `useRef<Phaser.Game | null>(null)` to ensure lifecycle isolation from React state and re-renders.
   - Any prior child canvas nodes in the DOM container are cleared synchronously before instantiation to handle React 18/19 Strict Mode mount/unmount/remount cycles safely.

2. **Responsive Scaling (`Scale.RESIZE`):**
   - Phaser's scale mode is configured with `mode: Phaser.Scale.RESIZE`, allowing the canvas to seamlessly fill the responsive 16:9 container on mobile and desktop without horizontal overflow.
   - Scenes subscribe to `this.scale.on('resize', this.handleResize, this)` to reposition text, HUD elements, and graphics dynamically when viewports change or rotate.

3. **Destruction & Teardown:**
   - When `GameCanvas` unmounts (e.g. user navigates to Home, Levels, or Characters), the `useEffect` cleanup hook executes.
   - `game.destroy(true)` is invoked with `true` to cancel the animation frame loop, destroy WebGL/Canvas contexts, remove the canvas from the DOM, and release texture caches.
   - The scene unbinds its scale resize listeners during `SHUTDOWN` and `DESTROY` lifecycle events.
   - `gameRef.current` is set to `null` to prevent memory leaks and duplicate canvases.

## Core Characters & Chaser Architecture

### 1. Character Registry (`src/game/data/characterRegistry.ts`)
The project enforces strict, immutable character identity mappings:
- **Dennis** (`protagonist`): Curly dark hair, blue denim shirt, blue jeans.
- **Manish** (`chaser`): Dark neat hair, black shirt, clearly visible glasses.
- **Sathish** (`chaser`): Dark textured hair, black T-shirt with readable `Lenovo` text marking.
- **Rahul** (`chaser`): Dark tousled hair, dark teal shirt with multiple visible horizontal stripes.

### 2. Reusable Chaser Entity Architecture (`src/game/entities/Chaser.ts`)
- `Chaser` extends `Phaser.GameObjects.Container` as the common base class for all pursuers.
- Encapsulates shared lifecycle, ground shadow rendering, identification badge generation, and procedural idle breathing tweens.
- Configurable phase offsets (`idlePhaseOffsetMs`) ensure natural asynchronous idle breathing so characters do not animate as robotic clones.
- Subclasses (`Manish`, `Sathish`, `Rahul`) implement `renderCharacterFeatures(g)` to draw their unique clothing, hair, and distinct accessories without duplicating base mechanics.
- Prepares typed hooks for future Arcade Physics (`isPhysicsEnabled()`) and animation state transitions (`playAnimation()`).

### 3. Visuals vs. Future AI Behavior Separation
- Current character entities represent **pure presentation and positioning containers**.
- They are completely decoupled from movement logic, pathfinding, and chasing behavior.
- In future prompts, AI systems (e.g., pursuit controllers, flocking algorithms, line-of-sight triggers) will operate on these entities from external systems without requiring modifications to the character renderers.

### 4. Placeholder vs. Production Art Separation
- **Production Mode**: When production spritesheets are provided and their keys exist in `scene.textures`, entities instantiate `Phaser.GameObjects.Sprite` instances.
- **Placeholder Mode**: When production art is absent, entities render color-blocked vector silhouettes preserving all confirmed clothing attributes and identifying features.
- Once production spritesheets are added, the visual switch is automatic without rewriting gameplay or AI logic.

## Future-Facing Asset-Loading Guidelines

When implementing asset loaders in subsequent phases, adhere to these architectural standards:

1. **Scene Preload Lifecycle:**
   - Phaser scenes should load local assets exclusively within their `preload()` lifecycle method.
   - Use Phaser loader methods (`this.load.image`, `this.load.spritesheet`, `this.load.audio`) to ensure assets are cached before `create()` runs.

2. **Asset Keys & Namespace Management:**
   - Every asset key registered in Phaser's Cache must be unique and consistently named.
   - Use scoped prefixes to prevent key collisions (e.g., `bg_college_street`, `sprite_dennis_run`, `audio_bgm_main`).

3. **Error Handling & Diagnostics:**
   - Listen to loader failure events (`this.load.on('loaderror', (file) => ...)`).
   - Missing assets should produce clear console warnings with the failed file key and path rather than causing silent engine crashes.

4. **Local Stable Paths & Security:**
   - All game assets must reside locally under `/assets/` and be referenced via stable absolute paths (`/assets/...`).
   - Never rely on arbitrary external image URLs, hotlinks, or fake placeholder services.
   - The browser application runs in an isolated client sandbox and cannot assume access to arbitrary local paths outside the served `public/` directory.

5. **Source Separation & User-Supplied Assets:**
   - Original photos (e.g., reference portraits for Dennis, Manish, Sathish, Rahul) and music tracks (`DD Game BGM.mp3`) must be provided by the team and staged in `public/assets/` before being wired into gameplay.
   - Never overwrite user-supplied assets. Large media files should be checked into Git thoughtfully with appropriate compression.
