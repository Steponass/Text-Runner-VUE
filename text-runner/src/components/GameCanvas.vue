<template>
  <div class="game-canvas">
    <!-- Game HUD -->
    <div class="game-hud">
      <div class="hud-item">
        <span class="hud-label">Lives:</span>
        <span class="hud-value">{{ gameStore.displayLives }}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">Score:</span>
        <span class="hud-value">{{ gameStore.score }}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">Progress:</span>
        <span class="hud-value">{{ gameStore.completionPercentage }}%</span>
      </div>
    </div>

    <!-- Main Game Area -->
    <div class="game-area">
      <!-- Avatar (fixed position) -->
      <div class="avatar" :style="avatarStyles">
        <div class="avatar-silhouette"></div>
      </div>

      <!-- Moving Platform -->
      <div class="platform-container">
        <div
          class="platform"
          :style="platformStyles"
        >
          <!-- Render word bricks in chunks for performance -->
          <BrickChunk
            v-for="chunkIndex in visibleChunks"
            :key="`chunk-${chunkIndex}`"
            :words="getChunkWords(chunkIndex)"
            :start-index="chunkIndex * chunkSize"
            :gaps="gameStore.currentLevelData?.gaps || []"
            :current-word-index="getCurrentWordIndex()"
          />
        </div>
      </div>

      <!-- Platform Ground Line -->
      <div class="platform-ground"></div>
    </div>

    <!-- Quiz Interface (appears when quiz is active) -->
    <QuizInterface />

    <!-- Debug Info (development only) -->
    <div v-if="showDebugInfo" class="debug-info">
      <p>Platform Offset: {{ Math.round(platformOffset) }}px</p>
      <p>Current Word: {{ getCurrentWordIndex() }}</p>
      <p>Speed: {{ animationSpeed }}px/frame</p>
      <p>Next Gap: {{ getNextGapIndex() }}</p>
      <p>Quiz Active: {{ gameStore.activeQuiz ? 'Yes' : 'No' }}</p>
      <p>Quiz Mode: {{ collisionDetection?.isQuizMode ? 'Yes' : 'No' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameAnimation } from '@/composables/useGameAnimation'
import { useCollisionDetection } from '@/composables/useCollisionDetection'
import BrickChunk from './BrickChunk.vue'
import QuizInterface from './QuizInterface.vue'

// Props
interface GameCanvasProps {
  showDebugInfo?: boolean
}

withDefaults(defineProps<GameCanvasProps>(), {
  showDebugInfo: false
})

// Stores and composables
const gameStore = useGameStore()
const {
  platformOffset,
  animationSpeed,
  getCurrentWordIndex
} = useGameAnimation()

// Initialize collision detection (this starts the gap detection system)
const collisionDetection = useCollisionDetection()

// Constants for performance optimization
const chunkSize = 25 // Words per chunk
const visibleChunkBuffer = 2 // Extra chunks to render on each side

// Avatar styles (fixed position)
const avatarStyles = computed(() => ({
  left: `200px`, // var(--avatar-position) = 200px
  transform: 'translateX(-50%)'
}))

// Platform styles (moving)
const platformStyles = computed(() => ({
  transform: `translateX(${platformOffset.value}px)`,
  willChange: 'transform'
}))

// Calculate which chunks are visible
const visibleChunks = computed(() => {
  if (!gameStore.currentLevelData) return []

  const totalWords = gameStore.currentLevelData.totalWords
  const totalChunks = Math.ceil(totalWords / chunkSize)

  // Calculate which chunk the avatar is currently viewing
  const currentWordIndex = getCurrentWordIndex()
  const currentChunk = Math.floor(currentWordIndex / chunkSize)

  // Render current chunk plus buffer chunks on each side
  const startChunk = Math.max(0, currentChunk - visibleChunkBuffer)
  const endChunk = Math.min(totalChunks - 1, currentChunk + visibleChunkBuffer)

  const chunks: number[] = []
  for (let i = startChunk; i <= endChunk; i++) {
    chunks.push(i)
  }

  return chunks
})

// Get words for a specific chunk
const getChunkWords = (chunkIndex: number): string[] => {
  if (!gameStore.currentLevelData) return []

  const startIndex = chunkIndex * chunkSize
  const endIndex = Math.min(
    startIndex + chunkSize,
    gameStore.currentLevelData.totalWords
  )

  return gameStore.currentLevelData.words.slice(startIndex, endIndex)
}

// Get the index of the next gap
const getNextGapIndex = (): number | null => {
  if (!gameStore.currentLevelData) return null

  const currentIndex = getCurrentWordIndex()
  const nextGap = gameStore.currentLevelData.gaps.find(
    gapIndex => gapIndex > currentIndex
  )

  return nextGap ?? null
}
</script>

<style scoped>
.game-canvas {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(
    to bottom,
    var(--color-gray-100) 0%,
    var(--color-gray-200) 100%
  );
  user-select: none;
}

.game-hud {
  position: fixed;
  top: var(--space-16px);
  left: var(--space-16px);
  right: var(--space-16px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-bg-primary);
  border: var(--border-width-2px) solid var(--color-border-medium);
  border-radius: var(--border-radius-8px);
  padding: var(--space-12px) var(--space-16px);
  z-index: 100;
}

.hud-item {
  display: flex;
  align-items: center;
  gap: var(--space-8px);
}

.hud-label {
  font-size: var(--fontsize--1);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.hud-value {
  font-size: var(--fontsize-0);
  color: var(--color-text-primary);
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}

.game-area {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  transition: transform 0.1s ease;
}

.avatar-silhouette {
  width: 32px;
  height: 48px;
  background: var(--color-gray-900);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  position: relative;
}

/* Simple human silhouette shape */
.avatar-silhouette::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: var(--color-gray-900);
  border-radius: 50%;
}

.platform-container {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.platform {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  display: flex;
  align-items: flex-end;
  height: 80px;
  will-change: transform;
}

.platform-ground {
  position: absolute;
  bottom: calc(50% - 60px);
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-gray-600);
  z-index: 1;
}

.debug-info {
  position: fixed;
  bottom: var(--space-16px);
  right: var(--space-16px);
  background: var(--color-bg-primary);
  border: var(--border-width-1px) solid var(--color-border-medium);
  border-radius: var(--border-radius-4px);
  padding: var(--space-8px) var(--space-12px);
  font-family: monospace;
  font-size: var(--fontsize--1);
  z-index: 100;
  max-width: 200px;
}

.debug-info p {
  margin: var(--space-2px) 0;
  color: var(--color-text-secondary);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .game-hud {
    font-size: var(--fontsize--1);
    padding: var(--space-8px) var(--space-12px);
  }

  .hud-value {
    min-width: 30px;
  }

  .avatar-silhouette {
    width: 28px;
    height: 42px;
  }

  .debug-info {
    bottom: var(--space-8px);
    right: var(--space-8px);
    font-size: calc(var(--fontsize--1) * 0.9);
  }
}

/* Ensure quiz interface appears above everything else */
:deep(.quiz-interface) {
  z-index: 200;
}
</style>
