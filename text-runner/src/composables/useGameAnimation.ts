import { ref, onMounted, onUnmounted  } from 'vue'
import { useGameStore } from '@/stores/gameStore'

export function useGameAnimation() {
  const gameStore = useGameStore()
  
  // Animation state
  const platformOffset = ref(200) // Start at +200px so word 0 is under avatar
  const isAnimating = ref(false)
  const animationSpeed = ref(0.25) // pixels per frame
  
  // Animation frame reference for cleanup
  let animationFrameId: number | null = null
  
  // Main animation loop
  const animate = () => {
    if (!isAnimating.value) {
      animationFrameId = null
      return
    }
    
    // Move platform left (decrease offset - platform moving left)
    platformOffset.value -= animationSpeed.value
    
    // Update CSS custom property for hardware acceleration
    document.documentElement.style.setProperty(
      '--platform-offset', 
      `${platformOffset.value}px`
    )
    
    // Update store with current offset
    gameStore.updatePlatformOffset(platformOffset.value)
    
    // Continue animation loop
    animationFrameId = requestAnimationFrame(animate)
  }
  
  // Start animation
  const startAnimation = () => {
    if (isAnimating.value) return // Already running
    
    isAnimating.value = true
    gameStore.startAnimation()
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(animate)
  }
  
  // Stop animation
  const stopAnimation = () => {
    isAnimating.value = false
    gameStore.stopAnimation()
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
  
  // Pause animation
  const pauseAnimation = () => {
    isAnimating.value = false
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
  
  // Resume animation
  const resumeAnimation = () => {
    if (!isAnimating.value && gameStore.gameStatus === 'playing') {
      startAnimation()
    }
  }
  
  // Reset animation to start with word 0 under avatar
  const resetAnimation = () => {
    stopAnimation()
    
    // Start platform positioned so word 0 is under the avatar (200px from left)
    // Move platform RIGHT by 200px (positive offset)
    platformOffset.value = 200
    
    document.documentElement.style.setProperty('--platform-offset', `${platformOffset.value}px`)
    gameStore.updatePlatformOffset(platformOffset.value)
  }
  
  // Set animation speed (useful for difficulty levels)
  const setAnimationSpeed = (speed: number) => {
    animationSpeed.value = Math.max(0.5, Math.min(speed, 5)) // Clamp between 0.5 and 5
  }
  
  // Get current animation progress (how far we've moved)
  const getAnimationProgress = (): number => {
    return Math.abs(200 - platformOffset.value) // Distance moved from start
  }
  
  // Calculate average pixels per word (fallback for estimates)
  const getPixelsPerWord = (): number => {
    // Try to get actual measurements from rendered bricks
    const firstBrick = document.querySelector('.word-brick')
    if (firstBrick) {
      const brickStyle = window.getComputedStyle(firstBrick)
      const brickWidth = firstBrick.getBoundingClientRect().width
      const marginRight = parseFloat(brickStyle.marginRight) || 0
      return brickWidth + marginRight
    }
    
    // Fallback estimate if no brick is rendered yet
    return 80
  }
  
  // Get the actual cumulative width of bricks up to a specific word index
  const getCumulativeWidthToIndex = (targetIndex: number): number => {
    let totalWidth = 0
    const bricks = document.querySelectorAll('.word-brick')
    
    for (let i = 0; i <= targetIndex && i < bricks.length; i++) {
      const brick = bricks[i]
      if (brick) {
        const brickRect = brick.getBoundingClientRect()
        const style = window.getComputedStyle(brick)
        const marginRight = parseFloat(style.marginRight) || 0
        totalWidth += brickRect.width + marginRight
      }
    }
    
    return totalWidth
  }
  
  // Calculate current word index using actual brick measurements
  const getCurrentWordIndex = (): number => {
    if (!gameStore.currentLevelData) return 0
    
    // Avatar is at 200px from left edge
    // Platform has moved, so the position we need to check on the platform is:
    const avatarPositionOnPlatform = 200 - platformOffset.value
    
    // If we're still to the right of the start, we're at word 0
    if (avatarPositionOnPlatform <= 0) return 0
    
    // Find which word the avatar is currently over by measuring actual widths
    const bricks = document.querySelectorAll('.word-brick')
    let cumulativeWidth = 0
    
    for (let i = 0; i < bricks.length && i < gameStore.currentLevelData.totalWords; i++) {
      const brick = bricks[i]
      if (brick) {
        const brickRect = brick.getBoundingClientRect()
        const style = window.getComputedStyle(brick)
        const marginRight = parseFloat(style.marginRight) || 0
        const brickWidth = brickRect.width + marginRight
        
        // Check if avatar is within this brick's bounds
        if (avatarPositionOnPlatform >= cumulativeWidth && avatarPositionOnPlatform < cumulativeWidth + brickWidth) {
          return i
        }
        
        cumulativeWidth += brickWidth
      }
    }
    
    // If we've gone past all measured bricks, estimate the rest
    const measuredBricks = bricks.length
    if (measuredBricks > 0) {
      const averageWidth = cumulativeWidth / measuredBricks
      const remainingDistance = avatarPositionOnPlatform - cumulativeWidth
      const estimatedIndex = measuredBricks + Math.floor(remainingDistance / averageWidth)
      return Math.min(estimatedIndex, gameStore.currentLevelData.totalWords - 1)
    }
    
    // Final fallback
    return Math.min(Math.floor(avatarPositionOnPlatform / 80), gameStore.currentLevelData.totalWords - 1)
  }
  
  // Check if avatar is approaching a gap (1-2 words ahead) OR currently at one
  const isApproachingGap = (): boolean => {
    if (!gameStore.currentLevelData) return false
    
    const currentWordIndex = getCurrentWordIndex()
    
    // Check current position, next word, and word after that
    const currentWord = currentWordIndex
    const nextWord = currentWordIndex + 1
    const wordAfterNext = currentWordIndex + 2
    
    return gameStore.currentLevelData.gaps.includes(currentWord) ||
           gameStore.currentLevelData.gaps.includes(nextWord) ||
           gameStore.currentLevelData.gaps.includes(wordAfterNext)
  }
  
  // Cleanup on component unmount
  onUnmounted(() => {
    stopAnimation()
  })
  
  return {
    // State
    platformOffset,
    isAnimating,
    animationSpeed,
    
    // Controls
    startAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation,
    resetAnimation,
    setAnimationSpeed,
    
    // Utilities
    getAnimationProgress,
    getCurrentWordIndex,
    isApproachingGap,
    getPixelsPerWord
  }
}