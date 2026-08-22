# 四边形不等式优化

> 最近修订：2026-08-23 07:49 +10:00（未审阅）

有 `n` 堆石子排成一行，每次只能合并相邻两堆，代价是新石子堆的石子总数。不断合并
直到只剩一堆，怎样让总代价最小？

区间 DP 可以枚举最后一次合并位置：

$$
dp[left][right]
=
\min_{left\le split<right}
\left\{
dp[left][split]+dp[split+1][right]
\right\}
+W(left,right),
$$

其中 `W(left,right)` 是区间石子总数。共有 `O(n^2)` 个区间，每个区间枚举 `O(n)`
个分割点，普通算法需要 `O(n^3)`。

非负区间和满足四边形不等式。它能推出相邻区间的最优分割点互相夹住当前决策，把每个
状态的候选范围从整个区间缩小到两个已知决策之间，最终把复杂度降到 `O(n^2)`。

这类优化也称 Knuth–Yao 优化。它有严格的递推形式和代价条件，不是看见区间 DP 就能
套用的通用技巧。

## 为什么最后一次合并能划分区间

合并过程始终只操作相邻石子堆，因此任意中间石子堆都对应原序列的一段连续区间。

区间 `[left,right]` 的最后一次操作，一定把：

```text
[left, split] 和 [split + 1, right]
```

这两个已经分别合并完成的石子堆合在一起。最后一次代价与此前顺序无关，恒为整个区间
石子总数 `W(left,right)`。

所以只需枚举最后分割点，并把左右子问题的最优代价相加。边界为：

$$
dp[i][i]=0,
$$

因为单独一堆不需要合并。

## 最优决策

定义 `opt[left][right]` 为使 `dp[left][right]` 最小的最小分割点。若存在多个相同最优
值，固定取最小者。

四边形不等式优化需要证明：

$$
opt[left][right-1]
\le
opt[left][right]
\le
opt[left+1][right].
$$

于是计算 `[left,right]` 时，只需枚举：

```text
opt[left][right - 1] .. opt[left + 1][right]
```

并且分割点必须小于 `right`，所以代码把右端再与 `right-1` 取最小值。

## 四边形不等式

对任意：

$$
a\le b\le c\le d,
$$

权值函数若满足：

$$
W(a,c)+W(b,d)
\le
W(a,d)+W(b,c),
$$

就称它满足本文所需方向的四边形不等式，也可以看成区间代价的 Monge 性质。

还需要区间包含单调性：若 `[b,c]` 被 `[a,d]` 包含，则：

$$
W(b,c)\le W(a,d).
$$

对非负石子重量，`W` 是区间和。第一条甚至恒取等号，因为两侧对每一段元素的计算次数
完全相同；第二条则来自扩大区间只会加入非负重量。因此相邻石子合并满足条件。

> 若石子重量允许为负，区间包含单调性可能失效，不能继续沿用本文结论。

## 条件怎样推出决策夹逼

对递推：

$$
dp[l][r]
=
\min_{l\le k<r}
\{dp[l][k]+dp[k+1][r]\}
+W(l,r),
$$

Knuth–Yao 定理说明：若 `W` 满足四边形不等式和区间包含单调性，递推得到的 `dp` 仍
保留相应四点结构，并且最小最优决策满足：

$$
opt[l][r-1]\le opt[l][r]\le opt[l+1][r].
$$

直观上，同时向左或向右扩大区间时，交叉移动的两个分割选择可以通过四点不等式交换成
顺序选择而不更差，因此最优分割点不能越过相邻小区间已经确定的边界。平局取最小决策
以后，这个夹逼关系成为确定的数组不等式。

完整定理与证明可参考 F. Frances Yao 的原始论文
[Efficient Dynamic Programming Using Quadrangle Inequalities](https://doi.org/10.1145/800141.804691)。
应用模板以前仍应逐项验证递推形式和 `W` 的两个条件，不能只引用结论名称。

## 按区间长度计算

`opt[left][right-1]` 和 `opt[left+1][right]` 都对应长度少 `1` 的区间。因此必须先计算
短区间，再计算长区间：

```cpp
for (int length = 2; length <= n; ++length) {
    for (int left = 1; left + length - 1 <= n; ++left) {
        int right = left + length - 1;
        // 计算 dp[left][right]
    }
}
```

单点区间初始化为：

```cpp
dp[i][i] = 0;
opt[i][i] = i;
```

当区间长度为 `2` 时，左右决策边界都是唯一合法分割点 `left`，初始化自然接上转移。

## 为什么总复杂度是 O(n^2)

一个区间 `[left,right]` 的候选数量约为：

$$
opt[left+1][right]
-opt[left][right-1]+1.
$$

固定区间长度时，把所有 `left` 的候选数量相加，中间的 `opt` 项沿着相邻对角线首尾
抵消，只留下两端差值和每个区间的常数 `1`，总计 `O(n)`。

区间长度共有 `O(n)` 种，所以全部决策枚举总量为：

$$
O(n^2).
$$

这比“每个状态的候选数都变成常数”更准确：单个区间的范围仍可能很长，但所有区间的
候选范围总和受到夹逼关系约束。

## 完整代码

输入每堆的非负石子数，求只能合并相邻石子堆时的最小总代价。保证 `1 <= n <= 3000`，
答案在 64 位整数范围内。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 4e18;

int n;
vector<ll> stone;
vector<ll> prefix_sum;
vector<vector<ll>> dp;
vector<vector<int>> opt;

ll interval_sum(int left, int right) {
    return prefix_sum[right] - prefix_sum[left - 1];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n;
    stone.assign(n + 5, 0);
    prefix_sum.assign(n + 5, 0);

    for (int i = 1; i <= n; ++i) {
        cin >> stone[i];
        prefix_sum[i] = prefix_sum[i - 1] + stone[i];
    }

    dp.assign(n + 5, vector<ll>(n + 5, 0));
    opt.assign(n + 5, vector<int>(n + 5, 0));

    for (int i = 1; i <= n; ++i) {
        opt[i][i] = i;
    }

    for (int length = 2; length <= n; ++length) {
        for (int left = 1; left + length - 1 <= n; ++left) {
            int right = left + length - 1;
            int first_split = opt[left][right - 1];
            int last_split = min(right - 1, opt[left + 1][right]);

            dp[left][right] = INF;
            for (int split = first_split; split <= last_split; ++split) {
                ll candidate = dp[left][split] + dp[split + 1][right] +
                               interval_sum(left, right);
                if (candidate < dp[left][right]) {
                    dp[left][right] = candidate;
                    opt[left][right] = split;
                }
            }
        }
    }

    cout << dp[1][n] << '\n';
    return 0;
}
```

严格使用 `<` 更新并从小到大枚举 `split`，会保留最小最优决策，与定理中的破同分约定
一致。

## 正确性

按区间长度归纳。

长度为 `1` 时不需合并，`dp[i][i]=0` 正确。

假设所有更短区间已经正确。区间 `[left,right]` 的最后一次合并唯一对应某个分割点
`split`；此前左右区间可以独立采用归纳假设中的最优方案，最后再付出整个区间石子和。
因此原始区间 DP 枚举全部分割点时正确。

四边形不等式与区间包含单调性保证真实最小最优决策位于：

$$
[opt[left][right-1],\ opt[left+1][right]].
$$

优化代码恰好枚举这个范围内的全部合法分割点，没有删除最优决策，所以得到的值与原始
递推相同。归纳成立，`dp[1][n]` 即为完整序列的最小合并代价。

## 与分治优化的区别

两种优化都利用最优决策单调，但递推形态和执行方法不同：

- 分治优化处理“当前层只依赖上一层”的前缀分组 DP，用中间状态划分候选范围；
- 本文处理特定形式的区间合并 DP，用两个相邻短区间的 `opt` 直接夹住当前决策；
- 分治优化的典型复杂度为每层 `O(n log n)`；
- 本文在满足更强条件时把整个区间 DP 从 `O(n^3)` 降到 `O(n^2)`。

不要仅因为两者都出现 `opt` 数组就互换代码框架。

## 常见错误

- 只验证四边形不等式，忘记所用定理还要求区间包含单调性；
- 石子重量允许负数时仍直接使用非负区间和证明；
- `opt[i][i]` 没有初始化，导致长度为 `2` 的搜索范围为空；
- 候选右端没有限制到 `right-1`，允许右子区间为空；
- 平局时随意覆盖 `opt`，与最小决策约定不一致；
- 没按区间长度递增计算，读取尚未得到的相邻决策；
- 把普通任意两堆合并问题误认为相邻石子合并问题；
- 只看见区间 DP 形式，没有证明权值函数条件就套模板；
- 认为每个状态只枚举常数个分割点，而没有理解总候选数的抵消分析；
- `O(n^2)` 的内存超过题目限制，却只关注时间复杂度。

## 需要记住什么

- 相邻石子合并的最后一次操作怎样导出区间 DP？
- 四边形不等式和区间包含单调性分别是什么？
- 非负区间和为什么满足这两个条件？
- `opt[left][right]` 使用怎样的破同分约定？
- 两个相邻短区间怎样夹住当前区间的最优决策？
- 为什么候选总量是 `O(n^2)`，而不是要求每个区间只有常数个候选？
- 四边形不等式优化与分治优化的递推形态有何不同？
