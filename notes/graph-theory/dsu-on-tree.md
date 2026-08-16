# 树上启发式合并

> 最近修订：2026-08-17 08:36 +10:00（未审阅）

给定一棵以 1 为根的树，每个节点有一种颜色。对每个节点 `u`，需要回答：

> 以 `u` 为根的子树中有多少种不同颜色？

若对每个 `u` 都重新遍历整棵子树，链形树上的总时间会达到 $O(n^2)$。普通的
启发式合并可以为每个子树维护一个集合，并把小集合并入大集合；本篇学习另一种
常用实现：只维护一份全局颜色统计，在 DFS 返回时有选择地保留已经完成的子树。

这种方法称为**树上启发式合并**，英文资料中常写作 DSU on Tree。这里的 DSU
描述的是“小并大”的摊还思想，不是又建立了一份并查集父亲数组。

## 当前统计表示什么

维护：

- `frequency[color]`：当前保留的节点中，这种颜色出现多少次；
- `distinct_count`：当前保留的颜色种数。

加入一个节点时：

```cpp
void add_node(int u) {
    if (frequency[color[u]] == 0) {
        distinct_count++;
    }
    frequency[color[u]]++;
}
```

删除一个节点时先减少频率。若频率变成 0，这种颜色才从当前统计中消失。

只要在记录 `answer[u]` 时，当前统计恰好包含 `u` 的整棵子树，答案就是
`distinct_count`。

## 为什么需要区分重儿子与轻儿子

先计算每个节点的子树大小 `subtree_size[u]`，并选择子树最大的儿子作为
`heavy_child[u]`。其他儿子称为轻儿子。

处理节点 `u` 时：

1. 递归处理每个轻儿子，得到答案后清空它们留下的统计；
2. 最后处理重儿子，并保留重儿子整棵子树的统计；
3. 把所有轻儿子子树重新加入当前统计；
4. 加入节点 `u` 自己；
5. 此时统计恰好覆盖 `u` 的子树，记录答案。

最大的重儿子所含节点最多。保留它，可以避免把最大的一部分先加入、再删除、
最后又重新加入。

## 用 DFS 序加入整棵子树

第一次 DFS 同时记录：

- `entry[u]`：进入节点 `u` 时的 DFS 序位置；
- `exit[u]`：完成 `u` 的子树时的最后位置；
- `euler[index]`：DFS 序第 `index` 个位置对应哪个节点。

树的 DFS 序具有连续子树性质：`u` 的整棵子树恰好对应闭区间：

$$
[entry[u],exit[u]].
$$

因此，重新加入某个轻儿子的子树时，不必再写一次递归：

```cpp
for (int index = entry[v]; index <= exit[v]; index++) {
    add_node(euler[index]);
}
```

清空一棵子树时，也可以遍历同一个区间执行删除。

## `keep` 参数控制什么

定义 `dfs_sack(u,p,keep)`：

- `keep == true`：算完 `u` 的答案后，保留整棵 `u` 子树的统计；
- `keep == false`：算完以后删除整棵 `u` 子树，使当前统计恢复为空。

轻儿子使用 `keep == false`，因为它们的答案算完以后不能干扰下一个兄弟；
重儿子使用 `keep == true`，让最大子树的数据成为合并其他部分的基础。

若当前节点本身也是父亲的轻儿子，父亲最终会要求它清空；若它是父亲的重儿子，
父亲会继续使用它留下的数据。

## 为什么总复杂度是对数级摊还

一个节点只有在某个祖先处属于轻儿子子树时，才会被重新逐项加入。

设节点 `x` 所在的轻儿子子树大小为 $s$。因为父亲选择了至少同样大的另一个
子树作为重儿子，父亲的整棵子树大小至少超过 $2s$。从 `x` 向根每经过一条
轻边，所处子树规模至少翻倍。

因此，每个节点至多因 $O(\log n)$ 个轻祖先被重新处理。若加入和删除一个节点
都是 $O(1)$，全部操作总计 $O(n\log n)$，空间复杂度为 $O(n)$。

## 完整代码

输入一棵树和每个节点的颜色，输出每个节点子树中的不同颜色数量。颜色先离散化，
因此原始颜色可以是任意 32 位整数。

```cpp
#include <bits/stdc++.h>
using namespace std;

int n;
int timer = 0;
int distinct_count = 0;
vector<int> color;
vector<int> subtree_size;
vector<int> heavy_child;
vector<int> entry;
vector<int> exit_time;
vector<int> euler;
vector<int> frequency;
vector<int> answer;
vector<vector<int>> g;

void dfs_size(int u, int p) {
    subtree_size[u] = 1;
    heavy_child[u] = 0;
    entry[u] = ++timer;
    euler[timer] = u;

    for (int v : g[u]) {
        if (v == p) {
            continue;
        }

        dfs_size(v, u);
        subtree_size[u] += subtree_size[v];

        if (heavy_child[u] == 0 ||
            subtree_size[v] > subtree_size[heavy_child[u]]) {
            heavy_child[u] = v;
        }
    }

    exit_time[u] = timer;
}

void add_node(int u) {
    if (frequency[color[u]] == 0) {
        distinct_count++;
    }
    frequency[color[u]]++;
}

void remove_node(int u) {
    frequency[color[u]]--;
    if (frequency[color[u]] == 0) {
        distinct_count--;
    }
}

void add_subtree(int u) {
    for (int index = entry[u]; index <= exit_time[u]; index++) {
        add_node(euler[index]);
    }
}

void remove_subtree(int u) {
    for (int index = entry[u]; index <= exit_time[u]; index++) {
        remove_node(euler[index]);
    }
}

void dfs_sack(int u, int p, bool keep) {
    for (int v : g[u]) {
        if (v == p || v == heavy_child[u]) {
            continue;
        }
        dfs_sack(v, u, false);
    }

    if (heavy_child[u] != 0) {
        dfs_sack(heavy_child[u], u, true);
    }

    for (int v : g[u]) {
        if (v == p || v == heavy_child[u]) {
            continue;
        }
        add_subtree(v);
    }

    add_node(u);
    answer[u] = distinct_count;

    if (!keep) {
        remove_subtree(u);
    }
}

void compress_colors() {
    vector<int> values;
    values.reserve(n);

    for (int u = 1; u <= n; u++) {
        values.push_back(color[u]);
    }

    sort(values.begin(), values.end());
    values.erase(unique(values.begin(), values.end()), values.end());

    for (int u = 1; u <= n; u++) {
        color[u] = lower_bound(values.begin(), values.end(), color[u]) -
                   values.begin() + 1;
    }

    frequency.assign((int)values.size() + 5, 0);
}

void solve() {
    cin >> n;

    color.assign(n + 5, 0);
    subtree_size.assign(n + 5, 0);
    heavy_child.assign(n + 5, 0);
    entry.assign(n + 5, 0);
    exit_time.assign(n + 5, 0);
    euler.assign(n + 5, 0);
    answer.assign(n + 5, 0);
    g.assign(n + 5, {});

    for (int u = 1; u <= n; u++) {
        cin >> color[u];
    }

    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }

    compress_colors();
    timer = 0;
    distinct_count = 0;
    dfs_size(1, 0);
    dfs_sack(1, 0, true);

    for (int u = 1; u <= n; u++) {
        cout << answer[u] << (u == n ? '\n' : ' ');
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 为什么不为每个节点复制一份统计

若为每个节点都建立长度为颜色数的频率数组，空间会达到 $O(n^2)$。若为每个
节点建立独立集合，普通小并大可以解决本文问题，但维护频率的复杂统计时还要
设计集合内容怎样合并。

树上启发式合并只保留一份全局统计。只要某个答案可以通过“加入节点、删除节点、
读取当前状态”维护，就能复用相同 DFS 框架，例如统计满足某种出现次数条件的
颜色，或寻找子树中的众数相关信息。

它并不适合所有树上询问。若询问是在线修改后的路径问题，重链剖分或其他数据
结构通常更自然；若统计无法快速删除节点，`keep == false` 的清空过程就需要
重新设计。

## 常见错误

- 还没有计算子树大小，就尝试选择重儿子；
- 把编号最大的儿子误当成重儿子，而不是选择子树最大的儿子；
- 先处理重儿子，再处理并清空轻儿子，把重儿子留下的统计一并删除；
- 重儿子已经保留后，又把它的子树重复加入一次；
- 记录 `answer[u]` 时忘记加入节点 `u` 自己；
- `keep == false` 时只删除节点 `u`，没有清空整棵子树；
- 混淆树上启发式合并与并查集，额外维护一份没有用途的并查集父亲数组；
- 颜色值很大或为负数时直接用作频率数组下标。

## 需要记住什么

- 当前 `frequency` 与 `distinct_count` 描述的是哪些被保留节点？
- 为什么先处理并清空轻儿子，最后处理并保留重儿子？
- DFS 序怎样把一棵子树变成连续闭区间？
- `keep` 参数分别在轻儿子和重儿子调用中取什么值？
- 为什么一个节点只会因对数个轻祖先被重新处理？
- 树上启发式合并与普通容器小并大有哪些共同点和区别？
