English Language Practice Game - Complete Architecture Document

Project Overview



Game Type: Educational platform scrolling game for English language learners

Target Audience: Intermediate to advanced English learners

Platform: Web-based, mobile-first responsive design

Core Concept: Player avatar walks on a platform made of word bricks. Every 6th word is missing (gap). Player must answer multiple-choice quiz to fill gaps and continue.



Technical Stack


Framework: Vue 3 + TypeScript + Composition API

State Management: Pinia with TypeScript

Styling: Scoped CSS with CSS custom properties

Animation Strategy: CSS transitions (hardware accelerated)

API: Datamuse API for quiz generation

Build Tool: Vite

Language: JavaScript (ES6+)



Game Mechanics \& Rules

Core Gameplay



Avatar: Fixed position (200px from left edge), silhouette of human

Platform Movement: Left-to-right treadmill effect (platform moves, avatar stays fixed)

Word Bricks: Responsive sizing, tight fit around words

Gap System: Every 6th word becomes a gap (configurable per level)

Lives System: 5 lives total



Wrong quiz answer: -0.5 lives

Fall through gap: -1 life

Win condition: Reach end with ≥0.5 lives







Quiz System



Trigger: When gap enters viewport (not fixed distance)

Options: 4 multiple choice buttons



1 correct answer

3 incorrect options from Datamuse API:



Sounds-like words (sl parameter)

Spelled-like words (sp parameter)

Related/triggered words (rel\_trg parameter)





Mobile UX: Haptic feedback + scroll prevention during quiz



Level Data Format

json{

&nbsp; "cityName": "Manchester",

&nbsp; "difficulty": "intermediate",

&nbsp; "text": "Manchester is a major city in northwest England with a rich industrial heritage. The city became the world's first industrialized city during the Industrial Revolution. Today Manchester is famous for its two football teams, vibrant music scene, and excellent universities.",

&nbsp; "gapFrequency": 6,

&nbsp; "metadata": {

&nbsp;   "wordCount": 89,

&nbsp;   "estimatedTime": "3-5 minutes",

&nbsp;   "focusAreas": \["adjectives", "prepositions"]

&nbsp; }

}

Gap Calculation Logic:

javascriptconst calculateGaps = (words, frequency = 6) => {

&nbsp; const gaps = \[];

&nbsp; for (let i = frequency - 1; i < words.length; i += frequency) {

&nbsp;   gaps.push(i);

&nbsp; }

&nbsp; return gaps;

};





Component Architecture

src/

├── components/

│   ├── GameApp.vue              # Main game container

│   ├── GameCanvas.vue           # Platform + Avatar rendering

│   ├── BrickChunk.vue           # Performance-optimized brick groups

│   ├── QuizInterface.vue        # Mobile-optimized 4-button quiz

│   ├── LoadingScreen.vue        # Step-by-step loading progress

│   ├── GameHUD.vue              # Lives, score, progress display

│   └── ResultsScreen.vue        # Level completion with next/menu options

├── composables/

│   ├── useGameAnimation.ts      # Platform movement \& RAF loop

│   ├── useQuizGeneration.ts     # Datamuse API integration

│   ├── useLevelLoader.ts        # Level initialization

│   └── useCollisionDetection.ts # Gap detection \& quiz triggering

├── stores/

│   └── gameStore.ts             # Pinia global state

├── styles/

│   ├── variables.css            # Design tokens \& CSS custom properties

│   └── globals.css              # Reset \& base styles

├── levels/

│   ├── manchester.json          # Level data files

│   ├── london.json

│   └── index.js                 # Level registry

├── types/

│   ├── game.ts                 # Game-related interfaces

│   └── api.ts                  # API response types

└── utils/

&nbsp;   ├── textProcessing.ts        # Tokenization \& text utils

&nbsp;   └── apiService.ts            # Datamuse API wrapper





State Management (Pinia Store)

javascript// stores/gameStore.js

export const useGameStore = defineStore('game', {

&nbsp; state: () => ({

&nbsp;   // Game state

&nbsp;   lives: 5,

&nbsp;   score: 0,

&nbsp;   currentLevel: 1,

&nbsp;   gameStatus: 'menu', // 'menu'|'loading'|'playing'|'paused'|'complete'|'gameOver'

&nbsp;   

&nbsp;   // Level data

&nbsp;   currentLevelData: null, // { words: \[], gaps: \[] }

&nbsp;   levelProgress: {

&nbsp;     totalWords: 0,

&nbsp;     currentWordIndex: 0,

&nbsp;     gapsCompleted: 0,

&nbsp;     totalGaps: 0

&nbsp;   },

&nbsp;   

&nbsp;   // Animation state

&nbsp;   platformOffset: 0,

&nbsp;   isAnimating: false,

&nbsp;   

&nbsp;   // Quiz state

&nbsp;   activeQuiz: null,

&nbsp;   

&nbsp;   // User preferences (future-ready)

&nbsp;   userProfile: {

&nbsp;     preferredDifficulty: 'intermediate',

&nbsp;     completedLevels: \[],

&nbsp;     settings: {

&nbsp;       hapticFeedback: true,

&nbsp;       soundEffects: true

&nbsp;     }

&nbsp;   }

&nbsp; }),



&nbsp; actions: {

&nbsp;   async initializeLevel(levelData) { /\* ... \*/ },

&nbsp;   loseLife(amount = 0.5) { /\* ... \*/ },

&nbsp;   addScore(points) { /\* ... \*/ },

&nbsp;   fillGap(gapIndex) { /\* ... \*/ },

&nbsp;   triggerQuiz(gap) { /\* ... \*/ }

&nbsp; }

});





Performance Requirements

Critical Performance Rules



Zero API calls during gameplay - All quiz options pre-generated at level start

Virtualized rendering - Only render visible bricks (groups of 20-30 bricks per component)

Hardware acceleration - CSS transforms with will-change: transform

60fps animation - RequestAnimationFrame for platform movement

Mobile optimization - Touch targets ≥44px, haptic feedback





Rendering Strategy

vue<!-- BrickChunk.vue - Renders 20-30 bricks as single component -->

<template>

&nbsp; <div class="brick-chunk">

&nbsp;   <div 

&nbsp;     v-for="(word, index) in words" 

&nbsp;     :key="startIndex + index"

&nbsp;     :class="\['brick', { 'brick--gap': isGap(startIndex + index) }]"

&nbsp;   >

&nbsp;     {{ word }}

&nbsp;   </div>

&nbsp; </div>

</template>

Animation Pattern

javascript// useGameAnimation.js

export function useGameAnimation() {

&nbsp; const platformOffset = ref(0);

&nbsp; const isAnimating = ref(false);

&nbsp; let animationFrame;

&nbsp; 

&nbsp; const startAnimation = () => {

&nbsp;   isAnimating.value = true;

&nbsp;   const animate = () => {

&nbsp;     if (isAnimating.value) {

&nbsp;       platformOffset.value -= 2; // 2px per frame = ~120px/second

&nbsp;       

&nbsp;       // Update CSS custom property for hardware acceleration

&nbsp;       document.documentElement.style.setProperty(

&nbsp;         '--platform-offset', 

&nbsp;         `${platformOffset.value}px`

&nbsp;       );

&nbsp;       

&nbsp;       animationFrame = requestAnimationFrame(animate);

&nbsp;     }

&nbsp;   };

&nbsp;   animate();

&nbsp; };

&nbsp; 

&nbsp; return { platformOffset, startAnimation, stopAnimation };

}







Design System (Grayscale Initial)

css/\* styles/variables.css \*/

:root {

&nbsp; /\* Grayscale palette \*/

&nbsp; --color-black: #000000;

&nbsp; --color-gray-900: #1a1a1a;

&nbsp; --color-gray-800: #2d2d2d;

&nbsp; --color-gray-700: #404040;

&nbsp; --color-gray-600: #525252;

&nbsp; --color-gray-500: #737373;

&nbsp; --color-gray-400: #a3a3a3;

&nbsp; --color-gray-300: #d4d4d4;

&nbsp; --color-gray-200: #e5e5e5;

&nbsp; --color-gray-100: #f5f5f5;

&nbsp; --color-white: #ffffff;

&nbsp; 

&nbsp; /\* Semantic tokens \*/

&nbsp; --color-text-primary: var(--color-gray-900);

&nbsp; --color-text-secondary: var(--color-gray-600);

&nbsp; --color-bg-primary: var(--color-white);

&nbsp; --color-bg-secondary: var(--color-gray-100);

&nbsp; --color-border-light: var(--color-gray-200);

&nbsp; --color-border-medium: var(--color-gray-300);

&nbsp; 

&nbsp; /\* Interactive states \*/

&nbsp; --color-hover: var(--color-gray-100);

&nbsp; --color-pressed: var(--color-gray-200);

&nbsp; --color-focus: var(--color-gray-800);

&nbsp; 

&nbsp; /\* Spacing scale (4px increments) \*/

&nbsp; --space-1: 4px;

&nbsp; --space-2: 8px;

&nbsp; --space-3: 12px;

&nbsp; --space-4: 16px;

&nbsp; --space-5: 20px;

&nbsp; --space-6: 24px;

&nbsp; --space-8: 32px;

&nbsp; --space-10: 40px;

&nbsp; --space-12: 48px;

&nbsp; 

&nbsp; /\* Typography scale (responsive) \*/

&nbsp; --text-xs: clamp(12px, 3vw, 14px);

&nbsp; --text-sm: clamp(14px, 3.5vw, 16px);

&nbsp; --text-base: clamp(16px, 4vw, 18px);

&nbsp; --text-lg: clamp(18px, 4.5vw, 22px);

&nbsp; --text-xl: clamp(22px, 5vw, 28px);

&nbsp; 

&nbsp; /\* Component constants \*/

&nbsp; --touch-target: 44px;

&nbsp; --border-radius: 8px;

&nbsp; --border-width: 2px;

&nbsp; 

&nbsp; /\* Game-specific \*/

&nbsp; --platform-offset: 0px; /\* Updated via JS \*/

&nbsp; --brick-min-width: 44px;

&nbsp; --avatar-position: 200px;

}





API Integration Strategy

Datamuse API Usage





javascript// utils/apiService.js

export class DatamuseService {

&nbsp; static async generateQuizOptions(correctWord) {

&nbsp;   try {

&nbsp;     const \[soundsLike, spelledLike, related] = await Promise.all(\[

&nbsp;       fetch(`https://api.datamuse.com/words?sl=${correctWord}\&max=5`),

&nbsp;       fetch(`https://api.datamuse.com/words?sp=${correctWord.substring(0,3)}\*\&max=5`),

&nbsp;       fetch(`https://api.datamuse.com/words?rel\_trg=${correctWord}\&max=5`)

&nbsp;     ]);

&nbsp;     

&nbsp;     const options = {

&nbsp;       correct: correctWord,

&nbsp;       soundsLike: (await soundsLike.json())\[0]?.word || 'fallback1',

&nbsp;       spelledLike: (await spelledLike.json())\[0]?.word || 'fallback2',

&nbsp;       related: (await related.json())\[0]?.word || 'fallback3'

&nbsp;     };

&nbsp;     

&nbsp;     return shuffleArray(Object.values(options));

&nbsp;   } catch (error) {

&nbsp;     return LocalFallbackDB.getOptions(correctWord);

&nbsp;   }

&nbsp; }

}



Fallback Strategy

javascript// Local database for API failures

const LocalFallbackDB = {

&nbsp; synonyms: {

&nbsp;   "city": \["town", "metropolis", "municipality"],

&nbsp;   "major": \["significant", "primary", "principal"],

&nbsp;   "famous": \["renowned", "celebrated", "notable"],

&nbsp;   // ... 50-100 most common words

&nbsp; },

&nbsp; 

&nbsp; getOptions(word) {

&nbsp;   const options = this.synonyms\[word] || \["option1", "option2", "option3"];

&nbsp;   return \[word, ...options];

&nbsp; }

};





Key Component Patterns





Main Game Component

vue<!-- GameApp.vue -->

<template>

&nbsp; <div class="game-app">

&nbsp;   <LoadingScreen v-if="gameStatus === 'loading'" :step="loadingStep" />

&nbsp;   

&nbsp;   <template v-else-if="gameStatus === 'playing'">

&nbsp;     <GameHUD :lives="lives" :progress="levelProgress" />

&nbsp;     <GameCanvas :platform-offset="platformOffset" :level-data="currentLevelData" />

&nbsp;     <QuizInterface 

&nbsp;       v-if="activeQuiz"

&nbsp;       :quiz="activeQuiz"

&nbsp;       @answer="handleQuizAnswer"

&nbsp;     />

&nbsp;   </template>

&nbsp;   

&nbsp;   <ResultsScreen 

&nbsp;     v-else-if="gameStatus === 'complete'"

&nbsp;     :score="score"

&nbsp;     :lives="lives"

&nbsp;     @next-level="loadNextLevel"

&nbsp;     @main-menu="returnToMenu"

&nbsp;   />

&nbsp; </div>

</template>



<script setup>

import { useGameStore } from '@/stores/gameStore'

import { useGameAnimation } from '@/composables/useGameAnimation'



const store = useGameStore()

const { platformOffset, startAnimation } = useGameAnimation()



// Reactive references to store state

const { lives, score, gameStatus, activeQuiz, currentLevelData } = storeToRefs(store)

</script>

Quiz Interface Pattern

vue<!-- QuizInterface.vue -->

<template>

&nbsp; <div class="quiz-interface" @touchstart="preventScroll">

&nbsp;   <div class="question">

&nbsp;     <p class="prompt">Choose the missing word:</p>

&nbsp;     <div class="context">"...{{ contextBefore }} \_\_\_ {{ contextAfter }}..."</div>

&nbsp;   </div>

&nbsp;   

&nbsp;   <div class="options">

&nbsp;     <button

&nbsp;       v-for="(option, index) in quiz.options"

&nbsp;       :key="index"

&nbsp;       class="option-button"

&nbsp;       @click="selectAnswer(option)"

&nbsp;       :disabled="hasAnswered"

&nbsp;     >

&nbsp;       {{ option }}

&nbsp;     </button>

&nbsp;   </div>

&nbsp; </div>

</template>



<script setup>

const props = defineProps(\['quiz'])

const emit = defineEmits(\['answer'])



const hasAnswered = ref(false)



const preventScroll = (event) => {

&nbsp; event.preventDefault() // Prevent accidental scrolling

}



const selectAnswer = (option) => {

&nbsp; if (hasAnswered.value) return

&nbsp; 

&nbsp; hasAnswered.value = true

&nbsp; 

&nbsp; // Haptic feedback

&nbsp; if (navigator.vibrate) {

&nbsp;   navigator.vibrate(50)

&nbsp; }

&nbsp; 

&nbsp; emit('answer', option)

}

</script>



<style scoped>

.quiz-interface {

&nbsp; position: fixed;

&nbsp; bottom: 0;

&nbsp; left: 0;

&nbsp; right: 0;

&nbsp; background: var(--color-bg-primary);

&nbsp; border-top: var(--border-width) solid var(--color-border-medium);

&nbsp; padding: var(--space-6);

}



.options {

&nbsp; display: grid;

&nbsp; grid-template-columns: 1fr 1fr;

&nbsp; gap: var(--space-3);

}



.option-button {

&nbsp; min-height: var(--touch-target);

&nbsp; padding: var(--space-3) var(--space-4);

&nbsp; font-size: var(--text-base);

&nbsp; background: var(--color-bg-primary);

&nbsp; border: var(--border-width) solid var(--color-border-medium);

&nbsp; border-radius: var(--border-radius);

&nbsp; transition: all 0.15s ease;

}



.option-button:active {

&nbsp; background: var(--color-pressed);

&nbsp; transform: scale(0.98);

}

</style>





Error Handling Strategy

Initialization Errors



Show retry button with option to play offline

Pre-load all API data before gameplay starts

Graceful fallback to local synonym database



Runtime Errors



Silent fallback to cached/local data

No mid-game API failures (all data pre-loaded)

Error boundaries for component failures



Development Guidelines

Vue.js Best Practices Applied



Verbose naming: Prefer calculateVisibleBricks over calcVisible

Separate business logic: Use composables, not inline methods

Destructure props: Always destructure in setup()

Small components: BrickChunk handles 20-30 bricks max

Multiple useEffect: Separate concerns into different watchers

Avoid nested ternaries: Use computed properties instead

Named components: Every component has explicit name



Mobile-First Considerations



Touch targets ≥44px

Prevent scroll during quiz interactions

Haptic feedback for all button presses

Responsive typography with clamp()

Hardware-accelerated animations only

