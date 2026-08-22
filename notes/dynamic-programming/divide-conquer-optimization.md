# 分治优化

> 最近修订：2026-08-23 07:38 +10:00（未审阅）

[决策单调性](decision-monotonicity.md) 中，我们把非负序列分成 `k` 个非空连续段，并
最小化各段元素和的平方和。直接转移为：

$$
dp[group][right]
=
\min_{group-1\le split<right}
\left\{
previous[split]+cost(split+1,right)
\right\}.
$$

每层有 `O(n)` 个状态，每个状态枚举 `O(n)` 个分割点，总复杂度是 `O(kn^2)`。

我们已经证明，同一层的最小最优决策满足：

$$
opt[right]\le opt[right+1].
$$

分治优化把这条性质真正用于计算：先求中间位置的最优决策，它会同时成为左半区间的
决策上界和右半区间的决策下界。递归下去以后，每个状态不再扫描全部分割点。

## 输入形式

分治优化常用于分层 DP：

$$
dp[layer][i]
=
\min_{j<i}
\{previous[j]+W(j,i)\}.
$$

它需要同时满足：

1. 当前层只依赖完整的上一层；
2. `W(j,i)` 能快速计算；
3. 已经证明当前层的最优决策 `opt[i]` 单调不降；
4. 所有状态和决策范围都能写成连续区间。

只有转移式相似而没有第三条，不能使用本文优化。

## 一个分治任务表示什么

定义函数：

```cpp
compute_layer(group, left, right, opt_left, opt_right)
```

它表示：

- 需要计算当前层状态 `left..right`；
- 这些状态的最优分割点一定落在 `opt_left..opt_right`。

取中点：

```cpp
int middle = (left + right) / 2;
```

对于 `middle`，分割点还必须满足 `split < middle`，所以实际枚举范围是：

```text
opt_left .. min(opt_right, middle - 1)
```

在这个范围内直接找到 `dp[middle]` 和 `opt[middle]`。

## 中间决策怎样缩小两侧范围

设中间状态的最优决策为 `best_split`。

决策单调性给出：

- 对任意 `i < middle`，有 `opt[i] <= best_split`；
- 对任意 `i > middle`，有 `opt[i] >= best_split`。

所以递归变成：

```cpp
compute_layer(group, left, middle - 1, opt_left, best_split);

compute_layer(group, middle + 1, right, best_split, opt_right);
```

两边都可以包含 `best_split`。它可能同时是多个相邻状态的最优决策，不能因为中间状态
已经使用过就排除。

## 为什么必须先计算中点

分治不是把状态随意分成两半。先计算中点的目的，是取得一个经过真实转移验证的
`best_split`，再用单调性约束左右子问题。

若先递归两边，尚不知道中间决策，决策范围不会缩小；若用猜测值代替 `best_split`，就
可能错误删掉真正最优转移。

因此每个递归节点严格执行：

1. 枚举当前中点允许的全部决策；
2. 保存最优值和最小最优决策；
3. 用这个决策划分左右递归范围。

## 一层为什么是 O(n log n)

在同一递归深度，所有状态区间互不重叠。对应的决策区间可能在边界处重合，但总长度仍
为 `O(n)`。

递归深度为 `O(log n)`，所以一层需要：

$$
O(n\log n)
$$

次转移代价计算。共有 `k` 层，总复杂度为：

$$
O(kn\log n).
$$

若 `W(j,i)` 本身需要 `T` 时间，复杂度还要乘 `T`。本文用前缀和在 `O(1)` 内计算
平方段和。

## 完整代码

解决与决策单调性文章相同的问题：把非负整数序列分成 `k` 个非空连续段，最小化各段
元素和的平方和。保证 `1 <= k <= n`，并且所有中间值在 64 位整数范围内。

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

void compute_layer(int group, int left, int right, int opt_left,
                   int opt_right) {
    if (left > right) {
        return;
    }

    int middle = (left + right) / 2;
    int last_split = min(opt_right, middle - 1);
    ll best_value = INF;
    int best_split = -1;

    for (int split = opt_left; split <= last_split; ++split) {
        if (split < group - 1 || previous_dp[split] == INF) {
            continue;
        }

        ll candidate = previous_dp[split] + segment_cost(split + 1, middle);
        if (candidate < best_value) {
            best_value = candidate;
            best_split = split;
        }
    }

    dp[middle] = best_value;
    decision[middle] = best_split;

    compute_layer(group, left, middle - 1, opt_left, best_split);
    compute_layer(group, middle + 1, right, best_split, opt_right);
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
    decision.assign(n + 5, -1);
    previous_dp[0] = 0;

    for (int group = 1; group <= group_count; ++group) {
        fill(dp.begin(), dp.end(), INF);
        fill(decision.begin(), decision.end(), -1);

        compute_layer(group, group, n, group - 1, n - 1);
        previous_dp.swap(dp);
    }

    cout << previous_dp[n] << '\n';
    return 0;
}
```

`best_split` 在合法调用中一定能找到：当前状态 `middle >= group`，至少存在分割点
`group-1`，而上一层恰好能覆盖这个前缀。代码仍初始化为 `-1`，让错误的调用范围更
容易在调试时暴露，而不是静默使用一个看似合法的编号。

## 正确性

对一次 `compute_layer` 调用归纳。

调用约定保证 `left..right` 中每个状态的真实最优决策都位于
`opt_left..opt_right`。函数枚举中点在此区间内的全部合法分割点，因此得到正确的
`dp[middle]` 和最小最优决策 `best_split`。

由决策单调性：

- 左侧状态的决策不超过 `best_split`，所以左递归的新上界安全；
- 右侧状态的决策不小于 `best_split`，所以右递归的新下界安全。

两个子调用仍满足相同约定。递归最终覆盖区间内每个状态恰好一次，因此整层计算正确。

最外层按 `group` 从小到大处理，每层读取完整且正确的 `previous_dp`，所以最终
`previous_dp[n]` 是分成 `k` 段的最小代价。

## 与普通分治的区别

这里的分治对象是“一层 DP 状态及其候选决策范围”，不是把原问题拆成两个互不影响的
子问题。左右状态仍共享同一份上一层 `previous_dp`，也可能使用相同分割点。

因此它更准确地说是利用单调最优决策进行离线计算的框架。若状态之间本身互相依赖，或
当前层尚未完成的值会参与同层转移，就不能直接套用这份代码。

## 常见错误

- 没有证明 `opt` 单调就直接使用分治范围；
- 中点允许枚举 `split = middle`，产生空的最后一段；
- 左右递归把 `best_split` 排除，漏掉相邻状态共享最优决策的情况；
- 当前层尚未算完就读取 `dp[split]`，把分层转移误写成同层转移；
- 忘记第 `group` 层的最小合法分割点是 `group-1`；
- 平局时没有与单调性证明一致地选择最小决策；
- `W(j,i)` 不是 `O(1)`，却仍声称总复杂度为 `O(kn log n)`；
- 没有用 `O(kn^2)` 基准进行随机对拍；
- 递归边界中使用 `best_split-1` 或 `best_split+1`，错误排除等价决策。

## 需要记住什么

- 分治优化要求哪种 DP 形式和哪条核心性质？
- 一个 `compute_layer` 调用的四个区间参数分别表示什么？
- 为什么实际决策上界还要与 `middle-1` 取最小值？
- 中间状态的最优决策怎样限制左右子问题？
- 为什么两边都要保留 `best_split`？
- 一层状态的复杂度为什么是 `O(n log n)`？
- 分治优化与普通的“把原问题拆成左右子问题”有什么区别？
