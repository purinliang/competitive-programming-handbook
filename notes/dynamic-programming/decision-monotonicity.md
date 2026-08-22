# 决策单调性

> 最近修订：2026-08-23 07:28 +10:00（未审阅）

把一个非负整数序列分成 `k` 个非空连续段。若一段元素和为 `sum`，代价是 `sum^2`，
求总代价最小值。

平方会惩罚特别大的段，因此最优方案倾向于让各段元素和比较均衡。定义：

$$
dp[group][right]
$$

表示把前 `right` 个元素分成 `group` 段的最小代价。枚举最后一段从 `split+1` 开始：

$$
dp[group][right]
=
\min_{group-1\le split<right}
\left\{
dp[group-1][split]+cost(split+1,right)
\right\}.
$$

直接计算需要 `O(kn^2)`。但本题中，随着 `right` 向右移动，最优分割点不会向左移动。
这个性质称为决策单调性。它是后续分治优化的真正前提，而“转移式长得相似”并不足以
使用优化。

本文先把最优决策的含义、单调性证明和基准算法讲清楚；下一篇再利用它减少枚举范围。

## 阶段、状态与决策

### 阶段

`group` 表示已经划分的段数，从 `1` 增加到 `k`。

### 状态

`right` 表示当前覆盖前缀 `1..right`。

### 决策

`split` 表示上一段结束位置；最后一段是闭区间：

```text
[split + 1, right]
```

每段必须非空，所以：

```text
group - 1 <= split < right
```

`group-1` 个元素是前面每段至少取一个元素所需的最短前缀。

## 用前缀和 O(1) 计算段代价

设：

$$
prefix[i]=\sum_{t=1}^{i}a_t.
$$

则：

$$
cost(left,right)
=
\left(prefix[right]-prefix[left-1]\right)^2.
$$

在转移中 `left=split+1`，所以：

$$
W(split,right)
=
\left(prefix[right]-prefix[split]\right)^2.
$$

下面把 `W(split,right)` 简称转移代价。它不包含上一层 `dp`，只描述最后一段。

## 最优决策是什么

固定一层 `group`，定义：

$$
opt[right]
=
\mathop{\arg\min}_{split<right}
\left\{
previous[split]+W(split,right)
\right\}.
$$

若多个 `split` 得到相同最小值，统一取最小的一个。这个破同分规则非常重要：没有固定
规则时，程序可以在等价决策之间任意跳动，看起来不再单调。

本题满足：

$$
opt[right]\le opt[right+1].
$$

更一般地，若 `i<i'`，就有：

$$
opt[i]\le opt[i'].
$$

## 转移代价的四点关系

取：

$$
q<p\le i<i'.
$$

由于序列元素非负，前缀和单调不降。记三段前缀和增量为：

$$
X=prefix[p]-prefix[q],
$$

$$
Y=prefix[i]-prefix[p],
$$

$$
Z=prefix[i']-prefix[i].
$$

都有 `X,Y,Z >= 0`。展开平方可得：

$$
W(q,i')+W(p,i)-W(q,i)-W(p,i')=2XZ\ge0.
$$

整理为：

$$
W(q,i)+W(p,i')
\le
W(q,i')+W(p,i).
$$

它表达一种交叉选择不会比顺序选择更好的结构，也是 Monge 性质在本题中的形式。

> 非负条件不是装饰。若元素允许为负，前缀和不再单调，`X` 或 `Z` 可能为负，上面的
> 不等式和决策单调性都可能失效。

## 证明最优决策不会后退

反设 `i<i'`，最优决策却满足：

$$
p=opt[i]>opt[i']=q.
$$

由 `p` 在位置 `i` 最优：

$$
previous[p]+W(p,i)
\le
previous[q]+W(q,i).
$$

由 `q` 在位置 `i'` 最优：

$$
previous[q]+W(q,i')
\le
previous[p]+W(p,i').
$$

两式相加，`previous` 消去：

$$
W(p,i)+W(q,i')
\le
W(q,i)+W(p,i').
$$

而上一节的四点关系给出完全相反方向的不等式，所以两边只能相等。于是前面两条最优性
不等式也都只能取等，说明较小的 `q` 在位置 `i` 同样最优。

但我们约定平局时取最小决策，因此不可能选择更大的 `p`。矛盾说明：

$$
opt[i]\le opt[i'].
$$

这个证明还揭示了一个关键点：上一层 `previous[split]` 在两条最优性不等式相加时恰好
消去。决策单调性来自转移代价 `W` 的结构，而不是来自某组碰巧单调的 `dp` 数值。

## O(kn^2) 基准代码

优化以前先保留一个直接枚举决策的版本。它既能解决小数据，也能在随机测试中验证优化
代码和 `opt` 单调性。

输入 `n,k` 与非负整数序列，输出最小总代价。保证答案及所有中间平方都在 64 位整数
范围内，并且 `1 <= k <= n`。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 4e18;

int n, group_count;
vector<ll> a;
vector<ll> prefix_sum;
vector<ll> previous_dp;
vector<ll> dp;
vector<int> decision;

ll segment_cost(int left, int right) {
    ll sum = prefix_sum[right] - prefix_sum[left - 1];
    return sum * sum;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> group_count;
    a.assign(n + 5, 0);
    prefix_sum.assign(n + 5, 0);

    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
        prefix_sum[i] = prefix_sum[i - 1] + a[i];
    }

    previous_dp.assign(n + 5, INF);
    dp.assign(n + 5, INF);
    decision.assign(n + 5, 0);
    previous_dp[0] = 0;

    for (int group = 1; group <= group_count; ++group) {
        fill(dp.begin(), dp.end(), INF);
        fill(decision.begin(), decision.end(), 0);

        for (int right = group; right <= n; ++right) {
            for (int split = group - 1; split < right; ++split) {
                if (previous_dp[split] == INF) {
                    continue;
                }

                ll candidate =
                    previous_dp[split] + segment_cost(split + 1, right);
                if (candidate < dp[right]) {
                    dp[right] = candidate;
                    decision[right] = split;
                }
            }
        }

        for (int right = group + 1; right <= n; ++right) {
            assert(decision[right - 1] <= decision[right]);
        }
        previous_dp.swap(dp);
    }

    cout << previous_dp[n] << '\n';
    return 0;
}
```

严格使用 `<` 更新，再配合 `split` 从小到大枚举，就会在相同最优值中保留最小决策。
断言不是算法成立的证明，但它能尽早暴露代码、代价公式或适用条件写错的问题。

## 复杂度

共有 `k` 层，每层有 `O(n)` 个状态，每个状态枚举 `O(n)` 个分割点：

- 时间复杂度：`O(kn^2)`；
- 使用滚动数组后的空间复杂度：`O(n)`。

决策单调性本身还没有改变复杂度。它只告诉我们：求中间状态的最优决策后，左半区间
不必检查更靠右的决策，右半区间也不必检查更靠左的决策。下一篇会把这条信息变成分治
搜索范围。

## 不能看见单调就套优化

在若干随机数据上观察到 `opt` 单调，不等于它对所有输入成立。正确使用决策单调性至少
需要以下一种依据：

- 从代价函数证明 Monge 或四边形不等式；
- 通过题目的交换论证直接证明最优决策顺序；
- 题目明确保证决策单调；
- 引用一个条件完全匹配的已知定理。

若只凭样例猜测，优化代码可能在绝大多数数据上正确，却被一个小反例击穿。

## 常见错误

- 没有给平局决策规定统一顺序，导致 `opt` 表面上来回跳动；
- 忘记每段非空，让 `split` 取到 `right`；
- 第 `group` 层仍允许 `split < group-1`；
- 段和没有使用前缀和，单次代价又多出一个线性复杂度；
- 忽略元素非负条件，直接沿用平方段和的单调性证明；
- 只在随机数据上看到单调，就宣称对所有输入成立；
- 用一个优化实现验证另一个优化实现，没有保留独立的朴素基准；
- 代价平方或两个 DP 值相加超过 64 位整数范围。

## 需要记住什么

- `opt[right]` 的精确定义是什么？
- 平局时为什么必须固定选择最小或最大决策？
- 平方段和代价满足怎样的四点关系？
- 最优性不等式相加以后，为什么上一层 `dp` 会消去？
- 非负元素条件在证明中用在哪里？
- 决策单调性与分治优化分别是“性质”还是“执行方法”？
- 为什么优化代码仍应与 `O(kn^2)` 基准随机对拍？
