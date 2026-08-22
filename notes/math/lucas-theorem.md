# 卢卡斯定理

> 最近修订：2026-08-23 06:05 +10:00（未审阅）

质数模数 $p$ 很小，但组合数的参数 $n$、$k$ 可能大到无法预处理 $n!$。我们仍想计算：

$$
\binom nk\bmod p.
$$

阶乘与逆元预处理只能覆盖小于预处理上限的参数，而且当 $n\ge p$ 时，$n!$ 中已经含有
因子 $p$，不能把整个阶乘当成模 $p$ 可逆数。

卢卡斯定理把大组合数按 $p$ 进制逐位拆开，只需计算若干个参数小于 $p$ 的小组合数。

## 把参数写成 p 进制

把 $n$、$k$ 写成 $p$ 进制：

$$
n=n_0+n_1p+n_2p^2+\cdots,
$$

$$
k=k_0+k_1p+k_2p^2+\cdots,
$$

其中每个数位都位于 $[0,p-1]$。

卢卡斯定理给出：

$$
\binom nk\equiv
\prod_{i\ge0}\binom{n_i}{k_i}\pmod p.
$$

若某一位出现 $k_i>n_i$，对应小组合数为 $0$，整个答案也为 $0$。

## 为什么会逐位分解

对质数 $p$，二项式系数 $\binom pi$ 在 $1\le i<p$ 时都含有因子 $p$，所以：

$$
(1+x)^p\equiv1+x^p\pmod p.
$$

进一步有：

$$
(1+x)^{p^i}\equiv1+x^{p^i}\pmod p.
$$

利用 $n$ 的 $p$ 进制展开：

$$
\begin{aligned}
(1+x)^n
&=\prod_{i\ge0}(1+x)^{n_ip^i}\\
&\equiv\prod_{i\ge0}(1+x^{p^i})^{n_i}\pmod p.
\end{aligned}
$$

在右侧选出 $x^k$，必须从第 $i$ 组中选择 $k_i$ 个 $x^{p^i}$，贡献
$\binom{n_i}{k_i}$。把各位贡献相乘，就得到卢卡斯定理。

这个推导也解释了为什么定理要求 $p$ 是质数：中间二项式系数被 $p$ 整除是关键一步。

## 计算小组合数

每一位都有 $0\le n_i,k_i<p$。因此只需预处理：

```text
0!, 1!, ..., (p - 1)!
```

及其逆元。

小组合数为：

$$
\binom ab=a!\,(b!)^{-1}\,((a-b)!)^{-1}\pmod p.
$$

因为 $a<p$，这些阶乘都不含因子 $p$，在模 $p$ 下存在逆元。

## 逐位循环

每轮取出最低位：

```cpp
ll digit_n = n % p;
ll digit_k = k % p;
```

若 `digit_k > digit_n`，立即返回 $0$；否则乘上这一位的小组合数。随后：

```cpp
n /= p;
k /= p;
```

直到两个数都变成 $0$。

## 正确性直觉

每轮循环恰好取出 $n$、$k$ 的一对 $p$ 进制数位。卢卡斯定理说明大组合数模 $p$ 的
余数等于全部数位组合数之积，因此循环维护的 `answer` 始终是已经处理数位的贡献。

若某位 $k_i>n_i$，右侧乘积包含 $\binom{n_i}{k_i}=0$；提前返回不会漏掉非零答案。
全部数位处理结束后，`answer` 就是定理右侧完整乘积。

## 完整代码

输入一个适合 $O(p)$ 预处理的质数 $p$ 和询问数 $q$，随后每次输入非负整数 $n$、$k$，
输出 $\binom nk\bmod p$。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct LucasCombination {
    int p;
    vector<ll> factorial;
    vector<ll> inverse_factorial;

    LucasCombination(int prime)
        : p(prime), factorial(p + 5, 1), inverse_factorial(p + 5, 1) {
        for (int i = 1; i < p; ++i) {
            factorial[i] = factorial[i - 1] * i % p;
        }

        inverse_factorial[p - 1] = mod_pow(factorial[p - 1], p - 2);
        for (int i = p - 1; i >= 1; --i) {
            inverse_factorial[i - 1] = inverse_factorial[i] * i % p;
        }
    }

    ll mod_pow(ll base, ll exponent) const {
        ll result = 1 % p;
        base %= p;

        while (exponent > 0) {
            if (exponent % 2 == 1) {
                result = result * base % p;
            }
            base = base * base % p;
            exponent /= 2;
        }
        return result;
    }

    ll small_combination(int n, int k) const {
        if (k < 0 || k > n) {
            return 0;
        }
        return factorial[n] * inverse_factorial[k] % p *
               inverse_factorial[n - k] % p;
    }

    ll combination(ll n, ll k) const {
        if (k < 0 || k > n) {
            return 0;
        }

        ll answer = 1;
        while (n > 0 || k > 0) {
            int digit_n = n % p;
            int digit_k = k % p;
            if (digit_k > digit_n) {
                return 0;
            }

            answer = answer * small_combination(digit_n, digit_k) % p;
            n /= p;
            k /= p;
        }
        return answer;
    }
};

int main() {
    int p, q;
    scanf("%d%d", &p, &q);

    LucasCombination lucas(p);
    while (q--) {
        ll n, k;
        scanf("%lld%lld", &n, &k);
        printf("%lld\n", lucas.combination(n, k));
    }
    return 0;
}
```

## 复杂度

预处理阶乘和逆阶乘需要 $O(p)$ 时间与 $O(p)$ 空间。每次循环让 $n$、$k$ 除以 $p$，
单次询问的时间复杂度为 $O(\log_p n)$。

因此基础实现适合模数是较小质数、而 $n$ 很大的情形。若 $p$ 本身大到无法分配
$O(p)$ 空间，卢卡斯定理虽然仍成立，小组合数也必须改用其他方法计算。

合数模数下，阶乘中的质因数不再都可逆。需要先按质数幂分别计算，再用中国剩余定理
合并，这正是扩展卢卡斯算法要解决的问题。

## 常见错误

- 模数不是质数，仍直接套用卢卡斯定理；
- 预处理到 `n`，失去卢卡斯只需预处理到 `p - 1` 的意义；
- 某一位 `digit_k > digit_n` 时仍继续相乘；
- 只处理到 `n == 0`，没有同时考虑 `k` 的剩余高位；
- 忘记 $\binom n0=1$，使 `k = 0` 的询问出错；
- 质数 $p$ 太大时仍尝试建立长度 $p$ 的数组；
- 把卢卡斯定理与适用于合数模数的扩展卢卡斯算法当成同一份代码。

## 需要记住什么

- 卢卡斯定理对模数有什么要求？
- $n$、$k$ 的 $p$ 进制数位怎样进入乘积公式？
- 为什么某位 $k_i>n_i$ 时答案为 $0$？
- $(1+x)^p\equiv1+x^p\pmod p$ 在推导中起什么作用？
- 小组合数为什么可以用阶乘和逆阶乘计算？
- 预处理和单次询问的复杂度分别是多少？
