# DAG 上的 DP

> 最近修订：2026-08-17 07:19 +10:00（未审阅）

普通动态规划需要一个不会循环依赖的计算顺序。在线性序列中，通常按下标从小到大；
在树上，通常先算儿子再算父节点；在有向无环图（DAG）上，拓扑序正好提供了一条
满足所有有向边先后关系的顺序。

本篇以“起点到各点的最长路径”为例，把拓扑排序与状态转移组合成 DAG 上的 DP。

## 为什么有环会造成依赖问题

若转移沿有向边 $u\to v$，状态 `f[v]` 依赖 `f[u]`。在有向环：

```text
1 -> 2 -> 3 -> 1
```

中，`f[1]`、`f[2]`、`f[3]` 互相依赖，无法找到一个“前面的状态都已经算完”的
起点。

DAG 没有有向环，存在拓扑序。对每条边 $u\to v$，`u` 都排在 `v` 前面；按拓扑
序处理时，更新 `v` 所需的全部前驱状态都已经完成。

## 问题：DAG 上的最长路径

给定带权 DAG 和起点 `s`，求 `s` 到每个点的最长路径长度。

在一般图中，允许正权环时可以反复绕环，让最长路径无限增加；若要求简单路径，
一般图最长路又是困难问题。DAG 没有环，任何路径最多经过 `n-1` 条边，因此最长
路径有限，并且可以动态规划。

定义：

```cpp
dist[v]
```

表示从起点 `s` 到点 `v` 的最长路径长度。

初始只有起点可达：

```cpp
dist.assign(n + 5, NEG_INF);
dist[s] = 0;
```

`NEG_INF` 表示尚不存在从 `s` 到该点的路径。

## 沿边进行状态转移

若已经得到到达 `u` 的最长路径，再经过边 $u\xrightarrow{w}v$，得到候选值：

$$
\text{dist}[u]+w.
$$

最长路取较大值：

```cpp
dist[v] = max(dist[v], dist[u] + w);
```

只有 `u` 可达时才能转移：

```cpp
if (dist[u] == NEG_INF) {
    continue;
}
```

这与最短路松弛形式相似，只是 `min` 改成 `max`。真正保证一次转移后无需回头的，
不是比较方向，而是 DAG 的拓扑顺序。

## 先得到拓扑序

使用 Kahn 算法：

1. 把所有入度为零的点加入队列；
2. 每次取出一个点加入 `order`；
3. 删除它的全部出边，新变成零入度的点继续入队。

```cpp
vector<int> topological_sort() {
    vector<int> current_indegree = indegree;
    queue<int> q;

    for (int u = 1; u <= n; u++) {
        if (current_indegree[u] == 0) {
            q.push(u);
        }
    }

    vector<int> order;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (auto& [v, w] : g[u]) {
            current_indegree[v]--;
            if (current_indegree[v] == 0) {
                q.push(v);
            }
        }
    }
    return order;
}
```

局部 `current_indegree` 是原入度的副本，因为拓扑排序会持续修改它。边权 `w`
不影响拓扑关系，只在 DP 转移中使用。

若 `order.size() != n`，原图含有向环，不是 DAG，本篇转移顺序无效。

## 按拓扑序推进

得到 `order` 后，依次处理：

```cpp
for (int u : order) {
    if (dist[u] == NEG_INF) {
        continue;
    }

    for (auto& [v, w] : g[u]) {
        dist[v] = max(dist[v], dist[u] + w);
    }
}
```

即使一个点有多个前驱，它也只会在所有前驱都出现在拓扑序以前之后才被处理。
这些前驱会分别尝试更新 `dist[v]`，最终留下最大值。

不可达点也可能出现在拓扑序中。跳过它的转移，避免用 `NEG_INF + w` 制造虚假
路径。

## 阶段、状态与决策

用动态规划的三个要素描述：

- **阶段**：拓扑序中已经处理到的位置；
- **状态**：当前终点 `v`；
- **决策**：最长路径最后从哪个前驱 `u` 经过边 `u -> v` 到达。

也可以从“以 `v` 为结尾”反向写转移：

$$
\text{dist}[v]
=\max_{u\to v}\{\text{dist}[u]+w(u,v)\}.
$$

邻接表按出边存储时，正向从 `u` 推给 `v` 更自然；若按入边存储，也可以在处理
`v` 时集中枚举全部前驱。两种写法使用同一个拓扑顺序。

## 负边不会破坏 DAG 最长路

DAG 最长路允许负边。没有环就不能反复利用某条负边或正边，所有候选路径数量有限。

但如果允许“不选择任何路径”，起点到自身的长度 `0` 可能大于某些负路径。对其他
点仍要用 `NEG_INF` 初始化，不能全部初始化为零，否则会把每个点都误认为可以凭空
作为新起点。

## 恢复一条最长路径

当候选值改善 `dist[v]` 时，记录前驱：

```cpp
if (dist[u] + w > dist[v]) {
    dist[v] = dist[u] + w;
    par[v] = u;
}
```

从目标点不断沿 `par` 回到起点，再反转序列，就得到一条最长路径。若存在多条同长
路径，严格大于条件会保留最先发现的一条。

本篇完整代码只输出距离；路径恢复是同一转移附带的信息。

## 正确性

按拓扑序归纳。

处理点 `u` 时，它的每个前驱都已经处理完。任意从 `s` 到 `u` 的非空路径最后
一定经过某条边 $p\to u$；处理 `p` 时，算法已经用该路径前缀的最优值尝试更新
`u`。因此 `u` 被处理前，所有可能的最后一条边都已考虑，`dist[u]` 已是最长
路径。

随后算法用这个正确值更新 `u` 的全部后继。归纳遍历完整个拓扑序后，所有可达点
答案正确；不可达点没有真实前驱链从 `s` 出发，始终保持 `NEG_INF`。

## 复杂度

拓扑排序和 DP 都各自访问每个点、每条边一次，总时间复杂度为 $O(n+m)$。
邻接表、入度、拓扑序和状态数组占用 $O(n+m)$ 空间。

## 完整代码

程序读取一张带权有向图和起点。若图不是 DAG，输出 `-1`；否则输出起点到各点的
最长路径长度，不可达点输出 `UNREACHABLE`。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const ll NEG_INF = -(1LL << 62);

int n, m, s;
vector<vector<pair<int, ll>>> g;
vector<int> indegree;
vector<ll> dist;

vector<int> topological_sort() {
    vector<int> current_indegree = indegree;
    queue<int> q;

    for (int u = 1; u <= n; u++) {
        if (current_indegree[u] == 0) {
            q.push(u);
        }
    }

    vector<int> order;
    order.reserve(n);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (auto& [v, w] : g[u]) {
            current_indegree[v]--;
            if (current_indegree[v] == 0) {
                q.push(v);
            }
        }
    }
    return order;
}

void dag_longest_path(const vector<int>& order) {
    dist.assign(n + 5, NEG_INF);
    dist[s] = 0;

    for (int u : order) {
        if (dist[u] == NEG_INF) {
            continue;
        }

        for (auto& [v, w] : g[u]) {
            dist[v] = max(dist[v], dist[u] + w);
        }
    }
}

int main() {
    scanf("%d%d%d", &n, &m, &s);

    g.assign(n + 5, {});
    indegree.assign(n + 5, 0);

    for (int i = 1; i <= m; i++) {
        int u, v;
        ll w;
        scanf("%d%d%lld", &u, &v, &w);
        g[u].push_back({v, w});
        indegree[v]++;
    }

    vector<int> order = topological_sort();
    if ((int)order.size() != n) {
        printf("-1\n");
        return 0;
    }

    dag_longest_path(order);
    for (int u = 1; u <= n; u++) {
        if (dist[u] == NEG_INF) {
            printf("UNREACHABLE");
        } else {
            printf("%lld", dist[u]);
        }
        printf("%c", " \n"[u == n]);
    }
    return 0;
}
```

## 常见错误

### 按节点编号而不是拓扑序转移

边的方向与编号未必一致。只有拓扑序能保证所有前驱先于后继处理。

### 把所有状态初始化为零

这会把每个点都当成可以凭空开始的路径，尤其会覆盖真实的负权答案。

### 不检查图中是否有环

拓扑序不足 `n` 个点时，说明依赖存在环，本篇一次前向转移不再正确。

### 把 DAG 最长路误认为一般图最长路

线性算法依赖无环性；一般图中的最长简单路不能直接套用。

## 需要记住什么

1. DAG 为什么天然适合动态规划？
2. 拓扑序怎样保证状态依赖只向前？
3. 最长路状态和转移分别是什么？
4. 为什么不可达状态不能初始化为零？
5. DAG 最长路为什么可以包含负边？复杂度是什么？
