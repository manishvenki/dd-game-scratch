import Phaser from 'phaser'
import { type EnvironmentTheme } from '../levels/levelTypes'

export interface BengaluruCollegeStreetConfig {
  readonly scene: Phaser.Scene
  readonly stageWidth: number
  readonly viewportWidth: number
  readonly viewportHeight: number
  readonly groundY: number
  readonly theme?: EnvironmentTheme
}

/**
 * BengaluruCollegeStreet - Original Bengaluru-inspired anime street environment.
 *
 * Implements a layered parallax environment featuring:
 * 1. Warm daylight or twilight sky with subtle drifting clouds (ScrollFactor 0).
 * 2. Distant Bengaluru skyline with Vidhana Soudha dome & tech towers (ScrollFactor 0.15).
 * 3. Midground campus rooflines, clock tower & rain tree silhouettes (ScrollFactor 0.35).
 * 4. Interactive street scenery supporting 4 distinct themes:
 *    - 'college': Campus gate, stone walls, SLV Kaapi & Campus Xerox.
 *    - 'market': Colorful fruit & spice stalls with striped awnings.
 *    - 'commercial-mg': Namma Metro viaduct, neon commercial signs & drama rehearsal plaza.
 *    - 'cafe-koramangala': Cozy red-brick café, outdoor patio, fairy lights & Ananya date table.
 * 5. Paved sidewalk with yellow-and-black curb stones and asphalt road (ScrollFactor 1.0).
 */
export class BengaluruCollegeStreet {
  private scene: Phaser.Scene
  private stageWidth: number
  private viewportWidth: number
  private viewportHeight: number
  private groundY: number
  private theme: EnvironmentTheme = 'college'

  // Parallax layer containers
  private skyGraphics?: Phaser.GameObjects.Graphics
  private cloudContainer?: Phaser.GameObjects.Container
  private farSkylineGraphics?: Phaser.GameObjects.Graphics
  private midSkylineGraphics?: Phaser.GameObjects.Graphics
  private streetSceneryContainer?: Phaser.GameObjects.Container
  private roadGraphics?: Phaser.GameObjects.Graphics
  private foregroundAccents?: Phaser.GameObjects.Graphics

  // Procedural cloud state
  private clouds: Array<{ sprite: Phaser.GameObjects.Graphics; x: number; y: number; speed: number; scale: number }> = []

  constructor(config: BengaluruCollegeStreetConfig) {
    this.scene = config.scene
    this.stageWidth = config.stageWidth
    this.viewportWidth = config.viewportWidth
    this.viewportHeight = config.viewportHeight
    this.groundY = config.groundY
    this.theme = config.theme ?? 'college'

    this.createEnvironment()
  }


  /**
   * Builds all layers of the environment.
   */
  private createEnvironment(): void {
    // 1. Sky Layer (Fixed screen space, ScrollFactor 0)
    this.createSkyLayer()

    // 2. Distant Bengaluru Skyline (Parallax factor 0.15)
    this.createFarSkylineLayer()

    // 3. Mid-Distance Campus & Urban Rooflines (Parallax factor 0.35)
    this.createMidSkylineLayer()

    // 4. Street-level Scenery (World space, ScrollFactor 1.0)
    this.createStreetLevelScenery()

    // 5. Road Surface & Sidewalk (World space, ScrollFactor 1.0)
    this.createRoadAndSidewalk()

    // 6. Foreground Accents (ScrollFactor 1.0)
    this.createForegroundAccents()
  }

  /**
   * Layer 1: Warm anime morning daylight sky and soft clouds.
   */
  private createSkyLayer(): void {
    this.skyGraphics = this.scene.add.graphics()
    this.skyGraphics.setScrollFactor(0, 0)
    this.skyGraphics.setDepth(-100)

    this.drawSkyGradient()

    // Cloud container
    this.cloudContainer = this.scene.add.container(0, 0)
    this.cloudContainer.setScrollFactor(0, 0)
    this.cloudContainer.setDepth(-95)

    // Create 5 soft procedural clouds
    const cloudConfigs = [
      { x: 80, y: 45, speed: 0.12, scale: 1.0 },
      { x: 280, y: 75, speed: 0.08, scale: 0.75 },
      { x: 520, y: 35, speed: 0.14, scale: 1.2 },
      { x: 740, y: 65, speed: 0.09, scale: 0.85 },
      { x: 920, y: 40, speed: 0.11, scale: 1.1 },
    ]

    for (const cfg of cloudConfigs) {
      const g = this.scene.add.graphics()
      this.drawCloudGraphic(g, cfg.scale)
      g.setPosition(cfg.x, cfg.y)
      this.cloudContainer.add(g)
      this.clouds.push({ sprite: g, x: cfg.x, y: cfg.y, speed: cfg.speed, scale: cfg.scale })
    }
  }

  private drawSkyGradient(): void {
    if (!this.skyGraphics) return
    this.skyGraphics.clear()

    const w = this.viewportWidth + 20
    const h = this.viewportHeight + 20
    const bands = 24
    const bandHeight = Math.ceil(h / bands)

    for (let i = 0; i < bands; i++) {
      const ratio = i / bands
      let color = 0x38bdf8

      if (this.theme === 'commercial-mg') {
        // Twilight Neon Commercial Sky (Deep Indigo -> Magenta -> Cyan-Amber Horizon)
        if (ratio < 0.5) {
          const t = ratio / 0.5
          const r = Math.round(0x1e * (1 - t) + 0x58 * t)
          const g = Math.round(0x1b * (1 - t) + 0x1c * t)
          const b = Math.round(0x4b * (1 - t) + 0x87 * t)
          color = (r << 16) | (g << 8) | b
        } else {
          const t = (ratio - 0.5) / 0.5
          const r = Math.round(0x58 * (1 - t) + 0x02 * t)
          const g = Math.round(0x1c * (1 - t) + 0x84 * t)
          const b = Math.round(0x87 * (1 - t) + 0xc7 * t)
          color = (r << 16) | (g << 8) | b
        }
      } else if (this.theme === 'cafe-koramangala') {
        // Golden Hour / Sunset Café Sky (Twilight Slate -> Warm Peach -> Amber Horizon)
        if (ratio < 0.5) {
          const t = ratio / 0.5
          const r = Math.round(0x31 * (1 - t) + 0xf4 * t)
          const g = Math.round(0x2e * (1 - t) + 0x3f * t)
          const b = Math.round(0x81 * (1 - t) + 0x5e * t)
          color = (r << 16) | (g << 8) | b
        } else {
          const t = (ratio - 0.5) / 0.5
          const r = Math.round(0xf4 * (1 - t) + 0xfe * t)
          const g = Math.round(0x3f * (1 - t) + 0xf0 * t)
          const b = Math.round(0x5e * (1 - t) + 0x8a * t)
          color = (r << 16) | (g << 8) | b
        }
      } else if (this.theme === 'park-cubbon') {
        // Warm sunset park sky (Deep Twilight Sapphire -> Rich Terracotta Orange -> Warm Golden Horizon)
        if (ratio < 0.4) {
          const t = ratio / 0.4
          const r = Math.round(0x1e * (1 - t) + 0xc2 * t)
          const g = Math.round(0x29 * (1 - t) + 0x41 * t)
          const b = Math.round(0x4b * (1 - t) + 0x0c * t)
          color = (r << 16) | (g << 8) | b
        } else if (ratio < 0.75) {
          const t = (ratio - 0.4) / 0.35
          const r = Math.round(0xc2 * (1 - t) + 0xf5 * t)
          const g = Math.round(0x41 * (1 - t) + 0x9e * t)
          const b = Math.round(0x0c * (1 - t) + 0x0b * t)
          color = (r << 16) | (g << 8) | b
        } else {
          const t = (ratio - 0.75) / 0.25
          const r = Math.round(0xf5 * (1 - t) + 0xfd * t)
          const g = Math.round(0x9e * (1 - t) + 0xe0 * t)
          const b = Math.round(0x0b * (1 - t) + 0x47 * t)
          color = (r << 16) | (g << 8) | b
        }
      } else {
        // Daytime College & Market Sky
        if (ratio < 0.45) {
          const t = ratio / 0.45
          const r = Math.round(0x25 * (1 - t) + 0x60 * t)
          const g = Math.round(0x63 * (1 - t) + 0xa5 * t)
          const b = Math.round(0xeb * (1 - t) + 0xfa * t)
          color = (r << 16) | (g << 8) | b
        } else if (ratio < 0.8) {
          const t = (ratio - 0.45) / 0.35
          const r = Math.round(0x60 * (1 - t) + 0x93 * t)
          const g = Math.round(0xa5 * (1 - t) + 0xc5 * t)
          const b = Math.round(0xfa * (1 - t) + 0xfd * t)
          color = (r << 16) | (g << 8) | b
        } else {
          const t = (ratio - 0.8) / 0.2
          const r = Math.round(0x93 * (1 - t) + 0xfe * t)
          const g = Math.round(0xc5 * (1 - t) + 0xd7 * t)
          const b = Math.round(0xfd * (1 - t) + 0xaa * t)
          color = (r << 16) | (g << 8) | b
        }
      }

      this.skyGraphics.fillStyle(color, 1)
      this.skyGraphics.fillRect(0, i * bandHeight, w, bandHeight + 1)
    }

    // Celestial Bodies & Sun / Moon
    if (this.theme === 'commercial-mg') {
      // Crescent Moon in twilight
      this.skyGraphics.fillStyle(0xf8fafc, 0.85)
      this.skyGraphics.fillCircle(w * 0.76, h * 0.2, 20)
      this.skyGraphics.fillStyle(0x3b1d6b, 0.95)
      this.skyGraphics.fillCircle(w * 0.76 + 7, h * 0.2 - 4, 18)
    } else if (this.theme === 'cafe-koramangala') {
      // Soft golden hour sun disc
      this.skyGraphics.fillStyle(0xfef08a, 0.4)
      this.skyGraphics.fillCircle(w * 0.68, h * 0.28, 48)
      this.skyGraphics.fillStyle(0xfde047, 0.7)
      this.skyGraphics.fillCircle(w * 0.68, h * 0.28, 30)
      this.skyGraphics.fillStyle(0xffffff, 0.95)
      this.skyGraphics.fillCircle(w * 0.68, h * 0.28, 16)
    } else if (this.theme === 'park-cubbon') {
      // Warm late afternoon sunset disc filtering through Cubbon Park canopy
      this.skyGraphics.fillStyle(0xfde047, 0.35)
      this.skyGraphics.fillCircle(w * 0.74, h * 0.28, 54)
      this.skyGraphics.fillStyle(0xfbbf24, 0.65)
      this.skyGraphics.fillCircle(w * 0.74, h * 0.28, 34)
      this.skyGraphics.fillStyle(0xfffbeb, 0.95)
      this.skyGraphics.fillCircle(w * 0.74, h * 0.28, 18)
    } else {
      // Distant morning sun disc
      this.skyGraphics.fillStyle(0xfffbeb, 0.45)
      this.skyGraphics.fillCircle(w * 0.72, h * 0.24, 46)
      this.skyGraphics.fillStyle(0xffedd5, 0.75)
      this.skyGraphics.fillCircle(w * 0.72, h * 0.24, 30)
      this.skyGraphics.fillStyle(0xffffff, 0.95)
      this.skyGraphics.fillCircle(w * 0.72, h * 0.24, 18)
    }
  }


  private drawCloudGraphic(g: Phaser.GameObjects.Graphics, scale: number): void {
    g.clear()
    g.fillStyle(0xffffff, 0.65)
    g.fillCircle(0, 0, 22 * scale)
    g.fillCircle(18 * scale, -6 * scale, 17 * scale)
    g.fillCircle(38 * scale, 2 * scale, 19 * scale)
    g.fillCircle(20 * scale, 8 * scale, 15 * scale)
    g.fillCircle(-16 * scale, 5 * scale, 14 * scale)

    // Soft underbelly shading
    g.fillStyle(0xe0f2fe, 0.5)
    g.fillRoundedRect(-24 * scale, 6 * scale, 72 * scale, 10 * scale, 5 * scale)
  }

  /**
   * Layer 2: Distant Bengaluru Skyline (Vidhana Soudha dome & tech towers).
   */
  private createFarSkylineLayer(): void {
    this.farSkylineGraphics = this.scene.add.graphics()
    this.farSkylineGraphics.setScrollFactor(0.15, 0)
    this.farSkylineGraphics.setDepth(-80)

    this.drawFarSkyline()
  }

  private drawFarSkyline(): void {
    if (!this.farSkylineGraphics) return
    const g = this.farSkylineGraphics
    g.clear()

    const totalWidth = this.stageWidth * 0.6 + this.viewportWidth
    const horizonY = this.groundY - 110

    if (this.theme === 'park-cubbon') {
      this.drawParkCubbonFarSkyline(g, totalWidth, horizonY)
      return
    }

    // Distant atmospheric silhouette color (#3b5278 with transparency)
    g.fillStyle(0x3b5278, 0.45)

    // Distant tech towers & urban blocks
    for (let x = 0; x < totalWidth; x += 90) {
      const bldgW = 55 + ((x * 17) % 35)
      const bldgH = 65 + ((x * 31) % 85)
      g.fillRect(x, horizonY - bldgH, bldgW, bldgH + 120)

      // Antenna / Communication mast on taller buildings
      if (bldgH > 110) {
        g.lineStyle(1.5, 0x3b5278, 0.4)
        g.lineBetween(x + bldgW / 2, horizonY - bldgH, x + bldgW / 2, horizonY - bldgH - 18)
        g.fillStyle(0xf87171, 0.5) // Red aircraft beacon
        g.fillCircle(x + bldgW / 2, horizonY - bldgH - 18, 2)
        g.fillStyle(0x3b5278, 0.45)
      }
    }

    // Iconic Bengaluru Heritage Dome silhouette (Vidhana Soudha / Central College tribute)
    const domeX = 380
    const domeBaseY = horizonY - 70
    g.fillStyle(0x334a6e, 0.6)
    g.fillRect(domeX - 45, domeBaseY, 90, 80) // Central block
    // Arcaded colonnade
    for (let col = -38; col <= 38; col += 12) {
      g.fillRect(domeX + col, domeBaseY - 18, 6, 20)
    }
    // Main Dome
    g.fillCircle(domeX, domeBaseY - 26, 32)
    // Finial (Kalasam)
    g.fillRect(domeX - 2, domeBaseY - 68, 4, 14)
    g.fillCircle(domeX, domeBaseY - 68, 4)

    // Distant tree canopies between buildings
    g.fillStyle(0x27435f, 0.4)
    for (let x = 30; x < totalWidth; x += 110) {
      g.fillCircle(x, horizonY - 25, 34)
      g.fillCircle(x + 22, horizonY - 32, 28)
      g.fillCircle(x - 18, horizonY - 22, 26)
    }
  }

  /**
   * Layer 3: Mid-Distance Campus & Urban Rooflines (Parallax factor 0.35).
   */
  private createMidSkylineLayer(): void {
    this.midSkylineGraphics = this.scene.add.graphics()
    this.midSkylineGraphics.setScrollFactor(0.35, 0)
    this.midSkylineGraphics.setDepth(-60)

    this.drawMidSkyline()
  }

  private drawMidSkyline(): void {
    if (!this.midSkylineGraphics) return
    const g = this.midSkylineGraphics
    g.clear()

    const totalWidth = this.stageWidth * 0.8 + this.viewportWidth
    const baseY = this.groundY - 60

    if (this.theme === 'park-cubbon') {
      this.drawParkCubbonMidSkyline(g, totalWidth, baseY)
      return
    }

    // Midground buildings: Campus department blocks, water tank, clock tower
    g.fillStyle(0x475569, 0.65)

    // Clock tower at x = 720
    const clockX = 720
    g.fillRect(clockX - 18, baseY - 145, 36, 150)
    // Pyramid roof
    g.beginPath()
    g.moveTo(clockX - 22, baseY - 145)
    g.lineTo(clockX + 22, baseY - 145)
    g.lineTo(clockX, baseY - 175)
    g.closePath()
    g.fillPath()
    // Clock dial
    g.fillStyle(0xfef08a, 0.8)
    g.fillCircle(clockX, baseY - 128, 8)
    g.fillStyle(0x475569, 0.65)

    // Repetitive campus blocks with pitched terracotta-style roofs
    for (let x = 60; x < totalWidth; x += 190) {
      const bW = 110
      const bH = 65 + ((x * 23) % 40)
      g.fillStyle(0x64748b, 0.6)
      g.fillRect(x, baseY - bH, bW, bH + 65)

      // Terracotta pitched roof eaves
      g.fillStyle(0x991b1b, 0.55)
      g.beginPath()
      g.moveTo(x - 6, baseY - bH)
      g.lineTo(x + bW + 6, baseY - bH)
      g.lineTo(x + bW / 2, baseY - bH - 18)
      g.closePath()
      g.fillPath()

      // Rooftop water tank (classic Indian syntax)
      if (x % 380 === 60) {
        g.fillStyle(0x0284c7, 0.7) // Sintex black/blue tank
        g.fillRoundedRect(x + 15, baseY - bH - 32, 22, 14, 3)
      }
    }

    // Midground lush Rain Tree canopies
    g.fillStyle(0x1e3a5f, 0.55)
    for (let x = 120; x < totalWidth; x += 220) {
      g.fillCircle(x, baseY - 35, 42)
      g.fillCircle(x + 28, baseY - 45, 36)
      g.fillCircle(x - 24, baseY - 38, 34)
    }
  }

  /**
   * Layer 4: Street-level Scenery (World space, ScrollFactor 1.0).
   * Spans the full stageWidth so Dennis can run past distinct themed street landmarks.
   */
  private createStreetLevelScenery(): void {
    this.streetSceneryContainer = this.scene.add.container(0, 0)
    this.streetSceneryContainer.setScrollFactor(1.0, 1.0)
    this.streetSceneryContainer.setDepth(-20)

    this.renderStreetSceneryContent()
  }

  public rebuildStreetLevelScenery(): void {
    if (!this.streetSceneryContainer) return
    this.streetSceneryContainer.removeAll(true)
    this.renderStreetSceneryContent()
  }

  private renderStreetSceneryContent(): void {
    if (!this.streetSceneryContainer) return
    const g = this.scene.add.graphics()
    this.streetSceneryContainer.add(g)
    const groundY = this.groundY

    if (this.theme === 'commercial-mg') {
      this.drawCommercialMgStreetScenery(g, groundY)
    } else if (this.theme === 'cafe-koramangala') {
      this.drawCafeKoramangalaStreetScenery(g, groundY)
    } else if (this.theme === 'market') {
      this.drawMarketStreetScenery(g, groundY)
    } else if (this.theme === 'park-cubbon') {
      this.drawParkCubbonStreetScenery(g, groundY)
    } else {
      this.drawCollegeStreetScenery(g, groundY)
    }
  }

  /**
   * Theme: College Street (Level 1)
   */
  private drawCollegeStreetScenery(g: Phaser.GameObjects.Graphics, groundY: number): void {
    // A. College Boundary Wall spanning sections of the street
    this.drawCollegeBoundaryWall(g, 0, 520, groundY)
    this.drawCollegeBoundaryWall(g, 1160, this.stageWidth, groundY)

    // B. College Main Entrance Gateway (x: 520 to 1160)
    this.drawCollegeMainEntrance(g, 520, 1160, groundY)

    // C. Iconic Bangalore "SLV KAAPI & TIFFIN CORNER" (x: 280 to 480)
    this.drawKaapiTiffinShop(g, 280, groundY)

    // D. "CAMPUS XEROX & STATIONERY" (x: 1280 to 1480)
    this.drawStationeryShop(g, 1280, groundY)

    // E. Bengaluru Street Trees (Lush Gulmohar with orange blossoms & Rain trees)
    this.drawGulmoharTree(g, 180, groundY, 1.1)
    this.drawRainTree(g, 720, groundY, 1.0)
    this.drawGulmoharTree(g, 1580, groundY, 1.15)
    this.drawRainTree(g, 2150, groundY, 1.05)

    // F. Classic Indian Streetlights along the sidewalk
    const lampPositions = [120, 520, 880, 1220, 1680, 2040, 2320]
    for (const lampX of lampPositions) {
      this.drawStreetLamp(g, lampX, groundY)
    }

    // G. Yellow-and-Black BESCOM Distribution Boxes & Street Signboards
    this.drawBescomBox(g, 490, groundY)
    this.drawBescomBox(g, 1510, groundY)
    this.drawStreetSignboard(g, 1180, groundY)

    // H. Text labels for shops & college gate
    this.createShopAndGateLabels()
  }

  /**
   * Theme: MG Road / Brigade Road (Level 3)
   */
  private drawCommercialMgStreetScenery(g: Phaser.GameObjects.Graphics, groundY: number): void {
    // 1. Elevated Namma Metro concrete viaduct track overhead
    const trackY = groundY - 145
    g.fillStyle(0x475569, 1)
    for (let x = 180; x < this.stageWidth; x += 260) {
      g.fillRect(x - 14, trackY + 12, 28, groundY - trackY - 12)
      g.fillStyle(0x64748b, 1)
      g.fillRect(x - 32, trackY, 64, 12)
      g.fillStyle(0x475569, 1)
    }
    g.fillStyle(0x334155, 1)
    g.fillRect(0, trackY, this.stageWidth, 12)
    g.fillStyle(0x1e293b, 1)
    g.fillRect(0, trackY + 12, this.stageWidth, 3)

    // Namma Metro train on track at x: 820 to 1260
    const trainX = 820
    const trainW = 440
    const trainH = 34
    const trainY = trackY - trainH
    g.fillStyle(0xe2e8f0, 1)
    g.fillRoundedRect(trainX, trainY, trainW, trainH, 6)
    g.fillStyle(0x16a34a, 1)
    g.fillRect(trainX, trainY + 18, trainW, 6)
    g.fillStyle(0xfef08a, 0.9)
    for (let wx = trainX + 20; wx < trainX + trainW - 20; wx += 35) {
      g.fillRoundedRect(wx, trainY + 6, 22, 10, 2)
    }

    // 2. Commercial Buildings on the ground
    // A. "BRIGADE MUSIC & ARCADE" (x: 40 to 420)
    g.fillStyle(0x1e1b4b, 0.95)
    g.fillRect(40, groundY - 130, 380, 130)
    g.lineStyle(2, 0x818cf8, 0.8)
    g.strokeRect(40, groundY - 130, 380, 130)
    g.fillStyle(0x0f172a, 0.9)
    g.fillRect(60, groundY - 70, 340, 70)
    g.fillStyle(0x38bdf8, 0.3)
    g.fillRect(65, groundY - 65, 160, 60)
    g.fillRect(235, groundY - 65, 160, 60)

    // B. "CAUVERY HANDICRAFTS EMPORIUM" (x: 460 to 820)
    g.fillStyle(0x78350f, 0.95)
    g.fillRect(460, groundY - 135, 360, 135)
    g.lineStyle(2, 0xf59e0b, 0.8)
    g.strokeRect(460, groundY - 135, 360, 135)
    g.fillStyle(0xb45309, 1)
    g.fillRoundedRect(560, groundY - 95, 160, 95, 20)

    // C. Encounter Spot: Drama Club Rehearsal Plaza at x: 860 to 1040
    g.fillStyle(0x0f172a, 0.9)
    g.fillRect(860, groundY - 100, 180, 100)
    g.lineStyle(2, 0x0d9488, 1)
    g.strokeRect(860, groundY - 100, 180, 100)
    // Curtains
    g.fillStyle(0x991b1b, 0.9)
    g.fillRect(870, groundY - 95, 30, 80)
    g.fillRect(1000, groundY - 95, 30, 80)
    // Actor 1 (Raghu - teal drama cloak)
    g.fillStyle(0x0d9488, 1)
    g.fillRoundedRect(915, groundY - 50, 18, 48, 4)
    g.fillStyle(0xfed7aa, 1)
    g.fillCircle(924, groundY - 56, 7)
    g.fillStyle(0xfbbf24, 1)
    g.fillCircle(924, groundY - 60, 8)
    // Actor 2 (Preetham - emerald drama robe)
    g.fillStyle(0x059669, 1)
    g.fillRoundedRect(955, groundY - 50, 18, 48, 4)
    g.fillStyle(0xfed7aa, 1)
    g.fillCircle(964, groundY - 56, 7)
    g.fillStyle(0x9333ea, 1)
    g.fillCircle(964, groundY - 60, 8)

    // D. "MG ELECTRONICS HUB" (x: 1080 to 1540)
    g.fillStyle(0x0f172a, 0.95)
    g.fillRect(1080, groundY - 140, 460, 140)
    g.lineStyle(2, 0x06b6d4, 0.9)
    g.strokeRect(1080, groundY - 140, 460, 140)
    g.fillStyle(0x0284c7, 0.25)
    g.fillRect(1100, groundY - 80, 420, 75)

    // E. "FASHION BOUTIQUE" (x: 1580 to 2060)
    g.fillStyle(0x831843, 0.95)
    g.fillRect(1580, groundY - 130, 480, 130)
    g.lineStyle(2, 0xf472b6, 0.9)
    g.strokeRect(1580, groundY - 130, 480, 130)

    // F. "NAMMA METRO STATION" Entrance at x: 2100 to stageWidth
    g.fillStyle(0x064e3b, 0.95)
    g.fillRect(2100, groundY - 145, this.stageWidth - 2100, 145)
    g.lineStyle(2, 0x10b981, 1)
    g.strokeRect(2100, groundY - 145, this.stageWidth - 2100, 145)

    // Modern streetlamps
    for (let lx = 140; lx < this.stageWidth; lx += 260) {
      this.drawModernStreetLamp(g, lx, groundY)
    }

    this.createCommercialMgLabels(groundY)
  }

  /**
   * Theme: Koramangala Café Date (Level 4)
   */
  private drawCafeKoramangalaStreetScenery(g: Phaser.GameObjects.Graphics, groundY: number): void {
    // A. Boutique Bookstore & Florist (x: 40 to 420)
    g.fillStyle(0x1e293b, 0.95)
    g.fillRect(40, groundY - 120, 380, 120)
    g.lineStyle(2, 0x38bdf8, 0.7)
    g.strokeRect(40, groundY - 120, 380, 120)

    // B. "CHAI & CHAT CAFÉ — KORAMANGALA" (x: 460 to 1120)
    g.fillStyle(0x7f1d1d, 0.98)
    g.fillRect(460, groundY - 145, 660, 145)
    g.lineStyle(2, 0xf59e0b, 0.8)
    g.strokeRect(460, groundY - 145, 660, 145)
    g.fillStyle(0xfef08a, 0.85)
    for (let wx = 500; wx < 1080; wx += 90) {
      g.fillRoundedRect(wx, groundY - 110, 42, 48, 14)
      g.lineStyle(1.5, 0x78350f, 1)
      g.strokeRoundedRect(wx, groundY - 110, 42, 48, 14)
    }

    // Striped Patio Awning
    const awningY = groundY - 82
    const awningH = 26
    for (let ax = 680; ax < 1040; ax += 20) {
      const isGreen = Math.floor((ax - 680) / 20) % 2 === 0
      g.fillStyle(isGreen ? 0x065f46 : 0xfef3c7, 1)
      g.fillRect(ax, awningY, 20, awningH)
    }

    // Hanging string festoon lights
    g.lineStyle(1.5, 0x0f172a, 0.8)
    for (let lx = 690; lx < 1030; lx += 45) {
      g.lineBetween(lx, awningY + awningH, lx + 45, awningY + awningH)
      g.fillStyle(0xfbbf24, 1)
      g.fillCircle(lx + 22, awningY + awningH + 6, 4)
      g.fillStyle(0xfef08a, 0.4)
      g.fillCircle(lx + 22, awningY + awningH + 6, 8)
    }

    // Outdoor Café Tables & Chairs
    this.drawCafeTableAndChairs(g, 740, groundY, false)
    this.drawCafeTableAndChairs(g, 860, groundY, true) // Ananya seated
    this.drawCafeTableAndChairs(g, 980, groundY, false)

    // Chalkboard menu stand at x: 690
    g.fillStyle(0x1e293b, 1)
    g.fillRect(685, groundY - 45, 28, 45)
    g.lineStyle(2, 0x78350f, 1)
    g.strokeRect(685, groundY - 45, 28, 45)

    // C. "KORAMANGALA ROASTERS & BAKERY" (x: 1160 to 1660)
    g.fillStyle(0x451a03, 0.95)
    g.fillRect(1160, groundY - 130, 500, 130)
    g.lineStyle(2, 0xd97706, 0.8)
    g.strokeRect(1160, groundY - 130, 500, 130)

    // D. Tree-lined avenue with Gulmohar trees
    this.drawGulmoharTree(g, 260, groundY, 1.05)
    this.drawGulmoharTree(g, 1850, groundY, 1.1)
    this.drawRainTree(g, 2250, groundY, 1.05)

    // Streetlights
    const lampPositions = [120, 440, 1140, 1720, 2150, 2480]
    for (const lampX of lampPositions) {
      this.drawStreetLamp(g, lampX, groundY)
    }

    this.createCafeKoramangalaLabels(groundY)
  }

  /**
   * Theme: Roadside Market (Level 2)
   */
  private drawMarketStreetScenery(g: Phaser.GameObjects.Graphics, groundY: number): void {
    // A. "SRI KRISHNA FRUITS & JUICE" (x: 240 to 580)
    g.fillStyle(0x7c2d12, 0.95)
    g.fillRect(240, groundY - 110, 340, 110)
    for (let ax = 240; ax < 580; ax += 20) {
      const isOrange = Math.floor((ax - 240) / 20) % 2 === 0
      g.fillStyle(isOrange ? 0xea580c : 0xfef08a, 1)
      g.fillRect(ax, groundY - 90, 20, 24)
    }
    g.fillStyle(0xb45309, 1)
    g.fillRect(260, groundY - 24, 70, 24)
    g.fillRect(350, groundY - 24, 70, 24)

    // B. "MALLESHWARAM FRESH FLOWERS" (x: 820 to 1180)
    g.fillStyle(0x064e3b, 0.95)
    g.fillRect(820, groundY - 110, 360, 110)
    for (let ax = 820; ax < 1180; ax += 20) {
      const isGreen = Math.floor((ax - 820) / 20) % 2 === 0
      g.fillStyle(isGreen ? 0x16a34a : 0xfef3c7, 1)
      g.fillRect(ax, groundY - 90, 20, 24)
    }

    // C. "BENGALURU SPICES & CONDIMENTS" (x: 1420 to 1780)
    g.fillStyle(0x7f1d1d, 0.95)
    g.fillRect(1420, groundY - 110, 360, 110)
    for (let ax = 1420; ax < 1780; ax += 20) {
      const isRed = Math.floor((ax - 1420) / 20) % 2 === 0
      g.fillStyle(isRed ? 0xdc2626 : 0xfef08a, 1)
      g.fillRect(ax, groundY - 90, 20, 24)
    }

    this.drawGulmoharTree(g, 140, groundY, 1.05)
    this.drawRainTree(g, 700, groundY, 1.0)
    this.drawGulmoharTree(g, 1300, groundY, 1.1)
    this.drawRainTree(g, 1920, groundY, 1.05)

    const lampPositions = [180, 680, 1280, 1850, 2120]
    for (const lampX of lampPositions) {
      this.drawStreetLamp(g, lampX, groundY)
    }

    this.createMarketLabels(groundY)
  }

  private drawCafeTableAndChairs(g: Phaser.GameObjects.Graphics, x: number, groundY: number, hasDate: boolean): void {
    const tableTopY = groundY - 32
    g.fillStyle(0x78350f, 1)
    g.fillEllipse(x, tableTopY, 44, 14)
    g.fillStyle(0x334155, 1)
    g.fillRect(x - 3, tableTopY, 6, 32)
    g.fillEllipse(x, groundY - 2, 24, 6)

    // Chairs
    g.fillStyle(0x92400e, 1)
    g.fillRect(x - 30, groundY - 36, 6, 36)
    g.fillRect(x - 30, groundY - 20, 16, 4)
    g.fillRect(x + 24, groundY - 36, 6, 36)
    g.fillRect(x + 14, groundY - 20, 16, 4)

    // Coffee mug
    g.fillStyle(0xffffff, 1)
    g.fillRect(x - 6, tableTopY - 10, 10, 8)
    g.fillStyle(0x78350f, 1)
    g.fillRect(x - 5, tableTopY - 9, 8, 3)

    if (hasDate) {
      // Ananya seated
      g.fillStyle(0xdb2777, 1)
      g.fillRoundedRect(x + 15, groundY - 52, 16, 34, 4)
      g.fillStyle(0xfed7aa, 1)
      g.fillCircle(x + 23, groundY - 58, 6.5)
      g.fillStyle(0x1e1b4b, 1)
      g.fillCircle(x + 23, groundY - 60, 8)
      g.fillRect(x + 25, groundY - 60, 6, 20)
    }
  }

  private drawModernStreetLamp(g: Phaser.GameObjects.Graphics, x: number, groundY: number): void {
    const poleH = 120
    const topY = groundY - poleH
    g.fillStyle(0x94a3b8, 1)
    g.fillRect(x - 2.5, topY, 5, poleH)
    g.lineStyle(3, 0x94a3b8, 1)
    g.lineBetween(x, topY, x + 18, topY - 8)
    g.fillStyle(0x38bdf8, 1)
    g.fillRoundedRect(x + 10, topY - 12, 18, 6, 2)
    g.fillStyle(0x38bdf8, 0.08)
    g.fillTriangle(x + 19, topY - 6, x - 15, groundY, x + 55, groundY)
  }

  private createCommercialMgLabels(groundY: number): void {
    if (!this.streetSceneryContainer) return
    const addLabel = (x: number, y: number, text: string, color: string, fontSize: string) => {
      const t = this.scene.add
        .text(x, y, text, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize,
          fontStyle: 'bold',
          color,
          align: 'center',
        })
        .setOrigin(0.5, 0.5)
      this.streetSceneryContainer?.add(t)
    }

    addLabel(230, groundY - 110, 'BRIGADE MUSIC & GAMES\n• NEON ARCADE •', '#c084fc', '8.5px')
    addLabel(640, groundY - 118, 'CAUVERY HANDICRAFTS EMPORIUM\n• GOVT OF KARNATAKA •', '#fbbf24', '8.5px')
    addLabel(940, groundY - 86, 'BCC DRAMA CLUB • REHEARSAL SPOT\n[ANNUAL PLAY REHEARSAL]', '#5eead4', '7.5px')
    addLabel(1300, groundY - 120, 'MG ELECTRONICS & GADGET HUB\n• 5G PHONES & ACCESSORIES •', '#38bdf8', '8.5px')
    addLabel(1820, groundY - 112, 'METRO FASHION BOUTIQUE\n• NEW SEASON COLLECTION •', '#f472b6', '8.5px')
    addLabel(2320, groundY - 128, 'NAMMA METRO • MG ROAD STATION\nENTRANCE TO PURPLE LINE →', '#34d399', '9px')
  }

  private createCafeKoramangalaLabels(groundY: number): void {
    if (!this.streetSceneryContainer) return
    const addLabel = (x: number, y: number, text: string, color: string, fontSize: string) => {
      const t = this.scene.add
        .text(x, y, text, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize,
          fontStyle: 'bold',
          color,
          align: 'center',
        })
        .setOrigin(0.5, 0.5)
      this.streetSceneryContainer?.add(t)
    }

    addLabel(230, groundY - 105, 'ATTICUS BOOKS & GIFTS\n• NOVELS & PRINTS •', '#93c5fd', '8px')
    addLabel(860, groundY - 128, 'CHAI & CHAT CAFÉ • KORAMANGALA\n• ARTISANAL COFFEE & BUN MASKA •', '#fef08a', '9.5px')
    addLabel(699, groundY - 32, 'KAAPI ₹30\nBUN ₹40', '#ffffff', '5px')
    addLabel(860, groundY - 70, 'ANANYA’S TABLE ♥', '#f472b6', '7.5px')
    addLabel(1410, groundY - 112, 'KORAMANGALA ROASTERS BAKERY\n• SOURDOUGH & PASTRIES •', '#fdba74', '8px')
    addLabel(2380, groundY - 115, '80FT ROAD JUNCTION\n← SONY WORLD SIGNAL', '#cbd5e1', '8.5px')
  }

  private createMarketLabels(groundY: number): void {
    if (!this.streetSceneryContainer) return
    const addLabel = (x: number, y: number, text: string, color: string, fontSize: string) => {
      const t = this.scene.add
        .text(x, y, text, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize,
          fontStyle: 'bold',
          color,
          align: 'center',
        })
        .setOrigin(0.5, 0.5)
      this.streetSceneryContainer?.add(t)
    }

    addLabel(410, groundY - 95, 'SRI KRISHNA FRUITS & FRESH JUICE\n• MOSAMBI & MANGO •', '#fef08a', '8.5px')
    addLabel(1000, groundY - 95, 'MALLESHWARAM FRESH FLOWERS\n• JASMINE & MARIGOLD •', '#86efac', '8.5px')
    addLabel(1600, groundY - 95, 'BENGALURU SPICES & CONDIMENTS\n• BYADGI CHILLI & CARDAMOM •', '#fca5a5', '8.5px')
  }

  /**
   * Theme: Cubbon Park (Level 5) - Distant Skyline
   */
  private drawParkCubbonFarSkyline(g: Phaser.GameObjects.Graphics, totalWidth: number, horizonY: number): void {
    // 1. Distant lush canopy layer along horizon
    g.fillStyle(0x14532d, 0.35)
    for (let x = 20; x < totalWidth; x += 85) {
      const r = 38 + ((x * 19) % 24)
      g.fillCircle(x, horizonY - 20, r)
      g.fillCircle(x + 24, horizonY - 28, r - 6)
      g.fillCircle(x - 18, horizonY - 18, r - 8)
    }

    // 2. Iconic Heritage High Court (Attara Kacheri) Red Brick Silhouette at x = 520
    const hcX = 520
    const hcW = 240
    const hcH = 65
    g.fillStyle(0x7f1d1d, 0.45) // Pompeian Red
    g.fillRect(hcX, horizonY - hcH, hcW, hcH + 30)
    // Classical portico with pediment
    g.beginPath()
    g.moveTo(hcX + 70, horizonY - hcH)
    g.lineTo(hcX + 170, horizonY - hcH)
    g.lineTo(hcX + 120, horizonY - hcH - 22)
    g.closePath()
    g.fillPath()
    // Colonnade columns
    for (let cx = hcX + 10; cx < hcX + hcW - 10; cx += 18) {
      g.fillRect(cx, horizonY - hcH + 8, 4, hcH - 8)
    }

    // 3. Vidhana Soudha Central Dome Silhouette at x = 1120
    const vsX = 1120
    g.fillStyle(0x334155, 0.45)
    g.fillRect(vsX - 35, horizonY - 45, 70, 55)
    g.fillCircle(vsX, horizonY - 50, 26)
    g.fillRect(vsX - 2, horizonY - 82, 4, 12)
    g.fillCircle(vsX, horizonY - 82, 3)

    // 4. Distant Giant Rain Tree silhouetted tops
    g.fillStyle(0x064e3b, 0.4)
    for (let x = 80; x < totalWidth; x += 190) {
      g.fillCircle(x, horizonY - 42, 48)
      g.fillCircle(x + 30, horizonY - 48, 42)
    }
  }

  /**
   * Theme: Cubbon Park (Level 5) - Midground Parallax
   */
  private drawParkCubbonMidSkyline(g: Phaser.GameObjects.Graphics, totalWidth: number, baseY: number): void {
    // Rolling midground park green slopes
    g.fillStyle(0x166534, 0.5)
    for (let x = 0; x < totalWidth; x += 180) {
      g.fillCircle(x, baseY - 30, 75)
    }

    // Midground Rain Trees with glowing amber rim-lighting from sunset
    g.fillStyle(0x14532d, 0.6)
    for (let x = 60; x < totalWidth; x += 220) {
      g.fillCircle(x, baseY - 50, 52)
      g.fillCircle(x + 35, baseY - 62, 44)
      g.fillCircle(x - 30, baseY - 48, 46)
    }

    // Midground Victorian garden gazebo silhouette at x = 760 and 1640
    for (const gzX of [760, 1640]) {
      if (gzX < totalWidth) {
        g.fillStyle(0x1e293b, 0.6)
        g.fillRect(gzX - 20, baseY - 45, 40, 45)
        g.beginPath()
        g.moveTo(gzX - 25, baseY - 45)
        g.lineTo(gzX + 25, baseY - 45)
        g.lineTo(gzX, baseY - 68)
        g.closePath()
        g.fillPath()
      }
    }
  }

  /**
   * Theme: Cubbon Park (Level 5) - Full Street/Park Scenery
   */
  private drawParkCubbonStreetScenery(g: Phaser.GameObjects.Graphics, groundY: number): void {
    // 1. Lush Green Lawn Background across entire stage
    g.fillStyle(0x065f46, 0.95)
    g.fillRect(0, groundY - 65, this.stageWidth, 65)

    // Ornamental Stone Garden Border
    g.fillStyle(0x475569, 1)
    g.fillRect(0, groundY - 14, this.stageWidth, 14)
    g.fillStyle(0x64748b, 1)
    g.fillRect(0, groundY - 14, this.stageWidth, 3)

    // Decorative Flower Beds (Marigold orange/yellow and Bougainvillea magenta)
    for (let fx = 40; fx < this.stageWidth - 280; fx += 110) {
      // Shrub foliage
      g.fillStyle(0x047857, 1)
      g.fillCircle(fx, groundY - 24, 14)
      g.fillCircle(fx + 16, groundY - 26, 16)
      g.fillCircle(fx + 30, groundY - 22, 12)

      // Blossoms
      const isPink = (fx / 110) % 2 === 0
      g.fillStyle(isPink ? 0xec4899 : 0xfbbf24, 1)
      g.fillCircle(fx - 4, groundY - 28, 3.5)
      g.fillCircle(fx + 8, groundY - 32, 4)
      g.fillCircle(fx + 22, groundY - 30, 3.5)
      g.fillCircle(fx + 14, groundY - 22, 3)
    }

    // 2. Majestic Rain Trees (Samanea saman) along the parkway
    this.drawRainTree(g, 140, groundY, 1.15)
    this.drawRainTree(g, 680, groundY, 1.1)
    this.drawRainTree(g, 1220, groundY, 1.12)
    this.drawRainTree(g, 1760, groundY, 1.15)
    this.drawRainTree(g, 2180, groundY, 1.08)

    // 3. Fiery Gulmohar Trees with sunset red flowers
    this.drawGulmoharTree(g, 440, groundY, 1.08)
    this.drawGulmoharTree(g, 980, groundY, 1.1)
    this.drawGulmoharTree(g, 1500, groundY, 1.05)
    this.drawGulmoharTree(g, 2040, groundY, 1.08)

    // 4. Tall Bamboo Groves with clustered canes and leafy sprays
    this.drawBambooGrove(g, 270, groundY, 1.0)
    this.drawBambooGrove(g, 840, groundY, 1.1)
    this.drawBambooGrove(g, 1370, groundY, 1.05)
    this.drawBambooGrove(g, 1900, groundY, 1.0)

    // 5. Classic Cubbon Park Wooden and Wrought-Iron Benches
    this.drawParkBench(g, 350, groundY)
    this.drawParkBench(g, 760, groundY)
    this.drawParkBench(g, 1100, groundY)
    this.drawParkBench(g, 1620, groundY)
    this.drawParkBench(g, 2120, groundY)

    // 6. Victorian Wrought-Iron Lamp Posts with warm evening glow
    const lampPositions = [180, 520, 900, 1180, 1440, 1700, 1980, 2260, 2520]
    for (const lampX of lampPositions) {
      this.drawVictorianParkLamp(g, lampX, groundY)
    }

    // 7. Historic Queen Victoria Statue Canopy at x = 1040
    this.drawQueenVictoriaCanopy(g, 1040, groundY)

    // 8. Grand Finale Destination: The Historic Cubbon Park Bandstand at x = 2400 (x: 2270 to 2530)
    this.drawBandstandPavilion(g, 2400, groundY)

    // 9. Signage & Landmark Labels
    this.createParkCubbonLabels(groundY)
  }

  /**
   * Draws a lush Bamboo Grove cluster with segmented stems and feathery foliage.
   */
  private drawBambooGrove(g: Phaser.GameObjects.Graphics, x: number, groundY: number, scale = 1.0): void {
    const canes = [
      { dx: -18, h: 110 * scale, thick: 4.5 },
      { dx: -10, h: 125 * scale, thick: 5 },
      { dx: -2, h: 135 * scale, thick: 5.5 },
      { dx: 6, h: 128 * scale, thick: 5 },
      { dx: 14, h: 118 * scale, thick: 4.5 },
      { dx: 22, h: 105 * scale, thick: 4 },
    ]

    for (const cane of canes) {
      const cx = x + cane.dx
      const topY = groundY - cane.h

      // Green bamboo culm (#65a30d)
      g.fillStyle(0x65a30d, 1)
      g.fillRect(cx - cane.thick / 2, topY, cane.thick, cane.h)

      // Bamboo ring nodes every 16px
      g.fillStyle(0x365314, 1)
      for (let ny = topY + 12; ny < groundY - 6; ny += 18) {
        g.fillRect(cx - cane.thick / 2 - 1, ny, cane.thick + 2, 2.5)
      }

      // Sprays of narrow pointed leaves
      g.fillStyle(0x84cc16, 0.9)
      for (let ly = topY; ly < topY + 45; ly += 14) {
        g.fillTriangle(cx, ly, cx - 18, ly - 8, cx - 14, ly + 2)
        g.fillTriangle(cx, ly + 4, cx + 18, ly - 4, cx + 14, ly + 6)
      }
    }
  }

  /**
   * Draws an ornate Victorian cast-iron park lamppost with glowing warm lantern.
   */
  private drawVictorianParkLamp(g: Phaser.GameObjects.Graphics, x: number, groundY: number): void {
    const lampH = 130
    const topY = groundY - lampH

    // Black cast-iron fluted base & post (#0f172a)
    g.fillStyle(0x0f172a, 1)
    g.fillRect(x - 6, groundY - 14, 12, 14)
    g.fillRect(x - 3, topY + 22, 6, lampH - 22)
    // Decorative collars
    g.fillRect(x - 5, groundY - 32, 10, 4)
    g.fillRect(x - 5, topY + 45, 10, 4)

    // Victorian scrollwork bracket arms
    g.lineStyle(2, 0x0f172a, 1)
    g.beginPath()
    g.moveTo(x - 12, topY + 28)
    g.lineTo(x, topY + 16)
    g.lineTo(x + 12, topY + 28)
    g.strokePath()

    // Hexagonal Lantern Casing
    g.fillStyle(0x1e293b, 1)
    g.fillRect(x - 8, topY + 8, 16, 14)
    // Pointed lantern cap
    g.beginPath()
    g.moveTo(x - 10, topY + 8)
    g.lineTo(x + 10, topY + 8)
    g.lineTo(x, topY - 2)
    g.closePath()
    g.fillPath()
    // Finial ball
    g.fillCircle(x, topY - 4, 2.5)

    // Glowing warm amber lantern pane
    g.fillStyle(0xfbbf24, 1)
    g.fillRect(x - 6, topY + 10, 12, 10)
    g.fillStyle(0xfef08a, 0.95)
    g.fillCircle(x, topY + 15, 3.5)

    // Soft warm illumination cone on the ground
    g.fillStyle(0xfef08a, 0.12)
    g.fillTriangle(x, topY + 16, x - 32, groundY, x + 32, groundY)
  }

  /**
   * Draws a classic Victorian wooden garden park bench with green cast-iron ends.
   */
  private drawParkBench(g: Phaser.GameObjects.Graphics, x: number, groundY: number): void {
    const benchW = 56
    const benchH = 34
    const topY = groundY - benchH

    // Dark green ornate cast-iron legs & armrests (#064e3b)
    g.fillStyle(0x064e3b, 1)
    g.fillRect(x - benchW / 2, groundY - 20, 5, 20)
    g.fillRect(x + benchW / 2 - 5, groundY - 20, 5, 20)
    // Curved armrests
    g.fillRect(x - benchW / 2 - 3, topY + 10, 7, 5)
    g.fillRect(x + benchW / 2 - 4, topY + 10, 7, 5)

    // Teak wooden seat and backrest slats (#92400e / #b45309)
    g.fillStyle(0x92400e, 1)
    // Backrest slats
    g.fillRect(x - benchW / 2, topY + 2, benchW, 5)
    g.fillRect(x - benchW / 2, topY + 9, benchW, 5)
    // Seat slats
    g.fillStyle(0xb45309, 1)
    g.fillRect(x - benchW / 2 - 2, groundY - 18, benchW + 4, 4)
    g.fillRect(x - benchW / 2 - 2, groundY - 13, benchW + 4, 4)
  }

  /**
   * Draws Queen Victoria Statue canopy monument.
   */
  private drawQueenVictoriaCanopy(g: Phaser.GameObjects.Graphics, x: number, groundY: number): void {
    const baseW = 70
    const baseH = 95
    const topY = groundY - baseH

    // Stone plinth
    g.fillStyle(0x475569, 1)
    g.fillRect(x - baseW / 2, groundY - 24, baseW, 24)
    g.fillStyle(0x334155, 1)
    g.fillRect(x - baseW / 2 - 4, groundY - 6, baseW + 8, 6)

    // Victorian columns supporting statue canopy
    g.fillStyle(0xf1f5f9, 1)
    g.fillRect(x - 22, topY + 20, 6, 52)
    g.fillRect(x + 16, topY + 20, 6, 52)

    // Bronze statue silhouette
    g.fillStyle(0x78350f, 1)
    g.fillRoundedRect(x - 10, groundY - 58, 20, 34, 4)
    g.fillCircle(x, groundY - 64, 7)
    g.fillStyle(0xf59e0b, 1) // Crown glint
    g.fillRect(x - 5, groundY - 73, 10, 4)

    // Canopy domed roof
    g.fillStyle(0x991b1b, 1)
    g.beginPath()
    g.moveTo(x - 28, topY + 20)
    g.lineTo(x + 28, topY + 20)
    g.lineTo(x, topY)
    g.closePath()
    g.fillPath()
    g.fillStyle(0xf59e0b, 1)
    g.fillCircle(x, topY - 3, 3.5)
  }

  /**
   * Historic Cubbon Park Bandstand - Octagonal Victorian Pavilion (1868)
   */
  private drawBandstandPavilion(g: Phaser.GameObjects.Graphics, centerX: number, groundY: number): void {
    const plinthW = 260
    const plinthH = 32
    const plinthTopY = groundY - plinthH

    // 1. Octagonal Stone Base Plinth (#475569 granite)
    g.fillStyle(0x475569, 1)
    g.fillRect(centerX - plinthW / 2, plinthTopY, plinthW, plinthH)
    g.fillStyle(0x334155, 1)
    g.fillRect(centerX - plinthW / 2 - 6, groundY - 8, plinthW + 12, 8)
    // Cornice band
    g.fillStyle(0x64748b, 1)
    g.fillRect(centerX - plinthW / 2 - 3, plinthTopY - 3, plinthW + 6, 4)

    // Central Stone Steps
    const stepsW = 76
    const stepH = 8
    for (let s = 0; s < 3; s++) {
      g.fillStyle(0x64748b, 1)
      g.fillRect(centerX - (stepsW + s * 10) / 2, groundY - (s + 1) * stepH, stepsW + s * 10, stepH)
      g.lineStyle(1, 0x1e293b, 0.7)
      g.strokeRect(centerX - (stepsW + s * 10) / 2, groundY - (s + 1) * stepH, stepsW + s * 10, stepH)
    }

    // 2. Wrought-Iron Balustrade / Railings
    const railY = plinthTopY - 22
    g.fillStyle(0x0f172a, 1)
    g.fillRect(centerX - plinthW / 2 + 10, railY, plinthW - 20, 3)
    g.lineStyle(1.5, 0x0f172a, 0.85)
    for (let rx = centerX - plinthW / 2 + 15; rx <= centerX + plinthW / 2 - 15; rx += 9) {
      if (Math.abs(rx - centerX) > 36) {
        g.lineBetween(rx, railY, rx, plinthTopY)
      }
    }

    // 3. Classical Victorian Cast-Iron Pillars (6 White Fluted Columns)
    const pillarH = 92
    const columnTopY = plinthTopY - pillarH
    const colPositions = [
      centerX - 110,
      centerX - 66,
      centerX - 24,
      centerX + 24,
      centerX + 66,
      centerX + 110,
    ]

    for (const cx of colPositions) {
      // Column shaft
      g.fillStyle(0xf8fafc, 1)
      g.fillRect(cx - 3.5, columnTopY, 7, pillarH)
      // Base plinth
      g.fillStyle(0xcbd5e1, 1)
      g.fillRect(cx - 5.5, plinthTopY - 6, 11, 6)
      // Ionic capital
      g.fillStyle(0xe2e8f0, 1)
      g.fillRect(cx - 6.5, columnTopY, 13, 6)
      g.fillStyle(0xf59e0b, 1) // Brass capital rosette
      g.fillCircle(cx, columnTopY + 3, 2.5)
    }

    // Victorian decorative wrought-iron spandrel arches between columns
    g.lineStyle(2, 0x0f172a, 0.9)
    for (let i = 0; i < colPositions.length - 1; i++) {
      const c1 = colPositions[i]
      const c2 = colPositions[i + 1]
      const midX = (c1 + c2) / 2
      g.beginPath()
      g.arc(midX, columnTopY + 12, (c2 - c1) / 2, Math.PI, 0, false)
      g.strokePath()
    }

    // 4. Octagonal Terracotta Tiled Roof Canopy (#991b1b)
    const roofBaseY = columnTopY
    const roofApexY = roofBaseY - 48
    g.fillStyle(0x991b1b, 1)
    g.beginPath()
    g.moveTo(centerX - plinthW / 2 - 12, roofBaseY)
    g.lineTo(centerX + plinthW / 2 + 12, roofBaseY)
    g.lineTo(centerX + 60, roofApexY)
    g.lineTo(centerX - 60, roofApexY)
    g.closePath()
    g.fillPath()

    // Upper Cupola Roof Dome
    const cupolaApexY = roofApexY - 24
    g.fillStyle(0xb91c1c, 1)
    g.beginPath()
    g.moveTo(centerX - 62, roofApexY)
    g.lineTo(centerX + 62, roofApexY)
    g.lineTo(centerX, cupolaApexY)
    g.closePath()
    g.fillPath()

    // Decorative White Scalloped Valance / Eaves Trim
    g.fillStyle(0xffffff, 1)
    g.fillRect(centerX - plinthW / 2 - 14, roofBaseY - 2, plinthW + 28, 4)
    for (let vx = centerX - plinthW / 2 - 10; vx <= centerX + plinthW / 2 + 10; vx += 14) {
      g.fillCircle(vx, roofBaseY + 3, 3)
    }

    // Golden Finial Spire at Apex
    g.fillStyle(0xf59e0b, 1)
    g.fillRect(centerX - 2, cupolaApexY - 22, 4, 22)
    g.fillCircle(centerX, cupolaApexY - 22, 4)
    g.fillCircle(centerX, cupolaApexY - 11, 3)

    // Interior Warm Chandelier Glow beneath Pavilion Ceiling
    g.fillStyle(0xfef08a, 0.3)
    g.fillCircle(centerX, columnTopY + 30, 48)
    g.fillStyle(0xfbbf24, 1)
    g.fillCircle(centerX, columnTopY + 16, 5)
  }

  /**
   * Text Signboards for Cubbon Park
   */
  private createParkCubbonLabels(groundY: number): void {
    if (!this.streetSceneryContainer) return
    const addLabel = (x: number, y: number, text: string, color: string, fontSize: string) => {
      const t = this.scene.add
        .text(x, y, text, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize,
          fontStyle: 'bold',
          color,
          align: 'center',
        })
        .setOrigin(0.5, 0.5)
      this.streetSceneryContainer?.add(t)
    }

    addLabel(180, groundY - 110, 'CUBBON PARK BOTANICAL HAVEN\n• ESTD 1870 •', '#86efac', '8.5px')
    addLabel(840, groundY - 95, 'QUEEN VICTORIA PROMENADE\n← ROSE GARDEN • LOTUS POND →', '#fef08a', '8.5px')
    addLabel(1480, groundY - 95, 'BAMBOO GROVE TRAIL\n• JOGGING & CYCLING LANE •', '#86efac', '8.5px')
    addLabel(1980, groundY - 105, 'CENTRAL PARK LAWNS\n• HOT FILTER COFFEE & MASALA PURI →', '#fbbf24', '8.5px')
    addLabel(2400, groundY - 150, 'HISTORIC CUBBON PARK BANDSTAND\n• 1868 HERITAGE PAVILION •', '#fef3c7', '9.5px')
  }

  /**
   * Draws classic Bengaluru stone-base compound wall with stone pillars & iron grills.
   */
  private drawCollegeBoundaryWall(g: Phaser.GameObjects.Graphics, startX: number, endX: number, groundY: number): void {
    const wallH = 68
    const topY = groundY - wallH

    // Stone base course (granite stone, #334155)
    g.fillStyle(0x334155, 1)
    g.fillRect(startX, groundY - 24, endX - startX, 24)
    g.fillStyle(0x1e293b, 1)
    g.fillRect(startX, groundY - 2, endX - startX, 2)

    // Yellow-ochre plastered upper wall panel (#d97706 / #b45309)
    g.fillStyle(0xd97706, 0.9)
    g.fillRect(startX, topY, endX - startX, wallH - 24)

    // Wall coping stones / cap
    g.fillStyle(0x475569, 1)
    g.fillRect(startX - 2, topY - 5, endX - startX + 4, 6)

    // Vertical stone pillars every 80px with decorative pyramid caps
    for (let x = startX + 10; x <= endX; x += 85) {
      // Pillar body
      g.fillStyle(0x334155, 1)
      g.fillRect(x - 7, topY - 10, 14, wallH + 10)
      // Pillar cap
      g.fillStyle(0x64748b, 1)
      g.fillRect(x - 9, topY - 14, 18, 5)
      // Ball / Pyramid finial
      g.fillCircle(x, topY - 17, 4)

      // Iron grill railing inset between pillars
      if (x + 85 <= endX) {
        g.lineStyle(1.5, 0x0f172a, 0.85)
        for (let ix = x + 10; ix < x + 78; ix += 9) {
          g.lineBetween(ix, topY + 4, ix, groundY - 24)
          // Spearhead top
          g.fillStyle(0x0f172a, 1)
          g.fillTriangle(ix - 2, topY + 4, ix + 2, topY + 4, ix, topY)
        }
        g.lineBetween(x + 7, topY + 12, x + 78, topY + 12)
        g.lineBetween(x + 7, groundY - 28, x + 78, groundY - 28)
      }
    }
  }

  /**
   * Draws the Grand College Entrance Gate and Security Cabin.
   */
  private drawCollegeMainEntrance(g: Phaser.GameObjects.Graphics, startX: number, endX: number, groundY: number): void {
    const gateCenterX = (startX + endX) / 2
    const gateW = 280
    const gateLeft = gateCenterX - gateW / 2
    const gateRight = gateCenterX + gateW / 2

    // Background college building facade visible through the gate
    const bldgW = gateW + 60
    const bldgH = 175
    const bldgTop = groundY - bldgH

    // Heritage red-brick college building (#991b1b)
    g.fillStyle(0x991b1b, 1)
    g.fillRect(gateCenterX - bldgW / 2, bldgTop, bldgW, bldgH)

    // White sandstone cornices & quoins
    g.fillStyle(0xfef3c7, 1)
    g.fillRect(gateCenterX - bldgW / 2 - 4, bldgTop - 4, bldgW + 8, 8)
    g.fillRect(gateCenterX - bldgW / 2 - 2, bldgTop + 55, bldgW + 4, 4)

    // Saracenic arched college windows (3 bays)
    for (let wx = gateCenterX - 110; wx <= gateCenterX + 110; wx += 55) {
      // Upper floor arched window
      g.fillStyle(0x1e293b, 1)
      g.fillRect(wx - 14, bldgTop + 18, 28, 32)
      g.fillCircle(wx, bldgTop + 18, 14)
      // Sandstone arch frame
      g.lineStyle(2, 0xfde68a, 1)
      g.strokeCircle(wx, bldgTop + 18, 14)

      // Lower floor arched window
      g.fillStyle(0x1e293b, 1)
      g.fillRect(wx - 14, bldgTop + 72, 28, 36)
      g.fillCircle(wx, bldgTop + 72, 14)
      g.lineStyle(2, 0xfde68a, 1)
      g.strokeCircle(wx, bldgTop + 72, 14)
    }

    // Grand Entrance Archway Pillars (Left & Right)
    const pillarW = 28
    const pillarH = 135
    const pillarTop = groundY - pillarH

    // Left Grand Pillar
    g.fillStyle(0x334155, 1)
    g.fillRect(gateLeft - pillarW, pillarTop, pillarW, pillarH)
    g.fillStyle(0x64748b, 1)
    g.fillRect(gateLeft - pillarW - 4, pillarTop - 8, pillarW + 8, 8)
    g.fillStyle(0xf59e0b, 1) // Brass ornamental sphere
    g.fillCircle(gateLeft - pillarW / 2, pillarTop - 14, 8)

    // Right Grand Pillar
    g.fillStyle(0x334155, 1)
    g.fillRect(gateRight, pillarTop, pillarW, pillarH)
    g.fillStyle(0x64748b, 1)
    g.fillRect(gateRight - 4, pillarTop - 8, pillarW + 8, 8)
    g.fillStyle(0xf59e0b, 1) // Brass ornamental sphere
    g.fillCircle(gateRight + pillarW / 2, pillarTop - 14, 8)

    // Wrought-iron arched gate header connecting pillars
    g.lineStyle(4, 0x0f172a, 1)
    g.beginPath()
    g.arc(gateCenterX, pillarTop + 40, gateW / 2, Math.PI, 0, false)
    g.strokePath()

    // Signboard banner frame across the top of gate
    g.fillStyle(0x0f172a, 0.95)
    g.lineStyle(2, 0xf59e0b, 1)
    g.fillRoundedRect(gateCenterX - 130, pillarTop - 32, 260, 26, 4)
    g.strokeRoundedRect(gateCenterX - 130, pillarTop - 32, 260, 26, 4)

    // Open decorative wrought-iron gates (swung open towards sides)
    // Left open gate leaf
    g.lineStyle(2, 0x0f172a, 0.9)
    for (let gx = gateLeft; gx < gateLeft + 75; gx += 11) {
      g.lineBetween(gx, groundY - 80, gx, groundY)
      g.fillStyle(0xf59e0b, 1)
      g.fillTriangle(gx - 2, groundY - 80, gx + 2, groundY - 80, gx, groundY - 84)
    }
    // Right open gate leaf
    for (let gx = gateRight - 75; gx < gateRight; gx += 11) {
      g.lineBetween(gx, groundY - 80, gx, groundY)
      g.fillStyle(0xf59e0b, 1)
      g.fillTriangle(gx - 2, groundY - 80, gx + 2, groundY - 80, gx, groundY - 84)
    }

    // Security Guard Post / Cabin at gateRight + 35
    const cabinX = gateRight + 35
    const cabinW = 60
    const cabinH = 75
    g.fillStyle(0x065f46, 1) // Green security booth
    g.fillRect(cabinX, groundY - cabinH, cabinW, cabinH)
    g.fillStyle(0x047857, 1)
    g.fillRect(cabinX - 3, groundY - cabinH - 5, cabinW + 6, 6)
    // Glass window
    g.fillStyle(0xbae6fd, 0.8)
    g.fillRect(cabinX + 8, groundY - cabinH + 14, 30, 26)
    g.lineStyle(1.5, 0x0f172a, 1)
    g.strokeRect(cabinX + 8, groundY - cabinH + 14, 30, 26)
  }

  /**
   * Draws "SLV KAAPI & TIFFIN CORNER" - Bangalore Darshini Cafe.
   */
  private drawKaapiTiffinShop(g: Phaser.GameObjects.Graphics, x: number, groundY: number): void {
    const shopW = 160
    const shopH = 105
    const topY = groundY - shopH

    // Shop structure (cream walls #fef3c7)
    g.fillStyle(0xfef3c7, 1)
    g.fillRect(x, topY, shopW, shopH)
    g.lineStyle(1.5, 0x78350f, 0.8)
    g.strokeRect(x, topY, shopW, shopH)

    // Iconic Orange & White Striped Canvas Awning (#ea580c and #ffffff)
    const awningW = shopW + 12
    const awningH = 26
    const awningTop = topY + 22
    const stripes = 8
    const stripeW = awningW / stripes

    for (let i = 0; i < stripes; i++) {
      g.fillStyle(i % 2 === 0 ? 0xea580c : 0xffffff, 1)
      g.fillRect(x - 6 + i * stripeW, awningTop, stripeW, awningH)
    }
    // Awning scallops
    for (let i = 0; i < stripes; i++) {
      g.fillStyle(i % 2 === 0 ? 0xea580c : 0xffffff, 1)
      g.fillCircle(x - 6 + i * stripeW + stripeW / 2, awningTop + awningH, stripeW / 2)
    }

    // Stainless steel counter (#94a3b8)
    g.fillStyle(0x94a3b8, 1)
    g.fillRect(x + 10, groundY - 32, shopW - 20, 32)
    g.fillStyle(0x64748b, 1)
    g.fillRect(x + 8, groundY - 34, shopW - 16, 4)

    // Filter Coffee Brass / Steel Brewer cylinders on counter
    g.fillStyle(0xf59e0b, 1) // Brass Dabara / Brewer
    g.fillRect(x + 22, groundY - 48, 12, 14)
    g.fillCircle(x + 28, groundY - 48, 6)

    // Glass display case for snacks (Vada, Bonda, Samosa)
    g.fillStyle(0x38bdf8, 0.35)
    g.fillRect(x + 60, groundY - 46, 55, 12)
    g.lineStyle(1, 0x0284c7, 0.8)
    g.strokeRect(x + 60, groundY - 46, 55, 12)

    // Signboard background
    g.fillStyle(0x7c2d12, 1) // Deep warm brown
    g.lineStyle(1.5, 0xf59e0b, 1)
    g.fillRoundedRect(x + 4, topY + 2, shopW - 8, 18, 3)
    g.strokeRoundedRect(x + 4, topY + 2, shopW - 8, 18, 3)
  }

  /**
   * Draws "CAMPUS XEROX & STATIONERY" Storefront.
   */
  private drawStationeryShop(g: Phaser.GameObjects.Graphics, x: number, groundY: number): void {
    const shopW = 150
    const shopH = 100
    const topY = groundY - shopH

    // Light teal building wall (#ccfbf1)
    g.fillStyle(0xccfbf1, 1)
    g.fillRect(x, topY, shopW, shopH)
    g.lineStyle(1.5, 0x0f766e, 0.8)
    g.strokeRect(x, topY, shopW, shopH)

    // Deep Blue & White Awning
    const awningW = shopW + 10
    const awningH = 24
    const awningTop = topY + 20
    const stripes = 8
    const stripeW = awningW / stripes

    for (let i = 0; i < stripes; i++) {
      g.fillStyle(i % 2 === 0 ? 0x1d4ed8 : 0xffffff, 1)
      g.fillRect(x - 5 + i * stripeW, awningTop, stripeW, awningH)
    }

    // Glass shop window with stationery stacks & notice board
    g.fillStyle(0x38bdf8, 0.3)
    g.fillRect(x + 12, groundY - 42, shopW - 24, 38)
    g.lineStyle(1.5, 0x0284c7, 0.9)
    g.strokeRect(x + 12, groundY - 42, shopW - 24, 38)

    // Colorful book spines / binding stacks visible in window
    const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b]
    for (let b = 0; b < 6; b++) {
      g.fillStyle(bookColors[b % 4], 0.9)
      g.fillRect(x + 18 + b * 18, groundY - 24, 12, 22)
    }

    // Signboard background
    g.fillStyle(0x1e3a8a, 1) // Deep blue sign
    g.lineStyle(1.5, 0xfef08a, 1)
    g.fillRoundedRect(x + 4, topY + 2, shopW - 8, 16, 3)
    g.strokeRoundedRect(x + 4, topY + 2, shopW - 8, 16, 3)
  }

  /**
   * Draws a lush Gulmohar Tree with flaming vermillion-orange blossoms.
   */
  private drawGulmoharTree(g: Phaser.GameObjects.Graphics, x: number, groundY: number, scale: number): void {
    const trunkW = 18 * scale
    const trunkH = 130 * scale
    const topY = groundY - trunkH

    // Gnarled, textured trunk (#3f2f22)
    g.fillStyle(0x3f2f22, 1)
    g.fillRect(x - trunkW / 2, topY + 30, trunkW, trunkH - 30)

    // Sprawling umbrella branches
    g.lineStyle(6 * scale, 0x3f2f22, 1)
    g.lineBetween(x, topY + 50, x - 55 * scale, topY + 15)
    g.lineBetween(x, topY + 45, x + 58 * scale, topY + 12)
    g.lineBetween(x, topY + 35, x - 15 * scale, topY - 10)
    g.lineBetween(x, topY + 35, x + 25 * scale, topY - 8)

    // Lush feathered green foliage canopy
    g.fillStyle(0x15803d, 0.9) // Emerald-700
    g.fillCircle(x - 55 * scale, topY + 10, 42 * scale)
    g.fillCircle(x + 55 * scale, topY + 8, 44 * scale)
    g.fillCircle(x, topY - 12, 48 * scale)
    g.fillCircle(x - 25 * scale, topY - 5, 38 * scale)
    g.fillCircle(x + 28 * scale, topY - 2, 40 * scale)

    // Radiant Vermillion / Orange-Red Gulmohar Blossom Clusters (#ea580c & #f97316)
    g.fillStyle(0xea580c, 0.95)
    g.fillCircle(x - 48 * scale, topY + 4, 18 * scale)
    g.fillCircle(x + 44 * scale, topY + 2, 20 * scale)
    g.fillCircle(x - 8 * scale, topY - 18, 22 * scale)
    g.fillCircle(x + 18 * scale, topY - 14, 19 * scale)

    g.fillStyle(0xf97316, 0.9)
    g.fillCircle(x - 44 * scale, topY + 8, 12 * scale)
    g.fillCircle(x + 48 * scale, topY + 6, 13 * scale)
    g.fillCircle(x - 4 * scale, topY - 14, 15 * scale)
  }

  /**
   * Draws a broad spreading Rain Tree (Samanea saman) with deep green layered canopy.
   */
  private drawRainTree(g: Phaser.GameObjects.Graphics, x: number, groundY: number, scale: number): void {
    const trunkW = 20 * scale
    const trunkH = 120 * scale
    const topY = groundY - trunkH

    // Massive textured trunk
    g.fillStyle(0x27272a, 1)
    g.fillRect(x - trunkW / 2, topY + 25, trunkW, trunkH - 25)

    // Giant dome-shaped canopy
    g.fillStyle(0x166534, 0.85) // Dark green
    g.fillCircle(x - 50 * scale, topY + 10, 52 * scale)
    g.fillCircle(x + 52 * scale, topY + 8, 54 * scale)
    g.fillCircle(x, topY - 16, 62 * scale)

    // Top highlights
    g.fillStyle(0x22c55e, 0.7) // Light green highlights
    g.fillCircle(x - 25 * scale, topY - 10, 32 * scale)
    g.fillCircle(x + 28 * scale, topY - 12, 34 * scale)
    g.fillCircle(x, topY - 24, 38 * scale)
  }

  /**
   * Draws classic Indian tapered octagonal street lamppost with curved arm.
   */
  private drawStreetLamp(g: Phaser.GameObjects.Graphics, x: number, groundY: number): void {
    const lampH = 125
    const topY = groundY - lampH

    // Post body (#334155)
    g.fillStyle(0x334155, 1)
    g.fillRect(x - 3, topY + 15, 6, lampH - 15)
    // Flanged base
    g.fillRect(x - 7, groundY - 8, 14, 8)

    // Curved upper arm
    g.lineStyle(3, 0x334155, 1)
    g.beginPath()
    g.moveTo(x, topY + 15)
    g.lineTo(x, topY)
    g.lineTo(x + 22, topY)
    g.strokePath()

    // Sodium vapor luminaire head (#fef08a glow)
    g.fillStyle(0x475569, 1)
    g.fillRect(x + 14, topY - 2, 16, 6)
    // Warm yellow light bulb & soft ground beam
    g.fillStyle(0xfef08a, 1)
    g.fillCircle(x + 22, topY + 6, 4)
    g.fillStyle(0xfef08a, 0.12)
    g.fillTriangle(x + 22, topY + 6, x - 10, groundY, x + 54, groundY)
  }

  /**
   * Draws a BESCOM electrical transformer / distribution box with warning hazard stripes.
   */
  private drawBescomBox(g: Phaser.GameObjects.Graphics, x: number, groundY: number): void {
    const boxW = 28
    const boxH = 42
    const topY = groundY - boxH

    // Box body (BESCOM Yellow #eab308)
    g.fillStyle(0xeab308, 1)
    g.fillRect(x, topY, boxW, boxH)
    g.lineStyle(1.5, 0x713f12, 1)
    g.strokeRect(x, topY, boxW, boxH)

    // Hazard warning stripes (#000000)
    g.fillStyle(0x0f172a, 1)
    g.fillRect(x + 4, topY + 10, boxW - 8, 4)
    g.fillRect(x + 4, topY + 18, boxW - 8, 4)
    // Red danger triangle symbol
    g.fillStyle(0xef4444, 1)
    g.fillTriangle(x + boxW / 2 - 4, topY + 34, x + boxW / 2 + 4, topY + 34, x + boxW / 2, topY + 26)
  }

  /**
   * Draws an official Bengaluru green direction signboard on pole.
   */
  private drawStreetSignboard(g: Phaser.GameObjects.Graphics, x: number, groundY: number): void {
    const poleH = 95
    const topY = groundY - poleH

    // Metal pole
    g.fillStyle(0x475569, 1)
    g.fillRect(x - 2, topY, 4, poleH)

    // Green campus direction board (#065f46 with white border)
    g.fillStyle(0x065f46, 0.95)
    g.lineStyle(1.5, 0xffffff, 1)
    g.fillRoundedRect(x - 38, topY + 8, 76, 28, 3)
    g.strokeRoundedRect(x - 38, topY + 8, 76, 28, 3)
  }

  /**
   * Creates clean text signage for storefronts and the college gate.
   */
  private createShopAndGateLabels(): void {
    if (!this.streetSceneryContainer) return

    // 1. College Gate Arch Header
    const gateCenterX = (520 + 1160) / 2
    const gateText = this.scene.add
      .text(gateCenterX, this.groundY - 148, 'BENGALURU CITY COLLEGE • ESTD 1948', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#fbbf24', // amber-400
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.streetSceneryContainer.add(gateText)

    // 2. "SLV KAAPI & TIFFIN CORNER" Sign
    const kaapiText = this.scene.add
      .text(360, this.groundY - 94, 'SLV KAAPI & TIFFIN • FILTER COFFEE', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '8px',
        fontStyle: 'bold',
        color: '#fef3c7',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.streetSceneryContainer.add(kaapiText)

    // 3. "CAMPUS XEROX & STATIONERY" Sign
    const xeroxText = this.scene.add
      .text(1355, this.groundY - 90, 'CAMPUS XEROX • SPIRAL BINDING', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '7.5px',
        fontStyle: 'bold',
        color: '#fef08a',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.streetSceneryContainer.add(xeroxText)

    // 4. Direction Signboard Text
    const signText = this.scene.add
      .text(1180, this.groundY - 73, '← DEPT BLOCKS\nCANTEEN →', {
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: '6.5px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.streetSceneryContainer.add(signText)
  }

  /**
   * Layer 5: Paved Sidewalk with iconic Yellow & Black Curb stones, and asphalt road.
   */
  private createRoadAndSidewalk(): void {
    this.roadGraphics = this.scene.add.graphics()
    this.roadGraphics.setScrollFactor(1.0, 1.0)
    this.roadGraphics.setDepth(-10)

    this.drawRoadAndSidewalkGraphics()
  }

  private drawRoadAndSidewalkGraphics(): void {
    if (!this.roadGraphics) return
    const g = this.roadGraphics
    g.clear()

    const totalWidth = this.stageWidth
    const groundY = this.groundY
    const roadDepth = this.viewportHeight - groundY + 40

    if (this.theme === 'park-cubbon') {
      // 1. Red earthen park jogging trail (y: groundY to groundY + 18)
      g.fillStyle(0x9a3412, 1) // Rich Terracotta red-earth trail
      g.fillRect(0, groundY, totalWidth, 18)

      // Trail surface texture & sandy flecks
      g.fillStyle(0xb45309, 0.8)
      for (let x = 12; x < totalWidth; x += 32) {
        g.fillRect(x, groundY + 4, 14, 2)
        g.fillRect(x + 16, groundY + 11, 8, 2)
      }

      // 2. Weathered Stone Curb & Grass Lawn Border (y: groundY + 18 to groundY + 24)
      g.fillStyle(0x475569, 1) // Slate curb stones
      g.fillRect(0, groundY + 18, totalWidth, 6)
      g.fillStyle(0x64748b, 0.8)
      for (let x = 0; x < totalWidth; x += 36) {
        g.lineBetween(x, groundY + 18, x, groundY + 24)
      }

      // 3. Lower Earthen Running Pathway (y: groundY + 24 to bottom)
      g.fillStyle(0x78350f, 1) // Deep earth/clay path
      g.fillRect(0, groundY + 24, totalWidth, roadDepth)

      // Lush grass border fringe along the bottom edge
      g.fillStyle(0x065f46, 0.9)
      for (let x = 0; x < totalWidth; x += 18) {
        g.fillTriangle(x, groundY + 24, x + 18, groundY + 24, x + 9, groundY + 20)
      }
      return
    }

    // 1. Sidewalk Footpath Pavement (y: groundY to groundY + 16)
    // TenderSURE style checkered terracotta paver tiles
    g.fillStyle(0x9a3412, 1) // Terracotta brick red
    g.fillRect(0, groundY, totalWidth, 16)

    // Subtle paver tile grid lines
    g.lineStyle(1, 0x7c2d12, 0.7)
    for (let x = 0; x < totalWidth; x += 18) {
      g.lineBetween(x, groundY, x, groundY + 16)
    }

    // 2. The Iconic Indian Yellow and Black Alternating Curb Stones (y: groundY + 16 to groundY + 22)
    const curbH = 6
    const curbBlockW = 28
    const curbTopY = groundY + 16

    for (let x = 0; x < totalWidth; x += curbBlockW) {
      const isYellow = Math.floor(x / curbBlockW) % 2 === 0
      g.fillStyle(isYellow ? 0xeab308 : 0x0f172a, 1)
      g.fillRect(x, curbTopY, curbBlockW, curbH)
    }
    // Curb top highlight edge
    g.fillStyle(0xfef08a, 0.5)
    g.fillRect(0, curbTopY, totalWidth, 1.5)

    // 3. Asphalt Roadway (y: groundY + 22 to bottom of stage)
    const asphaltTopY = groundY + 22
    g.fillStyle(0x1e293b, 1) // Charcoal asphalt
    g.fillRect(0, asphaltTopY, totalWidth, roadDepth)

    // Subtle road texture and white dashed lane line
    g.fillStyle(0x334155, 1)
    g.fillRect(0, asphaltTopY + 2, totalWidth, 2)

    // White dashed road marking along the middle of the road
    const dashY = asphaltTopY + 18
    g.fillStyle(0xf8fafc, 0.85)
    for (let x = 20; x < totalWidth; x += 60) {
      g.fillRect(x, dashY, 32, 3)
    }

    // Occasional road drain grating / manhole cover
    for (let x = 320; x < totalWidth; x += 550) {
      g.fillStyle(0x0f172a, 0.9)
      g.fillRoundedRect(x, asphaltTopY + 4, 22, 10, 2)
      g.lineStyle(1, 0x475569, 1)
      for (let sl = x + 3; sl < x + 20; sl += 4) {
        g.lineBetween(sl, asphaltTopY + 5, sl, asphaltTopY + 13)
      }
    }
  }

  /**
   * Layer 6: Subtle Foreground Accents (World space).
   */
  private createForegroundAccents(): void {
    this.foregroundAccents = this.scene.add.graphics()
    this.foregroundAccents.setScrollFactor(1.0, 1.0)
    this.foregroundAccents.setDepth(10)

    // Milestone stone marker (Bengaluru 0 KM)
    const g = this.foregroundAccents
    g.clear()

    const milestoneX = 220
    const mY = this.groundY + 10
    // Curved milestone top (Indian yellow top / white base)
    g.fillStyle(0xeab308, 1) // Yellow top
    g.fillCircle(milestoneX, mY - 6, 8)
    g.fillRect(milestoneX - 8, mY - 6, 16, 6)
    g.fillStyle(0xffffff, 1) // White body
    g.fillRect(milestoneX - 8, mY, 16, 12)
    g.lineStyle(1, 0x0f172a, 0.8)
    g.strokeRect(milestoneX - 8, mY, 16, 12)
  }

  /**
   * Per-frame update method called from BootScene.update().
   * Updates procedural cloud drift across the sky.
   */
  public update(): void {
    // Gently drift clouds
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed
      if (cloud.x > this.viewportWidth + 80) {
        cloud.x = -80
      }
      cloud.sprite.setX(cloud.x)
    }
  }

  /**
   * Handles responsive viewport resizing and optional theme update.
   */
  public resize(
    viewportWidth: number,
    viewportHeight: number,
    stageWidth: number,
    groundY: number,
    theme?: EnvironmentTheme
  ): void {
    this.viewportWidth = viewportWidth
    this.viewportHeight = viewportHeight
    this.stageWidth = stageWidth
    this.groundY = groundY
    if (theme) {
      this.theme = theme
    }

    // Redraw sky gradient for new viewport dimensions
    this.drawSkyGradient()

    // Redraw skyline graphics
    this.drawFarSkyline()
    this.drawMidSkyline()

    // Redraw road & sidewalk
    this.drawRoadAndSidewalkGraphics()

    // Rebuild street level scenery with updated theme
    this.rebuildStreetLevelScenery()
  }


  /**
   * Cleanup method to free resources on scene teardown.
   */
  public destroy(): void {
    if (this.skyGraphics) {
      this.skyGraphics.destroy()
      this.skyGraphics = undefined
    }

    if (this.cloudContainer) {
      this.cloudContainer.destroy()
      this.cloudContainer = undefined
    }

    if (this.farSkylineGraphics) {
      this.farSkylineGraphics.destroy()
      this.farSkylineGraphics = undefined
    }

    if (this.midSkylineGraphics) {
      this.midSkylineGraphics.destroy()
      this.midSkylineGraphics = undefined
    }

    if (this.streetSceneryContainer) {
      this.streetSceneryContainer.destroy()
      this.streetSceneryContainer = undefined
    }

    if (this.roadGraphics) {
      this.roadGraphics.destroy()
      this.roadGraphics = undefined
    }

    if (this.foregroundAccents) {
      this.foregroundAccents.destroy()
      this.foregroundAccents = undefined
    }

    this.clouds = []
  }
}
