# 树上数据结构：树链剖分

> 最近修订：2026-08-17 06:34 +10:00（未审阅）

线段树和树状数组擅长维护数组区间，但树上两点之间的路径通常不是 DFS 序中的
一个连续区间。

树链剖分把每条树上路径拆成少量连续编号区间，再交给普通数组数据结构处理。
本篇使用最常见的轻重链剖分，完成：

- 单点增加；
- 查询两点路径上的节点权值和。

底层使用树状数组，让注意力集中在“树路径怎样变成数组区间”。

## 子树大小与重儿子

先把树以 `root` 为根。对每个节点 `u` 计算：

- `par[u]`：父节点；
- `dep[u]`：深度；
- `siz[u]`：子树节点数；
- `heavy[u]`：子树最大的儿子。

`heavy[u]` 称为 `u` 的重儿子；若 `u` 是叶子，则为 `0`。`u` 到重儿子的边
称为重边，其他通向儿子的边称为轻边。

第一遍 DFS：

```cpp
void dfs_size(int u, int p) {
    par[u] = p;
    dep[u] = dep[p] + 1;
    siz[u] = 1;
    heavy[u] = 0;

    for (int v : g[u]) {
        if (v == p) {
            continue;
        }

        dfs_size(v, u);
        siz[u] += siz[v];

        if (heavy[u] == 0 ||
            siz[v] > siz[heavy[u]]) {
            heavy[u] = v;
        }
    }
}
```

这里“重”只表示当前节点所有儿子中子树最大，不表示边权。

## 重链

连续沿重儿子向下走，会形成一条重链。每个节点维护：

```cpp
top[u] = u 所在重链最浅的节点
```

同一条重链上的节点从上到下连续编号。第二遍 DFS 维护：

- `dfn[u]`：节点 `u` 在线性数组中的位置；
- `rev[i]`：位置 `i` 对应的原树节点；
- `top[u]`：重链顶端。

## 为什么先访问重儿子

访问 `u` 后立即访问重儿子，才能让整条重链获得连续编号：

```cpp
void dfs_decompose(int u, int chain_top) {
    top[u] = chain_top;
    dfn[u] = ++timer;
    rev[timer] = u;

    if (heavy[u] != 0) {
        dfs_decompose(heavy[u], chain_top);
    }

    for (int v : g[u]) {
        if (v == par[u] || v == heavy[u]) {
            continue;
        }
        dfs_decompose(v, v);
    }
}
```

重儿子继承原来的 `chain_top`。每个轻儿子开始一条新重链，所以传入 `v`
自身作为链顶。

若先递归某个轻儿子，它的整个子树会插进 `u` 与重儿子之间，同一重链就不再
连续。

## 同一条重链上的路径

若：

```cpp
top[u] == top[v]
```

两点在同一条重链上。链上深度顺序与 `dfn` 顺序一致，它们之间的路径是一个
连续闭区间：

```cpp
[min(dfn[u], dfn[v]), max(dfn[u], dfn[v])]
```

因此能直接用树状数组或线段树查询。

## 不同重链上的路径

若链顶不同，比较两个链顶的深度。让链顶更深的一侧先跳：

```cpp
if (dep[top[u]] < dep[top[v]]) {
    swap(u, v);
}
```

从 `top[u]` 到 `u` 的整段都在最终路径上，对应连续区间：

```cpp
answer += fenwick.range_sum(dfn[top[u]], dfn[u]);
```

处理后跳到这条链顶的父节点：

```cpp
u = par[top[u]];
```

不断重复，直到两点进入同一条重链，再处理最后一段。

不能直接让更深的节点跳父亲；必须一次处理到链顶，才能把完整连续段交给区间
数据结构。

## 为什么只有对数条链

若 `v` 是 `u` 的轻儿子，`v` 不是子树最大的儿子。于是一定有：

$$
siz[v]\le\frac{siz[u]-1}{2}<\frac{siz[u]}{2}.
$$

否则若 `siz[v] > siz[u]/2`，其他任何儿子都不可能更大，`v` 应当成为重儿子。

沿根到任意节点的路径每经过一条轻边，剩余子树大小至少减半。最多减半
$O(\log n)$ 次，所以任意树上路径只会跨越 $O(\log n)$ 条重链。

若底层一次区间查询为 $O(\log n)$，一次路径查询就是 $O(\log^2 n)$。

## 把节点权值放进线性数组

节点 `u` 的权值放到位置 `dfn[u]`：

```cpp
fenwick.add(dfn[u], value[u]);
```

单点增加 `delta`：

```cpp
fenwick.add(dfn[u], delta);
```

树结构不变时，剖分只需构建一次。后续权值修改只操作线性数据结构，不重新 DFS。

如果维护边权，可以把父边权值放在较深端点的 `dfn` 位置。查询一条路径时需要
排除 LCA 对应位置；节点权与边权的边界不同，不能直接混用同一段代码。

## 完整代码

输入一棵以 `1` 为根的树和初始节点权值。操作：

```text
1 u delta  给节点 u 增加 delta
2 u v      查询 u 到 v 路径上的节点权值和
```

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct Fenwick {
    int n;
    vector<ll> tree;

    void init(int size) {
        n = size;
        tree.assign(n + 5, 0);
    }

    void add(int x, ll value) {
        while (x <= n) {
            tree[x] += value;
            x += x & -x;
        }
    }

    ll prefix_sum(int x) const {
        ll sum = 0;

        while (x > 0) {
            sum += tree[x];
            x -= x & -x;
        }
        return sum;
    }

    ll range_sum(int l, int r) const {
        return prefix_sum(r) - prefix_sum(l - 1);
    }
};

int n, q;
vector<vector<int>> g;
vector<ll> value;
vector<int> par;
vector<int> dep;
vector<int> siz;
vector<int> heavy;
vector<int> top;
vector<int> dfn;
vector<int> rev;
int timer;
Fenwick fenwick;

void dfs_size(int u, int p) {
    par[u] = p;
    dep[u] = dep[p] + 1;
    siz[u] = 1;
    heavy[u] = 0;

    for (int v : g[u]) {
        if (v == p) {
            continue;
        }

        dfs_size(v, u);
        siz[u] += siz[v];

        if (heavy[u] == 0 ||
            siz[v] > siz[heavy[u]]) {
            heavy[u] = v;
        }
    }
}

void dfs_decompose(int u, int chain_top) {
    top[u] = chain_top;
    dfn[u] = ++timer;
    rev[timer] = u;

    if (heavy[u] != 0) {
        dfs_decompose(heavy[u], chain_top);
    }

    for (int v : g[u]) {
        if (v == par[u] || v == heavy[u]) {
            continue;
        }
        dfs_decompose(v, v);
    }
}

ll query_path(int u, int v) {
    ll answer = 0;

    while (top[u] != top[v]) {
        if (dep[top[u]] < dep[top[v]]) {
            swap(u, v);
        }

        answer += fenwick.range_sum(
            dfn[top[u]], dfn[u]);
        u = par[top[u]];
    }

    if (dep[u] > dep[v]) {
        swap(u, v);
    }
    answer += fenwick.range_sum(dfn[u], dfn[v]);
    return answer;
}

void solve() {
    cin >> n >> q;

    value.assign(n + 5, 0);
    for (int u = 1; u <= n; u++) {
        cin >> value[u];
    }

    g.assign(n + 5, {});
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }

    par.assign(n + 5, 0);
    dep.assign(n + 5, 0);
    siz.assign(n + 5, 0);
    heavy.assign(n + 5, 0);
    top.assign(n + 5, 0);
    dfn.assign(n + 5, 0);
    rev.assign(n + 5, 0);
    timer = 0;

    dfs_size(1, 0);
    dfs_decompose(1, 1);

    fenwick.init(n);
    for (int u = 1; u <= n; u++) {
        fenwick.add(dfn[u], value[u]);
    }

    while (q--) {
        int operation, u;
        cin >> operation >> u;

        if (operation == 1) {
            ll delta;
            cin >> delta;
            fenwick.add(dfn[u], delta);
        } else {
            int v;
            cin >> v;
            cout << query_path(u, v) << '\n';
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

两遍 DFS 的递归深度最坏为 $n$。长链规模很大时，需要确认栈空间或改成显式栈
构建；路径拆分和编号规则不变。

## 复杂度

- 两遍 DFS 预处理：$O(n)$；
- 建立树状数组：$O(n\log n)$；
- 单点增加：$O(\log n)$；
- 路径查询：至多 $O(\log n)$ 段，每段
  $O(\log n)$，总计 $O(\log^2 n)$；
- 空间复杂度：$O(n)$。

## 常见错误

- 把重儿子理解成边权最大的儿子，而不是子树最大的儿子；
- 第二遍 DFS 没有优先访问重儿子，导致重链编号不连续；
- 轻儿子仍继承父亲链顶，没有开启新链；
- 链顶不同时移动链顶更浅的一侧；
- 查询完一段后写成 `u = par[u]`，而不是跳过整条链；
- 同链最后一段忘记交换深浅端点；
- 把节点权路径代码直接用于边权，错误计入 LCA；
- 树结构改变后仍沿用旧剖分。

## 需要记住什么

- `siz`、`heavy`、`top` 和 `dfn` 分别表达什么？
- 为什么第二遍 DFS 必须先访问重儿子？
- 链顶不同时，为什么处理更深链的整段再向上跳？
- 为什么一条根路径只经过 $O(\log n)$ 条轻边？
- 树链剖分与树状数组或线段树各自负责哪一部分？

