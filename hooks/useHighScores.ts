import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type HighScore = Database['public']['Tables']['high_scores']['Row']

export type SubmitScoreStatus = {
  success: boolean
  message: string
}

export const useHighScores = () => {
  const [highScores, setHighScores] = useState<HighScore[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchHighScores = async () => {
    try {
      const supabase = getSupabase()
      if (!supabase) return

      const { data, error } = await supabase
        .from('high_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(10)

      if (error) throw error
      setHighScores(data || [])
    } catch (error) {
      console.error('Error fetching high scores:', error)
    } finally {
      setLoading(false)
    }
  }

  const validatePlayerName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 20 && /^[a-zA-Z0-9\s]+$/.test(name)
  }

  const submitScore = async (
    playerName: string, 
    score: number
  ): Promise<SubmitScoreStatus> => {
    if (submitting) {
      return { success: false, message: 'Already submitting a score' }
    }

    if (!validatePlayerName(playerName)) {
      return { 
        success: false, 
        message: 'Name must be 2-20 characters long and contain only letters, numbers, and spaces' 
      }
    }

    try {
      setSubmitting(true)
      const supabase = getSupabase()
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      // Check if score is within reasonable limits
      if (score < 0 || score > 999999) {
        throw new Error('Invalid score')
      }

      // Get current high scores to compare
      const { data: currentHighScores } = await supabase
        .from('high_scores')
        .select('score')
        .order('score', { ascending: false })
        .limit(1)
        .single()

      // Only submit if it's a new high score
      if (!currentHighScores || score > currentHighScores.score) {
        const { error } = await supabase
          .from('high_scores')
          .insert([{ player_name: playerName.trim(), score }])

        if (error) throw error

        await fetchHighScores()
        return { success: true, message: 'New high score submitted!' }
      }

      return { success: false, message: 'Not a high score' }
    } catch (error) {
      console.error('Error submitting score:', error)
      return { 
        success: false, 
        message: 'Failed to submit score. Please try again.' 
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isHighScore = (score: number): boolean => {
    if (highScores.length === 0) return true
    return score > (highScores[0]?.score ?? 0)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchHighScores()
      
      const supabase = getSupabase()
      if (!supabase) return

      // Set up real-time subscription for high scores
      const channel = supabase
        .channel('high_scores_changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'high_scores' },
          () => {
            fetchHighScores()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return {
    highScores,
    loading,
    submitting,
    submitScore,
    isHighScore,
    refreshHighScores: fetchHighScores
  }
} 