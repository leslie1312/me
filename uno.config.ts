import { defineConfig, presetUno, presetIcons, transformerDirectives } from "unocss"

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  transformers: [transformerDirectives()],
  shortcuts: [
    ["border-base", "border border-solid border-gray-500/40"],
    ["flex-center", "flex justify-center items-center"],
    ["inline-flex-center", "inline-flex justify-center items-center"],

    ["btn", "inline-flex-center cursor-pointer border-base rounded px-2 py-1"],
  ],
})
