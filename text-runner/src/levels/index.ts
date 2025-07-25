import type { LevelData } from '@/types/game'
import manchesterData from './manchester.json'

export const LEVELS: Record<string, LevelData> = {
  manchester: manchesterData as LevelData
}

export const LEVEL_ORDER: string[] = [
  'manchester'
  // Add more levels here as you create them
]

export function getLevelByName(levelName: string): LevelData | null {
  return LEVELS[levelName] || null
}

export function getLevelByIndex(index: number): LevelData | null {
  const levelName = LEVEL_ORDER[index - 1] // Convert 1-based to 0-based
  return getLevelByName(levelName)
}