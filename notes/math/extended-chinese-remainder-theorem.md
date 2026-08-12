# 数论：扩展中国剩余定理（exCRT）

> 状态：草稿

[数论：中国剩余定理（CRT）](chinese-remainder-theorem.md) 通过模逆元构造互不干扰的余数开关，但它要求模数两两互质。当模数不互质时，方程组可能无解，也可能仍然有解；只是原来的开关无法保证存在。

扩展中国剩余定理（extended Chinese remainder theorem，exCRT）不再一次性构造全部解，而是先搞清楚两个同余方程如何判断冲突并合并，再从左到右重复这个操作。

## 两个同余方程

先只考虑

$$
\begin{cases}
x\equiv a_1\pmod{m_1},\\
x\equiv a_2\pmod{m_2}.
\end{cases}
$$

第一个方程的全部解可以写成

$$
x=a_1+m_1t,
$$

其中 $t$ 是待定整数。这一步不是猜测：“$x$ 模 $m_1$ 余 $a_1$”本来就表示 $x-a_1$ 是 $m_1$ 的整数倍。

## 把第二个条件交给参数

将 $x=a_1+m_1t$ 代入第二个方程：

$$
a_1+m_1t\equiv a_2\pmod{m_2}.
$$

移项得到

$$
m_1t\equiv a_2-a_1\pmod{m_2}.
$$

令

$$
c=a_2-a_1,
$$

合并两个同余方程就变成了求一个线性同余方程

$$
m_1t\equiv c\pmod{m_2}.
$$

## 从同余变成线性组合

同余式 $m_1t\equiv c\pmod{m_2}$ 表示 $m_1t-c$ 是 $m_2$ 的整数倍。因此存在整数 $y$，使得

$$
m_1t+m_2y=c.
$$

设

$$
g=\gcd(m_1,m_2).
$$

因为 $g$ 整除左边的每一项，所以若方程有解，必须有

$$
g\mid c.
$$

这就是两个同余条件不冲突的充要条件。

例如，

$$
x\equiv1\pmod4,
$$

$$
x\equiv2\pmod6
$$

无解。因为 $\gcd(4,6)=2$，但 $2-1=1$ 不能被 $2$ 整除。第一个条件要求 $x$ 是奇数，第二个条件要求 $x$ 是偶数，冲突已经可以直观看出。

## 用扩展欧几里得求参数

若 $g\mid c$，[数论：扩展欧几里得算法](extended-euclidean-algorithm.md) 可以找到 $s,y_0$，使得

$$
m_1s+m_2y_0=g.
$$

两边乘以 $c/g$：

$$
m_1\left(s\frac cg\right)+m_2\left(y_0\frac cg\right)=c.
$$

与 $m_1t+m_2y=c$ 对比，得到一个可行的

$$
t_0=s\frac cg.
$$

但 $t$ 不是唯一的。将原同余式同时除以 $g$：

$$
\frac{m_1}{g}t\equiv\frac cg\pmod{\frac{m_2}{g}}.
$$

$m_1/g$ 与 $m_2/g$ 互质，所以 $t$ 在模 $m_2/g$ 下唯一。代码只需把 $t_0$ 规范到

$$
0\le t<\frac{m_2}{g}.
$$

## 得到合并后的方程

将求出的 $t$ 代回

$$
x=a_1+m_1t
$$

得到一个同时满足两个条件的解。

合并后的所有解以两个模数的最小公倍数为周期：

$$
m'=\operatorname{lcm}(m_1,m_2)=\frac{m_1}{g}m_2.
$$

这也可以从 $t$ 的周期看出。$t$ 增加 $m_2/g$ 时，$x=a_1+m_1t$ 增加

$$
m_1\frac{m_2}{g}=\operatorname{lcm}(m_1,m_2).
$$

因此两个方程可以被一个完全等价的新方程取代：

$$
x\equiv a'\pmod{m'},
$$

其中

$$
a'=(a_1+m_1t)\bmod m'.
$$

## 逐个合并

有了两个方程的合并方法，整个方程组就变成一个反复执行的过程：

```text
第 1 个方程
    + 第 2 个方程
    = 一个合并后的方程

合并结果
    + 第 3 个方程
    = 新的合并结果

...
```

只要任意一次出现 $g\nmid c$，就说明当前结果与新条件冲突，整个方程组无解。

## 完整代码

下面的 `merge_congruence` 把

```text
x = a1 (mod m1)
```

和

```text
x = a2 (mod m2)
```

合并，并将结果写回 `a1, m1`。程序假设最终的最小公倍数可以放入 `long long`；中间乘法使用 `__int128`。

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

bool merge_congruence(ll& a1, ll& m1, ll a2, ll m2) {
    ll s, y;
    ll g = exgcd(m1, m2, s, y);
    ll c = a2 - a1;
    if (c % g != 0) {
        return false;
    }

    ll period = m2 / g;
    ll t = mod_norm((i128)s * (c / g), period);

    ll new_mod = m1 / g * m2;
    a1 = mod_norm((i128)a1 + (i128)m1 * t, new_mod);
    m1 = new_mod;
    return true;
}

int main() {
    int n;
    scanf("%d", &n);

    ll mod, ans;
    scanf("%lld%lld", &mod, &ans);
    ans = mod_norm(ans, mod);

    for (int i = 2; i <= n; i++) {
        ll next_mod, next_ans;
        scanf("%lld%lld", &next_mod, &next_ans);
        next_ans = mod_norm(next_ans, next_mod);

        if (!merge_congruence(ans, mod, next_ans, next_mod)) {
            puts("No solution");
            return 0;
        }
    }

    printf("%lld %lld\n", ans, mod);
    return 0;
}
```

输入的每行依次给出模数和余数。输出 `ans mod` 表示全部解为

$$
x\equiv\texttt{ans}\pmod{\texttt{mod}}.
$$

`new_mod = m1 / g * m2` 已经先除后乘，但如果最终最小公倍数超出 `long long`，这份模板仍然不适用。题目若不保证范围，必须另外做溢出检查或使用大整数。

## 与经典 CRT 的关系

若 $m_1,m_2$ 互质，则 $g=1$：

- 有解条件 $g\mid(a_2-a_1)$ 自动满足；
- 合并后模数是 $m_1m_2$；
- 扩展欧几里得求出的系数就是模逆元。

所以经典 CRT 是 exCRT 中每次最大公约数都为 $1$ 的特殊情况。经典 CRT 的“余数开关”构造更直接地展示了两两互质时的整体结构；exCRT 的“逐个合并”则能检测不互质模数之间的冲突。

## 复杂度

每合并一个方程，调用一次扩展欧几里得算法。对 $k$ 个方程，若忽略大整数的位复杂度，总时间可写为

$$
O\left(\sum_{i=2}^k\log\min(M_{i-1},m_i)\right),
$$

其中 $M_{i-1}$ 是前 $i-1$ 个方程合并后的模数。除输入外只保存当前合并结果，额外空间为 $O(1)$。

## 需要记住什么

1. 为什么 $x\equiv a_1\pmod{m_1}$ 的所有解都能写成 $x=a_1+m_1t$？
2. 代入第二个同余方程后，关于 $t$ 的线性同余方程是什么？
3. 两个同余方程有解的充要条件是什么？
4. 扩展欧几里得算法求出 $m_1s+m_2y=g$ 后，为什么 $t=s(c/g)$ 是一个解？
5. $t$ 的周期为什么是 $m_2/g$？
6. 合并后的新模数为什么是 $\operatorname{lcm}(m_1,m_2)$？
7. 经典 CRT 怎样成为 exCRT 的特殊情况？

## 扩展阅读

当合并后的模数超出 `long long`时，需要配合安全乘法、大整数或题目特定的取模要求。这是数值表示的额外问题，不改变本篇的合并原理，也不要求在当前阶段掌握。
