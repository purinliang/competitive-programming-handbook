# 容斥原理

> 最近修订：2026-08-17 07:13 +10:00（未审阅）

多个条件可能同时成立。把每个条件的数量直接相加，会让同时满足多个条件的对象
被重复计数。

容斥原理按照交集层数交替加减：

```text
先加单个集合
再减两两交集
再加三个集合的交集
继续交替
```

它不是背诵符号的技巧，而是在修复“每个对象最终应当恰好计数一次”。

## 两个集合

要计算 $A\cup B$ 的元素数量，先加：

$$
|A|+|B|.
$$

同时属于 $A$ 和 $B$ 的元素被算了两次，因此减去一次交集：

$$
|A\cup B|
=|A|+|B|-|A\cap B|.
$$

交集元素原来贡献 `2`，减去一次后贡献 `1`；只属于其中一个集合的元素仍贡献
`1`。

## 三个集合

先加三个集合，再减全部两两交集：

$$
|A|+|B|+|C|
-|A\cap B|-|A\cap C|-|B\cap C|.
$$

同时属于三个集合的元素：

- 在单集合中被加了 `3` 次；
- 在两两交集中被减了 `3` 次；
- 当前总贡献变成 `0`。

因此还要加回三者交集一次：

$$
|A\cup B\cup C|
=|A|+|B|+|C|
-|A\cap B|-|A\cap C|-|B\cap C|
+|A\cap B\cap C|.
$$

## 一般公式

对 $k$ 个集合 $A_1,\ldots,A_k$，枚举非空下标子集 $S$：

$$
\left|\bigcup_{i=1}^{k}A_i\right|
=
\sum_{\varnothing\ne S\subseteq\{1,\ldots,k\}}
(-1)^{|S|+1}
\left|\bigcap_{i\in S}A_i\right|.
$$

选中集合数为奇数时加，偶数时减。

对一个恰好属于 $t$ 个集合的对象，它在公式中的总贡献是：

$$
\binom{t}{1}
-\binom{t}{2}
+\binom{t}{3}
-\cdots
(-1)^{t+1}\binom{t}{t}
=1.
$$

所以属于至少一个集合的对象最终恰好保留一次，不属于任何集合的对象从未出现。

## 问题：至少能被一个数整除

给定正整数 `a[1..k]`，统计 `1..n` 中至少能被其中一个数整除的整数。

定义集合：

$$
A_i=\{x\mid1\le x\le n,\ a[i]\mid x\}.
$$

单个集合大小：

$$
|A_i|=\left\lfloor\frac{n}{a[i]}\right\rfloor.
$$

同时能被若干个数整除，等价于能被它们的最小公倍数整除：

$$
\left|\bigcap_{i\in S}A_i\right|
=
\left\lfloor
\frac{n}{\mathrm{lcm}\{a_i\mid i\in S\}}
\right\rfloor.
$$

因此每个非空子集只需计算所选数的 LCM，再按子集大小奇偶加减。

## 用位掩码枚举集合子集

`mask` 第 `i-1` 位表示是否选择集合 $A_i$：

```cpp
for (int mask = 1; mask < (1 << k); mask++) {
    // 计算当前交集
}
```

从 `1` 开始，排除空集。统计选中集合数量：

```cpp
int selected = __builtin_popcount(mask);
```

若 `selected` 为奇数，加交集大小；否则减：

```cpp
if (selected % 2 == 1) {
    answer += intersection_size;
} else {
    answer -= intersection_size;
}
```

## 安全计算 LCM

逐个合并：

$$
\mathrm{lcm}(x,y)
=\frac{x}{\gcd(x,y)}y.
$$

先除后乘能降低溢出风险，但乘积仍可能超过 64 位。这个问题中只关心 LCM 是否
不超过 `n`；一旦超过 `n`，交集大小就是 `0`。

令：

```cpp
ll factor = a[i] / gcd(current_lcm, a[i]);
```

若：

```cpp
current_lcm > n / factor
```

说明乘积会超过 `n`，无需真的相乘，可以直接把当前交集视为 `0`。这种先除法
比较的写法同时避免了乘法溢出，不需要更宽整数类型。

## 完整代码

保证 `1 <= k <= 20`、`a[i] > 0`，统计 `1..n` 中至少能被一个 `a[i]`
整除的整数数量。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

int k;
ll n;
vector<ll> a;

ll count_divisible() {
    ll answer = 0;
    int total_masks = 1 << k;

    for (int mask = 1; mask < total_masks; mask++) {
        ll current_lcm = 1;
        bool exceeds_n = false;

        for (int i = 1; i <= k; i++) {
            if ((mask & (1 << (i - 1))) == 0) {
                continue;
            }

            ll divisor = gcd(current_lcm, a[i]);
            ll factor = a[i] / divisor;

            if (current_lcm > n / factor) {
                exceeds_n = true;
                break;
            }
            current_lcm *= factor;
        }

        if (exceeds_n) {
            continue;
        }

        ll intersection_size = n / current_lcm;
        int selected = __builtin_popcount(mask);

        if (selected % 2 == 1) {
            answer += intersection_size;
        } else {
            answer -= intersection_size;
        }
    }
    return answer;
}

void solve() {
    cin >> n >> k;

    a.assign(k + 5, 0);
    for (int i = 1; i <= k; i++) {
        cin >> a[i];
    }

    cout << count_divisible() << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 复杂度

共有 $2^k-1$ 个非空子集，每个子集最多扫描 $k$ 个数：

- 时间复杂度：$O(k2^k\log n)$，其中 GCD 带来对数因子；
- 空间复杂度：$O(k)$。

因此容斥适合条件数量 `k` 较小、对象范围 `n` 很大的情况。若 `k` 很大，完整
枚举集合子集本身就不可行。

## 常见错误

- 只加各集合大小，没有减去重复交集；
- 两两交集减完后忘记加回三重交集；
- 奇数个集合的交集写成减，偶数写成加；
- 把多个整除条件的交集写成 GCD，而不是 LCM；
- 从 `mask = 0` 开始，把空集交集错误计入；
- 直接计算很大的 LCM，发生 64 位乘法溢出；
- 条件数量很大仍枚举全部 $2^k$ 子集。

## 需要记住什么

- 两集合和三集合容斥分别怎样修复重复计数？
- 一般公式为什么按交集集合数奇加偶减？
- 多个整除条件的交集为什么由 LCM 描述？
- 怎样在不使用更宽整数的情况下判断 LCM 已经超过 `n`？
- 容斥适合“条件少、对象范围大”的原因是什么？
