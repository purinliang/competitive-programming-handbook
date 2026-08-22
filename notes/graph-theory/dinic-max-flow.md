# Dinic 算法

> 最近修订：2026-08-23 06:22 +10:00（未审阅）

《[最大流](max-flow-residual-network.md)》中的 Edmonds–Karp 每次 BFS 只恢复一条
增广路。很多增广路共享前缀或具有相同边数，反复从源点重新搜索会浪费大量工作。

Dinic 算法先用 BFS 把残量网络分层，再用 DFS 在分层图中一次推进多条增广路，直到
这一层所有源汇路径都被某条边堵住。随后才重新分层。

## 残量网络分层

只沿残量大于 $0$ 的边进行 BFS：

```cpp
level[source] = 0;
level[v] = level[u] + 1;
```

`level[u]` 表示当前残量网络中，从源点到 `u` 至少需要经过多少条边。DFS 只允许
沿相邻层边前进：

```cpp
level[v] == level[u] + 1
```

因此分层图是一张有向无环图。DFS 不会在残量网络中绕圈，也不会走一条比当前最短
增广路更长的边。

## 一次 DFS 推送多少流

函数 `dfs(u,sink,flow)` 表示：已经有至多 `flow` 单位流量到达 `u`，尝试把它们
继续送到汇点。

对每条合法分层边，递归能发送：

```cpp
ll sent = dfs(v, sink, min(remaining, edge[i].capacity));
```

成功发送后仍按残量网络规则更新正反边：

```cpp
edge[i].capacity -= sent;
edge[i ^ 1].capacity += sent;
```

只要 `remaining` 仍大于 $0$，就继续尝试 `u` 的其他出边。一次 DFS 调用可能沿多条
分支推送流量，不再局限于单条路径。

## 阻塞流

在当前分层图中不断 DFS，直到源点再也推不出流。此时每条源汇路径都至少有一条边
残量变成 $0$，称为得到当前分层图的一份阻塞流。

阻塞流不一定是整个网络的最大流。反向残量的变化可能让下一轮残量网络出现新的最短
路径，所以需要重新 BFS 分层。

每轮阻塞流结束后，残量网络中最短增广路的边数会严格增加；否则原来的最短层级中仍
存在一条没有被堵住的源汇路径。

## 当前弧优化

若边 `i` 已经被 DFS 完全检查过，而且无法继续送流，在同一张分层图中再次从头检查
它没有意义。

为每个点保存当前检查到的边编号：

```cpp
current[u]
```

DFS 循环直接引用它：

```cpp
for (int& i = current[u]; i != -1; i = edge[i].next) {
    // ...
}
```

递归返回后，`current[u]` 保留在尚未彻底失效的边或链尾。每轮 BFS 得到新的层级后，
再把 `current` 重置为 `head`。

当前弧只在当前分层图内有效；跨 BFS 轮次保留会漏掉重新变得可用的边。

## 正确性直觉

Dinic 的每次 DFS 仍只沿正残量边增广，并成对更新反向残量，所以始终维护一份可行流。

分层限制只暂时忽略比当前最短增广路更长的边。获得阻塞流后，所有当前最短源汇路径
都已被堵住，下一轮重新 BFS 才考虑新的层级。只要残量网络仍有源汇路径，BFS 和 DFS
就能继续增加流量。

当 BFS 无法到达汇点时，残量网络不存在增广路，由最大流最小割定理可知当前流量最大。

## 完整代码

输入有向网络、源点和汇点，输出最大流。边使用链式前向星连续存储，`i ^ 1` 是配对
反向残量边。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 4e18;

struct Dinic {
    struct Edge {
        int v;
        int next;
        ll capacity;
    };

    int n;
    vector<int> head;
    vector<int> current;
    vector<int> level;
    vector<Edge> edge;

    Dinic(int size, int edge_count)
        : n(size), head(n + 5, -1), current(n + 5), level(n + 5) {
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

    bool bfs(int source, int sink) {
        fill(level.begin(), level.end(), -1);

        queue<int> q;
        q.push(source);
        level[source] = 0;

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            for (int i = head[u]; i != -1; i = edge[i].next) {
                int v = edge[i].v;
                if (edge[i].capacity == 0 || level[v] != -1) {
                    continue;
                }

                level[v] = level[u] + 1;
                q.push(v);
            }
        }
        return level[sink] != -1;
    }

    ll dfs(int u, int sink, ll flow) {
        if (u == sink) {
            return flow;
        }

        ll remaining = flow;
        for (int& i = current[u]; i != -1; i = edge[i].next) {
            int v = edge[i].v;
            if (edge[i].capacity == 0 || level[v] != level[u] + 1) {
                continue;
            }

            ll sent = dfs(v, sink, min(remaining, edge[i].capacity));
            if (sent == 0) {
                continue;
            }

            edge[i].capacity -= sent;
            edge[i ^ 1].capacity += sent;
            remaining -= sent;

            if (remaining == 0) {
                break;
            }
        }
        return flow - remaining;
    }

    ll run(int source, int sink) {
        ll answer = 0;

        while (bfs(source, sink)) {
            current = head;

            while (ll flow = dfs(source, sink, INF)) {
                answer += flow;
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

    Dinic dinic(n, m);
    for (int i = 1; i <= m; ++i) {
        int u, v;
        ll capacity;
        cin >> u >> v >> capacity;
        dinic.add_edge(u, v, capacity);
    }

    cout << dinic.run(source, sink) << '\n';
    return 0;
}
```

## 复杂度

一般容量网络中，Dinic 的最坏时间复杂度为 $O(n^2m)$，空间复杂度为 $O(n+m)$。
实际竞赛图上通常远快于 Edmonds–Karp，并且在单位容量网络等特殊模型中还有更好的
复杂度界。

不要只背“Dinic 很快”。它的结构性改进是：BFS 固定一批最短增广路所在的分层图，
DFS 加当前弧在这张图上求阻塞流。

## 常见错误

- BFS 沿容量为 $0$ 的边分层；
- DFS 允许走到任意更深层，而不是严格走 `level + 1`；
- 每轮 BFS 后忘记令 `current = head`；
- 当前弧使用普通局部变量，递归返回后又从表头重新扫描；
- 更新正向残量后忘记增加反向残量；
- 只调用一次源点 DFS 就重新 BFS，没有把当前分层图推成阻塞流；
- 递归深度接近点数时忽略调用栈限制。

## 需要记住什么

- BFS 的 `level` 表示什么？
- DFS 为什么只沿 `level[v] == level[u] + 1` 的边？
- 一份阻塞流具有什么性质？
- 当前弧保存什么，为什么只在当前分层图内有效？
- 当前分层图得到阻塞流后，最短增广路长度为什么会增加？
- Dinic 与 Edmonds–Karp 的残量更新规则是否不同？
- Dinic 的一般最坏时间复杂度是多少？
