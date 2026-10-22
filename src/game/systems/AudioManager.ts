/**
 * AudioManager - Centralized Singleton Audio Controller for DD Game Scratch.
 *
 * Implements Master Prompt 17 complete audio architecture:
 * 1. Dedicated Music Tracks & States:
 *    - 'main-menu': Procedural relaxed Thatha Tea acoustic marimba theme.
 *    - 'level-select': Procedural driving, energetic synth arpeggios.
 *    - 'character-select': Procedural bouncy, comedic short-loop theme.
 *    - 'gameplay': The original, 100% PRESERVED DD Game BGM.mp3 audio track.
 *    - 'victory': Grand, celebratory fanfare for Grand Victory screen.
 *    - 'game-over': Comic, wobbly descending defeat theme.
 *    - 'none': Music silenced.
 * 2. Dedicated Interactive Sound Effects (SFX):
 *    - Menu & UI: click, confirm, cancel, pause, resume, slider.
 *    - Gameplay: jump, land, attack, hit, defeat, dialogue, unlock, tension, level-start, stage-complete.
 * 3. Separate Music & SFX Channels:
 *    - Independent volume controls (0.0 to 1.0) and mute toggles.
 *    - Full persistence in localStorage with safe defaults and error handling.
 * 4. Smooth Cross-Fade & State Transitions:
 *    - Switching tracks cleanly transitions without overlapping full-volume BGMs.
 *    - Pausing gameplay preserves BGM playback position (currentTime).
 * 5. Full Backward Compatibility for existing components:
 *    - audioManager.play(), audioManager.pause(), audioManager.toggleMute(),
 *      audioManager.isMuted(), audioManager.getVolume(), audioManager.subscribe().
 */

import { soundSynthesizer, type SfxType, type ProceduralMusicTrack } from './SoundSynthesizer'

export type MusicTrack = 'main-menu' | 'level-select' | 'character-select' | 'gameplay' | 'victory' | 'game-over' | 'none'

export interface AudioState {
  musicMuted: boolean
  musicVolume: number
  sfxMuted: boolean
  sfxVolume: number
  activeTrack: MusicTrack
  isPlaying: boolean
}

// Storage keys with backward-compatibility fallbacks
const KEY_MUSIC_MUTED = 'dd_game_music_muted'
const KEY_MUSIC_MUTED_LEGACY = 'dd_game_bgm_muted'
const KEY_MUSIC_VOLUME = 'dd_game_music_volume'
const KEY_MUSIC_VOLUME_LEGACY = 'dd_game_bgm_volume'
const KEY_SFX_MUTED = 'dd_game_sfx_muted'
const KEY_SFX_VOLUME = 'dd_game_sfx_volume'

const BGM_PATH = `${import.meta.env.BASE_URL || '/'}assets/audio/music/DD Game BGM.mp3`

const DEFAULT_MUSIC_VOLUME = 0.45
const DEFAULT_SFX_VOLUME = 0.70

export class AudioManager {
  private static instance: AudioManager | null = null

  // HTMLAudioElement exclusively for the preserved gameplay BGM
  private gameplayAudio: HTMLAudioElement | null = null

  // Active track state
  private activeTrack: MusicTrack = 'main-menu'
  private isPlayingState = false
  private hasUserInitiated = false

  // Channel states
  private musicMutedState = false
  private musicVolumeState = DEFAULT_MUSIC_VOLUME
  private sfxMutedState = false
  private sfxVolumeState = DEFAULT_SFX_VOLUME

  // State listeners
  private legacyMuteListeners: Set<(muted: boolean) => void> = new Set()
  private stateListeners: Set<(state: AudioState) => void> = new Set()

  private constructor() {
    this.loadPersistedSettings()
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  private loadPersistedSettings(): void {
    if (typeof window === 'undefined') return

    try {
      // Music Mute
      const storedMute = localStorage.getItem(KEY_MUSIC_MUTED) ?? localStorage.getItem(KEY_MUSIC_MUTED_LEGACY)
      if (storedMute !== null) {
        this.musicMutedState = storedMute === 'true'
      }

      // Music Volume
      const storedVol = localStorage.getItem(KEY_MUSIC_VOLUME) ?? localStorage.getItem(KEY_MUSIC_VOLUME_LEGACY)
      if (storedVol !== null) {
        const parsed = parseFloat(storedVol)
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.musicVolumeState = parsed
        }
      }

      // SFX Mute
      const storedSfxMute = localStorage.getItem(KEY_SFX_MUTED)
      if (storedSfxMute !== null) {
        this.sfxMutedState = storedSfxMute === 'true'
      }

      // SFX Volume
      const storedSfxVol = localStorage.getItem(KEY_SFX_VOLUME)
      if (storedSfxVol !== null) {
        const parsedSfx = parseFloat(storedSfxVol)
        if (!isNaN(parsedSfx) && parsedSfx >= 0 && parsedSfx <= 1) {
          this.sfxVolumeState = parsedSfx
        }
      }
    } catch {
      // Ignore localStorage restrictions gracefully
    }
  }

  private initGameplayAudio(): HTMLAudioElement | null {
    if (this.gameplayAudio) return this.gameplayAudio
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null

    try {
      const audio = new Audio(BGM_PATH)
      audio.loop = true
      audio.volume = this.musicMutedState ? 0 : this.musicVolumeState
      audio.muted = this.musicMutedState

      audio.addEventListener('play', () => {
        if (this.activeTrack === 'gameplay') {
          this.isPlayingState = true
          this.notifyListeners()
        }
      })
      audio.addEventListener('pause', () => {
        if (this.activeTrack === 'gameplay') {
          this.isPlayingState = false
          this.notifyListeners()
        }
      })
      audio.addEventListener('error', (e) => {
        console.warn('[AudioManager] Gameplay audio error:', e)
      })

      this.gameplayAudio = audio
      return audio
    } catch (err) {
      console.warn('[AudioManager] Failed to initialize Audio element:', err)
      return null
    }
  }

  // ==========================================
  // MUSIC TRACK MANAGEMENT
  // ==========================================

  /**
   * Switches to a specific music track with clean transition management.
   */
  public async setMusicTrack(track: MusicTrack): Promise<boolean> {
    this.hasUserInitiated = true
    soundSynthesizer.getContext() // Wake up Web Audio context on user gesture

    if (this.activeTrack === track && this.isPlayingState) {
      return true
    }

    const previousTrack = this.activeTrack
    this.activeTrack = track

    // 1. Handle previous track shutdown
    if (previousTrack === 'gameplay' && track !== 'gameplay') {
      if (this.gameplayAudio && !this.gameplayAudio.paused) {
        this.gameplayAudio.pause()
      }
    } else if (previousTrack !== 'gameplay' && track === 'gameplay') {
      soundSynthesizer.stopMusic()
    }

    // Update synthesizer gains
    soundSynthesizer.setMusicMasterGain(this.musicVolumeState, this.musicMutedState)
    soundSynthesizer.setSfxMasterGain(this.sfxVolumeState, this.sfxMutedState)

    // 2. Start requested track
    if (track === 'none') {
      if (this.gameplayAudio) this.gameplayAudio.pause()
      soundSynthesizer.stopMusic()
      this.isPlayingState = false
      this.notifyListeners()
      return true
    }

    if (track === 'gameplay') {
      soundSynthesizer.stopMusic()
      const audio = this.initGameplayAudio()
      if (!audio) return false

      audio.muted = this.musicMutedState
      audio.volume = this.musicMutedState ? 0 : this.musicVolumeState

      try {
        await audio.play()
        this.isPlayingState = true
        this.notifyListeners()
        return true
      } catch (err) {
        console.warn('[AudioManager] Autoplay deferred for gameplay BGM:', err)
        return false
      }
    }

    // Procedural Music Tracks (main-menu, level-select, character-select, victory, game-over)
    if (this.gameplayAudio && !this.gameplayAudio.paused) {
      this.gameplayAudio.pause()
    }

    soundSynthesizer.startMusic(track as ProceduralMusicTrack)
    this.isPlayingState = true
    this.notifyListeners()
    return true
  }

  /**
   * Starts playing the current track (or initiates default if not playing).
   * Safe to call repeatedly without restarting ongoing playback.
   */
  public async play(): Promise<boolean> {
    this.hasUserInitiated = true
    return this.setMusicTrack(this.activeTrack || 'main-menu')
  }

  /**
   * Pauses the current music track without resetting position.
   */
  public pause(): void {
    if (this.activeTrack === 'gameplay' && this.gameplayAudio) {
      this.gameplayAudio.pause()
    } else {
      soundSynthesizer.stopMusic()
    }
    this.isPlayingState = false
    this.notifyListeners()
  }

  /**
   * Resumes playback after a pause.
   */
  public resume(): void {
    if (!this.isPlayingState && this.activeTrack !== 'none') {
      void this.setMusicTrack(this.activeTrack)
    }
  }

  // ==========================================
  // SFX PLAYBACK
  // ==========================================

  /**
   * Triggers an interactive sound effect.
   */
  public playSfx(type: SfxType): void {
    if (this.sfxMutedState) return
    soundSynthesizer.getContext() // Ensure AudioContext is ready
    soundSynthesizer.setSfxMasterGain(this.sfxVolumeState, this.sfxMutedState)
    soundSynthesizer.playSfx(type)
  }

  // ==========================================
  // VOLUME & MUTE CONTROLS
  // ==========================================

  // Music Channel
  public setMusicVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol))
    this.musicVolumeState = clamped

    if (this.gameplayAudio && !this.musicMutedState) {
      this.gameplayAudio.volume = clamped
    }
    soundSynthesizer.setMusicMasterGain(clamped, this.musicMutedState)

    try {
      localStorage.setItem(KEY_MUSIC_VOLUME, String(clamped))
      localStorage.setItem(KEY_MUSIC_VOLUME_LEGACY, String(clamped))
    } catch {
      // Ignore
    }

    this.notifyListeners()
  }

  public getMusicVolume(): number {
    return this.musicVolumeState
  }

  public setMusicMuted(muted: boolean): boolean {
    this.musicMutedState = muted

    if (this.gameplayAudio) {
      this.gameplayAudio.muted = muted
      this.gameplayAudio.volume = muted ? 0 : this.musicVolumeState
    }
    soundSynthesizer.setMusicMasterGain(this.musicVolumeState, muted)

    try {
      localStorage.setItem(KEY_MUSIC_MUTED, String(muted))
      localStorage.setItem(KEY_MUSIC_MUTED_LEGACY, String(muted))
    } catch {
      // Ignore
    }

    this.notifyListeners()
    return this.musicMutedState
  }

  public toggleMusicMute(): boolean {
    const newState = !this.musicMutedState
    this.playSfx('click')
    return this.setMusicMuted(newState)
  }

  public isMusicMuted(): boolean {
    return this.musicMutedState
  }

  // SFX Channel
  public setSfxVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol))
    this.sfxVolumeState = clamped
    soundSynthesizer.setSfxMasterGain(clamped, this.sfxMutedState)

    try {
      localStorage.setItem(KEY_SFX_VOLUME, String(clamped))
    } catch {
      // Ignore
    }

    this.notifyListeners()
  }

  public getSfxVolume(): number {
    return this.sfxVolumeState
  }

  public setSfxMuted(muted: boolean): boolean {
    this.sfxMutedState = muted
    soundSynthesizer.setSfxMasterGain(this.sfxVolumeState, muted)

    try {
      localStorage.setItem(KEY_SFX_MUTED, String(muted))
    } catch {
      // Ignore
    }

    this.notifyListeners()
    return this.sfxMutedState
  }

  public toggleSfxMute(): boolean {
    const newState = !this.sfxMutedState
    this.playSfx('click')
    return this.setSfxMuted(newState)
  }

  public isSfxMuted(): boolean {
    return this.sfxMutedState
  }

  // Restore Defaults
  public restoreDefaults(): void {
    this.setMusicVolume(DEFAULT_MUSIC_VOLUME)
    this.setMusicMuted(false)
    this.setSfxVolume(DEFAULT_SFX_VOLUME)
    this.setSfxMuted(false)
    this.playSfx('confirm')
  }

  // ==========================================
  // LEGACY BACKWARD-COMPATIBILITY SHIMS
  // ==========================================

  public toggleMute(): boolean {
    return this.toggleMusicMute()
  }

  public setMuted(muted: boolean): boolean {
    return this.setMusicMuted(muted)
  }

  public isMuted(): boolean {
    return this.isMusicMuted()
  }

  public setVolume(vol: number): void {
    this.setMusicVolume(vol)
  }

  public getVolume(): number {
    return this.getMusicVolume()
  }

  public isPlaying(): boolean {
    return this.isPlayingState
  }

  public hasInitiated(): boolean {
    return this.hasUserInitiated
  }

  public getActiveTrack(): MusicTrack {
    return this.activeTrack
  }

  public getState(): AudioState {
    return {
      musicMuted: this.musicMutedState,
      musicVolume: this.musicVolumeState,
      sfxMuted: this.sfxMutedState,
      sfxVolume: this.sfxVolumeState,
      activeTrack: this.activeTrack,
      isPlaying: this.isPlayingState,
    }
  }

  // ==========================================
  // SUBSCRIPTIONS & CLEANUP
  // ==========================================

  /**
   * Legacy subscribe method (listens to music mute state changes).
   */
  public subscribe(listener: (muted: boolean) => void): () => void {
    this.legacyMuteListeners.add(listener)
    listener(this.musicMutedState)
    return () => {
      this.legacyMuteListeners.delete(listener)
    }
  }

  /**
   * Detailed audio state subscriber.
   */
  public subscribeState(listener: (state: AudioState) => void): () => void {
    this.stateListeners.add(listener)
    listener(this.getState())
    return () => {
      this.stateListeners.delete(listener)
    }
  }

  private notifyListeners(): void {
    for (const listener of this.legacyMuteListeners) {
      listener(this.musicMutedState)
    }
    const state = this.getState()
    for (const listener of this.stateListeners) {
      listener(state)
    }
  }

  public destroy(): void {
    if (this.gameplayAudio) {
      this.gameplayAudio.pause()
      this.gameplayAudio.src = ''
      this.gameplayAudio = null
    }
    soundSynthesizer.stopMusic()
    this.isPlayingState = false
    this.legacyMuteListeners.clear()
    this.stateListeners.clear()
  }
}

export const audioManager = AudioManager.getInstance()
