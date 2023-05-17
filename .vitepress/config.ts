import { defineConfig } from "vitepress"
import { vitePlugins } from "../src/utils/vitePlugins"
import { alias } from "../src/utils/alias"
import { themeConfig } from "../src/theme/config"

export default defineConfig({
  srcDir: "./docs",

  lang: "zh-CN",
  title: "fanのblog",
  description: "just a blog",

  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
  },

  vite: {
    server: {
      host: true,
      port: 5530,
    },
    resolve: { alias },
    plugins: [...vitePlugins],
  },

  themeConfig,
})
