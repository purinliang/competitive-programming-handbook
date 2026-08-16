# DFS、回溯与剪枝

> 最近修订：2026-08-16 16:11 +10:00（未审阅）

[状态空间与隐式图](state-space-and-implicit-graphs.md) 已经把部分方案看成点、把下一次选择看成边；[排列枚举](permutation-enumeration.md) 又通过选择、递归和撤销维护了当前路径的占用状态。

本篇不再重新定义隐式搜索树，而是用 N 皇后回答两个新的问题：怎样判断当前部分方案已经不可能完成，以及为什么可以安全地跳过它的全部后代。这个过程把回溯从“避免重复选择”推进到一般的可行性剪枝。

## N 皇后问题

在一个 $n\times n$ 的棋盘上放置 $n$ 个皇后，要求任意两个皇后都不在同一行、同一列或同一条对角线上。给定 $n$，统计一共有多少种摆放方案。

例如 $n=4$ 时，一种合法方案是：

```text
. Q . .
. . . Q
Q . . .
. . Q .
```

每一行和每一列恰好有一个 `Q`，任意一条对角线也至多经过一个 `Q`。

若直接考虑棋盘上的每个格子选或不选，一共有 $2^{n^2}$ 个子集，其中绝大多数连“恰好放置 $n$ 个皇后”都不满足。问题已经要求每行至多一个皇后，而总共又要放 $n$ 个，所以每一行必须恰好放一个皇后。

因此可以把问题改写为 $n$ 次选择：

```text
第 1 行选择一个列号
第 2 行选择一个列号
...
第 n 行选择一个列号
```

每行有 $n$ 个候选列，暂时不检查冲突时共有 $n^n$ 个完整选择。这个搜索空间仍然很大，但已经让递归层数和每层任务变得明确。

## 搜索状态

令 `row` 表示当前准备放置皇后的行。进入 `dfs(row)` 时，前 `row - 1` 行已经完成选择，当前函数负责枚举第 `row` 行的列：

```cpp
void dfs(int row) {
    for (int column = 1; column <= n; column++) {
        // 选择在 (row, column) 放置皇后
        dfs(row + 1);
    }
}
```

`row` 不只是循环计数器，而是搜索状态已经推进到哪一个阶段。每次递归都令它增加 `1`，所以这棵隐式搜索树没有环：

- 根节点是“还没有选择任何行”；
- 第 $k$ 层表示前 $k$ 行已经各自选择一列；
- 从一个状态出发的每个分支表示当前行选择一个不同列号；
- 深度为 $n$ 的叶子表示一个完整摆放。

这些性质直接复用[状态空间与隐式图](state-space-and-implicit-graphs.md)中的模型。这里新增的重点是：只有不与已有皇后冲突的列才会真正形成下一层状态。

## 终止条件

当 `row == n + 1` 时，第 `1..n` 行都已经放置皇后。若此前每一步都只接受没有冲突的选择，此时就得到一种合法方案。

若函数返回当前状态能够产生的方案数，终止状态恰好贡献一种方案：

```cpp
ll dfs(int row) {
    if (row == n + 1) {
        return 1;
    }

    ll ways = 0;
    // 枚举当前行的选择，并把每条分支的方案数加入 ways
    return ways;
}
```

这里的 `1` 表示“当前完整选择本身就是一种方案”，不是棋盘大小或皇后编号。不同分支产生的完整方案不会重合，因此可以把每条分支返回的方案数相加。

终止后必须立即 `return`。若继续枚举第 `n + 1` 行，就会访问问题中不存在的位置。

## 列冲突

逐行放置已经保证任意两个皇后不在同一行。还需要知道某一列是否已经被前面的行使用：

```cpp
vector<bool> used_column;
```

读入 `n` 后再分配并清空：

```cpp
used_column.assign(n + 5, false);
```

尝试 `column` 前先判断：

```cpp
if (used_column[column]) {
    continue;
}
```

若这一列空闲，就暂时占用它，再搜索下一行：

```cpp
used_column[column] = true;
ways += dfs(row + 1);
```

无论下一层找到多少种方案，递归返回后都表示“当前选择的整条分支已经处理完”。接下来还要尝试当前行的其他列，所以必须撤销刚才的占用：

```cpp
used_column[column] = false;
```

完整顺序是：

```cpp
used_column[column] = true;
ways += dfs(row + 1);
used_column[column] = false;
```

这就是回溯（backtracking）：进入一个选择时修改共享状态，离开这个选择时把状态准确恢复到进入之前，让同一层的下一个分支从相同起点继续。

加入列限制后，第 `1` 行最多有 $n$ 个选择，第 `2` 行最多有 $n-1$ 个选择，依次减少。完整候选从 $n^n$ 降为至多 $n!$ 个排列。

## 两类对角线

还需要快速判断 `(row, column)` 是否与已有皇后位于同一条对角线。棋盘坐标具有两个不变量：

- 左上到右下的格子具有相同的 `row - column`；
- 右上到左下的格子具有相同的 `row + column`。

例如 `(1, 2)`、`(2, 3)` 与 `(3, 4)` 的 `row - column` 都是 `-1`，所以它们位于同一条对角线。

当 `row,column` 都在 `1..n` 时：

```text
row - column 的范围：1 - n .. n - 1
row + column 的范围：2 .. 2n
```

差值可能为负，不能直接作为下标。统一加上 `n`：

```cpp
int difference_index = row - column + n;
int sum_index = row + column;
```

两个结果都能放入大小为 `2 * n + 5` 的标记数组：

```cpp
vector<bool> used_difference_diagonal;
vector<bool> used_sum_diagonal;

used_difference_diagonal.assign(2 * n + 5, false);
used_sum_diagonal.assign(2 * n + 5, false);
```

名称直接说明下标来自差还是和，不依赖读者记住 `/` 与 `\` 分别对应哪一种坐标公式。

## 剪枝

尝试一个格子时，只要列或任意一类对角线已经被占用，当前选择就立刻与前面的皇后冲突：

```cpp
if (used_column[column] || used_difference_diagonal[difference_index] ||
    used_sum_diagonal[sum_index]) {
    continue;
}
```

后面继续放置皇后不会移动已经放下的皇后，因此这种冲突不可能在更深层被修复。无需生成这条分支的所有后代，可以直接跳过当前选择。

提前排除不可能产生答案的整棵子树称为剪枝（pruning）。安全剪枝必须同时满足两点：

1. 被跳过的状态确实不可能扩展成合法答案；
2. 判断剪枝的时间明显小于继续搜索整棵子树。

本题的三个数组查询都是 $O(1)$。它们只会删掉已经违反题目条件的分支，不会丢失任何合法摆放。

接受一个格子以后，需要同时标记列和两类对角线：

```cpp
used_column[column] = true;
used_difference_diagonal[difference_index] = true;
used_sum_diagonal[sum_index] = true;
```

递归返回后也必须同时撤销同一组三项：

```cpp
used_column[column] = false;
used_difference_diagonal[difference_index] = false;
used_sum_diagonal[sum_index] = false;
```

少撤销一项会让后续兄弟分支误以为某条线仍被占用；多撤销一项则可能破坏更早层仍然有效的选择。进入和退出必须严格成对。

## 图遍历标记与回溯标记

图 DFS 中的 `visited[u]` 表示“整次遍历已经处理过点 `u`”。再次到达它只会重复工作或沿环递归，所以标记通常永久保留，不在返回时撤销。

N 皇后中的 `used_column[column]` 表示“当前递归路径已经使用这一列”。从当前选择返回到上一层后，这个皇后已经不属于新的候选方案，所以标记必须撤销。

| 标记 | 描述的范围 | 递归返回后 |
| --- | --- | --- |
| 图遍历的 `visited[u]` | 整次遍历是否已经访问点 `u` | 通常保留 |
| 回溯的 `used_column[column]` | 当前选择路径是否占用这一列 | 必须恢复 |

两种代码都使用 DFS 的递归形状，但状态含义不同。不能看见 `bool` 标记就机械决定是否撤销，必须先说清楚它描述“整次搜索历史”还是“当前分支”。

## 题目共享状态

棋盘大小和三组占用标记是这道题全局唯一、并且会被 `solve` 与每层 `dfs` 共同维护的状态，因此按照本书的一次性竞赛题解风格使用全局变量：

```cpp
int n;
vector<bool> used_column;
vector<bool> used_difference_diagonal;
vector<bool> used_sum_diagonal;
```

`solve` 读入 `n` 后使用 `assign` 同时分配并清空状态：

```cpp
used_column.assign(n + 5, false);
used_difference_diagonal.assign(2 * n + 5, false);
used_sum_diagonal.assign(2 * n + 5, false);
```

这样 `dfs(row)` 只接收当前过程真正变化的行号，不必在每层重复传递同一份棋盘状态；再次调用 `solve` 时，旧标记也会被完整重置。若以后需要在同一个程序中同时维护多个独立棋盘求解器，再把这些状态封装为 `struct`，而不是为了形式感提前增加对象接口。

## 递归不变量

进入 `dfs(row)` 时始终维护以下事实：

1. 第 `1..row-1` 行各有一个皇后；
2. 这些皇后互不攻击；
3. 三组 `used` 数组准确描述这些皇后占用的列和对角线；
4. 第 `row..n` 行还没有做出选择。

初始调用 `dfs(1)` 时，前三项对空集合自然成立。

枚举当前行时，只接受三组标记都未占用的格子，所以新皇后不会攻击任何已有皇后。设置标记以后调用 `dfs(row + 1)`，不变量继续成立。递归返回并撤销三项标记后，又准确恢复为当前行尚未选择的状态，可以尝试下一列。

到达 `row == n + 1` 时，每一行都有皇后，并且没有任何冲突，所以计数的每个方案都合法。

反过来，任取一种合法方案。它在每一行都有唯一列号；DFS 会依次枚举到这些列。由于方案合法，这条选择路径不会被三个冲突判断剪掉，最终一定到达终止条件。因此算法不会遗漏合法方案。

不同方案至少有一行的列号不同，对应搜索树中的不同分支，所以同一种方案也不会被重复计数。

## 完整代码

输入满足 `1 <= n <= 14`，程序输出 N 皇后摆放方案数：

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

int n;
vector<bool> used_column;
vector<bool> used_difference_diagonal;
vector<bool> used_sum_diagonal;

ll dfs(int row) {
    if (row == n + 1) {
        return 1;
    }

    ll ways = 0;
    for (int column = 1; column <= n; column++) {
        int difference_index = row - column + n;
        int sum_index = row + column;

        if (used_column[column] || used_difference_diagonal[difference_index] ||
            used_sum_diagonal[sum_index]) {
            continue;
        }

        used_column[column] = true;
        used_difference_diagonal[difference_index] = true;
        used_sum_diagonal[sum_index] = true;

        ways += dfs(row + 1);

        used_column[column] = false;
        used_difference_diagonal[difference_index] = false;
        used_sum_diagonal[sum_index] = false;
    }
    return ways;
}

void solve() {
    scanf("%d", &n);

    used_column.assign(n + 5, false);
    used_difference_diagonal.assign(2 * n + 5, false);
    used_sum_diagonal.assign(2 * n + 5, false);

    printf("%lld\n", dfs(1));
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
4
```

输出：

```text
2
```

`n = 1` 时唯一格子本身就是一种方案，所以答案为 `1`；`n = 2` 和 `n = 3` 时没有合法方案，答案为 `0`。

## 复杂度

列标记保证一条递归路径不会重复选择列。忽略对角线剪枝时，深度为 $k$ 的状态最多对应从 $n$ 列中依次选择 $k$ 个不同列，因此整棵搜索树包含 $O(n!)$ 个状态。每个尚未完成的状态仍会检查至多 $n$ 个候选列，每次冲突判断、标记和撤销都是 $O(1)$，所以这份直接实现的时间复杂度上界是 $O(n\cdot n!)$。

对角线剪枝会在实际搜索中排除大量排列，但不会把最坏情况变成多项式时间。回溯的性能高度依赖约束强弱、选择顺序和剪枝质量，不能只看代码中每层有一个 `for` 就把时间复杂度误写成 $O(n^2)$。

递归深度为 $n$，三组标记数组都只包含 $O(n)$ 个元素，因此额外空间复杂度是 $O(n)$。程序只统计方案数，不保存全部方案；若输出所有方案，输出本身还需要与答案总量成正比的时间。

## 常见错误

### 把回溯标记永久保留

若递归返回后不撤销标记，第一条分支使用过的列和对角线会错误地禁止后面的兄弟分支，导致遗漏答案。

### 在递归以前撤销

必须让下一层看见当前皇后已经占用的三条线。若设置后立刻撤销再递归，下一层就可能把皇后放在冲突位置。

### 只撤销部分状态

进入分支时修改了列和两类对角线，退出时就必须恢复全部三项。修改与撤销最好在代码中保持相同顺序和相邻结构，方便逐项检查。

### 忘记终止后返回

完成第 `n` 行以后应立即贡献一个方案并返回。继续处理第 `n + 1` 行会破坏状态定义和数组边界。

### 直接使用负的对角线编号

`row - column` 可能为负。本篇加上 `n` 后再作为下标，数组容量也按照 `2 * n + 5` 分配。

### 没有证明剪枝安全

“看起来不太可能成功”不能成为剪枝条件。若无法证明被跳过的状态一定没有答案，剪枝可能只是让程序更快地得到错误结果。

## 基础练习

1. 手动画出 `n = 3` 时前两层搜索树，并指出每个被列冲突或对角线冲突剪掉的分支。
2. 加入 `position[row]` 保存当前行选择的列，在找到第一种方案时打印棋盘。
3. 修改程序，输出全部方案。说明为什么打印完成后仍然必须回溯，不能在第一个方案处结束整个搜索。
4. 把计数问题改成“是否至少存在一种方案”。找到答案后让递归返回 `true`，并实现提前停止。
5. 给定一个含障碍格子的棋盘，只允许在可用格子放置皇后；在枚举列时增加哪一项判断即可？
6. 用排列枚举所有列互不相同的方案，再检查对角线；比较它与逐层对角线剪枝访问的状态数量。

## 需要记住什么

1. 没有显式图时，连续选择为什么仍能形成一棵隐式搜索树？
2. `dfs(row)` 中的 `row` 准确表示什么？
3. 回溯的“选择—递归—撤销”三步分别修改什么？
4. 为什么图遍历的 `visited` 通常不撤销，而当前路径的占用标记必须撤销？
5. 同一条两类对角线分别保持哪个坐标表达式不变？
6. 什么条件才能作为安全剪枝？
7. 递归不变量怎样证明算法不会产生非法方案、遗漏方案或重复计数？
8. 加入剪枝以后，为什么仍不能把回溯算法视为多项式时间？

本篇只讲可行性约束带来的基础剪枝。最优化搜索中的上下界估计、选择顺序启发式、记忆化搜索、迭代加深与双向搜索各自具有新的模型，应在对应专题中单独学习。
