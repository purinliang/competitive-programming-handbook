# 数论：扩展欧几里得算法

> 最近修订：2026-08-13 04:05 +10:00（未审阅）

[欧几里得算法](euclidean-algorithm.md) 可以求出 $\gcd(a,b)$，但有些问题还需要知道：怎样用 $a$ 和 $b$ 的整数倍凑出这个最大公约数？

扩展欧几里得算法（extended Euclidean algorithm）在计算最大公约数的同时，找到一组整数 $x,y$，使

$$
ax+by=\gcd(a,b).
$$

例如，

$$
252\times(-2)+105\times5=21=\gcd(252,105).
$$

这组 $x,y$ 称为裴蜀系数。系数通常不唯一；算法只需稳定地返回其中一组。

## 它能解决什么

扩展欧几里得是下列问题的共同基础：

- 二元线性不定方程 $ax+by=c$；
- 线性同余方程 $ax\equiv c\pmod m$；
- 模数不一定是质数时的乘法逆元；
- 中国剩余定理中的模数合并。

这些应用各自还需要可解条件、解的范围和题目边界，因此由独立文章展开。本篇只推导“如何在求 `gcd` 时同时求出裴蜀系数”。

## 递归终点

欧几里得算法最后会到达

$$
\gcd(a,0)=a.
$$

此时

$$
a\times1+0\times0=a,
$$

所以可以直接返回

```cpp
return {a, 1, 0};
```

三个返回值依次是 `gcd`、$a$ 的系数和 $b$ 的系数。

## 从子问题回代

欧几里得算法把 $(a,b)$ 变成 $(b,a\bmod b)$。假设递归已经为这个更小的问题找到了 $x_1,y_1$：

$$
bx_1+(a\bmod b)y_1=\gcd(b,a\bmod b).
$$

右边也就是 $\gcd(a,b)$。再使用

$$
a\bmod b=a-\left\lfloor\frac ab\right\rfloor b
$$

替换余数：

$$
\begin{aligned}
bx_1+(a\bmod b)y_1
&=bx_1+\left(a-\left\lfloor\frac ab\right\rfloor b\right)y_1\\
&=ay_1+b\left(x_1-\left\lfloor\frac ab\right\rfloor y_1\right).
\end{aligned}
$$

对照 $ax+by$ 的系数，得到

$$
x=y_1,
$$

$$
y=x_1-\left\lfloor\frac ab\right\rfloor y_1.
$$

这两行不是需要凭空记忆的公式；它们只是把 $a\bmod b$ 换回 $a-qb$ 后，重新收集 $a,b$ 的系数。

## 手算回代

对 $252$ 和 $105$，辗转相除得到

$$
252=2\times105+42,
$$

$$
105=2\times42+21.
$$

从最后一个非零余数开始回代：

$$
21=105-2\times42.
$$

再用 $42=252-2\times105$ 替换 $42$：

$$
\begin{aligned}
21
&=105-2(252-2\times105)\\
&=-2\times252+5\times105.
\end{aligned}
$$

因此一组裴蜀系数是 $x=-2,y=5$。

## 翻译成代码

函数需要同时返回 `gcd`、$x$ 和 $y$，因此使用 `tuple<ll, ll, ll>`：

```cpp
tuple<ll, ll, ll> exgcd(ll a, ll b) {
    if (b == 0) {
        return {a, 1, 0};
    }

    auto [g, x1, y1] = exgcd(b, a % b);
    ll x = y1;
    ll y = x1 - a / b * y1;
    return {g, x, y};
}
```

调用时使用结构化绑定给三个结果命名：

```cpp
auto [g, x, y] = exgcd(a, b);
```

调用结束后始终满足

```text
a * x + b * y = g
```

直接返回三个结果比“返回 `gcd`，再通过两个引用参数修改 `x,y`”更完整地表达了函数的含义。

本篇假设 $a,b$ 是非负整数且不同时为 $0$，中间结果能够放入 64 位整数。若题目允许负参数，先统一符号，不把 C++ 负数整除的截断规则带入本篇推导。

## 完整代码

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

tuple<ll, ll, ll> exgcd(ll a, ll b) {
    if (b == 0) {
        return {a, 1, 0};
    }

    auto [g, x1, y1] = exgcd(b, a % b);
    ll x = y1;
    ll y = x1 - a / b * y1;
    return {g, x, y};
}

int main() {
    ll a, b;
    scanf("%lld%lld", &a, &b);

    auto [g, x, y] = exgcd(a, b);
    printf("%lld %lld %lld\n", g, x, y);
    return 0;
}
```

输入：

```text
252 105
```

输出：

```text
21 -2 5
```

系数不唯一，其他正确实现可能输出不同的 $x,y$；只要满足 $252x+105y=21$ 就是正确结果。

## 从裴蜀系数到典型问题

本篇不实现这些上层问题，但可以先看到它们为什么都会回到裴蜀系数。

对二元线性不定方程

$$
ax+by=c,
$$

所有 $ax+by$ 都是 $g=\gcd(a,b)$ 的倍数；而 `exgcd` 已经证明 $g$ 本身能被凑出。因此有解的充要条件是 $g\mid c$。若 $g\mid c$，把一组裴蜀系数同时乘以 $c/g$ 就得到一组解。例如已知

$$
252\times(-2)+105\times5=21,
$$

将系数同时乘以 $2$，就得到 $252x+105y=42$ 的一组解 $x=-4,y=10$。

线性同余方程

$$
ax\equiv c\pmod m
$$

等价于存在整数 $y$ 使 $ax+my=c$，所以同样由 $\gcd(a,m)\mid c$ 决定是否有解。例如 $14x\equiv30\pmod{100}$ 有解，因为 $\gcd(14,100)=2$ 整除 $30$；其中一个最小非负解是 $x=45$。

当 $c=1$ 时，同余方程就是求 $a$ 模 $m$ 的乘法逆元。例如

$$
7\times(-2)+15\times1=1,
$$

因此 $-2$ 归一化到 $[0,15)$ 后的 $13$ 是 $7$ 模 $15$ 的逆元。这也说明模数不必是质数；准确条件是 $\gcd(a,m)=1$。

求出一组解之后如何表示全部解、归一化到指定区间以及处理题目范围，都由对应的独立文章继续展开。

## 复杂度

`exgcd` 与欧几里得算法进行相同次数的辗转相除，时间复杂度为 $O(\log\min(a,b))$，递归栈空间为 $O(\log\min(a,b))$。

## 基础练习

1. 手算 `exgcd(99, 78)` 的辗转相除与回代过程，并验证返回的 $x,y$。
2. 从 $bx_1+(a\bmod b)y_1$ 出发，独立推出上一层的 $x,y$。
3. 修改完整代码，在输出后再计算 `a * x + b * y`，检查它是否等于 `g`。

## 需要记住什么

1. 扩展欧几里得算法比欧几里得算法多返回了什么？
2. `b == 0` 时为什么可以返回 `{a, 1, 0}`？
3. 为什么把 $a\bmod b$ 换成 $a-(a/b)b$ 就能得到上一层系数？
4. 回代后的 $x,y$ 分别是什么？
5. 为什么裴蜀系数不唯一？本算法是否会自动返回最小非负解？

## 典型应用

[线性不定方程](linear-diophantine-equations.md)、[线性同余方程](linear-congruences.md) 和
[模逆元](modular-inverse.md) 会分别使用这组裴蜀系数解决具体问题；
[中国剩余定理](chinese-remainder-theorem.md) 会用它合并同余条件。
