import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import { createGameConfig } from '../game/config/gameConfig'
import { BootScene } from '../game/scenes/BootScene'

export interface GameCanvasProps {
  readonly className?: string
  readonly scenes?: Phaser.Types.Scenes.SceneType[]
  readonly onReady?: (game: Phaser.Game) => void
}

/**
 * Reusable React component that hosts and manages the lifecycle of a Phaser 3 game instance.
 *
 * Prevents memory leaks and duplicate canvas instances by strictly managing
 * instantiation, destruction, and cleanup within a React ref.
 */
const DEFAULT_SCENES: Phaser.Types.Scenes.SceneType[] = [BootScene]

export default function GameCanvas({
  className = '',
  scenes = DEFAULT_SCENES,
  onReady,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const onReadyRef = useRef(onReady)
  const scenesRef = useRef(scenes)

  useEffect(() => {
    onReadyRef.current = onReady
    scenesRef.current = scenes
  }, [onReady, scenes])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Prevent duplicate Phaser game instantiation if instance already exists
    if (gameRef.current) return

    // Clean up any stale canvas or element from previous mounts/StrictMode passes
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    let isDisposed = false

    // Initialize decoupled Phaser 3 configuration
    const config = createGameConfig(container, scenesRef.current)
    const game = new Phaser.Game(config)
    gameRef.current = game

    game.events.once(Phaser.Core.Events.READY, () => {
      if (!isDisposed) {
        onReadyRef.current?.(game)
      }
    })

    // Teardown logic - only invoked when GameCanvas component is unmounted
    return () => {
      isDisposed = true

      if (gameRef.current) {
        // destroy(true) removes the canvas from the DOM and clears textures/cache
        gameRef.current.destroy(true)
        gameRef.current = null
      }

      // Ensure no residual DOM nodes remain
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      tabIndex={0}
      role="region"
      aria-label="DD Game Scratch Canvas"
    />
  )
}
