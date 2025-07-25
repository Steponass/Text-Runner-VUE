<template>
  <div id="app">
    <h1>Text Runner - Animation Test</h1>
    <div class="game-info">
      <p>Lives: {{ gameStore.displayLives }}</p>
      <p>Score: {{ gameStore.score }}</p>
      <p>Status: {{ gameStore.gameStatus }}</p>
      <p>Level: {{ gameStore.currentLevel }}</p>
    </div>
    
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
      
      <div class="animation-info">
        <p>Platform Offset: {{ Math.round(platformOffset) }}px</p>
        <p>Current Word Index: {{ getCurrentWordIndex() }}</p>
        <p>Animation Running: {{ isAnimating ? 'Yes' : 'No' }}</p>
        <p>Approaching Gap: {{ isApproachingGap() ? 'Yes' : 'No' }}</p>
         <p>Pixels Per Word: {{ Math.round(getPixelsPerWord()) }}px</p>
  <p>Total Distance: {{ Math.round(200 + Math.abs(platformOffset)) }}px</p>
  <p>Gap Positions: {{ gameStore.currentLevelData?.gaps.slice(0, 5).join(', ') }}</p>
      </div>
    </div>
    
    <div v-if="gameStore.currentLevelData" class="level-info">
      <h3>Level Data:</h3>
      <p>Total Words: {{ gameStore.currentLevelData.totalWords }}</p>
      <p>Total Gaps: {{ gameStore.currentLevelData.totalGaps }}</p>
      <p>Progress: {{ gameStore.completionPercentage }}%</p>
      
      <div class="words-preview">
        <h4>Platform Preview (first 15 words):</h4>
        <div class="platform-container">
          <!-- Avatar representation (fixed position) -->
          <div class="avatar-demo">👤</div>
          
          <!-- Moving platform -->
          <div class="platform-demo" :style="{ transform: `translateX(${platformOffset}px)` }">
            <span 
              v-for="(word, index) in gameStore.currentLevelData.words.slice(0, 15)" 
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { useGameAnimation } from '@/composables/useGameAnimation'
import { getLevelByName } from '@/levels'

const gameStore = useGameStore()

// Destructure the animation composable to unwrap refs
const {
  platformOffset,
  isAnimating,
  animationSpeed,
  startAnimation,
  stopAnimation,
  pauseAnimation,
  resumeAnimation,
  resetAnimation,
  setAnimationSpeed,
  getAnimationProgress,
  getCurrentWordIndex,
  isApproachingGap,
  getPixelsPerWord
} = useGameAnimation()

const loadTestLevel = async () => {
  const levelData = getLevelByName('manchester')
  if (levelData) {
    await gameStore.initializeLevel(levelData)
    // Reset animation when loading new level
    resetAnimation()
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-24px);
  gap: var(--space-16px);
}

h1 {
  font-size: var(--fontsize-3);
}

.game-info {
  background: var(--color-bg-secondary);
  padding: var(--space-16px);
  border-radius: var(--border-radius-8px);
  min-width: 200px;
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

.animation-info {
  background: var(--color-bg-primary);
  padding: var(--space-12px);
  border-radius: var(--border-radius-4px);
  border: var(--border-width-1px) solid var(--color-border-light);
}

.animation-info p {
  margin: var(--space-4px) 0;
  font-size: var(--fontsize--1);
  font-family: monospace;
}

.level-info {
  background: var(--color-bg-secondary);
  padding: var(--space-16px);
  border-radius: var(--border-radius-8px);
  max-width: 800px;
}

.level-info h3 {
  margin-bottom: var(--space-12px);
  font-size: var(--fontsize-1);
}

.level-info p {
  margin: var(--space-4px) 0;
  font-size: var(--fontsize--1);
}

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
}

.word-brick--gap {
  background: transparent;
  border-style: dashed;
  color: var(--color-text-secondary);
}

.word-brick--current {
  background: var(--color-gray-300);
  border-color: var(--color-gray-600);
}
</style>