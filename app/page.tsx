"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { type GameState, handleJump } from "@/lib/gameLogic"
import { GameCanvas } from "@/components/GameCanvas"
import { useHighScores } from "@/hooks/useHighScores"
import { customFont } from './fonts'

export default function FlappyChicken() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const { submitScore, isHighScore, highScores } = useHighScores()
  const [playerName, setPlayerName] = useState("")

  const handleClick = () => {
    setGameState(prevState => {
      if (!prevState) return null
      if (!prevState.gameStarted) {
        return { ...prevState, gameStarted: true }
      }
      if (prevState.gameOver) {
        return null  // This will trigger the initialization effect in GameCanvas
      }
      const newState = { ...prevState }
      handleJump(newState)
      return newState
    })
  }

  const handleScoreSubmit = async (playerName: string) => {
    if (!gameState) return
    await submitScore(playerName, gameState.score)
  }

  const generateShareImage = async (score: number): Promise<Blob> => {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')

    const baseImage = new Image()
    baseImage.src = '/flappy_chicken_share_image.png'
    
    await new Promise((resolve) => {
      baseImage.onload = resolve
    })

    ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height)
    ctx.fillStyle = '#EB321A'
    ctx.font = `bold 70px ${customFont.style.fontFamily}, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob)
      }, 'image/png')
    })
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
        <GameCanvas 
          gameState={gameState}
          setGameState={setGameState}
        />
        
        {!gameState?.gameStarted && !gameState?.gameOver && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              backgroundImage: 'url("/landing_page.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-end mb-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
                className="px-8 py-4 bg-[#EB321A] text-white rounded-full font-bold font-custom text-xl shadow-lg hover:bg-[#d42d18] transition-colors mt"
                aria-label="Start Game"
              >
                Comenzar
              </button>
              <p className="text-white mt-4 text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                Presiona Espacio o toca la pantalla para saltar
              </p>
            </div>
          </motion.div>
        )}
        
        {gameState?.gameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFBAEA]/50"
          >

            {/* Game Over and Score Card */}
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-[#FFFF]/60 rounded-xl p-6 shadow-lg w-72 drop-shadow-[0_2px_2px_rgba(255,255,255,0.5)]"
            >
              <div className="text-center mb-6">
                <h2 className="text-5xl font-bold text-[#EB321A] drop-shadow-[0_2px_2px_rgba(235,50,26,0.5)] font-custom">
                  {isHighScore(gameState.score) ? 'New High Score!' : 'Game Over'}
                </h2>
              </div>
              {isHighScore(gameState.score) ? (
                <>
                  {/* High Score View */}
                  <div 
                    className="text-center mb-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-4xl font-bold font-custom text-[#EB321A] mb-2">
                      {gameState.score}
                    </div>
                    {highScores[0] ? (
                      <div className="text-sm text-[#EB321A] font-custom">
                        Previous best: {highScores[0].score} by {highScores[0].player_name}
                      </div>
                    ) : (
                      <div className="text-sm text-[#EB321A] font-custom">
                        First high score!
                      </div>
                    )}
                  </div>

                  {/* Name Input */}
                  <div 
                    className="space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 rounded-lg border border-[#FFBAEA] focus:outline-none focus:ring-2 focus:ring-[#EB321A] font-custom text-center"
                      maxLength={20}
                      onChange={(e) => setPlayerName(e.target.value)}
                      value={playerName}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (playerName.trim()) {
                          await handleScoreSubmit(playerName)
                        }
                      }}
                      disabled={!playerName.trim()}
                      className="w-full bg-[#EB321A] text-white py-3 px-4 rounded-lg font-bold text-lg font-custom
                               hover:bg-[#d42d18] transition-colors shadow-md disabled:opacity-50"
                    >
                      Submit Score
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Regular Game Over View */}
                  <div className="text-center mb-4">
                    <div className="text-sm uppercase font-bold text-[#EB321A] font-custom">Tu Puntaje</div>
                    <div className="text-4xl font-bold font-custom text-[#EB321A]">{gameState.score}</div>
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-sm uppercase font-bold text-[#EB321A] font-custom">Record</div>
                    <div className="text-xl font-bold font-custom text-[#EB321A]">
                      {highScores[0] ? (
                        <>
                          {highScores[0].score} por {highScores[0].player_name}
                        </>
                      ) : (
                        'No hay puntajes'
                      )}
                    </div>
                  </div>

                  {/* Regular Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClick()
                      }}
                      className="bg-[#EB321A] text-white py-3 px-4 rounded-lg font-bold font-custom text-lg hover:bg-[#d42d18] transition-colors shadow-md flex items-center justify-center"
                    >
                      <span className="mr-2">↺</span>
                      RETRY
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        const text = `I scored ${gameState.score} points in Flappy Chicken! Can you beat my score?`
                        
                        try {
                          const shareImage = await generateShareImage(gameState.score)
                          const file = new File([shareImage], 'flappy-score.png', { type: 'image/png' })

                          if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                              title: 'Flappy Chicken Score',
                              text: text,
                              url: 'https://game.thewindow.es',
                              files: [file]
                            })
                          } else {
                            // Fallback for browsers that don't support sharing files
                            const shareUrl = URL.createObjectURL(shareImage)
                            const a = document.createElement('a')
                            a.href = shareUrl
                            a.download = 'flappy-score.png'
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(shareUrl)
                            
                            // Also copy the text to clipboard
                            await navigator.clipboard.writeText(text)
                          }
                        } catch (error) {
                          console.error('Error sharing:', error)
                          // Fallback to just sharing text
                          if (navigator.share) {
                            await navigator.share({
                              title: 'Flappy Chicken Score',
                              text: text,
                              url: window.location.href
                            })
                          } else {
                            await navigator.clipboard.writeText(text)
                          }
                        }
                      }}
                      className="bg-[#FFBAEA] text-[#EB321A] py-3 px-4 rounded-lg font-bold font-custom text-lg hover:bg-[#ff9ed7] transition-colors shadow-md flex items-center justify-center"
                    >
                      <span className="mr-2">↗</span>
                      SHARE
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 