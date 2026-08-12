# 哈密顿问题：小规模回溯

> 状态：草稿

一般的哈密顿问题没有像 Hierholzer 那样的通用线性算法。点数很小时，可以按路径顺序逐点枚举，并在发现当前选择无法继续时回溯。本篇保存这个可选实现，不属于核心学习路线。

## 路径状态

回溯过程中维护两个状态：

- `path` 保存当前已经选择的点序列；
- `used[u]` 表示点 $u$ 是否已经出现在 `path` 中。

选择起点 `start` 时，先把它加入路径并标记：

```cpp
path.push_back (start);
used[start] = true;
```

位于当前点 `u` 时，只能选择一个尚未使用的相邻点 `v`：

```cpp
for (int v : g[u]) {
    if (used[v]) {
        continue;
    }

    path.push_back (v);
    used[v] = true;

    // 继续搜索

    used[v] = false;
    path.pop_back ();
}
```

递归返回后撤销 `used[v]` 并弹出 `v`，让下一次循环能够尝试另一个选择。这就是回溯：进入一个选择时修改状态，离开时恢复原状。

## 路径终点

当 `path.size() == n` 时，所有点都已经恰好选择一次，因此找到了一条哈密顿路径：

```cpp
if (path.size () == static_cast<size_t> (n)) {
    return true;
}
```

若要求哈密顿回路，还要检查当前终点 `u` 是否有边回到起点 `start`：

```cpp
bool can_return = false;
for (int v : g[u]) {
    if (v == start) {
        can_return = true;
    }
}
```

只有 `can_return` 为真，才能在答案末尾再次写出 `start`，闭合回路。

## 起点选择

哈密顿路径的两个端点事先未知，因此最直接的做法是依次尝试每个点作为起点。

哈密顿回路一定经过所有点，所以在点编号为 $1,2,\ldots,n$ 的图中，可以固定从点 $1$ 开始；若存在哈密顿回路，总能把这个环旋转成以点 $1$ 开头的写法，不必重复尝试其他起点。

## 完整代码

下面的程序在无向图中寻找一条哈密顿回路。搜索固定从点 $1$ 开始；若成功，`path` 会在末尾再次加入点 $1$。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 25;
vector<int> g[MAXN];
bool used[MAXN];
vector<int> path;
int n, m;

bool has_edge (int u, int target) {
    for (int v : g[u]) {
        if (v == target) {
            return true;
        }
    }
    return false;
}

bool search_cycle (int u, int start) {
    if (path.size () == static_cast<size_t> (n)) {
        if (!has_edge (u, start)) {
            return false;
        }
        path.push_back (start);
        return true;
    }

    for (int v : g[u]) {
        if (used[v]) {
            continue;
        }

        used[v] = true;
        path.push_back (v);

        if (search_cycle (v, start)) {
            return true;
        }

        path.pop_back ();
        used[v] = false;
    }

    return false;
}

int main () {
    scanf ("%d%d", &n, &m);

    for (int i = 1; i <= m; i++) {
        int u, v;
        scanf ("%d%d", &u, &v);
        g[u].push_back (v);
        g[v].push_back (u);
    }

    int start = 1;
    path.push_back (start);
    used[start] = true;

    if (!search_cycle (start, start)) {
        printf ("No Hamiltonian cycle\n");
        return 0;
    }

    for (int i = 0; i < static_cast<int> (path.size ()); i++) {
        printf ("%d", path[i]);
        if (i + 1 == static_cast<int> (path.size ())) {
            printf ("\n");
        } else {
            printf (" ");
        }
    }

    return 0;
}
```

若只寻找哈密顿路径，可以在 `path.size() == n` 时直接返回成功，不检查回到起点的边；由于路径起点未知，还要清空状态并依次尝试每个点作为 `start`。

## 正确性直觉

`used[v]` 保证每个点至多进入路径一次。搜索只沿图中实际存在的邻接边扩展，所以 `path` 中每一对相邻点都有边相连。当路径包含全部 $n$ 个点，且最后一个点还有边回到 `start` 时，得到的闭合序列恰好是一条哈密顿回路。

回溯会尝试当前点的每个未使用邻点。若某条哈密顿回路存在并以点 $1$ 开始，搜索树中就包含按照该回路顺序做出的整条选择链，因此算法最终能够找到它。

## 复杂度

最坏情况下，回溯会尝试点的各种排列；每个完整排列还可能扫描一次终点的邻接表，时间复杂度上界为 $O(n\cdot n!)$。邻接表、标记数组、当前路径和递归调用共使用 $O(n+m)$ 空间。

代码中的 `MAXN = 25` 只是数组容量，不表示最坏情况下能够搜索到 $24$ 个点；实际可行规模高度依赖图的结构和剪枝。这份实现只适合点数较小的题目。学习状压 DP 后，可以用“已经使用的点集 + 当前终点”表示状态，把某些哈密顿问题改写成 $O(n^2 2^n)$ 的算法。

## 需要记住什么

- 回溯进入和离开一个点时，分别怎样修改 `path` 与 `used`？
- 为什么寻找哈密顿回路时可以固定从点 $1$ 开始？
- 怎样把回路搜索改成路径搜索？
- 为什么最坏时间复杂度会达到 $O(n\cdot n!)$？

## 返回基础篇

返回 [哈密顿问题：路径、回路与图](hamiltonian-paths-and-circuits.md) 继续主学习路线。
