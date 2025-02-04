"use client"

import { useEffect, useRef } from "react"
import { drawGame, updateGame, initGame, initializeGameAssets, type GameState, handleJump } from "@/lib/gameLogic"
import { useGameAnalytics } from "@/hooks/useGameAnalytics"

interface GameCanvasProps {
  gameState: GameState | null
  setGameState: (state: GameState | null | ((prev: GameState | null) => GameState | null)) => void
}

export function GameCanvas({ gameState, setGameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keyListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null)
  const { recordGameAnalytics } = useGameAnalytics()

  // Initialize game when gameState is null
  useEffect(() => {
    if (gameState === null) {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const initialState = initGame(canvas.width, canvas.height)
      setGameState(initialState)
    }
  }, [gameState, setGameState])

  // Handle game loop and keyboard events
  useEffect(() => {
    // Initialize game assets first
    initializeGameAssets()?.then(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Add keyboard event listener
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === "Space") {
          e.preventDefault()
          setGameState((prevState: GameState | null) => {
            if (!prevState) return initGame(canvas.width, canvas.height)
            if (!prevState.gameStarted) {
              return { ...prevState, gameStarted: true }
            }
            if (prevState.gameOver) {
              return initGame(canvas.width, canvas.height)
            }
            const newState = { ...prevState }
            handleJump(newState)
            return newState
          })
        }
      }

      // Store the listener reference
      keyListenerRef.current = handleKeyPress
      window.addEventListener("keydown", handleKeyPress)

      let animationFrameId: number

      const gameLoop = () => {
        setGameState(prevState => {
          if (!prevState) return null
          const newState = updateGame(prevState, canvas.width, canvas.height)
          drawGame(ctx, newState)
          return newState
        })
        animationFrameId = requestAnimationFrame(gameLoop)
      }

      gameLoop()

      return () => {
        if (keyListenerRef.current) {
          window.removeEventListener("keydown", keyListenerRef.current)
        }
        cancelAnimationFrame(animationFrameId)
      }
    })
  }, [setGameState])

  // Add effect to record analytics when game ends
  useEffect(() => {
    if (gameState?.gameOver) {
      recordGameAnalytics(gameState)
    }
  }, [gameState?.gameOver])

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={700} 
      className="w-full h-full object-contain"
      aria-label="Flappy Chicken Game Canvas"
    />
  )
} 