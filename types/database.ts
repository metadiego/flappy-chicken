export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      high_scores: {
        Row: {
          id: string
          player_name: string
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          player_name: string
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          player_name?: string
          score?: number
          created_at?: string
        }
      }
      game_analytics: {
        Row: {
          id: number
          score: number
          play_time_ms: number
          device_type: string
          browser_info: string
          game_start_time: string
          game_end_time: string
          jumps_count: number
          obstacles_passed: number
          created_at: string
        }
        Insert: {
          id?: number
          score: number
          play_time_ms: number
          device_type: string
          browser_info: string
          game_start_time: string
          game_end_time: string
          jumps_count: number
          obstacles_passed: number
          created_at?: string
        }
        Update: {
          id?: number
          score?: number
          play_time_ms?: number
          device_type?: string
          browser_info?: string
          game_start_time?: string
          game_end_time?: string
          jumps_count?: number
          obstacles_passed?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 