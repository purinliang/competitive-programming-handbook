# 点分治

> 最近修订：2026-08-23 05:03 +10:00（未审阅）

一棵树上会不断出现新的标记节点，同时需要查询某个节点到最近标记节点的距离。
每次查询从起点 BFS 会重复扫描整棵树；只记录每个节点到当前答案的距离，又很难在
加入新标记后快速更新所有受影响节点。

点分治反复选择当前连通块的重心作为分界点。删除重心后，每个剩余连通块至多只有
原来的一半大。每个原树节点只会出现在 $O(\log n)$ 层分治结构中，于是可以把一次
全树问题改成沿这些分治祖先进行的少量查询。

## 分治重心

设当前连通块大小为 `total`。若节点 `u` 的每一棵相邻子树大小都不超过
`total / 2`，删除 `u` 后的每个连通块都不超过原来的一半，`u` 就是这个连通块的
重心。

先计算子树大小，再沿着大小超过一半的儿子继续走：

```cpp
int find_centroid(int u, int p, int total) {
    for (int v : g[u]) {
        if (v == p || removed[v]) {
            continue;
        }
        if (subtree_size[v] * 2 > total) {
            return find_centroid(v, u, total);
        }
    }
    return u;
}
```

这里的父子关系只来自本次临时 DFS。被删除的分治重心必须跳过，否则递归会重新走回
已经处理的连通块。

## 重心分解树

找到重心 `centroid` 后：

1. 把它作为当前分治层的代表；
2. 暂时删除它；
3. 对删除后形成的每个连通块递归分解。

递归得到的父子关系称为重心分解树。它不是原树中的边关系；它记录的是“哪个重心把
哪个连通块继续分开”。由于每层连通块大小至少减半，重心分解树高度为
$O(\log n)$。

## 保存到各层重心的距离

处理重心 `centroid` 时，从它出发遍历当前连通块。对每个节点 `u` 保存：

```cpp
path[u].push_back({centroid, distance});
```

`path[u]` 最终包含 `u` 在每一层分治中所属的重心，以及它到该重心的原树距离。
每个连通块至少减半，因此每个节点只保存 $O(\log n)$ 对信息。

## 加入标记

对每个重心 `centroid` 维护：

```cpp
best[centroid]
```

它表示已经标记的节点到这个重心的最短距离。标记节点 `u` 时，枚举
`path[u]`：

```cpp
for (auto [centroid, distance] : path[u]) {
    best[centroid] = min(best[centroid], distance);
}
```

只需更新 $O(\log n)$ 个分治祖先。

## 查询最近标记节点

设查询节点为 `u`，真正最近的标记节点为 `x`。在重心分解过程中，`u` 与 `x`
总会在某一层第一次被分到不同连通块；这一层的重心 `centroid` 位于它们之间的原树
路径上，因此：

$$
\operatorname{dist}(u,x)
=\operatorname{dist}(u,centroid)
+\operatorname{dist}(centroid,x).
$$

`best[centroid]` 不大于 `dist(centroid,x)`，所以枚举 `u` 的所有分治重心并取
最小值即可：

```cpp
int answer = INF;
for (auto [centroid, distance] : path[u]) {
    answer = min(answer, distance + best[centroid]);
}
```

其他标记节点可能让某个 `best` 更小，只会提供更好的合法答案，不会破坏正确性。

## 完整代码

给定一棵无权树。节点 $1$ 初始为标记节点，之后支持：

- `1 u`：标记节点 `u`，已经标记时不产生额外影响；
- `2 u`：查询 `u` 到最近标记节点的距离。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int INF = 0x3f3f3f3f;

struct CentroidDecomposition {
    int n;
    vector<vector<int>> g;
    vector<int> subtree_size;
    vector<int> best;
    vector<bool> removed;
    vector<vector<pair<int, int>>> path;

    CentroidDecomposition(int size)
        : n(size), g(n + 5), subtree_size(n + 5),
          best(n + 5, INF), removed(n + 5), path(n + 5) {}

    void add_edge(int u, int v) {
        g[u].push_back(v);
        g[v].push_back(u);
    }

    int calculate_size(int u, int p) {
        subtree_size[u] = 1;
        for (int v : g[u]) {
            if (v == p || removed[v]) {
                continue;
            }
            subtree_size[u] += calculate_size(v, u);
        }
        return subtree_size[u];
    }

    int find_centroid(int u, int p, int total) {
        for (int v : g[u]) {
            if (v == p || removed[v]) {
                continue;
            }
            if (subtree_size[v] * 2 > total) {
                return find_centroid(v, u, total);
            }
        }
        return u;
    }

    void collect_path(int u, int p, int distance, int centroid) {
        path[u].push_back({centroid, distance});
        for (int v : g[u]) {
            if (v == p || removed[v]) {
                continue;
            }
            collect_path(v, u, distance + 1, centroid);
        }
    }

    void build(int entry) {
        int total = calculate_size(entry, 0);
        int centroid = find_centroid(entry, 0, total);

        collect_path(centroid, 0, 0, centroid);
        removed[centroid] = true;

        for (int v : g[centroid]) {
            if (!removed[v]) {
                build(v);
            }
        }
    }

    void mark(int u) {
        for (auto [centroid, distance] : path[u]) {
            best[centroid] = min(best[centroid], distance);
        }
    }

    int query(int u) const {
        int answer = INF;
        for (auto [centroid, distance] : path[u]) {
            answer = min(answer, distance + best[centroid]);
        }
        return answer;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, q;
    cin >> n >> q;

    CentroidDecomposition centroid(n);
    for (int i = 1; i < n; ++i) {
        int u, v;
        cin >> u >> v;
        centroid.add_edge(u, v);
    }

    centroid.build(1);
    centroid.mark(1);

    while (q--) {
        int type, u;
        cin >> type >> u;
        if (type == 1) {
            centroid.mark(u);
        } else {
            cout << centroid.query(u) << '\n';
        }
    }
    return 0;
}
```

## 复杂度

每一层收集当前所有连通块的大小与距离，总工作量为 $O(n)$；分治树高度为
$O(\log n)$，所以建树时间和空间复杂度均为 $O(n\log n)$。

一次标记或查询只枚举一个节点的 $O(\log n)$ 个分治重心，时间复杂度为
$O(\log n)$。

本文只增加标记，不删除标记。若需要切换标记状态，可以让每个重心维护一个支持插入、
删除和取最小值的容器，但那是本模型的扩展，不应偷偷加入基础模板。

## 常见错误

- 找重心时没有忽略已经删除的节点；
- 删除重心以后才收集当前连通块距离，导致遍历立即被截断；
- 把重心分解树上的深度当成原树距离；
- 只保存当前节点到分治父亲的距离，查询时却当成到所有祖先重心的距离；
- 认为点分治会改变原树；分治结构只是额外索引，距离仍来自原树；
- 允许删除标记，却仍只用一个不可撤销的 `best` 最小值。

## 需要记住什么

- 为什么删除重心后，每个连通块至多只有原来的一半？
- 重心分解树与原树分别表示什么？
- 每个节点为什么只属于 $O(\log n)$ 层连通块？
- `path[u]` 保存哪些信息？
- 查询最近标记节点时，为什么枚举分治重心不会漏掉最优答案？
- 本文的 `best` 为什么只支持增加标记，不支持删除标记？
