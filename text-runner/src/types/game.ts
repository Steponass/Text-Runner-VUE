export interface LevelData {
  cityName: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  text: string
  gapFrequency: number
  metadata: {
    wordCount: number
    estimatedTime: string
    focusAreas: string[]
  }
}

export interface ProcessedLevelData {
  words: string[]
  gaps: number[]
  totalWords: number
  totalGaps: number
}

export interface QuizData {
  gapIndex: number
  correctWord: string
  options: string[]
  contextBefore: string
  contextAfter: string
}

export type GameStatus = 'menu' | 'loading' | 'playing' | 'paused' | 'complete' | 'gameOver'

export interface LevelProgress {
  totalWords: number
  currentWordIndex: number
  gapsCompleted: number
  totalGaps: number
}