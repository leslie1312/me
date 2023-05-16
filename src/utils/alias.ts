import { resolve } from "node:path"

export const r = (path = "", base = process.cwd()) => resolve(base, path)

export const rootPath = r()
export const docsPath = r("docs")
export const srcPath = r("src")
export const resPath = r("res")

export const alias: Record<string, string> = {
  "~/": `${rootPath}/`,
  "@/": `${srcPath}/`,
}
