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
        <div class="platform" :style="platformStyles">
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

    </div>

    <!-- Quiz Interface -->
    <QuizInterface />

    <!-- Game Start Button (when not playing) -->
    <div v-if="gameStore.gameStatus !== 'playing'" class="game-overlay">
      <div class="start-screen">
        <h1>Text Runner</h1>
        <p>Fill in the missing words to help your character cross safely!</p>
        <button @click="startGame" class="start-button">
          {{ gameStore.gameStatus === 'menu' ? 'Start Game' : 'Continue' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameAnimation } from '@/composables/useGameAnimation'
import { useCollisionDetection } from '@/composables/useCollisionDetection'
import BrickChunk from './BrickChunk.vue'
import QuizInterface from './QuizInterface.vue'

// Stores and composables
const gameStore = useGameStore()
const { platformOffset, getCurrentWordIndex, startAnimation, resetAnimation } = useGameAnimation()

// Initialize collision detection
useCollisionDetection()

// Constants for performance optimization
const chunkSize = 25
const visibleChunkBuffer = 2

// Avatar styles (fixed position)
const avatarStyles = computed(() => ({
  left: `200px`,
  transform: 'translateX(-50%)'
}))

// Platform styles (moving)
const platformStyles = computed(() => ({
  transform: `translateX(${platformOffset.value}px)`,
  willChange: 'transform'
}))

// Calculate visible chunks for performance
const visibleChunks = computed(() => {
  if (!gameStore.currentLevelData) return []

  const totalWords = gameStore.currentLevelData.totalWords
  const totalChunks = Math.ceil(totalWords / chunkSize)
  const currentWordIndex = getCurrentWordIndex()
  const currentChunk = Math.floor(currentWordIndex / chunkSize)
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
  const endIndex = Math.min(startIndex + chunkSize, gameStore.currentLevelData.totalWords)
  return gameStore.currentLevelData.words.slice(startIndex, endIndex)
}

// Start the game
const startGame = () => {
  if (gameStore.gameStatus === 'menu' || gameStore.gameStatus === 'complete') {
    resetAnimation()
    gameStore.gameStatus = 'playing'
  }
  startAnimation()
}

// Auto-start when level is loaded
onMounted(() => {
  if (gameStore.currentLevelData && gameStore.gameStatus === 'playing') {
    startAnimation()
  }
})
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
  height: 220px;
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

.game-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.start-screen {
  background: var(--color-bg-primary);
  padding: var(--space-32px);
  border-radius: var(--border-radius-16px);
  text-align: center;
  max-width: 400px;
  margin: var(--space-16px);
}

.start-screen h1 {
  font-size: var(--fontsize-3);
  margin-bottom: var(--space-16px);
  color: var(--color-text-primary);
}

.start-screen p {
  font-size: var(--fontsize-0);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-24px);
  line-height: 1.5;
}

.start-button {
  padding: var(--space-16px) var(--space-32px);
  background: var(--color-gray-900);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-8px);
  font-size: var(--fontsize-0);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.start-button:hover {
  background: var(--color-gray-800);
  transform: translateY(-2px);
}

.start-button:active {
  transform: translateY(0);
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

  .start-screen {
    padding: var(--space-24px);
    margin: var(--space-12px);
  }

  .start-screen h1 {
    font-size: var(--fontsize-2);
  }
}
</style>
