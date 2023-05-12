import type { PluginOption } from "vite"
import Unocss from "unocss/vite"
import Inspect from "vite-plugin-inspect"

export const vitePlugins: PluginOption[] = [Unocss(), Inspect()]
