# Polya 定理

> 最近修订：2026-08-23 07:02 +10:00（未审阅）

给圆周上的 `n` 个位置任意涂 `m` 种颜色。若两个方案可以通过旋转或翻转重合，就把
它们视为同一种手链。应该怎样计数？

Burnside 引理已经把答案化成每种对称变换固定的染色数平均值。Polya 定理进一步
指出：一个位置置换有多少个循环，被它固定的任意染色就有 $m$ 的多少次方；若还想
限制每种颜色的使用数量，则用循环指标多项式统一保留这些信息。

本文先从“每个循环必须同色”推导无颜色数量限制的公式，再用旋转与反射的循环结构
计算手链数量。

## 一个置换怎样作用于位置

一次旋转或翻转都会重新排列 `n` 个位置，因此可以写成一个置换。把置换不断作用于
同一个位置，最终会回到起点，所有位置被划分成若干个互不相交的循环。

例如置换：

$$
(1\ 3\ 5)(2\ 4)
$$

有两个循环，长度分别为 `3` 和 `2`。

一种染色被这个置换固定，当且仅当同一个循环中的所有位置颜色相同：

- 若循环内有两种颜色，置换后至少一个位置会变色；
- 若整个循环同色，沿循环移动不会改变染色。

设置换 $g$ 共有 $c(g)$ 个循环。每个循环可以独立选择 `m` 种颜色，所以：

$$
|\operatorname{Fix}(g)|=m^{c(g)}.
$$

## Polya 的基本计数公式

代入 Burnside 引理，得到不限制各颜色使用数量时的 Polya 公式：

$$
\boxed{
\text{不同染色数}
=
\frac{1}{|G|}
\sum_{g\in G}m^{c(g)}
}
$$

这里：

- $G$ 是题目允许的全部位置对称变换；
- $c(g)$ 是变换 $g$ 的位置循环数量；
- `m` 是可用颜色数量。

因此问题的核心从“枚举所有 $m^n$ 种染色”变成“列出每类对称变换的循环结构”。

## 旋转的循环数量

向前旋转 `shift` 个位置会形成：

$$
\gcd(n,shift)
$$

个循环。因此这次旋转固定：

$$
m^{\gcd(n,shift)}
$$

种染色。

所有 `shift = 0..n-1` 都要计入。恒等旋转 `shift = 0` 有 `n` 个单元素循环，固定
全部 $m^n$ 种染色。

## 奇数长度手链的反射

当 `n` 为奇数时，每条对称轴：

- 穿过一个位置，这个位置自己形成长度 `1` 的循环；
- 其余 `n-1` 个位置两两交换，形成 `(n-1)/2` 个长度 `2` 的循环。

所以每次反射的循环总数为：

$$
1+\frac{n-1}{2}=\frac{n+1}{2}.
$$

这样的反射共有 `n` 种，每种固定：

$$
m^{(n+1)/2}
$$

个染色。

## 偶数长度手链的两类反射

当 `n` 为偶数时，反射分成两类。

### 对称轴穿过两个相对位置

两个位置分别固定，其余 `n-2` 个位置两两交换。循环数为：

$$
2+\frac{n-2}{2}=\frac n2+1.
$$

这类反射有 `n/2` 种。

### 对称轴穿过两条相对边

没有位置单独固定，所有位置两两交换。循环数为：

$$
\frac n2.
$$

这类反射也有 `n/2` 种。

区分两类反射是偶数手链计数最容易遗漏的一步。

## 手链公式

旋转与反射共同组成大小为 `2n` 的二面体群。

先计算旋转固定点之和：

$$
R=\sum_{shift=0}^{n-1}m^{\gcd(n,shift)}.
$$

若 `n` 为奇数，反射固定点之和为：

$$
F=n\cdot m^{(n+1)/2}.
$$

若 `n` 为偶数：

$$
F=\frac n2
\left(m^{n/2+1}+m^{n/2}\right).
$$

最终答案为：

$$
\frac{R+F}{2n}.
$$

## 循环指标多项式

只记录循环总数足以处理“每个循环任取一种颜色”。若要区分循环长度，设 $c_j(g)$
表示置换 $g$ 中长度为 `j` 的循环数量，定义群 $G$ 的循环指标：

$$
Z_G(s_1,s_2,\ldots,s_n)
=
\frac{1}{|G|}
\sum_{g\in G}
\prod_{j=1}^{n}s_j^{c_j(g)}.
$$

把所有 $s_j$ 都代成 `m`，就得到前面的 $m^{c(g)}$ 公式。

若颜色为 $x_1,x_2,\ldots,x_m$，并希望记录每种颜色使用次数，则代入：

$$
s_j=x_1^j+x_2^j+\cdots+x_m^j.
$$

一个长度 `j` 的循环整体选择颜色 `r` 时，会使用 `j` 个该颜色位置，因此贡献
$x_r^j$。展开后某个单项式：

$$
x_1^{a_1}x_2^{a_2}\cdots x_m^{a_m}
$$

的系数，就是在对称变换等价意义下，恰好使用各颜色 $a_1,a_2,\ldots,a_m$ 次的染色
数量。

这一步是 Polya 定理相对“只平均固定点”的真正扩展：循环指标不仅计数，还能保留
颜色用量分布。

## 完整代码

输入位置数 `n` 和颜色数 `m`，计算长度 `n`、使用至多 `m` 种颜色的手链数量；旋转
或翻转后相同的染色视为同一种。答案对质数 $10^9+7$ 取模。

保证 `1 <= n`、`2n < MOD`，颜色数可以很大，代码先在模意义下归一化。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1e9 + 7;

int n;
ll color_count;

ll mod_pow(ll base, ll exponent) {
    ll result = 1;
    base %= MOD;

    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = result * base % MOD;
        }
        base = base * base % MOD;
        exponent /= 2;
    }
    return result;
}

ll count_bracelets() {
    ll fixed_sum = 0;

    for (int shift = 0; shift < n; ++shift) {
        int cycle_count = gcd(n, shift);
        fixed_sum = (fixed_sum + mod_pow(color_count, cycle_count)) % MOD;
    }

    if (n % 2 == 1) {
        ll fixed_by_reflection = mod_pow(color_count, (n + 1) / 2);
        fixed_sum = (fixed_sum + n * fixed_by_reflection) % MOD;
    } else {
        ll through_vertices = mod_pow(color_count, n / 2 + 1);
        ll through_edges = mod_pow(color_count, n / 2);
        ll reflection_count = n / 2;

        fixed_sum = (fixed_sum + reflection_count * through_vertices) % MOD;
        fixed_sum = (fixed_sum + reflection_count * through_edges) % MOD;
    }

    ll group_size = 2LL * n;
    return fixed_sum * mod_pow(group_size, MOD - 2) % MOD;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> color_count;
    color_count = (color_count % MOD + MOD) % MOD;
    cout << count_bracelets() << '\n';
    return 0;
}
```

## 复杂度

程序枚举 `n` 种旋转，每次计算一次 GCD 和一次快速幂；反射只分常数类：

- 时间复杂度为 $O(n\log n+n\log MOD)$；
- 额外空间复杂度为 $O(1)$。

若 `n` 很大，还可以按 $\gcd(n,shift)$ 的取值用约数和欧拉函数合并等价旋转，把线性
枚举改成约数枚举；那是同一公式的数论优化，不影响本文的群作用推导。

## Burnside 与 Polya 的分工

Burnside 引理是轨道计数的根本公式，适用于任意有限对象集合，只要能算每个变换的
固定点。

Polya 定理针对“位置被置换、颜色随位置移动”的染色问题，把固定点数量系统化为循环
结构：

- 不限制颜色用量时，一个置换贡献 $m^{c(g)}$；
- 限制颜色用量时，使用循环指标代入并取对应系数。

所以 Polya 不是另一个与 Burnside 无关的平均公式，而是对染色固定点计算的结构化
展开。

## 常见错误

- 只数旋转，却把答案称为允许翻转的手链；
- 认为一个置换固定的染色数是 $m^n$，没有要求同一循环同色；
- 旋转 `shift` 的循环数写成 `n / gcd(n, shift)`；
- `n` 为偶数时把两类反射当成同一种循环结构；
- 忘记二面体群大小为 `2n`；
- 在模运算中直接除以 `2n`；
- 需要固定各颜色数量时仍只代入 $m^{c(g)}$；
- 把位置循环长度与颜色种数混为一谈。

## 需要记住什么

- 为什么一个置换的固定染色要求每个循环整体同色？
- 有 `m` 种颜色、`c` 个循环时为什么有 $m^c$ 个固定染色？
- 旋转 `shift` 的循环数量怎样计算？
- 奇数手链的反射有多少个循环？
- 偶数手链为什么存在两类不同反射？
- 循环指标为什么要分别记录各种循环长度？
- 代入 $s_j=x_1^j+\cdots+x_m^j$ 后，单项式指数表达什么？
