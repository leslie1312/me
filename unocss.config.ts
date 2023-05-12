import { defineConfig, presetIcons, presetUno, transformerDirectives } from "unocss"

export default defineConfig({
  shortcuts: [
    {
      "flex-center": "flex items-center justify-center",
      "inline-flex-center": "inline-flex items-center justify-center",
      "border-base": "border border-solid border-gray-400/30",
      btn: "inline-flex-center cursor-pointer border-base rounded px-2 py-1",
    },
  ],

  presets: [
    presetUno(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        height: "1.2em",
        width: "1.2em",
        "vertical-align": "text-bottom",
      },
    }),
  ],

  transformers: [transformerDirectives()],
})
