import { resolve } from "node:path";

export const r = (path = "", base = process.cwd()) => resolve(base, path);

export const rootPath = r();
export const srcPath = r("src");

export const alias: Record<string, string> = {
  "~/": `${rootPath}/`,
  "@/": `${srcPath}/`,
};
