import { useHighScores } from '@/hooks/useHighScores'
import { motion } from 'framer-motion'

export const HighScores = () => {
  const { highScores, loading } = useHighScores()

  if (loading) {
    return (
      <div className="absolute top-4 right-4 bg-white/80 p-4 rounded-lg shadow-lg min-w-[200px]">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 right-4 bg-white/80 p-4 rounded-lg shadow-lg min-w-[200px]"
    >
      <h2 className="text-lg font-bold mb-2">High Scores</h2>
      {highScores.length === 0 ? (
        <p className="text-sm text-gray-600">No scores yet. Be the first!</p>
      ) : (
        <ul className="space-y-1">
          {highScores.map((score, index) => (
            <motion.li 
              key={score.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-sm flex justify-between items-center"
            >
              <span className="font-medium truncate max-w-[120px]">
                {score.player_name}
              </span>
              <span className="text-blue-600 font-bold">
                {score.score.toLocaleString()}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  )
} 