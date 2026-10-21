# Phaser 3 Game Architecture

This directory houses all game-side code, configuration, entities, and scenes powered by Phaser 3.

## Directory Structure

- `config/`: Engine configuration factory (`gameConfig.ts`), scale settings (960×540, `Scale.RESIZE`), and renderer settings.
- `scenes/`: Phaser `Scene` subclasses. Currently active: `BootScene.ts` (engine test, scaling & stationary character stage).
- `entities/`: Game sprites and actors. Implemented: [`Dennis.ts`](entities/Dennis.ts) (playable protagonist).
- `systems/`: Decoupled subsystems. Implemented: [`characterAnimations.ts`](systems/characterAnimations.ts) (animation states & registration).
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

## Dennis Entity & Animation Architecture

### 1. Dennis Entity Lifecycle (`src/game/entities/Dennis.ts`)
- `Dennis` extends `Phaser.GameObjects.Container` to cleanly encapsulate visual elements, positioning, and future collision volumes.
- Instantiated via `new Dennis(scene, { x, y, textureKey? })`.
- During destruction, `dennis.destroy()` terminates procedural breathing tweens, clears vector graphics, removes attached labels, and unsubscribes from scene lifecycle hooks.
- Prepared for Arcade Physics: maintains `isPhysicsEnabled()` check and can receive a physics body when movement mechanics are enabled.

### 2. Placeholder vs. Production Art Separation
- **Production Mode**: When a valid texture key is supplied and exists in `scene.textures`, `Dennis` automatically instantiates a `Phaser.GameObjects.Sprite` and binds to registered animations.
- **Placeholder Mode**: If production assets are not yet loaded, `Dennis` renders an anime-inspired vector silhouette with confirmed clothing color blocks:
  - Curly dark hair (`#1c1917`)
  - Blue denim shirt (`#2563eb`) with collar/pocket stitching
  - Blue jeans (`#1e3a8a`)
  - Skin tone (`#fed7aa`) with expressive eye markers and ground shadow ellipse
  - Procedural breathing tween (`Sine.easeInOut`) simulating idle presence.
- This separation ensures gameplay logic (movement, collisions, states) does not require rewrites once production spritesheets are checked in.

### 3. Animation State Naming Convention (`src/game/systems/characterAnimations.ts`)
Standard animation state identifiers:
- `idle`: `dennis_anim_idle` (looping stance)
- `run`: `dennis_anim_run` (forward dash)
- `jump`: `dennis_anim_jump` (takeoff/ascent)
- `fall`: `dennis_anim_fall` (descent)
- `attack`: `dennis_anim_attack` (action/burst)
- `hit`: `dennis_anim_hit` (stumble/damage)

### 4. Process for Integrating Future Spritesheets
1. Place the spritesheet PNG and atlas JSON under `public/assets/characters/sprites/`.
2. In the scene's `preload()` method, call `this.load.spritesheet('dennis_spritesheet', 'assets/characters/sprites/dennis.png', { frameWidth: W, frameHeight: H })`.
3. In `create()`, call `registerDennisAnimations(this.anims, 'dennis_spritesheet')`.
4. Instantiate Dennis with `new Dennis(this, { x, y, textureKey: 'dennis_spritesheet' })`.
5. Trigger animations via `dennis.playAnimation('run')`.

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
