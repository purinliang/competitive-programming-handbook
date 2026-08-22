# 斯坦纳树

> 最近修订：2026-08-23 05:52 +10:00（未审阅）

一张道路网络中只有少量城市必须互相连通，其他城市可以作为中转点。我们需要选择
若干条道路，让所有指定城市位于同一个连通子图中，并使道路总长度最小。

若要求连接所有点，问题就是最小生成树；现在只要求连接 $k$ 个关键点，最优方案可能
借助未被指定的普通点形成更便宜的连接。这些额外使用的点称为斯坦纳点，问题称为图上
斯坦纳树问题。

一般斯坦纳树是 NP-hard 问题，不能只依靠点数 $n$ 得到多项式算法。但当关键点数量
$k$ 很小时，可以对关键点集合做状态压缩，再在整张图上维护连接位置。

## 状态定义

把第 $i$ 个关键点对应到二进制位 `i - 1`。`mask` 表示已经连接的关键点集合，定义：

$$
dp[mask][u]
$$

为连接 `mask` 中全部关键点，并且所选连通子图包含点 `u` 的最小边权和。

这里的 `u` 不是必须成为最终树根。它只是当前两个子结构可以汇合、或者继续沿道路
扩展的位置。

对每个关键点 `terminal[i]`，最小初始结构只包含它自己：

```cpp
dp[1 << (i - 1)][terminal[i]] = 0;
```

图中点继续使用 `1..n` 编号；位掩码的最低位自然对应第一个关键点，因此移位位置从
$0$ 开始。

## 在同一点合并两个集合

若两棵连通子图都包含点 `u`，就可以在 `u` 处把它们合成一棵更大的连通子图。

把 `mask` 分成两个不相交的非空子集 `sub` 和 `mask ^ sub`：

$$
dp[mask][u]=\min\bigl(
dp[sub][u]+dp[mask\mathbin{\mathrm{xor}}sub][u]
\bigr).
$$

枚举 `mask` 的全部非空真子集：

```cpp
for (int sub = (mask - 1) & mask; sub > 0; sub = (sub - 1) & mask) {
    int other = mask ^ sub;
}
```

`sub` 与 `other` 交换后表示同一次合并，因此代码只处理其中一半。

这一步回答“两个关键点集合在哪里汇合”。但只在同一点合并还不够：当前最优子图可能
需要沿普通道路移动到另一个更适合继续合并的位置。

## 沿最短路移动连接位置

固定 `mask` 后，把所有已有的 `dp[mask][u]` 同时作为 Dijkstra 的初始距离。

若已经有一棵代价为 `dp[mask][u]` 的连通子图包含 `u`，再选择道路 `u -> v`，就会
得到一棵仍连接相同关键点、并额外包含 `v` 的连通子图：

$$
dp[mask][v]\le dp[mask][u]+weight(u,v).
$$

这是一轮多源最短路：每个已有状态都是一个带不同初始距离的起点。Dijkstra 完成后，
`dp[mask][u]` 才真正表示当前集合在任意点 `u` 汇合的最小代价。

## 为什么先合并再跑最短路

按 `mask` 从小到大处理。一个真子集的数值一定小于 `mask`，因此合并 `mask` 时，两个
子集合已经完成自己的合并与最短路扩展。

对当前 `mask`：

1. 枚举子集划分，在每个点合并两个已经连通的结构；
2. 以全部合并结果为起点跑多源 Dijkstra，让汇合位置沿图移动。

一棵最优斯坦纳树可以任选一个分叉点 `u`，删除这个分叉关系后，关键点被分成若干
部分。取其中一部分与其余部分，就对应一次子集合并；分叉点之间的链则由最短路扩展
覆盖。两种转移因此能够构造最优树。

## 完整代码

输入一张无向非负权图和 $k$ 个关键点，输出连接全部关键点的最小边权和；无法连通时
输出 `-1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 4e18;

struct SteinerTree {
    struct Edge {
        int v;
        ll weight;
    };

    int n;
    int k;
    vector<vector<Edge>> g;
    vector<int> terminal;
    vector<vector<ll>> dp;

    SteinerTree(int vertex_count, int terminal_count)
        : n(vertex_count), k(terminal_count), g(n + 5), terminal(k + 5) {}

    void add_edge(int u, int v, ll weight) {
        g[u].push_back({v, weight});
        g[v].push_back({u, weight});
    }

    void dijkstra(int mask) {
        priority_queue<pair<ll, int>, vector<pair<ll, int>>,
                       greater<pair<ll, int>>>
            q;

        for (int u = 1; u <= n; ++u) {
            if (dp[mask][u] != INF) {
                q.push({dp[mask][u], u});
            }
        }

        while (!q.empty()) {
            ll distance = q.top().first;
            int u = q.top().second;
            q.pop();

            if (distance != dp[mask][u]) {
                continue;
            }

            for (const Edge& edge : g[u]) {
                int v = edge.v;
                ll new_distance = distance + edge.weight;
                if (new_distance >= dp[mask][v]) {
                    continue;
                }

                dp[mask][v] = new_distance;
                q.push({new_distance, v});
            }
        }
    }

    ll run() {
        int state_count = 1 << k;
        dp.assign(state_count, vector<ll>(n + 5, INF));

        for (int i = 1; i <= k; ++i) {
            dp[1 << (i - 1)][terminal[i]] = 0;
        }

        for (int mask = 1; mask < state_count; ++mask) {
            for (int sub = (mask - 1) & mask; sub > 0; sub = (sub - 1) & mask) {
                int other = mask ^ sub;
                if (sub > other) {
                    continue;
                }

                for (int u = 1; u <= n; ++u) {
                    if (dp[sub][u] == INF || dp[other][u] == INF) {
                        continue;
                    }
                    dp[mask][u] = min(dp[mask][u], dp[sub][u] + dp[other][u]);
                }
            }

            dijkstra(mask);
        }

        int all = state_count - 1;
        return *min_element(dp[all].begin() + 1, dp[all].begin() + n + 1);
    }
};

int main() {
    int n, m, k;
    scanf("%d%d%d", &n, &m, &k);

    SteinerTree steiner(n, k);
    for (int i = 1; i <= m; ++i) {
        int u, v;
        ll weight;
        scanf("%d%d%lld", &u, &v, &weight);
        steiner.add_edge(u, v, weight);
    }

    for (int i = 1; i <= k; ++i) {
        scanf("%d", &steiner.terminal[i]);
    }

    ll answer = steiner.run();
    printf("%lld\n", answer == INF ? -1 : answer);
    return 0;
}
```

## 复杂度

每个 `mask` 的子集划分总计形成 $O(3^k)$ 组状态，逐点合并的时间复杂度为
$O(3^k n)$。

每个非空 `mask` 运行一次多源 Dijkstra，时间复杂度为
$O\bigl(2^k(n+m)\log n\bigr)$。总时间复杂度为：

$$
O\bigl(3^k n+2^k(n+m)\log n\bigr),
$$

空间复杂度为 $O(2^k n+m)$。

指数只与关键点数量 $k$ 有关。这正是斯坦纳树能够用于“图很大，但必须连接的点很少”
的原因；若 $k$ 也很大，这种状态压缩算法就不再适用。

## 常见错误

- 把问题误当成只在关键点之间求最小生成树，禁止普通点成为中转点；
- 状态只记录 `mask`，没有记录不同连接结构当前包含的汇合点 `u`；
- 只做子集合并，没有通过最短路把连接位置移动到其他点；
- 在负权图上直接使用 Dijkstra；
- 两个子状态不可达时仍直接相加，导致 `INF` 溢出；
- 把 $O(3^k n)$ 误认为关于 $n$ 的指数复杂度；
- 关键点数量过大时仍分配 `2^k * n` 状态。

## 需要记住什么

- 斯坦纳树与最小生成树的要求有什么区别？
- 状态 `dp[mask][u]` 表示什么？
- 为什么两个关键点子集必须在同一个点 `u` 合并？
- 固定 `mask` 后为什么要运行多源最短路？
- 两类转移分别描述最优树中的什么结构？
- 算法为什么只适合关键点数量较少的问题？
