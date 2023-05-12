<script lang="ts" setup>
interface Props {
  modelValue: boolean
  title?: string
  appendToBody?: boolean
  maskClosable?: boolean
  btnOkLabel?: string
  btnCancelLabel?: string
}

withDefaults(defineProps<Props>(), {
  appendToBody: true,
  maskClosable: true,
  btnOkLabel: "确认",
  btnCancelLabel: "取消",
})

defineEmits(["update:modelValue", "onOk", "onCancel"])
</script>

<template>
  <Teleport
    to="body"
    :disabled="!appendToBody"
  >
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        @click="maskClosable && $emit('onCancel')"
      >
        <div
          class="relative mx-4 w-full max-w-md rounded-md bg-white p-6 shadow dark:bg-[#1f1f1f] md:m-auto"
        >
          <template v-if="title || $slots.header">
            <slot name="header">
              <div class="mb-2 text-lg">{{ title }}</div>
            </slot>
          </template>
          <slot />
          <slot name="footer">
            <div class="flex flex-col items-center gap-2 pt-3 md:flex-row md:justify-end">
              <div
                class="btn h-8 w-full bg-black/5 text-[#0f0f0f] hover:bg-black/10 dark:bg-white/10 dark:text-[#f1f1f1] dark:hover:bg-white/20 md:w-20"
                @click.stop="$emit('onCancel')"
              >
                {{ btnCancelLabel }}
              </div>
              <div
                class="btn h-8 w-full bg-[#1677ff] text-white hover:bg-[#4096ff] dark:bg-[#1668dc] hover:dark:bg-[#3c89e8] md:w-20"
                @click.stop="$emit('onOk')"
              >
                {{ btnOkLabel }}
              </div>
            </div>
          </slot>
        </div>
      </div>
    </Transition>
  </Teleport>
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
