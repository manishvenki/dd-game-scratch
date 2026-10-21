# DD Game Scratch — Asset Inventory & Naming Guide

This directory manages all public static assets served directly by the web server and loaded by the Phaser 3 game engine.

---

## Directory Organization

```
public/assets/
├── characters/
│   ├── references/       # Original source reference images provided by the user
│   └── sprites/          # Production-ready 2D spritesheets and animation atlases
├── backgrounds/          # Level environments, parallax layers, and tilesets
├── audio/
│   ├── music/            # Background music tracks (BGM)
│   └── sfx/              # Sound effect clips (SFX)
├── ui/                   # Game HUD icons, dialog boxes, buttons, and framing textures
└── fonts/                # Custom game font files (TTF/WOFF2/Bitmap fonts)
```

---

## Asset Conventions & Guidelines

### 1. Character References (`characters/references/`)
Reference photographs and artwork represent source material supplied by the team and are **strictly separated** from game sprites.
The confirmed character identities and visual profiles must remain consistent across all prompts:

- **Dennis**: Main playable character; curly dark hair, blue denim shirt, and jeans.
- **Manish**: Chaser NPC; black shirt and glasses.
- **Sathish**: Chaser NPC; black Lenovo T-shirt.
- **Rahul**: Chaser NPC; dark teal striped shirt.

*Note: Reference images are source inspiration; do not treat raw photos as game sprites.*

### 2. Character Sprites (`characters/sprites/`)
Future 2D animated spritesheets should follow a consistent naming schema and separate distinct animation states:
- Format: `[character]_[state]_[direction].[ext]` (or atlas JSON + PNG)
- Planned animation states: `idle`, `run`, `jump`, `fall`, `hit`, `attack`, `stumble`
- Example convention: `dennis_run.png`, `manish_chase.png`, `sathish_run.png`, `rahul_ambush.png`
- Transparent PNG format with consistent frame cell dimensions (e.g., 64×64 or 128×128 pixels).
- *Do not fabricate placeholder sprites before reference artwork is provided.*

### 3. Backgrounds (`backgrounds/`)
Level background artwork and parallax layers should be categorized by stage number and setting name:
- Format: `level[XX]_[setting]_[layer].[ext]`
- Planned Bengaluru settings:
  1. `level01_college_street/` (sky, buildings, sidewalk, foreground props)
  2. `level02_indiranagar/` (commercial street, shops, traffic)
  3. `level03_mg_road/` (night skyline, neon storefronts, pedestrian zone)
  4. `level04_koramangala/` (café interior, counter, outdoor patio)
  5. `level05_cubbon_park/` (tree canopy, park trails, bamboo grove)

### 4. Audio (`audio/`)
- **Music (`audio/music/`)**:
  - Reserved for background music tracks.
  - User-supplied game theme: `DD Game BGM.mp3` (verified and staged in `public/assets/audio/music/DD Game BGM.mp3`).
  - Audio files should be encoded in MP3 or OGG for broad cross-browser compatibility.
- **Sound Effects (`audio/sfx/`)**:
  - Short audio clips for player actions (jump, dodge, trip), chaser voice barks, and UI interactions.
  - Naming schema: `sfx_[category]_[action].[ext]` (e.g. `sfx_player_jump.mp3`, `sfx_ui_click.mp3`).

### 5. UI & Fonts (`ui/`, `fonts/`)
- **UI Assets (`ui/`)**:
  - Interface graphics, HUD scoreboards, life/energy indicators, dialog bubbles, and directional arrows.
  - Vector SVG or crisp PNG with alpha transparency.
- **Fonts (`fonts/`)**:
  - Custom game fonts must be locally hosted, appropriately licensed, and referenced through stable project paths.

---

## Repository Hygiene Rules
- Never commit unverified or copyrighted third-party assets without clear licensing.
- Never overwrite user-supplied assets.
- Large media files should be optimized (lossless PNG compression, normalized audio bitrates) to maintain repository performance.
