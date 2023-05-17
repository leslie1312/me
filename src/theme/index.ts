import { h } from "vue"
import Theme from "vitepress/theme"
import "./styles/custom.css"
import "uno.css"
// @ts-ignore
import nprogress from "nprogress"
import HomePage from "./components/HomePage.vue"
import Footer from "./components/Footer.vue"
import T from "./components/T.vue"

const isInBrowser = typeof window !== "undefined"

export const theme: typeof Theme = {
  ...Theme,
  // @ts-ignore
  Layout: () =>
    h(Theme.Layout, null, {
      "home-features-after": () => h(HomePage),
      "layout-bottom": () => h(Footer),
    }),

  enhanceApp({ app, router }) {
    app.component("T", T)

    if (isInBrowser) {
      const { onBeforeRouteChange, onAfterRouteChanged } = router
      router.onBeforeRouteChange = to => {
        nprogress.start()
        onBeforeRouteChange?.(to)
      }
      router.onAfterRouteChanged = to => {
        nprogress.done()
        onAfterRouteChanged?.(to)
      }
    }
  },
}
