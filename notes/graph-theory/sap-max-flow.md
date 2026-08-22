# SAP 算法

> 最近修订：2026-08-23 06:28 +10:00（未审阅）

Dinic 每轮从源点 BFS，建立一张新的分层图。SAP（Shortest Augmenting Path）换一个
方向维护信息：为每个点保存它到汇点的残量边数距离，只沿距离恰好减少 $1$ 的边增广；
某个点走不动时，局部提高它的距离标号，而不是立即重建全部层级。

竞赛中常见模板还加入当前弧和 `gap` 优化，也常称为 ISAP。本文先说明距离标号为何
合法，再加入这两个不会改变模型的优化。

## 从汇点初始化距离

设 `distance[u]` 表示残量网络中从 `u` 到汇点的最少边数。初始化时从汇点反向 BFS。

链式前向星枚举的是 `u -> v` 记录。若配对边 `v -> u` 的残量大于 $0$，说明 `v`
可以沿残量边到达当前点 `u`：

```cpp
if (edge[i ^ 1].capacity > 0) {
    distance[v] = distance[u] + 1;
}
```

无法到达汇点的节点距离设为 `n`。若源点初始距离就是 `n`，残量网络中没有增广路，
最大流为 $0$。

## 允许增广的边

从 `u` 走到 `v` 时，只使用满足下式的正残量边：

```cpp
distance[u] == distance[v] + 1
```

这种边称为允许边。距离每走一步严格减小，最终只能走向汇点，不会在残量网络中绕环。

一次 DFS 与 Dinic 类似，可以沿多条允许边推送流量，并成对更新正反残量。

## 走不动时重新标号

若 `u` 仍有流量待发送，却找不到允许边，就检查所有正残量出边。任何从 `u` 到汇点
的路径都必须先走到某个相邻点 `v`，所以新的合法距离下界为：

$$
distance[u]=1+\min distance[v].
$$

若没有正残量出边，最小值视为 `n-1`，重标号结果为 `n`，表示当前无法到达汇点。

重标号只会增大距离。一个点的标号最多从 $0$ 增加到 $n$，这给出了 SAP 的复杂度
基础。

## 当前弧优化

与 Dinic 相同，`current[u]` 记录当前检查到的出边。只要 `u` 的距离没有改变，已经
检查失败的前缀边无需重试。

`u` 被重新标号后，允许边条件改变，必须重置：

```cpp
current[u] = head[u];
```

## gap 优化

维护：

```cpp
count[d]
```

表示当前恰有多少个点的距离标号为 `d`。

若某个 `d < n` 的计数变成 $0$，所有距离大于 `d` 的节点都不可能沿“每次减少
$1$”的允许边到达汇点：路径中本应经过一个距离为 `d` 的节点，但这一层已经完全
消失。

若源点仍位于这个断层上方，就可以直接令 `distance[source] = n`，终止算法。这就是
`gap` 优化。

## 正确性直觉

距离初始化是真实的残量最短边数。增广只改变残量网络，旧距离可能不再精确，但重新
标号始终取所有可走后继标号的最小值加一，因此不会低估从当前点到汇点所需的允许层数。

DFS 仍然只沿正残量边增广并更新反向残量，所以始终保持可行流。只要源点距离小于
`n`，允许边或重标号会继续推进算法；当源点距离达到 `n` 时，不再存在源汇增广路，
当前流即为最大流。

## 完整代码

输入有向容量网络、源点和汇点，输出最大流。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 4e18;

struct SAP {
    struct Edge {
        int v;
        int next;
        ll capacity;
    };

    int n;
    int source;
    int sink;
    vector<int> head;
    vector<int> current;
    vector<int> distance;
    vector<int> count;
    vector<Edge> edge;

    SAP(int size, int edge_count)
        : n(size), source(0), sink(0), head(n + 5, -1), current(n + 5),
          distance(n + 5), count(n + 5) {
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

    void initialize_distance() {
        fill(distance.begin(), distance.end(), n);
        fill(count.begin(), count.end(), 0);

        queue<int> q;
        q.push(sink);
        distance[sink] = 0;

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            for (int i = head[u]; i != -1; i = edge[i].next) {
                int v = edge[i].v;
                if (distance[v] != n || edge[i ^ 1].capacity == 0) {
                    continue;
                }

                distance[v] = distance[u] + 1;
                q.push(v);
            }
        }

        for (int u = 1; u <= n; ++u) {
            ++count[distance[u]];
        }
    }

    ll dfs(int u, ll flow) {
        if (u == sink) {
            return flow;
        }

        ll used = 0;

        for (int& i = current[u]; i != -1; i = edge[i].next) {
            int v = edge[i].v;
            if (edge[i].capacity == 0) {
                continue;
            }

            if (distance[u] != distance[v] + 1) {
                continue;
            }

            ll sent = dfs(v, min(flow - used, edge[i].capacity));
            if (sent == 0) {
                continue;
            }

            edge[i].capacity -= sent;
            edge[i ^ 1].capacity += sent;
            used += sent;

            if (used == flow || distance[source] == n) {
                return used;
            }
        }

        int minimum_distance = n - 1;
        for (int i = head[u]; i != -1; i = edge[i].next) {
            if (edge[i].capacity > 0) {
                minimum_distance = min(minimum_distance, distance[edge[i].v]);
            }
        }

        int old_distance = distance[u];
        --count[old_distance];
        if (count[old_distance] == 0) {
            distance[source] = n;
            return used;
        }

        distance[u] = minimum_distance + 1;
        ++count[distance[u]];
        current[u] = head[u];
        return used;
    }

    ll run(int start, int target) {
        source = start;
        sink = target;
        initialize_distance();
        current = head;

        ll answer = 0;
        while (distance[source] < n) {
            answer += dfs(source, INF);
        }
        return answer;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, source, sink;
    cin >> n >> m >> source >> sink;

    SAP sap(n, m);
    for (int i = 1; i <= m; ++i) {
        int u, v;
        ll capacity;
        cin >> u >> v >> capacity;
        sap.add_edge(u, v, capacity);
    }

    cout << sap.run(source, sink) << '\n';
    return 0;
}
```

## 复杂度

每个点的距离标号最多增加到 $n$，配合当前弧后，一般最坏时间复杂度为
$O(n^2m)$，空间复杂度为 $O(n+m)$。`gap` 不改变最坏复杂度，但在标号出现断层时
可以提前结束大量无效重标号。

Dinic 通常更常见、更容易审查。SAP 的学习价值在于另一种最大流推进方式，以及
`gap` 优化所利用的“距离层不能断裂”性质；不要因为模板更长就默认它一定更快。

## 常见错误

- 从汇点 BFS 时检查 `edge[i].capacity`，而不是能让邻点走向当前点的
  `edge[i ^ 1].capacity`；
- 允许边条件写反；从源点走向汇点时距离应每次减少 $1$；
- 重新标号只看允许边，而不是所有正残量出边；
- 重新标号后没有重置当前弧；
- 修改距离时没有同步维护 `count`；
- `gap` 出现后只跳出当前 DFS，却继续让源点重复增广；
- 把 SAP 的距离标号与 Dinic 每轮从源点建立的层级当成同一份状态。

## 需要记住什么

- SAP 的距离标号从哪个点开始初始化，表示什么？
- 初始化反向 BFS 为什么检查配对边残量？
- 什么是允许边？
- 一个点走不动时怎样重新标号？
- 当前弧在什么时候必须重置？
- `count[d] == 0` 为什么能够提前判定断层上方无法到达汇点？
- SAP 与 Dinic 在维护距离信息的方式上有什么区别？
