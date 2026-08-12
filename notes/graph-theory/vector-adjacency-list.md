# 图的存储：vector 邻接表

> 状态：草稿
> 直接前置：[0119 数组：多维数组（正文待写）](../CATALOG.md#01-c-基础)、[0138 序列容器：vector（正文待写）](../CATALOG.md#01-c-基础)、[0402 图的存储：边的记录](graph-representation.md)

一张图可能有很多条边。图算法最常见的操作不是“依次查看输入中的所有边”，而是给定当前点 $u$，迅速枚举所有从 $u$ 出发的边。存图方式应该直接支持这种访问。

本书的可复制图算法统一使用 `vector` 邻接表。本篇先排除其他表示，再给出唯一的主线模板。

## 邻接矩阵

邻接矩阵为每一对点保留一个格子。无权图可以用布尔值表示从 `from` 到 `to` 是否有边：

```cpp
bool connected[MAXN][MAXN];

connected[from][to] = true;
```

这里使用 `connected`，因为这个名字准确说明格子保存的是“是否直接相连”。如果格子保存边权，则更适合命名为 `weight[from][to]`，并另外约定什么值表示没有边。二维 `graph` 无法说明格子的真实含义，本书不采用这种命名。

邻接矩阵判断一条边是否存在只需 $O(1)$ 时间，但是始终占用 $O(n^2)$ 空间。枚举点 $u$ 的所有出边也必须检查整行的 $n$ 个格子。

竞赛图通常远没有 $n^2$ 条边。主线算法需要的是按实际边数 $m$ 付出空间和遍历时间，所以不使用邻接矩阵模板。只有点数很小，或者题目频繁查询任意两点是否直接相连时，才临时使用它。

## 直接存边

也可以把完整边记录依次放进一个数组：

```cpp
struct Edge {
    int from;
    int to;
    int weight;
};

vector<Edge> edges;
```

这种表示称为边集或直接存边。空间是 $O(m)$，依次扫描、排序所有边很方便；Kruskal 算法按边权排序全部边，是最典型的使用场景。Bellman–Ford 等逐边松弛算法也会直接扫描边集。

但要找某点 `from` 的全部出边，只能扫描整个 `edges` 并逐条比较起点，一次需要 $O(m)$。对每个点都这样做，无法得到 DFS、BFS 所需的 $O(n+m)$ 遍历。

如果先把边按 `from` 排序，使同一起点的边连续存放，再记录每个点对应区间的起点，就得到了前向星（forward star）。它已经不再是没有索引的原始边集；构建时需要排序或计数分组，还要维护额外的区间边界。

## 邻接表的目标

我们真正想要的是：对每个点 `from`，直接保存所有从它出发的边。

教学示例使用完整名称可以写成：

```cpp
struct Edge {
    int to;
    int weight;
};

vector<Edge> graph[MAXN];

graph[from].push_back({to, weight});
```

起点 `from` 已经体现在 `graph[from]` 的下标中，所以每一项只需保存终点 `to` 和边权 `weight`，不必重复保存 `from`。

这就是使用 `vector` 实现的邻接表。只为实际存在的边保存元素，总空间为 $O(n+m)$；枚举点 $u$ 的全部出边只需遍历 `graph[u]`，时间与它的出度成正比。

链式前向星用 `head` 和边的 `next` 下标实现同一种“按起点找出边”的能力。它的内存布局和边编号更容易精确控制，但代码更长，也更容易出现下标和初始化错误。普通图算法没有必要承担这份复杂度；等到欧拉图和网络流高频访问配对反向边时，本书才会单独学习它。

## 无权图模板

进入可复制的竞赛代码后，`graph` 缩写为 `g`，端点使用 `u`、`v`。无权图只需保存终点编号：

```cpp
const int MAXN = 200005;
vector<int> g[MAXN];
```

加入有向边 $u\to v$：

```cpp
g[u].push_back(v);
```

加入无向边 $(u,v)$ 时，展开为两个方向：

```cpp
g[u].push_back(v);
g[v].push_back(u);
```

枚举从点 $u$ 出发的所有边：

```cpp
for (int v : g[u]) {
    // 处理有向边 u -> v
}
```

即使原图是无向图，循环中的每个邻接项也按一条从当前点 `u` 指向相邻点 `v` 的边记录理解。

## 带权图模板

带权图让每个邻接项同时保存终点 `v` 和边权 `w`：

```cpp
struct Edge {
    int v;
    int w;
};

const int MAXN = 200005;
vector<Edge> g[MAXN];
```

加入带权有向边：

```cpp
g[u].push_back({v, w});
```

加入带权无向边：

```cpp
g[u].push_back({v, w});
g[v].push_back({u, w});
```

枚举出边时，`edge.v` 和 `edge.w` 分别是终点和边权：

```cpp
for (Edge edge : g[u]) {
    int v = edge.v;
    int w = edge.w;
}
```

## 完整代码

下面只提供主线真正会复制的无权无向图 `vector` 邻接表。程序读入图，再按当前存储顺序输出每个点的出边终点。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
vector<int> g[MAXN];

int main() {
    int n, m;
    scanf("%d%d", &n, &m);

    for (int i = 1; i <= m; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back(v);
        g[v].push_back(u);
    }

    for (int u = 1; u <= n; u++) {
        printf("%d:", u);
        for (int v : g[u]) {
            printf(" %d", v);
        }
        printf("\n");
    }

    return 0;
}
```

对于下图的输入：

![用于展示 vector 邻接表的无向图](../assets/graph-theory/graph-representation.svg)

```text
5 5
1 2
1 3
2 4
3 4
4 5
```

输出为：

```text
1: 2 3
2: 1 4
3: 1 4
4: 2 3 5
5: 4
```

## 需要记住什么

- 为什么布尔邻接矩阵命名为 `connected` 比 `graph` 更明确？
- 邻接矩阵为什么不适合作为大多数竞赛图的默认存储？
- 边集适合哪类需要扫描或排序全部边的算法？为什么不适合 DFS 和 BFS？
- 原始边集还需要增加什么，才成为按起点分组的前向星？
- `graph[from]` 已经表达起点后，每个邻接项为什么只保存 `to` 和 `weight`？
- 主线无权图模板中的 `g[u]` 表示什么？
- 一条无向边为什么在 `g` 中加入两个方向？

## 下一篇

下一篇将介绍 [树与有根树](trees-and-rooted-trees.md)。
