import { getSupabase } from '@/lib/supabase'
import type { GameState } from '@/lib/gameLogic'

const DEVICE_ID_KEY = 'flappy_chicken_device_id'

// Function to generate a random device ID
const generateDeviceId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Function to get or create device ID
const getDeviceId = () => {
  if (typeof window === 'undefined') return null
  
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  return deviceId
}

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
      const deviceId = getDeviceId()

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
          obstacles_passed: gameState.analytics.obstaclesPassed,
          device_id: deviceId  // Add device ID to analytics
        }])

      if (error) throw error
    } catch (error) {
      console.error('Error recording game analytics:', error)
    }
  }

  return { recordGameAnalytics }
} 