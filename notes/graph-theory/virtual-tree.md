# 虚树

> 最近修订：2026-08-23 05:08 +10:00（未审阅）

一棵很大的带权树上，每次查询只关心少量关键节点。若每次都在原树上重新遍历，时间
取决于整棵树的 $n$ 个节点，而不是本次真正相关的 $k$ 个节点。

连接这些关键节点的最小连通子树可能包含大量没有分叉的中间节点。虚树只保留关键
节点和真正改变连接关系的最近公共祖先，用一条加权边压缩原树中的整段路径。

本文用虚树计算：每次给出若干关键节点，连接它们的最小子树边权和是多少。

## 哪些节点必须保留

关键节点当然必须保留。除此以外，若两条通向关键节点的路径在某个节点分叉，这个
分叉点也必须保留；在有根树中，它就是某些关键节点的最近公共祖先（LCA）。

不必加入所有两两 LCA。把关键节点按 DFS 首次访问时间排序后，只加入相邻关键节点
的 LCA，就足以包含所有必要分叉点。

这是因为 DFS 序把同一棵子树中的节点放在连续区间。某个必要 LCA 的不同儿子子树
中都含关键节点时，这些子树在 DFS 序中的边界处必然出现一对相邻关键节点，它们的
LCA 正是这个分叉点或它的祖先链上同样已被覆盖的点。

## 闭包节点集合

设排序后的关键节点为 `key`：

```cpp
sort(key.begin(), key.end(), by_dfs_order);

vector<int> node = key;
for (int i = 1; i < key.size(); ++i) {
    node.push_back(lca(key[i - 1], key[i]));
}
```

再次按 DFS 序排序并去重，得到虚树的全部节点。若原查询中有重复关键节点，也会在
这里一并消除。

## 用栈连接虚树

按 DFS 序扫描闭包节点。栈中保存当前从虚树根到扫描位置的祖先链。

准备加入节点 `u` 时，不断弹出不是 `u` 祖先的栈顶。加入过相邻 LCA 后，最终栈顶
一定是 `u` 在虚树中的父亲：

```cpp
while (!is_ancestor(stack.back(), u)) {
    stack.pop_back();
}

int p = stack.back();
stack.push_back(u);
```

虚树边 `(p,u)` 代表原树中从 `p` 到 `u` 的完整路径，边权为：

$$
\operatorname{dist}(u)-\operatorname{dist}(p).
$$

其中 `p` 是 `u` 的祖先，`dist[x]` 表示根到 `x` 的距离。

## 为什么边权和就是答案

虚树保留了所有关键节点和所有必要分叉点。每条虚树边压缩一段没有其他虚树节点的
原树路径，不同虚树边对应的路径内部互不重叠。

展开所有虚树边，恰好得到连接关键节点的最小原树子树。因此把每条虚树边的压缩权值
相加，就得到答案。

## 完整代码

输入一棵带正边权的树，之后每次查询给出 $k$ 个关键节点，输出连接这些节点的最小
子树边权和。一个关键节点时答案为 $0$。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct VirtualTree {
    int n;
    int log;
    int timer;
    vector<vector<pair<int, int>>> g;
    vector<vector<int>> up;
    vector<int> depth;
    vector<int> tin;
    vector<int> tout;
    vector<ll> distance;

    VirtualTree(int size) : n(size), timer(0), g(n + 5),
                            depth(n + 5), tin(n + 5),
                            tout(n + 5), distance(n + 5) {
        log = 1;
        while ((1 << log) <= n) {
            ++log;
        }
        up.assign(log, vector<int>(n + 5));
    }

    void add_edge(int u, int v, int w) {
        g[u].push_back({v, w});
        g[v].push_back({u, w});
    }

    void dfs(int u, int p) {
        tin[u] = ++timer;
        up[0][u] = p;

        for (int i = 1; i < log; ++i) {
            up[i][u] = up[i - 1][up[i - 1][u]];
        }

        for (auto [v, w] : g[u]) {
            if (v == p) {
                continue;
            }
            depth[v] = depth[u] + 1;
            distance[v] = distance[u] + w;
            dfs(v, u);
        }
        tout[u] = timer;
    }

    void build(int root = 1) {
        depth[root] = 0;
        distance[root] = 0;
        dfs(root, root);
    }

    bool is_ancestor(int u, int v) const {
        return tin[u] <= tin[v] && tout[v] <= tout[u];
    }

    int lca(int u, int v) const {
        if (is_ancestor(u, v)) {
            return u;
        }
        if (is_ancestor(v, u)) {
            return v;
        }

        for (int i = log - 1; i >= 0; --i) {
            if (!is_ancestor(up[i][u], v)) {
                u = up[i][u];
            }
        }
        return up[0][u];
    }

    ll query(vector<int> key) const {
        if (key.size() <= 1) {
            return 0;
        }

        auto by_dfs_order = [&](int u, int v) {
            return tin[u] < tin[v];
        };

        sort(key.begin(), key.end(), by_dfs_order);
        key.erase(unique(key.begin(), key.end()), key.end());
        if (key.size() <= 1) {
            return 0;
        }

        vector<int> node = key;
        int key_count = key.size();
        for (int i = 1; i < key_count; ++i) {
            node.push_back(lca(key[i - 1], key[i]));
        }

        sort(node.begin(), node.end(), by_dfs_order);
        node.erase(unique(node.begin(), node.end()), node.end());

        vector<int> stack;
        stack.push_back(node[0]);
        ll answer = 0;

        for (int i = 1; i < node.size(); ++i) {
            int u = node[i];
            while (!is_ancestor(stack.back(), u)) {
                stack.pop_back();
            }

            int p = stack.back();
            answer += distance[u] - distance[p];
            stack.push_back(u);
        }
        return answer;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    VirtualTree virtual_tree(n);
    for (int i = 1; i < n; ++i) {
        int u, v, w;
        cin >> u >> v >> w;
        virtual_tree.add_edge(u, v, w);
    }
    virtual_tree.build();

    int q;
    cin >> q;
    while (q--) {
        int k;
        cin >> k;

        vector<int> key(k);
        for (int& u : key) {
            cin >> u;
        }
        cout << virtual_tree.query(key) << '\n';
    }
    return 0;
}
```

## 复杂度

预处理 DFS 序、根距离和倍增 LCA 的时间复杂度为 $O(n\log n)$，空间复杂度为
$O(n\log n)$。

一次查询若有 $k$ 个关键节点，只会加入至多 $k-1$ 个相邻 LCA。排序和 LCA 查询的
总时间复杂度为 $O(k\log k+k\log n)$，虚树节点数和临时空间均为 $O(k)$。

## 常见错误

- 只保留关键节点，没有加入必要 LCA，导致栈顶不是正确虚树父亲；
- 加入所有两两 LCA，把节点生成阶段写成 $O(k^2)$；
- 加入 LCA 后没有再次排序和去重；
- 把虚树边权写成原树中的一条直接边权；
- 每次查询后逐点清空长度为 $n$ 的数组，抵消虚树只处理 $k$ 个点的优势；
- 多次出现同一个关键节点时没有去重。

## 需要记住什么

- 虚树要保留关键节点以外的哪些节点？
- 为什么只加入 DFS 序相邻关键节点的 LCA 就足够？
- 栈中维护的是什么祖先关系？
- 一条虚树边的权值怎样从原树根距离得到？
- 为什么展开全部虚树边恰好得到连接关键节点的最小子树？
- 一次查询的复杂度为什么取决于 $k$ 而不是 $n$？
