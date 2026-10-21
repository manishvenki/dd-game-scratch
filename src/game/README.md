# Phaser 3 Game Architecture

This directory houses all game-side code, configuration, entities, and scenes powered by Phaser 3.

## Directory Structure

- `config/`: Engine configuration factory (`gameConfig.ts`), scale settings (960×540, `Scale.RESIZE`), and renderer settings.
- `scenes/`: Phaser `Scene` subclasses. Currently active: `BootScene.ts` (engine test & coordinate scaling scene).
- `entities/`: Game sprites and actors (Dennis protagonist, chaser NPCs: Manish, Sathish, Rahul).
- `systems/`: Independent subsystems (input processing, collision rules, audio orchestration).
- `data/`: Game constants, level configurations, and dialog trees.

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

## Future-Facing Asset-Loading Guidelines

When implementing asset loaders in subsequent phases, adhere to these architectural standards:

1. **Scene Preload Lifecycle:**
   - Phaser scenes should load local assets exclusively within their `preload()` lifecycle method (e.g., in a dedicated `PreloadScene`).
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
