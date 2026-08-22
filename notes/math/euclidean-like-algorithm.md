# 类欧几里得算法

> 最近修订：2026-08-23 07:27 +10:00（未审阅）

考虑求和：

$$
\sum_{i=1}^{n}
\left\lfloor\frac{ai+b}{m}\right\rfloor.
$$

逐项计算需要 $O(n)$ 时间。当 `n` 很大时，可以把每个取整值看成直线下方的整点
数量，再像欧几里得算法交换除数与余数那样交换两个坐标方向，使参数不断缩小。

这个算法通常称为类欧几里得算法。本文只处理最基础、最常用的非负一次函数取整和；
带权和、平方和等扩展拥有更多递推项，不属于本文模板。

## 先把闭区间平移到零起点

主问题使用本书默认的闭区间 `i=1..n`。令：

$$
j=i-1,
$$

则：

$$
ai+b=aj+(a+b).
$$

所以只需实现内部函数：

$$
F(N,M,A,B)
=
\sum_{i=0}^{N-1}
\left\lfloor\frac{Ai+B}{M}\right\rfloor.
$$

最后调用：

$$
F(n,m,a,a+b).
$$

内部下标 `0..N-1` 不是学习路线对外的区间约定，而是一次明确的坐标平移；`0` 对应
原来的 `i=1`，具有实际数学意义。

## 提取斜率中的整倍数

若 $A\ge M$，写成：

$$
A=qM+r,
\qquad 0\le r<M.
$$

则：

$$
\left\lfloor\frac{Ai+B}{M}\right\rfloor
=
qi+
\left\lfloor\frac{ri+B}{M}\right\rfloor.
$$

所有线性项之和为：

$$
q\sum_{i=0}^{N-1}i
=
q\frac{N(N-1)}2.
$$

因此先加入这部分答案，再令：

$$
A\gets A\bmod M.
$$

## 提取截距中的整倍数

同理，若：

$$
B=qM+r,
$$

每一项都能提出同一个整数 `q`：

$$
\left\lfloor\frac{Ai+B}{M}\right\rfloor
=
q+
\left\lfloor\frac{Ai+r}{M}\right\rfloor.
$$

一共有 `N` 项，所以加入：

$$
qN,
$$

再令 $B\gets B\bmod M$。

完成两次提取后：

$$
0\le A<M,
\qquad
0\le B<M.
$$

这与欧几里得算法先取商、再只保留余数的过程相似。

## 取整和是直线下的整点数

固定一个 `i`：

$$
\left\lfloor\frac{Ai+B}{M}\right\rfloor
$$

等于满足下式的正整数高度 `y` 的数量：

$$
My\le Ai+B.
$$

所以整个求和是在统计直线 $My=Ax+B$ 下方、横坐标位于 `0..N-1` 的整点。

逐列统计得到原公式。为了缩小问题，改成逐行统计：固定一个高度，寻找从哪个横坐标
开始位于直线下方。交换“按列数高度”和“按行数宽度”，新问题会把 $M$ 与 $A$
互换。

## 推导坐标交换公式

令：

$$
AN+B=MQ+R,
\qquad 0\le R<M.
$$

也就是：

$$
Q=\left\lfloor\frac{AN+B}{M}\right\rfloor,
\qquad
R=(AN+B)\bmod M.
$$

对原来每一列的高度逐层展开，并按高度反向编号，可以证明：

$$
F(N,M,A,B)=F(Q,A,M,R),
$$

前提是当前已经满足 $0\le A,B<M$。

更具体地，原和可以写成所有高度层的宽度之和。对
$y=0,1,\ldots,Q-1$，把高度从上向下改记为 $z=Q-1-y$，这一层贡献的横向长度为：

$$
\left\lfloor\frac{Mz+R}{A}\right\rfloor.
$$

把所有 `z` 相加，正是右侧的新取整和。于是参数变化为：

```text
N <- (A*N+B)/M
B <- (A*N+B)%M
交换 A 与 M
```

若 $AN+B<M$，则 `Q=0`，所有列高度都为 `0`，递归结束。

## 为什么复杂度是对数级

每轮先把 $A$、$B$ 对 $M$ 取余，再交换 $A$ 与 $M$。这与欧几里得算法的参数变化
相同：较大参数被替换成余数。

因此有效轮数为 $O(\log\max(A,M))$。每轮只做常数次整数运算，不需要枚举 `N` 个
下标。

## 完整代码

输入 `n,m,a,b`，计算：

$$
\sum_{i=1}^{n}
\left\lfloor\frac{ai+b}{m}\right\rfloor.
$$

保证 `1 <= n,m <= 10^9`、`0 <= a,b < m`。这些条件保证答案和代码中的中间乘积位于
64 位整数范围内，不需要更宽整数类型。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

ll floor_sum_zero_based(ll count, ll modulus, ll slope, ll intercept) {
    ll answer = 0;

    while (true) {
        if (slope >= modulus) {
            ll quotient = slope / modulus;
            answer += count * (count - 1) / 2 * quotient;
            slope %= modulus;
        }

        if (intercept >= modulus) {
            ll quotient = intercept / modulus;
            answer += count * quotient;
            intercept %= modulus;
        }

        ll top = slope * count + intercept;
        if (top < modulus) {
            break;
        }

        count = top / modulus;
        intercept = top % modulus;
        swap(slope, modulus);
    }

    return answer;
}

ll floor_sum(ll n, ll modulus, ll slope, ll intercept) {
    return floor_sum_zero_based(n, modulus, slope, slope + intercept);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    ll n;
    ll modulus;
    ll slope;
    ll intercept;
    cin >> n >> modulus >> slope >> intercept;

    cout << floor_sum(n, modulus, slope, intercept) << '\n';
    return 0;
}
```

## 一个例子

令：

$$
n=5,
\quad m=7,
\quad a=3,
\quad b=1.
$$

逐项结果为：

$$
\left\lfloor\frac47\right\rfloor,
\left\lfloor\frac77\right\rfloor,
\left\lfloor\frac{10}7\right\rfloor,
\left\lfloor\frac{13}7\right\rfloor,
\left\lfloor\frac{16}7\right\rfloor
=0,1,1,1,2.
$$

答案为 `5`。完整代码内部把它平移成：

$$
F(5,7,3,4),
$$

对应 `j=0..4`，得到相同五项。

## 复杂度

- 时间复杂度为 $O(\log\max(a,m))$；
- 额外空间复杂度为 $O(1)$。

代码使用循环而不是递归，参数交换过程仍与欧几里得算法一致。

## 边界与扩展

本文只接受非负 `a,b`。若参数可能为负数，C++ 整数除法向 `0` 取整，不等于数学上的
向下取整；必须先实现正确的 floor division，再把负商部分提出。不能直接把负数塞进
当前模板。

一些题目还要求：

$$
\sum i\left\lfloor\frac{ai+b}{m}\right\rfloor
$$

或取整值平方和。它们能沿同一个整点互换过程递推，但交换坐标后会产生多个彼此依赖的
统计量，需要成组维护，不应向这个基础函数随意添加几个乘法就声称已经支持。

## 常见错误

- 主问题从 `1` 开始，却直接调用零起点内部函数而没有把截距改成 `a+b`；
- 提取斜率整倍数时把 $N(N-1)/2$ 写成 $N(N+1)/2$；
- 提取截距后只加一次商，没有乘以项数 `N`；
- 没有先把 $A,B$ 化到 `[0,M)` 就使用坐标交换公式；
- 更新 `N` 后才计算余数，丢失原来的 `AN+B`；
- 交换方向写成 `swap(N,M)`，而不是交换斜率与模数；
- 对负数依赖 C++ `/` 的向零取整；
- 乘法顺序不当，使本来可表示的结果在中间先溢出。

## 需要记住什么

- 闭区间 `i=1..n` 怎样平移成内部的 `0..n-1`？
- 斜率和截距中的模数整倍数分别贡献什么求和项？
- 取整值为什么可以解释成直线下整点数量？
- 坐标交换后四个参数怎样变化？
- 为什么交换与取余使迭代次数和欧几里得算法一样是对数级？
- 当前非负模板为什么不能直接处理负参数？
