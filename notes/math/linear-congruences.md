# 线性同余方程

> 最近修订：2026-08-15 21:30 +10:00（未审阅）

给定整数 `a,c` 和正整数 `m`，寻找整数 `x`，使：

$$
ax\equiv c\pmod m.
$$

这称为一元线性同余方程。它常见于周期条件、模意义下的除法，以及“经过多少次固定步长能够到达目标余数”等问题。

例如：

$$
14x\equiv30\pmod {100}.
$$

我们需要判断它是否有解、求出一个最小非负解，并描述模 `100` 意义下的全部不同解。

## 转换成线性不定方程

同余定义说明 `ax-c` 是 `m` 的整数倍，因此存在整数 `y`：

$$
ax-c=my.
$$

移项得到：

$$
ax-my=c.
$$

把 `-y` 重新命名为一个整数未知数，等价地写成：

$$
ax+my=c.
$$

这正是 [线性不定方程](linear-diophantine-equations.md) 的形式。同余方程只关心 `x`；另一个未知数表示相差了多少个完整模数，不需要输出。

## 可解条件

令：

$$
g=\gcd(a,m).
$$

线性不定方程 `ax+my=c` 有整数解的充要条件是：

$$
g\mid c.
$$

所以线性同余方程的可解条件同样是：

$$
\gcd(a,m)\mid c.
$$

例如 `gcd(14,100)=2`，而 `2` 整除 `30`，所以：

$$
14x\equiv30\pmod {100}
$$

有解。若右边改成 `31`，`2` 不整除 `31`，就没有任何整数解。

## 用扩展欧几里得求一组解

[扩展欧几里得算法](extended-euclidean-algorithm.md) 找到 `x0,y0`，使：

$$
ax_0+my_0=g.
$$

若 `g` 整除 `c`，把两个系数同时乘以 `c/g`：

$$
a\left(x_0\frac cg\right)+m\left(y_0\frac cg\right)=c.
$$

因此：

$$
x=x_0\frac cg
$$

是一组同余方程解。

对示例，扩展欧几里得可以得到：

$$
14\times(-7)+100\times1=2.
$$

乘以 `30/2=15`：

$$
14\times(-105)+100\times15=30.
$$

所以 `x=-105` 是一组解。

## 解的周期

线性不定方程的全部 `x` 为：

$$
x=x_0\frac cg+k\frac mg,
$$

其中 `k` 是任意整数。因此 `x` 每增加：

$$
step=\frac mg
$$

就得到另一个解。

把任意一组解规范到 `[0,step-1]`，得到这个较小周期内唯一的标准解 `first`。示例中：

```text
step = 100 / 2 = 50
-105 mod 50 = 45
```

所以最小非负基础解是 `45`。在模 `100` 的完整范围 `[0,99]` 中，全部不同解是：

```text
45
45 + 50 = 95
```

## 为什么恰好有 g 个解

所有解按 `step=m/g` 递增。在模 `m` 意义下，依次取：

$$
first+k\frac mg,\qquad k=0,1,\ldots,g-1.
$$

这 `g` 个数都位于 `[0,m-1]`，并且两两不同。再增加一次参数：

$$
g\times\frac mg=m,
$$

恰好回到与 `first` 同余的位置。

因此方程有解时：

- 在模 `m/g` 意义下只有一个解；
- 在模 `m` 的完整剩余系中恰好有 `g` 个不同解；
- 相邻解的间隔是 `m/g`。

当 `g=1` 时，解在模 `m` 意义下唯一。

## 计算标准解

扩展欧几里得系数与缩放因子相乘可能超出 64 位中间范围。GNU C++ 竞赛环境可以先用 `__int128` 完成乘法，再对周期取模：

```cpp
ll step = m / g;
ll first = (__int128)x * (c / g) % step;
if (first < 0) {
    first += step;
}
```

最终 `first` 位于 `[0,step-1]`，能够放回 64 位整数。`__int128` 只解决这一处乘法容量，不改变算法本身。

结果可以用四个字段描述：

```text
exists：是否有解
first：最小非负基础解
step：相邻解间隔
count：模 m 范围内的不同解数量
```

其中 `count=g`。

## 完整代码

函数先把 `a` 规范到 `[0,m-1]`，因此也能接受负系数 `a`。模数必须满足 `m>0`。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct CongruenceSolution {
    bool exists;
    ll first;
    ll step;
    ll count;
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

CongruenceSolution solve_congruence(ll a, ll c, ll m) {
    a %= m;
    if (a < 0) {
        a += m;
    }

    auto result = exgcd(a, m);
    ll g = get<0>(result);
    ll x = get<1>(result);
    if (c % g != 0) {
        return {false, 0, 0, 0};
    }

    ll step = m / g;
    ll first = (__int128)x * (c / g) % step;
    if (first < 0) {
        first += step;
    }
    return {true, first, step, g};
}

int main() {
    ll a, c, m;
    scanf("%lld%lld%lld", &a, &c, &m);

    CongruenceSolution solution = solve_congruence(a, c, m);
    if (!solution.exists) {
        printf("No\n");
        return 0;
    }

    printf("%lld %lld %lld\n", solution.first, solution.step, solution.count);
    return 0;
}
```

输入：

```text
14 30 100
```

输出：

```text
45 50 2
```

输出表示最小非负基础解是 `45`，相邻解相差 `50`，模 `100` 范围内共有 `2` 个不同解，即 `45` 和 `95`。

## 与模逆元的关系

当右边 `c=1` 时：

$$
ax\equiv1\pmod m.
$$

解 `x` 就是 `a` 模 `m` 的乘法逆元。可解条件变成：

$$
\gcd(a,m)=1.
$$

因此模逆元不是另一条无关公式，而是线性同余方程的特殊情况。[模逆元](modular-inverse.md) 会聚焦它的含义、使用方式和常见计算方法。

## 复杂度

主要工作是一次扩展欧几里得算法，时间复杂度为 $O(\log m)$，递归栈空间为 $O(\log m)$。求标准解、周期和解数只需 $O(1)$ 时间。

描述全部解不需要枚举 `count` 个值；只有题目明确要求输出每个解时，才额外花费 $O(count)$ 时间。

## 常见错误

### 把可解条件写成 gcd 等于 1

一般方程只要求 `gcd(a,m)` 整除 `c`。只有右边是 `1` 的模逆元问题才要求最大公约数为 `1`。

### 忘记乘以 c/g

扩展欧几里得系数只凑出 `g`，必须乘以 `c/g` 才得到原方程的一组解。

### 把周期写成 m

最小解周期是 `m/g`。只按 `m` 平移会漏掉同一模 `m` 范围内的其他解。

### 只输出一个解却声称唯一

当 `g>1` 时，模 `m` 范围内有 `g` 个不同解。`first` 只是在较小周期内的标准代表。

### 负解没有规范化

C++ `%` 可能产生负余数。对 `step` 取余后，负数必须再加一次 `step`。

### 缩放乘法先溢出

`x*(c/g)` 会在 `%step` 以前完成。一般 64 位输入使用 `__int128` 保存这一处中间乘积。

## 基础练习

1. 判断 `6x≡8 (mod 14)` 是否有解，并写出可解条件中的 `g`。
2. 求 `14x≡30 (mod 100)` 的基础解、周期和模 `100` 范围内全部解。
3. 构造一个 `g>1` 但仍有解的方程，验证解数恰好是 `g`。
4. 构造一个 `g` 不整除 `c` 的方程，说明为什么不存在整数解。
5. 测试负系数 `a`，先把它规范到 `[0,m-1]` 再求解。
6. 对小模数暴力枚举 `x=0..m-1`，与程序返回的 `first,step,count` 随机对拍。

## 需要记住什么

1. `ax≡c (mod m)` 怎样转换成二元线性不定方程？
2. 方程有解的充要条件是什么？
3. 扩展欧几里得返回的系数为什么要乘以 `c/g`？
4. 解的最小周期为什么是 `m/g`？
5. 有解时，模 `m` 范围内为什么恰好有 `g` 个不同解？
6. 怎样把任意一组解规范成最小非负基础解？
7. 为什么一般线性同余方程不要求 `g=1`，而模逆元要求？
8. 哪一处乘法可能需要 `__int128`？

多元线性同余方程组、中国剩余定理和带上下界的解计数需要继续合并多个条件，不属于本篇单个线性同余方程。
