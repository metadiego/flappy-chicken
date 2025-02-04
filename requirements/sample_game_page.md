# Sample Game Page

```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { drawGame, updateGame, initGame, type GameState, JUMP_STRENGTH } from "./gameLogic"

export default function FlappyBird() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const initialState = initGame(canvas.width, canvas.height)
    setGameState(initialState)

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setGameState((prevState) => {
          if (!prevState) return null
          if (!prevState.gameStarted) {
            return { ...prevState, gameStarted: true }
          }
          return { ...prevState, bird: { ...prevState.bird, velocity: JUMP_STRENGTH } }
        })
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    let animationFrameId: number

    const gameLoop = () => {
      setGameState((prevState) => {
        if (!prevState) return null
        const newState = updateGame(prevState, canvas.width, canvas.height)
        drawGame(ctx, newState)
        return newState
      })
      animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-sky-200">
      <canvas ref={canvasRef} width={400} height={700} className="border-4 border-sky-600" />
    </div>
  )
}
```
