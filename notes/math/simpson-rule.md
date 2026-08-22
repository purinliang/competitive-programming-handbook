# Simpson 公式

> 最近修订：2026-08-23 07:10 +10:00（未审阅）

定积分表示函数曲线与横轴之间的有向面积。若函数存在容易写出的原函数，可以直接用
牛顿—莱布尼茨公式；但竞赛中的函数可能由距离、交叠面积或其他计算过程给出，原函数
很难求，甚至没有初等表达式。

数值积分只调用若干次函数值，用容易积分的曲线近似原函数。Simpson 公式在一个区间
取左端点、中点和右端点，用一条二次曲线拟合这三个值，再计算二次曲线下的面积。

本文从单个区间推导公式，再把大区间切成许多小段组成复合 Simpson 公式。

## 梯形为什么可能不够准确

最简单的近似是在区间 $[l,r]$ 上用直线连接 $(l,f(l))$ 与 $(r,f(r))$，得到梯形面积：

$$
\int_l^r f(x)\,dx
\approx
\frac{r-l}{2}\bigl(f(l)+f(r)\bigr).
$$

若函数明显弯曲，一条直线无法描述中间形状。Simpson 公式再取中点：

$$
m=\frac{l+r}{2},
$$

用经过 $(l,f(l))$、$(m,f(m))$、$(r,f(r))$ 的二次多项式替代直线。

## 三点二次插值的积分

令半区间长度：

$$
h=\frac{r-l}{2},
$$

并把中点平移到坐标 `0`。二次近似写成：

$$
q(t)=at^2+bt+c,
\qquad -h\le t\le h.
$$

三个已知值满足：

$$
q(-h)=f(l),
\quad
q(0)=f(m),
\quad
q(h)=f(r).
$$

由于 $q(0)=c=f(m)$，再把左右端点相加：

$$
q(-h)+q(h)=2ah^2+2c,
$$

所以：

$$
a=\frac{f(l)+f(r)-2f(m)}{2h^2}.
$$

在对称区间积分时，奇函数项 $bt$ 的积分为 `0`：

$$
\begin{aligned}
\int_{-h}^{h}q(t)\,dt
&=\frac{2ah^3}{3}+2ch\\
&=\frac h3\bigl(f(l)+4f(m)+f(r)\bigr).
\end{aligned}
$$

因为 $h=(r-l)/2$，得到单段 Simpson 公式：

$$
\boxed{
S(l,r)
=
\frac{r-l}{6}
\left(f(l)+4f\left(\frac{l+r}{2}\right)+f(r)\right)
}
$$

中点权重为 `4`，两个端点权重各为 `1`。

## 为什么三次多项式也能精确

公式来自二次插值，所以显然能精确积分次数不超过 `2` 的多项式。三次多项式相对它的
二次插值误差含有：

$$
(x-l)(x-m)(x-r).
$$

把坐标移到中点后，这是一个关于中点对称的奇函数，在 $[-h,h]$ 上积分为 `0`。因此
Simpson 公式对次数不超过 `3` 的多项式都完全精确。

误差从四次项开始出现，这也是复合 Simpson 总误差具有四阶收敛速度的原因。

## 复合 Simpson 公式

一个很宽的区间上，函数通常不能被一条二次曲线准确描述。把 $[l,r]$ 等分成偶数
`n` 个小区间：

$$
x_i=l+ih,
\qquad
h=\frac{r-l}{n}.
$$

每相邻两个小区间组成一个 Simpson 面板：

$$
[x_0,x_2],
[x_2,x_4],
\ldots,
[x_{n-2},x_n].
$$

把所有面板相加：

$$
\boxed{
\int_l^r f(x)\,dx
\approx
\frac h3
\left(
f(x_0)+f(x_n)
+4\sum_{\substack{1\le i<n\\i\text{ 为奇数}}}f(x_i)
+2\sum_{\substack{2\le i<n\\i\text{ 为偶数}}}f(x_i)
\right)
}
$$

内部偶数位置是两个相邻面板共享的端点，所以总权重为 `2`；奇数位置只作为某个面板
的中点，权重为 `4`。

`n` 必须为偶数，否则最后一个小区间无法与另一个区间组成三点面板。

## 问题：用积分近似圆周率

反正切函数满足：

$$
\frac{d}{dx}\arctan x=\frac{1}{1+x^2}.
$$

因此：

$$
\int_0^1\frac{4}{1+x^2}\,dx
=4\bigl(\arctan1-\arctan0\bigr)
=\pi.
$$

这给出一个容易验证的数值积分例子。我们只向 Simpson 程序提供函数：

```cpp
long double integrand(long double x) {
    return 4.0L / (1.0L + x * x);
}
```

增加偶数分段数 `n`，结果会逐渐接近圆周率。

## 完整代码

输入一个正偶数 `n`，使用 `n` 个等长小区间近似上述积分，并输出圆周率近似值。

```cpp
#include <bits/stdc++.h>
using namespace std;

long double integrand(long double x) {
    return 4.0L / (1.0L + x * x);
}

long double composite_simpson(long double left, long double right,
                              int interval_count) {
    long double width = (right - left) / interval_count;
    long double weighted_sum = integrand(left) + integrand(right);

    for (int i = 1; i < interval_count; ++i) {
        long double x = left + width * i;
        if (i % 2 == 1) {
            weighted_sum += 4.0L * integrand(x);
        } else {
            weighted_sum += 2.0L * integrand(x);
        }
    }

    return width * weighted_sum / 3.0L;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int interval_count;
    cin >> interval_count;

    cout << fixed << setprecision(15)
         << composite_simpson(0.0L, 1.0L, interval_count) << '\n';
    return 0;
}
```

若要积分另一函数，只需替换 `integrand`，并把调用中的左右端点改成题目区间。调用前
仍应保证 `interval_count` 为正偶数。

## 误差与复杂度

若 $f$ 在区间上拥有连续四阶导数，复合 Simpson 公式的总体误差量级为：

$$
O\left((r-l)h^4\right),
\qquad h=\frac{r-l}{n}.
$$

所以把分段宽度减半，误差通常约缩小到原来的 $1/16$。这只是光滑函数下的渐近规律；
若函数在区间内不连续、出现尖点或接近奇点，不能盲目相信这个比例。

程序调用函数 `n+1` 次：

- 时间复杂度为 $O(n)$；
- 额外空间复杂度为 $O(1)$。

## 固定分段的局限

复合 Simpson 要求事先选定 `n`：

- `n` 太小，弯曲剧烈的局部区间误差很大；
- `n` 太大，平缓区域也被无意义地重复计算；
- 只看最终一个近似值，不知道误差是否已经达到题目要求。

更合理的办法是比较一个大面板与拆成两个小面板的结果，只在差异明显的区间继续细分。
这会形成自适应 Simpson 算法。

## 常见错误

- 单段公式分母写成 `3`，忘记系数是 `(r-l)/6`；
- 中点权重写成 `2`，而不是 `4`；
- 复合公式使用奇数个小区间；
- 内部偶数位置仍乘 `1`，没有考虑它被两个面板共享；
- 把“小区间数量 `n`”和“采样点数量 `n+1`”混淆；
- 函数存在不连续点或奇点时仍跨过去直接套公式；
- 使用整数完成区间宽度除法；
- 只增加输出小数位数，却没有增加实际积分精度。

## 需要记住什么

- Simpson 公式在一个区间取哪三个位置？
- 单段公式的三个权重为什么是 `1,4,1`？
- 为什么它对三次多项式仍然精确？
- 复合 Simpson 为什么要求小区间数量为偶数？
- 复合公式中内部奇数点与偶数点的权重分别是多少？
- 固定分段数为什么不能直接提供可靠的误差控制？
