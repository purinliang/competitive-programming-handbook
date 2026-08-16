# 有向图：强连通分量

> 最近修订：2026-08-17 06:04 +10:00（未审阅）

无向图中，两点连通只需存在一条路径。有向图的边不能反向行走，从 `u` 能到
`v`，不代表从 `v` 也能回到 `u`。

若一组点中任意两点都能互相到达，这组点构成一个强连通区域。把每个最大的区域
缩成一个点后，原图会变成有向无环图，从而可以继续进行拓扑排序和动态规划。

## 强连通

在有向图中，若同时存在：

```text
u 到 v 的有向路径
v 到 u 的有向路径
```

则称 `u` 与 `v` **强连通**。

强连通关系具有：

- 自反性：每个点与自己强连通；
- 对称性：定义本身要求两个方向都可达；
- 传递性：若 `u,v` 互相可达且 `v,w` 互相可达，则 `u,w` 也互相可达。

因此所有点会被唯一划分成若干个最大强连通集合，称为**强连通分量**
（Strongly Connected Component，SCC）。

“最大”很重要：强连通分量不能再加入任何其他点并保持组内任意两点互相可达。

## 缩点以后为什么没有环

把每个强连通分量缩成一个点，保留不同分量之间的有向边，得到**缩点图**。

若缩点图仍存在一个有向环，那么沿环可以从每个分量到达下一个分量，并最终回到
起点。环上的所有分量就彼此互相可达，本应合并成同一个更大的强连通分量，与
“最大”矛盾。

所以 SCC 缩点图一定是 DAG。这是强连通分量最重要的用途之一：先把有环有向图
压缩成 DAG，再在分量之间处理顺序关系。

## DFS 时间戳

Tarjan 算法只进行一次 DFS。为每个点维护：

- `dfn[u]`：点 `u` 第一次被 DFS 访问的时间；
- `low[u]`：从 `u` 的 DFS 子树出发，仍能到达当前未完成区域中的最早时间戳；
- `in_stack[u]`：点 `u` 是否还在当前候选栈中。

访问 `u` 时：

```cpp
dfn[u] = low[u] = ++timer;
stack.push_back(u);
in_stack[u] = true;
```

栈中的点已经访问，但尚未归入任何确定的 SCC。它们仍可能通过后续边与当前点
形成一个更大的强连通分量。

## 处理出边

枚举有向边 `u -> v`。

### 邻点尚未访问

先递归访问 `v`，再用子树能够到达的最早位置更新：

```cpp
if (dfn[v] == 0) {
    tarjan(v);
    low[u] = min(low[u], low[v]);
}
```

### 邻点仍在栈中

若 `v` 已访问但仍在栈中，它还属于当前未完成区域。边 `u -> v` 可能让当前
子树回到更早的候选点：

```cpp
else if (in_stack[v]) {
    low[u] = min(low[u], dfn[v]);
}
```

这里使用 `dfn[v]`，表示通过这一条非树边直接到达 `v` 的访问位置。

### 邻点已经出栈

若 `v` 已经属于一个确定 SCC，它不可能再与当前未完成点合并。即使存在
`u -> v`，也不更新 `low[u]`。

这就是 `in_stack` 判断不能省略的原因。把所有已访问邻点都用于更新，会错误地
跨入早已封闭的其他分量。

## 找到一个分量的根

DFS 完成 `u` 的所有出边后，若：

```cpp
dfn[u] == low[u]
```

说明 `u` 的 DFS 子树无法回到栈中任何比 `u` 更早的点。`u` 是当前 SCC 最早
进入 DFS 的点。

从栈顶不断弹出，直到弹出 `u`：

```cpp
component_count++;

while (true) {
    int v = stack.back();
    stack.pop_back();
    in_stack[v] = false;
    component[v] = component_count;

    if (v == u) {
        break;
    }
}
```

被弹出的点都能沿 DFS 关系到达当前区域，又能通过 `low` 关系回到 `u`，因此
彼此强连通。它们一起构成一个最大分量。

## 不连通的有向图

图不保证从点 `1` 能访问全部点。必须枚举每个点：

```cpp
for (int u = 1; u <= n; u++) {
    if (dfn[u] == 0) {
        tarjan(u);
    }
}
```

每棵 DFS 树独立开始，但时间戳可以继续递增。SCC 编号只要求同分量相同，不必
等于某种固定拓扑顺序。

## 完整代码

下面读入有向图，输出强连通分量数量，以及每个点所属的分量编号。

```cpp
#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<vector<int>> g;
vector<int> dfn;
vector<int> low;
vector<int> component;
vector<int> stack_vertices;
vector<bool> in_stack;
int timer;
int component_count;

void tarjan(int u) {
    dfn[u] = low[u] = ++timer;
    stack_vertices.push_back(u);
    in_stack[u] = true;

    for (int v : g[u]) {
        if (dfn[v] == 0) {
            tarjan(v);
            low[u] = min(low[u], low[v]);
        } else if (in_stack[v]) {
            low[u] = min(low[u], dfn[v]);
        }
    }

    if (dfn[u] != low[u]) {
        return;
    }

    component_count++;

    while (true) {
        int v = stack_vertices.back();
        stack_vertices.pop_back();
        in_stack[v] = false;
        component[v] = component_count;

        if (v == u) {
            break;
        }
    }
}

void solve() {
    cin >> n >> m;

    g.assign(n + 5, {});

    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
    }

    dfn.assign(n + 5, 0);
    low.assign(n + 5, 0);
    component.assign(n + 5, 0);
    in_stack.assign(n + 5, false);
    stack_vertices.clear();
    timer = 0;
    component_count = 0;

    for (int u = 1; u <= n; u++) {
        if (dfn[u] == 0) {
            tarjan(u);
        }
    }

    cout << component_count << '\n';
    for (int u = 1; u <= n; u++) {
        cout << component[u];

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

递归深度最坏可达 $n$。题目规模很大且栈空间严格时，需要改写为显式栈或确认
竞赛环境允许的递归深度；这不改变 SCC 的判定原理。

## 复杂度

每个点入栈、出栈各一次，每条有向边检查一次：

- 时间复杂度：$O(n+m)$；
- 空间复杂度：$O(n+m)$。

## 常见错误

- 把单向可达误认为强连通；
- 更新所有已访问邻点，忘记检查 `in_stack[v]`；
- 对栈内邻点错误使用已经完成分量的信息；
- `dfn[u] == low[u]` 时只弹出 `u`，没有弹出整个分量；
- 出栈后忘记清除 `in_stack`；
- 只从点 `1` 开始一次 DFS，漏掉其他弱连通部分；
- 假设 Tarjan 生成的分量编号具有题目没有保证的固定顺序。

## 需要记住什么

- 强连通分量中的“互相可达”和“最大”分别意味着什么？
- 为什么 SCC 缩点图一定没有有向环？
- `dfn`、`low` 和 `in_stack` 分别保存什么？
- 为什么只对仍在栈中的已访问邻点更新 `low`？
- `dfn[u] == low[u]` 为什么表示一个分量可以完整出栈？
