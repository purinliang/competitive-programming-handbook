# 背包：多重背包

> 最近修订：2026-08-13 22:45 +10:00（未审阅）

0-1 背包让每件物品至多选择一次，完全背包让每种物品选择任意多次。多重背包位于二者之间：第 `i` 种物品最多只有 `quantity[i]` 件，每件重量为 `weight[i]`、价值为 `value[i]`。

要求选择的总重量不超过 `capacity`，并让总价值最大。本篇先写出枚举当前种类件数的基础转移，再用二进制拆分把有限件数变成若干个只能选择一次的组合物品，最终复用 [背包：0-1 背包](zero-one-knapsack.md) 的倒序更新。

## 有限数量

沿用容量为 `10` 的背包，并为每种物品增加数量：

| 种类 `i` | 单件重量 | 单件价值 | 数量上限 |
| ---: | ---: | ---: | ---: |
| `1` | `6` | `30` | `1` |
| `2` | `3` | `14` | `2` |
| `3` | `4` | `16` | `1` |
| `4` | `2` | `9` | `2` |

选择一件第一种物品和两件第四种物品时：

```text
总重量：6 + 2 + 2 = 10
总价值：30 + 9 + 9 = 48
```

这是样例的最优答案。

数量为 `1` 的种类等价于一件 0-1 物品；数量足够大、在容量范围内永远用不完的种类等价于完全背包物品。一般多重背包必须保留介于二者之间的有限上限。

## 枚举件数

定义：

$$
dp[i][c]=\text{只使用前 }i\text{ 种物品、总重量不超过 }c\text{ 时的最大总价值}.
$$

第 `i` 种物品可以选择：

```text
k = 0, 1, 2, ..., quantity[i]
```

还要满足 `k * weight[i] <= c`。选择 `k` 件以后，剩余方案只能使用前 `i - 1` 种物品，所以：

$$
dp[i][c]
=\max_{
0\le k\le quantity[i],\
k\cdot weight[i]\le c
}
\left(dp[i-1][c-k\cdot weight[i]]+k\cdot value[i]\right).
$$

初始状态仍然是：

$$
dp[0][c]=0.
$$

状态表示总重量“不超过”容量，空集合对所有 `c` 都合法，所以初始化为零。

这个枚举转移直接遵守数量上限，适合小规模验证。但每个状态最多尝试 `quantity[i] + 1` 个件数，时间复杂度为：

$$
O\left(
capacity\cdot\sum_{i=1}^{n}
\min\left(quantity[i],\left\lfloor\frac{capacity}{weight[i]}\right\rfloor\right)
\right).
$$

数量和容量都较大时仍然太慢。

## 有效数量上限

容量最多为 `capacity`，单件重量为正。第 `i` 种物品在任何可行方案中最多使用：

$$
\left\lfloor\frac{capacity}{weight[i]}\right\rfloor
$$

件。输入即使提供更多副本，也不可能装入背包。因此先计算：

```cpp
int usable_quantity = min(quantity[i], capacity / weight[i]);
```

后续只需要表示 `0..usable_quantity` 中的每一种使用件数。

这个截断不会删除任何可行方案，并避免让非常大的输入数量进入拆分循环。`capacity == 0` 或单件重量大于容量时，有效数量自然为 `0`，当前种类无需处理。

## 逐件拆开

最直接的转换是把 `usable_quantity` 件相同物品看成同样多件独立的 0-1 物品。每件组合重量为 `weight[i]`，组合价值为 `value[i]`。

选择其中任意 `k` 件，就对应原种类选择 `k` 件，答案正确。但若某种物品有十万件，仍然要做十万轮 0-1 背包，时间没有得到足够改善。

真正需要的不是为每个副本建立一个组，而是用较少的组合物品表示所有件数。

## 二进制拆分

把有效数量依次分成：

```text
1, 2, 4, 8, ...，最后加上剩余数量
```

例如数量 `13` 被拆成：

```text
1, 2, 4, 6
```

前三组一共包含 `7` 件，最后一组包含剩余 `6` 件，总数仍是 `13`。

每一组成为一件组合物品。若某组包含 `take` 件原物品，则：

```cpp
int group_weight = take * weight[i];
ll group_value = take * value[i];
```

每个组合物品只能选择一次，所以使用 0-1 背包倒序更新：

```cpp
for (int c = capacity; c >= group_weight; c--) {
    dp[c] = max(dp[c], dp[c - group_weight] + group_value);
}
```

选择若干组，对应选择这些组大小之和件原物品。

## 为什么能表示所有件数

组 `1,2,4` 的任意子集可以表示 `0..7`：

```text
0, 1, 2, 1+2, 4, 4+1, 4+2, 4+2+1
```

一般地，若已有组能够表示连续区间 `0..sum`，加入一个大小不超过 `sum + 1` 的新组 `group`：

- 不选择新组，仍能表示 `0..sum`；
- 选择新组，能够表示 `group..group+sum`。

由于 `group <= sum + 1`，两个区间相接或重叠，合起来覆盖 `0..sum+group`，中间没有缺口。

二的幂组每次恰好满足：

```text
1 = 0 + 1
2 = 1 + 1
4 = 3 + 1
8 = 7 + 1
...
```

最后的剩余组不会超过下一个二的幂，也就不会超过此前组大小总和加一。因此二进制拆分能表示从 `0` 到 `usable_quantity` 的每一个整数件数。

同一种件数可能有不止一种组选择方式并不影响最大值；重要的是所有合法件数都能表示，而所有组的总大小又恰好等于数量上限，不会表示超出上限的件数。

## 拆分过程

代码维护尚未分组的 `remaining_quantity` 和下一个二的幂 `group_size`：

```cpp
int remaining_quantity = usable_quantity;
int group_size = 1;

while (remaining_quantity > 0) {
    int take = min(group_size, remaining_quantity);

    // 把 take 件原物品作为一件 0-1 组合物品

    remaining_quantity -= take;
    group_size *= 2;
}
```

当剩余数量小于下一个完整二的幂时，`take` 直接取完剩余部分。数量 `13` 的变量变化为：

| 本轮 `group_size` | `take` | 分组后的剩余数量 |
| ---: | ---: | ---: |
| `1` | `1` | `12` |
| `2` | `2` | `10` |
| `4` | `4` | `6` |
| `8` | `6` | `0` |

最后一组不必是二的幂。它存在的目的正是让所有组大小之和精确等于有效数量。

## 一维状态

令：

$$
dp[c]=\text{已经处理的所有组合物品中，总重量不超过 }c\text{ 的最大价值}.
$$

初始数组全为 `0`。对每个原物品种类完成二进制拆分，再把每组依次当成 0-1 物品倒序更新。

组合物品之间代表互不重叠的一批副本，所以每组可以选或不选；一组内部的 `take` 件被绑定在一起。由于组大小的子集能够表示所有合法件数，这种绑定不会遗漏原问题中的选择数量。

## 函数接口

计算只依赖本次重量、价值、数量和容量，使用无状态函数：

```cpp
ll multiple_knapsack(const vector<int>& weight,
                     const vector<ll>& value,
                     const vector<int>& quantity,
                     int n,
                     int capacity)
```

三份物品信息都使用 `1..n`，位置 `0` 留空。容量状态使用 `0..capacity`。

## 完整代码

输入格式：

```text
n capacity
n 行 weight[i] value[i] quantity[i]
```

保证 `1 <= n <= 100`、`0 <= capacity <= 10^4`、物品重量为正、价值与数量非负、`quantity[i] <= 10^9`，最终答案能使用 64 位整数保存。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

ll multiple_knapsack(const vector<int>& weight,
                     const vector<ll>& value,
                     const vector<int>& quantity,
                     int n,
                     int capacity) {
    vector<ll> dp(capacity + 5, 0);

    for (int i = 1; i <= n; i++) {
        int remaining_quantity = min(quantity[i], capacity / weight[i]);
        int group_size = 1;

        while (remaining_quantity > 0) {
            int take = min(group_size, remaining_quantity);
            int group_weight = take * weight[i];
            ll group_value = take * value[i];

            for (int c = capacity; c >= group_weight; c--) {
                dp[c] = max(dp[c], dp[c - group_weight] + group_value);
            }

            remaining_quantity -= take;
            group_size *= 2;
        }
    }
    return dp[capacity];
}

int main() {
    int n, capacity;
    scanf("%d%d", &n, &capacity);

    vector<int> weight(n + 5);
    vector<ll> value(n + 5);
    vector<int> quantity(n + 5);
    for (int i = 1; i <= n; i++) {
        scanf("%d%lld%d", &weight[i], &value[i], &quantity[i]);
    }

    printf("%lld\n",
           multiple_knapsack(weight, value, quantity, n, capacity));
    return 0;
}
```

输入：

```text
4 10
6 30 1
3 14 2
4 16 1
2 9 2
```

输出：

```text
48
```

## 正确性

先截断数量不会改变答案，因为任何容量不超过 `capacity` 的方案都不可能使用超过 `capacity / weight[i]` 件第 `i` 种物品。

二进制拆分后，各组的总件数等于有效数量，并且任意 `0..usable_quantity` 的件数都能由某些组大小相加得到。因此：

- 原问题中选择 `k` 件某种物品，可以选择组大小之和为 `k` 的组合物品，重量和价值完全相同；
- 组合物品中的任意选择，使用件数不超过所有组的总大小，也对应原问题中的合法数量。

两个问题的可行方案能够互相转换，并保持总重量与总价值，所以最优答案相同。

每个组合物品只允许选择一次，倒序 0-1 背包已经保证它不会在同一轮重复使用。处理完所有组合物品后，`dp[capacity]` 因而等于原多重背包的最大价值。

## 复杂度

令：

$$
s_i=\min\left(quantity[i],\left\lfloor\frac{capacity}{weight[i]}\right\rfloor\right).
$$

第 `i` 种物品被拆成 $O(\log(s_i+1))$ 个组合物品。每组执行一次 $O(capacity)$ 的 0-1 背包更新，所以总时间复杂度为：

$$
O\left(capacity\cdot\sum_{i=1}^{n}\log(s_i+1)\right).
$$

一维 `dp` 使用 $O(capacity)$ 额外空间，输入数组使用 $O(n)$ 空间。组合物品生成后立即处理，没有额外保存全部拆分结果。

该算法仍然依赖容量数值，是伪多项式算法。二进制拆分优化的是数量维度，不会解决容量本身极大的问题。

## 常见错误

### 拆分总数超过数量上限

每轮使用 `take = min(group_size, remaining_quantity)`，并从剩余数量中减去 `take`。不能不检查剩余数量就机械加入完整二的幂组。

### 丢掉最后的剩余组

数量通常不是 `1 + 2 + 4 + ...`。最后的剩余数量也必须成为一组，否则某些较大的合法件数无法表示。

### 组合物品容量正序

每个拆分组只能选择一次，所以它是 0-1 物品，必须倒序更新容量。正序会重复使用整组，进而超过原数量上限。

### 不截断巨大输入数量

输入可能提供远多于容量能容纳的副本。先截断到 `capacity / weight[i]` 能减少组数，并保证组合重量的乘法只处理真正可能装入的件数。

### 把组大小当作重量

`take` 是这组包含的原物品件数。组合重量是 `take * weight[i]`，组合价值是 `take * value[i]`，不能直接用 `take` 更新容量。

### 误以为每种件数必须唯一表示

动态规划只要求每个合法件数至少有一种组选择方式。即使某个件数能够用不同组子集表示，也只会重复比较相同重量价值，不影响最大答案。

## 基础练习

1. 分别把数量 `6`、`10`、`13` 拆成组合组，并列出它们能表示的全部件数。
2. 用区间覆盖证明：已有组能表示 `0..sum` 时，什么条件下加入大小为 `group` 的组仍无缺口？
3. 实现枚举当前种类件数的朴素二维 DP，与二进制拆分随机对拍。
4. 把所有副本逐件拆开成 0-1 物品，比较它与二进制拆分的组合物品数量。
5. 构造 `quantity[i]` 远大于 `capacity / weight[i]` 的输入，检查截断前后答案是否一致。
6. 当某种物品数量为 `0`、`1` 或足够填满整个背包时，分别说明它接近哪一种背包模型。

## 需要记住什么

1. 多重背包对每种物品的选择次数有什么限制？
2. 朴素转移为什么需要枚举当前种类的件数？
3. 为什么数量可以先截断到 `capacity / weight[i]`？
4. 数量 `13` 怎样拆成较少的组合组？
5. 为什么二的幂组与最后剩余组能表示范围内的每一种件数？
6. 每组的组合重量与组合价值怎样计算？
7. 为什么每个组合组应当按 0-1 背包倒序更新？
8. 二进制拆分优化了哪一层循环？时间复杂度怎样表示？
9. 0-1、完全与多重背包的选择次数限制分别是什么？

单调队列还能把某些多重背包实现优化到 $O(n\cdot capacity)$，但需要按重量余数拆分转移并维护滑动窗口最大值，不属于本篇基础版本。

## 下一篇

下一篇 [动态规划：状态机 DP](../CATALOG.md#07-动态规划) 会在同一输入位置保留若干种互斥状态，并根据允许的状态变化建立转移。
