<script lang="ts" setup>
import { navConfig } from "../config"
</script>

<template>
  <footer
    class="flex flex-col gap-y-2 pb-4 justify-center items-center text-sm text-[--vp-c-text-2] sm:flex-row sm:gap-x-32"
  >
    <p class="me-0 sm:me-4">Copyright &copy; 2023 Leslie Tse</p>
    <nav class="flex gap-x-2 md:display-none">
      <a
        v-for="item in navConfig"
        :href="item.link"
        class="hover:text-[--vp-c-brand] px-2"
      >
        {{ item.text }}
      </a>
    </nav>
  </footer>
</template>
