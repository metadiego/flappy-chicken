import { getSupabase } from '@/lib/supabase'
import type { GameState } from '@/lib/gameLogic'

export const useGameAnalytics = () => {
  const recordGameAnalytics = async (gameState: GameState) => {
    try {
      const supabase = getSupabase()
      if (!supabase) return

      const gameEndTime = new Date()
      const playTime = gameEndTime.getTime() - gameState.analytics.gameStartTime.getTime()
      
      // Get device and browser info
      const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      const browserInfo = navigator.userAgent

      const { error } = await supabase
        .from('game_analytics')
        .insert([{
          score: gameState.score,
          play_time_ms: playTime,
          device_type: deviceType,
          browser_info: browserInfo,
          game_start_time: gameState.analytics.gameStartTime.toISOString(),
          game_end_time: gameEndTime.toISOString(),
          jumps_count: gameState.analytics.jumpsCount,
          obstacles_passed: gameState.analytics.obstaclesPassed
        }])

      if (error) throw error
    } catch (error) {
      console.error('Error recording game analytics:', error)
    }
  }

  return { recordGameAnalytics }
} 