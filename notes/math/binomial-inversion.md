# 二项式反演

> 最近修订：2026-08-23 06:24 +10:00（未审阅）

有些计数问题容易算出“先任选一部分有标号元素，再在选中部分建立一个结构”的总数，
真正想要的却是恰好使用全部元素的结构数量。

若选出 $k$ 个元素有 $\binom nk$ 种方法，这类关系通常形如：

$$
g_n=\sum_{k=0}^{n}\binom nk f_k.
$$

二项式反演可以从全部 $g_0,g_1,\ldots,g_n$ 恢复 $f_n$。本文用它统计 $n$ 个有标号
点组成的简单无向图中，没有孤立点的图有多少张。

## 从核心结构扩展出全部结构

设 $f_k$ 表示在指定的 $k$ 个有标号点上，没有孤立点的简单无向图数量。

现在考虑任意一张 $n$ 个点的简单无向图。把所有度数大于 `0` 的点取出来，设一共有
$k$ 个：

1. 从 $n$ 个点中选择这 $k$ 个非孤立点，有 $\binom nk$ 种方法；
2. 它们诱导出的图没有孤立点，有 $f_k$ 种；
3. 剩下 $n-k$ 个点全部是孤立点，不能再连接任何边。

每张图都拥有唯一的非孤立点集合，因此不会重复计数。于是任意图的总数满足：

$$
g_n=\sum_{k=0}^{n}\binom nk f_k.
$$

另一方面，$n$ 个点之间一共有 $\binom n2$ 对可能的边，每条边独立选择存在或不存在：

$$
g_n=2^{\binom n2}.
$$

我们已经知道 $g_n$，现在需要把上面的求和关系反过来。

## 二项式反演公式

若：

$$
g_n=\sum_{k=0}^{n}\binom nk f_k,
$$

则：

$$
\boxed{
f_n=\sum_{k=0}^{n}(-1)^{n-k}\binom nk g_k
}
$$

正向变换为所有项取正号；逆变换按照 $n-k$ 的奇偶交替加减。

对前几个位置展开：

$$
\begin{aligned}
g_0&=f_0,\\
g_1&=f_0+f_1,\\
g_2&=f_0+2f_1+f_2.
\end{aligned}
$$

因此：

$$
f_2=g_2-2g_1+g_0,
$$

与反演公式完全一致。

## 为什么反演后只剩下目标项

把 $g_k$ 的定义代入逆变换：

$$
\sum_{k=0}^{n}(-1)^{n-k}\binom nk
\sum_{j=0}^{k}\binom kj f_j.
$$

交换求和顺序，固定一个 $f_j$。它的系数为：

$$
\sum_{k=j}^{n}
(-1)^{n-k}\binom nk\binom kj.
$$

先选出 $j$ 个元素，再补到 $k$ 个，与先选 $k$ 个再从中选 $j$ 个等价，因此：

$$
\binom nk\binom kj
=
\binom nj\binom{n-j}{k-j}.
$$

令 $r=k-j$，系数变成：

$$
\binom nj
\sum_{r=0}^{n-j}
(-1)^{n-j-r}\binom{n-j}{r}
=
\binom nj(1-1)^{n-j}.
$$

- 当 $j<n$ 时，系数为 `0`，所有较小规模的 $f_j$ 全部抵消；
- 当 $j=n$ 时，系数为 `1`，只留下 $f_n$。

这解释了交替符号怎样准确撤销“任选子集”造成的混合。

## 没有孤立点的图

把 $g_k=2^{\binom k2}$ 代入反演公式：

$$
f_n
=
\sum_{k=0}^{n}
(-1)^{n-k}
\binom nk
2^{\binom k2}.
$$

例如 $n=3$：

$$
f_3
=-1+3-6+8
=4.
$$

这四张图分别是一个三角形，以及选择三个点中的任意一个作为中点得到的三条两边
路径。

这个公式也可以从“排除孤立点”的普通容斥直接得到。二项式反演更强调另一层结构：
当某个“任意结构”能唯一拆成“选出有效元素 + 在其上建立满载结构”时，整个序列都
形成同一种二项式变换。

## 预处理组合数

答案对质数 `MOD = 1e9 + 7` 取模，并保证 `n < MOD`。预处理阶乘与逆阶乘后：

```cpp
ll combination(int n, int k) {
    return factorial[n] * inverse_factorial[k] % MOD *
           inverse_factorial[n - k] % MOD;
}
```

不需要为每个 $k$ 单独快速幂计算 $2^{\binom k2}$。相邻两项满足：

$$
2^{\binom{k+1}{2}}
=
2^{\binom k2}\cdot 2^k.
$$

同时维护 `graph_count = 2^(k choose 2)` 和 `power_of_two = 2^k`，每步常数时间更新。

## 完整代码

输入 `n`，输出 $n$ 个有标号点的简单无向图中，没有孤立点的图数量模
$10^9+7$。保证 `0 <= n < MOD`，并且 `n` 足以放入内存。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1e9 + 7;

int n;
vector<ll> factorial;
vector<ll> inverse_factorial;

ll mod_pow(ll base, ll exponent) {
    ll result = 1;
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = result * base % MOD;
        }
        base = base * base % MOD;
        exponent /= 2;
    }
    return result;
}

void prepare_factorials() {
    factorial.assign(n + 5, 1);
    inverse_factorial.assign(n + 5, 1);

    for (int i = 1; i <= n; ++i) {
        factorial[i] = factorial[i - 1] * i % MOD;
    }

    inverse_factorial[n] = mod_pow(factorial[n], MOD - 2);
    for (int i = n; i >= 1; --i) {
        inverse_factorial[i - 1] = inverse_factorial[i] * i % MOD;
    }
}

ll combination(int total, int selected) {
    if (selected < 0 || selected > total) {
        return 0;
    }
    return factorial[total] * inverse_factorial[selected] % MOD *
           inverse_factorial[total - selected] % MOD;
}

ll count_graphs_without_isolated_vertices() {
    ll answer = 0;
    ll graph_count = 1;
    ll power_of_two = 1;

    for (int k = 0; k <= n; ++k) {
        ll term = combination(n, k) * graph_count % MOD;
        if ((n - k) % 2 == 0) {
            answer = (answer + term) % MOD;
        } else {
            answer = (answer - term + MOD) % MOD;
        }

        graph_count = graph_count * power_of_two % MOD;
        power_of_two = power_of_two * 2 % MOD;
    }
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n;
    prepare_factorials();
    cout << count_graphs_without_isolated_vertices() << '\n';
    return 0;
}
```

## 复杂度

阶乘、逆阶乘与主求和都只线性扫描 `0..n`：

- 时间复杂度为 $O(n+\log MOD)$；
- 空间复杂度为 $O(n)$。

其中一次快速幂用于求 `factorial[n]` 的模逆元。

## 怎样识别二项式反演

重点不是看见组合数就背公式，而是寻找下面的唯一分解：

1. 一个任意结构拥有一组唯一确定的“真正参与元素”；
2. 先从 $n$ 个有标号元素中选出其中 $k$ 个，产生 $\binom nk$；
3. 选中元素上的结构数量只依赖 $k$，记作 $f_k$；
4. 未选元素没有额外选择。

这时容易计算的总量 $g_n$ 会混合所有较小的 $f_k$，二项式反演负责恢复“全部元素都
真正参与”的 $f_n$。

若选择不同子集后还有依赖具体元素编号的权值，或未选元素仍有多种状态，关系未必是
普通二项式变换，不能只因为出现 $\binom nk$ 就直接套用。

## 常见错误

- 把逆变换符号写成 $(-1)^k$，却没有同时调整下标；
- 正向关系并不是 $g_n=\sum\binom nkf_k$，仍直接反演；
- 忘记 $k=0$ 项；空图为这个计数关系提供必要的边界；
- 把 $2^{\binom k2}$ 写成 $2^k$；
- 把有标号图误当成同构意义下的不标号图；
- 组合数取模时直接做整数除法；
- 使用阶乘逆元，却没有保证 `n < MOD`；
- 更新 `graph_count` 与 `power_of_two` 的先后顺序错误。

## 需要记住什么

- 二项式变换和逆变换分别是什么？
- 为什么逆变换的符号由 $n-k$ 的奇偶决定？
- 证明中怎样用 $\binom nk\binom kj=\binom nj\binom{n-j}{k-j}$ 完成抵消？
- 任意有标号图怎样唯一拆成非孤立点集合及其诱导图？
- 为什么 $k$ 个点的简单无向图数量是 $2^{\binom k2}$？
- 怎样从相邻项递推 $2^{\binom k2}$？
