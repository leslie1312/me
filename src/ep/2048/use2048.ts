import { useCycleList, useEventListener, useStorage, useSwipe } from "@vueuse/core"
import { onScopeDispose, onUnmounted, reactive, toRefs, watch, type Ref } from "vue"
import { labels } from "./config.json"
import { Model, levelToScore, normalizeTiles, type MoveDirection } from "./model"

export interface Use2048Options {
  bestKey?: string
  prevKey?: string
  presetKey?: string
  autoSaveWhenExit?: boolean
}

export interface TileItemPresets {
  getTileLabel: (_: number) => string
  getTileColor: (_: number) => string
}

const eventKeyMap: Record<string, MoveDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
}

function useModel() {
  const m = reactive(new Model())
  const { gg, score, tiles } = toRefs(m)
  return {
    gg,
    score,
    tiles,
    init: m.init.bind(m),
    move: m.move.bind(m),
  }
}

function usePreset() {
  const getLabelByPresets = (arr: readonly string[]) => {
    return (level: number) => (level < arr.length ? arr[level - 1] : arr[arr.length - 1])
  }
  const getTileColor = (level: number) => {
    const suffix = 2 ** level
    return `tile-${suffix > 2048 ? "super" : suffix}`
  }

  const presetList: TileItemPresets[] = [
    {
      getTileLabel: (level: number) => levelToScore(level).toString(),
      getTileColor,
    },
    {
      getTileLabel: getLabelByPresets(labels.army),
      getTileColor,
    },
    {
      getTileLabel: getLabelByPresets(labels.dynasty),
      getTileColor,
    },
  ]

  const { state, next } = useCycleList(presetList)
  return {
    preset: state,
    nextPreset: next,
  }
}

export function use2048(target: Ref<HTMLElement | undefined>, options: Use2048Options = {}) {
  const { prevKey = "g-2048-prev", bestKey = "g-2048-best", autoSaveWhenExit = true } = options

  const { preset, nextPreset } = usePreset()
  const { gg, score, tiles, move, init } = useModel()
  const best = useStorage(bestKey, score.value)
  const { direction } = useSwipe(target)

  const stops = [
    watch(score, value => value > best.value && (best.value = value)),
    watch(direction, value => {
      if (value && value !== "none") {
        move(value)
      }
    }),
  ]

  useEventListener("keydown", event => {
    if (gg.value && event.key === "Enter") {
      init()
      return
    }
    const dir = eventKeyMap[event.key]
    if (dir) {
      event.preventDefault()
      move(dir)
    }
  })

  const tryResume = () => {
    try {
      init(JSON.parse(localStorage.getItem(prevKey)!))
    } catch (e: any) {
      init()
    }
  }

  const autoSave = () => {
    if (gg.value) {
      localStorage.removeItem(prevKey)
      return
    }
    localStorage.setItem(
      prevKey,
      JSON.stringify({ score: score.value, tiles: normalizeTiles(tiles.value) })
    )
  }

  if (autoSaveWhenExit) {
    let called = false
    const saveOnce = () => {
      if (!called) {
        called = true
        autoSave()
      }
    }
    onUnmounted(() => saveOnce())
    useEventListener("pagehide", () => saveOnce())
  }

  tryResume()
  onScopeDispose(() => stops.forEach(stop => stop()))

  return {
    gg,
    best,
    score,
    tiles,
    init,
    preset,
    nextPreset,
  }
}
