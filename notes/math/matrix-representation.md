# 矩阵：表示

> 最近修订：2026-08-15 23:05 +10:00（未审阅）

许多问题需要同时保存一组按行和列排列的数。例如：

- 图的邻接矩阵用第 `i` 行第 `j` 列表示点 `i` 与点 `j` 的关系；
- 动态规划可以用一个表格保存两种状态下的转移系数；
- 计算几何可以用一组系数描述坐标变换。

这些表格中的数字不只是散落的二维数组元素。把整个表格看作一个数学对象，才能继续定义它的加法、乘法和幂。这种对象称为矩阵。

本篇只建立矩阵的表示，不提前讨论各种矩阵运算。

## 行、列与大小

下面是一个矩阵 `A`：

$$
A=
\begin{bmatrix}
2&5&1\\
7&0&4
\end{bmatrix}.
$$

它有 `2` 行、`3` 列，因此称为一个 $2\times3$ 矩阵。

矩阵的大小始终先写行数，再写列数：

$$
\text{rows}\times\text{columns}.
$$

所以 $2\times3$ 与 $3\times2$ 是两种不同大小，不能交换顺序。

矩阵不要求行数等于列数。行数和列数相等的矩阵称为方阵，例如 $3\times3$ 矩阵；矩阵快速幂使用的就是方阵。

## 元素的位置

矩阵 `A` 的第 `i` 行第 `j` 列元素记作：

$$
A_{i,j}.
$$

在刚才的矩阵中：

$$
A_{1,2}=5,
$$

因为 `5` 位于第 `1` 行、第 `2` 列；而：

$$
A_{2,1}=7.
$$

下标顺序仍然是“先行、后列”。交换两个下标通常会访问另一个元素。

本书自己定义的矩阵使用从 `1` 开始的行列编号：

```text
              column
            1   2   3
row 1       2   5   1
row 2       7   0   4
```

位置 `0` 留作边界，不保存正文中的第一行或第一列。

## 只有一行或一列的矩阵

一个 $1\times n$ 矩阵称为行矩阵，也常根据使用场景称为行向量：

$$
\begin{bmatrix}
3&1&4
\end{bmatrix}.
$$

一个 $n\times1$ 矩阵称为列矩阵，也常称为列向量：

$$
\begin{bmatrix}
3\\
1\\
4
\end{bmatrix}.
$$

它们保存同样三个数字，但大小分别是 $1\times3$ 与 $3\times1$，所以是不同的矩阵。后续矩阵乘法会说明这种方向差异为什么重要。

## 两个矩阵何时相等

两个矩阵相等，需要同时满足：

1. 行数相同；
2. 列数相同；
3. 每一个对应位置的元素都相等。

只有数字集合相同并不够。下面两个矩阵使用相同的四个数字，但位置不同，因此不相等：

$$
\begin{bmatrix}
1&2\\
3&4
\end{bmatrix}
\ne
\begin{bmatrix}
1&3\\
2&4
\end{bmatrix}.
$$

矩阵是“大小加上每个位置的值”组成的完整对象。

## 使用 vector 保存元素

矩阵的行数和列数通常在运行时才从题目读入，所以使用二维 `vector`：

```cpp
vector<vector<ll>> value(rows + 5, vector<ll>(columns + 5));
```

外层下标表示行，内层下标表示列。因此第 `i` 行第 `j` 列写作：

```cpp
value[i][j]
```

两个维度都额外保留 `+5`，但真实元素范围仍然单独由：

```text
1..rows
1..columns
```

确定，不能从 `value.size()` 反推真实行数，也不能从 `value[i].size()` 反推真实列数。

## 把大小与元素放在一起

只保存二维 `vector`，每次操作还要额外传入行数和列数，很容易让大小与数据分离。

矩阵本身拥有行数、列数和全部元素，后续加法与乘法也都围绕这份状态工作。因此使用 `struct Matrix` 把它们封装为一个对象：

```cpp
struct Matrix {
    int rows;
    int columns;
    vector<vector<ll>> value;

    Matrix(int rows, int columns)
        : rows(rows), columns(columns), value(rows + 5, vector<ll>(columns + 5)) {}
};
```

构造：

```cpp
Matrix matrix(2, 3);
```

会建立一个 $2\times3$ 矩阵。`vector` 初始化会把所有 `ll` 元素置为 `0`，随后可以写入：

```cpp
matrix.value[1][2] = 5;
```

这里不重载 `operator[]`。第一次接触矩阵时显式写出 `.value[i][j]`，更容易看清访问的是矩阵内部保存的元素；后续若确实需要更短接口，再单独解释运算符重载。

## 读入矩阵

题目通常按照从上到下、每行从左到右的顺序给出元素。循环顺序直接对应行列定义：

```cpp
for (int i = 1; i <= matrix.rows; i++) {
    for (int j = 1; j <= matrix.columns; j++) {
        scanf("%lld", &matrix.value[i][j]);
    }
}
```

`i` 是当前行，`j` 是当前列。这是普通的二维顺序遍历，不使用图和树中表示当前节点的 `u`。

## 完整代码

下面的程序读入一个矩阵，再按照相同的行列结构输出。它没有进行数学运算，只展示本书后续矩阵文章统一使用的存储方式。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

struct Matrix {
    int rows;
    int columns;
    vector<vector<ll>> value;

    Matrix(int rows, int columns)
        : rows(rows), columns(columns), value(rows + 5, vector<ll>(columns + 5)) {}
};

int main() {
    int rows, columns;
    scanf("%d%d", &rows, &columns);

    Matrix matrix(rows, columns);
    for (int i = 1; i <= matrix.rows; i++) {
        for (int j = 1; j <= matrix.columns; j++) {
            scanf("%lld", &matrix.value[i][j]);
        }
    }

    for (int i = 1; i <= matrix.rows; i++) {
        for (int j = 1; j <= matrix.columns; j++) {
            if (j > 1) {
                printf(" ");
            }
            printf("%lld", matrix.value[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```

输入：

```text
2 3
2 5 1
7 0 4
```

输出：

```text
2 5 1
7 0 4
```

## 正确性

读入循环按照 `i=1..rows`、`j=1..columns` 的顺序，把输入的第 `i` 行第 `j` 个数保存到 `matrix.value[i][j]`。

输出循环使用完全相同的顺序访问每个真实元素，所以每个值都会回到原来的行列位置，且不会访问位置 `0` 或 `+5` 余量。程序输出的矩阵与输入矩阵大小相同、每个对应元素相同，因此两者相等。

## 复杂度

一个 `rows * columns` 矩阵包含这么多个元素，因此存储空间为：

$$
O(rows\times columns).
$$

读入或完整遍历一次全部元素的时间复杂度也是 $O(rows\times columns)$。额外的 `+5` 只改变常数，不改变渐进复杂度。

## 常见错误

### 把行列顺序写反

矩阵大小先写行数再写列数，元素下标也先写行再写列。`value[i][j]` 表示第 `i` 行第 `j` 列。

### 默认矩阵一定是方阵

矩阵可以是任意 `rows * columns` 大小。只有行数等于列数时才是方阵。

### 使用 vector.size() 作为真实大小

内部 `vector` 带有 `+5` 余量。真实大小保存在 `rows` 与 `columns` 中，遍历只能到这两个边界。

### 混用 0-based 与 1-based

本书自定义矩阵的真实元素从 `1` 开始。只有直接调用 `vector` 自身接口时，才考虑 STL 原生的 0-based 规则。

### 只比较元素数量

矩阵相等还要求行数、列数和每个元素的位置完全相同，不能只比较一共有多少个数字。

## 基础练习

1. 指出一个 $3\times4$ 矩阵共有多少行、多少列、多少个元素。
2. 写出示例矩阵中的 `A[2][3]`。
3. 解释 $1\times3$ 行矩阵与 $3\times1$ 列矩阵为什么不同。
4. 修改完整程序，使所有元素读入后都增加 `1` 再输出。
5. 建立一个 $n\times n$ 方阵，并把主对角线 `value[i][i]` 全部设为 `1`。

## 需要记住什么

1. 一个矩阵的大小按什么顺序书写？
2. `A[i][j]` 中两个下标分别表示什么？
3. 方阵、行矩阵和列矩阵分别有什么大小特征？
4. 两个矩阵相等需要满足哪些条件？
5. `Matrix` 为什么要同时保存 `rows`、`columns` 与 `value`？
6. 带有 `+5` 余量时，真实元素范围怎样确定？

下一篇 [矩阵：加法与减法（正文待写）](../CATALOG.md#05-数学) 会从“两个同样大小的表格怎样合并对应状态”推出逐元素运算。
