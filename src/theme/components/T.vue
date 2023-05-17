<script lang="ts" setup>
import { computed, ref } from "vue"

const props = defineProps<{
  title?: string
  defaultOpen?: boolean
}>()

const open = ref(props.defaultOpen)
const logo = computed(() => (open.value ? "i-carbon-data-enrichment rotate-180" : "i-carbon-idea"))
</script>

<template>
  <div
    class="btn px-4 py-1.5 hover:shadow space-x-3"
    @click="open = !open"
  >
    <div :class="[logo, 'transition-transform']" />
    <div
      v-if="title"
      class="text-sm"
    >
      {{ title }}
    </div>
  </div>

  <Transition name="fade">
    <div v-if="open">
      <slot />
    </div>
  </Transition>
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
