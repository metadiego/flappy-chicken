import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SubmitScoreStatus } from '@/hooks/useHighScores'

interface ScoreSubmissionProps {
  onSubmit: (playerName: string) => Promise<SubmitScoreStatus>
  onClose: () => void
  score: number
  submitting: boolean
}

export const ScoreSubmission = ({
  onSubmit,
  onClose,
  score,
  submitting
}: ScoreSubmissionProps) => {
  const [playerName, setPlayerName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const result = await onSubmit(playerName)
    if (!result.success) {
      setError(result.message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
      >
        <h2 className="text-xl font-bold mb-4">New High Score: {score}!</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="playerName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enter your name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={20}
              disabled={submitting}
              aria-label="Player name input"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={submitting || !playerName.trim()}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Score'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border rounded hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
} 