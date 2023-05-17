---
date: 2023.2.26
title: 八皇后问题
description: 动态展示八皇后问题的摆放方案
---

# 八皇后问题

## 问题描述

如何能够在 8×8 的国际象棋棋盘上放置八个皇后，使得任何一个皇后都无法直接吃掉其他的皇后？
即要求任两个皇后都不能处于同一条横行、纵行或对角线上。

## 摆法展示

<script lang="ts" setup>import C from '@/ep/n-queens/index.vue'</script>

<ClientOnly><C /></ClientOnly>

## 代码示例

<T title="基于回溯思路的解法参考">

```ts
function nQueens(n = 8) {
  const results: number[][] = []
  const rows: number[] = Array(n)
  const cols: boolean[] = Array(n)
  const deg1: boolean[] = Array(n * 2)
  const deg2: boolean[] = Array(n * 2)
  backtrack()
  return results

  function backtrack(row = 0) {
    if (row === n) {
      results.push(rows.slice())
      return
    }
    for (let col = 0; col < n; col++) {
      const d1 = row + col
      const d2 = row - col + n
      if (cols[col] || deg1[d1] || deg2[d2]) {
        continue
      }
      rows[row] = col
      cols[col] = true
      deg1[d1] = true
      deg2[d2] = true
      backtrack(row + 1)
      cols[col] = false
      deg1[d1] = false
      deg2[d2] = false
    }
  }
}
```

</T>

## 参考链接

1. [Eight_queens_puzzle | wiki](https://en.wikipedia.org/wiki/Eight_queens_puzzle)
2. [n-queens | leetcode](https://leetcode.cn/problems/n-queens/)
