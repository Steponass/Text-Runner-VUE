<template>
  <div class="brick-chunk">
    <div
      v-for="(word, index) in words"
      :key="startIndex + index"
      :class="getBrickClasses(startIndex + index)"
    >
      <span v-if="!isGap(startIndex + index)" class="brick-text">
        {{ word }}
      </span>
      <span v-else class="brick-gap-indicator">
        <!-- Empty gap - no text -->
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface BrickChunkProps {
  words: string[]
  startIndex: number
  gaps: number[]
  currentWordIndex: number
}

const props = defineProps<BrickChunkProps>()

// Check if a word index is a gap
const isGap = (wordIndex: number): boolean => {
  return props.gaps.includes(wordIndex)
}

// Check if a word index is the current word (under avatar)
const isCurrentWord = (wordIndex: number): boolean => {
  return wordIndex === props.currentWordIndex
}

// Get CSS classes for a brick
const getBrickClasses = (wordIndex: number) => {
  return [
    'word-brick',
    {
      'word-brick--gap': isGap(wordIndex),
      'word-brick--current': isCurrentWord(wordIndex),
      'word-brick--filled': isGap(wordIndex) && false // TODO: Add filled gap logic
    }
  ]
}
</script>

<style scoped>
.brick-chunk {
  display: flex;
  align-items: flex-end;
  height: 100%;
}

.word-brick {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: var(--space-8px) var(--space-12px);
  margin-right: var(--space-4px);
  background: var(--color-bg-primary);
  border: var(--border-width-2px) solid var(--color-border-medium);
  border-radius: var(--border-radius-4px);
  font-size: var(--fontsize--1);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  transition: all 0.15s ease;
  will-change: transform;
}

.word-brick--gap {
  background: transparent;
  border-style: dashed;
  border-color: var(--color-border-light);
}

.word-brick--current {
  background: var(--color-gray-300);
  border-color: var(--color-gray-600);
  transform: translateY(-2px);
}

.word-brick--filled {
  background: var(--color-gray-200);
  border-color: var(--color-gray-500);
  border-style: solid;
}

.brick-text {
  display: block;
  line-height: 1;
}

.brick-gap-indicator {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--color-border-light);
}

/* Hover effects for filled gaps */
.word-brick--filled:hover {
  background: var(--color-gray-300);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .word-brick {
    height: 36px;
    padding: var(--space-6px) var(--space-8px);
    font-size: var(--fontsize--1);
  }
}
</style>
