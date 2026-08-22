# 最小费用最大流

> 最近修订：2026-08-23 05:42 +10:00（未审阅）

一家平台要把尽可能多的工人分配给不同任务。每名工人至多接受一个任务，每个任务也
至多交给一名工人；把工人 `u` 分配给任务 `v` 还会产生费用 `cost[u][v]`。

普通最大流可以求出最多能完成多少次分配，却不会区分两份流量相同、总费用不同的
方案。我们现在有两个按顺序比较的目标：

1. 先让源点到汇点的流量最大；
2. 在所有最大流中，让总费用最小。

这就是最小费用最大流问题。

## 边的单位费用

一条容量为 `capacity`、单位费用为 `cost` 的边若发送 `flow` 单位流量，会贡献：

$$
flow\times cost
$$

的费用。整张网络的总费用是所有原边费用之和。

费用可以表示运输成本，也可以把收益取相反数。例如一项分配能获得 `profit`，就在
对应边上写入费用 `-profit`；最小化总费用等价于最大化总收益。

## 残量边的费用

《[最大流](max-flow-residual-network.md)》使用反向残量边撤销已经发送的流量。若正向
边 `u -> v` 的单位费用是 `cost`，发送一单位流量会增加 `cost`；以后沿反向边撤销
这一单位流量，就必须减少同样的费用。

因此一条原边需要加入下面这对残量记录：

```text
u -> v    容量 capacity    费用  cost
v -> u    容量 0           费用 -cost
```

更新容量时仍与最大流完全相同：

```cpp
edge[i].capacity -= value;
edge[i ^ 1].capacity += value;
```

反向边的相反费用非常重要。它让后续增广可以撤回一次昂贵选择，再把流量改送到更便宜
的组合；若反向边费用错误地写成 `0`，算法计算的总费用就不再对应真实流量。

## 选择费用最小的增广路

普通最大流只关心有没有增广路。加入费用以后，每增加一单位流量都应尽量选择当前
残量网络中总费用最小的源汇路径。

设一条增广路经过的残量边费用之和为 `path_cost`，路径瓶颈为 `value`。沿整条路径
增广以后：

```text
总流量增加 value
总费用增加 value * path_cost
```

每轮都寻找费用最小的增广路，并一次发送瓶颈流量；残量网络中的反向边会自动保留
调整旧方案的能力。

## 为什么使用 SPFA

即使所有原边费用都非负，使用过的边也会产生负费用反向边。因此不能直接使用普通
Dijkstra 求残量网络最短路。

最容易从原理恢复的基础实现使用 SPFA：

- `dist[u]`：源点到 `u` 的最小残量费用；
- `par[u]`：最短路进入 `u` 的残量边编号；
- `in_queue[u]`：`u` 当前是否在队列中。

只松弛残量大于 `0` 的边：

```cpp
if (edge[i].capacity > 0 && dist[v] > dist[u] + edge[i].cost) {
    dist[v] = dist[u] + edge[i].cost;
    par[v] = i;
}
```

汇点不可达时，残量网络已经没有增广路，当前流量就是最大流。

> 这一基础实现要求初始残量网络不存在可以独立降低费用的负环。竞赛中由源点、若干
> 层选择节点和汇点组成的常见费用流建图通常自然满足这一条件。需要处理一般负环时，
> 还要加入消负环等更完整的最小费用流方法。

## 恢复路径并增广

`par[v]` 保存进入 `v` 的边编号。若该边是 `u -> v`，它的配对边必然是 `v -> u`，
因此配对边的终点就是前驱 `u`：

```cpp
v = edge[par[v] ^ 1].v;
```

先沿父边找到整条路径的最小残量，再成对修改残量并累计费用：

```cpp
ll value = INF;
for (int v = sink; v != source; v = edge[par[v] ^ 1].v) {
    value = min(value, edge[par[v]].capacity);
}

for (int v = sink; v != source; v = edge[par[v] ^ 1].v) {
    int i = par[v];
    edge[i].capacity -= value;
    edge[i ^ 1].capacity += value;
    total_cost += value * edge[i].cost;
}
```

## 正确性直觉

算法始终只沿正残量边增广，并同步更新配对边，所以容量限制和流量守恒不会被破坏。

假设当前流量已经是该流量值下费用最小的方案。把任意一份流量多 `value` 的可行流与
当前流相减，可以在残量网络中分解成源汇路径和若干环。没有可用负费用环时，费用最小
的增量必然来自费用最小的源汇路径；否则就能找到一条比最短路更便宜的增广方法。

因此每轮最短增广都保持“当前流量值下费用最小”。汇点最终不可达时流量已经最大，
此时得到的就是所有最大流中费用最小的一份。

## 完整代码

输入有向费用网络、源点和汇点。每条边依次给出起点、终点、容量和单位费用；程序输出
最大流量与对应的最小费用。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 4e18;

struct MinCostMaxFlow {
    struct Edge {
        int v;
        int next;
        ll capacity;
        ll cost;
    };

    int n;
    int source;
    int sink;
    vector<int> head;
    vector<int> par;
    vector<int> in_queue;
    vector<ll> dist;
    vector<Edge> edge;

    MinCostMaxFlow(int size, int edge_count)
        : n(size), source(0), sink(0), head(n + 5, -1), par(n + 5),
          in_queue(n + 5), dist(n + 5) {
        edge.reserve(2 * edge_count + 5);
    }

    void add_directed_edge(int u, int v, ll capacity, ll cost) {
        edge.push_back({v, head[u], capacity, cost});
        head[u] = edge.size() - 1;
    }

    void add_edge(int u, int v, ll capacity, ll cost) {
        add_directed_edge(u, v, capacity, cost);
        add_directed_edge(v, u, 0, -cost);
    }

    bool shortest_path() {
        fill(dist.begin(), dist.end(), INF);
        fill(par.begin(), par.end(), -1);
        fill(in_queue.begin(), in_queue.end(), 0);

        queue<int> q;
        q.push(source);
        dist[source] = 0;
        in_queue[source] = 1;

        while (!q.empty()) {
            int u = q.front();
            q.pop();
            in_queue[u] = 0;

            for (int i = head[u]; i != -1; i = edge[i].next) {
                int v = edge[i].v;
                if (edge[i].capacity == 0 ||
                    dist[v] <= dist[u] + edge[i].cost) {
                    continue;
                }

                dist[v] = dist[u] + edge[i].cost;
                par[v] = i;
                if (!in_queue[v]) {
                    q.push(v);
                    in_queue[v] = 1;
                }
            }
        }

        return par[sink] != -1;
    }

    pair<ll, ll> run(int start, int target) {
        source = start;
        sink = target;
        if (source == sink) {
            return {0, 0};
        }

        ll total_flow = 0;
        ll total_cost = 0;

        while (shortest_path()) {
            ll value = INF;
            for (int v = sink; v != source; v = edge[par[v] ^ 1].v) {
                value = min(value, edge[par[v]].capacity);
            }

            for (int v = sink; v != source; v = edge[par[v] ^ 1].v) {
                int i = par[v];
                edge[i].capacity -= value;
                edge[i ^ 1].capacity += value;
                total_cost += value * edge[i].cost;
            }

            total_flow += value;
        }

        return {total_flow, total_cost};
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, source, sink;
    cin >> n >> m >> source >> sink;

    MinCostMaxFlow flow(n, m);
    for (int i = 1; i <= m; ++i) {
        int u, v;
        ll capacity, cost;
        cin >> u >> v >> capacity >> cost;
        flow.add_edge(u, v, capacity, cost);
    }

    pair<ll, ll> answer = flow.run(source, sink);
    cout << answer.first << ' ' << answer.second << '\n';
    return 0;
}
```

## 复杂度

设最终最大流为 $F$。整数容量下，每次增广至少增加一单位流量，因此增广次数至多为
$F$。一次 SPFA 的最坏复杂度为 $O(nm)$，这份基础实现的最坏时间复杂度为
$O(Fnm)$，空间复杂度为 $O(n+m)$。

这个最坏界可能很大。更高性能的实现会用势能把残量边费用调整为非负，再使用
Dijkstra；它改变的是最短路的实现方式，不改变“在残量网络中寻找最小费用增广路”
这一核心模型。

## 常见错误

- 反向残量边的费用写成 `0`，无法正确撤销旧费用；
- 最短路仍允许经过残量为 `0` 的边；
- 看到原边费用非负就直接使用 Dijkstra，忽略反向边可能为负；
- 只给总费用乘一次流量，而没有按每轮瓶颈累计；
- 使用 `int` 保存总费用，忽略“流量乘单位费用”可能超过 32 位整数；
- 把目标理解成“费用最小时尽量多流”，而不是先最大化流量、再最小化费用；
- 在存在可用负费用环的一般网络中直接套用这份基础实现。

## 需要记住什么

- 最小费用最大流的两个目标按什么顺序比较？
- 为什么反向残量边的费用必须是原边费用的相反数？
- 为什么残量网络中会出现负费用边？
- 每轮应寻找怎样的增广路？
- 一轮增广对总流量和总费用分别产生什么变化？
- 为什么汇点不可达时流量已经最大？
- SPFA 版本的复杂度为什么与最大流量 $F$ 有关？
