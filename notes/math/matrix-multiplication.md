# 矩阵：乘法

> 最近修订：2026-08-15 23:11 +10:00（未审阅）

[矩阵：加法与减法](matrix-addition-subtraction.md)只合并相同位置的元素。矩阵乘法解决的是另一类问题：两段关系怎样通过一层中间状态合成为一段关系？

假设 `A[i][k]` 表示从左侧状态 `i` 到中间状态 `k` 的方案数，`B[k][j]` 表示从中间状态 `k` 到右侧状态 `j` 的方案数。我们希望计算从 `i` 经过某个中间状态到 `j` 的总方案数。

这个问题会自然推出矩阵乘法，而不是先凭空规定“一行乘一列”。

## 固定一个中间状态

若规定必须经过中间状态 `k`，第一段有 `A[i][k]` 种选择，第二段有 `B[k][j]` 种选择。

根据[乘法原理](multiplication-principle.md)，经过这个固定 `k` 的方案数是：

$$
A_{i,k}B_{k,j}.
$$

## 枚举所有中间状态

一条完整方案只会选择其中一个中间状态。经过不同 `k` 的方案互不相同，因此根据[加法原理](addition-principle.md)，总方案数是：

$$
C_{i,j}=\sum_k A_{i,k}B_{k,j}.
$$

固定 `i,j` 时，`A[i][k]` 沿着 `A` 的第 `i` 行移动，`B[k][j]` 沿着 `B` 的第 `j` 列移动。这就是“一行与一列对应相乘，再把乘积相加”的来源。

矩阵乘法不只用于方案计数。只要两层线性关系的合成遵循同样的乘加结构，就使用完全相同的定义。

## 为什么内侧维度必须相等

设 `A` 是 $r\times m$ 矩阵：

- `r` 行对应左侧状态；
- `m` 列对应中间状态。

设 `B` 是 $m\times c$ 矩阵：

- `m` 行仍对应同一组中间状态；
- `c` 列对应右侧状态。

只有：

```text
A.columns == B.rows
```

时，每个 `A[i][k]` 才能找到描述同一个中间状态的 `B[k][j]`。

乘积 `C = A * B` 的行来自 `A`，列来自 `B`，所以大小是：

$$
(r\times m)(m\times c)=r\times c.
$$

被消去的是中间维度 `m`。

## 手算一个元素

令：

$$
A=
\begin{bmatrix}
1&2&3\\
4&5&6
\end{bmatrix},
\qquad
B=
\begin{bmatrix}
7&8\\
9&10\\
11&12
\end{bmatrix}.
$$

`A` 是 $2\times3$，`B` 是 $3\times2$，内侧维度都是 `3`，所以乘积存在并且是 $2\times2$。

答案左上角使用 `A` 的第 `1` 行与 `B` 的第 `1` 列：

$$
C_{1,1}=1\times7+2\times9+3\times11=58.
$$

答案右上角使用 `A` 的第 `1` 行与 `B` 的第 `2` 列：

$$
C_{1,2}=1\times8+2\times10+3\times12=64.
$$

计算全部位置得到：

$$
AB=
\begin{bmatrix}
58&64\\
139&154
\end{bmatrix}.
$$

## 直接翻译定义

答案有 `a.rows` 行、`b.columns` 列。固定答案位置 `(i,j)` 后，枚举全部中间位置 `k`：

```cpp
Matrix answer(a.rows, b.columns);
for (int i = 1; i <= a.rows; i++) {
    for (int j = 1; j <= b.columns; j++) {
        for (int k = 1; k <= a.columns; k++) {
            answer.value[i][j] += a.value[i][k] * b.value[k][j];
        }
    }
}
```

这正是公式 $C_{i,j}=\sum_k A_{i,k}B_{k,j}$ 的逐字翻译。

## 为什么模板使用 i-k-j

求和中的每一项最终都要加到 `answer[i][j]`。只要每个三元组 `(i,k,j)` 恰好处理一次，三层循环的合法交换不会改变结果。

把顺序改为：

```cpp
for (int i = 1; i <= a.rows; i++) {
    for (int k = 1; k <= a.columns; k++) {
        for (int j = 1; j <= b.columns; j++) {
            answer.value[i][j] += a.value[i][k] * b.value[k][j];
        }
    }
}
```

固定 `i,k` 时，`a.value[i][k]` 可以反复用于整段 `j` 循环；`b.value[k][j]` 与 `answer.value[i][j]` 都沿同一行连续访问。二维 `vector` 的一行存储在连续内存中，因此这种顺序通常具有更好的内存局部性。

`i-k-j` 不是另一种矩阵乘法，也没有使用位运算技巧；它只是重新排列相同的三重枚举，所以本书竞赛模板采用这个顺序。

## 模意义下的矩阵乘法

递推计数和矩阵快速幂通常要求答案模固定的 `MOD`。每加入一项就取模：

```cpp
answer.value[i][j] =
    (answer.value[i][j] + (__int128)a.value[i][k] * b.value[k][j]) % MOD;
```

本篇模板约定两个输入矩阵的元素已经规范到 `[0, MOD - 1]`。使用 `__int128` 承接一次乘法，避免当模数接近 64 位范围时中间乘积先溢出；取模后再保存回 `ll`。

若题目保证普通 `ll` 乘法不会溢出，也可以直接相乘。本篇完整代码使用固定模数，是为了能被后续矩阵快速幂直接复用。

## 单位矩阵

普通乘法有单位元 `1`。方阵乘法也有单位元，称为单位矩阵。

`n` 阶单位矩阵记作 `I`，主对角线为 `1`，其余位置为 `0`：

$$
I=
\begin{bmatrix}
1&0&\cdots&0\\
0&1&\cdots&0\\
\vdots&\vdots&\ddots&\vdots\\
0&0&\cdots&1
\end{bmatrix}.
$$

代码先建立全零方阵，再填写主对角线：

```cpp
Matrix identity(int n) {
    Matrix answer(n, n);
    for (int i = 1; i <= n; i++) {
        answer.value[i][i] = 1;
    }
    return answer;
}
```

对任何尺寸允许的矩阵 `A`：

$$
IA=A,
\qquad
AI=A.
$$

因为单位矩阵的一行只有与当前位置相同的中间下标系数为 `1`，其他项全为 `0`。矩阵快速幂会用单位矩阵表示零次幂。

## 乘法有顺序

矩阵乘法一般不满足交换律：

$$
AB\ne BA.
$$

有时 `AB` 存在，`BA` 甚至没有定义。例如 $2\times3$ 矩阵可以右乘 $3\times4$ 矩阵，但反过来的内侧维度 `4` 和 `2` 不相等。

即使 `A,B` 都是同阶方阵，交换顺序也通常得到不同结果。矩阵表示按顺序发生的关系合成，先后顺序不能随意颠倒。

## 乘法满足结合律

只要尺寸允许：

$$
(AB)C=A(BC).
$$

固定答案位置 `(i,j)`，左侧展开为：

$$
\sum_t\left(\sum_k A_{i,k}B_{k,t}\right)C_{t,j},
$$

右侧展开为：

$$
\sum_k A_{i,k}\left(\sum_t B_{k,t}C_{t,j}\right).
$$

两边都枚举所有 `(k,t)`，并累加同一项 $A_{i,k}B_{k,t}C_{t,j}$，所以结果相同。

结合律允许我们改变连续矩阵乘法的括号，也是矩阵快速幂能够复用普通快速幂结构的基础；但结合律不允许交换矩阵顺序。

## 完整代码

下面的程序在固定模 `1000000007` 下计算 `A * B`。输入保证 `A.columns == B.rows`，并且所有元素已经位于 `[0, MOD - 1]`。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const ll MOD = 1000000007;

struct Matrix {
    int rows;
    int columns;
    vector<vector<ll>> value;

    Matrix(int rows, int columns)
        : rows(rows), columns(columns),
          value(rows + 5, vector<ll>(columns + 5)) {}
};

Matrix multiply(const Matrix& a, const Matrix& b) {
    Matrix answer(a.rows, b.columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int k = 1; k <= a.columns; k++) {
            for (int j = 1; j <= b.columns; j++) {
                answer.value[i][j] = (answer.value[i][j] +
                                      (__int128)a.value[i][k] * b.value[k][j]) %
                                     MOD;
            }
        }
    }
    return answer;
}

Matrix identity(int n) {
    Matrix answer(n, n);
    for (int i = 1; i <= n; i++) {
        answer.value[i][i] = 1;
    }
    return answer;
}

int main() {
    int rows, middle, columns;
    scanf("%d%d%d", &rows, &middle, &columns);

    Matrix a(rows, middle);
    Matrix b(middle, columns);
    for (int i = 1; i <= a.rows; i++) {
        for (int j = 1; j <= a.columns; j++) {
            scanf("%lld", &a.value[i][j]);
        }
    }
    for (int i = 1; i <= b.rows; i++) {
        for (int j = 1; j <= b.columns; j++) {
            scanf("%lld", &b.value[i][j]);
        }
    }

    Matrix answer = multiply(a, b);
    for (int i = 1; i <= answer.rows; i++) {
        for (int j = 1; j <= answer.columns; j++) {
            if (j > 1) {
                printf(" ");
            }
            printf("%lld", answer.value[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```

输入：

```text
2 3 2
1 2 3
4 5 6
7 8
9 10
11 12
```

输出：

```text
58 64
139 154
```

## 正确性

`multiply` 为每个 `i=1..a.rows`、`k=1..a.columns`、`j=1..b.columns` 恰好执行一次更新，把 $A_{i,k}B_{k,j}$ 加入 $C_{i,j}$。

答案矩阵初始全为 `0`。固定任意 `(i,j)`，循环结束后它累加了所有合法中间下标 `k` 的乘积，因此：

$$
C_{i,j}=\sum_{k=1}^{a.columns}A_{i,k}B_{k,j}\pmod {MOD}.
$$

这正是模意义下的矩阵乘法定义，所以全部答案元素正确。

## 复杂度

设 `A` 是 $r\times m$，`B` 是 $m\times c$。三层循环分别枚举 `r,m,c` 个下标，时间复杂度为：

$$
O(rmc).
$$

答案矩阵使用 $O(rc)$ 空间。若不计算输入矩阵本身，算法只在答案之外使用常数个循环变量。

## 常见错误

### 检查了错误的尺寸

矩阵乘法要求 `A.columns == B.rows`，不是要求两个矩阵大小完全相同。答案大小是 `A.rows * B.columns`。

### 把矩阵乘法写成逐元素相乘

`C[i][j]` 需要对全部中间下标 `k` 求和，不是简单的 `A[i][j] * B[i][j]`。

### 交换矩阵顺序

`AB` 与 `BA` 通常不同，甚至可能只有一个有定义。表示连续变换时尤其不能颠倒先后顺序。

### 忘记答案从零开始

每个 `C[i][j]` 是一段累加。新建答案矩阵时必须把元素初始化为 `0`；本篇的 `vector` 构造会自动完成。

### 乘法后才使用 ll 取模

若两个因子可能很大，`ll` 乘积可能在 `% MOD` 以前已经溢出。使用 `__int128` 承接乘法，再取模存回 `ll`。

### 把结合律误解成交换律

结合律只能改变括号：`(AB)C=A(BC)`；不能把 `AB` 改成 `BA`。

## 基础练习

1. 手算一个 $1\times3$ 行矩阵与 $3\times1$ 列矩阵的乘积。
2. 说明为什么 $2\times3$ 与 $3\times4$ 相乘得到 $2\times4$。
3. 独立计算示例中的 `C[2][1]`。
4. 找两个 $2\times2$ 矩阵，验证 `AB!=BA`。
5. 用元素公式证明 `AI=A`。
6. 比较 `i-j-k` 与 `i-k-j` 两种循环分别怎样访问 `B` 的元素。

## 需要记住什么

1. 怎样从“经过中间状态”推出 $C_{i,j}=\sum_k A_{i,k}B_{k,j}$？
2. 两个矩阵相乘需要满足什么尺寸条件，答案大小是什么？
3. 为什么模板使用 `i-k-j` 循环仍然等于定义？
4. 单位矩阵的哪些位置是 `1`？
5. 矩阵乘法满足结合律吗？满足交换律吗？
6. 模矩阵乘法为什么可能需要 `__int128`？

下一篇 [线性变换：矩阵表示（正文待写）](../catalog.md#05-数学) 会解释矩阵为什么能统一表示多个输出对多个输入的线性组合。
