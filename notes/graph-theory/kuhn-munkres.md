# 二分图最大权完美匹配

> 最近修订：2026-08-23 05:49 +10:00（未审阅）

有 $n$ 名工人和 $n$ 项任务。每名工人必须恰好选择一项任务，每项任务也必须恰好分配
给一名工人；把左侧工人 $x$ 分配给右侧任务 $y$ 能获得权值 $w(x,y)$。怎样让全部
分配的权值和最大？

这是一张等规模完整二分图上的最大权完美匹配，也称为最大权指派问题。普通二分图
最大匹配只判断边能否被同时选择，不会比较不同完美匹配的总权值。

KM（Kuhn–Munkres）算法用顶标把全部边的权值压在一个上界内，只在恰好达到上界的边
中寻找增广路；增广失败时再把上界降低到刚好出现新边。这样可以在 $O(n^3)$ 时间内
求出答案。

## 顶标不等式

给每个左点 $x$ 一个顶标 `label_x[x]`，每个右点 $y$ 一个顶标 `label_y[y]`，始终
满足：

$$
label_x[x]+label_y[y]\ge w(x,y).
$$

任意完美匹配恰好使用每个左点和每个右点一次，因此它的总权值不超过：

$$
\sum_x label_x[x]+\sum_y label_y[y].
$$

这给所有完美匹配建立了一个共同上界。

最简单的初始顶标是：

```cpp
label_x[x] = max(weight[x][1..n]);
label_y[y] = 0;
```

即使边权为负数，这组顶标仍满足不等式。

## 相等子图

若一条边满足：

$$
label_x[x]+label_y[y]=w(x,y),
$$

称它为相等边。只保留全部相等边得到的二分图称为相等子图。

若相等子图中已经存在完美匹配，那么匹配中每条边都取到顶标上界，匹配权值正好等于：

$$
\sum_x label_x[x]+\sum_y label_y[y].
$$

它达到所有完美匹配都无法超过的上界，因此必然最优。

问题于是变成：不断调整可行顶标，直到相等子图能够容纳一个完美匹配。

## 交替树与松弛量

依次为每个左点寻找匹配。当前左点暂时没有匹配时，把它作为交替树的根：

- 从树中的左点经过相等边走向右点；
- 若右点已经匹配，再沿匹配边走回对应左点；
- 到达未匹配右点时，就找到一条增广路。

对尚未进入树的右点 $y$，维护：

$$
slack[y]=\min_{x\text{ 在交替树中}}
\bigl(label_x[x]+label_y[y]-w(x,y)\bigr).
$$

`slack[y]` 表示还要把顶标差缩小多少，才会出现一条从当前交替树通向 $y$ 的新相等边。
同时记录 `previous_y[y]`，表示取得这个最小松弛量时，树中使用的是哪个右点所匹配的
左点；它稍后用于恢复增广路。

## 调整顶标

若交替树暂时无法到达新的右点，取所有未访问右点的最小松弛量：

$$
delta=\min_{y\text{ 未访问}} slack[y].
$$

然后：

- 树中的左点顶标减去 `delta`；
- 树中的右点顶标加上 `delta`；
- 其他右点的 `slack` 减去 `delta`。

树内部的边两端一减一加，顶标和不变；从树内左点通向树外右点的顶标和最多减少
`delta`，而 `delta` 不超过这些边原来的差值，因此顶标不等式仍成立。

至少一个树外右点的 `slack` 会变成 $0$，也就是相等子图中至少出现一条新边。算法
无需盲目修改标签，而是每次恰好扩展交替树。

## 用右点零号恢复增广路

实现中保留虚拟右点 `0`。开始处理左点 `root` 时：

```cpp
match_y[0] = root;
```

`match_y[y]` 表示当前与右点 `y` 匹配的左点。交替树每次从右点 `y0` 所匹配的左点
继续扩展；若找到未匹配右点，就沿 `previous_y` 反向改写：

```cpp
do {
    int next_y = previous_y[y0];
    match_y[y0] = match_y[next_y];
    y0 = next_y;
} while (y0 != 0);
```

虚拟右点把“根左点没有旧匹配”与普通的匹配边统一成同一条恢复逻辑。

## 正确性直觉

顶标调整始终保持 `label_x[x] + label_y[y] >= weight[x][y]`，所以顶标和始终是任意
完美匹配的上界。

算法只沿相等边扩展交替树。找不到增广路时，最小松弛量调整不会破坏已有相等边，且
必然产生至少一条通向新右点的相等边。有限次调整后会遇到未匹配右点，使匹配数量增加
一。

全部左点都匹配后，每条匹配边都是相等边，匹配权值达到顶标上界，因此这份完美匹配
具有最大权值。

## 完整代码

输入 $n$ 和一个 $n\times n$ 权值矩阵，输出最大权值，并输出每个左点匹配的右点。
权值允许为负数。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 4e18;

struct KuhnMunkres {
    int n;
    vector<vector<ll>> weight;
    vector<ll> label_x;
    vector<ll> label_y;
    vector<ll> slack;
    vector<int> match_x;
    vector<int> match_y;
    vector<int> previous_y;
    vector<int> used_y;

    KuhnMunkres(int size)
        : n(size), weight(n + 5, vector<ll>(n + 5)), label_x(n + 5),
          label_y(n + 5), slack(n + 5), match_x(n + 5), match_y(n + 5),
          previous_y(n + 5), used_y(n + 5) {}

    ll run() {
        fill(label_y.begin(), label_y.end(), 0);
        fill(match_y.begin(), match_y.end(), 0);

        for (int x = 1; x <= n; ++x) {
            label_x[x] = weight[x][1];
            for (int y = 2; y <= n; ++y) {
                label_x[x] = max(label_x[x], weight[x][y]);
            }
        }

        for (int root = 1; root <= n; ++root) {
            fill(slack.begin(), slack.end(), INF);
            fill(previous_y.begin(), previous_y.end(), 0);
            fill(used_y.begin(), used_y.end(), 0);

            match_y[0] = root;
            int y0 = 0;

            do {
                used_y[y0] = 1;
                int x = match_y[y0];
                ll delta = INF;
                int next_y = 0;

                for (int y = 1; y <= n; ++y) {
                    if (used_y[y]) {
                        continue;
                    }

                    ll gap = label_x[x] + label_y[y] - weight[x][y];
                    if (gap < slack[y]) {
                        slack[y] = gap;
                        previous_y[y] = y0;
                    }
                    if (slack[y] < delta) {
                        delta = slack[y];
                        next_y = y;
                    }
                }

                for (int y = 0; y <= n; ++y) {
                    if (used_y[y]) {
                        label_x[match_y[y]] -= delta;
                        label_y[y] += delta;
                    } else {
                        slack[y] -= delta;
                    }
                }

                y0 = next_y;
            } while (match_y[y0] != 0);

            do {
                int next_y = previous_y[y0];
                match_y[y0] = match_y[next_y];
                y0 = next_y;
            } while (y0 != 0);
        }

        fill(match_x.begin(), match_x.end(), 0);
        ll answer = 0;
        for (int y = 1; y <= n; ++y) {
            int x = match_y[y];
            match_x[x] = y;
            answer += weight[x][y];
        }
        return answer;
    }
};

int main() {
    int n;
    scanf("%d", &n);

    KuhnMunkres matching(n);
    for (int x = 1; x <= n; ++x) {
        for (int y = 1; y <= n; ++y) {
            scanf("%lld", &matching.weight[x][y]);
        }
    }

    printf("%lld\n", matching.run());
    for (int x = 1; x <= n; ++x) {
        printf("%d%c", matching.match_x[x], " \n"[x == n]);
    }
    return 0;
}
```

## 复杂度

每加入一个左点，最多让 $n$ 个右点进入交替树；每次扩展扫描全部 $n$ 个右点并维护
松弛量。因此时间复杂度为 $O(n^3)$，权值矩阵和算法状态共占 $O(n^2)$ 空间。

## 不完整二分图与允许不匹配

基础 KM 处理两侧各有 $n$ 个点、每对左右点都存在边的完美匹配问题。

- 两侧数量不同但较小一侧也要全部匹配：给较小一侧补虚拟点，使两侧规模相等；
- 允许真实点不匹配：补足虚拟点，并把连接虚拟点的权值设为 $0$；
- 某些真实配对禁止使用：将对应权值设为足够小的负数，最后必须检查答案是否使用了
  禁止边；
- 若目标是先最大化匹配数量、再最大化权值，不能只把缺边写成 $0$，需要让真实边在
  第一关键字上严格优于虚拟边，或改用费用流明确表达两个目标。

虚拟点只是在输入边界把原问题转成完整指派问题，KM 主体仍保持不变。

## 常见错误

- 把一般最大权匹配直接当成完整二分图的最大权完美匹配；
- 初始左顶标写成 $0$，却允许负权边，导致顶标不等式不一定成立；
- 只寻找相等边，增广失败后没有调整顶标；
- 调整顶标时把树内左右点同向修改，破坏已有相等边；
- 更新顶标后没有同步减少树外右点的 `slack`；
- 用极小权值表示禁边，却没有检查最终匹配是否真的使用了禁边；
- 将 KM 与只求最大匹配数量的匈牙利增广算法当成同一个接口。

## 需要记住什么

- 基础 KM 解决的是哪一种二分图匹配问题？
- 顶标不等式为什么给任意完美匹配建立上界？
- 什么是相等边和相等子图？
- `slack[y]` 表示什么？
- 增广失败时为什么取最小松弛量调整顶标？
- 为什么最终相等子图中的完美匹配一定最优？
- 两侧规模不同或允许不匹配时怎样加入虚拟点？
