# 离散对数与 BSGS

> 最近修订：2026-08-23 06:01 +10:00（未审阅）

普通对数回答“底数的多少次幂等于目标数”。在模运算中，对应问题是给定 $a$、$b$ 和
模数 $p$，寻找非负整数 $x$：

$$
a^x\equiv b\pmod p.
$$

这个 $x$ 称为离散对数。模快速幂能从 $x$ 很快算出 $a^x$，反过来从结果恢复指数却
没有同样直接的运算。

本文处理最稳定的基础模型：$p$ 是 32 位质数，$a\not\equiv0\pmod p$，寻找最小非负
解。BSGS（Baby-Step Giant-Step）把最多 $p-1$ 次逐项枚举变成大约 $\sqrt p$ 次预处理
和查询。

## 直接枚举幂

从 $a^0=1$ 开始不断乘 $a$，第一次得到 $b$ 时就找到最小非负解：

```text
1, a, a^2, a^3, ...  (mod p)
```

质数模数下，非零余数的幂最多经过 $p-1$ 步开始循环，所以直接枚举需要 $O(p)$ 时间。
当 $p$ 接近 $10^9$ 时，这已经不可接受。

## 把指数拆成两部分

取：

$$
m=\lceil\sqrt{p-1}\rceil.
$$

任意 $0\le x<p-1$ 都能唯一写成：

$$
x=qm+r,\qquad 0\le r<m.
$$

代入原同余式：

$$
a^{qm+r}\equiv b\pmod p.
$$

因为 $a$ 在质数模数下可逆，两边乘 $a^{-qm}$：

$$
a^r\equiv b\left(a^{-m}\right)^q\pmod p.
$$

左边只有大约 $m$ 种“小步”，右边也只需依次走大约 $m$ 次“大步”。只要两侧出现相同
余数，就恢复出 $x=qm+r$。

## Baby Step

预处理：

$$
a^0,a^1,\ldots,a^{m-1}\pmod p.
$$

用哈希表保存：

```text
余数 -> 最小指数 r
```

同一个余数可能由多个 $r$ 得到，尤其当 $a$ 的乘法阶很小时。为了得到最小非负解，
只保存第一次出现的最小 `r`。

## Giant Step

先计算：

$$
factor=a^{-m}\pmod p.
$$

质数模数下可用费马小定理求逆元：

$$
factor=\left(a^m\right)^{p-2}\pmod p.
$$

从 `giant = b` 开始，每轮乘一次 `factor`：

```text
q = 0:  b
q = 1:  b * a^(-m)
q = 2:  b * a^(-2m)
...
```

若当前 `giant` 在 Baby Step 表中对应 `r`，就得到：

$$
x=qm+r.
$$

按 `q` 从小到大查询，并让表中保留最小 `r`，第一次合法相遇给出最小非负解。

## 为什么可能无解

若 $a$ 不是模 $p$ 的原根，它的幂只会生成非零余数中的一个子群。目标 $b$ 不在这个
子群时，无论指数多大都无法到达它。

BSGS 枚举完全部 Baby Step 与 Giant Step 仍没有交点，就说明在 $0\le x<p-1$ 中
无解。幂序列之后只会按乘法阶重复，因此不存在更大的新解。

## 正确性直觉

若最小解 $x$ 存在，把它唯一拆成 $x=qm+r$，其中 $0\le r<m$。Baby Step 一定保存
$a^r$，Giant Step 在第 $q$ 轮一定到达 $b(a^{-m})^q$；原同余式保证二者相等，所以
算法不会漏掉解。

反过来，任意一次哈希命中都满足：

$$
a^r\equiv b(a^{-m})^q\pmod p.
$$

两边乘 $a^{qm}$ 就得到 $a^{qm+r}\equiv b$，所以恢复出的指数一定是合法解。

## 完整代码

输入 32 位质数 $p$ 和整数 $a$、$b$，输出满足 $a^x\equiv b\pmod p$ 的最小非负
整数 $x$；无解输出 `-1`。

代码额外处理 $a\equiv0\pmod p$：$b=1$ 时最小解是 $0$，$b=0$ 时最小解是 $1$。

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

ll discrete_logarithm(ll a, ll b, ll p) {
    a %= p;
    b %= p;
    if (a < 0) {
        a += p;
    }
    if (b < 0) {
        b += p;
    }

    if (b == 1) {
        return 0;
    }
    if (a == 0) {
        return b == 0 ? 1 : -1;
    }

    ll m = 1;
    while (m * m < p - 1) {
        ++m;
    }

    unordered_map<ll, ll> baby;
    baby.reserve(2 * m + 5);

    ll value = 1;
    for (ll r = 0; r < m; ++r) {
        if (!baby.count(value)) {
            baby[value] = r;
        }
        value = value * a % p;
    }

    ll step = mod_pow(a, m, p);
    ll factor = mod_pow(step, p - 2, p);
    ll giant = b;

    for (ll q = 0; q <= m; ++q) {
        if (baby.count(giant)) {
            ll answer = q * m + baby[giant];
            if (answer < p - 1) {
                return answer;
            }
        }
        giant = giant * factor % p;
    }
    return -1;
}

int main() {
    ll p, a, b;
    scanf("%lld%lld%lld", &p, &a, &b);
    printf("%lld\n", discrete_logarithm(a, b, p));
    return 0;
}
```

## 复杂度

Baby Step 保存 $O(\sqrt p)$ 个余数，Giant Step 进行 $O(\sqrt p)$ 次哈希查询；哈希
表操作按期望 $O(1)$ 计算，加上两次模快速幂，总时间复杂度为
$O(\sqrt p+\log p)=O(\sqrt p)$，空间复杂度为 $O(\sqrt p)$。

若使用有序 `map` 代替 `unordered_map`，时间复杂度会增加一个对数因子，但最坏性能
不再依赖哈希表行为。

代码限定 $p$ 为 32 位质数，使模乘可以安全使用 64 位整数。一般合数模数下 $a$ 可能
没有逆元，需要先消去最大公约数并使用扩展 BSGS；它不是把费马逆元换成另一行代码
这么简单。

## 常见错误

- 直接枚举到 $p-1$，没有把指数拆成两个约 $\sqrt p$ 的部分；
- 推公式时把 $a^{-m}$ 写成 $a^m$，导致两侧相遇不再对应原方程；
- Baby Step 中相同余数反复覆盖，丢失较小的 `r`；
- 忘记指数 $x=0$ 是合法候选；
- 默认离散对数一定存在，忽略 $b$ 可能不在 $a$ 生成的子群中；
- 在合数模数下直接使用费马小定理求逆元；
- 对大于 32 位的模数继续用 64 位乘法，产生溢出。

## 需要记住什么

- 离散对数要求从哪三个量中恢复哪个量？
- 为什么直接枚举需要 $O(p)$ 时间？
- 指数怎样拆成 `q * m + r`？
- Baby Step 和 Giant Step 分别保存或枚举什么？
- 为什么 Giant Step 需要乘 $a^{-m}$？
- 为什么第一次相遇能够恢复合法指数？
- 什么情况下离散对数无解？
