<script lang="ts" setup>
import { useIntervalFn, useTimestamp, useWebWorkerFn } from "@vueuse/core"
import { nQueens$2 } from "./solutions"
import IconQueen from "./icon-queen.vue"
import { computed, ref, watch, watchEffect } from "vue"

const MAX = 15
const n = ref(8)

const solving = ref(false)
const playing = ref(false)
const results = ref<number[][]>([])
const index = ref(1)

const total = computed(() => results.value.length)
const current = computed(() => results.value[index.value - 1])
const loading = computed(() => solving.value && n.value > 13)

const stamp = useTimestamp()
const start = ref(0)
const timer = ref("?")
const forbiddenPlace = ref<number[]>([])

const { workerFn, workerTerminate } = useWebWorkerFn(nQueens$2)
const { resume, pause } = useIntervalFn(() => toggleIndex(index.value + 1), 2000, {
  immediate: false,
})

watch(n, () => doCalculate())
watch(playing, () => (playing.value ? resume() : pause()))

watchEffect(() => {
  if (solving.value) {
    const ms = Math.max(stamp.value - start.value, 10)
    timer.value = (ms / 1000).toFixed(2)
  }
})

doCalculate()

function doCalculate() {
  start.value = Date.now()
  forbiddenPlace.value = Array(4)
  solving.value = true
  pause()
  workerFn(n.value)
    .then(value => {
      solving.value = false
      results.value = JSON.parse(value)
      index.value = 1
      playing.value && resume()
    })
    .catch(() => {
      terminateCalculate()
    })
}

function terminateCalculate() {
  workerTerminate()
  n.value = 8
}

function toggleIndex(value: number) {
  if (solving.value) {
    return
  }
  value = value < 1 ? total.value : value
  value = value > total.value ? 1 : value
  index.value = value
}

function setForbiddenPlace(x: number, y: number) {
  if (forbiddenPlace.value[0] == x && forbiddenPlace.value[1] == y) {
    forbiddenPlace.value = Array(4)
  } else {
    forbiddenPlace.value = [x, y, x + y, x - y]
  }
}
</script>

<template>
  <div class="space-y-3">
    <!-- input -->
    <div class="flex items-center space-x-3">
      <div class="text-3xl font-bold">N</div>
      <div class="text-2xl">=</div>
      <div class="flex border-base rounded">
        <button
          class="w-8 text-center bg-gray-400/20"
          @click="n -= 1"
          :disabled="n == 1 || solving"
        >
          ➖
        </button>
        <input
          class="w-16 p-1 text-center text-xl"
          v-model="n"
          readonly
        />
        <button
          class="w-8 text-center bg-gray-400/20"
          @click="n += 1"
          :disabled="n == MAX || solving"
        >
          ➕
        </button>
      </div>
      <div class="text-sm self-end">N不超过{{ MAX }}</div>
      <div
        v-if="loading"
        class="btn text-sm self-end"
        @click="terminateCalculate()"
      >
        取消
      </div>
    </div>

    <!-- output -->
    <div class="flex items-center space-x-2">
      <div class="text-sm">找到</div>
      <div class="inline-block min-w-10 text-center border-b border-b-solid">
        {{ solving ? "🤔" : total }}
      </div>
      <div class="text-sm">种摆法</div>
      <div class="ml-2 text-sm">用时</div>
      <div class="inline-block min-w-10 text-center border-b border-b-solid">
        {{ timer }}
      </div>
      <div class="text-sm">秒</div>
    </div>

    <!-- board -->
    <div class="inline-block max-w-full relative border-base rounded-lg pt-5 pr-5 overflow-hidden">
      <div class="relative">
        <div class="relative ml-8 overflow-auto">
          <div
            v-for="y in n"
            :key="y"
            class="flex relative"
          >
            <button
              v-for="x in n"
              :key="x"
              :class="[
                (y + x) % 2 ? 'bg-amber-600' : 'bg-orange-300',
                x == forbiddenPlace[0] && y == forbiddenPlace[1]
                  ? 'border-3px border-dashed border-gray-800'
                  : '',
              ]"
              class="h-9 w-9 flex flex-shrink-0 items-center justify-center"
              hover="border-3px border-dashed border-gray-800"
              @click="setForbiddenPlace(x, y)"
            >
              <IconQueen
                v-if="total && current[y - 1] == x - 1"
                class="w-7 h-7 transition-color"
                :class="[
                  x == forbiddenPlace[0] ||
                  y == forbiddenPlace[1] ||
                  x + y == forbiddenPlace[2] ||
                  x - y == forbiddenPlace[3]
                    ? 'text-[#eee]'
                    : 'text-[#222]',
                ]"
              />
              <div
                v-else-if="
                  !(x == forbiddenPlace[0] && y == forbiddenPlace[1]) &&
                  (x == forbiddenPlace[0] ||
                    y == forbiddenPlace[1] ||
                    x + y == forbiddenPlace[2] ||
                    x - y == forbiddenPlace[3])
                "
                class="i-bi-x-circle-fill text-[#222]"
              />
            </button>
          </div>
          <div class="inline-flex flex-shrink-0">
            <div
              v-for="x in n"
              :key="x"
              class="h-8 w-9 text-center leading-8"
            >
              {{ String.fromCharCode(96 + x) }}
            </div>
          </div>
        </div>
        <div class="absolute left-0 top-0 flex flex-col">
          <div
            v-for="y in n"
            :key="y"
            class="w-8 h-9 leading-9 text-center"
          >
            {{ n - y + 1 }}
          </div>
        </div>
      </div>
      <Transition name="fade">
        <div
          v-if="loading"
          class="absolute inset-0 bg-white/70 dark:bg-black/70 rounded flex items-center justify-center"
        >
          <svg
            class="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <g transform="rotate(-90 12 12)">
              <path
                fill="currentColor"
                d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"
              />
            </g>
          </svg>
        </div>
      </Transition>
    </div>

    <div
      v-if="!loading"
      class="flex items-center"
    >
      <button
        :title="playing ? '点击停止轮播' : '点击自动轮播'"
        :class="playing ? 'i-bi-pause-circle' : 'i-bi-play-circle'"
        class="w-9 h-9 mr-6"
        @click="playing = !playing"
      ></button>
      <div class="flex items-center space-x-2">
        <div class="text-sm">当前第</div>
        <div class="flex rounded border-base">
          <button
            class="flex items-center justify-center w-8 bg-gray-400/20"
            @click="toggleIndex(index - 1)"
          >
            <div class="i-bi-chevron-left" />
          </button>
          <input
            class="w-20 p-1 text-center text-base"
            v-model="index"
            @change="toggleIndex(index)"
            @keydown.enter="toggleIndex(index)"
          />
          <button
            class="flex items-center justify-center w-8 bg-gray-400/20"
            @click="toggleIndex(index + 1)"
          >
            <div class="i-bi-chevron-right" />
          </button>
        </div>
        <div class="text-sm">种摆法</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
