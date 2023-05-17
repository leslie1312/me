import { promises as fs } from "fs"
import fg from "fast-glob"
import { r } from "./alias"

const epDir = r("src/ep").replace(/\\/g, "/")
const saveDir = r("docs/notes").replace(/\\/g, "/")

async function main() {
  const files = await fg("**/readme.md", {
    cwd: epDir,
  })
  for (const file of files) {
    const from = `${epDir}/${file}`
    const to = `${saveDir}/${file.replace("/readme.md", ".md")}`
    await fs.copyFile(from, to)
  }
}

main()