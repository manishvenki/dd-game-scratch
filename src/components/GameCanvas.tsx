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
export default function GameCanvas({
  className = '',
  scenes = [BootScene],
  onReady,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clean up any stale canvas or element from previous mounts/StrictMode passes
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    let isDisposed = false

    // Initialize decoupled Phaser 3 configuration
    const config = createGameConfig(container, scenes)
    const game = new Phaser.Game(config)
    gameRef.current = game

    if (onReady) {
      game.events.once(Phaser.Core.Events.READY, () => {
        if (!isDisposed) {
          onReady(game)
        }
      })
    }

    // Teardown logic
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
  }, [scenes, onReady])

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
