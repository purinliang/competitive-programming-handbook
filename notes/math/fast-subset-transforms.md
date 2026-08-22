# FWT 与 FMT

> 最近修订：2026-08-23 06:46 +10:00（未审阅）

普通卷积按照下标加法合并两项：

$$
c_k=\sum_{i+j=k}a_i b_j.
$$

当下标是位掩码时，问题可能改为按照按位或、按位与或按位异或合并：

$$
\begin{aligned}
c_k^{\mathrm{OR}}&=\sum_{i\mathbin{|}j=k}a_i b_j,\\
c_k^{\mathrm{AND}}&=\sum_{i\mathbin{\&}j=k}a_i b_j,\\
c_k^{\mathrm{XOR}}&=\sum_{i\mathbin{\oplus}j=k}a_i b_j.
\end{aligned}
$$

直接枚举 $(i,j)$ 需要 $O(4^n)$ 时间。快速莫比乌斯变换 FMT 用子集或超集求和
处理 OR、AND 卷积；快速沃尔什变换 FWT 用另一种蝶形变换处理 XOR 卷积。三者都
遵循同一个框架：

```text
正变换 → 逐点相乘 → 逆变换
```

本文统一在长度 $2^n$ 的数组上推导三种卷积，并给出模质数下的完整实现。

## 位掩码下标表示集合

用 `n` 个二进制位表示一个集合。掩码 `mask` 的第 `bit` 位为 `1`，表示集合含有该
元素。

长度必须是：

$$
N=2^n.
$$

这里下标 `0` 表示空集，具有实际数学含义，因此数组自然使用 `0..N-1`，不是为
`1-based` 规则预留空位。

按位或对应集合并集，按位与对应交集，按位异或对应两个集合中恰好出现一次的元素。

## 子集和变换

给定数组 $a$，定义子集和：

$$
\widehat a_S=\sum_{T\subseteq S}a_T.
$$

直接为每个 $S$ 枚举所有子集，总状态数是 $3^n$。更快的方法依次决定每一位是否允许
从 `1` 变成 `0`。

处理第 `bit` 位时，对所有含有该位的 `mask`：

```cpp
a[mask] += a[mask ^ (1 << bit)];
```

处理完前 `t` 位后，`a[mask]` 已经汇总了只在这 `t` 位上删去元素得到的所有子集。
依次处理全部 `n` 位，就得到完整子集和。

总共 `n` 轮，每轮扫描 $2^n$ 个状态，时间复杂度为 $O(n2^n)$。

## 莫比乌斯逆变换

正变换中每一步执行：

```text
较大集合 += 较小集合
```

要恢复原数组，只需按照相同位序执行相反操作：

```text
较大集合 -= 较小集合
```

这就是布尔子集格上的莫比乌斯反演。竞赛资料常把快速子集和及其逆变换一起称为
FMT；更细致地说，正向是快速 zeta 变换，反向才使用莫比乌斯系数。

## OR 卷积为什么变成逐点乘法

设：

$$
c_S=\sum_{A\cup B=S}a_A b_B.
$$

对 $c$ 做子集和变换：

$$
\begin{aligned}
\widehat c_S
&=\sum_{T\subseteq S}c_T\\
&=\sum_{A\cup B\subseteq S}a_A b_B\\
&=\left(\sum_{A\subseteq S}a_A\right)
  \left(\sum_{B\subseteq S}b_B\right)\\
&=\widehat a_S\widehat b_S.
\end{aligned}
$$

“并集恰好等于 $T$，再枚举 $T\subseteq S$”合并成了“$A$、$B$ 都是 $S$ 的
子集”，两个选择彼此独立，所以乘积成立。

因此 OR 卷积的算法是：

1. 对 `a`、`b` 做子集和变换；
2. 对每个掩码逐点相乘；
3. 做莫比乌斯逆变换。

## AND 卷积使用超集和

按位与的结果只会删除已有的 `1`。定义超集和：

$$
\widehat a_S=\sum_{T\supseteq S}a_T.
$$

处理第 `bit` 位时，对所有不含该位的 `mask`：

```cpp
a[mask] += a[mask | (1 << bit)];
```

它把“补上这一位”得到的超集贡献加回来。用与 OR 完全对偶的推导可得：

$$
\widehat c_S=\widehat a_S\widehat b_S,
\qquad
c_S=\sum_{A\cap B=S}a_A b_B.
$$

逆变换仍把加法改成减法。

## XOR 需要不同的蝶形

异或没有“一个集合包含另一个集合”的单调关系，子集和不能把 XOR 卷积对角化。

先只看一个二进制位。数组被分成下标该位为 `0` 和为 `1` 的两部分，设对应值为
`x,y`。FWT 执行：

$$
(x,y)\longmapsto(x+y,x-y).
$$

对每一位都进行同样的蝶形操作。变换后的每个位置记录不同正负号组合下的加权和；
异或会让这些符号相乘，因此 XOR 卷积同样变成逐点乘法。

这个二元变换连续执行两次：

$$
(x,y)
\longmapsto
(x+y,x-y)
\longmapsto
(2x,2y).
$$

处理 `n` 位后，连续两次完整变换会把每个数乘以 $2^n=N$。所以逆变换再次执行相同
蝶形，再把所有元素乘以 $N^{-1}$。

## 三种变换的统一结构

| 卷积 | 正变换汇总方向 | 单步操作 | 逆变换 |
| --- | --- | --- | --- |
| OR | 子集到超集 | `upper += lower` | `upper -= lower` |
| AND | 超集到子集 | `lower += upper` | `lower -= upper` |
| XOR | 成对混合 | `(x+y, x-y)` | 再做一次并除以 $N$ |

OR 与 AND 属于子集格上的 zeta/Mobius 变换；XOR 属于 Walsh-Hadamard 变换。它们
代码形态相似，但依据不同，不应把 XOR 的减法蝶形误塞进子集和证明。

## 完整代码

输入位数 `n` 和操作名 `OR`、`AND` 或 `XOR`，再输入两个长度为 $2^n$ 的数组。
输出对应卷积对 $10^9+7$ 取模的结果。输入值可以为负数。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1e9 + 7;

int n;
int state_count;
string operation;
vector<ll> a;
vector<ll> b;

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

void transform_or(vector<ll>& value, bool inverse) {
    for (int bit = 0; bit < n; ++bit) {
        for (int mask = 0; mask < state_count; ++mask) {
            if ((mask & (1 << bit)) == 0) {
                continue;
            }

            int lower = mask ^ (1 << bit);
            if (!inverse) {
                value[mask] = (value[mask] + value[lower]) % MOD;
            } else {
                value[mask] = (value[mask] - value[lower] + MOD) % MOD;
            }
        }
    }
}

void transform_and(vector<ll>& value, bool inverse) {
    for (int bit = 0; bit < n; ++bit) {
        for (int mask = 0; mask < state_count; ++mask) {
            if ((mask & (1 << bit)) != 0) {
                continue;
            }

            int upper = mask | (1 << bit);
            if (!inverse) {
                value[mask] = (value[mask] + value[upper]) % MOD;
            } else {
                value[mask] = (value[mask] - value[upper] + MOD) % MOD;
            }
        }
    }
}

void transform_xor(vector<ll>& value, bool inverse) {
    for (int bit = 0; bit < n; ++bit) {
        for (int mask = 0; mask < state_count; ++mask) {
            if ((mask & (1 << bit)) != 0) {
                continue;
            }

            int upper = mask | (1 << bit);
            ll x = value[mask];
            ll y = value[upper];
            value[mask] = (x + y) % MOD;
            value[upper] = (x - y + MOD) % MOD;
        }
    }

    if (inverse) {
        ll inverse_size = mod_pow(state_count, MOD - 2);
        for (ll& x : value) {
            x = x * inverse_size % MOD;
        }
    }
}

void transform(vector<ll>& value, bool inverse) {
    if (operation == "OR") {
        transform_or(value, inverse);
    } else if (operation == "AND") {
        transform_and(value, inverse);
    } else {
        transform_xor(value, inverse);
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> operation;
    state_count = 1 << n;
    a.resize(state_count);
    b.resize(state_count);

    for (ll& x : a) {
        cin >> x;
        x = (x % MOD + MOD) % MOD;
    }
    for (ll& x : b) {
        cin >> x;
        x = (x % MOD + MOD) % MOD;
    }

    transform(a, false);
    transform(b, false);
    for (int mask = 0; mask < state_count; ++mask) {
        a[mask] = a[mask] * b[mask] % MOD;
    }
    transform(a, true);

    for (int mask = 0; mask < state_count; ++mask) {
        if (mask > 0) {
            cout << ' ';
        }
        cout << a[mask];
    }
    cout << '\n';
    return 0;
}
```

## 复杂度

每次变换进行 `n` 轮，每轮扫描 $2^n$ 个掩码。两次正变换、一次逆变换和一次逐点
乘法的总复杂度为：

- 时间复杂度 $O(n2^n)$；
- 空间复杂度 $O(2^n)$，输出直接复用数组 `a`。

XOR 逆变换需要 $N=2^n$ 在模 `MOD` 下可逆。本文模数是奇质数且 `N < MOD`，满足
要求。

## 常见错误

- 数组长度不是 $2^n$；
- OR 变换对不含当前位的掩码做更新，方向写反；
- AND 变换仍然使用子集和，而不是超集和；
- 逆 FMT 继续做加法，没有改成减法；
- XOR 卷积误用 OR 的子集和变换；
- XOR 逆变换忘记除以数组长度 $N$；
- 蝶形中先覆盖 `value[mask]`，再拿新值计算另一半；
- 输入负数后没有归一化到 `0..MOD-1`；
- 把 FMT 与普通多项式乘法的 FFT、NTT 混为一谈。

## 需要记住什么

- OR、AND、XOR 卷积分别怎样定义？
- 子集和变换为什么只需逐位执行 `upper += lower`？
- 莫比乌斯逆变换为什么把同一步改成减法即可？
- OR 卷积经过子集和变换后为什么变成逐点乘法？
- AND 卷积为什么使用超集和？
- XOR 蝶形 `(x+y,x-y)` 连续执行两次会发生什么？
- 为什么 XOR 逆变换最后要除以 $2^n$？
