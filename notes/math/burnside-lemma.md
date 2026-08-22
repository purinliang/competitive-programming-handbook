# Burnside 引理

> 最近修订：2026-08-23 06:55 +10:00（未审阅）

把 `n` 颗珠子排成一圈，其中恰好 `k` 颗是黑色。若两种排列可以通过旋转重合，就把
它们视为同一种项链。应该怎样计数？

直接计算 $\binom nk$ 会把同一条项链的多个旋转位置分别计数。但也不能简单除以 `n`：
具有周期性的排列经过若干次旋转后仍与自己相同，一条项链可能没有 `n` 个不同旋转。

Burnside 引理不再尝试判断每个等价类究竟有多大，而是反过来统计每一种旋转固定了
多少个排列，再取平均值。

## 变换把对象分成等价类

设集合 $X$ 包含全部具体黑白排列。允许的 `n` 种旋转组成变换集合 $G$：

$$
G=\{0,1,\ldots,n-1\},
$$

其中 `s` 表示把每颗珠子向前旋转 `s` 个位置。

从一个排列出发，应用所有允许变换能得到的一组排列称为它的轨道。一个轨道就是题目
意义下的一种项链。

对某个旋转 $g$，定义它的固定点集合：

$$
\operatorname{Fix}(g)
=
\{x\in X\mid g(x)=x\}.
$$

例如恒等旋转 `0` 固定所有排列；旋转一个位置通常只固定颜色全部相同的排列。

## Burnside 引理

Burnside 引理说明，轨道数量等于每种变换固定点数量的平均值：

$$
\boxed{
|X/G|
=
\frac{1}{|G|}
\sum_{g\in G}|\operatorname{Fix}(g)|
}
$$

这里 $|X/G|$ 表示把 $X$ 按允许变换划分后得到的等价类数量。

关键不是“所有排列数量除以变换数量”，而是“所有变换的固定点数量之和除以变换
数量”。具有对称性的排列会被更多变换固定，公式会自动补偿它较小的轨道。

## 为什么平均固定点得到轨道数

统计所有二元组：

$$
(x,g),
\qquad g(x)=x.
$$

按变换 $g$ 统计，二元组总数就是：

$$
\sum_{g\in G}|\operatorname{Fix}(g)|.
$$

再按对象所在轨道统计。设一个轨道含有 $s$ 个不同对象。群的大小为 $|G|$，固定其中
任意一个对象的变换数量为 $|G|/s$；这组变换称为该对象的稳定子。

所以整个轨道对二元组总数的贡献为：

$$
s\cdot\frac{|G|}{s}=|G|.
$$

每个轨道都恰好贡献 $|G|$。把二元组总数除以 $|G|$，留下的正是轨道数量。

这个证明也解释了为什么允许的变换必须形成群：需要恒等变换、逆变换和复合封闭，
轨道与稳定子的大小关系才能成立。

## 一次旋转形成若干个循环

考虑向前旋转 `shift` 个位置。不断旋转同一个位置，会依次访问：

$$
i,
i+shift,
i+2\cdot shift,
\ldots
\pmod n.
$$

这会把 `n` 个位置划分成：

$$
cycle\_count=\gcd(n,shift)
$$

个循环，每个循环长度为：

$$
cycle\_length=\frac{n}{\gcd(n,shift)}.
$$

一个排列要被这次旋转固定，同一循环中的所有位置必须颜色相同；否则旋转后某个位置
会换成不同颜色。

## 固定黑珠数量怎样限制循环

每个循环要么全部为黑色，要么全部为白色。若选一个循环染黑，就会一次贡献
`cycle_length` 颗黑珠。

因此：

- 若 `k` 不能被 `cycle_length` 整除，这次旋转没有固定排列；
- 否则必须从 `cycle_count` 个循环中选择 `k / cycle_length` 个染黑。

固定点数量为：

$$
|\operatorname{Fix}(shift)|
=
\binom{cycle\_count}{k/cycle\_length}.
$$

把所有 `shift = 0..n-1` 的固定点数量相加，再除以 `n`，就是答案。

## 一个小例子

令 `n = 4`、`k = 2`：

- 旋转 `0`：四个长度 `1` 的循环，固定 $\binom42=6$ 个排列；
- 旋转 `1`：一个长度 `4` 的循环，无法得到恰好两颗黑珠，固定 `0` 个；
- 旋转 `2`：两个长度 `2` 的循环，选择一个染黑，固定 $\binom21=2$ 个；
- 旋转 `3`：与旋转 `1` 相同，固定 `0` 个。

平均值为：

$$
\frac{6+0+2+0}{4}=2.
$$

两种项链分别是两颗黑珠相邻和两颗黑珠相对。

## 完整代码

输入 `n` 和 `k`，计算恰有 `k` 颗黑珠的长度 `n` 黑白项链数量，只把旋转视为相同，
不把翻转视为相同。答案对质数 $10^9+7$ 取模。

保证 `1 <= n < MOD`、`0 <= k <= n`。由于最终整数公式中需要除以群大小 `n`，代码
在模意义下乘以 `n` 的逆元。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1e9 + 7;

int n;
int k;
vector<ll> factorial;
vector<ll> inverse_factorial;

ll mod_pow(ll base, ll exponent) {
    ll result = 1;
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = result * base % MOD;
        }
        base = base * base % MOD;
        exponent /= 2;
    }
    return result;
}

void prepare_factorials() {
    factorial.assign(n + 5, 1);
    inverse_factorial.assign(n + 5, 1);

    for (int i = 1; i <= n; ++i) {
        factorial[i] = factorial[i - 1] * i % MOD;
    }

    inverse_factorial[n] = mod_pow(factorial[n], MOD - 2);
    for (int i = n; i >= 1; --i) {
        inverse_factorial[i - 1] = inverse_factorial[i] * i % MOD;
    }
}

ll combination(int total, int selected) {
    if (selected < 0 || selected > total) {
        return 0;
    }
    return factorial[total] * inverse_factorial[selected] % MOD *
           inverse_factorial[total - selected] % MOD;
}

ll count_necklaces() {
    ll fixed_sum = 0;

    for (int shift = 0; shift < n; ++shift) {
        int cycle_count = gcd(n, shift);
        int cycle_length = n / cycle_count;

        if (k % cycle_length != 0) {
            continue;
        }

        int black_cycles = k / cycle_length;
        fixed_sum = (fixed_sum + combination(cycle_count, black_cycles)) % MOD;
    }

    return fixed_sum * mod_pow(n, MOD - 2) % MOD;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> k;
    prepare_factorials();
    cout << count_necklaces() << '\n';
    return 0;
}
```

## 复杂度

预处理阶乘需要 $O(n)$ 时间与空间。枚举全部 `n` 种旋转，每次计算一次 GCD：

- 时间复杂度为 $O(n\log n+\log MOD)$；
- 空间复杂度为 $O(n)$。

这里没有枚举 $\binom nk$ 个具体排列。对称性只通过每种旋转的循环数量进入公式。

## 旋转和翻转不能混淆

本文只允许旋转，变换群是循环群，共有 `n` 个元素。若项链翻面后也视为相同，还要
加入 `n` 种反射，群大小变成 `2n`；反射的循环结构又会根据 `n` 的奇偶变化。

不能在本文答案上再简单除以 `2`，因为有些项链本身关于某条轴对称。正确做法仍是把
每一种反射加入 Burnside 固定点平均。

## 常见错误

- 直接用 $\binom nk/n$，忽略周期排列拥有更小轨道；
- 把轨道大小和固定点数量混为一谈；
- 旋转 `shift` 的循环数量写成 `n / gcd(n, shift)`；
- 同一循环中允许出现两种颜色；
- `k` 不能被循环长度整除时仍计算组合数；
- 把翻转也视为相同，却只枚举 `n` 种旋转；
- 模运算中直接做整数除法；
- 模逆元版本没有保证 `n` 在模意义下可逆。

## 需要记住什么

- 轨道和固定点集合分别表示什么？
- Burnside 引理为什么取所有变换固定点数量的平均值？
- 一个轨道为什么总共贡献恰好 $|G|$ 个“对象—稳定变换”二元组？
- 旋转 `shift` 把 `n` 个位置分成多少个循环？
- 固定黑珠数量为什么必须是循环长度的倍数？
- 为什么把反射加入等价关系后不能直接把旋转答案除以 `2`？
