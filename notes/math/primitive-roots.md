# 阶与原根

> 最近修订：2026-08-23 05:58 +10:00（未审阅）

固定模数 $m$，不断计算：

$$
1,a,a^2,a^3,\ldots\pmod m.
$$

当 $a$ 与 $m$ 互质时，欧拉定理保证这个序列最终回到 $1$。不同的 $a$ 回到 $1$ 所需
步数不同；有些数甚至能在回到 $1$ 以前生成全部与 $m$ 互质的余数。

“多久回到 $1$”由乘法阶描述，“能否生成整个乘法群”由原根描述。这两个概念是离散
对数、单位根和许多数论构造的共同语言。

## 乘法阶

当 $\gcd(a,m)=1$ 时，使下面同余式成立的最小正整数 $k$：

$$
a^k\equiv 1\pmod m
$$

称为 $a$ 模 $m$ 的乘法阶，记作 $\mathrm{ord}_m(a)$。

例如模 $7$：

```text
2^1 = 2
2^2 = 4
2^3 = 1  (mod 7)
```

因此 $\mathrm{ord}_7(2)=3$。

若 $a$ 与 $m$ 不互质，正幂未必能够回到 $1$，本文不为它定义乘法阶。

## 阶整除欧拉函数

欧拉定理给出：

$$
a^{\varphi(m)}\equiv 1\pmod m.
$$

设 $d=\mathrm{ord}_m(a)$，把 $\varphi(m)$ 除以 $d$：

$$
\varphi(m)=qd+r,\qquad 0\le r<d.
$$

因为 $a^d\equiv1$，所以：

$$
a^{\varphi(m)}=a^{qd+r}\equiv a^r\equiv1\pmod m.
$$

但 $d$ 是让幂回到 $1$ 的最小正整数，只能有 $r=0$。因此：

$$
\mathrm{ord}_m(a)\mid\varphi(m).
$$

这条整除关系让我们不必从 $1$ 开始逐个尝试指数，而可以从 $\varphi(m)$ 的因数中
缩小答案。

## 原根

若某个数 $g$ 满足：

$$
\mathrm{ord}_m(g)=\varphi(m),
$$

就称 $g$ 是模 $m$ 的一个原根。

原根的前 $\varphi(m)$ 个幂会不重不漏地生成全部与 $m$ 互质的余数。若其中两个幂
$g^i$、$g^j$ 相同，较大的指数减去较小的指数就会让幂在不足 $\varphi(m)$ 步时回到
$1$，与原根的阶矛盾。

不是每个模数都有原根。存在原根的正整数恰好是：

$$
1,\ 2,\ 4,\ p^k,\ 2p^k,
$$

其中 $p$ 是奇质数。这个存在性定理只需理解结论；基础竞赛实现最常处理质数模数。

## 质数模数的判定条件

设模数 $p$ 是质数，则 $\varphi(p)=p-1$。根据费马小定理，任意
$1\le g<p$ 都满足：

$$
g^{p-1}\equiv1\pmod p.
$$

我们要判断它的阶是否恰为 $p-1$。

把 $p-1$ 的不同质因数记作 $q_1,q_2,\ldots,q_t$。判定条件是：

$$
g^{(p-1)/q_i}\not\equiv1\pmod p
$$

对每个不同质因数 $q_i$ 都成立。

若某次结果为 $1$，则 $g$ 的阶整除 $(p-1)/q_i$，不可能是原根。

反过来，若 $g$ 的阶 $d$ 是 $p-1$ 的真因数，那么 $(p-1)/d>1$ 至少含有一个质因数
$q_i$，于是 $d$ 整除 $(p-1)/q_i$，对应幂必然为 $1$。因此检查全部不同质因数足以
排除所有真因数阶。

## 计算一个数的阶

已知 $p-1$ 的不同质因数后，也可以从 `order = p - 1` 开始不断删除不必要的质因数：

```cpp
for (ll q : factors) {
    while (order % q == 0 && mod_pow(a, order / q, p) == 1) {
        order /= q;
    }
}
```

每次删除 $q$ 前都验证更小指数仍能回到 $1$。循环结束时，再删任何质因数都会失败，
剩下的就是最小正指数。

## 寻找最小原根

先分解 $p-1$，只保留不同质因数。再从 $g=2$ 开始枚举候选，对每个质因数执行一次
模快速幂；全部检查通过的第一个 $g$ 就是最小正原根。

模 $2$ 时唯一非零余数是 $1$，其原根也是 $1$，需要单独处理。

## 完整代码

输入一个 32 位质数 $p$ 和整数 $a$。程序输出 $a$ 模 $p$ 的乘法阶；若 $a$ 是 $p$
的倍数，输出 `-1`。第二行输出模 $p$ 的最小正原根。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

ll mod_pow(ll base, ll exponent, ll mod) {
    ll result = 1 % mod;
    base %= mod;

    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = result * base % mod;
        }
        base = base * base % mod;
        exponent /= 2;
    }
    return result;
}

vector<ll> distinct_prime_factors(ll n) {
    vector<ll> factors;

    for (ll p = 2; p <= n / p; ++p) {
        if (n % p != 0) {
            continue;
        }

        factors.push_back(p);
        while (n % p == 0) {
            n /= p;
        }
    }

    if (n > 1) {
        factors.push_back(n);
    }
    return factors;
}

ll multiplicative_order(ll a, ll p, const vector<ll>& factors) {
    a %= p;
    if (a < 0) {
        a += p;
    }
    if (gcd(a, p) != 1) {
        return -1;
    }

    ll order = p - 1;
    for (ll q : factors) {
        while (order % q == 0 && mod_pow(a, order / q, p) == 1) {
            order /= q;
        }
    }
    return order;
}

ll primitive_root(ll p, const vector<ll>& factors) {
    if (p == 2) {
        return 1;
    }

    for (ll g = 2; g < p; ++g) {
        bool valid = true;
        for (ll q : factors) {
            if (mod_pow(g, (p - 1) / q, p) == 1) {
                valid = false;
                break;
            }
        }
        if (valid) {
            return g;
        }
    }
    return -1;
}

int main() {
    ll p, a;
    scanf("%lld%lld", &p, &a);

    vector<ll> factors = distinct_prime_factors(p - 1);
    printf("%lld\n", multiplicative_order(a, p, factors));
    printf("%lld\n", primitive_root(p, factors));
    return 0;
}
```

## 复杂度

试除分解 $p-1$ 的时间复杂度为 $O(\sqrt p)$。计算一个乘法阶需要
$O(\log p)$ 次模快速幂数量级的工作。

若最小原根为 $g$，寻找它会检查 $g-1$ 个候选；每个候选对 $p-1$ 的每个不同质因数
执行一次 $O(\log p)$ 模快速幂。32 位质数下这份基础实现足够直接。

代码限定 $p$ 为 32 位质数，使两个模 $p$ 余数相乘仍能放入 64 位整数。更大模数需要
另外解决安全模乘，不能仅把输入类型改大。

## 常见错误

- 没有检查 $a$ 与模数互质，就讨论乘法阶；
- 把第一次出现重复余数的时刻当成回到 $1$ 的时刻；
- 判断原根时枚举 $p-1$ 的全部因数，忽略不同质因数已经足够；
- 只检查 $g^{p-1}\equiv1$；质数模数下所有非零余数都满足它；
- 分解 $p-1$ 时保留重复质因数，做无意义的重复判定；
- 忘记单独处理模 $2$；
- 在 64 位模数下直接用 64 位乘法计算模快速幂。

## 需要记住什么

- 乘法阶怎样定义，为什么要求底数与模数互质？
- 为什么乘法阶整除欧拉函数？
- 原根的阶与欧拉函数有什么关系？
- 为什么原根的幂能生成全部可逆余数？
- 质数模数下为什么只需检查 $p-1$ 的不同质因数？
- 哪些模数存在原根的结论是否需要在基础实现中证明？
