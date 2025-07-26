import { ref, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameAnimation } from '@/composables/useGameAnimation'

export function useCollisionDetection() {
  const gameStore = useGameStore()
  const {
    getCurrentWordIndex,
    isAnimating,
    setAnimationSpeed,
    stopAnimation
  } = useGameAnimation()

  // State
  const isQuizMode = ref(false)
  const originalSpeed = ref(0.25)
  const quizModeSpeed = ref(0.125)
  const activeQuizGapIndex = ref<number | null>(null)
  const currentGapToProcess = ref(0) // Which gap we're waiting for next

  // Get next unprocessed gap
  const getNextGap = (): number | null => {
    if (!gameStore.currentLevelData) return null

    const gaps = gameStore.currentLevelData.gaps
    if (currentGapToProcess.value >= gaps.length) return null

    return gaps[currentGapToProcess.value]
  }

  // Check if player reached a gap
  const checkGapReached = (): boolean => {
    const currentWordIndex = getCurrentWordIndex()
    const nextGapIndex = getNextGap()

    if (nextGapIndex === null) return false

    // Player reached the gap position
    return currentWordIndex >= nextGapIndex
  }

  // Start quiz for current gap
  const startQuiz = () => {
    const nextGapIndex = getNextGap()
    if (nextGapIndex === null || isQuizMode.value) return

    isQuizMode.value = true
    activeQuizGapIndex.value = nextGapIndex
    setAnimationSpeed(quizModeSpeed.value) // Slow down 50%

    gameStore.triggerQuiz(nextGapIndex)

    console.log(`Quiz started for gap at index ${nextGapIndex}`)
  }

  // Exit quiz mode
  const exitQuizMode = () => {
    if (!isQuizMode.value) return

    isQuizMode.value = false
    activeQuizGapIndex.value = null
    setAnimationSpeed(originalSpeed.value) // Restore speed

    gameStore.activeQuiz = null

    // Move to next gap
    currentGapToProcess.value++

    console.log(`Quiz completed. Next gap: ${currentGapToProcess.value}`)
  }

  // Handle gap collision (player fell through)
  const handleGapCollision = (): boolean => {
    const currentWordIndex = getCurrentWordIndex()
    const activeGapIndex = activeQuizGapIndex.value

    // If player reached an active gap without answering correctly
    if (activeGapIndex !== null && currentWordIndex >= activeGapIndex && isQuizMode.value) {
      stopAnimation()
      gameStore.loseLife(1)

      // Reset quiz mode
      isQuizMode.value = false
      activeQuizGapIndex.value = null

      console.log('Player fell through gap!')
      return true
    }

    return false
  }

  // Handle correct quiz answer
  const handleCorrectAnswer = () => {
    if (!activeQuizGapIndex.value) return

    gameStore.fillGap(activeQuizGapIndex.value)
    console.log(`Gap ${activeQuizGapIndex.value} filled correctly!`)

    exitQuizMode()
  }

  // Handle incorrect quiz answer
  const handleIncorrectAnswer = () => {
    gameStore.loseLife(0.5)
    console.log('Incorrect answer! Try again.')
    // Keep quiz active - player must answer correctly
  }

  // Reset for new level
  const resetDetection = () => {
    isQuizMode.value = false
    activeQuizGapIndex.value = null
    currentGapToProcess.value = 0
    setAnimationSpeed(originalSpeed.value)
  }

  // Main detection logic - much simpler!
  watch(
    [() => getCurrentWordIndex(), isAnimating],
    () => {
      if (!isAnimating.value || !gameStore.currentLevelData) {
        // Reset when not animating
        if (!isAnimating.value) {
          resetDetection()
        }
        return
      }

      // Check if player reached next gap
      if (!isQuizMode.value && checkGapReached()) {
        startQuiz()
      }

      // Check if player fell through gap
      if (isQuizMode.value) {
        handleGapCollision()
      }
    },
    { immediate: true }
  )

  return {
    // State
    isQuizMode,
    activeQuizGapIndex,
    currentGapToProcess,

    // Debug info
    gapQueueDisplay: 'Not used - simplified',
    gapsInViewportDisplay: `Next gap: ${getNextGap() || 'None'}`,

    // Methods
    handleCorrectAnswer,
    handleIncorrectAnswer,
    resetDetection
  }
}
