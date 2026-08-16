# 扩展欧拉定理

> 最近修订：2026-08-17 10:10 +10:00（未审阅）

需要计算：

$$
a^b\bmod m,
$$

但有两个困难：

1. 指数 $b$ 是一个可能有几十万位的非负十进制整数；
2. $a$ 与 $m$ 不一定互质。

指数太大，不能先读入 64 位整数再快速幂。普通欧拉定理虽然能把指数对
$\varphi(m)$ 取模，却要求 $\gcd(a,m)=1$；非互质时直接取模会改变答案。

扩展欧拉定理给出统一处理方式：

$$
a^b\equiv
\begin{cases}
a^b & b<\varphi(m),\\
a^{b\bmod\varphi(m)+\varphi(m)} & b\ge\varphi(m)
\end{cases}
\pmod m.
$$

因此，读取巨大指数时只需要同时知道：它对 $\varphi(m)$ 的余数，以及它是否已经
达到 $\varphi(m)$。

## 为什么不能总是直接取模

取：

$$
a=2,\qquad m=8,\qquad b=4.
$$

因为 $\varphi(8)=4$，直接缩小指数会得到：

$$
2^{4\bmod4}=2^0\equiv1\pmod8.
$$

真实答案却是：

$$
2^4=16\equiv0\pmod8.
$$

问题在于 `2` 与 `8` 不互质。幂次增长时，底数中的质因数会逐渐积累，直到结果
含有模数所需的全部对应质因数；把一个已经很大的指数突然缩回 0，会丢失这个
“进入稳定阶段”的信息。

扩展公式在指数已经足够大时加回一个 $\varphi(m)$，避免把大指数误当成很小的
指数。

## 从质数幂观察行为

将模数分解为质数幂。对其中一个 $p^k$：

- 若 $p$ 不整除 $a$，`a` 与 $p^k$ 互质，欧拉定理提供周期；
- 若 $p$ 整除 $a$，$a^b$ 中质因数 $p$ 的指数随 $b$ 增长，达到 $k$ 后，
  这一部分在模 $p^k$ 下稳定为 0。

因此，非互质部分不是从指数 0 开始纯周期，而是先经过一段增长，再进入稳定的
周期行为。保留一个额外的 $\varphi(m)$，就能保证缩小后的指数仍位于足够大的
阶段。

完整证明需要分别处理每个质数幂，再使用中国剩余定理合并。本篇真正需要掌握的
是适用公式、指数读取方法，以及“不能把小指数擅自加周期”的边界。

## 一边读取一边取模

设 `period = phi(m)`，巨大指数以字符串 `exponent` 给出。十进制数字从左到右
加入时，余数满足：

```cpp
remainder = ((__int128)remainder * 10 + digit) % period;
```

无论原指数有多少位，`remainder` 始终小于 `period`。

还要判断原指数是否至少为 `period`。维护一个被截断的数：

```cpp
__int128 next = (__int128)capped * 10 + digit;
capped = next >= period ? period : (ll)next;
```

一旦它达到 `period`，以后始终保持 `period`。最终：

```cpp
bool large = capped >= period;
```

于是快速幂真正使用的指数为：

```cpp
remainder + (large ? period : 0)
```

这里 `period` 不大于输入的 64 位模数；代码使用除法形式控制质因数分解循环，
避免在 `p * p` 中产生不必要的溢出。

## 计算欧拉函数

对正整数 `m` 做试除分解。若 `p` 是 `m` 的不同质因数，欧拉函数满足：

$$
\varphi(m)=m\prod_{p\mid m}\left(1-\frac1p\right).
$$

每发现一个质因数 `p`，先从临时变量中除尽它，再执行：

```cpp
result = result / p * (p - 1);
```

除法先做，能让中间结果不超过原来的 `result`。试除法需要 $O(\sqrt m)$ 时间。

## 完整代码

输入 64 位整数 `a`、正整数 `m` 和非负十进制大整数 `b`，输出
`a^b mod m`。题目保证 `m` 与欧拉函数计算过程在 64 位整数范围内。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

ll euler_phi(ll n) {
    ll result = n;
    ll remaining = n;

    for (ll p = 2; p <= remaining / p; p++) {
        if (remaining % p != 0) {
            continue;
        }

        result = result / p * (p - 1);
        while (remaining % p == 0) {
            remaining /= p;
        }
    }

    if (remaining > 1) {
        result = result / remaining * (remaining - 1);
    }

    return result;
}

ll power_mod(ll a, ll exponent, ll mod) {
    a %= mod;
    if (a < 0) {
        a += mod;
    }

    ll result = 1 % mod;

    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = (__int128)result * a % mod;
        }
        a = (__int128)a * a % mod;
        exponent /= 2;
    }

    return result;
}

ll reduce_exponent(const string& exponent, ll period) {
    ll remainder = 0;
    ll capped = 0;

    for (char digit_character : exponent) {
        int digit = digit_character - '0';
        remainder = ((__int128)remainder * 10 + digit) % period;

        if (capped < period) {
            __int128 next = (__int128)capped * 10 + digit;
            capped = next >= period ? period : (ll)next;
        }
    }

    if (capped >= period) {
        remainder += period;
    }

    return remainder;
}

void solve() {
    ll a, mod;
    string exponent;
    cin >> a >> mod >> exponent;

    ll period = euler_phi(mod);
    ll reduced_exponent = reduce_exponent(exponent, period);
    cout << power_mod(a, reduced_exponent, mod) << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

代码在模乘中使用 `__int128`，只负责让两个 64 位余数相乘时不溢出。若竞赛环境
不支持 `__int128`，应把模乘替换为对应环境允许的实现；这与扩展欧拉定理本身
无关。

## 小指数为什么不能加周期

若 $b<\varphi(m)$，公式保留原指数，不能为了统一写法也加上 $\varphi(m)$。

例如 `a=2,m=8,b=0`：

$$
2^0\equiv1\pmod8,
$$

而擅自改成 $2^{0+4}$ 会得到 0。`large` 判断不是优化常数，而是保证非互质情形
正确性的必要部分。

## 什么时候不需要扩展欧拉定理

- 指数本来就在 64 位整数范围内：直接快速幂最清楚；
- 已经确认 $\gcd(a,m)=1$：普通欧拉定理可以直接对 $\varphi(m)$ 取模；
- 模数为质数且底数不被模数整除：费马小定理更直接；
- 指数虽然很长，但模数很小且题目有更简单的周期：应优先使用问题本身的结构。

扩展欧拉定理的价值是统一处理“巨大指数与非互质模数”同时出现的情况，不是让
每一道模幂题都多算一次欧拉函数。

## 常见错误

- 非互质时仍直接使用 `b % phi(m)`；
- 无论指数大小都强行加上 `phi(m)`；
- 只计算巨大指数的余数，却没有同时判断它是否达到 `phi(m)`；
- 用 64 位整数直接读取可能有几十万位的指数；
- `m == 1` 时把快速幂初值固定写成 1，最终错误输出 1；
- 质因数分解只除一次 `p`，没有从临时变量中除尽同一质因数；
- 把 `phi(m)` 误认为所有底数从指数 0 开始的最小周期；
- 将安全模乘的实现细节误当成扩展欧拉定理的一部分。

## 需要记住什么

- 为什么非互质底数不能直接把指数对 $\varphi(m)$ 取模？
- 扩展欧拉定理对小指数与大指数分别怎样处理？
- 读取巨大十进制指数时，怎样同时维护余数与“是否足够大”？
- `+phi(m)` 保留的是什么信息？
- 为什么 `m == 1` 时快速幂初值也必须先取模？
- 哪些更简单的情形不需要使用扩展欧拉定理？
