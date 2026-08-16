# 单调栈优化

> 最近修订：2026-08-17 07:40 +10:00（未审阅）

单调栈不只能查找最近更大或更小元素。当动态规划枚举“最后一段”的
分割点，而这段的代价只取决于区间最大值或最小值时，大量分割点
会得到相同的区间代价。单调栈可以把它们合并成少量候选组。

本篇使用一个自然的分段问题：

> 将一个数组分成恰好 $k$ 个非空连续段。每段的代价是该段最大值，
> 求所有段代价之和的最小值。

“连续分段”和“每段取最大值”都是问题本身的结构，不是为了排除
其他算法而附加的限制。单调栈优化的核心——合并区间最值相同的决策——
会在转移中自然出现。

## 最后一段从哪里开始

设：

$$
dp[g][i]
=将前 i 个数分成恰好 g 段的最小代价。
$$

选择分割点 $j$，就是让前 $j$ 个数组成前 $g-1$ 段，最后一段为
`a[j+1..i]`：

$$
dp[g][i]
=\min_{g-1\le j<i}
\left(dp[g-1][j]+\max_{j<x\le i}a[x]\right).
$$

这个转移非常直接，但每个状态最多枚举 $n$ 个分割点，总时间复杂度
为 $O(kn^2)$。

第 $g$ 层只使用第 $g-1$ 层，所以代码中使用 `previous` 和 `current`
两个一维数组滚动保存 DP。

## 区间最大值是阶梯

先固定右端点 $i$，再让分割点 $j$ 从 $i-1$ 向左移动。最后一段
`a[j+1..i]` 不断变长，它的最大值只会：

- 保持不变；
- 遇到一个更大的数后增大。

例如，若 `a[1..5]` 为：

```text
4 2 5 1 3
```

右端点固定为 `5` 时，从不同分割点开始的区间最大值是：

| 分割点 `j` | 最后一段 | 区间最大值 |
| --- | --- | --- |
| 4 | `[3]` | 3 |
| 3 | `[1,3]` | 3 |
| 2 | `[5,1,3]` | 5 |
| 1 | `[2,5,1,3]` | 5 |
| 0 | `[4,2,5,1,3]` | 5 |

它不是 $i$ 个毫无关系的值，而是由若干段相同值组成的阶梯。对于区间
最大值同为 $m$ 的一组分割点，转移只需要其中最小的 `previous[j]`：

$$
\min_j(previous[j]+m)
=m+\min_j previous[j].
$$

因此，每组候选只需要保存两件事：

- 这组分割点共同的区间最大值 `maximum`；
- 这组分割点中最小的 `previous[j]`，记作 `minimum_previous`。

## 右端点向右移动

从 $i-1$ 扩展到 $i$ 时，每个旧候选的最后一段都加入 `a[i]`，它的新最大值为：

$$
\max(old\_maximum,a[i]).
$$

栈中的 `maximum` 从栈底到栈顶严格递减。栈顶若满足：

```cpp
stack.back().maximum <= a[i]
```

那么这组候选的最大值会统一变成 `a[i]`。连续弹出所有满足条件的栈顶，
并合并它们的 `minimum_previous`：

```cpp
ll minimum_previous = previous[i - 1];

while (!stack.empty() && stack.back().maximum <= a[i]) {
    minimum_previous = min(minimum_previous, stack.back().minimum_previous);
    stack.pop_back();
}
```

`previous[i-1]` 对应新出现的分割点 `j=i-1`，它的最后一段只有
`a[i]` 一个数。所有被弹出的旧组也获得了同样的最大值 `a[i]`，因此
可以与新分割点合并为一组。

## 保存所有组中的最优值

新组自己的转移值是：

$$
minimum\_previous+a[i].
$$

但栈中可能还留着最大值大于 `a[i]` 的组。它们的区间最大值没有改变，
仍然可能给出更小答案。

每个栈元素再保存 `best`，表示从栈底到当前组的所有转移值中的最小值。
新组的 `best` 为：

```cpp
ll best = minimum_previous + a[i];
if (!stack.empty()) {
    best = min(best, stack.back().best);
}
```

只会从栈顶弹出元素，因此剩余栈顶的 `best` 始终是剩余所有组的最优值。
压入新组后，新栈顶的 `best` 就是 `current[i]`。

## 一层 DP 的完整过程

栈节点的三个量各有明确用途：

```cpp
struct Node {
    ll maximum;
    ll minimum_previous;
    ll best;
};
```

对一个固定的段数 `group_count`，从左到右扫描 `i=1..n`：

1. 用 `previous[i-1]` 建立新分割点；
2. 弹出最大值不超过 `a[i]` 的旧组，合并它们的最小前缀代价；
3. 使用 `a[i]` 作为合并后新组的最大值；
4. 把新组的转移值与剩余所有组的 `best` 比较；
5. 新栈顶的 `best` 就是当前 DP 状态。

不可达的 `previous[j]` 设为 `INF`。只有合并后的 `minimum_previous`
可达时，才创建新组，避免 `INF+a[i]` 溢出或伪造候选。

## 为什么不会退化成平方复杂度

在同一层 DP 中，每个位置最多：

- 作为新组入栈一次；
- 在遇到不小于自己最大值的新元素时出栈一次。

出栈后不会再入栈，所以所有 `while` 的总弹出次数为 $O(n)$。每层 DP
的时间复杂度为 $O(n)$，全部 $k$ 层为 $O(kn)$。

栈、`previous` 和 `current` 都只需要 $O(n)$ 空间。

## 完整代码

输入 `n`、`k` 和数组 `a[1..n]`，输出分成恰好 `k` 个非空连续段后，
各段最大值之和的最小值。保证 `1<=k<=n`，答案在 64 位整数范围内。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll INF = 1LL << 62;

struct Node {
    ll maximum;
    ll minimum_previous;
    ll best;
};

int n, k;
vector<ll> a;

ll minimum_partition_cost() {
    vector<ll> previous(n + 5, INF);
    vector<ll> current(n + 5, INF);
    previous[0] = 0;

    for (int group_count = 1; group_count <= k; group_count++) {
        fill(current.begin(), current.end(), INF);
        vector<Node> stack;

        for (int i = 1; i <= n; i++) {
            ll minimum_previous = previous[i - 1];

            while (!stack.empty() && stack.back().maximum <= a[i]) {
                minimum_previous =
                    min(minimum_previous, stack.back().minimum_previous);
                stack.pop_back();
            }

            if (minimum_previous != INF) {
                ll best = minimum_previous + a[i];
                if (!stack.empty()) {
                    best = min(best, stack.back().best);
                }
                stack.push_back({a[i], minimum_previous, best});
            }

            if (!stack.empty()) {
                current[i] = stack.back().best;
            }
        }

        previous.swap(current);
    }

    return previous[n];
}

void solve() {
    cin >> n >> k;

    a.assign(n + 5, 0);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    cout << minimum_partition_cost() << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 最小值版本

若每段代价改为区间最小值，整个结构对称：

- 候选组的区间最小值从栈底到栈顶严格递增；
- 新元素 `a[i]` 会合并栈顶中 `minimum >= a[i]` 的组；
- 每组仍然只需要保存最优的前缀 DP 值。

不要只背“比较符反过来”。先写出新区间统计量
`min(old_minimum,a[i])`，再根据哪些旧组会变成同一个值推导弹栈条件。

## 常见错误

- 没有先写出 $O(kn^2)$ 转移，直接背栈上三个量；
- 把所有分割点都压栈，没有合并区间最大值相同的候选；
- 弹栈时只保留最大值，忘记合并最小 `previous[j]`；
- 新组的答案没有与栈中剩余组的 `best` 比较；
- 在不可达状态上计算 `INF+a[i]`；
- 把每层 DP 的栈延续到下一层，混合了两个不同的 `previous`；
- 看到循环中的 `while` 就直接判定为 $O(n^2)$，没有统计每个元素的总出栈次数。

## 需要记住什么

- 最后一段的分割点转移怎样写？朴素复杂度是多少？
- 固定右端点时，为什么不同左端点的区间最大值形成阶梯？
- 区间最大值相同的一组分割点，为什么只保留最小的前缀 DP 值？
- 新元素为什么会合并栈顶中最大值不超过它的组？
- `best` 保存的是什么？为什么新栈顶可以直接给出当前状态？
- 为什么每层 DP 中的所有弹栈操作合计只有 $O(n)$ 次？
