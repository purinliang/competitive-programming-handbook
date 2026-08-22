# 自适应 Simpson

> 最近修订：2026-08-23 07:18 +10:00（未审阅）

复合 Simpson 公式必须事先指定等分数量。函数大部分区间可能十分平缓，只有很小一段
急剧变化：统一使用很密的网格会浪费计算，统一使用很疏的网格又可能漏掉关键细节。

自适应 Simpson 比较“整个区间使用一个面板”和“把区间平分后使用两个面板”的结果。
若两者已经足够接近，就接受当前近似；否则只在这个区间继续递归细分。

本文用它计算高斯函数：

$$
f(x)=e^{-x^2}
$$

在给定区间上的积分。这个函数没有初等原函数，是数值积分的自然应用。

## 一个大面板与两个小面板

记单段 Simpson 公式为：

$$
S(l,r)
=
\frac{r-l}{6}
\left(f(l)+4f\left(\frac{l+r}{2}\right)+f(r)\right).
$$

令中点：

$$
m=\frac{l+r}{2}.
$$

对同一个区间计算两种近似：

$$
S_1=S(l,r),
$$

以及：

$$
S_2=S(l,m)+S(m,r).
$$

若函数在该区间上接近低次多项式，细分前后的结果会很接近；若差异明显，说明一个
大面板不足以描述局部形状。

## 误差为什么除以 15

对足够光滑的函数，Simpson 单个面板的主误差与区间宽度的五次方成正比。把宽度减半
并使用两个面板后，总主误差约缩小到原来的：

$$
2\times\left(\frac12\right)^5=\frac1{16}.
$$

设粗略结果的主误差为 $E$：

$$
S_1=I+E,
\qquad
S_2=I+\frac{E}{16},
$$

其中 $I$ 是真实积分。两者之差：

$$
\Delta=S_2-S_1=-\frac{15E}{16}.
$$

所以细分结果距离真实值的剩余误差近似为：

$$
I-S_2\approx\frac{\Delta}{15}.
$$

这同时给出一个更准确的 Richardson 修正：

$$
I\approx S_2+\frac{\Delta}{15}.
$$

若目标绝对误差为 `epsilon`，当：

$$
|\Delta|\le15\cdot epsilon
$$

时，就接受这个修正值。

## 只在误差大的区间递归

若当前区间不满足误差条件，把它拆成 `[l,m]` 与 `[m,r]`，分别递归。

总误差预算为 `epsilon`。两个子区间各分到一半：

```cpp
adaptive(left, middle, epsilon / 2);
adaptive(middle, right, epsilon / 2);
```

若每个子区间误差分别不超过 `epsilon/2`，二者相加后的总绝对误差不超过
`epsilon`。

算法会自动形成不均匀划分：平缓区间很快停止，变化剧烈区间继续变细。

## 复用已经计算的函数值

递归过程中，同一个端点或中点会被父区间和子区间反复使用。若每次重新调用
`integrand`，函数本身很昂贵时会浪费大量时间。

对子区间 `[left,right]`，向递归函数传入：

```text
f(left), f(middle), f(right), S(left,right)
```

细分时只新增两个四等分点：

$$
left\_middle=\frac{left+middle}{2},
\qquad
right\_middle=\frac{middle+right}{2}.
$$

因此每个真正展开的递归节点只新增两次函数调用。

## 递归深度保护

误差估计依赖函数在局部足够光滑。若函数存在间断、奇点、极窄尖峰，细分结果可能
迟迟不能满足条件；浮点数还会在区间窄到一定程度后无法表示新的中点。

实现必须设置最大递归深度。达到上限时返回当前 Richardson 修正结果，避免无限递归或
调用栈溢出。

这不是说结果突然变得可靠，而是明确的安全边界。若题目已知不连续点或分段定义边界，
应先把总区间在这些位置主动切开，再分别积分。

## 完整代码

输入区间端点 `left`、`right` 和绝对误差要求 `epsilon`，计算：

$$
\int_{left}^{right}e^{-x^2}\,dx.
$$

保证端点和函数值有限，`epsilon > 0`。若 `left > right`，程序交换端点并在最后改变
积分符号。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAX_DEPTH = 50;

long double integrand(long double x) {
    return exp(-x * x);
}

long double simpson(long double left, long double right, long double left_value,
                    long double middle_value, long double right_value) {
    return (right - left) * (left_value + 4.0L * middle_value + right_value) /
           6.0L;
}

long double adaptive_simpson(long double left, long double right,
                             long double left_value, long double middle_value,
                             long double right_value, long double whole,
                             long double epsilon, int remaining_depth) {
    long double middle = (left + right) / 2.0L;
    long double left_middle = (left + middle) / 2.0L;
    long double right_middle = (middle + right) / 2.0L;

    long double left_middle_value = integrand(left_middle);
    long double right_middle_value = integrand(right_middle);

    long double left_area =
        simpson(left, middle, left_value, left_middle_value, middle_value);
    long double right_area =
        simpson(middle, right, middle_value, right_middle_value, right_value);

    long double refined = left_area + right_area;
    long double difference = refined - whole;

    if (remaining_depth == 0 || abs(difference) <= 15.0L * epsilon) {
        return refined + difference / 15.0L;
    }

    return adaptive_simpson(left, middle, left_value, left_middle_value,
                            middle_value, left_area, epsilon / 2.0L,
                            remaining_depth - 1) +
           adaptive_simpson(middle, right, middle_value, right_middle_value,
                            right_value, right_area, epsilon / 2.0L,
                            remaining_depth - 1);
}

long double integrate(long double left, long double right,
                      long double epsilon) {
    if (left == right) {
        return 0.0L;
    }

    long double sign = 1.0L;
    if (left > right) {
        swap(left, right);
        sign = -1.0L;
    }

    long double middle = (left + right) / 2.0L;
    long double left_value = integrand(left);
    long double middle_value = integrand(middle);
    long double right_value = integrand(right);
    long double whole =
        simpson(left, right, left_value, middle_value, right_value);

    return sign * adaptive_simpson(left, right, left_value, middle_value,
                                   right_value, whole, epsilon, MAX_DEPTH);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    long double left;
    long double right;
    long double epsilon;
    cin >> left >> right >> epsilon;

    cout << fixed << setprecision(15) << integrate(left, right, epsilon)
         << '\n';
    return 0;
}
```

要积分其他函数，只需替换 `integrand`。若函数在已知位置不连续，应在 `main` 中分别
调用 `integrate` 处理各个连续区间，再把结果相加。

## 复杂度

自适应 Simpson 的调用次数取决于函数形状和误差要求，不能只用区间长度给出统一的
简单渐进式。

若最终形成 `K` 个被接受的叶子区间，递归树有 $O(K)$ 个节点，每个展开节点新增常数
次函数计算：

- 时间复杂度为 $O(K)$ 次函数调用；
- 递归栈空间为 $O(depth)$，代码最多 `MAX_DEPTH` 层。

对光滑函数，减小 `epsilon` 通常会增加细分数量；对奇点附近的函数，实际代价可能
显著更高。

## 误差判断的边界

`abs(difference) / 15` 是基于主误差项的估计，不是对任意函数都成立的严格证明。

特别要警惕：

- 函数在采样点之间存在很窄的尖峰，所有已取样点恰好都看不见它；
- 区间中含有无穷大、`NaN` 或不可积奇点；
- 函数不连续，却跨越断点作为一个整体积分；
- 结果绝对值很大，只使用绝对误差而没有考虑相对误差。

工程数值计算常结合绝对误差与相对误差，并使用更完善的积分库。竞赛模板适合题目
明确保证函数性质良好、只需要有限精度数值答案的场景。

## 常见错误

- 比较两个小面板与大面板后，直接返回 `refined`，没有做 `/15` 修正；
- 终止条件写成 `abs(difference) <= epsilon`，忘记估计误差是差值的 `1/15`；
- 递归两个子区间时仍各自使用完整 `epsilon`；
- 每层重新计算左右端点和中点函数值；
- 没有最大递归深度保护；
- 区间方向颠倒后忘记改变积分符号；
- 函数有已知断点，却不分段直接积分；
- 把误差估计当成对任意不连续函数都可靠的严格上界。

## 需要记住什么

- 自适应 Simpson 比较哪两个近似值？
- 细分后 Simpson 主误差为什么约缩小到原来的 `1/16`？
- Richardson 修正为什么是 `refined + difference / 15`？
- 两个递归子区间为什么各分配一半误差预算？
- 怎样传递已有函数值，令每个展开节点只新增两次计算？
- 为什么仍然需要递归深度上限和已知断点预切分？
