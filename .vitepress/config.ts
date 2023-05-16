import { defineConfig } from "vitepress"
import { alias, vitePlugins } from "../src/utils"
import { themeConfig } from "../src/theme/config"

export default defineConfig({
  srcDir: "./docs",

  title: "blog",
  description: "just a blog",
  lang: "zh-CN",

  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
  },

  vite: {
    resolve: { alias },
    plugins: [...vitePlugins],
    server: {
      port: 5530,
      host: true,
    },
  },

  themeConfig,
})
