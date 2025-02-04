import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const {
      score,
      playTime,
      deviceType,
      browserInfo,
      gameStartTime,
      gameEndTime,
      jumps,
      obstacles
    } = await request.json()

    await sql`
      INSERT INTO game_analytics (
        score,
        play_time_ms,
        device_type,
        browser_info,
        game_start_time,
        game_end_time,
        jumps_count,
        obstacles_passed,
        created_at
      ) VALUES (
        ${score},
        ${playTime},
        ${deviceType},
        ${browserInfo},
        ${gameStartTime},
        ${gameEndTime},
        ${jumps},
        ${obstacles},
        NOW()
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording analytics:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 