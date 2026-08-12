# 图的存储：边集

> 状态：草稿
> 直接前置：[0138 序列容器：vector（正文待写）](../CATALOG.md#01-c-基础)、[0402 图的存储：基础概念](graph-representation.md)

[图的存储：基础概念](graph-representation.md) 已经介绍过边集：把每条边作为一条完整记录，依次放进同一个容器。题目逐行给出 `u`、`v` 和可选的 `w` 时，输入形式本身就是边集；程序可以直接保留它，也可以在读入时转换成算法更需要的邻接表。本篇只讨论边集真正擅长的任务——整体扫描或排序全部边。

## 无权边集

无权边记录只需保存两个端点。教学代码使用完整名称：

```cpp
struct Edge {
    int from;
    int to;
};

vector<Edge> edges;
edges.push_back({from, to});
```

对于有向图，`from` 和 `to` 分别是起点和终点。对于无向图，这两个字段只是在记录中区分两个端点，并不赋予数学意义上的方向。

依次访问全部边：

```cpp
for (Edge edge : edges) {
    int from = edge.from;
    int to = edge.to;
}
```

如果算法只要求每条原始无向边处理一次，就只保存一条记录，不要自动加入反向副本。例如 Kruskal 算法需要把每条无向边整体处理一次，重复保存会让边集变得多余。

## 带权边集

带权边记录再增加 `weight`：

```cpp
struct Edge {
    int from;
    int to;
    int weight;
};

vector<Edge> edges;
edges.push_back({from, to, weight});
```

扫描全部带权边时，三个字段的含义始终明确：

```cpp
for (Edge edge : edges) {
    int from = edge.from;
    int to = edge.to;
    int weight = edge.weight;
}
```

Bellman–Ford 会反复扫描所有有向边并尝试松弛；Kruskal 会先按边权排序所有无向边，再按顺序处理。它们都不要求“给定一个点，立刻找到全部出边”，因此边集比邻接表更自然。除此之外，大多数图算法都会在读入边集时，直接把边转换成 `vector` 邻接表或链式前向星。

## 无向边的保存数量

一条无向边是否要保存两个方向，取决于算法使用的是“原始边”还是“沿某个方向移动的邻接项”：

- Kruskal 关心每条原始无向边，只保存一条 `(u, v, w)`；
- DFS 和 BFS 要从当前点走向相邻点，在邻接表中保存 `u -> v` 和 `v -> u` 两个邻接项；
- 欧拉回路既要从两个方向找到无向边，又要保证原始边只使用一次，因此保存一对反向记录，并额外维护它们属于同一条边的关系。

所以，“无向边总要保存两次”并不是普遍规则。要先看算法怎样访问它。

## 竞赛写法

竞赛代码通常把字段缩写为 `u`、`v`、`w`。带权边集可以写成：

```cpp
struct Edge {
    int u;
    int v;
    int w;
};

vector<Edge> edges;
```

无权版本删除 `w` 即可：

```cpp
struct Edge {
    int u;
    int v;
};

vector<Edge> edges;
```

这里保留 `struct`，因为一条边有固定语义，后续算法常按 `w` 排序或同时访问三个字段；字段名比三元组的位置更直观。

## 完整代码

下面的程序读取一组带权有向边，再按输入顺序完整扫描一次。真正的 Bellman–Ford 会在这个循环中进行松弛；真正的 Kruskal 会在循环前按 `w` 排序。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Edge {
    int u;
    int v;
    int w;
};

vector<Edge> edges;

int main() {
    int n, m;
    scanf("%d%d", &n, &m);

    for (int i = 1; i <= m; i++) {
        int u, v, w;
        scanf("%d%d%d", &u, &v, &w);
        edges.push_back({u, v, w});
    }

    for (Edge edge : edges) {
        printf("%d -> %d, weight = %d\n", edge.u, edge.v, edge.w);
    }

    return 0;
}
```

## 复杂度与边界

边集保存 $m$ 条记录，占用 $O(m)$ 空间；完整扫描一次需要 $O(m)$ 时间。

但是，若要寻找从点 `u` 出发的全部边，未经索引的边集只能检查每条记录的起点，一次就需要 $O(m)$。因此它不适合作为 DFS、BFS 等普通遍历的默认存储。

## 从边集到前向星

把边按 `from` 排序后，同一起点的边会占据全局数组中的一个连续区间。再为每个点记录这个区间的起点和终点，就得到普通前向星：

```text
边集 --按 from 排序--> 同一起点的边连续
                      + 每个点的区间边界
                      = 前向星
```

普通前向星不需要为每条边保存 `next`。枚举点 `u` 的出边时，只需顺序扫描它对应的连续区间，因此在访问方式和内存布局上很像 `vector` 邻接表。

按比较排序构建需要 $O(m\log m)$ 时间。也可以根据整数点编号计数分组，把构建降到 $O(n+m)$；不过普通竞赛代码直接在读入时向 `vector` 加边更短，而且同样不需要额外的排序对数，因此本书不把普通前向星作为主线模板。

链式前向星不排序边集，而是用 `head/next` 把同一起点的记录串起来。前向星和链式前向星都已经为边集增加了“按起点定位出边”的索引，因此属于邻接表的实现，不再是未经索引的边集。

## 需要记住什么

- 无权边集和带权边集分别需要保存哪些字段？
- 边集为什么适合整体扫描或排序全部边？
- 为什么 Kruskal 的无向边集通常只保存每条原始边一次？
- 为什么 DFS 和 BFS 不适合直接使用未经索引的边集？
- 普通前向星怎样从边集构建？它为什么不需要 `next`？
- 排序构建普通前向星为什么会多出 $O(m\log m)$ 时间？
- 边集增加什么能力后，才会变成邻接表的一种实现？

## 下一篇

下一篇将介绍邻接表的另一种数组实现：[图的存储：邻接表（链式前向星实现）](chained-forward-star.md)。
