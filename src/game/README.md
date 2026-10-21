# Phaser 3 Game Architecture

This directory houses all game-side code, configuration, entities, and systems powered by Phaser 3.

## Directory Structure

- `config/`: Engine configurations, scale settings, physics parameters, and display modes.
- `scenes/`: Phaser `Scene` subclasses (e.g., BootScene, PreloadScene, GameScene, HUDScene).
- `entities/`: Game sprites and actors (Dennis player entity, chasers, obstacles).
- `systems/`: Independent subsystems (input processing, audio orchestration, collision rules).
- `data/`: Game constants, level configurations, and dialog trees.

## React Lifecycle Integration & Cleanup Strategy

React manages the surrounding web UI, while Phaser manages the canvas and game loop.
To prevent duplicate canvases, hanging animation loops, and memory leaks during React hot-reloads or route unmounts:

1. **Mounting:**
   - Instantiate `new Phaser.Game(config)` within a `useEffect` hook in the mounting React component (e.g., `GameCanvas`).
   - Store the game instance in a React ref (`useRef<Phaser.Game | null>(null)`) rather than component state to prevent unnecessary re-renders.

2. **Destruction & Teardown:**
   - Return a cleanup function from the `useEffect` hook.
   - Invoke `gameRef.current.destroy(true)` (passing `true` to remove the canvas element and clear textures/cache).
   - Set the ref value back to `null`.

3. **Decoupling Rule:**
   - Never run Phaser's game loop inside React state or effects.
   - Communicate between React and Phaser through an event emitter or typed messaging interface rather than direct prop mutation.
