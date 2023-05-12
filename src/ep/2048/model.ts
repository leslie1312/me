export type MoveDirection = "up" | "down" | "left" | "right"

export interface TileBase {
  x: number
  y: number
  level: number
}

export interface TileMeta extends TileBase {
  key?: number /** the key for 'v-for' directives */
  prev?: TileBase
}

export interface StorageOptions {
  score: number
  tiles: TileBase[]
}

export function levelToScore(level: number) {
  return 2 ** level
}

export function normalizeTiles(tiles: TileMeta[]): TileBase[] {
  return tiles.map(({ x, y, level }) => ({ x, y, level }))
}

let key = 0

export class Model {
  gg = false
  score = 0
  tiles: TileMeta[] = []
  snapshot: (TileBase | undefined)[][] = []

  init(storages?: StorageOptions) {
    this.gg = false
    this.score = storages?.score ?? 0
    this.tiles = storages?.tiles ?? []
    this.updateTiles(true)
    if (this.tiles.length === 0) {
      this.popup(2)
    }
  }

  move(direction: MoveDirection) {
    if (this.gg) {
      return
    }

    const prevScore = this.score
    const prevTiles = JSON.stringify(normalizeTiles(this.tiles))

    const reverse = direction === "left" || direction === "up"
    let prop: "x" | "y"
    let getItems: (i: number) => (TileMeta | undefined)[]
    if (direction === "left" || direction === "right") {
      prop = "x"
      getItems = (y: number) => this.snapshot[y]
    } else {
      prop = "y"
      getItems = (x: number) => this.snapshot.map(row => row[x])
    }

    for (let i = 0; i < 4; i++) {
      let items = getItems(i).filter(Boolean) as TileMeta[]
      items = this.mergeTileItems(items, reverse)
      const offset = reverse ? 0 : 4 - items.length
      items.forEach((item, index) => (item[prop] = offset + index))
    }

    this.updateTiles()
    if (this.score > prevScore || JSON.stringify(normalizeTiles(this.tiles)) !== prevTiles) {
      this.popup()
    }
  }

  popup(count = 1) {
    const candidates: number[] = []
    this.snapshot.flat().forEach((tile, i) => !tile && candidates.push(i))
    if (candidates.length < count) {
      return
    }

    const createTile = (i: number) => ({
      x: i % 4,
      y: Math.floor(i / 4),
      level: Math.random() < 0.9 ? 1 : 2,
      key: key++,
    })
    const target = shuffle(candidates, count)
    target.forEach(i => {
      const tile = createTile(i)
      this.tiles.push(tile)
      this.snapshot[tile.y][tile.x] = tile
    })

    if (candidates.length === count) {
      this.gg = this.isGameOver()
    }
  }

  isGameOver() {
    const array = this.snapshot
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const t = array[y][x]
        if (!t) {
          return false
        }

        if (x < 3) {
          const tx = array[y][x + 1]
          if (!tx || canIMerge(t, tx)) {
            return false
          }
        }
        if (y < 3) {
          const ty = array[y + 1][x]
          if (!ty || canIMerge(t, ty)) {
            return false
          }
        }
      }
    }
    return true
  }

  updateTiles(resetKey = false) {
    const snapshot = Array.from({ length: 4 }, () => Array(4).fill(undefined))
    for (let i = this.tiles.length - 1; i >= 0; i--) {
      const tile = this.tiles[i]
      if (!tile.level) {
        this.tiles.splice(i, 1)
        continue
      }
      resetKey && (tile.key = key++)
      snapshot[tile.y][tile.x] = tile
    }
    this.snapshot = snapshot
  }

  mergeTileItems(items: TileMeta[], reverse = false) {
    if (items.length < 2) {
      return items
    }
    reverse && items.reverse()
    if (items.length == 2) {
      this.doMerge(items[0], items[1])
    } else if (items.length == 3) {
      !this.doMerge(items[1], items[2]) && this.doMerge(items[0], items[1])
    } else if (items.length == 4) {
      if (this.doMerge(items[2], items[3])) {
        this.doMerge(items[0], items[1])
      } else {
        !this.doMerge(items[1], items[2]) && this.doMerge(items[0], items[1])
      }
    }
    reverse && items.reverse()
    return items.filter(item => item.level)
  }

  doMerge(from: TileMeta, to: TileMeta) {
    if (canIMerge(from, to)) {
      from.level++
      to.level = 0
      this.score += levelToScore(from.level)
      return true
    }
  }
}

function canIMerge(from: TileMeta, to: TileMeta) {
  return from.level === to.level
}

function shuffle(array: number[], target: number, length = array.length) {
  for (let i = 0; i < length; i++) {
    const j = Math.floor(Math.random() * (length - i)) + i
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array.slice(0, target)
}
