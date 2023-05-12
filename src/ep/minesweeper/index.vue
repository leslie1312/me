<script lang="ts" setup>
import GameBox from "@/theme/components/GameBox.vue"
import { useEventListener, useStorage, useTimestamp } from "@vueuse/core"
import { computed, onUnmounted, ref, watchEffect } from "vue"
import { GridLabelPresets, LevelPresets, StateEmojiPresets, locales } from "./config.json"
import Item from "./item.vue"
import Modal from "./modal.vue"
import type { Level } from "./model"
import { useModel } from "./useModel"

const model = useModel()
const { state, board, grids, timer, flags } = model

const stamp = useTimestamp()
const clock = ref(0)
const level = computed(() => {
  for (let [level, values] of Object.entries(LevelPresets)) {
    if (values.m === board.value.m) {
      return level
    }
  }
  return "custom"
})

watchEffect(() => {
  if (state.value === "ready") {
    clock.value = 0
  } else if (state.value === "playing") {
    clock.value = (stamp.value - timer.value.start + timer.value.duration) / 1000
  }
})

function format(value: number) {
  return Math.floor(value).toString().padStart(3, "0")
}

function levelOptions() {
  return Object.keys(LevelPresets) as Level[]
}

/* ------------------------------------ - ----------------------------------- */
const itemWidth = ref(32)
const fastModel = useStorage("g-minesweeper-fast", true)
const flagModel = useStorage("g-minesweeper-flag", false)

const domBoard = ref<HTMLElement>()
const elementX = ref(0)
const elementY = ref(0)
const pressDownFlag = ref(false)
const highlightFlag = ref(false)
const highlightList = ref<number[]>([])

function onPointerDown(event: PointerEvent) {
  pressDownFlag.value = true
  updateElement(event)
  highlightList.value = model.getHighlight(getClickGridPosition())
}

function onPointerMove(event: PointerEvent) {
  if (pressDownFlag.value) {
    updateElement(event)
    highlightList.value = model.getHighlight(getClickGridPosition())
  }
}

function onClick() {
  const position = getClickGridPosition()
  flagModel.value ? model.mark(position) : model.open(position, fastModel.value)
}

function onRightClick() {
  model.mark(getClickGridPosition())
}

useEventListener("pointerup", () => {
  pressDownFlag.value = false
  highlightFlag.value = false
  highlightList.value = []
})

function updateElement(event: PointerEvent) {
  const { x, y, width, height } = domBoard.value!.getBoundingClientRect()
  let diffX = event.clientX - x
  let diffY = event.clientY - y
  if (diffX < 0 || diffX > width || diffY < 0 || diffY > height) {
    highlightFlag.value = false
    return
  }
  highlightFlag.value = true
  elementX.value = diffX
  elementY.value = diffY
}

function getClickGridPosition(
  clickX = elementX.value,
  clickY = elementY.value,
  length = itemWidth.value + 2
) {
  return {
    x: Math.floor(clickX / length),
    y: Math.floor(clickY / length),
  }
}

/* ------------------------------- save & load ------------------------------ */
const storageKey = "g-minesweeper-prev"
const showResumeDialog = ref(!!localStorage.getItem(storageKey))
const storageData = computed(() => {
  if (showResumeDialog.value) {
    try {
      return JSON.parse(localStorage.getItem(storageKey)!)
    } catch (e: any) {}
  }
})

const autoSave = (() => {
  let called = false
  return () => {
    if (called) {
      return
    }
    called = true
    if (state.value !== "playing") {
      return
    }
    localStorage.setItem(storageKey, JSON.stringify(model.save()))
  }
})()

onUnmounted(() => autoSave())
useEventListener("pagehide", () => autoSave())

function tryResume() {
  try {
    model.load(storageData.value)
  } catch (e: any) {
    model.init()
  }
  closeResumeDialog()
}

function closeResumeDialog() {
  showResumeDialog.value = false
  localStorage.removeItem(storageKey)
}
</script>

<template>
  <GameBox>
    <div class="inline-block select-none space-y-2 max-w-full rounded">
      <div class="flex justify-between px-2">
        <div class="flex space-x-2">
          <button
            v-for="lv in levelOptions()"
            class="btn text-sm transition-none"
            :class="[lv == level ? 'btn-highlight' : 'btn-classic']"
            @click="model.init(lv)"
          >
            {{ locales[lv] }}
          </button>
          <button
            v-if="false"
            class="btn text-sm"
            :class="[level == 'custom' ? 'btn-highlight' : 'btn-classic']"
            @click=""
          >
            {{ locales.custom }}
          </button>
        </div>
        <div
          class="btn btn-classic"
          title="重玩本局游戏"
          @click="model.redo()"
        >
          <div class="i-carbon-repeat-one" />
        </div>
      </div>

      <div class="flex justify-center space-x-2 px-2 text-xl font-mono font-bold">
        <div class="btn btn-classic w-24">
          <span>{{ GridLabelPresets.mine }}</span>
          <span class="ml-1 w-10 text-red-500">
            {{ format(board.m - flags.length) }}
          </span>
        </div>
        <div
          class="btn btn-classic w-24"
          @click="model.init()"
        >
          {{ StateEmojiPresets[state] }}
        </div>
        <div class="btn btn-classic w-24">
          <span>{{ GridLabelPresets.time }}</span>
          <span class="ml-1 w-10 text-red-500">{{ format(clock) }}</span>
        </div>
      </div>

      <div class="max-w-full text-center overflow-auto">
        <div
          v-if="board"
          ref="domBoard"
          class="inline-flex flex-col space-y-[2px]"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerleave="highlightFlag = false"
          @click="onClick"
          @click.right="onRightClick"
          @contextmenu.prevent
        >
          <div
            v-for="(_, y) in board.h"
            class="flex space-x-[2px]"
          >
            <Item
              v-for="(_, x) in board.w"
              :style="{
                width: `${itemWidth}px`,
                height: `${itemWidth}px`,
              }"
              :meta="grids[model.posToUid({ x, y })]"
              :highlight="highlightFlag && highlightList.includes(model.posToUid({ x, y }))"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-center space-x-3">
        <label
          for="toggleQuick"
          class="btn btn-classic w-20"
        >
          <input
            id="toggleQuick"
            type="checkbox"
            v-model="fastModel"
            class="mr-2"
          />
          <span class="text-base">{{ GridLabelPresets.fast }}</span>
        </label>
        <label
          for="toggleFlag"
          class="btn btn-classic w-20"
        >
          <input
            id="toggleFlag"
            type="checkbox"
            v-model="flagModel"
            class="mr-2"
          />
          <span class="text-base">{{ GridLabelPresets.flag }}</span>
        </label>
      </div>
    </div>
  </GameBox>

  <Modal
    v-model="showResumeDialog"
    title="恢复对局 🤔"
    @onOk="tryResume"
    @onCancel="closeResumeDialog"
  >
    <div class="flex flex-col items-center p-2">
      <div>
        有上次未完成的对局
        <span class="text-sm">({{ new Date(storageData.timer.start).toLocaleString() }})</span>
      </div>
      <div>是否继续?</div>
    </div>
  </Modal>
</template>

<style scoped>
.btn {
  @apply inline-flex justify-center items-center cursor-pointer border-base rounded px-2 py-0.75;
}

.btn-classic {
  @apply bg-black/5 text-[#0f0f0f] hover:bg-black/10 dark:bg-white/10 dark:text-[#f1f1f1] dark:hover:bg-white/20;
}

.btn-highlight {
  @apply bg-[#0f0f0f] text-white hover:bg-[#030303] dark:bg-[#f1f1f1] dark:text-[#0f0f0f] hover:dark:bg-white;
}
</style>
