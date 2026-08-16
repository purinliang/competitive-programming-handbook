# 无向图：割点与桥

> 最近修订：2026-08-17 06:18 +10:00（未审阅）

无向图已经连通，不代表连接同样可靠。删除某个关键点或某条关键边，图可能立刻
断开：

- 删除后使连通分量数量增加的点称为**割点**；
- 删除后使连通分量数量增加的边称为**桥**，也称割边。

重新删除每个点、每条边并运行 DFS，时间会很高。一次 DFS 可以通过时间戳和
`low` 值判断哪些 DFS 子树没有其他道路返回上方。

## DFS 树与返祖边

对无向图运行 DFS，第一次访问新点的边形成 DFS 树。除父子树边外，无向图中的
其他边能够把当前子树连接回已经访问的祖先。

维护：

- `dfn[u]`：点 `u` 第一次被访问的时间；
- `low[u]`：从 `u` 的 DFS 子树出发，经过树边向下并至多使用一条非树边，
  能到达的最早时间戳。

初始化：

```cpp
dfn[u] = low[u] = ++timer;
```

若树边 `u-v` 递归完成：

```cpp
low[u] = min(low[u], low[v]);
```

若遇到一条不是父边的已访问边 `u-v`：

```cpp
low[u] = min(low[u], dfn[v]);
```

`low[v]` 越小，说明 `v` 的子树能绕过父边回到越靠上的祖先。

## 桥

考虑 DFS 树边 `u-v`，其中 `u` 是父节点。若：

$$
low[v]>dfn[u],
$$

说明 `v` 的整个子树无法通过其他边回到 `u` 或 `u` 的任何祖先。删除
`u-v` 后，`v` 子树就与其余部分断开，因此这条边是桥。

若 `low[v] == dfn[u]`，说明子树中存在另一条边恰好回到 `u`，删除树边后仍
可以绕行，所以不是桥。桥使用严格大于：

```cpp
if (low[v] > dfn[u]) {
    bridges.push_back(edge.id);
}
```

## 非根割点

对不是 DFS 根的点 `u`，若存在一个孩子 `v` 满足：

$$
low[v]\ge dfn[u],
$$

则 `v` 子树不能绕过 `u` 到达 `u` 的祖先。删除 `u` 后，这棵子树与上方
断开，所以 `u` 是割点。

这里使用大于等于。即使 `v` 子树能回到 `u` 本身，删除 `u` 后这条回路也随
之消失，仍不能连接到更上方。

```cpp
if (parent_edge != 0 && low[v] >= dfn[u]) {
    is_cut[u] = true;
}
```

## DFS 根的特殊判断

DFS 根没有祖先，不能套用上面的条件。若根只有一个 DFS 孩子，删除根后剩余
所有已访问点仍在这个孩子的子树中，不会因此分裂。

若根至少有两个 DFS 孩子，这些孩子子树之间没有绕过根的连接；否则后访问的
孩子会在先前子树的 DFS 中被访问，不会成为独立孩子。因此：

```cpp
if (parent_edge == 0 && child_count >= 2) {
    is_cut[u] = true;
}
```

根的判断依据是 DFS 树孩子数量，不是原图中的度数。

## 为什么传入父边编号

无向边 `u-v` 在邻接表中存成两个方向：

```text
u -> v
v -> u
```

从 `u` 沿边进入 `v` 后，在 `v` 的邻接表中会立刻看见返回 `u` 的同一条边。
这条边不能被当作绕行道路，因此 DFS 要跳过父边。

不能只写：

```cpp
if (v == parent) {
    continue;
}
```

因为图中可能有两条平行边连接同一对点。只应跳过刚才走来的那一条边；另一条
平行边确实提供了绕行，使其中任何一条都不是桥。

所以为每条原始无向边分配唯一 `id`，两个方向共享同一个编号。DFS 传入
`parent_edge`，只跳过编号相同的边。

## 非连通图

割点和桥定义针对整张图。原图可能一开始就有多个连通分量，因此需要从每个未访问
点开始 DFS：

```cpp
for (int u = 1; u <= n; u++) {
    if (dfn[u] == 0) {
        dfs(u, 0);
    }
}
```

每次 `parent_edge == 0` 的点都是一棵 DFS 树的根，分别应用根节点规则。

## 完整代码

下面输出全部割点和桥。桥按输入边编号递增输出，端点保持输入时的顺序。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Edge {
    int v;
    int id;
};

int n, m;
vector<vector<Edge>> g;
vector<int> dfn;
vector<int> low;
vector<int> edge_u;
vector<int> edge_v;
vector<int> bridges;
vector<bool> is_cut;
int timer;

void dfs(int u, int parent_edge) {
    dfn[u] = low[u] = ++timer;
    int child_count = 0;

    for (const Edge& edge : g[u]) {
        if (edge.id == parent_edge) {
            continue;
        }

        int v = edge.v;

        if (dfn[v] == 0) {
            child_count++;
            dfs(v, edge.id);
            low[u] = min(low[u], low[v]);

            if (parent_edge != 0 &&
                low[v] >= dfn[u]) {
                is_cut[u] = true;
            }

            if (low[v] > dfn[u]) {
                bridges.push_back(edge.id);
            }
        } else {
            low[u] = min(low[u], dfn[v]);
        }
    }

    if (parent_edge == 0 && child_count >= 2) {
        is_cut[u] = true;
    }
}

void solve() {
    cin >> n >> m;

    g.assign(n + 5, {});
    edge_u.assign(m + 5, 0);
    edge_v.assign(m + 5, 0);

    for (int id = 1; id <= m; id++) {
        int u, v;
        cin >> u >> v;

        edge_u[id] = u;
        edge_v[id] = v;
        g[u].push_back({v, id});
        g[v].push_back({u, id});
    }

    dfn.assign(n + 5, 0);
    low.assign(n + 5, 0);
    is_cut.assign(n + 5, false);
    bridges.clear();
    timer = 0;

    for (int u = 1; u <= n; u++) {
        if (dfn[u] == 0) {
            dfs(u, 0);
        }
    }

    vector<int> cut_vertices;

    for (int u = 1; u <= n; u++) {
        if (is_cut[u]) {
            cut_vertices.push_back(u);
        }
    }

    sort(bridges.begin(), bridges.end());

    cout << cut_vertices.size() << '\n';
    for (int u : cut_vertices) {
        cout << u << ' ';
    }
    cout << '\n';

    cout << bridges.size() << '\n';
    for (int id : bridges) {
        cout << edge_u[id] << ' ' << edge_v[id] << '\n';
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

每个点访问一次，每个无向边的两个邻接表记录各检查一次：

- 时间复杂度：$O(n+m)$；
- 空间复杂度：$O(n+m)$。

## 常见错误

- 混淆桥的严格条件 `low[v] > dfn[u]` 与割点的
  `low[v] >= dfn[u]`；
- 对 DFS 根套用非根割点规则；
- 用原图度数而不是 DFS 孩子数判断根割点；
- 只按父节点编号跳边，错误处理平行边；
- 无向边两个方向使用不同边编号，无法识别父边；
- 只从点 `1` 运行 DFS；
- 把 SCC Tarjan 中“是否在栈”的规则照搬到无向图割点算法。

## 需要记住什么

- `low[u]` 在无向图 DFS 中表示什么？
- 为什么桥使用严格大于，而非根割点使用大于等于？
- DFS 根为什么必须单独按照孩子数量判断？
- 为什么有平行边时必须传父边编号而不是父节点？
- 有向图 SCC 与无向图割点、桥的 `low` 更新有什么不同？

