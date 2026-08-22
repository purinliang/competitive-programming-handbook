# 点双连通分量与圆方树

> 最近修订：2026-08-23 05:25 +10:00（未审阅）

一个无向网络原本连通，但删除某个点及其关联边后可能断开。这样的点叫做割点。若要
处理“路径是否必经某些割点”“删除一个点会分开哪些区域”等问题，只找出割点往往还
不够；我们还需要知道其余点怎样围绕割点组成不可再由单点切开的部分。

这些部分称为点双连通分量。不同点双连通分量可以共享割点，却不会共享普通点。把每个
分量建立成一个新节点，并连接它包含的原图点，就能把一般无向图转化为一棵或多棵树，
称为圆方树。

## DFS 树与返祖边

对无向图进行 DFS，记录：

- `dfn[u]`：第一次访问 `u` 的时间；
- `low[u]`：从 `u` 的 DFS 子树出发，经过任意条树边并至多经过一条返祖边，能够
  到达的最早访问时间。

处理树边 `u -> v` 后：

```cpp
low[u] = min(low[u], low[v]);
```

遇到不是父边的已访问边 `(u,v)`：

```cpp
low[u] = min(low[u], dfn[v]);
```

无向图应按边编号跳过进入当前节点的那一条父边。只写 `v == parent` 会在重边图中
错误跳过全部平行边。

## 分量闭合条件

设 `v` 是 `u` 的 DFS 儿子。若：

$$
low[v]\ge dfn[u],
$$

那么 `v` 的子树无法绕过 `u` 到达 `u` 的祖先。此时从 DFS 栈顶到 `v` 的所有点，
再加上 `u`，恰好形成一个点双连通分量。

```cpp
if (low[v] >= dfn[u]) {
    vector<int> component;
    do {
        x = stack.back();
        stack.pop_back();
        component.push_back(x);
    } while (x != v);
    component.push_back(u);
}
```

`u` 不能在这里从栈中弹出。它可能还是更上方另一个分量的边界，也可能作为割点同时
出现在多个分量中。

## 割点判定

同一个条件也给出割点：

- 非 DFS 根节点 `u` 只要存在儿子 `v` 满足 `low[v] >= dfn[u]`，`u` 就是割点；
- DFS 根节点只有至少两个 DFS 儿子时才是割点。

根只有一个儿子时，删除根不会把剩余 DFS 树分成两部分，不能套用普通节点条件。

## 边与孤立点的约定

在竞赛常用的点双分解中，一条桥的两个端点也构成一个点双连通分量。它内部没有割点
可把仍含边的子图继续分开，这一约定也让每条边恰好属于一个分量。

孤立点没有边，Tarjan 的弹栈条件不会产生分量。为了让圆方树仍包含它，本文单独建立
只含这个点的分量。

## 建立圆方树

保留原图点编号 $1\ldots n$，把第 `i` 个点双连通分量编号为 `n+i`。若分量 `i`
包含原图点 `u`，就在圆方树中连接：

```text
u -- (n + i)
```

原图点常画成圆形，分量节点常画成方形，因此得名圆方树。

普通点只属于一个分量，割点属于多个分量。对原图的每个连通分量，圆方结构是一棵树；
原图不连通时得到森林。原图中的复杂环结构被收进方点，分量之间的连接关系变成树形，
以后可以使用 LCA、树上差分或树形 DP。

## 正确性直觉

当 `low[v] >= dfn[u]` 时，`v` 子树没有边能到达 `u` 以上；因此这部分与此前仍在
栈中的其他点只能通过 `u` 相连，分量边界已经确定。

反过来，栈中从 `v` 到当前顶部的点仍通过 DFS 树边和返祖边连在一起，在边界闭合前
不能被拆到更早的分量。每次按边界弹栈，保证每条 DFS 树边只进入一个分量，而边界点
`u` 可以被相邻分量共享。

圆方树不会形成环。若分量节点与割点节点在圆方结构中形成环，就意味着这些分量可以
绕过任意一个共享割点相互到达，它们本应属于同一个更大的点双连通分量，矛盾。

## 完整代码

输入一个无自环的无向图，可以含重边。程序输出割点、所有点双连通分量，以及圆方树
的边。

```cpp
#include <bits/stdc++.h>
using namespace std;

int n, m;
int timer;
vector<vector<pair<int, int>>> g;
vector<int> dfn;
vector<int> low;
vector<int> vertex_stack;
vector<bool> is_cut;
vector<vector<int>> component;

void tarjan(int u, int parent_edge) {
    dfn[u] = low[u] = ++timer;
    vertex_stack.push_back(u);
    int child_count = 0;

    for (auto [v, edge_id] : g[u]) {
        if (edge_id == parent_edge) {
            continue;
        }

        if (dfn[v] == 0) {
            ++child_count;
            tarjan(v, edge_id);
            low[u] = min(low[u], low[v]);

            if (low[v] >= dfn[u]) {
                if (parent_edge != 0 || child_count >= 2) {
                    is_cut[u] = true;
                }

                vector<int> current;
                int x;
                do {
                    x = vertex_stack.back();
                    vertex_stack.pop_back();
                    current.push_back(x);
                } while (x != v);
                current.push_back(u);
                component.push_back(current);
            }
        } else {
            low[u] = min(low[u], dfn[v]);
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m;

    g.assign(n + 5, {});
    dfn.assign(n + 5, 0);
    low.assign(n + 5, 0);
    is_cut.assign(n + 5, false);

    for (int i = 1; i <= m; ++i) {
        int u, v;
        cin >> u >> v;
        g[u].push_back({v, i});
        g[v].push_back({u, i});
    }

    for (int u = 1; u <= n; ++u) {
        if (dfn[u] != 0) {
            continue;
        }

        if (g[u].empty()) {
            dfn[u] = low[u] = ++timer;
            component.push_back({u});
            continue;
        }

        tarjan(u, 0);
        vertex_stack.pop_back();
    }

    int component_count = component.size();
    vector<vector<int>> block_cut_tree(n + component_count + 5);

    for (int i = 0; i < component_count; ++i) {
        int component_node = n + i + 1;
        for (int u : component[i]) {
            block_cut_tree[u].push_back(component_node);
            block_cut_tree[component_node].push_back(u);
        }
    }

    vector<int> cut_vertex;
    for (int u = 1; u <= n; ++u) {
        if (is_cut[u]) {
            cut_vertex.push_back(u);
        }
    }

    cout << cut_vertex.size() << '\n';
    for (int u : cut_vertex) {
        cout << u << ' ';
    }
    cout << '\n';

    cout << component_count << '\n';
    for (const vector<int>& current : component) {
        cout << current.size();
        for (int u : current) {
            cout << ' ' << u;
        }
        cout << '\n';
    }

    for (int u = 1; u <= n + component_count; ++u) {
        for (int v : block_cut_tree[u]) {
            if (u < v) {
                cout << u << ' ' << v << '\n';
            }
        }
    }
    return 0;
}
```

## 复杂度

Tarjan DFS 中每条无向边只被常数次访问，时间复杂度为 $O(n+m)$。每个分量与其所含
点各产生一条圆方树边，这些关联总数也是 $O(n+m)$，因此总时间和空间复杂度均为
$O(n+m)$。

## 常见错误

- 用父节点编号代替父边编号，无法正确处理重边；
- 把条件写成 `low[v] > dfn[u]`，那是桥的条件，不是点双分量边界；
- 生成分量时把边界点 `u` 也从栈中永久弹出；
- 忘记 DFS 根节点需要至少两个儿子才是割点；
- 不处理孤立点，使它从圆方森林中消失；
- 把点双连通分量与边双连通分量混为一谈；后者以桥为分界，结构和缩点方式不同。

## 需要记住什么

- `dfn[u]` 与 `low[u]` 分别表示什么？
- 为什么点双分量闭合条件是 `low[v] >= dfn[u]`？
- DFS 根与非根的割点条件有何不同？
- 为什么边界点 `u` 可以出现在多个分量中？
- 圆方树的圆点、方点和边分别表示什么？
- 为什么一般无向图经过点双分解后会得到树或森林？
