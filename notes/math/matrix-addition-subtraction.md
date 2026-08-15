# 矩阵：加法与减法

> 最近修订：2026-08-15 23:08 +10:00（未审阅）

[矩阵：表示](matrix-representation.md)把一个矩阵定义为固定大小、按行列排列的一组元素。

若两个矩阵的相同位置表示同一种量，就可以把对应元素相加。例如两个 $2\times3$ 表格分别记录上午和下午三个站点的两类客流，把它们合并成全天数据时，第 `i` 行第 `j` 列只需要与另一个表格的同一位置相加。

矩阵加法就是这种逐位置合并。矩阵减法则计算每个对应位置的差。

## 为什么大小必须相同

设矩阵 `A` 有 `2` 行、`3` 列：

$$
A=
\begin{bmatrix}
1&2&3\\
4&5&6
\end{bmatrix}.
$$

若另一个矩阵 `B` 也是 $2\times3$，那么 `A` 的每个位置都能找到唯一的 `B[i][j]` 与它对应。

但若 `B` 是 $3\times2$，`A[1][3]` 就没有 `B[1][3]`；即使两个矩阵都恰好有六个元素，它们的行列位置也不一致。

因此矩阵加减法要求：

```text
A.rows == B.rows
A.columns == B.columns
```

不满足时，矩阵加法与减法没有定义。这不是实现上的限制，而是“对应位置”不存在。

## 矩阵加法

对于两个同为 $r\times c$ 的矩阵 `A,B`，它们的和 `C=A+B` 仍是 $r\times c$ 矩阵，并定义：

$$
C_{i,j}=A_{i,j}+B_{i,j}.
$$

例如：

$$
\begin{bmatrix}
1&2&3\\
4&5&6
\end{bmatrix}
+
\begin{bmatrix}
6&5&4\\
3&2&1
\end{bmatrix}
=
\begin{bmatrix}
7&7&7\\
7&7&7
\end{bmatrix}.
$$

每个答案元素只依赖相同位置的两个输入元素，不会把一行或一列中的其他值混进来。

## 翻译成代码

先建立与输入相同大小的答案矩阵：

```cpp
Matrix answer(a.rows, a.columns);
```

再遍历全部真实位置：

```cpp
for (int i = 1; i <= a.rows; i++) {
    for (int j = 1; j <= a.columns; j++) {
        answer.value[i][j] = a.value[i][j] + b.value[i][j];
    }
}
```

完整函数为：

```cpp
Matrix add(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, a.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int j = 1; j <= a.columns; j++) {
            answer.value[i][j] = a.value[i][j] + b.value[i][j];
        }
    }
    return answer;
}
```

参数使用 `const Matrix&`：函数只读取两个输入矩阵，不复制它们，也不会修改它们。返回值是新的结果矩阵。

调用前必须已经确认两个矩阵大小相同。竞赛题通常由输入条件保证；若题目中的大小可能不匹配，应在业务代码中先判断，而不是让 `add` 猜测怎样处理未定义的运算。

## 矩阵减法

同样大小的矩阵之差 `C=A-B` 定义为：

$$
C_{i,j}=A_{i,j}-B_{i,j}.
$$

代码只需把对应位置的 `+` 改为 `-`：

```cpp
Matrix subtract(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, a.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int j = 1; j <= a.columns; j++) {
            answer.value[i][j] = a.value[i][j] - b.value[i][j];
        }
    }
    return answer;
}
```

加法和减法可以放在同一篇，是因为它们拥有完全相同的尺寸条件和逐元素结构；减法只是把每个位置的标量加法换成标量减法。

## 零矩阵

所有元素都是 `0` 的 $r\times c$ 矩阵称为零矩阵。构造 `Matrix(r,c)` 时，内部 `vector` 已把所有元素初始化为 `0`，所以它自然得到对应大小的零矩阵。

设零矩阵为 `O`，则：

$$
A+O=A,
$$

因为每个位置都有：

$$
A_{i,j}+0=A_{i,j}.
$$

零矩阵的大小仍然重要。一个 $2\times3$ 零矩阵不能与 $3\times2$ 矩阵相加。

## 运算性质来自每个元素

普通整数加法满足交换律与结合律，所以同样大小的矩阵也满足：

$$
A+B=B+A,
$$

以及：

$$
(A+B)+C=A+(B+C).
$$

这些等式只需在每个 `(i,j)` 位置分别使用整数加法的性质即可。

减法不满足交换律。一般情况下：

$$
A-B\ne B-A.
$$

## 完整代码

下面的程序读入两个大小相同的矩阵，先输出它们的和，再空一行输出它们的差。

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

Matrix add(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, a.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int j = 1; j <= a.columns; j++) {
            answer.value[i][j] = a.value[i][j] + b.value[i][j];
        }
    }
    return answer;
}

Matrix subtract(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, a.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int j = 1; j <= a.columns; j++) {
            answer.value[i][j] = a.value[i][j] - b.value[i][j];
        }
    }
    return answer;
}

void print(const Matrix& matrix) {
    for (int i = 1; i <= matrix.rows; i++) {
        for (int j = 1; j <= matrix.columns; j++) {
            if (j > 1) {
                printf(" ");
            }
            printf("%lld", matrix.value[i][j]);
        }
        printf("\n");
    }
}

int main() {
    int rows, columns;
    scanf("%d%d", &rows, &columns);

    Matrix a(rows, columns);
    Matrix b(rows, columns);
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= columns; j++) {
            scanf("%lld", &a.value[i][j]);
        }
    }
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= columns; j++) {
            scanf("%lld", &b.value[i][j]);
        }
    }

    Matrix sum = add(a, b);
    Matrix difference = subtract(a, b);
    print(sum);
    printf("\n");
    print(difference);
    return 0;
}
```

输入：

```text
2 3
1 2 3
4 5 6
6 5 4
3 2 1
```

输出：

```text
7 7 7
7 7 7

-5 -3 -1
1 3 5
```

## 正确性

`add` 建立与输入相同大小的答案，并对每个合法位置 `(i,j)` 写入 `a.value[i][j]+b.value[i][j]`，恰好等于矩阵加法定义中的 $A_{i,j}+B_{i,j}$。所以返回矩阵的每个元素都正确。

`subtract` 以相同方式写入两个对应元素之差，所以返回矩阵的每个元素等于 $A_{i,j}-B_{i,j}$。

两个函数都只读输入并写入新矩阵，因此不会改变原矩阵。

## 复杂度

设矩阵有 `rows * columns` 个元素。两个函数都恰好访问每个位置一次，时间复杂度为：

$$
O(rows\times columns).
$$

返回的新矩阵需要 $O(rows\times columns)$ 空间。

## 常见错误

### 只检查元素总数

$2\times3$ 与 $3\times2$ 都有六个元素，但对应位置不同，不能相加或相减。必须分别比较行数和列数。

### 交换行列下标

答案的 `value[i][j]` 只与两个输入的 `value[i][j]` 对应，不能访问 `value[j][i]`。

### 意外修改输入矩阵

若题意需要保留 `A,B`，应建立新的答案矩阵。参数使用 `const Matrix&` 可以阻止函数内部误改输入。

### 忘记模数规范化

若题目要求模 `MOD`，加法后要 `%MOD`；减法可能得到负数，还要把结果规范到题目要求的余数范围。本篇计算普通 64 位整数，不预设模数。

### 认为减法满足交换律

`A-B` 与 `B-A` 的对应元素互为相反数，一般不相等。

## 基础练习

1. 手算两个 $2\times2$ 矩阵的和与差。
2. 解释为什么 $2\times3$ 与 $3\times2$ 矩阵不能相加。
3. 验证任意矩阵 `A` 与同样大小的零矩阵相加仍为 `A`。
4. 用对应元素证明矩阵加法的交换律。
5. 修改代码，在固定 `MOD` 下完成矩阵加减法并规范负数。

## 需要记住什么

1. 两个矩阵进行加减法需要满足什么尺寸条件？
2. 答案的第 `(i,j)` 个元素怎样计算？
3. 为什么矩阵加法满足交换律与结合律？
4. 零矩阵为什么仍然需要指定大小？
5. `const Matrix&` 在函数参数中表达什么意图？
6. 模意义下的矩阵减法还需要处理什么？

下一篇 [矩阵：乘法（正文待写）](../CATALOG.md#05-数学) 不再逐位置配对，而会让左矩阵的一整行与右矩阵的一整列共同产生一个答案元素。
