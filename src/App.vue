<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  createMaze,
  hasWon,
  movePlayer,
  type Direction,
  type Maze,
  type Position,
} from './game/maze'

const SIZE = 15
const BEST_KEY = 'neon-labyrinth-best-v1'
const maze = ref<Maze>(createMaze(SIZE))
const player = ref<Position>({ row: 0, col: 0 })
const startedAt = ref<number | null>(null)
const finishedAt = ref<number | null>(null)
const clock = ref(Date.now())
const bestTime = ref<number | null>(readBestTime())
const runNumber = ref(1)
let timerId: number | undefined

const won = computed(() => hasWon(player.value, maze.value))
const elapsed = computed(() => {
  if (startedAt.value === null) return 0
  return Math.max(0, (finishedAt.value ?? clock.value) - startedAt.value)
})
const formattedTime = computed(() => formatTime(elapsed.value))
const bestLabel = computed(() => bestTime.value === null ? '--:--' : formatTime(bestTime.value))

function readBestTime(): number | null {
  try {
    const stored = localStorage.getItem(BEST_KEY)
    if (stored === null) return null
    const value = Number(stored)
    return Number.isFinite(value) && value >= 0 ? value : null
  } catch {
    return null
  }
}

function formatTime(milliseconds: number): string {
  const centiseconds = Math.floor(milliseconds / 10)
  const minutes = Math.floor(centiseconds / 6000).toString().padStart(2, '0')
  const seconds = Math.floor((centiseconds % 6000) / 100).toString().padStart(2, '0')
  const fraction = (centiseconds % 100).toString().padStart(2, '0')
  return `${minutes}:${seconds}.${fraction}`
}

function move(direction: Direction) {
  if (won.value) return
  const next = movePlayer(maze.value, player.value, direction)
  if (next.row === player.value.row && next.col === player.value.col) return

  if (startedAt.value === null) startedAt.value = Date.now()
  player.value = next
  if (hasWon(player.value, maze.value)) {
    finishedAt.value = Date.now()
    if (bestTime.value === null || elapsed.value < bestTime.value) {
      bestTime.value = elapsed.value
      try {
        localStorage.setItem(BEST_KEY, String(bestTime.value))
      } catch {
        // The game remains playable when browser storage is unavailable.
      }
    }
  }
}

function newMaze() {
  maze.value = createMaze(SIZE)
  player.value = { row: 0, col: 0 }
  startedAt.value = null
  finishedAt.value = null
  runNumber.value += 1
  clock.value = Date.now()
}

function onKeyDown(event: KeyboardEvent) {
  const key = event.key.toLowerCase()
  const keyDirections: Record<string, Direction> = {
    arrowup: 'up', w: 'up',
    arrowright: 'right', d: 'right',
    arrowdown: 'down', s: 'down',
    arrowleft: 'left', a: 'left',
  }

  if (key === 'r') {
    event.preventDefault()
    newMaze()
    return
  }
  const direction = keyDirections[key]
  if (direction) {
    event.preventDefault()
    move(direction)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  timerId = window.setInterval(() => { clock.value = Date.now() }, 40)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (timerId !== undefined) window.clearInterval(timerId)
})
</script>

<template>
  <main class="page-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Neon Labyrinth home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none"><path d="M5 5h22v22H5zM10 5v7h7v-5h5v9h-7v7h9v4M5 18h5v-6" /></svg>
        </span>
        <span class="brand-name">NEON<span>LABYRINTH</span></span>
      </a>
      <div class="topbar-note"><span class="status-dot"></span> DAILY BRAIN BREAK <span class="note-divider">/</span> MAZE NO. <span class="run-id">{{ String(runNumber).padStart(3, '0') }}</span></div>
      <a class="github-link" href="https://github.com/oscarmmi/maze" target="_blank" rel="noreferrer">
        <span>VIEW SOURCE</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3h8v8M13 3 3 13" /></svg>
      </a>
    </header>

    <section id="top" class="intro">
      <div class="eyebrow"><span>01</span><i></i> FIND YOUR WAY OUT</div>
      <h1>Lost in the <span>glow.</span></h1>
      <p>One maze. One way out. How fast can you find it?</p>
    </section>

    <section class="game-layout" aria-label="Neon Labyrinth game">
      <div class="board-column">
        <div class="board-topline">
          <div class="board-caption"><span class="live-dot" :class="{ active: startedAt !== null }"></span>{{ won ? 'ROUTE COMPLETE' : startedAt === null ? 'AWAITING INPUT' : 'ROUTE IN PROGRESS' }}</div>
          <div class="board-size">15 <span>×</span> 15 <span class="size-label">GRID</span></div>
        </div>

        <div class="board-frame" :class="{ completed: won }">
          <div class="board-glow" aria-hidden="true"></div>
          <div class="maze-board" role="grid" aria-label="15 by 15 maze. Use arrow keys or WASD to move.">
            <template v-for="(row, rowIndex) in maze" :key="`row-${rowIndex}`">
              <div
                v-for="(cell, colIndex) in row"
                :key="`${rowIndex}-${colIndex}`"
                class="maze-cell"
                :class="{
                  'wall-top': cell.walls.up,
                  'wall-right': cell.walls.right,
                  'wall-bottom': cell.walls.down,
                  'wall-left': cell.walls.left,
                  'is-player': player.row === rowIndex && player.col === colIndex,
                  'is-exit': rowIndex === SIZE - 1 && colIndex === SIZE - 1,
                  'is-start': rowIndex === 0 && colIndex === 0,
                }"
                role="gridcell"
                :aria-label="rowIndex === player.row && colIndex === player.col ? 'Player position' : rowIndex === SIZE - 1 && colIndex === SIZE - 1 ? 'Exit' : undefined"
              >
                <span v-if="rowIndex === 0 && colIndex === 0" class="start-mark">S</span>
                <span v-if="rowIndex === SIZE - 1 && colIndex === SIZE - 1" class="exit-mark"><span></span></span>
                <span v-if="player.row === rowIndex && player.col === colIndex" class="player-mark"><span></span></span>
              </div>
            </template>
          </div>
          <div v-if="won" class="win-spark" aria-hidden="true">✦</div>
        </div>

        <div class="board-bottomline"><span><b class="legend-player"></b> YOU</span><span><b class="legend-exit"></b> EXIT</span><span class="board-hint">{{ won ? 'NICE RUN. GO AGAIN?' : 'EVERY TURN COUNTS' }}</span></div>
      </div>

      <aside class="control-panel">
        <div class="panel-heading"><span>YOUR RUN</span><span class="panel-index">01 / ∞</span></div>
        <div class="timer-card" :class="{ 'timer-live': startedAt !== null && !won, 'timer-won': won }">
          <div class="timer-label"><span class="timer-icon">◷</span> ELAPSED TIME</div>
          <div class="timer-value" aria-live="off">{{ formattedTime }}</div>
          <div class="timer-state">{{ won ? 'FINISH TIME' : startedAt === null ? 'STARTS ON FIRST MOVE' : 'KEEP MOVING' }}</div>
        </div>

        <div class="best-card">
          <div class="best-icon" aria-hidden="true">↗</div>
          <div><span>PERSONAL BEST</span><strong>{{ bestLabel }}</strong></div>
          <span class="best-unit">{{ bestTime === null ? '—' : 'MIN' }}</span>
        </div>

        <div class="controls-block">
          <div class="section-label">HOW TO MOVE <span>01—04</span></div>
          <div class="key-guide">
            <div class="key-cluster" aria-hidden="true"><kbd>↑</kbd><div><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd></div></div>
            <span>ARROW KEYS<br><em>OR W A S D</em></span>
          </div>
          <div class="dpad" aria-label="Movement controls">
            <button class="dpad-button dpad-up" type="button" aria-label="Move up" @click="move('up')">↑</button>
            <button class="dpad-button dpad-left" type="button" aria-label="Move left" @click="move('left')">←</button>
            <button class="dpad-button dpad-down" type="button" aria-label="Move down" @click="move('down')">↓</button>
            <button class="dpad-button dpad-right" type="button" aria-label="Move right" @click="move('right')">→</button>
            <span class="dpad-center" aria-hidden="true">✳</span>
          </div>
          <div class="touch-label">TAP TO NAVIGATE</div>
        </div>

        <button class="new-maze-button" type="button" @click="newMaze"><span class="refresh-icon">↻</span> NEW MAZE <kbd>R</kbd></button>
        <div class="panel-footnote"><span>BUILT FOR THE CURIOUS</span><span>✳</span></div>
      </aside>
    </section>

    <footer class="page-footer"><span>NEON LABYRINTH <i>©</i> 2026</span><span>TAKE THE SCENIC ROUTE.</span><span>15 × 15 / ENDLESS PATHS</span></footer>
    <div v-if="won" class="win-announcement" role="status"><span>✦</span><div><strong>YOU FOUND THE WAY.</strong><small>New maze, new record?</small></div><button type="button" aria-label="Generate a new maze" @click="newMaze">↻</button></div>
  </main>
</template>
