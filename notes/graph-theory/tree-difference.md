# 树上技巧：树上差分

> 最近修订：2026-08-17 06:49 +10:00（未审阅）

给一棵树和许多次操作，每次给 `u,v,w`，要求把 `u` 到 `v` 路径上的每个
节点都增加 `w`。若逐次走完整路径，最坏需要 $O(nq)$。

当题目只要求所有操作结束后的最终结果，不要求在线查询中间状态，可以像数组
差分一样，只在路径边界留下标记，最后统一从叶子向根累加。

树上没有唯一的“左端点”和“右端点”。路径的汇合位置由最近公共祖先（LCA）
承担，因此树上差分需要 LCA 作为边界。

## 数组差分的启发

数组闭区间 `[l,r]` 增加 `w` 时：

```cpp
difference[l] += w;
difference[r + 1] -= w;
```

最后做一次前缀累加，增加在 `l` 开始生效，在 `r` 以后取消。

树上路径可以看成：

```text
u 向上到 LCA，再向下到 v
```

我们不逐点修改，而是在两端加入贡献，再在汇合处消除多余贡献。

## 节点路径差分公式

令：

```cpp
p = lca(u, v);
```

给路径上每个节点增加 `w`，标记：

```cpp
difference[u] += w;
difference[v] += w;
difference[p] -= w;
difference[par[p]] -= w;
```

若 `p` 是根，`par[p] = 0`，最后一项写入留空位置 `0`，不会进入真实节点。

这个公式是**节点权路径增加**。最后两处为什么一个减在 LCA，一个减在 LCA
父亲，需要从自底向上累加的含义理解。

## 自底向上累加

所有询问完成后，对每个非根节点 `u`：

```cpp
difference[par[u]] += difference[u];
```

必须先处理儿子，再处理父亲。累加完成后：

> `difference[x]` 等于 `x` 子树内所有初始标记之和。

对一条路径单独观察：

- 在 `u` 到 LCA 的分支中，某个节点子树只含 `u` 的正标记，结果为 `w`；
- 在 `v` 分支中同理；
- LCA 的子树包含两端，共得到 `2w`，再减去 LCA 自己的 `w`，保留 `w`；
- LCA 的祖先子树还会包含 `par[LCA]` 的负标记，总和变回 `0`。

于是恰好只有路径上的节点最终得到 `w`。

## 为什么不能在 LCA 减两次

若写：

```cpp
difference[p] -= 2 * w;
```

那么 LCA 子树中的总贡献会从 `2w` 变成 `0`，LCA 自己不会被计入。这套公式
对应的是**边权路径差分**：

```cpp
difference[u] += w;
difference[v] += w;
difference[p] -= 2 * w;
```

累加以后，`difference[x]` 表示父边 `par[x]-x` 被多少路径经过。因为 LCA
上方的父边不属于路径，所以在 LCA 处完全抵消。

因此：

- 节点路径：`+u,+v,-lca,-parent(lca)`；
- 边路径：`+u,+v,-2*lca`。

必须先确认维护对象是节点还是边。

## 获得自底向上顺序

建树时用 BFS 或 DFS 保存父亲先于儿子的顺序 `order`。正序可用于建立深度与
倍增祖先表，逆序就保证儿子先于父亲：

```cpp
for (int i = n - 1; i >= 1; i--) {
    int u = order[i];
    difference[par[u]] += difference[u];
}
```

`order[0]` 是根，不需要再向位置 `0` 汇总。

这样不需要另写一次递归 DFS，也避免长链导致递归栈过深。

## 在线与离线

树上差分只在最后统一还原。在还原前，`difference[u]` 只是边界标记，不是
节点 `u` 的当前真实值。

若题目要求每次路径修改后立刻查询，就不能直接使用这份离线差分；应改用树链
剖分配合支持区间修改的线段树等在线结构。

## 完整代码

输入以节点 `1` 为根的树。每个操作给出 `u,v,w`，表示路径上所有节点增加
`w`。全部操作结束后，输出每个节点的最终增量。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

int n, q;
int log_count;
vector<vector<int>> g;
vector<vector<int>> up;
vector<int> par;
vector<int> dep;
vector<int> order;
vector<ll> difference;

void build_tree(int root) {
    par.assign(n + 5, 0);
    dep.assign(n + 5, 0);
    order.clear();
    order.reserve(n);

    queue<int> que;
    que.push(root);
    dep[root] = 1;

    while (!que.empty()) {
        int u = que.front();
        que.pop();
        order.push_back(u);

        for (int v : g[u]) {
            if (v == par[u]) {
                continue;
            }

            par[v] = u;
            dep[v] = dep[u] + 1;
            up[v][0] = u;

            for (int k = 1; k < log_count; k++) {
                up[v][k] =
                    up[up[v][k - 1]][k - 1];
            }
            que.push(v);
        }
    }
}

int jump(int u, int steps) {
    for (int k = 0; k < log_count; k++) {
        if ((steps & (1 << k)) != 0) {
            u = up[u][k];
        }
    }
    return u;
}

int lca(int u, int v) {
    if (dep[u] < dep[v]) {
        swap(u, v);
    }

    u = jump(u, dep[u] - dep[v]);

    if (u == v) {
        return u;
    }

    for (int k = log_count - 1; k >= 0; k--) {
        if (up[u][k] != up[v][k]) {
            u = up[u][k];
            v = up[v][k];
        }
    }
    return par[u];
}

void solve() {
    cin >> n >> q;

    g.assign(n + 5, {});
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }

    log_count = 1;
    while ((1 << log_count) <= n) {
        log_count++;
    }

    up.assign(
        n + 5,
        vector<int>(log_count, 0));
    build_tree(1);

    difference.assign(n + 5, 0);

    while (q--) {
        int u, v;
        ll w;
        cin >> u >> v >> w;

        int p = lca(u, v);
        difference[u] += w;
        difference[v] += w;
        difference[p] -= w;
        difference[par[p]] -= w;
    }

    for (int i = n - 1; i >= 1; i--) {
        int u = order[i];
        difference[par[u]] += difference[u];
    }

    for (int u = 1; u <= n; u++) {
        cout << difference[u];

        if (u == n) {
            cout << '\n';
        } else {
            cout << ' ';
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 复杂度

- 建树与倍增表：$O(n\log n)$；
- 每条路径求 LCA 并打标记：$O(\log n)$；
- 最后自底向上累加：$O(n)$；
- 总时间复杂度：$O((n+q)\log n)$；
- 空间复杂度：$O(n\log n)$。

若 LCA 已经由其他方式预处理，差分本身每次只进行常数次标记，最后还原为
$O(n)$。

## 常见错误

- 把节点差分公式与边差分公式混用；
- 节点路径在 LCA 处减去两次，漏掉 LCA；
- 忘记在 `par[lca]` 处取消 LCA 上方贡献；
- 没有为根设置父亲 `0` 和留空差分位置；
- 按父亲到儿子的顺序累加，子树贡献尚未完整；
- 还原以前把差分标记当作真实节点答案；
- 需要在线中间答案却仍使用一次性离线差分。

## 需要记住什么

- 树上差分与数组差分的共同思想是什么？
- 节点路径差分的四个标记分别在哪里？
- 为什么 LCA 和 LCA 的父亲各减一次？
- 边路径差分为什么改成在 LCA 减两次？
- 最后为什么必须按照儿子到父亲的顺序累加？

