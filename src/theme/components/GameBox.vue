<script lang="ts" setup>
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="relative -ml-4 mt-3 w-screen text-center md:ml-0 md:w-full">
    <div
      class="inline-flex-center max-w-full overflow-auto flex-col rounded-md shadow border-base transition p-4"
    >
      <div
        class="flex-center -mt-1 mb-2"
        v-if="title"
      >
        <div>{{ title }}</div>
      </div>
      <slot />
    </div>
  </div>
</template>
