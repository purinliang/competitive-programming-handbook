# 欧拉定理

> 最近修订：2026-08-15 23:02 +10:00（未审阅）

[费马小定理](fermat-little-theorem.md)告诉我们：模数 `p` 是质数且 `p` 不整除 `a` 时，

$$
a^{p-1}\equiv1\pmod p.
$$

但竞赛题的模数不一定是质数。若模数是 `12`，还能否找到一个指数，使所有与 `12` 互质的底数升到这个指数后都模 `12` 等于 `1`？

[欧拉函数](euler-totient.md)计数了与模数互质的余数。欧拉定理说明，这个数量也能给出一个可用的指数。

## 定理

若：

$$
\gcd(a,n)=1,
$$

则：

$$
a^{\varphi(n)}\equiv1\pmod n.
$$

这里 `n` 是正整数，$\varphi(n)$ 是 `1..n` 中与 `n` 互质的整数个数。

例如：

$$
\varphi(12)=4,
$$

而 `5` 与 `12` 互质，所以：

$$
5^4=625\equiv1\pmod {12}.
$$

定理并不声称 $\varphi(n)$ 是最小的可用指数。上例中其实已经有 $5^2\equiv1\pmod {12}$；欧拉定理只保证指数 $\varphi(n)$ 一定成立。

## 与 n 互质的余数

把 `1..n` 中与 `n` 互质的整数依次记为：

$$
r_1,r_2,\ldots,r_{\varphi(n)}.
$$

例如模 `12` 时，这组整数是：

$$
1,5,7,11.
$$

接下来把每个数都乘以一个与 `n` 互质的 `a`，并取模：

$$
ar_1,ar_2,\ldots,ar_{\varphi(n)}\pmod n.
$$

证明的关键是：新得到的余数仍然是原来那一组，只是顺序可能改变。

## 乘完以后仍然互质

因为：

$$
\gcd(a,n)=1
$$

且：

$$
\gcd(r_i,n)=1,
$$

乘积 $ar_i$ 也不会含有 `n` 的任何质因数。因此：

$$
\gcd(ar_i,n)=1.
$$

所以每个新余数仍属于“与 `n` 互质的余数”这组集合。

## 乘完以后不会重合

还要证明两个不同的 $r_i,r_j$ 不会乘完后变成相同余数。

假设：

$$
ar_i\equiv ar_j\pmod n.
$$

因为 `a` 与 `n` 互质，所以 `a` 存在[模逆元](modular-inverse.md)，可以在同余式两边约去 `a`：

$$
r_i\equiv r_j\pmod n.
$$

而 $r_i,r_j$ 都取自同一组互不相同的标准余数，所以只能有 $r_i=r_j$。

因此，乘以 `a` 不会让两个元素合并。新集合有同样多的元素，又全部落在原集合中，所以它恰好是原集合的一次重新排列。

## 把整组元素相乘

既然乘以 `a` 前后只是重排，所有元素的乘积在模 `n` 下相同：

$$
(ar_1)(ar_2)\cdots(ar_{\varphi(n)})
\equiv
r_1r_2\cdots r_{\varphi(n)}
\pmod n.
$$

左侧共有 $\varphi(n)$ 个因子 `a`：

$$
a^{\varphi(n)}r_1r_2\cdots r_{\varphi(n)}
\equiv
r_1r_2\cdots r_{\varphi(n)}
\pmod n.
$$

每个 $r_i$ 都与 `n` 互质，因此它们的乘积也与 `n` 互质，存在模逆元。约去整段乘积，得到：

$$
a^{\varphi(n)}\equiv1\pmod n.
$$

这就是欧拉定理。

## 使用欧拉函数缩小指数

设非负指数 `b` 可以写成：

$$
b=q\varphi(n)+r,
$$

其中：

$$
r=b\bmod\varphi(n).
$$

若 `gcd(a,n)=1`，根据欧拉定理：

$$
\begin{aligned}
a^b
&=a^{q\varphi(n)+r}\\
&=(a^{\varphi(n)})^q a^r\\
&\equiv a^r\pmod n.
\end{aligned}
$$

所以：

$$
a^b\equiv a^{b\bmod\varphi(n)}\pmod n.
$$

代码先计算 `phi(n)`，再把缩小后的指数交给快速幂：

```cpp
ll period = phi(n);
ll answer = power(a, b % period, n);
```

这里变量名 `period` 表示欧拉定理提供的一个可用循环长度，不表示它一定是最小正周期。

## 互质条件不能省略

令：

```text
a = 2, n = 8, b = 4
```

此时：

$$
\varphi(8)=4,
$$

但 `gcd(2,8)!=1`。原式是：

$$
2^4\equiv0\pmod8.
$$

若错误地把指数对 `4` 取模，会得到指数 `0`：

$$
2^0\equiv1\pmod8,
$$

答案发生改变。

因此只有确认 `gcd(a,n)=1` 后，才能直接把 `b` 替换成 `b%phi(n)`。非互质时不能套用本篇结论。

## 费马小定理是特殊情形

若 `n=p` 是质数，那么：

$$
\varphi(p)=p-1.
$$

欧拉定理变成：

$$
a^{p-1}\equiv1\pmod p\qquad(p\nmid a),
$$

正好就是费马小定理。欧拉定理把质数模推广到了任意与底数互质的正整数模数。

## 完整代码

下面的程序读入 `a,b,n`，题目必须保证 `b>=0`、`n>=1` 且 `gcd(a,n)=1`。它先计算欧拉函数，再缩小指数并计算模幂。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

ll phi(ll n) {
    ll answer = n;
    ll x = n;

    for (ll p = 2; p <= x / p; p++) {
        if (x % p != 0) {
            continue;
        }

        answer = answer / p * (p - 1);
        while (x % p == 0) {
            x /= p;
        }
    }

    if (x > 1) {
        answer = answer / x * (x - 1);
    }
    return answer;
}

ll power(ll a, ll b, ll mod) {
    a %= mod;
    if (a < 0) {
        a += mod;
    }

    ll answer = 1 % mod;
    while (b > 0) {
        if (b % 2 == 1) {
            answer = (__int128)answer * a % mod;
        }
        a = (__int128)a * a % mod;
        b /= 2;
    }
    return answer;
}

int main() {
    ll a, b, n;
    scanf("%lld%lld%lld", &a, &b, &n);

    ll period = phi(n);
    printf("%lld\n", power(a, b % period, n));
    return 0;
}
```

输入：

```text
5 123456789 12
```

因为 `123456789%4=1`，输出：

```text
5
```

## 正确性

`phi(n)` 返回 $\varphi(n)$。题目保证 `gcd(a,n)=1`，所以欧拉定理成立：

$$
a^{\varphi(n)}\equiv1\pmod n.
$$

将 `b` 除以 $\varphi(n)$，商对应的每个整段指数对答案只乘一次 `1`，只有余数 `b%phi(n)` 会影响结果。因此快速幂计算的值与原来的 $a^b\bmod n$ 相同。

## 复杂度

试除计算欧拉函数需要 $O(\sqrt n)$ 时间。缩小后的指数小于 $\varphi(n)\le n$，快速幂需要 $O(\log n)$ 时间。

总时间复杂度由质因数分解主导，为：

$$
O(\sqrt n).
$$

算法使用 $O(1)$ 额外空间。

## 常见错误

### 不检查 gcd(a,n)

互质是欧拉定理的必要前提。非互质时直接对指数取模可能改变答案。

### 认为 phi(n) 是最小周期

欧拉定理只保证升到 `phi(n)` 次方得到 `1`。某个具体底数的最小正周期可能更小。

### 把底数也对 phi(n) 取模

底数应对模数 `n` 取模；只有指数才在满足条件时对 `phi(n)` 取模。

### 使用 p-1 处理合数模

`p-1` 来自质数模下的费马小定理。一般正整数模数应使用 `phi(n)`，并检查互质条件。

### 忽略 n=1

模 `1` 的所有整数都同余。代码令 `answer=1%mod`，因此会正确返回 `0`。

## 基础练习

1. 写出模 `10` 时全部与 `10` 互质的标准余数。
2. 选择一个与 `10` 互质的 `a`，验证乘以 `a` 后这些余数只是重排。
3. 解释证明中为什么可以先约去 `a`，最后又能约去全部 $r_i$ 的乘积。
4. 使用欧拉定理计算 $3^{100}\bmod10$。
5. 找出 `2^4 mod 8` 中错误缩小指数的具体结果。
6. 说明费马小定理怎样从欧拉定理中得到。

## 需要记住什么

1. 欧拉定理的结论与互质条件是什么？
2. 为什么乘以 `a` 后，与 `n` 互质的余数集合只会重新排列？
3. 怎样从集合乘积推出 $a^{\varphi(n)}\equiv1\pmod n$？
4. 什么时候可以把指数 `b` 改为 `b%phi(n)`？
5. 为什么 `phi(n)` 不一定是最小周期？
6. 费马小定理是欧拉定理的哪一种特殊情形？

若底数与模数不互质，[扩展欧拉定理](extended-euler-theorem.md) 会给出
竞赛中常用的指数处理条件。
