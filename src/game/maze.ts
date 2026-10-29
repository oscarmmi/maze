export type Direction = 'up' | 'right' | 'down' | 'left'

export interface Position {
  row: number
  col: number
}

export interface MazeCell {
  walls: Record<Direction, boolean>
}

export type Maze = MazeCell[][]

const opposite: Record<Direction, Direction> = {
  up: 'down',
  right: 'left',
  down: 'up',
  left: 'right',
}

const delta: Record<Direction, Position> = {
  up: { row: -1, col: 0 },
  right: { row: 0, col: 1 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
}

export function createMaze(size = 15, random: () => number = Math.random): Maze {
  if (!Number.isInteger(size) || size < 1 || size % 2 === 0) {
    throw new RangeError('Maze size must be a positive odd integer.')
  }

  const maze: Maze = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      walls: { up: true, right: true, down: true, left: true },
    })),
  )
  const visited = Array.from({ length: size }, () => Array<boolean>(size).fill(false))
  const stack: Position[] = [{ row: 0, col: 0 }]
  visited[0]![0] = true

  while (stack.length > 0) {
    const current = stack[stack.length - 1]!
    const candidates = (Object.keys(delta) as Direction[])
      .map((direction) => {
        const offset = delta[direction]
        return {
          direction,
          row: current.row + offset.row,
          col: current.col + offset.col,
        }
      })
      .filter(({ row, col }) => row >= 0 && col >= 0 && row < size && col < size && !visited[row]![col])

    if (candidates.length === 0) {
      stack.pop()
      continue
    }

    const next = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))]!
    maze[current.row]![current.col]!.walls[next.direction] = false
    maze[next.row]![next.col]!.walls[opposite[next.direction]] = false
    visited[next.row]![next.col] = true
    stack.push({ row: next.row, col: next.col })
  }

  return maze
}

export function movePlayer(maze: Maze, player: Position, direction: Direction): Position {
  const current = maze[player.row]?.[player.col]
  if (!current || current.walls[direction]) return player

  const offset = delta[direction]
  const row = player.row + offset.row
  const col = player.col + offset.col
  if (!maze[row]?.[col]) return player
  return { row, col }
}

export function hasWon(player: Position, maze: Maze): boolean {
  return player.row === maze.length - 1 && player.col === maze.length - 1
}
