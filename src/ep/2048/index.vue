<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { locales } from "./config.json"
import Item from "./item.vue"
import { use2048 } from "./use2048"
import GameBox from "@/theme/components/GameBox.vue"

const domBoard = ref<HTMLElement>()
const { gg, best, score, tiles, init, preset, nextPreset } = use2048(domBoard)

const gameTitle = computed(() => preset.value.getTileLabel(11))
const itemLength = ref(4.5 /**rem */)
const itemLengthStyle = computed(() => ({
  width: `${itemLength.value}rem`,
  height: `${itemLength.value}rem`,
}))

watch(score, (value, oldValue) => {
  const diff = value - oldValue
  if (diff > 0) {
    // const domScore = document.createElement("div")
    // domScore.classList.add("score")
    // domScore.textContent = `+${diff}`
    // domBoard.value?.appendChild(domScore)
    // setTimeout(() => {
    //   domBoard.value?.removeChild(domScore)
    // }, 500)
  }
})
</script>

<template>
  <GameBox>
    <div class="inline-block max-w-full space-y-2 rounded-md">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div
            class="title-2048 w-32 cursor-pointer self-stretch rounded p-2 text-center text-4xl font-bold"
            @click="nextPreset()"
          >
            {{ gameTitle }}
          </div>
          <div class="ml-2 flex space-x-2 self-end">
            <div class="flex w-20 flex-col items-center rounded bg-orange-600/30 py-0.5">
              <div>{{ locales.score }}</div>
              <div class="text-xl font-bold">{{ score }}</div>
            </div>
            <div class="flex w-20 flex-col items-center rounded bg-orange-600/30 py-0.5">
              <div>{{ locales.best }}</div>
              <div class="text-xl font-bold">
                {{ best }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="ml-2 underline underline-offset-4">
            {{ locales.caption }}&nbsp;{{ gameTitle }}
          </div>
          <div
            class="w-[5.5rem] cursor-pointer rounded bg-yellow-600/40 py-2 text-center text-xl"
            @click="init()"
          >
            {{ locales.new }}
          </div>
        </div>
      </div>

      <div
        class="relative"
        @touchmove.stop.prevent
      >
        <div class="relative inline-block rounded bg-[#bbada0] p-3">
          <div class="flex space-x-3">
            <div
              v-for="_ in 4"
              class="flex flex-col space-y-3"
            >
              <div
                v-for="_ in 4"
                class="rounded bg-[#eee4da] opacity-30"
                :style="itemLengthStyle"
              ></div>
            </div>
          </div>

          <div
            class="absolute inset-0 p-3"
            ref="domBoard"
          >
            <template
              v-for="tile in tiles"
              :key="tile.key"
            >
              <Item
                :preset="preset"
                :level="tile.level"
                :style="{
                  ...itemLengthStyle,
                  transform: `translate(${(itemLength + 0.75) * tile.x}rem, ${
                    (itemLength + 0.75) * tile.y
                  }rem)`,
                }"
              />
            </template>
          </div>
        </div>

        <Transition name="gg">
          <div
            v-if="gg"
            class="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(238,228,218,.5)] p-3 dark:bg-black/50"
          >
            <div class="mb-3 text-5xl font-bold">Game Over</div>
            <button
              class="w-20 rounded bg-yellow-500 py-2 text-xl"
              @click="init()"
            >
              {{ locales.again }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </GameBox>
</template>

<style scoped>
.gg-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.gg-enter-active {
  transition: opacity 0.5s ease, transform 0.7s ease;
  transition-delay: 1.2s;
}

.title-2048 {
  color: #f9f6f2;
  background: #edc22e;
}
</style>
