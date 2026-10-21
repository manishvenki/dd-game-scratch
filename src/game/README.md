# Phaser 3 Game Architecture

This directory houses all game-side code, configuration, entities, and scenes powered by Phaser 3.

## Directory Structure

- `config/`: Engine configuration factory (`gameConfig.ts`), scale settings (960×540, `Scale.RESIZE`), and Arcade Physics (gravity: 1100).
- `scenes/`: Phaser `Scene` subclasses. Currently active: `BootScene.ts` (interactive side-view test stage).
- `entities/`: Game sprites and actors.
  - [`Dennis.ts`](entities/Dennis.ts): Playable protagonist entity.
  - [`BlockingEnemy.ts`](entities/BlockingEnemy.ts): Procedural anime blocking enemy with health and defeat states.
  - [`Chaser.ts`](entities/Chaser.ts): Abstract base class for recurring pursuers.
  - [`Manish.ts`](entities/Manish.ts): Chaser with black shirt and prominent glasses.
  - [`Sathish.ts`](entities/Sathish.ts): Chaser with black Lenovo T-shirt and readable lettering.
  - [`Rahul.ts`](entities/Rahul.ts): Chaser with dark teal multi-striped shirt.
- `environments/`: Modular environment and parallax systems. Implemented: [`BengaluruCollegeStreet.ts`](environments/BengaluruCollegeStreet.ts).
- `levels/`: Level configuration and types. Implemented: [`levelTypes.ts`](levels/levelTypes.ts), [`levelConfigs.ts`](levels/levelConfigs.ts).
- `systems/`: Decoupled subsystems.
  - [`PlayerController.ts`](systems/PlayerController.ts): Controls Dennis locomotion, jumping, facing, and state synchronization.
  - [`CombatSystem.ts`](systems/CombatSystem.ts): Manages attack range checks, hit detection, damage, and encounter completion.
  - [`virtualInputBridge.ts`](systems/virtualInputBridge.ts): Typed bridge connecting mobile touch buttons (move, jump, attack) to Phaser.
  - [`characterAnimations.ts`](systems/characterAnimations.ts): Animation states, keys, and texture registration.
- `data/`: Game constants and metadata. Implemented: [`characterRegistry.ts`](data/characterRegistry.ts).

## React Lifecycle Integration & Cleanup Strategy

The game engine is integrated through the reusable React component [`src/components/GameCanvas.tsx`](../components/GameCanvas.tsx):

1. **Mounting:**
   - On component mount, `GameCanvas` instantiates `new Phaser.Game(createGameConfig(container, scenes))`.
   - The game instance is stored in a `useRef<Phaser.Game | null>(null)` to ensure lifecycle isolation from React state and re-renders.
   - Any prior child canvas nodes in the DOM container are cleared synchronously before instantiation to handle React 18/19 Strict Mode mount/unmount/remount cycles safely.

2. **Responsive Scaling (`Scale.RESIZE`):**
   - Phaser's scale mode is configured with `mode: Phaser.Scale.RESIZE`, allowing the canvas to seamlessly fill the responsive 16:9 container on mobile and desktop without horizontal overflow.
   - Scenes subscribe to `this.scale.on('resize', this.handleResize, this)` to reposition text, HUD elements, ground platforms, and graphics dynamically.

3. **Destruction & Teardown:**
   - When `GameCanvas` unmounts (e.g. user navigates to Home, Levels, or Characters), the `useEffect` cleanup hook executes.
   - `game.destroy(true)` is invoked with `true` to cancel the animation frame loop, destroy WebGL/Canvas contexts, remove the canvas from the DOM, and release texture caches.
   - The scene unbinds its scale resize listeners during `SHUTDOWN` and `DESTROY` lifecycle events.
   - `gameRef.current` is set to `null` to prevent memory leaks and duplicate canvases.

## Player Movement & Physics Architecture

### 1. Selected Physics Architecture (Physics Proxy Pattern)
Dennis is built as a composite `Phaser.GameObjects.Container` containing vector placeholder children. Attaching Arcade Physics bodies directly to complex Containers in Phaser can cause offset and scaling issues when flipping facing direction.
- To guarantee rock-solid platforming physics, [`PlayerController.ts`](systems/PlayerController.ts) instantiates an invisible dynamic Arcade Physics sprite body (`38×80px`, bottom-center origin).
- The physics body handles gravity (`gravity.y = 1100`), horizontal velocity, jumping impulses, world bounds collision, and ground collision with the static platform.
- The visual entity `Dennis` synchronizes position to this physics proxy every frame (`dennis.setPosition(body.x, body.y)`).
- When Dennis changes direction, only the visual graphics container flips (`dennis.setFacingDirection(-1 | 1)`), keeping the physics body anchor and collision box perfectly upright.
- Chasers (Manish, Sathish, Rahul) remain stationary on the ground platform with zero physics overhead.

### 2. Locomotion & Jump Mechanics
- **Horizontal Movement**: Left/Right movement sets constant horizontal velocity (`moveSpeed: 260 px/s`). When inputs are released, velocity stops immediately without drift.
- **Directional Facing**: Dennis faces left (`scaleX = -1`) when moving left and right (`scaleX = 1`) when moving right. The name badge remains un-mirrored for readability.
- **Jumping**: Jump impulse (`jumpSpeed: 520 px/s`) fires only when `grounded` (`body.blocked.down || body.touching.down`).
- **Single Jump Guard**: Holding the jump key or touch button cannot trigger repeated mid-air jumps. A jump requires a fresh press (`JustDown` or consumed virtual action).
- **Animation States**: Dennis updates between `idle`, `run`, `jump`, and `fall` based on grounded state and velocity. Idle breathing automatically pauses during motion.

### 3. Cross-Platform Input & Browser Scroll Suppression
- **Keyboard**: Supports `A` / `D` or Arrow Keys for horizontal movement, and `Space` / `W` / `ArrowUp` for jumping.
  - `this.input.keyboard.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT'])` suppresses default browser page scrolling while the player is interacting with the canvas.
- **Mobile Touch Controls**: On-screen directional buttons (`←`, `→`) and a prominent `JUMP` button are rendered inside the viewport overlay.
  - Pointer events (`onPointerDown`, `onPointerUp`, `onPointerLeave`) feed directly into [`virtualInputBridge.ts`](systems/virtualInputBridge.ts).
  - Uses `touch-action: none` and `select-none` to prevent unwanted page scrolling or text selection on mobile.
  - Fully decoupled: zero React state in the per-frame game loop.

## Core Characters & Chaser Architecture

### 1. Character Registry (`src/game/data/characterRegistry.ts`)
The project enforces strict, immutable character identity mappings:
- **Dennis** (`protagonist`): Curly dark hair, blue denim shirt, blue jeans. Controllable in Phase 2.
- **Manish** (`chaser`): Dark neat hair, black shirt, clearly visible glasses.
- **Sathish** (`chaser`): Dark textured hair, black T-shirt with readable `Lenovo` text marking.
- **Rahul** (`chaser`): Dark tousled hair, dark teal shirt with multiple visible horizontal stripes.

### 2. Reusable Chaser Entity Architecture (`src/game/entities/Chaser.ts`)
- `Chaser` extends `Phaser.GameObjects.Container` as the common base class for all pursuers.
- Encapsulates shared lifecycle, ground shadow rendering, identification badge generation, and procedural idle breathing tweens.
- Subclasses (`Manish`, `Sathish`, `Rahul`) implement `renderCharacterFeatures(g)` without duplicating core entity lifecycle or animation logic.
- Chasers stand on the ground platform as stationary observers during the test stage.

## Bengaluru Environment & Parallax Architecture

### 1. Parallax Layer Hierarchy (`src/game/environments/BengaluruCollegeStreet.ts`)
The environment is decoupled into an independent module with 6 visual depth layers:
- **Layer 1 (ScrollFactor 0): Sky & Clouds** — Warm daylight anime morning sky with subtle procedural drifting clouds and sun disc.
- **Layer 2 (ScrollFactor 0.15): Distant Skyline** — Atmospheric silhouettes of Bengaluru IT towers and the iconic Vidhana Soudha heritage dome with red beacon mast.
- **Layer 3 (ScrollFactor 0.35): Midground Rooflines** — Terracotta pitched campus department roofs, college clock tower, rooftop Sintex water tanks, and Rain Tree canopies.
- **Layer 4 (ScrollFactor 1.0): World-Space Street Scenery** — Spanning the 2400px college street:
  - Granite compound wall with wrought-iron spearhead railings.
  - The Grand College Entrance Gate ("BENGALURU CITY COLLEGE - ESTD 1948") and security guard post.
  - Heritage red-brick college building facade with Saracenic arches.
  - "SLV KAAPI & TIFFIN CORNER" (authentic Bangalore Darshini with orange-white striped awning and steel filter coffee counter).
  - "CAMPUS XEROX & STATIONERY" with blue awning and notice board.
  - Lush Gulmohar trees with vibrant vermillion/orange blossom clusters.
  - Indian sodium-vapor streetlights and yellow BESCOM electrical distribution boxes.
- **Layer 5 (ScrollFactor 1.0): Ground Platform & Roadway** — TenderSURE-inspired terracotta paver tiles, classic Indian **Yellow & Black** curb stones, and charcoal asphalt road with white dashed markings.
- **Layer 6 (ScrollFactor 0): Fixed Screen HUD** — Stage title, controls guide, and live player status anchored to the viewport.

### 2. Camera Tracking & Stage Bounds
- Stage world width extends to `Math.max(viewportWidth * 2.5, 2400)`.
- `this.cameras.main.startFollow(playerPhysicsBody, true, 0.08, 0.08, 0, 30)` smoothly tracks Dennis as he moves along the street.
- World physics bounds clamp Dennis between `x = 30` and `x = stageWidth - 30`, preventing him from falling off or entering undefined sections.
- Ground platform physics static body spans the entire 2400px stage at `groundY`, keeping player collision perfectly aligned with visible sidewalk paver tiles.

## Level 1 to Level 4 Gameplay Architecture

### 1. Level Configurations (`src/game/levels/levelConfigs.ts`)
- **Level 1 (College Street Encounter)**:
  - Setting: Bengaluru City College Gate avenue (2400px stage, `theme: 'college'`).
  - Continuous Chase: Manish, Sathish, and Rahul begin pursuing Dennis from the opening moments.
  - Confrontation: 3 blocking boys (Ajay, Vijay, Sanjay). Dennis must punch through or outmaneuver blockers while the trio closes in.
  - Dennis must reach the BMTC Bus Stop exit (`x = 2320`) without being caught.
- **Level 2 (Commercial Lane Confrontation)**:
  - Setting: Roadside market street corridor (2200px stage, `theme: 'market'`).
  - Confrontation: 2 independent blocking boys (Vikram, Kiran) with independent health and physics bodies.
  - Dennis must neutralize both blockers and sprint to the Avenue Crossroad exit (`x = 2120`).
- **Level 3 (MG Road / Brigade Road Reveal)**:
  - Setting: Central commercial street with elevated Namma Metro viaduct, neon store signs, and drama rehearsal stage (2600px stage, `theme: 'commercial-mg'`).
  - Story Encounter: Dennis spots a stylish group at `x = 920` (Drama club boys Raghu & Preetham in costume), triggering a comic Tanglish misunderstanding before the trio arrives shouting from behind.
  - Exit: Namma Metro Station entrance (`x = 2500`).
- **Level 4 (Koramangala Café Date)**:
  - Setting: Cozy red-brick café with outdoor patio seating, festoon fairy lights, and umbrella tables (2600px stage, `theme: 'cafe-koramangala'`).
  - Story Encounter: Dennis meets his date Ananya at the patio table (`x = 860`) for filter kaapi and bun maska until the trio crashes the date.
  - Exit: Koramangala 80ft Road Junction (`x = 2500`).

### 2. Continuous Pursuit & Critical Gameplay Rules
- **Chasers Never Wait for Blockers**: In Level 1 (and throughout Levels 1, 3, and 4), pursuit begins right from the start. Chasers do not pause or wait during Dennis's attacks, jumps, or blocker fights.
- **Urgency & Hesitation**: Every second Dennis spends stationary attacking blockers allows the pursuers to close the gap.
- **Controlled Story Beats**: During scripted dialogues (Levels 3 and 4), chasers visibly advance to a dramatic proximity (`~75px`) shouting in the background, pausing catch triggers until dialogue concludes and full chase resumes.

### 3. Reusable Tanglish Dialogue System (`src/game/systems/DialogueSystem.ts`)
- **Speech Bubble Design**: Screen-anchored comic cards with speaker badge pills, speech tail pointer, and high contrast typography.
- **Original Tanglish Script**: Character lines in authentic colloquial Bengaluru Tanglish for Manish, Sathish, Rahul, Dennis, Ananya, Raghu, and Preetham.
- **Cross-Platform Input**: Advances on `Space`, `Enter`, click, or touch tap on mobile.
- **Catch Sequence**: Getting caught freezes gameplay and launches a comic conversation exchange with the chaser who caught Dennis, followed by a visible "RETRY LEVEL" button.
- **Clean Reset**: Selecting Retry completely resets player position, enemy bodies, chaser coordinates, and dialogue state cleanly without memory leaks or duplicate listeners.


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
