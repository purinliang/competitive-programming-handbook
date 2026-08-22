# 拉格朗日插值

> 最近修订：2026-08-23 06:37 +10:00（未审阅）

一个次数不超过 $k$ 的多项式由 $k+1$ 个不同位置的函数值唯一确定。即使不知道它的
各项系数，只要知道：

$$
P(x_0)=y_0,
P(x_1)=y_1,
\ldots,
P(x_k)=y_k,
$$

就能直接计算它在其他位置的值。

拉格朗日插值为每个已知点构造一个“只在这里为 `1`，在其他已知点都为 `0`”的基
多项式，再用 $y_i$ 加权组合。本文先推导一般公式，随后解决竞赛中常见的问题：已知
$P(0),P(1),\ldots,P(k)$，在线性时间求一个很大位置 $x$ 上的 $P(x)$。

## 为什么需要 k+1 个点

若两个次数都不超过 $k$ 的多项式在 $k+1$ 个不同位置取值相同，它们的差：

$$
Q(x)=P_1(x)-P_2(x)
$$

次数也不超过 $k$，却拥有 $k+1$ 个不同的根。非零的 $k$ 次多项式最多只有 $k$ 个
不同根，因此 $Q(x)$ 只能恒等于 `0`，两个多项式完全相同。

所以 $k+1$ 个不同点不仅足够，而且会唯一确定答案。点数更少时，仍能加入一个经过
所有已知点的非零高次项，结果不唯一。

## 为一个已知点构造开关

固定下标 `i`，希望构造 $L_i(x)$：

$$
L_i(x_i)=1,
\qquad
L_i(x_j)=0\quad(j\ne i).
$$

要让它在所有其他已知位置为 `0`，分子放入对应因子：

$$
\prod_{j\ne i}(x-x_j).
$$

当 $x=x_i$ 时，这个乘积一般不等于 `1`。再除以它在 $x_i$ 处的值，就得到：

$$
L_i(x)
=
\prod_{j\ne i}
\frac{x-x_j}{x_i-x_j}.
$$

现在：

- 代入 $x_j$、$j\ne i$ 时，分子含有一个 `0`；
- 代入 $x_i$ 时，每个分子与分母相同，乘积为 `1`。

## 拉格朗日插值公式

用已知值加权所有开关：

$$
\boxed{
P(x)
=
\sum_{i=0}^{k}
y_i
\prod_{j\ne i}
\frac{x-x_j}{x_i-x_j}
}
$$

代入任意已知位置 $x_t$ 时，只有 $L_t(x_t)=1$，其他基多项式都为 `0`，所以结果
恰好是 $y_t$。右侧次数不超过 $k$，结合唯一性，它就是原多项式。

在模质数下，除法用模逆元完成。所有 $x_i$ 必须在模意义下两两不同，否则某个
$x_i-x_j=0$，分母没有逆元，而且同一个位置也不能提供两条独立信息。

## 连续位置让分母变成阶乘

现在已知位置固定为：

$$
x_i=i,
\qquad 0\le i\le k.
$$

第 `i` 项分母为：

$$
\prod_{j\ne i}(i-j).
$$

把 `i` 左右两部分拆开：

$$
\begin{aligned}
\prod_{j=0}^{i-1}(i-j)&=i!,\\
\prod_{j=i+1}^{k}(i-j)&=(-1)^{k-i}(k-i)!.
\end{aligned}
$$

因此：

$$
\prod_{j\ne i}(i-j)
=
i!\,(k-i)!\,(-1)^{k-i}.
$$

预处理阶乘和逆阶乘后，每个分母都能 $O(1)$ 取得。

## 前后缀积计算分子

第 `i` 项的分子为：

$$
\prod_{j\ne i}(x-j).
$$

若对每个 `i` 都重新枚举 `j`，总时间是 $O(k^2)$。建立：

$$
prefix_i=\prod_{j=0}^{i-1}(x-j),
$$

以及：

$$
suffix_i=\prod_{j=i}^{k}(x-j).
$$

那么排除 `i` 后的乘积就是：

$$
prefix_i\cdot suffix_{i+1}.
$$

前缀、后缀各扫描一次，所有分子就能在线性时间得到。

## 模意义下的大位置

本文在质数模数 `MOD` 形成的有限域中计算。输入位置 `x` 可以很大，先令：

```cpp
x %= MOD;
```

多项式系数、加法和乘法都在模 `MOD` 下，因此 $P(x)\bmod MOD$ 只依赖 `x mod MOD`。

若归一化后的 `x` 恰好位于 `0..k`，直接返回已经给出的 `value[x]`。这也避免后续公式
中大量分子同时变成 `0`。

> 必须保证 `k < MOD`。否则连续位置中会有两个编号模 `MOD` 后相同，阶乘也会包含
> 因子 `MOD`，普通插值条件不再成立。

## 完整代码

输入次数上界 `k`、查询位置 `x`，以及 `P(0)..P(k)` 在模 $10^9+7$ 下的值。输出
$P(x)`。保证 `0 <= k < MOD`，`0 <= x <= 10^18`。

数组下标 `i` 在这里直接表示数学位置 $i$，所以 `value[0]` 保存的是有实际意义的
$P(0)$，不是预留空位。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1e9 + 7;

int k;
ll x;
vector<ll> value;
vector<ll> factorial;
vector<ll> inverse_factorial;
vector<ll> prefix_product;
vector<ll> suffix_product;

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
    factorial.assign(k + 5, 1);
    inverse_factorial.assign(k + 5, 1);

    for (int i = 1; i <= k; ++i) {
        factorial[i] = factorial[i - 1] * i % MOD;
    }

    inverse_factorial[k] = mod_pow(factorial[k], MOD - 2);
    for (int i = k; i >= 1; --i) {
        inverse_factorial[i - 1] = inverse_factorial[i] * i % MOD;
    }
}

ll evaluate() {
    ll position = x % MOD;
    if (position <= k) {
        return value[position];
    }

    prefix_product.assign(k + 2, 1);
    suffix_product.assign(k + 2, 1);

    for (int i = 0; i <= k; ++i) {
        prefix_product[i + 1] = prefix_product[i] * (position - i + MOD) % MOD;
    }
    for (int i = k; i >= 0; --i) {
        suffix_product[i] = suffix_product[i + 1] * (position - i + MOD) % MOD;
    }

    ll answer = 0;
    for (int i = 0; i <= k; ++i) {
        ll numerator = prefix_product[i] * suffix_product[i + 1] % MOD;
        ll term = value[i] * numerator % MOD * inverse_factorial[i] % MOD *
                  inverse_factorial[k - i] % MOD;

        if ((k - i) % 2 == 0) {
            answer = (answer + term) % MOD;
        } else {
            answer = (answer - term + MOD) % MOD;
        }
    }
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> k >> x;
    value.resize(k + 1);
    for (ll& y : value) {
        cin >> y;
    }

    prepare_factorials();
    cout << evaluate() << '\n';
    return 0;
}
```

## 复杂度

阶乘、前缀积、后缀积和最终求和都只扫描 `0..k`：

- 预处理与单次求值的时间复杂度为 $O(k+\log MOD)$；
- 空间复杂度为 $O(k)$。

其中一次 $O(\log MOD)$ 快速幂用于求 `k!` 的模逆元。若已知点不是连续位置，直接
使用一般公式通常需要 $O(k^2)$ 预处理分母；处理多次查询时还可以进一步预处理权值。

## 常见错误

- 只有 $k$ 个点，却声称唯一确定一个 $k$ 次多项式；
- 已知位置在模意义下重复，仍然对零分母求逆；
- 连续位置分母漏掉 $(-1)^{k-i}$；
- 分子没有排除当前因子 `(x - i)`；
- 前缀与后缀数组的边界少开一个位置；
- 查询位置已经是某个已知点时处理错误；
- 使用阶乘逆元，却没有保证 `k < MOD`；
- 把“根据若干点恢复低次多项式”误解成可以预测任意序列；
- 对浮点坐标套用模运算版本。

## 需要记住什么

- 为什么 $k+1$ 个不同点唯一确定次数不超过 $k$ 的多项式？
- 基多项式 $L_i(x)$ 怎样做到只在 $x_i$ 处为 `1`？
- 一般拉格朗日插值公式是什么？
- 已知位置为 `0..k` 时，分母为什么化成两个阶乘和一个符号？
- 怎样用前后缀积一次求出所有“排除当前点”的分子？
- 为什么模质数版本要求已知位置互不相同且 `k < MOD`？
