<template>
  <div id="app">
    <!-- Development Mode Toggle -->
    <div class="dev-header">
      <h1>Text Runner - Development Mode</h1>
      <button @click="toggleGameMode" class="mode-toggle">
        {{ isGameMode ? 'Switch to Dev View' : 'Switch to Game View' }}
      </button>
    </div>

    <!-- Game Mode: Full GameCanvas -->
    <div v-if="isGameMode" class="game-mode">
      <GameCanvas :show-debug-info="showDebugInfo" />

      <!-- Floating Dev Controls for Game Mode -->
      <div class="floating-controls">
        <button @click="loadTestLevel">Load Level</button>
        <button @click="gameStore.resetGame">Reset</button>
        <button @click="toggleDebugInfo">
          {{ showDebugInfo ? 'Hide Debug' : 'Show Debug' }}
        </button>
      </div>
    </div>

    <!-- Development Mode: Controls and Info -->
    <div v-else class="dev-mode">
      <!-- Game Info -->
      <div class="game-info">
        <p>Lives: {{ gameStore.displayLives }}</p>
        <p>Score: {{ gameStore.score }}</p>
        <p>Status: {{ gameStore.gameStatus }}</p>
        <p>Level: {{ gameStore.currentLevel }}</p>
      </div>

      <!-- Main Controls -->
      <div class="controls">
        <button @click="loadTestLevel">Load Test Level</button>
        <button @click="gameStore.resetGame">Reset Game</button>
      </div>

      <!-- Animation Controls -->
      <div v-if="gameStore.currentLevelData" class="animation-controls">
        <h3>Animation Controls:</h3>
        <div class="animation-buttons">
          <button @click="startAnimation" :disabled="isAnimating">
            Start Animation
          </button>
          <button @click="pauseAnimation" :disabled="!isAnimating">
            Pause Animation
          </button>
          <button @click="stopAnimation">
            Stop Animation
          </button>
          <button @click="resetAnimation">
            Reset Position
          </button>
        </div>

        <!-- Animation Info -->
        <div class="animation-info">
          <p>Platform Offset: {{ Math.round(platformOffset) }}px</p>
          <p>Current Word Index: {{ getCurrentWordIndex() }}</p>
          <p>Animation Running: {{ isAnimating ? 'Yes' : 'No' }}</p>
          <p>Approaching Gap: {{ isApproachingGap() ? 'Yes' : 'No' }}</p>
          <p>Pixels Per Word: {{ Math.round(getPixelsPerWord()) }}px</p>
          <p>Total Distance: {{ Math.round(200 + Math.abs(platformOffset)) }}px</p>
          <p>Gap Positions: {{ gameStore.currentLevelData?.gaps.slice(0, 5).join(', ') }}</p>
        </div>

<!-- Collision Detection Info -->
<div v-if="collisionDetection" class="collision-info">
  <h4>Collision Detection:</h4>
  <p>Quiz Mode: {{ collisionDetection.isQuizMode ? 'Yes' : 'No' }}</p>
  <p>Active Quiz Gap: {{ collisionDetection.activeQuizGapIndex || 'None' }}</p>
  <p>Gap Queue: {{ collisionDetection.gapQueueDisplay }}</p>
  <p>Gaps in Viewport: {{ collisionDetection.gapsInViewportDisplay }}</p>
</div>
      </div>

      <!-- Level Info -->
      <div v-if="gameStore.currentLevelData" class="level-info">
        <h3>Level Data:</h3>
        <p>Total Words: {{ gameStore.currentLevelData.totalWords }}</p>
        <p>Total Gaps: {{ gameStore.currentLevelData.totalGaps }}</p>
        <p>Progress: {{ gameStore.completionPercentage }}%</p>

        <!-- GameCanvas Preview -->
        <div class="game-preview">
          <h4>Game Canvas Preview:</h4>
          <div class="preview-container">
            <GameCanvas :show-debug-info="true" />
          </div>
        </div>

<!-- Original Platform Preview (for comparison) -->
<div class="words-preview">
  <h4>Full Level Preview ({{ gameStore.currentLevelData.totalWords }} words):</h4>
  <div class="platform-container">
    <!-- Avatar representation (fixed position) -->
    <div class="avatar-demo">👤</div>

    <!-- Moving platform with ALL words -->
    <div class="platform-demo" :style="{ transform: `translateX(${platformOffset}px)` }">
      <span
        v-for="(word, index) in gameStore.currentLevelData.words"
        :key="index"
        :class="[
          'word-brick',
          { 'word-brick--gap': gameStore.currentLevelData.gaps.includes(index) },
          { 'word-brick--current': index === getCurrentWordIndex() }
        ]"
      >
        {{ gameStore.currentLevelData.gaps.includes(index) ? '___' : word }}
      </span>
    </div>
  </div>

  <!-- Add scroll indicator -->
  <div class="preview-info">
    <p>Current Word: {{ getCurrentWordIndex() }} / {{ gameStore.currentLevelData.totalWords }}</p>
    <p>Platform extends: {{ Math.round(gameStore.currentLevelData.totalWords * getPixelsPerWord()) }}px</p>
    <p>Viewport shows: ~{{ Math.floor(800 / getPixelsPerWord()) }} words at once</p>
  </div>
</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameAnimation } from '@/composables/useGameAnimation'
import { useCollisionDetection } from '@/composables/useCollisionDetection'
import { getLevelByName } from '@/levels'
import GameCanvas from '@/components/GameCanvas.vue'

// Stores and composables
const gameStore = useGameStore()

// Only destructure what we actually use
const {
  platformOffset,
  isAnimating,
  startAnimation,
  stopAnimation,
  pauseAnimation,
  resetAnimation,
  getCurrentWordIndex,
  isApproachingGap,
  getPixelsPerWord
} = useGameAnimation()

// Collision detection (optional - only for dev info)
const collisionDetection = useCollisionDetection()

// Development state
const isGameMode = ref(false)
const showDebugInfo = ref(true)

// Methods
const loadTestLevel = async () => {
  const levelData = getLevelByName('manchester')
  if (levelData) {
    await gameStore.initializeLevel(levelData)
    // Reset animation when loading new level
    resetAnimation()
  }
}

const toggleGameMode = () => {
  isGameMode.value = !isGameMode.value
}

const toggleDebugInfo = () => {
  showDebugInfo.value = !showDebugInfo.value
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  position: relative;
}

/* Development Mode Styles */
.dev-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-24px);
  gap: var(--space-16px);
  min-height: 100vh;
}

.dev-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-primary);
  border-bottom: var(--border-width-2px) solid var(--color-border-medium);
  padding: var(--space-12px) var(--space-16px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}

.dev-header h1 {
  font-size: var(--fontsize-1);
  margin: 0;
}

.mode-toggle {
  padding: var(--space-8px) var(--space-16px);
  background: var(--color-bg-secondary);
  border: var(--border-width-2px) solid var(--color-border-medium);
  border-radius: var(--border-radius-8px);
  font-size: var(--fontsize--1);
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-toggle:hover {
  background: var(--color-hover);
}

/* Game Mode Styles */
.game-mode {
  width: 100%;
  height: 100vh;
  position: relative;
}

.floating-controls {
  position: fixed;
  top: var(--space-16px);
  right: var(--space-16px);
  display: flex;
  flex-direction: column;
  gap: var(--space-8px);
  z-index: 1000;
}

.floating-controls button {
  padding: var(--space-8px) var(--space-12px);
  background: var(--color-bg-primary);
  border: var(--border-width-2px) solid var(--color-border-medium);
  border-radius: var(--border-radius-8px);
  font-size: var(--fontsize--1);
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 100px;
}

.floating-controls button:hover {
  background: var(--color-hover);
}

/* Existing styles for dev mode */
.game-info {
  background: var(--color-bg-secondary);
  padding: var(--space-16px);
  border-radius: var(--border-radius-8px);
  min-width: 200px;
  margin-top: 60px; /* Account for fixed header */
}

.game-info p {
  margin: var(--space-8px) 0;
  font-size: var(--fontsize-0);
}

.controls {
  display: flex;
  gap: var(--space-12px);
}

.controls button,
.animation-buttons button {
  padding: var(--space-12px) var(--space-16px);
  background: var(--color-bg-primary);
  border: var(--border-width-2px) solid var(--color-border-medium);
  border-radius: var(--border-radius-8px);
  font-size: var(--fontsize-0);
  transition: all 0.15s ease;
}

.controls button:hover,
.animation-buttons button:hover {
  background: var(--color-hover);
}

.controls button:active,
.animation-buttons button:active {
  background: var(--color-pressed);
  transform: scale(0.98);
}

.controls button:disabled,
.animation-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.animation-controls {
  background: var(--color-bg-secondary);
  padding: var(--space-16px);
  border-radius: var(--border-radius-8px);
  max-width: 600px;
}

.animation-controls h3 {
  margin-bottom: var(--space-12px);
  font-size: var(--fontsize-1);
}

.animation-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8px);
  margin-bottom: var(--space-16px);
  justify-content: center;
}

.animation-info,
.collision-info {
  background: var(--color-bg-primary);
  padding: var(--space-12px);
  border-radius: var(--border-radius-4px);
  border: var(--border-width-1px) solid var(--color-border-light);
  margin-bottom: var(--space-12px);
}

.animation-info p,
.collision-info p {
  margin: var(--space-4px) 0;
  font-size: var(--fontsize--1);
  font-family: monospace;
}

.collision-info h4 {
  margin-bottom: var(--space-8px);
  font-size: var(--fontsize-0);
}

.level-info {
  background: var(--color-bg-secondary);
  padding: var(--space-16px);
  border-radius: var(--border-radius-8px);
  max-width: 1000px;
}

.level-info h3 {
  margin-bottom: var(--space-12px);
  font-size: var(--fontsize-1);
}

.level-info p {
  margin: var(--space-4px) 0;
  font-size: var(--fontsize--1);
}

/* Game Canvas Preview */
.game-preview {
  margin-top: var(--space-16px);
  text-align: left;
}

.game-preview h4 {
  font-size: var(--fontsize-0);
  margin-bottom: var(--space-12px);
  text-align: center;
}

.preview-container {
  border: var(--border-width-2px) solid var(--color-border-medium);
  border-radius: var(--border-radius-8px);
  overflow: hidden;
  height: 300px;
  position: relative;
}

/* Original preview styles */
.words-preview {
  margin-top: var(--space-16px);
  text-align: left;
}

.words-preview h4 {
  font-size: var(--fontsize-0);
  margin-bottom: var(--space-12px);
  text-align: center;
}

.platform-container {
  position: relative;
  overflow: hidden;
  background: var(--color-gray-100);
  border: var(--border-width-2px) solid var(--color-border-medium);
  border-radius: var(--border-radius-8px);
  height: 120px;
  margin: 0 auto;
  max-width: 100%; /* Ensure it doesn't overflow the container */
}

.avatar-demo {
  position: absolute;
  left: var(--avatar-position);
  top: 20px;
  font-size: 24px;
  z-index: 10;
  transform: translateX(-50%);
}

.platform-demo {
  display: flex;
  align-items: flex-end;
  height: 100%;
  padding-bottom: var(--space-16px);
  transition: transform 0.016s linear;
  will-change: transform;
  /* Now contains all words, will extend far beyond viewport */
}

.word-brick {
  padding: var(--space-8px) var(--space-12px);
  background: var(--color-bg-primary);
  border: var(--border-width-1px) solid var(--color-border-light);
  border-radius: var(--border-radius-4px);
  font-size: var(--fontsize--1);
  min-width: 20px;
  width: fit-content;
  height: fit-content;
  text-align: center;
  margin-right: var(--space-4px);
  white-space: nowrap;
  flex-shrink: 0; /* Prevent words from shrinking */
}


.word-brick--gap {
  background: transparent;
  border-style: dashed;
  color: var(--color-text-secondary);
}

.word-brick--current {
  background: var(--color-gray-300);
  border-color: var(--color-gray-600);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Make current word more visible */
}

/* Preview info section */
.preview-info {
  margin-top: var(--space-8px);
  padding: var(--space-8px);
  background: var(--color-bg-primary);
  border-radius: var(--border-radius-4px);
  font-size: var(--fontsize--1);
  color: var(--color-text-secondary);
}

.preview-info p {
  margin: var(--space-2px) 0;
  font-family: monospace;
}
</style>
