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
  const currentGapToProcess = ref(0)

  // Distance settings
  const quizTriggerDistance = ref(3) // Show quiz when gap is 3 words away
  const fallThroughDistance = ref(1) // Fall through if within 1 word of gap

  // Get next unprocessed gap
  const getNextGap = (): number | null => {
    if (!gameStore.currentLevelData) return null

    const gaps = gameStore.currentLevelData.gaps
    if (currentGapToProcess.value >= gaps.length) return null

    return gaps[currentGapToProcess.value]
  }

  // Check if player is approaching a gap (within trigger distance)
  const isApproachingGap = (): boolean => {
    const currentWordIndex = getCurrentWordIndex()
    const nextGapIndex = getNextGap()

    if (nextGapIndex === null) return false

    // Check if gap is within trigger distance
    const distanceToGap = nextGapIndex - currentWordIndex
    return distanceToGap <= quizTriggerDistance.value && distanceToGap > 0
  }

  // Check if player is too close to gap without answering correctly
  const isTooCloseToGap = (): boolean => {
    const currentWordIndex = getCurrentWordIndex()
    const activeGapIndex = activeQuizGapIndex.value

    if (activeGapIndex === null) return false

    // Check if player is within fall-through distance
    const distanceToGap = activeGapIndex - currentWordIndex
    return distanceToGap <= fallThroughDistance.value
  }

  // Start quiz for approaching gap
  const startQuiz = () => {
    const nextGapIndex = getNextGap()
    if (nextGapIndex === null || isQuizMode.value) return

    isQuizMode.value = true
    activeQuizGapIndex.value = nextGapIndex
    setAnimationSpeed(quizModeSpeed.value) // Slow down for quiz

    gameStore.triggerQuiz(nextGapIndex)

    console.log(`Quiz started for gap at index ${nextGapIndex}, player at ${getCurrentWordIndex()}`)
  }

  // Exit quiz mode after correct answer
  const exitQuizMode = () => {
    if (!isQuizMode.value) return

    isQuizMode.value = false
    activeQuizGapIndex.value = null
    setAnimationSpeed(originalSpeed.value) // Restore normal speed

    gameStore.activeQuiz = null

    // Move to next gap
    currentGapToProcess.value++

    console.log(`Quiz completed. Moving to next gap: ${currentGapToProcess.value}`)
  }

  // Handle gap collision (player fell through)
  const handleGapCollision = (): boolean => {
    // const currentWordIndex = getCurrentWordIndex()
    const activeGapIndex = activeQuizGapIndex.value

    // If player got too close to gap without answering correctly
    if (activeGapIndex !== null && isTooCloseToGap() && isQuizMode.value) {
      stopAnimation()
      gameStore.loseLife(1)

      console.log(`Player fell through gap at index ${activeGapIndex}!`)

      // Reset quiz mode and move to next gap
      isQuizMode.value = false
      activeQuizGapIndex.value = null
      currentGapToProcess.value++
      setAnimationSpeed(originalSpeed.value)

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
    console.log('Incorrect answer! Player loses 0.5 life but quiz stays active.')
    // Keep quiz active - player must answer correctly to continue
  }

  // Reset for new level
  const resetDetection = () => {
    isQuizMode.value = false
    activeQuizGapIndex.value = null
    currentGapToProcess.value = 0
    setAnimationSpeed(originalSpeed.value)
  }

  // Main detection logic
  watch(
    [() => getCurrentWordIndex(), isAnimating],
    () => {
      if (!isAnimating.value || !gameStore.currentLevelData) {
        return
      }

      // Start quiz when approaching a gap
      if (!isQuizMode.value && isApproachingGap()) {
        startQuiz()
      }

      // Check for gap collision during quiz mode
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
    gapQueueDisplay: `Gap ${currentGapToProcess.value + 1} of ${gameStore.currentLevelData?.gaps.length || 0}`,
    gapsInViewportDisplay: `Next: ${getNextGap() || 'None'} (Distance: ${getNextGap() ? getNextGap()! - getCurrentWordIndex() : 'N/A'})`,

    // Methods
    handleCorrectAnswer,
    handleIncorrectAnswer,
    resetDetection,

    // Settings (for potential adjustment)
    quizTriggerDistance,
    fallThroughDistance
  }
}
