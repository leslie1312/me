import { h } from "vue"
import Theme from "vitepress/theme-without-fonts"
import "uno.css"
import "./styles/custom.css"
import T from "./components/T.vue"

export const theme: typeof Theme = {
  ...Theme,
  // @ts-ignore
  Layout: () => h(Theme.Layout, null, {}),
  enhanceApp: ({ app }) => {
    app.component("T", T)
  },
}
