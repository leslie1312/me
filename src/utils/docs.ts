import { resolve } from "node:path";
import fs from "fs-extra";
import fg from "fast-glob";
import sg from "simple-git";
import gm from "gray-matter";
import { r, rootPath } from "./alias";

export interface PostItemProps {
  title: string;
  description?: string;
  cover?: string;
  tags?: string[];
  order?: number;
  path: string;
  date: string;
  mtime: string | number;
}

export async function dump(entryDir: string) {
  // normalize
  entryDir = entryDir.replace(/\\/g, "/");
  const posts = await fg("**/*.md", {
    cwd: entryDir,
    onlyFiles: true,
    ignore: ["**/index.md", "*.md"],
  });

  const git = sg(rootPath);
  const postItems = (
    await Promise.all(
      posts.map(async (filepath) => {
        const path = resolve(entryDir, filepath);
        const content = await fs.readFile(path, "utf-8");
        const { data } = gm(content);
        const { title, description, cover, tags, order, date } = data;
        if (title && date) {
          return {
            title,
            description,
            cover,
            tags,
            order,
            path: filepath.replace(/\.md$/, ""),
            date: formatDate(date),
            mtime: +(await git.raw(["log", "-1", "--format=%at", path])),
          } as PostItemProps;
        }
      })
    )
  )
    .filter((item): item is PostItemProps => !!item)
    .sort((a, b) => comparePostItem(a, b));
  return postItems;
}

function comparePostItem(a: PostItemProps, b: PostItemProps) {
  const ao = a.order ?? 0;
  const bo = b.order ?? 0;
  if (ao == bo) {
    return Date.parse(b.date) - Date.parse(a.date);
  }
  return ao - bo;
}

function formatDate(date: string) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
  return new Date(date).toLocaleDateString("zh-CN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function main() {
  const results = await dump(r("docs"));
  await fs.writeJSON(resolve(r("res"), "docs.json"), results, { spaces: 2 });
}

main();
