"use client"

import { useEffect, useRef, useCallback } from "react"
import { drawGame, updateGame, initGame, initializeGameAssets, type GameState, handleJump } from "@/lib/gameLogic"
import { useGameAnalytics } from "@/hooks/useGameAnalytics"

interface GameCanvasProps {
  gameState: GameState | null
  setGameState: (state: GameState | null | ((prev: GameState | null) => GameState | null)) => void
}

export function GameCanvas({ gameState, setGameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const { recordGameAnalytics } = useGameAnalytics()

  // Optimize game loop with useCallback
  const gameLoop = useCallback((ctx: CanvasRenderingContext2D) => {
    setGameState(prevState => {
      if (!prevState) return null
      const newState = updateGame(prevState, ctx.canvas.width, ctx.canvas.height)
      drawGame(ctx, newState)
      return newState
    })
    rafRef.current = requestAnimationFrame(() => gameLoop(ctx))
  }, [setGameState])

  // Handle input events
  const handleInput = useCallback((e: Event) => {
    e.preventDefault()
    setGameState((prevState: GameState | null) => {
      if (!prevState) return initGame(canvasRef.current?.width || 400, canvasRef.current?.height || 700)
      if (!prevState.gameStarted) {
        return { ...prevState, gameStarted: true }
      }
      if (prevState.gameOver) {
        return initGame(canvasRef.current?.width || 400, canvasRef.current?.height || 700)
      }
      const newState = { ...prevState }
      handleJump(newState)
      return newState
    })
  }, [setGameState])

  // Handle keyboard events separately
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault()
      handleInput(e)
    }
  }, [handleInput])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Add touch event listeners with passive: false for better mobile performance
    canvas.addEventListener('touchstart', handleInput, { passive: false })
    canvas.addEventListener('mousedown', handleInput)
    window.addEventListener('keydown', handleKeyPress)

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Initialize game assets and start game loop
    initializeGameAssets()?.then(() => {
      if (!gameState) {
        setGameState(initGame(canvas.width, canvas.height))
      }
      rafRef.current = requestAnimationFrame(() => gameLoop(ctx))
    })

    return () => {
      canvas.removeEventListener('touchstart', handleInput)
      canvas.removeEventListener('mousedown', handleInput)
      window.removeEventListener('keydown', handleKeyPress)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [gameLoop, handleInput, handleKeyPress, gameState, setGameState])

  // Record analytics on game over
  useEffect(() => {
    if (gameState?.gameOver) {
      recordGameAnalytics(gameState)
    }
  }, [gameState?.gameOver, recordGameAnalytics])

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={700} 
      className="w-full h-full object-contain touch-none"
      aria-label="Flappy Chicken Game Canvas"
    />
  )
} 