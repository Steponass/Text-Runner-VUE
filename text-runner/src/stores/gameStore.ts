import { defineStore } from 'pinia'
import type {
  LevelData,
  ProcessedLevelData,
  QuizData,
  GameStatus,
  LevelProgress,
} from '@/types/game'
import { useQuizGeneration } from '@/composables/useQuizGeneration'

interface UserProfile {
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced'
  completedLevels: string[]
  settings: {
    hapticFeedback: boolean
    soundEffects: boolean
  }
}

interface GameState {
  lives: number
  score: number
  currentLevel: number
  gameStatus: GameStatus

  currentLevelData: ProcessedLevelData | null
  levelProgress: LevelProgress

  // Animation state
  platformOffset: number
  isAnimating: boolean

  activeQuiz: QuizData | null

  userProfile: UserProfile
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    lives: 5,
    score: 0,
    currentLevel: 1,
    gameStatus: 'menu',

    currentLevelData: null,
    levelProgress: {
      totalWords: 0,
      currentWordIndex: 0,
      gapsCompleted: 0,
      totalGaps: 0,
    },

    platformOffset: 0,
    isAnimating: false,

    activeQuiz: null,

    userProfile: {
      preferredDifficulty: 'intermediate',
      completedLevels: [],
      settings: {
        hapticFeedback: true,
        soundEffects: true,
      },
    },
  }),

  getters: {
    // Calculate completion percentage for progress bar
    completionPercentage: (state): number => {
      if (!state.levelProgress.totalWords) return 0
      return Math.round(
        (state.levelProgress.currentWordIndex / state.levelProgress.totalWords) * 100,
      )
    },

    isGameOver: (state): boolean => {
      return state.lives <= 0
    },

    isLevelComplete: (state): boolean => {
      return state.levelProgress.gapsCompleted === state.levelProgress.totalGaps
    },

    // Format lives for display (handle half lives)
    displayLives: (state): string => {
      return state.lives % 1 === 0 ? state.lives.toString() : state.lives.toFixed(1)
    },
  },

  actions: {
    async initializeLevel(levelData: LevelData): Promise<void> {
      try {
        this.gameStatus = 'loading'

        // Process the level text into words and gaps
        const words = this.processLevelText(levelData.text)
        const gaps = this.calculateGaps(words, levelData.gapFrequency)

        this.currentLevelData = {
          words,
          gaps,
          totalWords: words.length,
          totalGaps: gaps.length,
        }

        this.levelProgress = {
          totalWords: words.length,
          currentWordIndex: 0,
          gapsCompleted: 0,
          totalGaps: gaps.length,
        }

        // Reset animation state
        // Start platform at 200px so word 0 is under avatar
        this.platformOffset = 200
        this.isAnimating = false
        this.activeQuiz = null

        this.gameStatus = 'playing'
      } catch (error) {
        console.error('Failed to initialize level:', error)
        this.gameStatus = 'menu'
      }
    },

    // Process level text into individual words
    processLevelText(text: string): string[] {
      return text
        .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
        .split(/\s+/) // Split on whitespace
        .filter((word) => word.length > 0) // Remove empty strings
    },

    // Calculate which word indices should be gaps
    calculateGaps(words: string[], frequency: number = 6): number[] {
      const gaps: number[] = []
      for (let i = frequency - 1; i < words.length; i += frequency) {
        gaps.push(i)
      }
      return gaps
    },

    // Lose life with specified amount
    loseLife(amount: number = 0.5): void {
      this.lives = Math.max(0, this.lives - amount)

      if (this.lives <= 0) {
        this.gameStatus = 'gameOver'
        this.isAnimating = false
      }
    },

    addScore(points: number): void {
      this.score += points
    },

    fillGap(gapIndex: number): void {
      this.levelProgress.gapsCompleted += 1
      this.activeQuiz = null

      // Mark this specific gap as filled (you might want to track this)
      console.log(`Gap ${gapIndex} has been filled`)
      this.addScore(10)

      if (this.isLevelComplete) {
        this.gameStatus = 'complete'
        this.isAnimating = false
        // Bonus points for completion
        this.addScore(this.lives * 20)
      }
    },

    // Trigger quiz for a specific gap
    triggerQuiz(gapIndex: number): void {
      if (!this.currentLevelData) return

      const correctWord = this.currentLevelData.words[gapIndex]
      const contextBefore = this.getContextBefore(gapIndex)
      const contextAfter = this.getContextAfter(gapIndex)

      // Generate quiz options
      const { generateQuizOptions } = useQuizGeneration()
      const options = generateQuizOptions(correctWord)

      this.activeQuiz = {
        gapIndex,
        correctWord,
        options,
        contextBefore,
        contextAfter,
      }

      // Pause animation during quiz
      this.isAnimating = false
    },

    // Get context words before the gap
    getContextBefore(gapIndex: number): string {
      if (!this.currentLevelData) return ''

      const words = this.currentLevelData.words
      const startIndex = Math.max(0, gapIndex - 3)
      return words.slice(startIndex, gapIndex).join(' ')
    },

    // Get context words after the gap
    getContextAfter(gapIndex: number): string {
      if (!this.currentLevelData) return ''

      const words = this.currentLevelData.words
      const endIndex = Math.min(words.length, gapIndex + 4)
      return words.slice(gapIndex + 1, endIndex).join(' ')
    },

    // Start & Stop platform animation
    startAnimation(): void {
      this.isAnimating = true
    },

    stopAnimation(): void {
      this.isAnimating = false
    },

    // Update platform offset (called by animation composable)
    updatePlatformOffset(offset: number): void {
      this.platformOffset = offset
    },

    // Reset game to initial state
    resetGame(): void {
      this.lives = 5
      this.score = 0
      this.currentLevel = 1
      this.gameStatus = 'menu'
      this.currentLevelData = null
      this.platformOffset = 0
      this.isAnimating = false
      this.activeQuiz = null
      this.levelProgress = {
        totalWords: 0,
        currentWordIndex: 0,
        gapsCompleted: 0,
        totalGaps: 0,
      }
    },

    nextLevel(): void {
      this.currentLevel += 1
      // Level loading will be handled by level loader composable
    },
  },
})
