# 最值容斥

> 最近修订：2026-08-23 06:19 +10:00（未审阅）

若干任务分别需要随机时间 $X_1,X_2,\ldots,X_n$ 才能完成，那么“全部任务完成”
所需时间是：

$$
\max(X_1,X_2,\ldots,X_n).
$$

单个任务的期望可能很容易计算，最大值的分布却会同时受到所有任务影响。最值容斥
把一组数的最大值改写成各个子集最小值的交替和；当“至少一个任务完成”的时间比
“全部任务完成”的时间更容易计算时，这个转换尤其有效。

本文先推导最值容斥恒等式，再解决一个自然问题：若每个任务每天以固定概率独立完成，
求全部任务完成所需天数的期望。

## 从最大值变成至少一个条件成立

先考虑一组非负整数 $x_1,x_2,\ldots,x_n$。最大值可以按高度逐层计数：

$$
\max_i x_i
=
\sum_{t\ge 1}
[\text{至少一个 }x_i\ge t].
$$

例如 $x=(2,4,3)$。高度 $1,2,3,4$ 至少被一个数覆盖，所以右侧一共贡献 $4$。

固定一个高度 $t$，定义事件：

$$
A_i(t)=[x_i\ge t].
$$

“至少一个 $x_i\ge t$”就是这些事件的并集。对它使用普通容斥：

$$
[\bigcup_i A_i(t)]
=
\sum_{\varnothing\ne S\subseteq\{1,\ldots,n\}}
(-1)^{|S|+1}
[\bigcap_{i\in S}A_i(t)].
$$

对子集 $S$，其中所有数都不小于 $t$，等价于它们的最小值不小于 $t$：

$$
[\bigcap_{i\in S}A_i(t)]
=
[\min_{i\in S}x_i\ge t].
$$

再对所有高度求和，就得到子集最小值本身。

## 最值容斥恒等式

因此：

$$
\boxed{
\max_{1\le i\le n}x_i
=
\sum_{\varnothing\ne S\subseteq\{1,\ldots,n\}}
(-1)^{|S|+1}
\min_{i\in S}x_i
}
$$

也就是：

```text
加上所有单元素子集的最小值
减去所有双元素子集的最小值
加上所有三元素子集的最小值
继续交替
```

对两个数，公式就是熟悉的：

$$
\max(a,b)=a+b-\min(a,b).
$$

交换“最大”和“最小”，还有对偶形式：

$$
\min_{1\le i\le n}x_i
=
\sum_{\varnothing\ne S\subseteq\{1,\ldots,n\}}
(-1)^{|S|+1}
\max_{i\in S}x_i.
$$

恒等式也适用于实数。本文的问题中完成时间都是正整数，因此只需使用前面的逐层计数
证明。

## 对随机变量取期望

恒等式对每一次随机试验得到的具体数值都成立，因此可以在两边取期望。利用期望的
线性性：

$$
E\left(\max_i X_i\right)
=
\sum_{\varnothing\ne S\subseteq\{1,\ldots,n\}}
(-1)^{|S|+1}
E\left(\min_{i\in S}X_i\right).
$$

这里不需要假设随机变量相互独立。独立性只会在具体计算子集最小值的期望时使用。

这个公式的价值取决于问题结构：若最大值本来就容易求，它不会带来收益；若每个子集的
最小值拥有统一而简单的分布，它就把一个困难问题变成 $2^n-1$ 个简单问题。

## 问题：所有任务何时完成

有 $n$ 个任务。第 `i` 个尚未完成的任务每天独立尝试一次，以概率 $p_i$ 完成；完成后
不再尝试。不同任务、不同天的尝试相互独立。

令 $X_i$ 表示第 `i` 个任务第一次完成时的天数。全部任务完成时的天数为：

$$
T=\max(X_1,X_2,\ldots,X_n).
$$

直接求 $T$ 的分布需要同时描述哪些任务尚未完成。使用最值容斥后，只需对每个非空
子集 $S$ 计算：

$$
E\left(\min_{i\in S}X_i\right).
$$

它表示子集 $S$ 中第一个任务完成所需的天数。

## 子集中第一个任务完成

第 `i` 个任务一天失败的概率为 $1-p_i$。子集 $S$ 中所有任务在同一天全部失败的
概率为：

$$
r_S=\prod_{i\in S}(1-p_i).
$$

所以这一天至少一个任务完成的概率为：

$$
q_S=1-r_S.
$$

每天都以相同概率 $q_S$ 首次成功，因此子集中第一个任务的完成时间服从几何分布：

$$
E\left(\min_{i\in S}X_i\right)
=
\frac{1}{q_S}
=
\frac{1}{1-\prod_{i\in S}(1-p_i)}.
$$

代回最值容斥：

$$
E(T)
=
\sum_{\varnothing\ne S\subseteq\{1,\ldots,n\}}
(-1)^{|S|+1}
\frac{1}{1-\prod_{i\in S}(1-p_i)}.
$$

这就是完整算法。

## 递推计算每个子集的失败概率

若每个子集都重新扫描全部任务，时间复杂度为 $O(n2^n)$。还可以从子集中取出最低的
一个二进制位，复用少一个元素的子集结果。

设 `previous` 是删除该位后的子集，新增任务编号为 `index`：

```cpp
failure_probability[mask] =
    failure_probability[previous] * (1.0L - probability[index]);
```

空集没有任务，把它“一天全部失败”的概率定义为 `1`：

```cpp
failure_probability[0] = 1.0L;
```

于是每个子集只需常数时间处理，总时间降为 $O(2^n)$。

## 完整代码

保证 `1 <= n <= 20`、`0 < p[i] <= 1`。输入每个任务一天内完成的概率，输出全部
任务完成所需天数的期望。

```cpp
#include <bits/stdc++.h>
using namespace std;

int n;
vector<long double> probability;
vector<long double> failure_probability;

long double expected_completion_time() {
    int total_masks = 1 << n;
    failure_probability.assign(total_masks, 0.0L);
    failure_probability[0] = 1.0L;

    long double answer = 0.0L;
    for (int mask = 1; mask < total_masks; ++mask) {
        int bit = __builtin_ctz(mask);
        int previous = mask ^ (1 << bit);
        int index = bit + 1;

        failure_probability[mask] =
            failure_probability[previous] * (1.0L - probability[index]);

        long double first_completion =
            1.0L / (1.0L - failure_probability[mask]);

        if (__builtin_popcount(mask) % 2 == 1) {
            answer += first_completion;
        } else {
            answer -= first_completion;
        }
    }
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n;
    probability.assign(n + 5, 0.0L);
    for (int i = 1; i <= n; ++i) {
        cin >> probability[i];
    }

    cout << fixed << setprecision(10) << expected_completion_time() << '\n';
    return 0;
}
```

## 复杂度与精度

共有 $2^n-1$ 个非空子集，每个子集通过删去最低位复用一次乘积：

- 时间复杂度为 $O(2^n)$；
- 空间复杂度为 $O(2^n)$。

交替加减可能抵消许多接近的数，因此代码使用 `long double` 降低误差。若题目要求在
模质数下输出期望，应把输入概率表示成模整数，并把除法改成模逆元；不能直接把浮点数
转换成模数。

如果某个 $p_i=0$，该任务永远不能完成，期望为无穷大。本文通过输入条件排除了这种
情况。

## 什么时候使用最值容斥

最值容斥适合同时满足下面两个特征的问题：

1. 目标是若干随机量或代价的最大值、最小值；
2. 对任意子集，反方向的最值容易统一计算。

它不是看到 `max` 就套用的公式。本文中“全部完成”对应最大值，而“至少一个完成”
对应最小值；独立试验让后者变成一个简单的几何分布，这三层结构同时存在，转换才有
明显收益。

## 常见错误

- 把子集大小为奇数写成减、偶数写成加；
- 只把各个 $E(X_i)$ 相加，没有处理最大值；
- 误以为期望的线性性要求随机变量独立；
- 计算 $r_S$ 时把“全部失败”写成失败概率之和；
- 把 $1-r_S$ 当作子集中所有任务同时成功的概率；
- 忘记几何分布从第 `1` 天开始，期望是 $1/q_S$；
- 允许 $p_i=0$，却仍然执行除以 $1-r_S$；
- 在浮点交替和中只使用 `float`。

## 需要记住什么

- 最大值怎样按高度改写成“至少一个条件成立”的指示变量之和？
- 为什么普通容斥会把交集事件变成子集最小值？
- 最大值与子集最小值之间的符号怎样交替？
- 为什么对随机变量取期望后仍能使用同一个恒等式？
- 为什么子集中第一个任务完成的概率是 $1-\prod(1-p_i)$？
- 什么时候最值容斥比直接求最大值分布更方便？
