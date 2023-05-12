---
date: 2023.3.6
title: Git 撤销操作
outline: [2, 3]
---

# Git 撤销操作

> 记录一些 Git 撤销操作中的常用命令和应用情境

## reset 与 revert

### 使用 git reset

用于将 HEAD 重置到指定的某次提交。  
有以下三种模式可供选择：

- `--mixed`：默认值，会清空暂存区，但是改动还保存在工作目录中
- `--soft`： 不会改动暂存区，工作目录的变动还会保留，仅移动了 HEAD 指针
- `--hard`： 清空暂存区，工作目录中的变动也会被清空

实践记录下这三者的区别：

::: code-group

```bash [每次操作前的状态]
$ git status -u
 M README.md     # 已修改还未暂存的文件
A  new.md        # 新添加到暂存区的文件
M  package.json  # 已修改并且暂存的文件
?? untracked.md  # 新添加的还没有被追踪的文件
```

```bash [执行 git reset --mixed]
$ git reset HEAD
Unstaged changes after reset:
M       README.md
M       package.json

$ git status -s
 M README.md
 M package.json
?? new.md
?? untracked.md
```

```bash [执行 git reset --soft]
$ git reset --soft HEAD

$ git status -s
 M README.md
A  new.md
M  package.json
?? untracked.md
```

```bash [执行 git reset --hard]
$ git reset --hard HEAD
HEAD is now at 995624923 fix(components): <commit message...>
$ git status -s
?? untracked.md
```

:::

| 文件名       | 操作前状态   | mixed           | soft   | hard        |
| ------------ | ------------ | --------------- | ------ | ----------- |
| README.md    | 修改后未暂存 | 无变化          | 无变化 | => 改动被删 |
| package.json | 修改后已暂存 | => 修改后未暂存 | 无变化 | => 改动被删 |
| new.md       | 新添加已暂存 | => 新添加未暂存 | 无变化 | => 改动被删 |
| untracked.md | 新添加未暂存 | 无变化          | 无变化 | 无变化      |

### 🔙 回撤 git reset

如果 `git reset` 后需要撤销， 可以继续执行 `git reset <commit-id>`。  
使用 `git reflog` 显示引用的历史版本记录，这样就可以找到撤销前的 commit-id 值。

### 🔙 回撤 git reset --hard

使用前如果不放心，可以先 `git commit` 一下，确保改动都被 git 追踪到。  
这样后面即使发现误删，也有补救的机会。

### 使用 git revert

一种向前的撤销操作，它不会影响已有的提交历史记录。  
而是在反转指定的更改后，创建一个新的提交记录。  
相当于撤销成功后 HEAD 指针向前移动。

默认情况下 revert 后自动创建一个新的提交来反转指定的更改。  
我们可以添加 `-no-commit` 选项（也可使用缩写 `-n` ）来禁止自动提交。

revert 后自动提交失败意味者有文件冲突，需要我们手动合并。

```bash
# 撤销最近的提交
git revert
# 撤销倒数第二次的提交
git revert HEAD~1
# 根据提交sha值撤销指定的某次提交
git revert <commit-id>
# 按范围撤销
# 比如撤销master分支上倒数第五次到倒数第三次（包含）之间的所有提交
# 也可以用对应sha值代替master~5，注意不要搞反起始顺序
git revert -n master~5..master~2
```

### 🔙 回撤 git revert

- 再次使用 git revert （负负得正哈）
- 使用 git reset

### ❓ 选择哪个

诚然，明面上看，使用 reset 回滚代码可以让主分支提交记录看起来更整洁，  
但是缺点就是有丢失提交记录的风险（比如 git reset 撤销后再 git push -f 推送）。  
在都能达到回滚目的的前提下，使用哪个就看 **更偏好于**：

- 尽可能留下完整的提交记录（哪怕它是一次错误的提交，吃一堑长一智）
- 尽可能留下正确的提交记录（删掉出错的提交，给后来人呈现一个干净的提交记录）

## clean 与 rm

### 使用 git clean

用于删除工作目录下**未被 git 追踪**的文件。

- `git clean -n`： 提前告知用户哪些文件会被删除，并不会真的删除
- `git clean -f`： 请谨慎使用任何一个 `-f` 选项 误删了后文件真的找不回来了
- `git clean -df`： `-d` 表示目录 删除未被追踪的空目录
- `git clean -dfx`：删除所有没有被跟踪的文件和目录 包括那些被忽略的文件

### 使用 git rm

用于删除**已被 git 追踪**的文件。

- `git rm <file>`： 将文件从工作区和暂存区中删除
- `git rm -f <file>`： 强制将文件从工作区和暂存区中删除，即使文件有修改
- `git rm --cached <file>`： 将文件从暂存区中删除，但保留在工作区中
- `git rm -r <dir>`： 递归地将目录及其子目录下的所有文件从工作区和暂存区中删除

:::info 对比从资源管理器中删除文件

git rm 删除后会自动将改动提交到暂存区，  
不过现在的图形化工具，git add 这步都会默认包含在 commit 中。

:::

## 应用情境

### 需要撤回 git add 时

- `git restore --staged <file>`： 将指定文件从暂存区恢复到工作目录
- `git restore --staged .`： 将所有文件从暂存区恢复到工作目录
- `git reset <file>`： 将指定文件从暂存区移除
- `git reset .`： 将所有文件从暂存区移除
- `git rm --cached <file>`： 将文件从暂存区中移除

### 撤回撤回 git commit 时

- `git revert <commit>`： 创建一个新的提交，用于撤销指定提交的修改
- `git reset --soft <commit>`： 将当前分支重置到指定提交，并将修改放到暂存区
- `git reset --mixed <commit>`： 将当前分支重置到指定提交，并将修改放到工作目录
- `git reset --hard <commit>`： 将当前分支重置到指定提交，并丢弃所有修改

### 需要撤回 git push 时

- `git revert <commit>`： 创建一个新的提交，用于撤销指定的提交，并将其推送到远程分支
- `git reset --hard <commit>`
  - 将本地分支重置到指定的提交
  - 然后使用 `–force` 选项将其推送到远程分支
  - 注意这会丢失本地和远程的修改
- `git rebase -i <commit>`
  - 使用交互式模式重写本地分支的历史，用于删除或修改不需要的提交
  - 然后使用 `–force` 选项将其推送到远程分支
  - 注意这会改变本地和远程的历史

:::info 个人观点

其实 push 出错时还不可怕，及时把正确的修改再 push 上去就行，怕就怕为了覆盖提交记录而引发其他更大的事故。

:::

### 🤔 困境

假设我接到了一个任务，在修改了位于 src 目录下的某几个文件后，准备下班。但是因为还没有完全搞定，我就先添加到暂存区，打算等明天全部搞完了再提交。  
 结果第二天来的时候我不小心（故意搞事）执行了 `git rm -rf src/*`，那么我昨天的暂存记录还能找回来吗 😢？
