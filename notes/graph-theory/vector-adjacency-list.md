# 图的存储：邻接表（vector 实现）

> 状态：草稿

[图的存储：基础概念](graph-representation.md) 已经把邻接表定义为“为每个点分别保存全部出边”。本篇只讨论它在普通图算法中的默认实现：用一个 `vector` 保存每个点的邻接项。

## 无权有向图

教学代码先使用完整名称。令 `graph[from]` 表示从点 `from` 出发的全部边；无权邻接项只需保存终点 `to`：

```cpp
vector<int> graph[MAXN];

graph[from].push_back (to);
```

加入有向边 `from -> to` 时，只在 `graph[from]` 中加入一次。枚举它的所有出边：

```cpp
for (int to : graph[from]) {
    // 处理 from -> to
}
```

起点由数组下标 `from` 表达，所以 `vector` 中不必再次保存它。

## 无权无向图

无向边 $(from,to)$ 可以从两端通行，因此要加入两个方向：

```cpp
graph[from].push_back (to);
graph[to].push_back (from);
```

这两项只是同一条无向边的两个遍历方向。题目给出的原始边数仍然是 $m$，邻接表中则会保存 $2m$ 个邻接项。

## 带权有向图

带权邻接项还要保存边权。本书固定使用 `pair<int, int>`，并约定两个位置依次是 `(to, weight)`：

```cpp
vector<pair<int, int>> graph[MAXN];

graph[from].push_back ({to, weight});
```

C++17 可以用结构化绑定直接为两个位置命名：

```cpp
for (auto& [to, weight] : graph[from]) {
    // 处理 from -> to，边权为 weight
}
```

这里的 `auto&` 表示直接引用邻接项，不复制 `pair`。如果循环只读取内容，不会修改终点和边权，可以写得更严格：

```cpp
for (const auto& [to, weight] : graph[from]) {
    // 只读访问
}
```

本书始终使用 `(to, weight)` 这个顺序，避免在不同算法中反复猜测 `first` 和 `second` 的含义。

## 带权无向图

带权无向边仍然加入两个方向，并让它们保存相同的边权：

```cpp
graph[from].push_back ({to, weight});
graph[to].push_back ({from, weight});
```

此时枚举任意一个点的邻接项，都能直接得到可以到达的点及这条边的权值。

## 竞赛模板

进入可复制的竞赛代码后，`graph` 缩写为 `g`，端点和边权使用 `u`、`v`、`w`。

无权图的核心写法是：

```cpp
const int MAXN = 2e5 + 5;
vector<int> g[MAXN];

g[u].push_back (v); // 有向边 u -> v

for (int v : g[u]) {
    // 处理 u -> v
}
```

带权图的核心写法是：

```cpp
const int MAXN = 2e5 + 5;
vector<pair<int, int>> g[MAXN];

g[u].push_back ({v, w}); // 有向边 u -> v，边权为 w

for (auto& [v, w] : g[u]) {
    // 处理 u -> v，边权为 w
}
```

处理无向图时，两种模板都只需把加入边的语句反向再写一次。

## 完整代码

下面的完整程序读取一张带权无向图，再按当前存储顺序输出每个点的邻接项。无权版本只需把 `pair<int, int>` 改为 `int`，并去掉所有 `w`。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 2e5 + 5;
vector<pair<int, int>> g[MAXN];

int main () {
    int n, m;
    scanf ("%d%d", &n, &m);

    for (int i = 1; i <= m; i++) {
        int u, v, w;
        scanf ("%d%d%d", &u, &v, &w);
        g[u].push_back ({v, w});
        g[v].push_back ({u, w});
    }

    for (int u = 1; u <= n; u++) {
        printf ("%d:", u);
        for (auto& [v, w] : g[u]) {
            printf (" (%d, %d)", v, w);
        }
        printf ("\n");
    }

    return 0;
}
```

## 复杂度

`vector` 邻接表只为实际存在的边保存邻接项。保存有向图需要 $O(n+m)$ 空间；保存无向图虽然会把每条边加入两次，渐进空间仍然是 $O(n+m)$。

枚举点 $u$ 的全部出边只访问 `g[u]`，时间为 $O(\deg(u))$。枚举整张图的全部邻接项，时间为 $O(n+m)$。

## 使用边界

DFS、BFS、最短路和绝大多数普通图算法只需快速枚举当前点的出边，`vector` 邻接表代码最短，也最容易修改，因此是本书的默认实现。同一点的邻接项连续保存在同一个 `vector` 中，枚举时通常也有良好的内存局部性。

如果算法要整体扫描或排序全部边，应改用独立的 [图的存储：边集](edge-list.md)。如果算法需要高频访问与当前边配对的反向记录，例如欧拉图和网络流，本书改用 [图的存储：邻接表（链式前向星实现）](chained-forward-star.md)，让两条记录在全局边数组中连续存放。

哈密顿路径和哈密顿回路限制的是每个点只出现一次，不需要为一条无向边的两个方向维护“已经共同使用”的状态，因此通常仍然使用 `vector` 邻接表。

## 需要记住什么

- `graph[from]` 和竞赛代码中的 `g[u]` 分别表示什么？
- 无权邻接项为什么只保存终点？
- 无向边为什么要加入两个方向？
- 本书在 `pair<int, int>` 中按什么顺序保存终点和边权？
- `auto& [v, w]` 分别取出什么？只读循环可以怎样写？
- `vector` 邻接表的空间复杂度和枚举出边的时间复杂度是多少？
- 哪两类需求分别更适合边集和链式前向星？
- 哈密顿问题为什么不会仅仅因为原图无向，就要求使用链式前向星？

## 下一篇

下一篇将在邻接表上介绍 [图的遍历：深度优先搜索（DFS）](graph-depth-first-search.md)。
