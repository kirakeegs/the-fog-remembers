import { TileType } from "./types";

export interface MazeLevel {
  grid: TileType[][];
  cols: number;
  rows: number;
  spawn: { x: number; y: number };
  exit: { x: number; y: number };
}

export function mazeDimsForDepth(depth: number): { cellCols: number; cellRows: number } {
  return {
    cellCols: Math.min(8 + depth, 17),
    cellRows: Math.min(7 + depth, 14),
  };
}

export function generateMaze(depth: number): MazeLevel {
  const { cellCols, cellRows } = mazeDimsForDepth(depth);
  const cols = cellCols * 2 + 1;
  const rows = cellRows * 2 + 1;
  const grid: TileType[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => (r === 0 || c === 0 || r === rows - 1 || c === cols - 1 ? 1 : 0)),
  );
  const spawn = { x: 1, y: 1 };
  const exit = { x: cols - 2, y: rows - 2 };
  grid[spawn.y][spawn.x] = 3;
  grid[exit.y][exit.x] = 2;
  return { grid, cols, rows, spawn, exit };
}
