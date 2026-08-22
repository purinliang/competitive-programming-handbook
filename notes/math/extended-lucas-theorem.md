# 扩展卢卡斯定理

> 最近修订：2026-08-23 06:08 +10:00（未审阅）

卢卡斯定理能够计算大组合数模质数，却不能直接处理合数模数。例如计算：

$$
\binom nk\bmod 12
$$

时，阶乘中含有因子 $2$、$3$，这些数在模 $12$ 下没有逆元，不能把组合数公式中的
除法直接改写成逆元乘法。

扩展卢卡斯算法把合数模数分解成互质的质数幂，分别计算组合数，再用中国剩余定理
合并。每个质数幂内部则把“这个质因数出现了多少次”与“去掉它以后可逆的部分”分开
处理。

本文处理非负 $n$、$k$ 和适合对各质数幂做线性预处理的 32 位正模数。

## 把模数分解成质数幂

设：

$$
M=p_1^{q_1}p_2^{q_2}\cdots p_t^{q_t}.
$$

不同质数幂两两互质。先分别计算：

$$
r_i\equiv\binom nk\pmod{p_i^{q_i}},
$$

再解同余方程组：

$$
x\equiv r_i\pmod{p_i^{q_i}}.
$$

CRT 会给出模 $M$ 的唯一答案。

真正困难的部分因此缩小为：怎样计算组合数模一个质数幂 $p^q$。

## 阶乘中质因数 p 的次数

$n!$ 中含有多少个质因数 $p$，由勒让德公式给出：

$$
v_p(n!)=left\lfloor\frac np\right\rfloor
+\left\lfloor\frac n{p^2}\right\rfloor+cdots.
$$

代码反复让 `n /= p`：

```cpp
ll count_prime(ll n, ll p) {
    ll answer = 0;
    while (n > 0) {
        n /= p;
        answer += n;
    }
    return answer;
}
```

因此组合数中的 $p$ 次数是：

$$
e=v_p(n!)-v_p(k!)-v_p((n-k)!).
$$

若 $e\ge q$，组合数已经含有因子 $p^q$，模 $p^q$ 的答案直接为 $0$。

## 去掉 p 后的阶乘

把 $n!$ 中所有质因数 $p$ 删除，只保留与 $p^q$ 互质的部分，记作：

$$
F(n).
$$

它在模 $p^q$ 下存在逆元。于是：

$$
\binom nk\equiv
F(n)F(k)^{-1}F(n-k)^{-1}p^e
\pmod{p^q}.
$$

问题变成快速计算 $F(n)$。

## 按质数幂分块

令 `mod = p^q`，预处理：

```text
prefix[i] = 1..i 中所有不能被 p 整除的数之积 mod p^q
```

长度恰为 `mod` 的完整块中，与 $p$ 互质部分的乘积都是 `prefix[mod]`。因此 $1..n$
可以贡献：

```text
prefix[mod]^(n / mod) * prefix[n % mod]
```

但这只处理了原本就不能被 $p$ 整除的整数。所有 $p$ 的倍数除掉一个 $p$ 后，剩余部分
恰好对应：

```text
1, 2, ..., floor(n / p)
```

还要递归乘上 $F(\lfloor n/p\rfloor)$。所以：

$$
F(n)=
prefix[mod]^{\lfloor n/mod\rfloor}
\cdot prefix[n\bmod mod]
\cdot F(\lfloor n/p\rfloor)
\pmod{mod}.
$$

每次递归把 $n$ 除以 $p$，深度为 $O(\log_p n)$。

## 模质数幂的组合数

得到三个去因子阶乘与指数 $e$ 后：

```cpp
answer = factorial_without_p(n);
answer = answer * inverse(factorial_without_p(k)) % mod;
answer = answer * inverse(factorial_without_p(n - k)) % mod;
answer = answer * mod_pow(p, exponent, mod) % mod;
```

去掉 $p$ 的阶乘与 $p^q$ 互质，因此逆元一定存在；这里使用扩展欧几里得算法，而不是
费马小定理。

## 用 CRT 合并

各质数幂模数记作 $m_i=p_i^{q_i}$，总模数为 $M$。对每一项令：

$$
M_i=\frac M{m_i}.
$$

$M_i$ 与 $m_i$ 互质，可以求出 $M_i^{-1}\pmod{m_i}$。经典 CRT 给出：

$$
x\equiv
\sum_i r_iM_iM_i^{-1}pmod M.
$$

每一项在自己的模数下等于 $r_i$，在其他质数幂下都含有对应模数因子，因此不会干扰
其他余数条件。

## 正确性直觉

质数幂计算把每个阶乘唯一拆成 $p$ 的幂与一个模 $p^q$ 可逆的部分。指数相减得到组合
数中准确的 $p$ 次数；三个可逆部分按照阶乘公式相除，再乘回 $p^e$，因此得到正确的
模 $p^q$ 余数。

不同质数幂两两互质，CRT 合并出的数同时满足全部质数幂余数条件。它们的乘积就是原
模数 $M$，所以合并结果恰好等于组合数模 $M$。

## 完整代码

输入 32 位正模数 `mod` 和询问数 `q`，随后每次输入非负整数 `n`、`k`，输出
$\binom nk\bmod mod$。代码会为 `mod` 的每个质数幂建立长度为该质数幂的前缀积，
因此只适合这些质数幂能够进行线性预处理的情形。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

ll exgcd(ll a, ll b, ll& x, ll& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }

    ll next_x, next_y;
    ll g = exgcd(b, a % b, next_x, next_y);
    x = next_y;
    y = next_x - a / b * next_y;
    return g;
}

ll mod_inverse(ll a, ll mod) {
    ll x, y;
    exgcd(a, mod, x, y);
    x %= mod;
    if (x < 0) {
        x += mod;
    }
    return x;
}

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

struct PrimePowerCombination {
    ll p;
    ll mod;
    int power;
    vector<ll> prefix;

    PrimePowerCombination(ll prime, ll prime_power, int exponent)
        : p(prime), mod(prime_power), power(exponent), prefix(mod + 5, 1) {
        for (ll i = 1; i <= mod; ++i) {
            prefix[i] = prefix[i - 1];
            if (i % p != 0) {
                prefix[i] = prefix[i] * i % mod;
            }
        }
    }

    ll count_prime(ll n) const {
        ll answer = 0;
        while (n > 0) {
            n /= p;
            answer += n;
        }
        return answer;
    }

    ll factorial_without_p(ll n) const {
        if (n == 0) {
            return 1;
        }

        ll answer = mod_pow(prefix[mod], n / mod, mod);
        answer = answer * prefix[n % mod] % mod;
        answer = answer * factorial_without_p(n / p) % mod;
        return answer;
    }

    ll combination(ll n, ll k) const {
        if (k < 0 || k > n) {
            return 0;
        }

        ll exponent = count_prime(n) - count_prime(k) - count_prime(n - k);
        if (exponent >= power) {
            return 0;
        }

        ll answer = factorial_without_p(n);
        answer = answer * mod_inverse(factorial_without_p(k), mod) % mod;
        answer = answer * mod_inverse(factorial_without_p(n - k), mod) % mod;
        answer = answer * mod_pow(p, exponent, mod) % mod;
        return answer;
    }
};

struct ExtendedLucas {
    ll mod;
    vector<PrimePowerCombination> part;

    ExtendedLucas(ll modulus) : mod(modulus) {
        part.reserve(10);

        ll remaining = mod;
        for (ll p = 2; p <= remaining / p; ++p) {
            if (remaining % p != 0) {
                continue;
            }

            ll prime_power = 1;
            int exponent = 0;
            while (remaining % p == 0) {
                remaining /= p;
                prime_power *= p;
                ++exponent;
            }
            part.emplace_back(p, prime_power, exponent);
        }

        if (remaining > 1) {
            part.emplace_back(remaining, remaining, 1);
        }
    }

    ll combination(ll n, ll k) const {
        if (k < 0 || k > n || mod == 1) {
            return 0;
        }

        ll answer = 0;
        for (const PrimePowerCombination& current : part) {
            ll residue = current.combination(n, k);
            ll divided_mod = mod / current.mod;
            ll inverse = mod_inverse(divided_mod % current.mod, current.mod);

            answer += residue * divided_mod % mod * inverse % mod;
            answer %= mod;
        }
        return answer;
    }
};

int main() {
    ll mod;
    int q;
    scanf("%lld%d", &mod, &q);

    ExtendedLucas extended_lucas(mod);
    while (q--) {
        ll n, k;
        scanf("%lld%lld", &n, &k);
        printf("%lld\n", extended_lucas.combination(n, k));
    }
    return 0;
}
```

## 复杂度

试除分解模数需要 $O(\sqrt M)$ 时间。设分解出的质数幂为 $m_1,m_2,\ldots,m_t$，
前缀积预处理需要：

$$
O\left(\sum_i m_i\right)
$$

时间与空间。

每次询问在每个质数幂下递归 $O(\log_{p_i} n)$ 层，并进行若干次对数时间的快速幂与
扩展欧几里得运算。真正限制基础实现规模的是质数幂前缀数组，而不是 $n$。

代码限定 `mod` 为 32 位正整数，使两个模 `mod` 余数相乘仍能放入 64 位整数；更大
模数需要独立处理安全模乘。

## 常见错误

- 合数模数下仍把整个阶乘直接求逆；
- 只统计 $\lfloor n/p\rfloor$，漏掉 $p^2,p^3,\ldots$ 的贡献；
- 去掉 $p$ 后忘记递归处理原来是 $p$ 倍数的整数；
- 指数 $e\ge q$ 时仍尝试求逆，而不是直接返回 $0$；
- 用费马小定理求模 $p^q$ 的逆元；
- 质数幂余数算完后直接相加，没有用 CRT 隔离不同模数；
- 模数含有很大的质数幂时仍分配同样大小的前缀数组；
- 把扩展卢卡斯理解成只把卢卡斯公式中的 $p$ 换成合数。

## 需要记住什么

- 为什么合数模数下不能直接使用阶乘逆元？
- 为什么先把模数分解成两两互质的质数幂？
- 怎样计算 $n!$ 中质因数 $p$ 的次数？
- `factorial_without_p(n)` 保留了阶乘的哪一部分？
- 为什么去掉 $p$ 后的部分在模 $p^q$ 下可逆？
- 质数幂答案为什么还要乘回 $p^e$？
- 最后为什么可以使用经典 CRT 合并？
