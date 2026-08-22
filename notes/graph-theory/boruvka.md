# Boruvka 算法

> 最近修订：2026-08-23 05:20 +10:00（未审阅）

Kruskal 把所有边放在一起排序，Prim 从一个连通块向外扩张。Boruvka 算法提供第三种
观察最小生成树的方式：让当前每个连通块同时选择一条最便宜的出边，再把这些安全边
一起加入。

它的价值不只是另一份最小生成树模板。许多题目无法直接列出全部候选边，却能快速为
每个连通块找到最便宜出边；Boruvka 的“按轮合并连通块”框架正好可以承接这种优化。

## 单个连通块的最便宜出边

设当前已经选择了一些安全边，形成若干连通块。对某个连通块 $C$，连接 $C$ 与外部
的最小权边一定可以出现在某棵最小生成树中。

这是最小生成树的割性质：把 $C$ 与其余节点看成一个割，跨越这个割的最小边是安全
边。权值相同时任选一条即可。

因此每个连通块可以独立选择自己的最便宜出边：

```cpp
if (best[root] == 0 || edge[i].weight < edge[best[root]].weight) {
    best[root] = i;
}
```

这里 `root` 是并查集代表元，`best[root]` 保存边编号。

## 一轮扫描全部边

遍历每条边 `(u,v,w)`：

1. 找到两端当前所属连通块 `root_u` 与 `root_v`；
2. 若两者相同，这是一条块内边，忽略；
3. 否则它分别是两个连通块的一条候选出边，用它更新两端的 `best`。

一轮只需线性扫描全部边，不需要排序。

## 加入本轮安全边

扫描结束后，每个连通块至多记录一条边。依次尝试用并查集合并它的两端：

```cpp
if (dsu.merge(edge[id].u, edge[id].v)) {
    answer += edge[id].weight;
}
```

同一条边可能同时被两端连通块选中，也可能几条选择最终连接同一批连通块。必须再次
调用并查集判断；只有真正合并两个尚未连通的块时才计入答案。

## 为什么轮数是对数级

一轮开始时，每个仍未完成的连通块都会选择一条出边。把这些选择看成连通块之间的图，
每个旧连通块的度数至少为 $1$，所以合并后每个新连通块至少包含两个旧连通块。

连通块数量每轮至少减半，最多进行 $O(\log n)$ 轮。

若某轮没有发生任何合并但连通块仍多于一个，说明原图不连通，不存在生成树。

## 正确性直觉

每轮选择的每条候选边都是某个当前连通块对应割的最小边，由割性质可知它是安全的。
并查集只从这些安全边中取出不会形成环的部分。

不断加入安全边直到只剩一个连通块，得到包含 $n-1$ 条边的生成树；它可以扩展为
最小生成树，而此时已经是一棵完整生成树，所以自身就是最小生成树。

## 完整代码

输入无向带权图，输出最小生成树权值和以及选择的边编号。若图不连通，输出 `-1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct DisjointSetUnion {
    vector<int> parent;
    vector<int> size;

    DisjointSetUnion(int n) : parent(n + 5), size(n + 5, 1) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int u) {
        if (parent[u] == u) {
            return u;
        }
        return parent[u] = find(parent[u]);
    }

    bool merge(int u, int v) {
        u = find(u);
        v = find(v);
        if (u == v) {
            return false;
        }

        if (size[u] < size[v]) {
            swap(u, v);
        }
        parent[v] = u;
        size[u] += size[v];
        return true;
    }
};

struct Edge {
    int u;
    int v;
    ll weight;
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    vector<Edge> edge(m + 5);
    for (int i = 1; i <= m; ++i) {
        cin >> edge[i].u >> edge[i].v >> edge[i].weight;
    }

    DisjointSetUnion dsu(n);
    vector<int> chosen_edge;
    ll answer = 0;
    int component_count = n;

    while (component_count > 1) {
        vector<int> best(n + 5);

        for (int i = 1; i <= m; ++i) {
            int root_u = dsu.find(edge[i].u);
            int root_v = dsu.find(edge[i].v);
            if (root_u == root_v) {
                continue;
            }

            if (best[root_u] == 0 ||
                edge[i].weight < edge[best[root_u]].weight) {
                best[root_u] = i;
            }
            if (best[root_v] == 0 ||
                edge[i].weight < edge[best[root_v]].weight) {
                best[root_v] = i;
            }
        }

        int merged_count = 0;
        for (int u = 1; u <= n; ++u) {
            if (dsu.find(u) != u || best[u] == 0) {
                continue;
            }

            int id = best[u];
            if (dsu.merge(edge[id].u, edge[id].v)) {
                answer += edge[id].weight;
                chosen_edge.push_back(id);
                --component_count;
                ++merged_count;
            }
        }

        if (merged_count == 0) {
            cout << -1 << '\n';
            return 0;
        }
    }

    cout << answer << '\n';
    for (int id : chosen_edge) {
        cout << id << ' ';
    }
    cout << '\n';
    return 0;
}
```

## 复杂度

每轮扫描 $m$ 条边，并执行并查集操作，时间为 $O(m\alpha(n))$。连通块数量每轮
至少减半，共 $O(\log n)$ 轮，因此总时间复杂度为
$O(m\log n\,\alpha(n))$，通常简写为 $O(m\log n)$。

空间复杂度为 $O(n+m)$。

对显式边集，Kruskal 通常更短；Boruvka 真正发挥优势的场景，是“不能列出全部边，
但能批量找到每个连通块的最便宜出边”。

## 常见错误

- 记录节点的最便宜出边，而不是当前并查集连通块的最便宜出边；
- 一条边只更新其中一个端点所属连通块；
- 加入 `best` 时不再检查并查集，重复计算同一条边或形成环；
- 每轮没有重新清空 `best`；
- 某轮无法合并时继续死循环，而没有判断图不连通；
- 认为 Boruvka 必须先对所有边排序。

## 需要记住什么

- 为什么一个连通块的最便宜出边是安全边？
- 一轮扫描边时，一条跨块边可能更新哪些连通块？
- 为什么加入候选边时仍要再次检查并查集？
- 连通块数量为什么每轮至少减半？
- 某轮没有发生合并说明什么？
- 对普通显式边集和隐式候选边，Boruvka 的实际价值有何不同？
