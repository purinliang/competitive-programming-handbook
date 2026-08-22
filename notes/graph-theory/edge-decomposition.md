# 边分治

> 最近修订：2026-08-23 05:32 +10:00（未审阅）

给定一棵带权树，要求统计距离不超过 $k$ 的无序点对。枚举起点再遍历整棵树需要
$O(n^2)$。

如果切断一条边，所有点对会分成三类：完全位于左侧、完全位于右侧，以及跨越切边。
跨边点对的路径一定经过这条边，可以把两侧到端点的距离拿出来统一计算；另外两类则
递归处理。这就是边分治。

真正的困难不是“切边”，而是保证每次切开后两侧规模都按常数比例缩小。

## 为什么不能随便选边

在一条链上选择中间边可以平分节点；但在星形树中，任意原边都只会切出一个叶节点和
其余 $n-1$ 个节点。若每次只减少一个点，递归深度会退化到 $O(n)$。

点分治总能找到平衡的重心，边分治却不保证原树存在平衡边。因此标准做法会先把树
转化为最大度数不超过 $3$ 的树。

## 二叉化高出度节点

先把原树以节点 $1$ 为根。若原节点 `u` 有很多儿子，就保留第一个儿子，其余儿子
通过一条由虚拟节点组成的零权链连接：

```text
u -- child_1
|
dummy_1 -- child_2
|
dummy_2 -- child_3
|
...
```

虚拟边权为 $0$，每条原父子边的权值仍放在连接对应儿子的那条边上。因此任意两个
原节点之间的距离不变。

虚拟节点不作为点对端点，只用于改变树形。原节点权重记为 $1$，虚拟节点权重记为
$0$；后续所有“连通块大小”都只计算原节点数量。

二叉化后：

- 非根原节点至多有一个父亲、一个直接儿子和一条虚拟链，度数不超过 $3$；
- 虚拟节点至多连接前驱、一个原儿子和后继，度数不超过 $3$；
- 新树节点总数仍为 $O(n)$。

## 选择平衡边

在当前连通块中任选根，计算每个 DFS 子树包含的原节点数 `subtree_size[v]`。切断父子
边 `(u,v)` 后，两侧原节点数为：

```text
subtree_size[v]
total - subtree_size[v]
```

选择两侧最大值最小的边。最大度数不超过 $3$ 时，可以保证存在一条边，使较大一侧
至多包含当前原节点数的常数比例；常用界是 $2/3$。因此递归深度为 $O(\log n)$。

## 统计跨边点对

设切边为 `(u,v,w)`。分别收集：

- `left`：切边左侧所有原节点到 `u` 的距离；
- `right`：切边右侧所有原节点到 `v` 的距离。

一对跨边节点的距离为：

$$
left[i]+w+right[j].
$$

排序两个距离数组后，用双指针统计和不超过 $k-w$ 的组合数。虚拟节点不会进入数组，
但遍历可以经过虚拟零权边。

## 每对节点只计算一次

任意两个原节点最终都会在某一次切边后第一次分到不同连通块。此时它们作为跨边点对
被统计一次。之后两侧分别递归，两点不再出现在同一个子问题中，因此不会重复统计。

若某次切边没有分开这两个点，它们会共同进入某一侧，等待后续切边。故所有合法点对
恰好统计一次。

## 完整代码

输入一棵带非负边权的树和距离上限 $k$，输出距离不超过 $k$ 的无序原节点对数量。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct EdgeDecomposition {
    struct AdjacentEdge {
        int v;
        int id;
        ll weight;
    };

    int original_n;
    int node_count;
    int edge_count;
    ll limit;
    ll answer;
    vector<vector<pair<int, ll>>> original_g;
    vector<vector<AdjacentEdge>> g;
    vector<int> subtree_size;
    vector<bool> original;
    vector<bool> removed_edge;
    int cut_edge;
    int cut_u;
    int cut_v;
    ll cut_weight;
    int best_balance;

    EdgeDecomposition(int n, ll k)
        : original_n(n), node_count(n), edge_count(0), limit(k), answer(0),
          original_g(n + 5), g(2 * n + 5), subtree_size(2 * n + 5),
          original(2 * n + 5), removed_edge(4 * n + 5) {
        for (int u = 1; u <= n; ++u) {
            original[u] = true;
        }
    }

    void add_original_edge(int u, int v, ll w) {
        original_g[u].push_back({v, w});
        original_g[v].push_back({u, w});
    }

    void add_edge(int u, int v, ll w) {
        int id = ++edge_count;
        g[u].push_back({v, id, w});
        g[v].push_back({u, id, w});
    }

    void transform(int u, int p) {
        vector<pair<int, ll>> child;
        for (auto [v, w] : original_g[u]) {
            if (v != p) {
                child.push_back({v, w});
            }
        }

        if (child.size() <= 2) {
            for (auto [v, w] : child) {
                add_edge(u, v, w);
            }
        } else {
            add_edge(u, child[0].first, child[0].second);
            int current = u;

            for (int i = 1; i < child.size(); ++i) {
                int dummy = ++node_count;
                add_edge(current, dummy, 0);
                add_edge(dummy, child[i].first, child[i].second);
                current = dummy;
            }
        }

        for (auto [v, w] : child) {
            transform(v, u);
        }
    }

    int calculate_size(int u, int parent_edge) {
        subtree_size[u] = original[u];

        for (auto edge : g[u]) {
            if (edge.id == parent_edge || removed_edge[edge.id]) {
                continue;
            }
            subtree_size[u] += calculate_size(edge.v, edge.id);
        }
        return subtree_size[u];
    }

    void find_cut(int u, int parent_edge, int total) {
        for (auto edge : g[u]) {
            if (edge.id == parent_edge || removed_edge[edge.id]) {
                continue;
            }

            int balance =
                max(subtree_size[edge.v], total - subtree_size[edge.v]);
            if (balance < best_balance) {
                best_balance = balance;
                cut_edge = edge.id;
                cut_u = u;
                cut_v = edge.v;
                cut_weight = edge.weight;
            }
            find_cut(edge.v, edge.id, total);
        }
    }

    void collect_distance(int u, int parent_edge, int blocked_edge, ll distance,
                          vector<ll>& value) {
        if (original[u]) {
            value.push_back(distance);
        }

        for (auto edge : g[u]) {
            if (edge.id == parent_edge || edge.id == blocked_edge ||
                removed_edge[edge.id]) {
                continue;
            }
            collect_distance(edge.v, edge.id, blocked_edge,
                             distance + edge.weight, value);
        }
    }

    ll count_cross_pairs(vector<ll>& left, vector<ll>& right,
                         ll middle_weight) {
        sort(left.begin(), left.end());
        sort(right.begin(), right.end());

        ll count = 0;
        int j = right.size() - 1;
        for (ll left_distance : left) {
            while (j >= 0 && left_distance + middle_weight + right[j] > limit) {
                --j;
            }
            count += j + 1;
        }
        return count;
    }

    void solve(int entry) {
        int total = calculate_size(entry, 0);
        if (total <= 1) {
            return;
        }

        cut_edge = 0;
        best_balance = total + 1;
        find_cut(entry, 0, total);

        vector<ll> left;
        vector<ll> right;
        collect_distance(cut_u, 0, cut_edge, 0, left);
        collect_distance(cut_v, 0, cut_edge, 0, right);
        answer += count_cross_pairs(left, right, cut_weight);

        removed_edge[cut_edge] = true;
        solve(cut_u);
        solve(cut_v);
    }

    ll run() {
        transform(1, 0);
        solve(1);
        return answer;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    ll k;
    cin >> n >> k;

    EdgeDecomposition edge_decomposition(n, k);
    for (int i = 1; i < n; ++i) {
        int u, v;
        ll w;
        cin >> u >> v >> w;
        edge_decomposition.add_original_edge(u, v, w);
    }

    cout << edge_decomposition.run() << '\n';
    return 0;
}
```

## 复杂度

二叉化只加入 $O(n)$ 个虚拟节点和边。平衡边保证递归深度为 $O(\log n)$；每层收集
距离的总规模为 $O(n)$。本文每个子问题还会排序距离数组，保守时间复杂度为
$O(n\log^2 n)$，空间复杂度为 $O(n\log n)$，其中递归临时数组可以在返回后释放。

更精细的合并或排序复用可以降低常数或一个对数，但不属于理解边分治框架所必需的
内容。

## 与点分治的选择

点分治直接删除平衡重心，通常代码更短，适用问题也更多。边分治的优势是所有跨区域
路径都必须经过同一条切边，路径可以自然拆成“左侧距离 + 切边 + 右侧距离”。

只有当这种跨边结构明显简化状态或合并时，边分治才值得承担二叉化与虚拟节点的实现
成本。它不是看到树上路径统计就默认使用的模板。

## 常见错误

- 在原星形树上直接选最优边，却声称递归深度为 $O(\log n)$；
- 把虚拟节点也计入待统计的点对；
- 二叉化时改变原边权，导致原节点间距离变化；
- 计算平衡度时使用含虚拟节点的节点数；
- 统计跨边距离时漏掉切边本身的权值；
- 递归两侧时没有永久屏蔽当前切边。

## 需要记住什么

- 为什么一般树上不一定存在平衡边？
- 二叉化怎样保持所有原节点之间的距离不变？
- 为什么虚拟节点的大小权重应为 $0$？
- 怎样选择当前连通块的平衡切边？
- 跨边点对的距离怎样拆分？
- 每个原节点对为什么恰好在一次递归中被统计？
- 什么情况下点分治通常比边分治更合适？
