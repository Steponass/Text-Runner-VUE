<template>
  <div
    v-if="isQuizVisible"
    class="quiz-interface"
    @touchstart="preventScrolling"
    @touchmove="preventScrolling"
  >
    <!-- Quiz Context -->
    <div class="quiz-context">
      <h3 class="quiz-prompt">Fill in the missing word:</h3>
      <div class="context-sentence">
        <span class="context-before">{{ contextBefore }}</span>
        <span class="missing-word">___</span>
        <span class="context-after">{{ contextAfter }}</span>
      </div>
    </div>

    <!-- Answer Options -->
    <div class="options-grid">
      <button
        v-for="(option, index) in quizOptions"
        :key="`option-${index}`"
        :class="getOptionClasses(index)"
        :disabled="hasAnswered && selectedOptionIndex !== index"
        @click="handleOptionSelect(option, index)"
        @touchstart="triggerHapticFeedback"
      >
        {{ option }}
      </button>
    </div>

    <!-- Feedback Message -->
    <div v-if="feedbackMessage" class="feedback-message" :class="feedbackType">
      {{ feedbackMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useCollisionDetection } from '@/composables/useCollisionDetection'

// Stores and composables
const gameStore = useGameStore()
const collisionDetection = useCollisionDetection()

// Component state
const hasAnswered = ref(false)
const selectedOptionIndex = ref<number | null>(null)
const feedbackMessage = ref('')
const feedbackType = ref<'correct' | 'incorrect' | ''>('')
const feedbackTimeout = ref<number | null>(null)

// Quiz visibility
const isQuizVisible = computed(() => {
  return gameStore.activeQuiz !== null && collisionDetection.isQuizMode
})

// Quiz data
const quizOptions = computed(() => {
  return gameStore.activeQuiz?.options || []
})

const contextBefore = computed(() => {
  return gameStore.activeQuiz?.contextBefore || ''
})

const contextAfter = computed(() => {
  return gameStore.activeQuiz?.contextAfter || ''
})

const correctAnswer = computed(() => {
  return gameStore.activeQuiz?.correctWord || ''
})

// Get CSS classes for option buttons
const getOptionClasses = (index: number) => {
  return [
    'option-button',
    {
      'option-button--selected': selectedOptionIndex.value === index && hasAnswered.value,
      'option-button--correct': hasAnswered.value &&
                                selectedOptionIndex.value === index &&
                                feedbackType.value === 'correct',
      'option-button--incorrect': hasAnswered.value &&
                                  selectedOptionIndex.value === index &&
                                  feedbackType.value === 'incorrect',
      'option-button--disabled': hasAnswered.value && selectedOptionIndex.value !== index
    }
  ]
}

// Handle option selection
const handleOptionSelect = (selectedOption: string, optionIndex: number) => {
  if (hasAnswered.value) return

  hasAnswered.value = true
  selectedOptionIndex.value = optionIndex

  const isCorrect = selectedOption === correctAnswer.value

  if (isCorrect) {
    feedbackType.value = 'correct'
    feedbackMessage.value = 'Correct! Well done!'

    // Handle correct answer after short delay
    setTimeout(() => {
      collisionDetection.handleCorrectAnswer()
      resetQuizState()
    }, 1000)

  } else {
    feedbackType.value = 'incorrect'
    feedbackMessage.value = `Incorrect. The answer was "${correctAnswer.value}". Try again!`

    // Handle incorrect answer
    collisionDetection.handleIncorrectAnswer()

    // Reset for retry after delay
    setTimeout(() => {
      resetQuizState()
    }, 2000)
  }

  // Clear feedback after delay
  if (feedbackTimeout.value) {
    clearTimeout(feedbackTimeout.value)
  }
  feedbackTimeout.value = setTimeout(() => {
    feedbackMessage.value = ''
    feedbackType.value = ''
  }, 3000)
}

// Reset quiz state for new question
const resetQuizState = () => {
  hasAnswered.value = false
  selectedOptionIndex.value = null
  feedbackMessage.value = ''
  feedbackType.value = ''

  if (feedbackTimeout.value) {
    clearTimeout(feedbackTimeout.value)
    feedbackTimeout.value = null
  }
}

// Trigger haptic feedback (mobile)
const triggerHapticFeedback = () => {
  if ('vibrate' in navigator && gameStore.userProfile.settings.hapticFeedback) {
    navigator.vibrate(50) // 50ms vibration
  }
}

// Prevent scrolling during quiz interaction
const preventScrolling = (event: TouchEvent) => {
  event.preventDefault()
}

// Watch for new quiz questions
watch(
  () => gameStore.activeQuiz,
  (newQuiz) => {
    if (newQuiz) {
      resetQuizState()
    }
  },
  { immediate: true }
)

// Cleanup timeout on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (feedbackTimeout.value) {
    clearTimeout(feedbackTimeout.value)
  }
})
</script>

<style scoped>
.quiz-interface {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-primary);
  border-top: var(--border-width-2px) solid var(--color-border-medium);
  border-radius: var(--border-radius-12px) var(--border-radius-12px) 0 0;
  padding: var(--space-20px) var(--space-16px) var(--space-24px);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 200;
  user-select: none;
  transform: translateY(0);
  transition: transform 0.3s ease-out;
}

.quiz-context {
  text-align: center;
  margin-bottom: var(--space-20px);
}

.quiz-prompt {
  font-size: var(--fontsize-0);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-12px);
}

.context-sentence {
  font-size: var(--fontsize-1);
  line-height: 1.4;
  color: var(--color-text-secondary);
  max-width: 500px;
  margin: 0 auto;
  word-spacing: 0.1em;
}

.context-before,
.context-after {
  color: var(--color-text-primary);
}

.missing-word {
  display: inline-block;
  background: var(--color-gray-200);
  border-bottom: var(--border-width-2px) dashed var(--color-gray-600);
  padding: var(--space-4px) var(--space-12px);
  margin: 0 var(--space-8px);
  font-weight: 600;
  color: var(--color-gray-600);
  border-radius: var(--border-radius-4px);
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12px);
  max-width: 480px;
  margin: 0 auto;
}

.option-button {
  min-height: var(--touch-target);
  padding: var(--space-12px) var(--space-16px);
  font-size: var(--fontsize-0);
  font-weight: 500;
  background: var(--color-bg-primary);
  border: var(--border-width-2px) solid var(--color-border-medium);
  border-radius: var(--border-radius-8px);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
  word-wrap: break-word;
  hyphens: auto;
}

.option-button:hover {
  background: var(--color-hover);
  border-color: var(--color-gray-600);
  transform: translateY(-1px);
}

.option-button:active {
  background: var(--color-pressed);
  transform: translateY(0);
}

.option-button--selected {
  font-weight: 600;
}

.option-button--correct {
  background: var(--color-gray-200);
  border-color: var(--color-gray-700);
  color: var(--color-gray-900);
}

.option-button--incorrect {
  background: var(--color-gray-100);
  border-color: var(--color-gray-500);
  color: var(--color-gray-600);
}

.option-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.option-button:disabled {
  pointer-events: none;
}

.feedback-message {
  text-align: center;
  margin-top: var(--space-16px);
  font-size: var(--fontsize--1);
  font-weight: 500;
  padding: var(--space-8px) var(--space-16px);
  border-radius: var(--border-radius-8px);
  transition: all 0.3s ease;
}

.feedback-message.correct {
  background: var(--color-gray-200);
  color: var(--color-gray-900);
  border: var(--border-width-1px) solid var(--color-gray-600);
}

.feedback-message.incorrect {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border: var(--border-width-1px) solid var(--color-gray-400);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .quiz-interface {
    padding: var(--space-16px) var(--space-12px) var(--space-20px);
  }

  .options-grid {
    grid-template-columns: 1fr;
    gap: var(--space-8px);
  }

  .option-button {
    min-height: 48px; /* Ensure good touch target on mobile */
    font-size: var(--fontsize--1);
  }

  .context-sentence {
    font-size: var(--fontsize-0);
  }

  .quiz-prompt {
    font-size: var(--fontsize--1);
  }
}

/* Animation for quiz appearance */
.quiz-interface {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Prevent text selection during quiz */
.quiz-interface * {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
</style>
