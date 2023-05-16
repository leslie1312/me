export const siteConfig = {}

export const lastConfig = [
  { text: "导航", link: "/nav" },
  { text: "轻语", link: "/one" },
  { text: "关于", link: "/about" },
]

export const navConfig = [
  { text: "首页", link: "/" },
  { text: "日常", link: "posts/", activeMatch: "posts" },
  { text: "笔记", link: "notes/", activeMatch: "notes" },
  {
    text: "Last",
    items: lastConfig,
  },
]

export const themeConfig = {
  nav: navConfig,
  sidebar: {
    notes: [
      {
        text: "阅读与练习",
        collapsed: true,
        items: [
          { text: "TypeScript Handbook", link: "/notes/ts-handbook" },
          { text: "TypeScript 类型体操", link: "/notes/ts-type-gym" },
          { text: "TypeScript 类型挑战", link: "/notes/ts-type-challenges" },
          { text: "Git 撤销操作", link: "/notes/git-undo" },
          { text: "Git 分支操作", link: "/notes/git-branch" },
        ],
      },
      {
        text: "休闲小游戏",
        collapsed: true,
        items: [
          { text: "2048", link: "/notes/g-2048" },
          { text: "扫雷", link: "/notes/g-minesweeper" },
          { text: "滑动拼图", link: "/notes/g-sliding-puzzle" },
        ],
      },
      {
        text: "数据展示",
        collapsed: true,
        items: [{ text: "八皇后问题", link: "/notes/q-n-queens" }],
      },
      {
        text: "组件设计",
        collapsed: true,
        items: [],
      },
    ],
  },
}
