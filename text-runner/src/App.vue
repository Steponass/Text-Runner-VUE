<template>
  <div id="app">
    <GameCanvas />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { getLevelByName } from '@/levels'
import GameCanvas from '@/components/GameCanvas.vue'

// Initialize the game
const gameStore = useGameStore()

// Auto-load the first level when app starts
onMounted(async () => {
  const levelData = getLevelByName('manchester')
  if (levelData) {
    await gameStore.initializeLevel(levelData)
  }
})
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
