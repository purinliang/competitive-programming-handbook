# 仙人掌

> 最近修订：2026-08-23 05:55 +10:00（未审阅）

树之所以容易处理，是因为任意两点之间只有一条简单路径。若在树上加入少量环，一般图
算法往往又显得过重。仙人掌保留了一种恰到好处的中间结构：它允许出现简单环，但这些
环不能彼此复杂交叠。

一张连通无向图是仙人掌，当且仅当每条边至多属于一个简单环。等价地说，任意两个简单
环至多共享一个点。

树是没有环的仙人掌。仙人掌上的很多树算法只需额外处理“经过一个简单环时从哪一侧
走”，因此它是一类特殊图结构，而不是一种新的连通分量。

## 与点双连通分量和圆方树的关系

对仙人掌做点双连通分解，每个块只有两种形态：

- 一条不属于任何环的边；
- 一个没有弦的简单环。

一般图的点双连通分量内部可能非常复杂；仙人掌把每个块限制成边或环，块与块之间仍只
通过割点连接。

因此可以用圆方树组织仙人掌的块结构，但两者不是同一个概念：

- 圆方树是任意无向图经过点双连通分解后得到的派生树；
- 仙人掌是输入图本身满足的一类结构限制。

这也是模块目录把圆方树放在“连通性”，却把仙人掌放在“特殊图结构”的原因。

## DFS 树中的环

在无向图的 DFS 树中，忽略父边以后，一条连接当前点 `u` 与祖先 `v` 的非树边会与
DFS 树上从 `v` 到 `u` 的路径组成一个简单环：

```text
祖先 v
  |
  |  DFS 树路径
  |
后代 u -------- v
          非树边
```

只处理 `depth[v] < depth[u]` 的方向，就能让每条非树边只生成一次环。

给每条无向边保存唯一编号。发现反祖边 `u -> v` 时，沿 `parent[u]` 不断向上走到
`v`，把反祖边和路径上的全部父边标记为属于当前环。

若途中遇到一条已经属于其他环的边，说明这条边至少出现在两个简单环中，原图不是
仙人掌。

## 为什么标记边就足够

两个仙人掌环允许共享一个割点，所以不能禁止点被多个环经过。真正被定义禁止的是同一
条边属于多个环。

若两个环共享两个不同的点，它们之间会形成至少两条不同路径，并进一步组成一个让部分
边重复出现的简单环；DFS 的基本环路径必然发生边重叠。因此逐边标记既不会误判只共享
一个点的两个环，也能发现更复杂的交叠。

## 一个自然应用：统计生成树

在一棵生成树中：

- 原图中的桥必须保留；
- 每个长度为 $length$ 的简单环必须恰好删除一条边。

删除环上任意一条边都能断开这个环，同时保持环中全部点连通，因此一个环有 `length`
种选择。仙人掌的不同环没有公共边，各环选择互不影响。

所以连通仙人掌的生成树数量为：

$$
\prod_{cycle} length(cycle).
$$

这给出了一个很优美的结构验证：DFS 提取每个环的长度后，不需要矩阵树定理，只需把
长度相乘。

## 完整代码

输入一张简单连通无向图。程序先判断它是否为仙人掌；若不是，输出 `NO`。若是，输出
`YES`，再输出生成树数量对 $10^9+7$ 取模的结果。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1e9 + 7;

struct Edge {
    int v;
    int id;
};

int n;
int m;
int cycle_count;
int visited_count;
bool valid;
vector<vector<Edge>> g;
vector<int> depth;
vector<int> parent;
vector<int> parent_edge;
vector<int> cycle_id;
vector<int> cycle_length;

void record_cycle(int u, int ancestor, int back_edge) {
    ++cycle_count;
    int length = 1;

    if (cycle_id[back_edge] != 0) {
        valid = false;
        return;
    }
    cycle_id[back_edge] = cycle_count;

    for (int x = u; x != ancestor; x = parent[x]) {
        int edge_id = parent_edge[x];
        if (cycle_id[edge_id] != 0) {
            valid = false;
            return;
        }
        cycle_id[edge_id] = cycle_count;
        ++length;
    }

    cycle_length.push_back(length);
}

void dfs(int u, int incoming_edge) {
    ++visited_count;

    for (const Edge& edge : g[u]) {
        int v = edge.v;
        if (edge.id == incoming_edge) {
            continue;
        }

        if (depth[v] == 0) {
            depth[v] = depth[u] + 1;
            parent[v] = u;
            parent_edge[v] = edge.id;
            dfs(v, edge.id);
        } else if (depth[v] < depth[u]) {
            record_cycle(u, v, edge.id);
        }
    }
}

int main() {
    scanf("%d%d", &n, &m);

    g.assign(n + 5, {});
    depth.assign(n + 5, 0);
    parent.assign(n + 5, 0);
    parent_edge.assign(n + 5, 0);
    cycle_id.assign(m + 5, 0);
    cycle_length.clear();
    cycle_count = 0;
    visited_count = 0;
    valid = true;

    for (int id = 1; id <= m; ++id) {
        int u, v;
        scanf("%d%d", &u, &v);
        g[u].push_back({v, id});
        g[v].push_back({u, id});
    }

    depth[1] = 1;
    dfs(1, 0);

    if (!valid || visited_count != n) {
        printf("NO\n");
        return 0;
    }

    ll answer = 1;
    for (int length : cycle_length) {
        answer = answer * length % MOD;
    }

    printf("YES\n%lld\n", answer);
    return 0;
}
```

## 复杂度

DFS 枚举每条边常数次。合法仙人掌中，每条树边至多在记录某个环时沿父链经过一次；
一旦发现重复边便可判定不合法。因此时间复杂度为 $O(n+m)$，空间复杂度为
$O(n+m)$。

递归 DFS 的调用深度最坏可达 $O(n)$。点数很大且运行环境调用栈较小时，可以把 DFS
改写成显式栈；这不改变环的识别方法。

## 边界与变体

本文假设输入是简单图，不含自环和重边。在允许重边的多重图定义中，两条平行边可能
构成长度为 $2$ 的环，需要按题目的环定义单独确认。

若输入不保证连通，可以从每个未访问点分别 DFS，判断得到的是“仙人掌森林”；但不连通
图不存在覆盖全部点的一棵生成树，所以完整代码直接输出 `NO`。

带权仙人掌的最短路、直径和动态规划会在每个环上增加方向或前缀信息；它们共享本文的
块结构，但各自拥有新的状态，不应塞进仙人掌定义的基础实现。

## 常见错误

- 把“两个环不能共享点”当作定义；仙人掌允许两个环共享一个割点；
- 遇到访问过的邻点就记录环，导致同一条无向非树边处理两次；
- 只标记反祖边，没有标记它与祖先之间的整条 DFS 树路径；
- 用点标记判断环重叠，误判两个只共享一个点的合法环；
- 把仙人掌当成点双连通分量，而不是对整张输入图的结构限制；
- 统计生成树时忘记桥必须保留，或者认为每个环可以删除任意多条边；
- 输入不连通时仍把各环长度乘积当成整张图的生成树数量。

## 需要记住什么

- 仙人掌对一条边属于简单环的次数有什么限制？
- 两个简单环最多可以共享多少个点？
- 仙人掌、点双连通分量与圆方树分别是什么层次的对象？
- 一条连接后代与祖先的非树边怎样确定一个环？
- 为什么检测重复环应该标记边而不是点？
- 长度为 `length` 的环对生成树数量贡献多少种选择？
