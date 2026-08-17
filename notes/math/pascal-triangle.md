# 杨辉三角

> 最近修订：2026-08-17 00:34 +10:00（未审阅）

如果需要同时计算许多组合数，逐个代入阶乘公式会反复计算大量相同内容。组合数的
递推关系可以把所有 $C(n,k)$ 按行构造出来；这些数字排成的三角形就是杨辉三角，
也称 Pascal 三角形。

## 从组合数递推开始

从 `n` 个元素中选出 `k` 个，固定观察最后一个元素。所有方案恰好分成两类：

- 不选择它：从其余 `n-1` 个元素中选择 `k` 个；
- 选择它：还要从其余 `n-1` 个元素中选择 `k-1` 个。

两类互斥并且覆盖全部方案，因此：

$$
C(n,k)=C(n-1,k)+C(n-1,k-1).
$$

两侧边界是：

$$
C(n,0)=C(n,n)=1.
$$

一个元素也不选与全部选中都只有一种方法。

## 把递推排成三角形

从 $C(0,0)=1$ 开始逐行写出：

```text
n=0:              1
n=1:            1   1
n=2:          1   2   1
n=3:        1   3   3   1
n=4:      1   4   6   4   1
n=5:    1   5  10  10   5   1
```

每个内部数字等于它左上方与右上方两个数字之和。例如：

$$
C(5,2)=C(4,1)+C(4,2)=4+6=10.
$$

第 `n` 行从 `k=0` 到 `k=n`，共有 `n+1` 项。这里的 `0` 是组合数参数
“选择零个元素”的真实取值，不是把本书的自定义数组约定随意改成 0-based。

## 二维动态规划

令：

```text
combination[n][k] = 从 n 个元素中选 k 个的方案数
```

从较小的 `n` 向较大的 `n` 逐行计算。边界直接设为 `1`，内部位置从上一行转移：

```cpp
combination[total][0] = 1;
combination[total][total] = 1;

for (int chosen = 1; chosen < total; chosen++) {
    combination[total][chosen] =
        combination[total - 1][chosen - 1]
        + combination[total - 1][chosen];
}
```

计算第 `total` 行时只依赖第 `total-1` 行，因此按照行号递增就不会读到尚未计算的
状态。

这也是一个直接的二维动态规划：

- 阶段是已经考虑的元素数量 `total`；
- 状态是当前选择数量 `chosen`；
- 转移按最后一个元素选或不选分成两类。

## 完整代码

下面的程序输出第 `0..n` 行杨辉三角，并限制 `0<=n<=30`，使结果能够放入
64 位整数。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int MAXN = 35;

ll combination[MAXN][MAXN];

int main() {
    int n;
    scanf("%d", &n);

    combination[0][0] = 1;
    for (int total = 1; total <= n; total++) {
        combination[total][0] = 1;
        combination[total][total] = 1;
        for (int chosen = 1; chosen < total; chosen++) {
            combination[total][chosen] =
                combination[total - 1][chosen - 1]
                + combination[total - 1][chosen];
        }
    }

    for (int total = 0; total <= n; total++) {
        for (int chosen = 0; chosen <= total; chosen++) {
            if (chosen > 0) {
                printf(" ");
            }
            printf("%lld", combination[total][chosen]);
        }
        printf("\n");
    }
    return 0;
}
```

输入：

```text
4
```

输出：

```text
1
1 1
1 2 1
1 3 3 1
1 4 6 4 1
```

如果题目要求对 `MOD` 取模，只需在每次相加时取模：

```cpp
combination[total][chosen] =
    (combination[total - 1][chosen - 1]
     + combination[total - 1][chosen])
    % MOD;
```

这个递推只使用加法，`MOD` 不需要是质数。

## 为什么左右对称

从 `n` 个元素中选 `k` 个，等价于决定剩下哪 `n-k` 个不选，所以：

$$
C(n,k)=C(n,n-k).
$$

因此杨辉三角每一行左右对称。对称性可以用来检查手算或程序输出，但基础二维递推
不需要专门利用它优化。

## 与二项式系数的关系

根据 [二项式定理](binomial-theorem.md)：

$$
(x+y)^n=\sum_{k=0}^{n}C(n,k)x^{n-k}y^k.
$$

所以杨辉三角第 `n` 行正是 $(x+y)^n$ 的全部系数。例如第 4 行
`1 4 6 4 1` 对应 $(x+y)^4$。

## 复杂度

前 `n` 行一共有 $1+2+\cdots+(n+1)=O(n^2)$ 个数字，因此构造与输出的时间
复杂度都是 $O(n^2)$，二维数组使用 $O(n^2)$ 空间。

如果只需要最后一行或单个组合数，可以使用倒序更新的一维数组，把空间降为
$O(n)$；完整三角形则必须保留所有行。

## 常见错误

### 忘记两侧边界

递推只负责内部位置。每一行的 `combination[total][0]` 与
`combination[total][total]` 都必须是 `1`。

### 把两个来源写到同一侧

内部位置来自上一行的 `chosen-1` 与 `chosen`，分别表示选择和不选择最后一个元素。

### 从未初始化的行转移

第 `total` 行只依赖第 `total-1` 行，所以必须按照 `total` 递增计算。

### 忽略整数范围

组合数增长很快。数组开得足够大不代表数值不会溢出；扩大 `n` 时必须检查答案范围
或按题目要求及时取模。

## 基础练习

1. 不看表格，使用递推手算杨辉三角第 `0..6` 行。
2. 从“是否选择最后一个元素”重新解释内部数字为何等于左上与右上之和。
3. 找出第 `n` 行与 $(x+y)^n$ 展开式之间的逐项对应关系。
4. 把二维程序改成只保存一行，并解释为什么必须倒序更新。

## 需要记住什么

1. 杨辉三角第 `n` 行第 `k` 项表示哪个组合数？
2. 内部数字的递推式与两侧边界分别是什么？
3. 为什么递推只需要加法？
4. 为什么每一行左右对称？
5. 它为什么可以视为一个二维动态规划？
6. 完整构造前 `n` 行的时间与空间复杂度是什么？

