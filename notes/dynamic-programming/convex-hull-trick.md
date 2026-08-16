# 斜率优化

> 最近修订：2026-08-17 07:45 +10:00（未审阅）

有些动态规划转移需要枚举一个先前状态 $j$，而状态 $i$ 与决策 $j$
的关系中会出现乘积项。将式子展开以后，每个 $j$ 可能恰好对应一条直线：

$$
y=m_jx+b_j.
$$

计算新状态 $i$，就变成在 $x=x_i$ 时询问所有旧直线的最小值或最大值。
只保留可能在某个 $x$ 上最优的直线，就得到这些直线的下凸包或上凸包。

在中文竞赛语境中，这类 DP 优化通常称为**斜率优化**，对应的数据结构思想
也常称为 Convex Hull Trick（CHT）。本篇只学习“斜率按顺序加入、查询点也按
顺序到来”的基础版本，不提前加入 Li Chao Tree 或动态凸包。

## 问题：按顺序分批加工任务

有 $n$ 个必须按顺序加工的任务。任务 $i$ 的加工时间为 $t_i$，等待代价
系数为 $f_i$。可以把相邻任务分成若干批：

- 开始每批前要花 $S$ 单位启动时间；
- 一批中的任务依次加工，全部在该批结束时完成；
- 任务 $i$ 在时刻 $c_i$ 完成时，产生 $f_i c_i$ 的代价。

目标是最小化：

$$
\sum_{i=1}^{n} f_i c_i.
$$

这是一个自然的批处理取舍：合并批次能减少启动时间，却会让较早完成
加工的任务等到整批结束。斜率优化不是靠题目额外限制排除其他方法，
而是直接利用“按顺序分批”产生的代数结构。

## 把时间与代价系数求前缀和

定义：

$$
T[i]=\sum_{x=1}^{i}t_x,
\qquad
F[i]=\sum_{x=1}^{i}f_x.
$$

若最后一批为 `j+1..i`，这批在所有前 $i$ 个任务加工完成时结束，
它的纯加工时间终点是 $T[i]$。这批任务的代价系数之和是：

$$
F[i]-F[j].
$$

因此，加工时间对这批的代价贡献为：

$$
T[i]\cdot(F[i]-F[j]).
$$

## 怎样计入每批的启动时间

开始一个新批次时，所有尚未完成的任务都会被这次启动延迟 $S$。
若前 $j$ 个任务已经被分好批次，尚未完成的任务代价系数之和是：

$$
F[n]-F[j].
$$

所以，每开始一个新批次，可以立即把这次启动对全部未完成任务的影响
记为：

$$
S(F[n]-F[j]).
$$

这种记账方式会提前计入对未来任务的延迟，但每个任务恰好会被它之前
的每个批次启动计入一次，所以总代价没有改变。

定义 `dp[i]` 为已经确定前 `i` 个任务的分批时，按上述方式计入的最小代价。
枚举最后一批之前的分割点 `j`：

$$
dp[i]=\min_{0\le j<i}
\left(
dp[j]
+T[i]\cdot(F[i]-F[j])
+S(F[n]-F[j])
\right).
$$

直接枚举所有 $j$ 需要 $O(n^2)$ 时间。

## 把转移整理成直线

将只与 $i$ 有关的项移到外面：

$$
dp[i]
=T[i]F[i]+SF[n]
+\min_{0\le j<i}
\left(dp[j]-(T[i]+S)F[j]\right).
$$

现在定义：

$$
x=T[i]+S,
\qquad
m_j=-F[j],
\qquad
b_j=dp[j].
$$

对每个决策 $j$，括号中的值都是一条直线在 $x$ 处的函数值：

$$
m_jx+b_j.
$$

计算 `dp[i]` 的过程因此变成：

1. 在 $x=T[i]+S$ 处询问当前所有直线的最小值；
2. 加与 $i$ 有关的常数项 $T[i]F[i]+SF[n]$；
3. 将新状态 `dp[i]` 变成斜率 $-F[i]$、截距 `dp[i]` 的新直线。

## 两种单调性

本题保证 $t_i>0$、$f_i>0$。因此：

- $T[i]$ 递增，查询坐标 $x=T[i]+S$ 递增；
- $F[j]$ 递增，加入直线的斜率 $-F[j]$ 递减。

斜率和查询坐标都按已知顺序到来，所以可以用一个双端队列维护下凸包：

- 新直线只从队尾加入；
- 被新直线彻底覆盖的旧直线只从队尾删除；
- 查询点向右移动时，已经不如下一条直线的队首不会重新变优，可以删除。

## 什么时候中间直线永远无用

设三条按斜率递减顺序加入的直线为 $a,b,c$：

$$
m_a>m_b>m_c.
$$

若 $a$ 与 $b$ 的交点不早于 $b$ 与 $c$ 的交点，那么不存在任何 $x$
使 $b$ 严格优于另外两条直线。中间直线 $b$ 可以删除。

交点坐标为：

$$
x_{ab}=\frac{b_b-b_a}{m_a-m_b},
\qquad
x_{bc}=\frac{b_c-b_b}{m_b-m_c}.
$$

两个分母都为正数，所以删除条件 $x_{ab}\ge x_{bc}$ 可以交叉相乘写成：

$$
(b_b-b_a)(m_b-m_c)
\ge
(b_c-b_b)(m_a-m_b).
$$

交叉相乘避免了浮点除法和精度误差。中间乘积可能超过 64 位整数，
因此比较时使用 `__int128`。这里使用它是为了保护比较中的乘法，不是因为
DP 答案超出 64 位整数。

## 怎样从队首取出最优直线

查询坐标 $x$ 单调递增。若队首第二条直线在当前 $x$ 处已经不大于第一条：

```cpp
value(hull[1], x) <= value(hull[0], x)
```

随着 $x$ 继续增大，斜率更小的第二条只会越来越优。第一条不会再成为答案，
可以从队首删除。

每条直线最多加入一次，最多从队首或队尾删除一次。全部凸包操作总计
$O(n)$ 次。

## 完整代码

输入保证 `t[i]`、`f[i]` 和 `S` 为正数，所有真实代价都在 64 位整数范围内。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct Line {
    ll slope;
    ll intercept;
};

int n;
ll startup_time;
vector<ll> time_prefix;
vector<ll> cost_prefix;
vector<ll> dp;

__int128 value(const Line& line, ll x) {
    return (__int128)line.slope * x + line.intercept;
}

bool is_obsolete(const Line& a, const Line& b, const Line& c) {
    __int128 left = (__int128)(b.intercept - a.intercept) * (b.slope - c.slope);
    __int128 right =
        (__int128)(c.intercept - b.intercept) * (a.slope - b.slope);
    return left >= right;
}

ll minimum_batching_cost() {
    deque<Line> hull;
    hull.push_back({0, 0});

    dp.assign(n + 5, 0);

    for (int i = 1; i <= n; i++) {
        ll x = time_prefix[i] + startup_time;

        while (hull.size() >= 2 && value(hull[1], x) <= value(hull[0], x)) {
            hull.pop_front();
        }

        __int128 best = value(hull.front(), x);
        best += (__int128)time_prefix[i] * cost_prefix[i];
        best += (__int128)startup_time * cost_prefix[n];
        dp[i] = (ll)best;

        Line line = {-cost_prefix[i], dp[i]};
        while (hull.size() >= 2 && is_obsolete(hull[hull.size() - 2],
                                               hull[hull.size() - 1], line)) {
            hull.pop_back();
        }
        hull.push_back(line);
    }

    return dp[n];
}

void solve() {
    cin >> n >> startup_time;

    time_prefix.assign(n + 5, 0);
    cost_prefix.assign(n + 5, 0);

    for (int i = 1; i <= n; i++) {
        ll processing_time, cost;
        cin >> processing_time >> cost;
        time_prefix[i] = time_prefix[i - 1] + processing_time;
        cost_prefix[i] = cost_prefix[i - 1] + cost;
    }

    cout << minimum_batching_cost() << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

在本篇的单调条件下：

- 前缀和预处理为 $O(n)$；
- 每条直线入队一次、出队至多一次；
- 时间复杂度为 $O(n)$；
- 空间复杂度为 $O(n)$。

## 不满足单调条件时

双端队列版本依赖两个条件：

1. 直线斜率按顺序加入；
2. 查询坐标也按顺序到来。

若只有斜率单调，但查询坐标乱序，可以在凸包上二分最优直线；若斜率也乱序，
则需要 Li Chao Tree 或能够动态维护凸包的结构。这些都是基础斜率优化的自然
扩展，但不为了模板“通用”而提前塞进本篇完整代码。

## 常见错误

- 看到乘积项就套斜率优化，没有先把决策 $j$ 整理成真正的直线；
- 把查询坐标、斜率或截距中仍然含有另一个变化下标的式子误当成直线；
- 没有确认是取最小值还是最大值，维护了错误的凸包；
- 不检查斜率和查询坐标的单调性，却仍使用只能单向弹出的双端队列；
- 用 `double` 比较交点，在数值接近时产生精度误差；
- 交叉相乘本身溢出 64 位整数；
- 先加入状态 $i$ 的直线，再查询 `dp[i]`，错误地允许当前状态转移给自己。

## 需要记住什么

- 批处理问题的 $O(n^2)$ 转移如何从最后一批推导？
- 为什么一次启动时间可以立即计入全部未完成任务的代价？
- 怎样将转移中只与 $i$ 有关的项移出最小值，再识别 $x$、斜率和截距？
- 为什么中间直线的两个交点顺序颠倒时，它永远不会最优？
- 为什么查询坐标单调时，已经不优的队首不会重新变优？
- 使用双端队列版本以前，必须检查哪两种单调性？
