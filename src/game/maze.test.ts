import { describe, expect, it } from 'vitest'
import { createMaze, hasWon, movePlayer, type Position } from './maze'

describe('maze game logic', () => {
  it('generates a connected maze with a start and bottom-right exit', () => {
    const maze = createMaze(15, () => 0.37)
    expect(maze).toHaveLength(15)
    expect(maze[0]).toHaveLength(15)
    expect(maze[0]![0]).toBeDefined()
    expect(maze[14]![14]).toBeDefined()

    const reached = new Set<string>(['0,0'])
    const queue: Position[] = [{ row: 0, col: 0 }]
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index]!
      for (const direction of ['up', 'right', 'down', 'left'] as const) {
        const next = movePlayer(maze, current, direction)
        const key = `${next.row},${next.col}`
        if ((next.row !== current.row || next.col !== current.col) && !reached.has(key)) {
          reached.add(key)
          queue.push(next)
        }
      }
    }
    expect(reached.size).toBe(225)
    expect(hasWon({ row: 14, col: 14 }, maze)).toBe(true)
  })

  it('rejects a move into a wall without moving the player', () => {
    const maze = createMaze(5, () => 0.2)
    const start = { row: 0, col: 0 }
    const blockedDirection = maze[0]![0]!.walls.up ? 'up' : 'left'
    expect(movePlayer(maze, start, blockedDirection)).toBe(start)
  })

  it('moves into a neighboring cell when the wall is open', () => {
    const maze = createMaze(5, () => 0.6)
    const start = { row: 0, col: 0 }
    const openDirection = maze[0]![0]!.walls.right ? 'down' : 'right'
    const next = movePlayer(maze, start, openDirection)
    expect(next).not.toBe(start)
    expect(Math.abs(next.row - start.row) + Math.abs(next.col - start.col)).toBe(1)
  })

  it('only wins when the player reaches the exit', () => {
    const maze = createMaze(5, () => 0.45)
    expect(hasWon({ row: 0, col: 0 }, maze)).toBe(false)
    expect(hasWon({ row: 4, col: 4 }, maze)).toBe(true)
  })

  it('requires a positive odd maze size', () => {
    expect(() => createMaze(4)).toThrow(RangeError)
  })
})
