# 线性不定方程

> 最近修订：2026-08-15 21:27 +10:00（未审阅）

给定正整数 `a,b` 和整数 `c`，寻找整数 `x,y`，使：

$$
ax+by=c.
$$

未知数有两个、方程只有一个，所以有解时通常不止一组。这类要求整数解的方程称为二元线性不定方程。

例如购买单价为 `6` 和 `9` 的两种物品，若允许数量暂时取任意整数，凑出总价 `30` 就对应：

$$
6x+9y=30.
$$

本篇解决三个问题：什么时候有整数解、怎样求出一组解、怎样表示全部整数解。核心工具是 [扩展欧几里得算法](extended-euclidean-algorithm.md) 返回的裴蜀系数。

## 可解条件

令：

$$
g=\gcd(a,b).
$$

因为 `g` 同时整除 `a` 和 `b`，它也整除任意整数线性组合 `ax+by`。所以若方程有解，必须满足：

$$
g\mid c.
$$

这个条件也充分。扩展欧几里得算法能找到 `x0,y0`，使：

$$
ax_0+by_0=g.
$$

若 `g` 整除 `c`，令：

$$
scale=\frac cg,
$$

再把等式两边同时乘以 `scale`：

$$
a(x_0\cdot scale)+b(y_0\cdot scale)=c.
$$

因此有解的充要条件是：

$$
\gcd(a,b)\mid c.
$$

## 求出一组解

代码直接翻译上面的证明：

```cpp
auto [g, x, y] = exgcd(a, b);
if (c % g != 0) {
    // 无整数解
}

ll scale = c / g;
x *= scale;
y *= scale;
```

例如扩展欧几里得算法给出：

$$
6\times(-1)+9\times1=3.
$$

因为 `30/3=10`，把系数同时乘以 `10`：

$$
6\times(-10)+9\times10=30.
$$

所以 `x=-10,y=10` 是一组解。它不是非负解，也不需要是数值最小的解；当前步骤只负责稳定地找到任意一组整数解。

## 从一组解得到更多解

把已经求出的一组解记作 $(x_0,y_0)$，于是：

$$
ax_0+by_0=c.
$$

把 `x` 增加 `b/g`，同时把 `y` 减少 `a/g`：

$$
\begin{aligned}
a\left(x+\frac bg\right)+b\left(y-\frac ag\right)
&=ax+by+\frac{ab}{g}-\frac{ab}{g}\\
&=c.
\end{aligned}
$$

因此对任意整数 `k`：

$$
x=x_0+k\frac bg,
$$

$$
y=y_0-k\frac ag
$$

都是解。

定义两个步长：

```cpp
step_x = b / g;
step_y = -a / g;
```

每当参数 `k` 增加 `1`，`x` 增加 `step_x`，`y` 增加 `step_y`。

对 `6x+9y=30`，从 `(-10,10)` 出发：

```text
x = -10 + 3k
y =  10 - 2k
```

取 `k=4` 就得到非负解 `x=2,y=2`。

## 为什么这些是全部解

设 `(x0,y0)` 和 `(x,y)` 都是方程的解。两式相减：

$$
a(x-x_0)+b(y-y_0)=0.
$$

两边除以 `g`：

$$
\frac ag(x-x_0)=-\frac bg(y-y_0).
$$

`a/g` 与 `b/g` 互质。右边说明 `b/g` 整除 `(a/g)(x-x0)`；由于二者互质，只能是 `b/g` 整除 `x-x0`。所以存在整数 `k`：

$$
x-x_0=k\frac bg.
$$

代回原式得到：

$$
y-y_0=-k\frac ag.
$$

所以所有整数解都恰好包含在上述参数形式中，没有遗漏。

## 选择指定范围内的解

全部解沿参数 `k` 等距排列。若只希望把 `x` 规范到：

$$
0\le x<\frac bg,
$$

可以先取得这个周期内的标准代表值：

```cpp
ll period = b / g;
ll normalized_x = x % period;
if (normalized_x < 0) {
    normalized_x += period;
}
```

因为 `normalized_x-x` 一定是 `period` 的整数倍：

```cpp
ll k = (normalized_x - x) / period;
x += k * step_x;
y += k * step_y;
```

这会得到同一组参数解中唯一满足该 `x` 范围的解。若题目还要求 `x,y` 同时非负或落在其他闭区间，需要根据两个关于 `k` 的不等式求参数交集；那是范围计数问题，不属于本篇基础方程求解。

## 完整代码

结果包含是否有解、一组解和两个参数步长，使用专门的 `DiophantineSolution` 一次返回。基础版本假设 `a,b>0`，并且系数乘法与解都能放入 64 位整数。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct DiophantineSolution {
    bool exists;
    ll x;
    ll y;
    ll step_x;
    ll step_y;
};

tuple<ll, ll, ll> exgcd(ll a, ll b) {
    if (b == 0) {
        return {a, 1, 0};
    }

    auto [g, x1, y1] = exgcd(b, a % b);
    ll x = y1;
    ll y = x1 - a / b * y1;
    return {g, x, y};
}

DiophantineSolution solve_diophantine(ll a, ll b, ll c) {
    auto [g, x, y] = exgcd(a, b);
    if (c % g != 0) {
        return {false, 0, 0, 0, 0};
    }

    ll scale = c / g;
    x *= scale;
    y *= scale;
    return {true, x, y, b / g, -a / g};
}

int main() {
    ll a, b, c;
    scanf("%lld%lld%lld", &a, &b, &c);

    DiophantineSolution solution = solve_diophantine(a, b, c);
    if (!solution.exists) {
        printf("No\n");
        return 0;
    }

    printf("%lld %lld\n", solution.x, solution.y);
    printf("%lld %lld\n", solution.step_x, solution.step_y);
    return 0;
}
```

输入：

```text
6 9 30
```

输出：

```text
-10 10
3 -2
```

输出表示一组解是 `(-10,10)`，所有解为：

```text
x = -10 + 3k
y =  10 - 2k
```

其中 `k` 可以是任意整数。扩展欧几里得算法返回的裴蜀系数不唯一，因此其他正确实现可能输出同一参数序列中的另一组初始解；只要参数式覆盖相同解集即可。

## 复杂度

主要工作只有一次扩展欧几里得算法，时间复杂度是 $O(\log\min(a,b))$，递归栈空间是 $O(\log\min(a,b))$。从一组解计算步长只需要 $O(1)$ 时间和空间。

表示全部解不需要真的枚举无限多个 `k`；一组初始解与两个步长已经完整描述解集。

## 常见错误

### 只检查 c 是否能被 a 或 b 整除

准确条件是 `gcd(a,b)` 整除 `c`。即使 `a` 和 `b` 都不单独整除 `c`，它们的整数线性组合仍可能得到 `c`。

### 忘记把裴蜀系数乘以 c/g

`exgcd` 返回的系数只凑出 `g`。方程右边是 `c` 时，两个系数必须同时缩放。

### 步长没有除以 gcd

全部解的最小参数步长是 `b/g` 与 `-a/g`，不是直接使用 `b` 与 `-a`。后者虽然也能得到一部分解，却会漏掉中间解。

### 两个步长使用同号

增加 `x` 会让 `ax` 增大，因此必须同时减少 `y` 才能保持总和不变。

### 把任意一组解误认为非负解

扩展欧几里得算法不负责范围。需要非负或区间约束时，必须继续选择合适参数 `k`。

### 忽略中间乘法范围

即使 `a,b,c` 都在 64 位整数中，裴蜀系数乘 `c/g` 也可能溢出。模板成立的前提包括题目保证全部所需结果能够放入 64 位整数。

## 基础练习

1. 判断 `6x+9y=20` 是否有整数解，并说明依据。
2. 从 `6*(-1)+9*1=3` 出发求 `6x+9y=30` 的一组解和全部解。
3. 验证参数 `k` 改变时 `ax+by` 保持不变。
4. 对 `15x+25y=5` 求一组解，并检查步长为什么是 `5` 与 `-3`。
5. 把一组解的 `x` 规范到 `[0,b/g)`，同步更新 `y` 并验证方程。
6. 随机生成小系数，用有限范围暴力枚举检查无解条件和程序返回的一组解。

## 需要记住什么

1. `ax+by=c` 有整数解的充要条件是什么？
2. 扩展欧几里得算法先凑出什么值？怎样缩放成方程的一组解？
3. 全部解中 `x` 和 `y` 随参数 `k` 分别怎样变化？
4. 为什么步长必须除以 `gcd(a,b)`？
5. 怎样证明参数式包含全部整数解？
6. 任意一组整数解是否自动满足非负或题目区间限制？
7. 求解的时间复杂度来自哪个算法？

零系数、负系数、同时限制 `x,y` 的上下界以及统计范围内解的数量，需要增加符号和整数上下取整规则。它们是在全部解参数式上的进一步应用，不要求在基础版本中记忆。
