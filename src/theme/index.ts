import { h } from "vue"
import Theme from "vitepress/theme-without-fonts"
import "uno.css"

export const theme = {
  ...Theme,
  Layout: () => {
    return h(Theme.Layout, null)
  },
}
