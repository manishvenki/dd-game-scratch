/**
 * AudioManager - Centralized Singleton Audio Controller for DD Game Scratch.
 *
 * Ensures:
 * 1. Single audio instance across React renders and Phaser scene transitions.
 * 2. Background music (BGM) loops continuously without restarting from 0:00 on level changes.
 * 3. User gesture activation with graceful rejection handling.
 * 4. Persistent mute state synced across the entire application via localStorage.
 * 5. Event subscription for reactive UI components (e.g. Mute/Unmute buttons).
 */

const STORAGE_KEY_MUTED = 'dd_game_bgm_muted'
const BGM_PATH = `${import.meta.env.BASE_URL || '/'}assets/audio/music/DD Game BGM.mp3`
const DEFAULT_VOLUME = 0.45

export class AudioManager {
  private static instance: AudioManager | null = null
  private audio: HTMLAudioElement | null = null
  private isMutedState = false
  private isPlayingState = false
  private hasUserInitiated = false
  private listeners: Set<(muted: boolean) => void> = new Set()

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_MUTED)
        if (stored !== null) {
          this.isMutedState = stored === 'true'
        }
      } catch {
        // LocalStorage might be restricted; fallback gracefully
      }
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  private initAudio(): HTMLAudioElement | null {
    if (this.audio) return this.audio
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null

    try {
      const audio = new Audio(BGM_PATH)
      audio.loop = true
      audio.volume = this.isMutedState ? 0 : DEFAULT_VOLUME
      audio.muted = this.isMutedState

      audio.addEventListener('play', () => {
        this.isPlayingState = true
      })
      audio.addEventListener('pause', () => {
        this.isPlayingState = false
      })
      audio.addEventListener('error', (e) => {
        console.warn('[AudioManager] Audio playback error:', e)
      })

      this.audio = audio
      return audio
    } catch (err) {
      console.warn('[AudioManager] Failed to initialize Audio element:', err)
      return null
    }
  }

  /**
   * Starts playing the BGM track if not already playing.
   * Safe to call repeatedly; will not restart an ongoing track.
   */
  public async play(): Promise<boolean> {
    this.hasUserInitiated = true
    const audio = this.initAudio()
    if (!audio) return false

    // Apply mute state
    audio.muted = this.isMutedState
    audio.volume = this.isMutedState ? 0 : DEFAULT_VOLUME

    if (!audio.paused && this.isPlayingState) {
      return true
    }

    try {
      await audio.play()
      this.isPlayingState = true
      return true
    } catch (err) {
      // Browser autoplay policy might block if not triggered by an explicit user gesture
      console.warn('[AudioManager] Autoplay blocked or deferred:', err)
      return false
    }
  }

  /**
   * Pauses the BGM without resetting the playback position.
   */
  public pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
      this.isPlayingState = false
    }
  }

  /**
   * Toggles the mute state and persists it to localStorage.
   */
  public toggleMute(): boolean {
    return this.setMuted(!this.isMutedState)
  }

  /**
   * Explicitly sets mute state.
   */
  public setMuted(muted: boolean): boolean {
    this.isMutedState = muted

    if (this.audio) {
      this.audio.muted = muted
      this.audio.volume = muted ? 0 : DEFAULT_VOLUME
    }

    try {
      localStorage.setItem(STORAGE_KEY_MUTED, String(muted))
    } catch {
      // Ignore localStorage exceptions
    }

    // Notify subscribers
    for (const listener of this.listeners) {
      listener(this.isMutedState)
    }

    return this.isMutedState
  }

  public isMuted(): boolean {
    return this.isMutedState
  }

  public isPlaying(): boolean {
    return this.isPlayingState
  }

  public hasInitiated(): boolean {
    return this.hasUserInitiated
  }

  /**
   * Subscribes a listener to mute state changes.
   * Returns an unsubscribe callback.
   */
  public subscribe(listener: (muted: boolean) => void): () => void {
    this.listeners.add(listener)
    listener(this.isMutedState)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Cleans up audio resources (used during test teardown).
   */
  public destroy(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
    }
    this.isPlayingState = false
    this.listeners.clear()
  }
}

export const audioManager = AudioManager.getInstance()
