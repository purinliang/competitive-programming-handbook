# 最短路树

> 最近修订：2026-08-23 05:16 +10:00（未审阅）

从源点到每个点分别求出一条最短路，会得到很多互相重叠的路径。若为每个非源点选择
一条“最后到达它的边”，这些边可以共同组成一棵以源点为根的树，让树上根到每个点
的路径仍然是原图最短路。这就是最短路树。

本文进一步解决一个自然选择问题：边权均为正时，在所有最短路树中，怎样让所选边的
权值总和最小？

## 最短路紧边

先从源点 `source` 求最短距离 `distance`。一条从 `u` 指向 `v`、权值为 `w`
的边可以成为 `v` 的父边，当且仅当：

$$
\operatorname{distance}[u]+w
=\operatorname{distance}[v].
$$

这样的有向边称为满足最短路条件的边，常简称紧边。沿紧边从源点走到 `v`，路径
长度恰好等于 `distance[v]`。

不要把所有紧边直接保留下来。一个点可能有多条紧入边，它们的并集通常是一个有向图，
而不是树。

## 为每个点选择父边

边权为正，所以紧边 `u -> v` 满足：

$$
\operatorname{distance}[u]<\operatorname{distance}[v].
$$

沿父边反向走时，距离严格减小，不可能形成环，最终会到达源点。因此每个非源点只要
独立选择一条紧入边，全部选择就一定组成最短路树。

所选边权总和为：

$$
\sum_{v\ne source} w(parent[v],v).
$$

每一项只由节点 `v` 的选择决定，彼此没有冲突。要最小化总和，只需为每个点选择
权值最小的紧入边。

## 在 Dijkstra 中同时选择

Dijkstra 用边 `(u,v,w)` 得到更短距离时，这条边暂时成为 `v` 的父边：

```cpp
if (new_distance < distance[v]) {
    distance[v] = new_distance;
    parent_edge[v] = edge_id;
}
```

若得到相同最短距离，就比较最后一条边的权值：

```cpp
if (new_distance == distance[v]
    && w < edge[parent_edge[v]].weight) {
    parent_edge[v] = edge_id;
}
```

这里比较的是父边权值，不是父节点编号，也不是到父节点的距离。

## 正确性直觉

Dijkstra 保证 `distance[v]` 是源点到 `v` 的最短距离。最终保留的 `parent_edge[v]`
满足紧边等式，因此沿父边得到的是最短路。

正边权保证父节点距离严格更小，所以父边不可能形成环。每个非源点恰有一条父边，
全部节点又都能沿父边回到源点，于是得到一棵树。

最后，每个点都独立选择最便宜的紧入边，逐项最小自然使总边权和最小。

## 完整代码

输入一个连通无向图和源点，边权均为正。输出最小边权和，并输出每个非源点选择的
父边编号。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 4e18;

struct Edge {
    int u;
    int v;
    ll weight;
};

int n, m, source;
vector<Edge> edge;
vector<vector<pair<int, int>>> g;
vector<ll> distance_value;
vector<int> parent_edge;

void dijkstra() {
    distance_value.assign(n + 5, INF);
    parent_edge.assign(n + 5, 0);

    priority_queue<pair<ll, int>,
                   vector<pair<ll, int>>,
                   greater<pair<ll, int>>> q;

    distance_value[source] = 0;
    q.push({0, source});

    while (!q.empty()) {
        auto [current_distance, u] = q.top();
        q.pop();

        if (current_distance != distance_value[u]) {
            continue;
        }

        for (auto [v, edge_id] : g[u]) {
            ll w = edge[edge_id].weight;
            ll new_distance = current_distance + w;

            if (new_distance < distance_value[v]) {
                distance_value[v] = new_distance;
                parent_edge[v] = edge_id;
                q.push({new_distance, v});
            } else if (new_distance == distance_value[v]
                       && w < edge[parent_edge[v]].weight) {
                parent_edge[v] = edge_id;
            }
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m >> source;

    edge.resize(m + 5);
    g.assign(n + 5, {});

    for (int i = 1; i <= m; ++i) {
        int u, v;
        ll w;
        cin >> u >> v >> w;

        edge[i] = {u, v, w};
        g[u].push_back({v, i});
        g[v].push_back({u, i});
    }

    dijkstra();

    ll answer = 0;
    for (int u = 1; u <= n; ++u) {
        if (u != source) {
            answer += edge[parent_edge[u]].weight;
        }
    }

    cout << answer << '\n';
    for (int u = 1; u <= n; ++u) {
        if (u != source) {
            cout << parent_edge[u] << ' ';
        }
    }
    cout << '\n';
    return 0;
}
```

`edge[0].weight` 默认初始化为 $0$。当某个点第一次得到有限距离时一定进入严格改进
分支，因此相等距离分支不会在 `parent_edge[v]` 仍为 $0$ 时错误替换父边。

## 复杂度

使用邻接表和优先队列的 Dijkstra 时间复杂度为 $O((n+m)\log n)$，空间复杂度为
$O(n+m)$。选择父边在松弛过程中完成，不增加渐进复杂度。

## 零边权为什么需要额外小心

本文要求正边权。若允许零边权，紧边两端可能具有相同最短距离。每个点独立选择最小
紧入边时可能在同距离节点间形成环，不能再直接推出结果是一棵树。

零边权图仍然可以构造最短路树，但需要用实际的搜索发现关系保证父边无环，或者先
处理同距离零边形成的连通结构。不要把本文的逐点独立最优化原样套过去。

## 常见错误

- 把所有紧边都加入结果，得到的不是树；
- 相同最短距离时比较父节点编号，而题目要求最小化边权和；
- 只在点第一次入队时固定父边，漏掉以后出现的同距离更小父边；
- 使用负边权，却仍调用 Dijkstra；
- 允许零边权时仍以“距离严格减小”证明无环；
- 图不保证连通时直接读取 `edge[0]` 作为不可达节点父边。

## 需要记住什么

- 什么条件使一条边可以成为最短路树的父边？
- 为什么不能保留全部紧边？
- 正边权为什么保证独立选择父边后不会形成环？
- 为什么总边权最小时可以对每个点独立选择最便宜紧入边？
- Dijkstra 遇到相同最短距离时要比较什么？
- 允许零边权后，本文证明的哪一步失效？
