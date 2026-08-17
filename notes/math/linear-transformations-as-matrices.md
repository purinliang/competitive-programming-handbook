# 线性变换：矩阵表示

> 最近修订：2026-08-15 23:15 +10:00（未审阅）

一个状态可能由多个数共同描述。例如二维坐标由 `x, y` 描述；一段递推的当前状态可能由连续若干项描述。

如果新状态的每个分量都是旧状态各分量的固定倍数之和，就可以把全部系数排成一个矩阵，用一次 [矩阵乘法](matrix-multiplication.md) 同时计算所有输出。

本篇解释矩阵怎样表示这种线性变换，以及连续变换为什么对应矩阵乘法。

## 从一个输出开始

先看两个输入 `x1, x2`。若输出为：

$$
y_1=2x_1+3x_2,
$$

就可以把系数 `2, 3` 排成一个行矩阵：

$$
\begin{bmatrix}
2&3
\end{bmatrix}
\begin{bmatrix}
x_1\\
x_2
\end{bmatrix}
=
\begin{bmatrix}
y_1
\end{bmatrix}.
$$

左边矩阵的第 `1` 行依次保存输出 `y1` 对每个输入的系数。

## 多个输出

若还需要另一个输出：

$$
y_2=-x_1+4x_2,
$$

就把它的系数放进第 `2` 行：

$$
\begin{bmatrix}
y_1\\
y_2
\end{bmatrix}
=
\begin{bmatrix}
2&3\\
-1&4
\end{bmatrix}
\begin{bmatrix}
x_1\\
x_2
\end{bmatrix}.
$$

矩阵乘法逐行展开后正好得到：

$$
\begin{aligned}
y_1&=2x_1+3x_2,\\
y_2&=-x_1+4x_2.
\end{aligned}
$$

因此矩阵的含义是：

- 第 `i` 行对应第 `i` 个输出；
- 第 `j` 列对应第 `j` 个输入；
- `A[i][j]` 表示输入 `x[j]` 对输出 `y[i]` 的系数。

## 行数与列数来自输入输出

若输入有 `c` 个分量，输出有 `r` 个分量，那么变换矩阵 `A` 的大小必须是：

$$
r\times c.
$$

把输入写成 $c\times1$ 列矩阵 `x`，就有：

$$
y=Ax.
$$

尺寸为：

$$
(r\times c)(c\times1)=r\times1.
$$

内侧的 `c` 表示每个输出都要查看全部输入分量；答案留下 `r` 行，对应全部输出。

状态向量统一写成列，是为了让“变换矩阵乘状态”保持这个清晰的尺寸关系。

## 什么叫线性

设变换记作 `T`。若对任意状态 `u,v` 和标量 `k` 都满足：

$$
T(u+v)=T(u)+T(v),
$$

以及：

$$
T(ku)=kT(u),
$$

就称 `T` 是线性变换。

矩阵表示的变换满足这两条性质，因为普通乘加可以分配：

$$
A(u+v)=Au+Av,
$$

以及：

$$
A(ku)=k(Au).
$$

两条性质还推出：

$$
T(0)=0.
$$

因此线性变换一定把零状态映射到零状态。

## 二维缩放

把二维坐标的 `x` 放大 `2` 倍、`y` 放大 `3` 倍：

$$
\begin{aligned}
x'&=2x,\\
y'&=3y.
\end{aligned}
$$

对应矩阵为：

$$
\begin{bmatrix}
x'\\
y'
\end{bmatrix}
=
\begin{bmatrix}
2&0\\
0&3
\end{bmatrix}
\begin{bmatrix}
x\\
y
\end{bmatrix}.
$$

主对角线保存每个分量自身的倍数；非对角位置为 `0`，表示两个坐标没有互相贡献。

## 交换两个分量

若变换是：

$$
\begin{aligned}
x'&=y,\\
y'&=x,
\end{aligned}
$$

对应矩阵为：

$$
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix}.
$$

第一行表示新 `x` 取旧 `y`，第二行表示新 `y` 取旧 `x`。矩阵不是抽象地“记住一个操作名字”，而是逐行记录每个新分量怎样由旧分量组成。

## 逆时针旋转九十度

二维点逆时针旋转九十度后：

$$
\begin{aligned}
x'&=-y,\\
y'&=x.
\end{aligned}
$$

所以矩阵为：

$$
\begin{bmatrix}
0&-1\\
1&0
\end{bmatrix}.
$$

例如点 `(3,1)` 变成：

$$
\begin{bmatrix}
0&-1\\
1&0
\end{bmatrix}
\begin{bmatrix}
3\\
1
\end{bmatrix}
=
\begin{bmatrix}
-1\\
3
\end{bmatrix}.
$$

## 平移为什么不是线性变换

把所有二维点向右移动 `5`：

$$
\begin{aligned}
x'&=x+5,\\
y'&=y.
\end{aligned}
$$

这里出现了不乘任何输入的常数 `5`。零点 `(0, 0)` 会被映射到 `(5, 0)`，不满足 `T(0) = 0`，所以普通二维矩阵不能表示这个平移。

平移属于仿射变换。可以增加一个恒为 `1` 的坐标，用更高一维的齐次坐标矩阵表示；这属于后续扩展，不在本篇改变线性变换的定义。

## 连续应用两个变换

设先应用矩阵 `B`：

$$
y=Bx,
$$

再应用矩阵 `A`：

$$
z=Ay.
$$

把第一式代入第二式：

$$
z=A(Bx).
$$

根据矩阵乘法结合律：

$$
z=(AB)x.
$$

所以连续变换可以预先合成为矩阵 `AB`。

这里右侧的 `B` 先作用，左侧的 `A` 后作用。矩阵乘法一般不满足交换律，因此：

$$
AB
$$

与：

$$
BA
$$

通常表示不同的变换顺序。

## 用代码应用一次变换

用 1-based `vector<ll>` 保存输入和输出分量。变换矩阵有 `rows` 个输出、`columns` 个输入：

```cpp
vector<ll> apply_transformation(const Matrix& transformation,
                                const vector<ll>& input) {
    vector<ll> output(transformation.rows + 5);
    for (int i = 1; i <= transformation.rows; i++) {
        for (int j = 1; j <= transformation.columns; j++) {
            output[i] += transformation.value[i][j] * input[j];
        }
    }
    return output;
}
```

`output[i]` 累加矩阵第 `i` 行与输入列向量的对应乘积，正是第 `i` 个输出的线性组合。

位置 `0` 留作边界，输入真实范围是 `1..transformation.columns`，输出真实范围是 `1..transformation.rows`。

## 完整代码

下面的程序读入一个整数线性变换及一个输入状态，并输出变换后的状态。题目需要保证全部中间结果能放入 64 位整数。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

struct Matrix {
    int rows;
    int columns;
    vector<vector<ll>> value;

    Matrix(int rows, int columns)
        : rows(rows), columns(columns),
          value(rows + 5, vector<ll>(columns + 5)) {}
};

vector<ll> apply_transformation(const Matrix& transformation,
                                const vector<ll>& input) {
    vector<ll> output(transformation.rows + 5);
    for (int i = 1; i <= transformation.rows; i++) {
        for (int j = 1; j <= transformation.columns; j++) {
            output[i] += transformation.value[i][j] * input[j];
        }
    }
    return output;
}

int main() {
    int input_size, output_size;
    scanf("%d%d", &input_size, &output_size);

    Matrix transformation(output_size, input_size);
    for (int i = 1; i <= output_size; i++) {
        for (int j = 1; j <= input_size; j++) {
            scanf("%lld", &transformation.value[i][j]);
        }
    }

    vector<ll> input(input_size + 5);
    for (int i = 1; i <= input_size; i++) {
        scanf("%lld", &input[i]);
    }

    vector<ll> output = apply_transformation(transformation, input);
    for (int i = 1; i <= output_size; i++) {
        if (i > 1) {
            printf(" ");
        }
        printf("%lld", output[i]);
    }
    printf("\n");
    return 0;
}
```

输入使用前面的两输出变换：

```text
2 2
2 3
-1 4
5 6
```

输出：

```text
28 19
```

因为：

$$
2\times5+3\times6=28,
$$

而：

$$
-1\times5+4\times6=19.
$$

## 正确性

对每个输出位置 `i`，`apply_transformation` 从 `j = 1` 到输入分量数，累加：

$$
A_{i,j}x_j.
$$

循环结束后：

$$
\text{output}_i=\sum_j A_{i,j}x_j,
$$

恰好等于矩阵第 `i` 行与输入列向量的乘积。因此所有输出分量共同组成 `Ax`，程序正确应用了给定线性变换。

## 复杂度

若变换有 `c` 个输入分量、`r` 个输出分量，矩阵含有 `r * c` 个系数。`apply_transformation` 访问每个系数一次，时间复杂度为：

$$
O(rc).
$$

输出向量使用 $O(r)$ 额外空间；变换矩阵本身使用 $O(rc)$ 空间。

## 常见错误

### 把状态写成行向量

本书统一使用列向量，并写作 `output = transformation * input`。若改用行向量，矩阵位置与乘法顺序都会改变，不能混用两套约定。

### 把输入输出维度写反

有 `c` 个输入、`r` 个输出时，矩阵大小是 `r * c`：每行对应一个输出，每列对应一个输入。

### 颠倒复合顺序

先应用 `B`、再应用 `A`，合成矩阵是 `AB`。右侧矩阵先作用。

### 把带常数项的变换当成线性变换

`x' = x + 5` 不把零状态映射到零状态，因此不是普通线性变换。不能把常数项硬塞进同维矩阵。

### 忽略整数溢出

即使最终值能放入 `ll`，一次系数乘输入也必须能安全计算。模意义下应像矩阵乘法模板一样使用 `__int128` 后及时取模。

## 基础练习

1. 把 `y1 = x1 + x2`、`y2 = 2 * x1 - x2` 写成矩阵。
2. 写出把二维坐标的 `x` 放大 `4` 倍、`y` 保持不变的矩阵。
3. 对点 `(2,5)` 应用交换坐标矩阵。
4. 验证逆时针旋转九十度两次会得到取相反数的变换。
5. 用公式验证 `A(u + v) = Au + Av`。
6. 分别计算先缩放后交换、先交换后缩放的结果，比较两个合成矩阵。

## 需要记住什么

1. 为什么变换矩阵的每一行对应一个输出？
2. 有 `c` 个输入、`r` 个输出时，矩阵大小是什么？
3. 线性变换需要满足哪两条运算性质？
4. 为什么普通矩阵不能直接表示平移？
5. 先应用 `B` 再应用 `A` 时，合成矩阵是什么？
6. `apply_transformation` 中的双重循环怎样对应每个输出的线性组合？

[矩阵快速幂](matrix-exponentiation.md) 会把一次状态转移写成矩阵，并用快速幂
一次合成大量相同转移。

需要把平移也放进矩阵时，可以继续阅读 [线性变换：齐次坐标与仿射变换](homogeneous-coordinates-affine-transformations.md)。
