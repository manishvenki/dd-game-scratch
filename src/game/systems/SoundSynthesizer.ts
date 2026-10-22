/**
 * SoundSynthesizer - Web Audio Procedural Music & SFX Engine for DD Game Scratch.
 *
 * Provides:
 * 1. Dedicated procedural background music streams:
 *    - 'main-menu': Relaxed, warm, playful acoustic marimba & chimes (Thatha Tea mood).
 *    - 'level-select': Energetic, driving synth arpeggios & bass (adventurous chase preparation).
 *    - 'character-select': Bouncy, comedic, short-loop melody & staccato bass.
 *    - 'victory': Grand, celebratory fanfare for Grand Victory screen.
 *    - 'game-over': Comic, wobbly descending defeat theme.
 * 2. Dedicated interactive sound effects (SFX):
 *    - UI: click, confirm, cancel, pause, resume, slider
 *    - Gameplay: jump, land, attack, hit, defeat, dialogue, unlock, tension, level-start, stage-complete
 *
 * Fully synthesized live in code with 0 external network requests, zero file dependencies,
 * and 0 latency. Leaves DD Game BGM.mp3 completely untouched and preserved.
 */

export type ProceduralMusicTrack =
  | 'main-menu'
  | 'level-select'
  | 'character-select'
  | 'victory'
  | 'game-over'
  | 'none'

export type SfxType =
  | 'click'
  | 'confirm'
  | 'cancel'
  | 'pause'
  | 'resume'
  | 'jump'
  | 'land'
  | 'attack'
  | 'hit'
  | 'defeat'
  | 'dialogue'
  | 'unlock'
  | 'tension'
  | 'level-start'
  | 'stage-complete'
  | 'game-over'

// Standard Equal Temperament Note Frequencies (Hz)
const NOTE = {
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  Bb2: 116.54,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  Gb3: 185.0,
  G3: 196.0,
  Ab3: 207.65,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Gb4: 369.99,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
}

export class SoundSynthesizer {
  private ctx: AudioContext | null = null
  private musicGainNode: GainNode | null = null
  private sfxGainNode: GainNode | null = null

  // Active music playback state
  private activeTrack: ProceduralMusicTrack = 'none'
  private loopIntervalId: number | null = null
  private nextBarTime = 0
  private stepIndex = 0

  // SFX rate-limiting
  private lastSfxTimes: Map<SfxType, number> = new Map()

  constructor() {
    // Lazily initialized on first user interaction
  }

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()

        // Create Master Music Bus
        this.musicGainNode = this.ctx.createGain()
        this.musicGainNode.gain.setValueAtTime(1.0, this.ctx.currentTime)
        this.musicGainNode.connect(this.ctx.destination)

        // Create Master SFX Bus
        this.sfxGainNode = this.ctx.createGain()
        this.sfxGainNode.gain.setValueAtTime(1.0, this.ctx.currentTime)
        this.sfxGainNode.connect(this.ctx.destination)
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {})
    }

    return this.ctx
  }

  public setMusicMasterGain(volume: number, muted: boolean): void {
    const ctx = this.getContext()
    if (!ctx || !this.musicGainNode) return
    const targetGain = muted ? 0 : Math.max(0, Math.min(1, volume))
    this.musicGainNode.gain.cancelScheduledValues(ctx.currentTime)
    this.musicGainNode.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.05)
  }

  public setSfxMasterGain(volume: number, muted: boolean): void {
    const ctx = this.getContext()
    if (!ctx || !this.sfxGainNode) return
    const targetGain = muted ? 0 : Math.max(0, Math.min(1, volume))
    this.sfxGainNode.gain.cancelScheduledValues(ctx.currentTime)
    this.sfxGainNode.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.05)
  }

  // ==========================================
  // PROCEDURAL MUSIC PLAYBACK
  // ==========================================

  public startMusic(track: ProceduralMusicTrack): void {
    if (this.activeTrack === track) return
    this.stopMusic()

    if (track === 'none') {
      this.activeTrack = 'none'
      return
    }

    const ctx = this.getContext()
    if (!ctx) return

    this.activeTrack = track
    this.stepIndex = 0
    this.nextBarTime = ctx.currentTime + 0.05

    // Run music scheduler loop
    this.scheduleMusicPattern()
    this.loopIntervalId = window.setInterval(() => {
      this.scheduleMusicPattern()
    }, 150)
  }

  public stopMusic(): void {
    if (this.loopIntervalId !== null) {
      window.clearInterval(this.loopIntervalId)
      this.loopIntervalId = null
    }
    this.activeTrack = 'none'
  }

  public getActiveTrack(): ProceduralMusicTrack {
    return this.activeTrack
  }

  private scheduleMusicPattern(): void {
    const ctx = this.getContext()
    if (!ctx || !this.musicGainNode || this.activeTrack === 'none') return

    const lookAhead = 0.4 // Schedule 400ms ahead

    while (this.nextBarTime < ctx.currentTime + lookAhead) {
      switch (this.activeTrack) {
        case 'main-menu':
          this.scheduleMainMenuBeat(ctx, this.nextBarTime, this.stepIndex)
          this.nextBarTime += 0.32 // ~94 BPM step
          this.stepIndex = (this.stepIndex + 1) % 16
          break

        case 'level-select':
          this.scheduleLevelSelectBeat(ctx, this.nextBarTime, this.stepIndex)
          this.nextBarTime += 0.24 // ~125 BPM step
          this.stepIndex = (this.stepIndex + 1) % 16
          break

        case 'character-select':
          this.scheduleCharacterSelectBeat(ctx, this.nextBarTime, this.stepIndex)
          this.nextBarTime += 0.27 // ~111 BPM step
          this.stepIndex = (this.stepIndex + 1) % 16
          break

        case 'victory':
          this.scheduleVictoryFanfare(ctx, this.nextBarTime, this.stepIndex)
          this.nextBarTime += 0.45
          this.stepIndex++
          if (this.stepIndex >= 14) {
            // Victory plays through once then pauses/soft-loops
            this.stepIndex = 0
            this.nextBarTime += 1.5
          }
          break

        case 'game-over':
          this.scheduleGameOverTheme(ctx, this.nextBarTime, this.stepIndex)
          this.nextBarTime += 0.48
          this.stepIndex++
          if (this.stepIndex >= 8) {
            this.stopMusic()
          }
          break

        default:
          break
      }
    }
  }

  /**
   * Main Menu (Thatha Tea): Warm, relaxing, playful acoustic chords with gentle bell notes.
   */
  private scheduleMainMenuBeat(ctx: AudioContext, time: number, step: number): void {
    // 4-chord progression: Cmaj7 (0-3), Am7 (4-7), Fmaj7 (8-11), G7 (12-15)
    const chordIdx = Math.floor(step / 4)
    const chordBasses = [NOTE.C2, NOTE.A2, NOTE.F2, NOTE.G2]
    const chordMids = [
      [NOTE.E3, NOTE.G3, NOTE.B3],
      [NOTE.C3, NOTE.E3, NOTE.G3],
      [NOTE.C3, NOTE.E3, NOTE.A3],
      [NOTE.D3, NOTE.F3, NOTE.B3],
    ]
    const melodies = [
      [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.B4],
      [NOTE.C5, NOTE.B4, NOTE.G4, NOTE.E4],
      [NOTE.A4, NOTE.C5, NOTE.E5, NOTE.G4],
      [NOTE.F4, NOTE.G4, NOTE.B4, NOTE.D5],
    ]

    // Bass on step 0 of each bar
    if (step % 4 === 0) {
      this.playSynthTone(ctx, chordBasses[chordIdx], time, 0.45, 'triangle', 0.16)
    }

    // Gentle mid chord pulse
    if (step % 2 === 0) {
      chordMids[chordIdx].forEach((freq) => {
        this.playSynthTone(ctx, freq, time, 0.28, 'sine', 0.05)
      })
    }

    // Melodic chime on top
    const melNote = melodies[chordIdx][step % 4]
    this.playSynthTone(ctx, melNote, time, 0.22, 'sine', 0.08)
  }

  /**
   * Level Selection: Driving, adventurous, energetic synth arpeggios.
   */
  private scheduleLevelSelectBeat(ctx: AudioContext, time: number, step: number): void {
    // Progression: Dm (0-3), F (4-7), G (8-11), Bb (12-15)
    const chordIdx = Math.floor(step / 4)
    const roots = [NOTE.D2, NOTE.F2, NOTE.G2, NOTE.Bb2]
    const arps = [
      [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D4],
      [NOTE.F3, NOTE.A3, NOTE.C4, NOTE.F4],
      [NOTE.G3, NOTE.B3, NOTE.D4, NOTE.G4],
      [NOTE.Bb3, NOTE.D4, NOTE.F4, NOTE.Bb4],
    ]

    // Driving pulse bass
    this.playSynthTone(ctx, roots[chordIdx], time, 0.2, 'sawtooth', 0.12, 450)

    // Rapid 16th-note synth lead
    const note = arps[chordIdx][step % 4]
    this.playSynthTone(ctx, note, time, 0.16, 'square', 0.07, 1200)
  }

  /**
   * Character Selection: Comedic, bouncy, short-loop melody with staccato bass.
   */
  private scheduleCharacterSelectBeat(ctx: AudioContext, time: number, step: number): void {
    // Progression: C (0-3), F (4-7), G (8-11), C (12-15)
    const chordIdx = Math.floor(step / 4)
    const bass = [NOTE.C3, NOTE.F2, NOTE.G2, NOTE.C3][chordIdx]
    const leads = [
      [NOTE.E4, NOTE.G4, NOTE.C5, NOTE.G4],
      [NOTE.A4, NOTE.C5, NOTE.F4, NOTE.A4],
      [NOTE.B4, NOTE.D5, NOTE.G4, NOTE.B4],
      [NOTE.C5, NOTE.E5, NOTE.G4, NOTE.C5],
    ]

    // Staccato bouncy bass
    if (step % 2 === 0) {
      this.playSynthTone(ctx, bass, time, 0.12, 'triangle', 0.18)
    }

    // Playful melody
    const leadNote = leads[chordIdx][step % 4]
    this.playSynthTone(ctx, leadNote, time, 0.18, 'sine', 0.09)
  }

  /**
   * Grand Victory Fanfare (Celebratory Cubbon Park finale payoff).
   */
  private scheduleVictoryFanfare(ctx: AudioContext, time: number, step: number): void {
    const fanfareNotes = [
      NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5, // Rising fanfare
      NOTE.E5, NOTE.G5, NOTE.C6,          // High celebration
      NOTE.G5, NOTE.C6, NOTE.E5, NOTE.C5, // Sparkling chords
    ]

    if (step < fanfareNotes.length) {
      const note = fanfareNotes[step]
      this.playSynthTone(ctx, note, time, 0.4, 'triangle', 0.22)
      this.playSynthTone(ctx, note * 0.5, time, 0.4, 'sawtooth', 0.15, 600)
    }
  }

  /**
   * Comic Game Over Theme (Sad trombone descending slide).
   */
  private scheduleGameOverTheme(ctx: AudioContext, time: number, step: number): void {
    const sadNotes = [NOTE.Gb3, NOTE.F3, NOTE.E3, NOTE.Eb3, NOTE.D3, NOTE.C3]
    if (step < sadNotes.length) {
      this.playSynthTone(ctx, sadNotes[step], time, 0.42, 'sawtooth', 0.18, 400)
    }
  }

  // ==========================================
  // SHORT INTERACTIVE SOUND EFFECTS (SFX)
  // ==========================================

  public playSfx(type: SfxType): void {
    const ctx = this.getContext()
    if (!ctx || !this.sfxGainNode) return

    const now = ctx.currentTime
    const lastTime = this.lastSfxTimes.get(type) ?? 0

    // Rate-limiting / Debounce to avoid sound clutter
    const minInterval: Partial<Record<SfxType, number>> = {
      click: 0.06,
      jump: 0.15,
      land: 0.2,
      attack: 0.12,
      hit: 0.08,
      defeat: 0.15,
      dialogue: 0.05,
      tension: 5.0, // Minimum 5s cooldown between chase tension stings
    }

    const interval = minInterval[type] ?? 0.05
    if (now - lastTime < interval) {
      return
    }
    this.lastSfxTimes.set(type, now)

    switch (type) {
      case 'click':
        this.synthClick(ctx, now)
        break
      case 'confirm':
        this.synthConfirm(ctx, now)
        break
      case 'cancel':
        this.synthCancel(ctx, now)
        break
      case 'pause':
        this.synthPause(ctx, now)
        break
      case 'resume':
        this.synthResume(ctx, now)
        break
      case 'jump':
        this.synthJump(ctx, now)
        break
      case 'land':
        this.synthLand(ctx, now)
        break
      case 'attack':
        this.synthAttack(ctx, now)
        break
      case 'hit':
        this.synthHit(ctx, now)
        break
      case 'defeat':
        this.synthDefeat(ctx, now)
        break
      case 'dialogue':
        this.synthDialogue(ctx, now)
        break
      case 'unlock':
        this.synthUnlock(ctx, now)
        break
      case 'tension':
        this.synthTension(ctx, now)
        break
      case 'level-start':
        this.synthLevelStart(ctx, now)
        break
      case 'stage-complete':
        this.synthStageComplete(ctx, now)
        break
      case 'game-over':
        this.synthGameOver(ctx, now)
        break
      default:
        break
    }
  }

  // ------------------------------------------
  // Synthesizer Primitives
  // ------------------------------------------

  private playSynthTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine',
    gain = 0.1,
    lowpassCutoff?: number
  ): void {
    if (!this.musicGainNode) return

    const osc = ctx.createOscillator()
    const toneGain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, startTime)

    toneGain.gain.setValueAtTime(0.001, startTime)
    toneGain.gain.exponentialRampToValueAtTime(gain, startTime + 0.02)
    toneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

    if (lowpassCutoff) {
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(lowpassCutoff, startTime)
      osc.connect(filter)
      filter.connect(toneGain)
    } else {
      osc.connect(toneGain)
    }

    toneGain.connect(this.musicGainNode)

    osc.start(startTime)
    osc.stop(startTime + duration + 0.05)
  }

  private synthClick(ctx: AudioContext, t: number): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(950, t)
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.035)

    gain.gain.setValueAtTime(0.18, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035)

    osc.connect(gain)
    if (this.sfxGainNode) gain.connect(this.sfxGainNode)
    osc.start(t)
    osc.stop(t + 0.04)
  }

  private synthConfirm(ctx: AudioContext, t: number): void {
    // 2-tone bright confirmation chime
    const notes = [NOTE.C5, NOTE.G5]
    notes.forEach((freq, idx) => {
      const start = t + idx * 0.06
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.15, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12)

      osc.connect(gain)
      if (this.sfxGainNode) gain.connect(this.sfxGainNode)
      osc.start(start)
      osc.stop(start + 0.14)
    })
  }

  private synthCancel(ctx: AudioContext, t: number): void {
    // 2-tone descending soft chime
    const notes = [NOTE.E5, NOTE.A4]
    notes.forEach((freq, idx) => {
      const start = t + idx * 0.06
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.12, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1)

      osc.connect(gain)
      if (this.sfxGainNode) gain.connect(this.sfxGainNode)
      osc.start(start)
      osc.stop(start + 0.12)
    })
  }

  private synthPause(ctx: AudioContext, t: number): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, t)
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.1)

    gain.gain.setValueAtTime(0.14, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)

    osc.connect(gain)
    if (this.sfxGainNode) gain.connect(this.sfxGainNode)
    osc.start(t)
    osc.stop(t + 0.12)
  }

  private synthResume(ctx: AudioContext, t: number): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(220, t)
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.09)

    gain.gain.setValueAtTime(0.14, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09)

    osc.connect(gain)
    if (this.sfxGainNode) gain.connect(this.sfxGainNode)
    osc.start(t)
    osc.stop(t + 0.11)
  }

  private synthJump(ctx: AudioContext, t: number): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(170, t)
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.13)

    gain.gain.setValueAtTime(0.2, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14)

    osc.connect(gain)
    if (this.sfxGainNode) gain.connect(this.sfxGainNode)
    osc.start(t)
    osc.stop(t + 0.15)
  }

  private synthLand(ctx: AudioContext, t: number): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(110, t)
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08)

    gain.gain.setValueAtTime(0.22, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09)

    osc.connect(gain)
    if (this.sfxGainNode) gain.connect(this.sfxGainNode)
    osc.start(t)
    osc.stop(t + 0.1)
  }

  private synthAttack(ctx: AudioContext, t: number): void {
    // Swoosh sound (fast downward filtered frequency sweep)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(520, t)
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.1)

    gain.gain.setValueAtTime(0.18, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)

    osc.connect(gain)
    if (this.sfxGainNode) gain.connect(this.sfxGainNode)
    osc.start(t)
    osc.stop(t + 0.11)
  }

  private synthHit(ctx: AudioContext, t: number): void {
    // Punchy arcade impact
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(260, t)
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.09)

    gain.gain.setValueAtTime(0.28, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09)

    osc.connect(gain)
    if (this.sfxGainNode) gain.connect(this.sfxGainNode)
    osc.start(t)
    osc.stop(t + 0.1)
  }

  private synthDefeat(ctx: AudioContext, t: number): void {
    // Heavy crunch defeat explosion
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(180, t)
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.22)

    gain.gain.setValueAtTime(0.3, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)

    osc.connect(gain)
    if (this.sfxGainNode) gain.connect(this.sfxGainNode)
    osc.start(t)
    osc.stop(t + 0.25)
  }

  private synthDialogue(ctx: AudioContext, t: number): void {
    // Soft comic vocal blip with slight pitch variation
    const pitchOffset = (Math.random() - 0.5) * 40
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(460 + pitchOffset, t)
    osc.frequency.exponentialRampToValueAtTime(380 + pitchOffset, t + 0.04)

    gain.gain.setValueAtTime(0.1, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)

    osc.connect(gain)
    if (this.sfxGainNode) gain.connect(this.sfxGainNode)
    osc.start(t)
    osc.stop(t + 0.05)
  }

  private synthUnlock(ctx: AudioContext, t: number): void {
    // Bright 4-tone victory chime when exit gate unlocks
    const arpeggio = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6]
    arpeggio.forEach((freq, idx) => {
      const start = t + idx * 0.08
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.2, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16)

      osc.connect(gain)
      if (this.sfxGainNode) gain.connect(this.sfxGainNode)
      osc.start(start)
      osc.stop(start + 0.18)
    })
  }

  private synthTension(ctx: AudioContext, t: number): void {
    // Low ominous suspense drone for chasers getting close
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(95, t)
    osc.frequency.linearRampToValueAtTime(115, t + 0.25)
    osc.frequency.linearRampToValueAtTime(90, t + 0.5)

    gain.gain.setValueAtTime(0.01, t)
    gain.gain.linearRampToValueAtTime(0.18, t + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55)

    osc.connect(gain)
    if (this.sfxGainNode) gain.connect(this.sfxGainNode)
    osc.start(t)
    osc.stop(t + 0.6)
  }

  private synthLevelStart(ctx: AudioContext, t: number): void {
    const notes = [NOTE.G4, NOTE.C5, NOTE.E5]
    notes.forEach((freq, idx) => {
      const start = t + idx * 0.08
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.2, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15)

      osc.connect(gain)
      if (this.sfxGainNode) gain.connect(this.sfxGainNode)
      osc.start(start)
      osc.stop(start + 0.18)
    })
  }

  private synthStageComplete(ctx: AudioContext, t: number): void {
    const fanfare = [NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.C6]
    fanfare.forEach((freq, idx) => {
      const start = t + idx * 0.09
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.22, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25)

      osc.connect(gain)
      if (this.sfxGainNode) gain.connect(this.sfxGainNode)
      osc.start(start)
      osc.stop(start + 0.28)
    })
  }

  private synthGameOver(ctx: AudioContext, t: number): void {
    const notes = [NOTE.F3, NOTE.E3, NOTE.Eb3, NOTE.D3]
    notes.forEach((freq, idx) => {
      const start = t + idx * 0.12
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.25, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22)

      osc.connect(gain)
      if (this.sfxGainNode) gain.connect(this.sfxGainNode)
      osc.start(start)
      osc.stop(start + 0.25)
    })
  }
}

export const soundSynthesizer = new SoundSynthesizer()
