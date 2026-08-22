# 树哈希

> 最近修订：2026-08-23 05:12 +10:00（未审阅）

两棵无根树的节点编号完全不同，但删掉编号以后，它们的连接形状可能相同。枚举全部
$n!$ 种编号对应关系显然不可行。

树没有环。选定根以后，一个节点的形状只由它的所有子树形状组成，而且儿子之间没有
固定顺序。我们可以从叶子向根给每种不同的子树形状分配一个整数编号；根得到的编号
就是整棵有根树的规范表示。

本文使用无碰撞的“排序后的子树编号向量”作为键，而不是把大整数取模。竞赛中通常也
把这种为树形生成摘要的过程称为树哈希。

## 有根树的子树编号

叶节点没有儿子，它的儿子编号序列为空：

```text
[]
```

若某个节点的儿子子树编号为 `2, 5, 2`，儿子没有左右次序，所以先排序得到：

```text
[2, 2, 5]
```

用一个全局映射为每种不同向量分配唯一编号：

```cpp
map<vector<int>, int> signature_id;
```

两个节点得到相同编号，当且仅当它们的儿子子树可以一一配对，并且每对子树形状相同。

## 为什么必须排序

无根树或普通有根树的邻接表顺序没有语义。同一个节点的儿子可能因为输入边顺序不同
而以 `2,5,2` 或 `5,2,2` 出现。

不排序会把邻接表顺序错误地当成树形的一部分；排序以后只保留每种儿子形状出现了
多少次。

## 从无根树选择规范根

任意选根不行。同一棵无根树在不同节点处选根，得到的有根形状可能不同。

无根树的中心是不断删除所有叶节点后最后剩下的一至两个节点。树的同构一定把中心
映射到中心，因此中心可以作为不依赖原编号的规范根：

- 只有一个中心时，直接计算以它为根的编号；
- 有两个相邻中心时，分别阻断中心边，计算两侧有根子树编号，再把两个编号排序成
  一对。

中心与重心不是同一个概念。中心最小化到最远节点的距离，本文使用的是中心。

## 为什么不会发生哈希碰撞

常见树哈希会把儿子哈希值混合进 64 位整数，速度更快，但理论上可能碰撞。

本文把完整的排序编号向量作为 `map` 的键。不同向量一定获得不同编号；相同向量一定
复用已有编号。因此只要比较的所有树共用同一张编号表，这个实现不会因数值哈希碰撞
把不同形状误判为相同。

编号本身没有跨程序的固定含义。它只在当前这组共同编码的树之间可比较。

## 正确性直觉

对有根树按子树大小归纳：

- 叶子都对应空儿子序列，因此编号相同；
- 假设更小子树的编号已经准确表示形状，那么两个节点编号相同，当且仅当排序后的
  儿子编号多重集合相同，也就是它们的儿子子树可以按形状一一对应。

所以根编号准确判断有根树同构。无根树的同构保持中心集合；在一个中心处比较根编号，
或在两个中心处比较无序编号对，就得到无根树同构判定。

## 完整代码

输入两棵节点数相同的无根树，判断它们是否同构。两棵树共用 `signature_id`，节点
编号均从 $1$ 开始。

```cpp
#include <bits/stdc++.h>
using namespace std;

int n;
vector<vector<int>> g;
map<vector<int>, int> signature_id;
int next_id;

int get_signature_id(const vector<int>& child_id) {
    auto it = signature_id.find(child_id);
    if (it != signature_id.end()) {
        return it->second;
    }

    int id = ++next_id;
    signature_id[child_id] = id;
    return id;
}

int rooted_id(int u, int p) {
    vector<int> child_id;
    for (int v : g[u]) {
        if (v == p) {
            continue;
        }
        child_id.push_back(rooted_id(v, u));
    }

    sort(child_id.begin(), child_id.end());
    return get_signature_id(child_id);
}

vector<int> find_centers() {
    vector<int> degree(n + 5);
    queue<int> q;

    for (int u = 1; u <= n; ++u) {
        degree[u] = g[u].size();
        if (degree[u] <= 1) {
            q.push(u);
        }
    }

    int remaining = n;
    while (remaining > 2) {
        int count = q.size();
        remaining -= count;

        while (count--) {
            int u = q.front();
            q.pop();

            for (int v : g[u]) {
                if (--degree[v] == 1) {
                    q.push(v);
                }
            }
        }
    }

    vector<int> center;
    while (!q.empty()) {
        center.push_back(q.front());
        q.pop();
    }
    return center;
}

pair<int, int> tree_signature() {
    vector<int> center = find_centers();

    if (center.size() == 1) {
        return {rooted_id(center[0], 0), 0};
    }

    int first = rooted_id(center[0], center[1]);
    int second = rooted_id(center[1], center[0]);
    if (first > second) {
        swap(first, second);
    }
    return {first, second};
}

void read_tree() {
    g.assign(n + 5, {});
    for (int i = 1; i < n; ++i) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n;

    read_tree();
    pair<int, int> first = tree_signature();

    read_tree();
    pair<int, int> second = tree_signature();

    cout << (first == second ? "Yes" : "No") << '\n';
    return 0;
}
```

## 复杂度

找中心为 $O(n)$。每个节点的儿子编号只进入一次排序，总排序代价不超过
$O(n\log n)$；`map` 查询还会比较向量，因此这份强调确定性的实现常数较大，适合
理解与中等规模判定。

空间复杂度为 $O(n)$，另加所有不同子树形状的编号表。需要处理极大数据时可以改用
双 64 位哈希等更快实现，但必须接受极小的碰撞风险。

## 常见错误

- 不排序儿子编号，把邻接表输入顺序当成树形顺序；
- 两棵树分别清空编号表，使相同整数编号不再具有共同含义；
- 对无根树随意选择节点 $1$ 为根；
- 只有两个中心时只选择编号较小的中心，而不是比较两侧无序编号对；
- 把树中心与树重心混为一谈；
- 用单个很小模数保存哈希，却把结果当成绝对无碰撞。

## 需要记住什么

- 有根树中，一个节点的形状由什么信息决定？
- 儿子子树编号为什么必须排序？
- 为什么不同树必须共用同一张形状编号表？
- 无根树为什么选择中心作为规范根？
- 两个中心时为什么要比较无序编号对？
- 本文的确定性编号与固定宽度数值哈希有什么取舍？
