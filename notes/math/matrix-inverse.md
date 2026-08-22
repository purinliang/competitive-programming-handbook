# 矩阵求逆

> 最近修订：2026-08-23 06:10 +10:00（未审阅）

对一个非零数 $a$，乘法逆元 $a^{-1}$ 满足 $aa^{-1}=1$。方阵的逆矩阵承担相同作用：

$$
AA^{-1}=A^{-1}A=I,
$$

其中 $I$ 是单位矩阵。

矩阵求逆不是把每个元素分别取倒数。矩阵乘法会把一整行与一整列组合起来，逆矩阵
必须撤销整个线性变换。

本文在实数范围内用 Gauss–Jordan 消元求逆，并沿用《[高斯消元](gaussian-elimination.md)》
中的部分主元选取与浮点误差约定。

## 同时求解 n 个方程组

设逆矩阵的第 $j$ 列为 $x_j$，单位矩阵的第 $j$ 列为 $e_j$。由：

$$
AA^{-1}=I
$$

可以逐列得到：

$$
Ax_j=e_j.
$$

因此求逆等价于用同一个系数矩阵 $A$，同时求解 $n$ 个右端不同的线性方程组。

若分别运行 $n$ 次高斯消元，会重复处理同一份系数矩阵。更自然的方法是把全部右端
一次放到增广矩阵中：

$$
\left[A\mid I\right].
$$

## 行变换为何得到逆矩阵

每次交换两行、把一行乘非零常数、用一行加减另一行，都等价于在左侧乘一个可逆的
初等矩阵。

假设一系列行变换合起来相当于左乘矩阵 $E$。增广矩阵两侧必须执行完全相同的变换：

$$
\left[A\mid I\right]
\longrightarrow
\left[EA\mid EI\right].
$$

当左半部分被化成单位矩阵时：

$$
EA=I,
$$

所以 $E=A^{-1}$，右半部分则是：

$$
EI=E=A^{-1}.
$$

因此：

$$
\left[A\mid I\right]
\longrightarrow
\left[I\mid A^{-1}\right].
$$

## 构造增广矩阵

原矩阵占据前 `n` 列，单位矩阵占据后 `n` 列：

```cpp
for (int row = 1; row <= n; ++row) {
    augmented[row][n + row] = 1;
}
```

之后每一次行操作都必须覆盖完整的 `2 * n` 列。若只更新左半部分，右半部分就不再
记录同一系列初等变换。

## 选择主元

依次处理第 `column` 列。尚未固定的行中，选择绝对值最大的元素作为主元：

```cpp
int pivot = column;
for (int row = column; row <= n; ++row) {
    if (abs(augmented[row][column]) > abs(augmented[pivot][column])) {
        pivot = row;
    }
}
```

若最大绝对值仍小于 `EPS`，这一列无法产生主元，矩阵秩小于 $n$，逆矩阵不存在。

对于方阵，每一列都必须找到主元；不像一般线性方程组那样可以留下自由变量。

## 把左半部分化成单位矩阵

交换主元行后，先把整行除以主元，使当前位置变成 $1$：

```cpp
double divisor = augmented[column][column];
for (int j = 1; j <= 2 * n; ++j) {
    augmented[column][j] /= divisor;
}
```

再对其他每一行消去这一列：

```cpp
for (int row = 1; row <= n; ++row) {
    if (row == column) {
        continue;
    }

    double factor = augmented[row][column];
    for (int j = 1; j <= 2 * n; ++j) {
        augmented[row][j] -= factor * augmented[column][j];
    }
}
```

处理完全部列，左半部分成为 $I$，右半部分就是答案。

## 正确性直觉

每一步只执行可逆行变换，并对增广矩阵左右两侧同步操作，所以始终存在同一个可逆矩阵
$E$，使当前增广矩阵为 `[EA | E]`。

若每列都找到主元，Gauss–Jordan 消元最终令 $EA=I$，于是 $E=A^{-1}$，右半部分正确。

若某列无法找到主元，$A$ 的行不能提供 $n$ 个线性无关方向；存在非零向量被 $A$
映射为零向量，任何矩阵都无法把这个信息恢复，因此逆矩阵不存在。

## 完整代码

输入 $n$ 和一个 $n\times n$ 实数矩阵。若矩阵不可逆，输出 `No inverse`；否则输出
逆矩阵，每个元素保留十位小数。

```cpp
#include <bits/stdc++.h>
using namespace std;

const double EPS = 1e-10;

int n;
vector<vector<double>> augmented;

bool invert_matrix(vector<vector<double>>& inverse) {
    for (int column = 1; column <= n; ++column) {
        int pivot = column;
        for (int row = column; row <= n; ++row) {
            if (abs(augmented[row][column]) > abs(augmented[pivot][column])) {
                pivot = row;
            }
        }

        if (abs(augmented[pivot][column]) < EPS) {
            return false;
        }

        swap(augmented[pivot], augmented[column]);

        double divisor = augmented[column][column];
        for (int j = 1; j <= 2 * n; ++j) {
            augmented[column][j] /= divisor;
        }

        for (int row = 1; row <= n; ++row) {
            if (row == column) {
                continue;
            }

            double factor = augmented[row][column];
            for (int j = 1; j <= 2 * n; ++j) {
                augmented[row][j] -= factor * augmented[column][j];
            }
        }
    }

    inverse.assign(n + 5, vector<double>(n + 5, 0));
    for (int row = 1; row <= n; ++row) {
        for (int column = 1; column <= n; ++column) {
            inverse[row][column] = augmented[row][n + column];
        }
    }
    return true;
}

int main() {
    scanf("%d", &n);

    augmented.assign(n + 5, vector<double>(2 * n + 5, 0));
    for (int row = 1; row <= n; ++row) {
        for (int column = 1; column <= n; ++column) {
            scanf("%lf", &augmented[row][column]);
        }
        augmented[row][n + row] = 1;
    }

    vector<vector<double>> inverse;
    if (!invert_matrix(inverse)) {
        printf("No inverse\n");
        return 0;
    }

    for (int row = 1; row <= n; ++row) {
        for (int column = 1; column <= n; ++column) {
            double value = inverse[row][column];
            if (abs(value) < EPS) {
                value = 0;
            }
            printf("%.10f%c", value, " \n"[column == n]);
        }
    }
    return 0;
}
```

## 复杂度

共有 $n$ 个主元列；每列要更新 $n$ 行，每行包含 $2n$ 个元素，所以时间复杂度为
$O(n^3)$，增广矩阵与答案占 $O(n^2)$ 空间。

分别求解 $n$ 个方程组会重复消元并达到 $O(n^4)$；增广单位矩阵正是为了共享同一次
消元。

## 模意义下的逆矩阵

若元素位于模质数 $p$ 的有限域中，整体结构仍是 `[A | I] -> [I | A^{-1}]`，但行
运算需要改成模运算：

- 主元只需非零，不使用 `EPS`；
- 除以主元改成乘主元的模逆元；
- 每次加减乘都立即规范到模 $p$ 余数。

合数模数下，非零元素也可能没有逆元，不能只凭“主元非零”继续消元。具体题目必须
先明确元素所在的代数结构。

## 常见错误

- 把逆矩阵误解成每个元素分别取倒数；
- 只对增广矩阵左半部分执行行变换；
- 每个单位向量分别跑一次完整消元，产生不必要的 $O(n^4)$ 时间；
- 浮点数主元只判断是否严格等于 $0$；
- 不做部分主元选取，除以非常小的数放大误差；
- 主元归一化后只消下方行，没有把左半部分化成完整单位矩阵；
- 在模合数意义下默认每个非零主元都有逆元。

## 需要记住什么

- 逆矩阵满足什么乘法关系？
- 为什么求逆等价于同时求解 $n$ 个右端为单位向量的方程组？
- `[A | I]` 两侧为什么必须执行相同的行变换？
- 左半部分化成 $I$ 后，右半部分为什么是 $A^{-1}$？
- 哪种主元情况说明矩阵不可逆？
- 实数求逆与模质数求逆在主元和除法上有什么区别？
