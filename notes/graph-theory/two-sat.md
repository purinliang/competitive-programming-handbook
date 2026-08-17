# 2-SAT

> 最近修订：2026-08-17 11:20 +10:00（未审阅）

有 $n$ 个活动，每个活动必须从两个时段 `0` 和 `1` 中选择一个。某些活动的特定
时段不能同时使用，例如：

> 活动 `a` 选择时段 `x` 与活动 `b` 选择时段 `y` 不能同时发生。

需要判断是否存在满足所有冲突限制的排期，并构造一组选择。

每个活动都是一个布尔变量，每条限制只涉及两个变量。这类“每个条件至多包含
两个布尔文字”的可满足性问题称为 2-SAT。一般 SAT 很难，但 2-SAT 可以转换成
有向图的强连通分量，在 $O(n+m)$ 时间内解决。

## 把禁配条件写成逻辑式

令命题 $A_x$ 表示“活动 `a` 选择时段 `x`”，$B_y$ 同理。两种选择不能同时
发生，就是：

$$
\neg(A_x\land B_y).
$$

根据德摩根律，它等价于：

$$
(\neg A_x)\lor(\neg B_y).
$$

这句话还可以拆成两条必然关系：

$$
A_x\Rightarrow\neg B_y,
\qquad
B_y\Rightarrow\neg A_x.
$$

也就是说：

- 若已经选择 `a=x`，就必须选择 `b=1-y`；
- 若已经选择 `b=y`，就必须选择 `a=1-x`。

每条禁配限制因此对应蕴含图中的两条有向边。

## 每个变量建立两个点

活动 `i` 的两个选择分别建立一个图节点：

```cpp
int literal(int variable, int value) {
    return 2 * variable - 1 + value;
}
```

于是：

- `literal(i,0) = 2*i-1`；
- `literal(i,1) = 2*i`。

节点范围为 `1..2*n`，仍然使用全书统一的 1-based 编号。选择的反面不依赖位
运算，直接用另一个取值构造：

```cpp
literal(i, value ^ 1)
```

禁配 `(a,x)` 与 `(b,y)` 加边：

```cpp
g[literal(a, x)].push_back(literal(b, y ^ 1));
g[literal(b, y)].push_back(literal(a, x ^ 1));
```

## 为什么强连通表示被迫同时成立

蕴含图中的路径 `p -> ... -> q` 表示：若选择 `p`，经过一连串条件就必须选择
`q`。

若 `p` 与 `q` 位于同一个强连通分量，则：

- 选择 `p` 会迫使 `q` 成立；
- 选择 `q` 也会迫使 `p` 成立。

它们在所有可行解中必须拥有相同真假状态。

对活动 `i`，若 `literal(i,0)` 与 `literal(i,1)` 位于同一个强连通分量，那么
选择 0 会迫使选择 1，选择 1 又会迫使选择 0。一个活动不可能同时选择两个时段，
问题无解。

反过来，若每个变量的两个选择都属于不同分量，就可以按照强连通分量缩点后的
拓扑关系，为每对互相否定的分量选择其中一个，构造出可行解。

## 怎样从 Tarjan 编号构造答案

本文复用强连通分量文章中的 Tarjan 算法。每发现一个已经没有未完成后继的 SCC，
就把它从栈中弹出并依次编号。因此，若缩点图存在边 `X -> Y`，通常先弹出的汇点
`Y` 编号更小。

在这套具体编号下，对活动 `i` 选择：

```cpp
answer[i] = component[literal(i, 1)] < component[literal(i, 0)];
```

也就是优先选择缩点图中更靠后的汇点分量。若改用 Kosaraju，或改变 SCC 编号
顺序，这个大小关系可能需要反转；不能脱离编号产生方式死记比较符号。

## 完整代码

输入 `n m`，随后每行给出 `a x b y`，表示 `a=x` 与 `b=y` 不能同时选择。
若无解输出 `NO`；否则输出 `YES` 和每个活动选择的 0-1 时段。

求解函数直接返回选择数组。输入保证 `n >= 1`，因此空数组不会与合法答案冲突，
可以用来表示无解，不需要再通过引用参数带回答案。

```cpp
#include <bits/stdc++.h>
using namespace std;

int n;
int m;
int timer;
int component_count;
vector<vector<int>> g;
vector<int> dfn;
vector<int> low;
vector<int> component;
vector<int> stack_vertices;
vector<bool> in_stack;

int literal(int variable, int value) {
    return 2 * variable - 1 + value;
}

void add_conflict(int a, int x, int b, int y) {
    g[literal(a, x)].push_back(literal(b, y ^ 1));
    g[literal(b, y)].push_back(literal(a, x ^ 1));
}

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

vector<int> solve_two_sat() {
    int vertex_count = 2 * n;

    dfn.assign(vertex_count + 5, 0);
    low.assign(vertex_count + 5, 0);
    component.assign(vertex_count + 5, 0);
    in_stack.assign(vertex_count + 5, false);
    stack_vertices.clear();
    timer = 0;
    component_count = 0;

    for (int u = 1; u <= vertex_count; u++) {
        if (dfn[u] == 0) {
            tarjan(u);
        }
    }

    vector<int> answer(n + 5, 0);

    for (int i = 1; i <= n; i++) {
        int zero = literal(i, 0);
        int one = literal(i, 1);

        if (component[zero] == component[one]) {
            return {};
        }

        answer[i] = component[one] < component[zero];
    }

    return answer;
}

void solve() {
    scanf("%d%d", &n, &m);

    g.assign(2 * n + 5, {});

    for (int i = 1; i <= m; i++) {
        int a, x, b, y;
        scanf("%d%d%d%d", &a, &x, &b, &y);
        add_conflict(a, x, b, y);
    }

    vector<int> answer = solve_two_sat();
    if (answer.empty()) {
        printf("NO\n");
        return;
    }

    printf("YES\n");
    for (int i = 1; i <= n; i++) {
        printf("%d%c", answer[i], " \n"[i == n]);
    }
}

int main() {
    solve();
    return 0;
}
```

## 其他二元条件怎样加边

最常见的 2-SAT 条件都可以先改写为“若选择某个文字，就必须选择另一个文字”：

- 至少一个成立：`a or b`，加入 `not a -> b` 与 `not b -> a`；
- 不能同时成立：`not(a and b)`，加入 `a -> not b` 与 `b -> not a`；
- 两者相同：分别加入 `a -> b`、`b -> a`、`not a -> not b`、
  `not b -> not a`；
- 两者不同：加入 `a -> not b`、`b -> not a`、`not a -> b`、
  `not b -> a`。

与其背诵每种条件的四行代码，更可靠的方法是先用逻辑写清楚：选择一个状态以后，
另一个变量被迫选择什么状态。

## 2-SAT 的边界

2-SAT 的高效性来自“每个析取条件只有两个文字”。若一个条件是
`a or b or c`，它的否定涉及三个变量同时成立，通常不能只用两条蕴含边表示。

问题拥有布尔选择也不一定是 2-SAT。只有所有限制都能拆成二元析取或等价的二元
禁配关系时，蕴含图模型才完整。目标若是最大化满足条件数量，而不只是判断是否
存在可行解，也已经是另一类优化问题。

## 复杂度

蕴含图有 $2n$ 个点；每条禁配限制加入两条边，因此共有 $2m$ 条边。建立图、计算
强连通分量和构造答案都只线性扫描这些点与边，时间复杂度为 $O(n+m)$，空间复杂度
为 $O(n+m)$。

## 常见错误

- 把“不能同时选择”只加成一条单向蕴含；
- 为每个变量只建立一个点，无法表示选择及其反面；
- 使用 1-based 文字编号时直接写 `u ^ 1`，把节点 1 错误映射到节点 0；
- 只检查某个选择能否到达其反面，没有计算完整强连通分量；
- 两个相反文字位于同一 SCC 时仍尝试构造答案；
- 从网上记住一个 SCC 编号比较符号，却没有核对自己的编号顺序；
- 条件涉及三个变量同时约束时，仍强行加入两条边当作 2-SAT；
- 递归 Tarjan 面对极深图时没有留意调用栈限制。

## 基础练习

1. 把“`a` 与 `b` 至少一个选择 1”改写成两条蕴含边。
2. 为两个活动构造一组互相矛盾的禁配条件，画出蕴含图并找出包含相反文字的 SCC。
3. 修改完整程序，使每个变量表示一道题选择方案 A 或方案 B，并输出一组可行选择。
4. 随机生成至多 `12` 个变量的禁配条件，枚举全部 $2^n$ 种选择验证是否有解，再与
   2-SAT 结果对拍。

## 需要记住什么

- 一个变量为什么要建立两个图节点？
- 禁止 `(a,x)` 与 `(b,y)` 同时发生，为什么产生两条蕴含边？
- 图中的路径和强连通分别表示怎样的“被迫选择”关系？
- 为什么一个变量的两个选择在同一 SCC 中就无解？
- 构造答案时为什么必须理解 SCC 编号顺序，而不能死记比较符号？
- 哪些二元逻辑条件属于 2-SAT，哪些更高元条件不能直接套用？
- 蕴含图为什么只有 $O(n+m)$ 规模？
