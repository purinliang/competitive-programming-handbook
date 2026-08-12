# 图的存储

> 状态：草稿
> 直接前置：[0119 数组：多维数组（正文待写）](../CATALOG.md#01-c-基础)、[0121 复合类型：struct](../cpp/0121-struct.md)、[0138 序列容器：vector（正文待写）](../CATALOG.md#01-c-基础)、[0401 图：点与边](vertices-and-edges.md)

纸上的图可以直接画出点和边，程序却只能保存整数、数组和容器。存图就是把“哪些点之间有边”翻译成适合程序访问的数据。

下面始终使用同一张有 $5$ 个点、$5$ 条边的无向图：

![用于比较存储方式的无向图](../assets/graph-theory/graph-representation.svg)

它的输入可以写成：

```text
5 5
1 2
1 3
2 4
3 4
4 5
```

第一行的 `n` 和 `m` 分别表示点数和边数。后面每行的 `u v` 表示一条连接点 `u` 与点 `v` 的无向边。

## 边集

最直接的做法是把输入中的每条边原样保存。无权图的一条边只需要保存两个端点：

```cpp
struct Edge {
    int u;
    int v;
};

vector<Edge> edges;
```

读到边 $(u,v)$ 时，把它放进 `edges`：

```cpp
edges.push_back({u, v});
```

边集占用 $O(m)$ 空间，适合依次处理所有边。例如 Kruskal 最小生成树算法就会把边按边权排序后逐条考虑。

但是，如果要找“从点 $u$ 出发的所有边”，每次都要扫描整个边集，时间是 $O(m)$。因此，普通的 DFS 和 BFS 很少只使用边集。

带权边只需增加一个字段：

```cpp
struct Edge {
    int u;
    int v;
    int weight;
};
```

## 邻接矩阵

邻接矩阵使用一个二维数组 `connected`。如果点 $u$ 和点 $v$ 之间有边，就令 `connected[u][v] = true`：

```cpp
const int MAXN = 1005;
bool connected[MAXN][MAXN];
```

无向边 $(u,v)$ 可以从两个方向经过，所以必须同时记录：

```cpp
connected[u][v] = true;
connected[v][u] = true;
```

这张示例图的邻接矩阵是：

```text
    1 2 3 4 5
1   0 1 1 0 0
2   1 0 0 1 0
3   1 0 0 1 0
4   0 1 1 0 1
5   0 0 0 1 0
```

检查两点之间是否有边只需访问一次数组，时间是 $O(1)$。代价是矩阵始终占用 $O(n^2)$ 空间；即使图中只有很少的边，大多数格子也必须保留。

要枚举点 $u$ 的所有相邻点，仍要检查整行：

```cpp
for (int v = 1; v <= n; v++) {
    if (connected[u][v]) {
        // u 和 v 之间有边
    }
}
```

因此，邻接矩阵适合点数较小，或者需要频繁判断两点是否直接相连的图。

## 邻接表

如果我们只为每个点保存真正与它相邻的点，就不必为不存在的边留下空位。令 `graph[u]` 保存点 $u$ 的所有相邻点：

```cpp
const int MAXN = 200005;
vector<int> graph[MAXN];
```

无向边 $(u,v)$ 同时让 $v$ 成为 $u$ 的相邻点、让 $u$ 成为 $v$ 的相邻点，所以要存两次：

```cpp
graph[u].push_back(v);
graph[v].push_back(u);
```

示例图的邻接表是：

```text
1: 2 3
2: 1 4
3: 1 4
4: 2 3 5
5: 4
```

枚举点 $u$ 的所有相邻点时，只访问 `graph[u]` 中实际存在的元素：

```cpp
for (int v : graph[u]) {
    // v 是 u 的一个相邻点
}
```

所有无向边会在邻接表中出现两次，所以总空间仍是 $O(n+m)$。依次枚举所有点的邻接表时，每条无向边也会被访问两次，总时间是 $O(n+m)$。

邻接表是竞赛中存储普通稀疏图和树最常用的方式。

## 有向边与带权边

有向边 $u\to v$ 只能从 $u$ 走向 $v$，所以邻接表只存一次：

```cpp
graph[u].push_back(v);
```

如果后续算法还要从 $v$ 找到所有指向它的边，可以另外建立一张反图：

```cpp
reverse_graph[v].push_back(u);
```

带权图需要让每个相邻点与对应边权保持在一起：

```cpp
struct Edge {
    int to;
    int weight;
};

vector<Edge> graph[MAXN];

graph[u].push_back({v, weight});
graph[v].push_back({u, weight});
```

这里的 `Edge` 表示一条从当前点出发的边，所以只需保存终点 `to` 和边权 `weight`；起点已经由 `graph[u]` 的下标 `u` 表示。

## 存储方式比较

| 存储方式 | 空间 | 判断 $(u,v)$ 是否有边 | 枚举 $u$ 的相邻点 |
| --- | --- | --- | --- |
| 边集 | $O(m)$ | $O(m)$ | $O(m)$ |
| 邻接矩阵 | $O(n^2)$ | $O(1)$ | $O(n)$ |
| 邻接表 | $O(n+m)$ | $O(\deg(u))$ | $O(\deg(u))$ |

基础图算法默认优先使用邻接表。只有问题的访问方式明显更适合边集或邻接矩阵时，才换用对应表示。

## 完整代码

下面的程序读取一张无向图，用邻接表保存，再依次输出每个点的相邻点。输出邻接表只是为了验证存储结果；真正解题时，后续算法会直接遍历 `graph[u]`。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
vector<int> graph[MAXN];

int main() {
    int n, m;
    scanf("%d%d", &n, &m);

    for (int i = 1; i <= m; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        graph[u].push_back(v);
        graph[v].push_back(u);
    }

    for (int u = 1; u <= n; u++) {
        printf("%d:", u);
        for (int v : graph[u]) {
            printf(" %d", v);
        }
        printf("\n");
    }

    return 0;
}
```

对上面的示例输入，程序输出：

```text
1: 2 3
2: 1 4
3: 1 4
4: 2 3 5
5: 4
```

## 需要记住什么

- 边集、邻接矩阵和邻接表分别直接保存什么？
- 为什么邻接矩阵查询一条边是 $O(1)$，却需要 $O(n^2)$ 空间？
- 为什么一条无向边要在邻接表中存两次，有向边通常只存一次？
- `graph[u]` 表示什么？枚举它的时间复杂度与什么有关？
- 带权邻接表中的一项为什么只需保存 `to` 和 `weight`？

## 下一篇

下一篇将介绍 [树与有根树](trees-and-rooted-trees.md)。
