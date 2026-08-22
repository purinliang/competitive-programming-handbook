# 边双连通分量

> 最近修订：2026-08-23 06:03 +10:00（未审阅）

《[无向图：割点与桥](articulation-points-bridges.md)》已经找出删除后会使图断开的
桥。若网络需要在任意一条边损坏后仍保持区域内部连通，就不能只列出桥；还需要把
“不经过桥就能互相到达”的点完整分组。

这些极大的点集称为边双连通分量。两个点位于同一个边双连通分量，当且仅当它们之间
存在至少两条边不重复的路径；等价地，删除任意一条边后它们仍然连通。

## 桥是唯一边界

若一条边是桥，它的两端一定属于不同边双连通分量。否则两端在分量内部还存在另一条
不使用这条边的路径，这条边就不可能是桥。

反过来，删除图中全部桥后，每个剩余连通分量内部都不含桥。任意一条内部边被删除时，
其两端仍有其他路线相连，因此整个连通分量不会因此断开。

所以划分边双连通分量的方法非常直接：

1. 用 Tarjan 找出全部桥；
2. 再做一次 DFS，遍历时禁止经过桥；
3. 每次从未标号点开始 DFS，得到一个边双连通分量。

## 为什么按父边编号跳过

找桥时仍沿用前文规则：无向边的两个邻接项共享同一个边编号，DFS 只跳过进入当前点
的那一条父边。

```cpp
if (edge_id == parent_edge) {
    continue;
}
```

若图中有两条连接同一对点的平行边，其中一条可以替代另一条。只按父节点判断会把两条
都跳过，从而把它们误判为桥。

## 标记边双连通分量

Tarjan 已经得到 `is_bridge[edge_id]`。第二次 DFS 只需忽略桥：

```cpp
void mark_component(int u, int id) {
    component[u] = id;

    for (auto [v, edge_id] : g[u]) {
        if (is_bridge[edge_id] || component[v] != 0) {
            continue;
        }
        mark_component(v, id);
    }
}
```

孤立点没有边，也会单独得到一个分量编号。边双连通分量是一种点的划分，每个点恰好
属于一个分量；这与割点可以同时属于多个点双连通分量明显不同。

## 压缩后的桥树

把每个边双连通分量缩成一个点。原来的非桥边全部留在同一分量内部，只有桥连接不同
分量：

```cpp
for (int edge_id : bridge) {
    int u = component[edge_u[edge_id]];
    int v = component[edge_v[edge_id]];
    tree[u].push_back(v);
    tree[v].push_back(u);
}
```

对原图的每个连通分量，压缩结果是一棵树。若缩点图仍含环，环上的任意一条原桥都能
沿其余缩点边绕行，便不是真正的桥。

原图不连通时得到森林。桥树保留“哪些可靠区域由哪些脆弱边连接”的结构，适合继续
处理两点之间经过多少座桥、修改哪些桥能影响哪些区域等问题。

## 正确性直觉

第二次 DFS 不经过桥，所以被标成同一分量的点之间只使用非桥边相连。非桥边位于某个
环中，删除其中任意一条仍可沿环的另一侧绕行；这些绕行关系沿连通区域组合，保证分量
内部没有单边故障会使两点分开。

任意两个不同标号区域之间若还有一条非桥边，第二次 DFS 本应沿它把两侧标成同一编号，
矛盾。因此不同分量之间只能由桥连接，划分也是极大的。

## 完整代码

输入一个无自环的无向图，可以含重边。程序输出每个点所属的边双连通分量，以及压缩
后桥森林的边。

```cpp
#include <bits/stdc++.h>
using namespace std;

int n, m;
int timer;
int component_count;
vector<vector<pair<int, int>>> g;
vector<int> edge_u;
vector<int> edge_v;
vector<int> dfn;
vector<int> low;
vector<int> component;
vector<bool> is_bridge;

void find_bridge(int u, int parent_edge) {
    dfn[u] = low[u] = ++timer;

    for (auto [v, edge_id] : g[u]) {
        if (edge_id == parent_edge) {
            continue;
        }

        if (dfn[v] == 0) {
            find_bridge(v, edge_id);
            low[u] = min(low[u], low[v]);

            if (low[v] > dfn[u]) {
                is_bridge[edge_id] = true;
            }
        } else {
            low[u] = min(low[u], dfn[v]);
        }
    }
}

void mark_component(int u, int id) {
    component[u] = id;

    for (auto [v, edge_id] : g[u]) {
        if (is_bridge[edge_id] || component[v] != 0) {
            continue;
        }
        mark_component(v, id);
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m;

    g.assign(n + 5, {});
    edge_u.resize(m + 5);
    edge_v.resize(m + 5);
    dfn.assign(n + 5, 0);
    low.assign(n + 5, 0);
    component.assign(n + 5, 0);
    is_bridge.assign(m + 5, false);

    for (int i = 1; i <= m; ++i) {
        int u, v;
        cin >> u >> v;

        edge_u[i] = u;
        edge_v[i] = v;
        g[u].push_back({v, i});
        g[v].push_back({u, i});
    }

    for (int u = 1; u <= n; ++u) {
        if (dfn[u] == 0) {
            find_bridge(u, 0);
        }
    }

    for (int u = 1; u <= n; ++u) {
        if (component[u] == 0) {
            mark_component(u, ++component_count);
        }
    }

    vector<pair<int, int>> bridge_tree_edge;
    for (int i = 1; i <= m; ++i) {
        if (is_bridge[i]) {
            bridge_tree_edge.push_back(
                {component[edge_u[i]], component[edge_v[i]]});
        }
    }

    cout << component_count << '\n';
    for (int u = 1; u <= n; ++u) {
        cout << component[u] << " \n"[u == n];
    }

    cout << bridge_tree_edge.size() << '\n';
    for (auto [u, v] : bridge_tree_edge) {
        cout << u << ' ' << v << '\n';
    }
    return 0;
}
```

## 复杂度

Tarjan 和第二次 DFS 都只把每个点、每个邻接项访问常数次。建立桥树再扫描一次边集，
总时间复杂度为 $O(n+m)$，空间复杂度为 $O(n+m)$。

## 与点双连通分量的区别

- 边双研究删除一条边，边界是桥；删掉全部桥后直接 DFS 即可；
- 点双研究删除一个点，边界是割点；割点可以被多个分量共享，必须在 Tarjan 过程中
  用点栈确定每个分量；
- 边双分量构成点的互不相交划分；点双分量之间可以在割点处重叠；
- 边双压缩后由桥连接成树；点双需要额外建立圆方树表达包含关系。

## 常见错误

- 找桥时跳过父节点而不是父边，无法处理重边；
- 把桥条件写成 `low[v] >= dfn[u]`；桥必须严格大于；
- 第二次 DFS 仍允许经过桥，把全部区域重新连在一起；
- 认为一个割点也必须属于多个边双连通分量；边双分量是点的划分，不共享点；
- 原图不连通时只从点 $1$ 开始两次 DFS；
- 把压缩后的树边数当成原图中的全部边数；非桥边已经被收进分量内部。

## 需要记住什么

- 边双连通从“删除一条边”角度怎样定义？
- 为什么桥的两端一定属于不同边双连通分量？
- 删除全部桥后，为什么剩余连通分量就是边双连通分量？
- 边双分量是否会共享原图点？
- 压缩边双分量后为什么得到桥树或桥森林？
- 边双与点双在边界、分量重叠和缩点结构上有何区别？
