/**
 * DD Game Scratch - Centralized GTA-Inspired Game Typography Configuration
 *
 * Implements a bold, urban, confident GTA-inspired typographic system:
 * - Display / Titles: 'Teko' (Google Fonts, SIL OFL) with 'Impact' / 'Arial Black' fallbacks.
 * - Navigation / Headings / Badges: 'Barlow Condensed' (Google Fonts, SIL OFL) with 'Arial Narrow' fallbacks.
 * - Dialogue / Body / UI Text: 'Inter' (Google Fonts, SIL OFL) with system-ui fallbacks.
 *
 * Provides shared font families and typed style presets for both Phaser scenes and React components.
 */

export const GAME_FONTS = {
  /**
   * Bold condensed display font for primary game titles, victory banners, and large impact text.
   */
  display: "'Teko', 'Impact', 'Arial Black', sans-serif",

  /**
   * Condensed, assertive sans-serif for stage titles, badges, HUD gauges, buttons, and mission headers.
   */
  heading: "'Barlow Condensed', 'Arial Narrow', 'Franklin Gothic Medium', sans-serif",

  /**
   * Ultra-readable, clean sans-serif for comic Tanglish dialogues, body text, and settings descriptions.
   */
  body: "'Inter', -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif",

  /**
   * Monospace numeric font for timers, coordinates, and system stats.
   */
  mono: "'Barlow Condensed', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
} as const

/**
 * Pre-configured GTA-inspired Phaser TextStyle presets.
 */
export const GTA_PHASER_STYLES = {
  // Main Menu & Stage Banners
  mainTitle: {
    fontFamily: GAME_FONTS.display,
    fontSize: '64px',
    fontStyle: 'bold',
    color: '#ffffff',
    stroke: '#090d16',
    strokeThickness: 6,
    shadow: {
      offsetX: 3,
      offsetY: 3,
      color: '#000000',
      blur: 6,
      stroke: true,
      fill: true,
    },
  },

  stageTitle: {
    fontFamily: GAME_FONTS.display,
    fontSize: '46px',
    fontStyle: 'bold',
    color: '#ffffff',
    stroke: '#090d16',
    strokeThickness: 5,
  },

  stageSubtitle: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '22px',
    fontStyle: 'bold',
    color: '#f59e0b',
  },

  // HUD & Status
  hudBadge: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#34d399',
  },

  hudStatus: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '16px',
    fontStyle: 'bold',
    color: '#e2e8f0',
  },

  hudControlGuide: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#cbd5e1',
  },

  // Dialogue Bubbles
  dialogueSpeaker: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#f59e0b',
  },

  dialogueContent: {
    fontFamily: GAME_FONTS.body,
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#ffffff',
    align: 'left',
  },

  dialoguePrompt: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#fbbf24',
  },

  // Combat & Blockers
  characterBadge: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#ffffff',
  },

  hitSparkPow: {
    fontFamily: GAME_FONTS.display,
    fontSize: '38px',
    fontStyle: 'bold',
    color: '#fef08a',
    stroke: '#b45309',
    strokeThickness: 4,
  },

  hitSparkDown: {
    fontFamily: GAME_FONTS.display,
    fontSize: '42px',
    fontStyle: 'bold',
    color: '#f87171',
    stroke: '#991b1b',
    strokeThickness: 4,
  },

  // Modals & Overlay Screens
  modalHeader: {
    fontFamily: GAME_FONTS.display,
    fontSize: '48px',
    fontStyle: 'bold',
    color: '#ffffff',
    stroke: '#090d16',
    strokeThickness: 5,
  },

  modalSubheader: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '22px',
    fontStyle: 'bold',
    color: '#f59e0b',
  },

  modalBody: {
    fontFamily: GAME_FONTS.body,
    fontSize: '18px',
    color: '#e2e8f0',
    align: 'center',
  },

  modalButtonLabel: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '20px',
    fontStyle: 'bold',
    color: '#ffffff',
  },

  // Grand Victory Screen
  victoryTrophy: {
    fontFamily: GAME_FONTS.display,
    fontSize: '48px',
    fontStyle: 'bold',
    color: '#fef08a',
    stroke: '#78350f',
    strokeThickness: 6,
    shadow: {
      offsetX: 3,
      offsetY: 3,
      color: '#000000',
      blur: 8,
      stroke: true,
      fill: true,
    },
  },

  victorySubtitle: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '20px',
    fontStyle: 'bold',
    color: '#ffffff',
  },

  victoryChecklist: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#34d399',
  },

  developerCredit: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '22px',
    fontStyle: 'bold',
    color: '#f59e0b',
  },

  // Scenery & Urban Signboards
  scenerySignboard: {
    fontFamily: GAME_FONTS.heading,
    fontSize: '16px',
    fontStyle: 'bold',
    color: '#ffffff',
  },
} as const

/**
 * Ensures game web fonts are loaded into the browser font cache before Phaser renders text.
 */
export async function ensureGameFontsLoaded(): Promise<void> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await Promise.all([
        document.fonts.load('600 24px "Teko"'),
        document.fonts.load('700 24px "Barlow Condensed"'),
        document.fonts.load('600 16px "Inter"'),
      ])
    } catch {
      // Gracefully proceed with system font fallbacks
    }
  }
}
