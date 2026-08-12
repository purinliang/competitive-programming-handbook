# 数论：中国剩余定理（CRT）

> 状态：草稿

一个整数可以同时受到多个余数条件的约束。例如，我们想找到 $x$，使它除以 $3$ 余 $2$，除以 $5$ 余 $3$，除以 $7$ 余 $2$：

$$
\begin{cases}
x\equiv2\pmod3,\\
x\equiv3\pmod5,\\
x\equiv2\pmod7.
\end{cases}
$$

从 $2,5,8,11,\ldots$ 中不断枚举当然能找到答案，但模数较大时不可行。中国剩余定理（Chinese remainder theorem，CRT）可以直接把这些条件组合成一个答案。

## 问题形式

给定 $k$ 个同余方程

$$
x\equiv a_i\pmod{m_i},\qquad 1\le i\le k,
$$

经典 CRT 要求每个模数 $m_i$ 为正整数，并且它们**两两互质**：

$$
\gcd(m_i,m_j)=1\qquad(i\ne j).
$$

定理保证，方程组模

$$
M=m_1m_2\cdots m_k
$$

有唯一解。“模 $M$ 唯一”表示所有整数解都可以写成

$$
x=x_0+tM,\qquad t\in\mathbb Z,
$$

通常输出其中唯一的最小非负代表元 $x_0\in[0,M)$。

## 一个条件的开关

要同时组合多个余数，先尝试为第 $i$ 个方程构造一个数 $E_i$，使它满足：

$$
E_i\equiv1\pmod{m_i},
$$

但对所有 $j\ne i$，

$$
E_i\equiv0\pmod{m_j}.
$$

这样，$a_iE_i$ 就只会对第 $i$ 个模数留下余数 $a_i$，对其他模数都是 $0$。可以把 $E_i$ 理解为“只打开第 $i$ 个条件”的开关。

## 让其他余数归零

定义

$$
M_i=\frac M{m_i}.
$$

$M_i$ 包含除 $m_i$ 以外的所有模数因子。因此对任意 $j\ne i$，都有

$$
M_i\equiv0\pmod{m_j}.
$$

这已经实现了“对其他模数为 $0$”。可是 $M_i$ 对 $m_i$ 的余数不一定是 $1$，还差一步。

## 把当前余数调成一

因为所有模数两两互质，$M_i$ 与 $m_i$ 也互质。根据裴蜀等式，存在整数 $t_i,y$，使得

$$
M_it_i+m_iy=1.
$$

两边对 $m_i$ 取模，得到

$$
M_it_i\equiv1\pmod{m_i}.
$$

$t_i$ 就是 $M_i$ 在模 $m_i$ 意义下的乘法逆元，可以用 [数论：扩展欧几里得算法](extended-euclidean-algorithm.md) 求出。

现在令

$$
E_i=M_it_i,
$$

就同时满足了我们对“开关”的两个要求。

## 组合所有开关

将每个开关乘以它应该产生的余数，再全部相加：

$$
x=\sum_{i=1}^k a_iM_it_i\pmod M.
$$

对某个固定的 $m_j$ 取模时：

- 所有 $i\ne j$ 的项都因 $M_i\equiv0\pmod{m_j}$ 而消失；
- 只剩 $a_jM_jt_j\equiv a_j\pmod{m_j}$。

因此这个 $x$ 同时满足所有方程。公式的来源就是逐个构造互不干扰的余数开关。

## 手算例子

对于开头的方程组，

$$
M=3\times5\times7=105.
$$

三个部分分别是：

- $M_1=35$，$35\equiv2\pmod3$，$2$ 的逆元是 $2$，所以 $t_1=2$；
- $M_2=21$，$21\equiv1\pmod5$，所以 $t_2=1$；
- $M_3=15$，$15\equiv1\pmod7$，所以 $t_3=1$。

代入公式：

$$
\begin{aligned}
x
&\equiv2\times35\times2+3\times21\times1+2\times15\times1\pmod{105}\\
&\equiv233\pmod{105}\\
&\equiv23\pmod{105}.
\end{aligned}
$$

检查：$23$ 除以 $3,5,7$ 的余数分别是 $2,3,2$。

## 完整代码

下面的程序假设模数乘积可以放入 `long long`。中间乘法使用 `__int128` 避免在取模前过早溢出；这不能解决最终模数本身超出 `long long` 的问题。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;
typedef __int128 i128;

ll exgcd(ll a, ll b, ll& x, ll& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }

    ll x1, y1;
    ll g = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - a / b * y1;
    return g;
}

ll mod_norm(i128 x, ll mod) {
    x %= mod;
    if (x < 0) {
        x += mod;
    }
    return (ll)x;
}

bool crt(const vector<ll>& a, const vector<ll>& m, ll& ans, ll& mod) {
    mod = 1;
    for (ll x : m) {
        mod *= x;
    }

    ans = 0;
    for (int i = 0; i < (int)a.size(); i++) {
        ll Mi = mod / m[i];
        ll ti, y;
        if (exgcd(Mi, m[i], ti, y) != 1) {
            return false;
        }

        ans = mod_norm((i128)ans + (i128)mod_norm(a[i], m[i]) * Mi * ti, mod);
    }
    return true;
}

int main() {
    int n;
    scanf("%d", &n);

    vector<ll> a(n);
    vector<ll> m(n);
    for (int i = 0; i < n; i++) {
        scanf("%lld%lld", &m[i], &a[i]);
    }

    ll ans, mod;
    if (!crt(a, m, ans, mod)) {
        puts("Moduli are not pairwise coprime");
        return 0;
    }

    printf("%lld %lld\n", ans, mod);
    return 0;
}
```

输出的两个数表示方程组的全部解是

$$
x\equiv\texttt{ans}\pmod{\texttt{mod}}.
$$

## 复杂度

对每个方程调用一次扩展欧几里得算法。若忽略大整数运算的位复杂度，总时间为

$$
O\left(\sum_{i=1}^k\log m_i\right),
$$

保存余数和模数需要 $O(k)$ 空间。

## 需要记住什么

1. 经典 CRT 对模数有什么要求？解在哪个模数下唯一？
2. $M$ 和 $M_i$ 分别如何定义？
3. 为什么 $M_i$ 对除 $m_i$ 以外的模数都为 $0$？
4. 为什么 $M_i$ 在模 $m_i$ 下一定存在逆元 $t_i$？
5. $E_i=M_it_i$ 为什么可以被理解为只打开第 $i$ 个余数条件的开关？
6. 如何由这些开关组合出 CRT 的解？

## 下一篇

如果模数不两两互质，$M_i$ 的逆元可能不存在。[数论：扩展中国剩余定理（exCRT）](extended-chinese-remainder-theorem.md) 会放弃“一次构造全部开关”，改为每次合并两个同余方程。
