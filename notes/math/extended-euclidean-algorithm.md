# 数论：扩展欧几里得算法

> 状态：草稿

[数论：欧几里得算法](euclidean-algorithm.md) 只输出 $\gcd(a,b)$。但后续解线性不定方程和同余方程时，我们还需要知道这个最大公约数怎样由原来的 $a,b$ 相加、相减而来。

## 裴蜀等式

对不同时为 $0$ 的整数 $a,b$，存在整数 $x,y$，使得

$$
ax+by=\gcd(a,b).
$$

这个等式称为**裴蜀等式**（Bézout identity），$x,y$ 称为一组裴蜀系数。

扩展欧几里得算法（extended Euclidean algorithm）在计算 $\gcd(a,b)$ 的同时，返回其中一组 $x,y$。系数通常不唯一；算法只需找到一组。

## 终止位置的系数

欧几里得算法最后会到达

$$
\gcd(a,0)=a
$$

的边界。在这里，等式

$$
a\times1+0\times0=a
$$

已经直接给出了系数

$$
x=1,\qquad y=0.
$$

所以问题不是“怎样猜出最底层的系数”，而是“怎样把它们沿着辗转相除的过程反向带回去”。

## 从子问题回代

欧几里得算法把 $(a,b)$ 变成 $(b,a\bmod b)$。假设递归已经为更小的问题找到了 $x_1,y_1$：

$$
bx_1+(a\bmod b)y_1=\gcd(b,a\bmod b).
$$

根据欧几里得算法，右边也是 $\gcd(a,b)$。再使用

$$
a\bmod b=a-\left\lfloor\frac ab\right\rfloor b,
$$

把余数替换回 $a,b$：

$$
\begin{aligned}
bx_1+(a\bmod b)y_1
&=bx_1+\left(a-\left\lfloor\frac ab\right\rfloor b\right)y_1\\
&=ay_1+b\left(x_1-\left\lfloor\frac ab\right\rfloor y_1\right).
\end{aligned}
$$

现在它已经变成 $ax+by$ 的形式。对照系数得到

$$
x=y_1,
$$

$$
y=x_1-\left\lfloor\frac ab\right\rfloor y_1.
$$

这两行不是需要凭空背诵的公式；它们只是把 $a\bmod b$ 换回 $a-qb$ 后，重新收集 $a,b$ 的系数。

## 手算回代

欧几里得算法已经得到

$$
252=2\times105+42,
$$

$$
105=2\times42+21.
$$

从最后一个非零余数开始：

$$
21=105-2\times42.
$$

再用第一个式子中的 $42=252-2\times105$ 替换 $42$：

$$
\begin{aligned}
21
&=105-2(252-2\times105)\\
&=-2\times252+5\times105.
\end{aligned}
$$

所以对 $a=252,b=105$，一组系数是

$$
x=-2,\qquad y=5.
$$

代回验证：

$$
252\times(-2)+105\times5=21=\gcd(252,105).
$$

## 翻译成代码

递归函数除了返回 `gcd`，还需要通过引用参数带回 `x` 和 `y`：

```cpp
long long exgcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }

    long long x1, y1;
    long long g = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - a / b * y1;
    return g;
}
```

调用结束后始终满足

```text
a * x + b * y = g
```

本篇代码假设 $a,b$ 是非负整数且不同时为 $0$。负数会让 C++ 整除向零截断的细节进入推导；若题目允许负参数，应当先统一符号再调用。

## 完整代码

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

    ll x1, y1;
    ll g = exgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - a / b * y1;
    return g;
}

int main() {
    ll a, b;
    scanf("%lld%lld", &a, &b);

    ll x, y;
    ll g = exgcd(a, b, x, y);
    printf("%lld %lld %lld\n", g, x, y);
    return 0;
}
```

## 为什么它能解方程

因为 $g=\gcd(a,b)$ 同时整除 $a,b$，所有整数线性组合 $ax+by$ 都是 $g$ 的倍数。另一方面，扩展欧几里得算法已经找到一组系数使 $ax+by=g$；把两个系数同时乘以整数 $t$，就可以得到 $tg$。

因此，线性不定方程

$$
ax+by=c
$$

存在整数解当且仅当

$$
\gcd(a,b)\mid c.
$$

这个结论就是扩展欧几里得算法能够求线性同余方程、模逆元和合并同余式的根本原因。

## 复杂度

它与欧几里得算法进行相同次数的辗转相除，时间复杂度为 $O(\log\min(a,b))$，递归栈空间为 $O(\log\min(a,b))$。

## 需要记住什么

1. 裴蜀等式说了什么？系数 $x,y$ 是否唯一？
2. 当 `b == 0` 时，为什么可以返回 `x = 1, y = 0`？
3. 从 $bx_1+(a\bmod b)y_1$ 回代后，新的 $x,y$ 分别是什么？
4. 为什么这两行更新式只是“代入余数定义并收集系数”？
5. 方程 $ax+by=c$ 存在整数解的充要条件是什么？

## 下一篇

在掌握同余和模逆元的基本定义后，[数论：中国剩余定理（CRT）](chinese-remainder-theorem.md) 会使用这里求出的裴蜀系数，把多个两两互质的同余条件组合起来。
