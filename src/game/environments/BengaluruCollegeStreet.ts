import Phaser from 'phaser'

export interface BengaluruCollegeStreetConfig {
  readonly scene: Phaser.Scene
  readonly stageWidth: number
  readonly viewportWidth: number
  readonly viewportHeight: number
  readonly groundY: number
}

/**
 * BengaluruCollegeStreet - Original Bengaluru-inspired anime college street environment.
 *
 * Implements a layered parallax environment featuring:
 * 1. Warm daylight sky with subtle drifting clouds (ScrollFactor 0).
 * 2. Distant Bengaluru skyline with Vidhana Soudha dome & tech towers (ScrollFactor 0.15).
 * 3. Midground campus rooflines, clock tower & rain tree silhouettes (ScrollFactor 0.35).
 * 4. Interactive street scenery in world space:
 *    - College boundary stone wall with wrought-iron railings.
 *    - The Grand College Entrance Gate ("BENGALURU CITY COLLEGE").
 *    - Heritage red-brick college building facade with Saracenic arches.
 *    - "SLV KAAPI & TIFFIN CORNER" (authentic Bangalore Darshini with awning).
 *    - "CAMPUS XEROX & STATIONERY" storefront.
 *    - Vibrant blossoming Gulmohar trees & broad Rain trees.
 *    - Classic Indian sodium-vapor streetlights & yellow BESCOM distribution boxes.
 * 5. Paved sidewalk with yellow-and-black curb stones and asphalt road (ScrollFactor 1.0).
 */
export class BengaluruCollegeStreet {
  private scene: Phaser.Scene
  private stageWidth: number
  private viewportWidth: number
  private viewportHeight: number
  private groundY: number

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

    // Multi-stop anime morning sky gradient
    // Top: Crisp cerulean blue (#38bdf8 / #60a5fa)
    // Mid: Soft azure (#93c5fd / #bae6fd)
    // Low: Warm daylight amber-gold glow near horizon (#fed7aa / #fef08a)
    const bands = 24
    const bandHeight = Math.ceil(h / bands)

    for (let i = 0; i < bands; i++) {
      const ratio = i / bands
      let r = 0x38
      let g = 0xbd
      let b = 0xf8

      if (ratio < 0.45) {
        // Upper atmosphere
        const t = ratio / 0.45
        r = Math.round(0x25 * (1 - t) + 0x60 * t)
        g = Math.round(0x63 * (1 - t) + 0xa5 * t)
        b = Math.round(0xeb * (1 - t) + 0xfa * t)
      } else if (ratio < 0.8) {
        // Mid sky to light blue
        const t = (ratio - 0.45) / 0.35
        r = Math.round(0x60 * (1 - t) + 0x93 * t)
        g = Math.round(0xa5 * (1 - t) + 0xc5 * t)
        b = Math.round(0xfa * (1 - t) + 0xfd * t)
      } else {
        // Horizon warm gold glow
        const t = (ratio - 0.8) / 0.2
        r = Math.round(0x93 * (1 - t) + 0xfe * t)
        g = Math.round(0xc5 * (1 - t) + 0xd7 * t)
        b = Math.round(0xfd * (1 - t) + 0xaa * t)
      }

      const color = (r << 16) | (g << 8) | b
      this.skyGraphics.fillStyle(color, 1)
      this.skyGraphics.fillRect(0, i * bandHeight, w, bandHeight + 1)
    }

    // Distant morning sun disc
    this.skyGraphics.fillStyle(0xfffbeb, 0.45)
    this.skyGraphics.fillCircle(w * 0.72, h * 0.24, 46)
    this.skyGraphics.fillStyle(0xffedd5, 0.75)
    this.skyGraphics.fillCircle(w * 0.72, h * 0.24, 30)
    this.skyGraphics.fillStyle(0xffffff, 0.95)
    this.skyGraphics.fillCircle(w * 0.72, h * 0.24, 18)
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
   * Spans the full stageWidth (2400px) so Dennis can run past all street landmarks.
   */
  private createStreetLevelScenery(): void {
    this.streetSceneryContainer = this.scene.add.container(0, 0)
    this.streetSceneryContainer.setScrollFactor(1.0, 1.0)
    this.streetSceneryContainer.setDepth(-20)

    const g = this.scene.add.graphics()
    this.streetSceneryContainer.add(g)

    const groundY = this.groundY

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
   * Handles responsive viewport resizing.
   */
  public resize(viewportWidth: number, viewportHeight: number, stageWidth: number, groundY: number): void {
    this.viewportWidth = viewportWidth
    this.viewportHeight = viewportHeight
    this.stageWidth = stageWidth
    this.groundY = groundY

    // Redraw sky gradient for new viewport dimensions
    this.drawSkyGradient()

    // Redraw skyline graphics
    this.drawFarSkyline()
    this.drawMidSkyline()

    // Redraw road & sidewalk
    this.drawRoadAndSidewalkGraphics()
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
