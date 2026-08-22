# 最大流

> 最近修订：2026-08-23 06:17 +10:00（未审阅）

一个运输网络中，每条有向边都有容量上限。货物从源点出发，经过中转点，最终流入汇点；
除源点和汇点外，每个点流入多少就必须流出多少。问题是：单位时间内最多能从源点向
汇点输送多少货物？

这就是最大流问题。它不仅描述管道和运输，还能表示二分图匹配、任务分配、最小割和
许多“资源只能使用有限次”的选择模型。

## 可行流的三个条件

对每条有向边 $(u,v)$，容量为 $c(u,v)$，实际流量为 $f(u,v)$。

### 容量限制

流量不能为负，也不能超过边容量：

$$
0\le f(u,v)\le c(u,v).
$$

### 流量守恒

除源点 `source` 和汇点 `sink` 外，每个中转点的总流入等于总流出。

### 流量值

源点净流出的总量，也等于汇点净流入的总量，称为这份流的流量值。最大流要求在所有
满足前两项的方案中把这个值最大化。

## 为什么贪心地送满一条路会出错

找到一条源点到汇点的路径并尽量送流，看起来很自然。但较早选择的路径可能占用一条
关键边，使后续流量无路可走；真正最优方案可能需要撤回一部分旧流，再改走另一条边。

网络流的关键不是永远不犯错，而是让每次决定都可以在以后撤销或调整。残量网络正是
为此建立的。

## 残量网络

若原边 `(u,v)` 容量为 `capacity`，当前已经发送 `flow`：

- 正向还可以继续发送 `capacity - flow`；
- 反向可以撤销至多 `flow`。

因此每条原边在残量网络中对应一对有向记录：

```text
u -> v    初始残量 capacity
v -> u    初始残量 0
```

正向发送 `value` 后：

```cpp
edge[edge_id].capacity -= value;
edge[edge_id ^ 1].capacity += value;
```

反向残量不是原图凭空增加的运输能力。以后若沿反向边增广，含义是把原来从 `u` 到
`v` 的部分流量撤回，再把容量让给另一种路线。

## 为什么配对边连续存储

网络流每次更新正向残量时都要同时更新反向残量。《[图的存储：邻接表（链式前向星
实现）](chained-forward-star.md)》已经说明：让边编号从 $0$ 开始，并把一对边连续
加入，便可用 `edge_id ^ 1` 找到配对边。

```cpp
add_directed_edge(u, v, capacity);
add_directed_edge(v, u, 0);
```

即使原图本来还存在一条 `v -> u` 的有向边，它也应建立自己的正反残量边对，不能与
这条边的撤销记录混为一条。

## 增广路

残量网络中从源点到汇点、且每条边残量都大于 $0$ 的路径称为增广路。沿这条路径还能
增加的最大流量，是路径上最小残量：

$$
\min capacity_{residual}(edge).
$$

把这个值从路径所有正向记录中减去，并加入对应反向记录，就得到一份流量更大的可行流。

增广不会破坏容量限制；在路径内部，每个点同时增加一份流入和一份流出，所以仍满足
流量守恒。

## 没有增广路时为什么最优

从源点出发，只沿正残量边能够到达的点形成集合 $S$，其余点形成集合 $T$。若汇点
不可达，则汇点位于 $T$。

所有从 $S$ 指向 $T$ 的原边都已没有正向残量，也就是已经满流；所有从 $T$ 指向
$S$ 的已用流量都可由反向残量观察，最终净流量等于这个割的容量。

任何流都不可能超过任意一个源汇割的容量。当前流量已经达到某个割的容量，所以它是
最大流。这也是最大流最小割定理的直觉来源。

## 用 BFS 选择增广路

只要不断寻找任意增广路，整数容量下的 Ford–Fulkerson 方法最终会停止；但路径选择
不当时可能很慢。

Edmonds–Karp 每次用 BFS 选择残量边数最少的增广路。BFS 记录到达每个点的边编号，
到达汇点后沿父边反向恢复路径并增广。这不是竞赛中最快的最大流实现，却最适合先验证
残量网络的每一步。

## 完整代码

输入有向网络、源点和汇点，容量使用 64 位整数。程序用 Edmonds–Karp 输出最大流。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 4e18;

struct MaxFlow {
    struct Edge {
        int v;
        int next;
        ll capacity;
    };

    int n;
    vector<int> head;
    vector<int> parent_edge;
    vector<ll> path_capacity;
    vector<Edge> edge;

    MaxFlow(int size, int edge_count)
        : n(size), head(n + 5, -1), parent_edge(n + 5), path_capacity(n + 5) {
        edge.reserve(2 * edge_count + 5);
    }

    void add_directed_edge(int u, int v, ll capacity) {
        edge.push_back({v, head[u], capacity});
        head[u] = edge.size() - 1;
    }

    void add_edge(int u, int v, ll capacity) {
        add_directed_edge(u, v, capacity);
        add_directed_edge(v, u, 0);
    }

    ll bfs(int source, int sink) {
        fill(parent_edge.begin(), parent_edge.end(), -1);
        fill(path_capacity.begin(), path_capacity.end(), 0);

        queue<int> q;
        q.push(source);
        path_capacity[source] = INF;

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            for (int i = head[u]; i != -1; i = edge[i].next) {
                int v = edge[i].v;
                if (edge[i].capacity == 0 || path_capacity[v] != 0) {
                    continue;
                }

                parent_edge[v] = i;
                path_capacity[v] = min(path_capacity[u], edge[i].capacity);

                if (v == sink) {
                    return path_capacity[v];
                }
                q.push(v);
            }
        }
        return 0;
    }

    ll run(int source, int sink) {
        ll answer = 0;

        while (ll value = bfs(source, sink)) {
            answer += value;

            int u = sink;
            while (u != source) {
                int edge_id = parent_edge[u];
                edge[edge_id].capacity -= value;
                edge[edge_id ^ 1].capacity += value;
                u = edge[edge_id ^ 1].v;
            }
        }
        return answer;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, source, sink;
    cin >> n >> m >> source >> sink;

    MaxFlow max_flow(n, m);
    for (int i = 1; i <= m; ++i) {
        int u, v;
        ll capacity;
        cin >> u >> v >> capacity;
        max_flow.add_edge(u, v, capacity);
    }

    cout << max_flow.run(source, sink) << '\n';
    return 0;
}
```

代码只保存残量，不单独保存 `flow`。对一条原始正向记录，当前流量等于其配对反向
记录的残量；若原图存在双向边，则每个输入方向仍拥有独立边对。

## 复杂度

Edmonds–Karp 每次 BFS 为 $O(m)$，增广次数为 $O(nm)$，总时间复杂度为
$O(nm^2)$，空间复杂度为 $O(n+m)$。

这份代码用于建立最大流与残量网络的正确模型。下一篇 Dinic 使用分层图和当前弧一次
推进多条增广路，才是更常用的竞赛模板。

## 常见错误

- 只减少正向残量，没有增加反向残量，导致旧选择无法撤销；
- 把原图的反向有向边与残量网络的反向记录合并；
- 配对边没有连续加入，却仍用 `edge_id ^ 1`；
- BFS 只判断是否有原边，不判断当前残量是否大于 $0$；
- 恢复路径时把边终点当成父节点；配对反向边的终点才是当前边起点；
- 容量总和可能超过 32 位整数，却仍用 `int` 保存最大流。

## 需要记住什么

- 可行流需要满足哪三类条件？
- 正向残量和反向残量分别表示什么？
- 为什么一条原边要建立一对连续残量记录？
- 增广路一次最多能增加多少流量？
- 沿增广路更新为什么不破坏中转点的流量守恒？
- 残量网络中不存在源汇路径时，为什么当前流已经最大？
- Edmonds–Karp 与后续 Dinic 主要改变了哪一部分？
