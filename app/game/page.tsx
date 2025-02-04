"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { drawGame, updateGame, initGame, type GameState, handleJump } from "@/lib/gameLogic"
import { ScoreSubmission } from "@/components/ScoreSubmission"
import { useHighScores } from "@/hooks/useHighScores"

export default function FlappyChicken() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showScoreSubmission, setShowScoreSubmission] = useState(false)
  const { submitScore, isHighScore, submitting, highScores } = useHighScores()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const initialState = initGame(canvas.width, canvas.height)
    setGameState(initialState)

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setGameState(prevState => {
          if (!prevState) return null
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
      window.removeEventListener("keydown", handleKeyPress)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const handleClick = () => {
    setGameState(prevState => {
      if (!prevState) return null
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
  }

  const handleScoreSubmit = async (playerName: string) => {
    if (!gameState) return { success: false, message: "Game state not found" }
    const result = await submitScore(playerName, gameState.score)
    if (result.success) {
      setShowScoreSubmission(false)
    }
    return result
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: 'url("/background.png")',
        backgroundRepeat: 'repeat',
        backgroundColor: '#FFF5EA' // Fallback color
      }}
    >
      <div 
        className="relative w-full max-w-md aspect-[9/16] bg-[#FFF9EB] rounded-2xl shadow-xl overflow-hidden"
        onClick={handleClick}
      >
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={700} 
          className="w-full h-full object-contain"
          aria-label="Flappy Chicken Game Canvas"
        />
        
        {!gameState?.gameStarted && !gameState?.gameOver && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFBAEA]/50"
          >
            <h1 className="text-4xl font-bold text-white mb-8">Flappy Chicken</h1>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClick()
              }}
              className="px-8 py-4 bg-[#EB321A] text-white rounded-full font-bold text-xl shadow-lg hover:bg-yellow-300 transition-colors"
              aria-label="Start Game"
            >
              Start Game
            </button>
            <p className="text-white mt-4 text-center">
              Press SPACE or tap screen to jump
            </p>
          </motion.div>
        )}
        
        {gameState?.gameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFBAEA]/50"
          >
            {/* Game Over Text */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-5xl font-bold text-[#FFFF] drop-shadow-[0_2px_2px_rgba(255,255,255,0.5)]">
                Game Over
              </h2>
            </motion.div>

            {/* Score Card */}
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-[#FFFF]/60 rounded-xl p-6 shadow-lg w-72 drop-shadow-[0_2px_2px_rgba(255,255,255,0.5)]"
            >
              {/* Current Score */}
              <div className="text-center mb-4">
                <div className="text-sm uppercase font-bold text-[#EB321A]">Score</div>
                <div className="text-4xl font-bold text-[#EB321A]">{gameState.score}</div>
              </div>

              {/* Best Score */}
              <div className="text-center mb-6">
                <div className="text-sm uppercase font-bold text-[#EB321A]">Best</div>
                <div className="text-2xl font-bold text-[#EB321A]">
                  {Math.max(...highScores.map(s => s.score), gameState.score)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClick()
                  }}
                  className="bg-[#EB321A] text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-[#d42d18] transition-colors shadow-md flex items-center justify-center"
                >
                  <span className="mr-2">↺</span>
                  RETRY
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const text = `I scored ${gameState.score} points in Flappy Chicken! Can you beat my score?`
                    if (navigator.share) {
                      navigator.share({
                        title: 'Flappy Chicken Score',
                        text: text,
                        url: window.location.href
                      })
                    } else {
                      navigator.clipboard.writeText(text)
                    }
                  }}
                  className="bg-[#FFBAEA] text-[#EB321A] py-3 px-4 rounded-lg font-bold text-lg hover:bg-[#ff9ed7] transition-colors shadow-md flex items-center justify-center"
                >
                  <span className="mr-2">↗</span>
                  SHARE
                </button>

                {isHighScore(gameState.score) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowScoreSubmission(true)
                    }}
                    className="col-span-2 bg-[#FFF9EB] text-[#EB321A] py-3 px-4 rounded-lg font-bold text-lg hover:bg-[#fff0d1] transition-colors shadow-md flex items-center justify-center mt-2"
                  >
                    <span className="mr-2">⬇</span>
                    SAVE SCORE
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        
        <AnimatePresence>
          {showScoreSubmission && gameState && (
            <ScoreSubmission
              score={gameState.score}
              onSubmit={handleScoreSubmit}
              onClose={() => setShowScoreSubmission(false)}
              submitting={submitting}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 