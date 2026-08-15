# 矩阵快速幂

> 最近修订：2026-08-15 23:55 +10:00（未审阅）

Fibonacci 数列满足：

$$
F_0=0,qquad F_1=1,qquad F_{n+1}=F_n+F_{n-1}.
$$

按照递推式依次计算到 $F_n$ 需要 $O(n)$ 时间。若 $n$ 接近 $10^{18}$，即使每项只进行一次加法，也无法逐项走完。

一次递推可以表示成一个[线性变换](linear-transformations-as-matrices.md)。连续执行同一个递推，就是反复乘同一个矩阵；再把[快速幂](fast-power.md)中的普通乘法换成[矩阵乘法](matrix-multiplication.md)，便能在 $O(\log n)$ 轮中合成全部转移。

本篇从 Fibonacci 数列推出转移矩阵，再把这一方法推广到一般线性递推。

## 一个数不足以表示当前状态

已知 $F_n$ 还不能单独得到 $F_{n+1}$，因为递推还需要 $F_{n-1}$。因此不能只把“当前状态”定义成一个数。

为了让一次转移拥有所需的全部信息，把相邻两项放在一起：

$$
S_n=
\begin{bmatrix}
F_{n+1}\\
F_n
\end{bmatrix}.
$$

这样从 $S_n$ 计算 $S_{n+1}$ 时，需要的 $F_{n+1}$ 与 $F_n$ 都已经保存在当前状态中。

选择状态时，关键不是把尽可能多的历史全部保存下来，而是保存“足以唯一计算下一步”的信息。

## 逐行推出转移矩阵

下一步状态是：

$$
S_{n+1}=
\begin{bmatrix}
F_{n+2}\\
F_{n+1}
\end{bmatrix}.
$$

先看第一行。根据 Fibonacci 递推：

$$
F_{n+2}=F_{n+1}+F_n.
$$

它对当前状态两个分量的系数都是 `1`，所以转移矩阵第一行为：

$$
\begin{bmatrix}
1&1
\end{bmatrix}.
$$

第二行只需要把原来的第一项 $F_{n+1}$ 原样移动下来：

$$
F_{n+1}=1\times F_{n+1}+0\times F_n.
$$

所以第二行为：

$$
\begin{bmatrix}
1&0
\end{bmatrix}.
$$

两行合在一起，得到一次转移矩阵：

$$
A=
\begin{bmatrix}
1&1\\
1&0
\end{bmatrix},
\qquad
S_{n+1}=AS_n.
$$

矩阵不是背诵出来的固定模板：每一行都来自“新状态的这个分量怎样由旧状态组成”。状态定义变化时，矩阵也必须重新推导。

## 多次转移变成矩阵幂

从 $S_0$ 出发连续执行转移：

$$
S_1=AS_0,
$$

$$
S_2=AS_1=A^2S_0,
$$

继续下去可得：

$$
S_n=A^nS_0.
$$

初始状态为：

$$
S_0=
\begin{bmatrix}
F_1\\
F_0
\end{bmatrix}
=
\begin{bmatrix}
1\\
0
\end{bmatrix}.
$$

因此只要求出 $A^n$，再应用到 $S_0$，结果的第二个分量就是 $F_n$。

## 为什么普通快速幂可以搬过来

普通快速幂依赖三件事：

- 乘法满足结合律；
- 存在单位元；
- 可以把同一个底数反复平方。

同阶方阵乘法满足结合律，单位矩阵 `I` 是乘法单位元，因此矩阵幂同样满足：

$$
A^0=I,
$$

以及：

$$
A^{2k}=A^kA^k,
$$

$$
A^{2k+1}=A\left(A^kA^k\right).
$$

所以矩阵快速幂仍然维护 `result`、`base` 和 `exponent` 三个量，只是它们中的前两个从整数变成矩阵。

矩阵幂只对方阵定义，因为每次平方都要求 `base.columns == base.rows`。

## 从普通快速幂翻译成矩阵快速幂

结果最初表示零次幂。普通快速幂写 `1`，矩阵快速幂改成同阶单位矩阵：

```cpp
Matrix result = identity(base.rows);
```

若当前指数为奇数，把这一位对应的矩阵幂乘入答案：

```cpp
if (exponent % 2 == 1) {
    result = multiply(result, base);
}
```

随后平方当前矩阵，并删除指数最低位：

```cpp
base = multiply(base, base);
exponent /= 2;
```

合并后就是完整的矩阵快速幂函数：

```cpp
Matrix power(Matrix base, ll exponent) {
    Matrix result = identity(base.rows);
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = multiply(result, base);
        }
        base = multiply(base, base);
        exponent /= 2;
    }
    return result;
}
```

这里保留 `result = multiply(result, base)` 的顺序。矩阵乘法通常不能交换；即使同一个矩阵的各次幂彼此可交换，也不应把模板写成依赖这个巧合的另一套顺序。

## 把合成变换应用到初始状态

代码使用 1-based 状态向量。先写出转移矩阵和初始状态：

```cpp
Matrix transition(2, 2);
transition.value[1][1] = 1;
transition.value[1][2] = 1;
transition.value[2][1] = 1;

vector<ll> initial(2 + 5);
initial[1] = 1;
initial[2] = 0;
```

计算 $A^nS_0$：

```cpp
Matrix combined = power(transition, n);
vector<ll> answer = apply_transformation(combined, initial);
```

`answer[1]` 是 $F_{n+1}$，`answer[2]` 是 $F_n$。当 `n = 0` 时，`combined` 是单位矩阵，初始状态保持不变，因此同一份代码自然得到 $F_0=0$。

## 完整代码

下面的程序计算 $F_n\bmod 1000000007$。输入保证 `0 <= n <= 10^18`。

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

Matrix power(Matrix base, ll exponent) {
    Matrix result = identity(base.rows);
    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = multiply(result, base);
        }
        base = multiply(base, base);
        exponent /= 2;
    }
    return result;
}

vector<ll> apply_transformation(const Matrix& transformation,
                                const vector<ll>& input) {
    vector<ll> output(transformation.rows + 5);
    for (int i = 1; i <= transformation.rows; i++) {
        for (int j = 1; j <= transformation.columns; j++) {
            output[i] =
                (output[i] + (__int128)transformation.value[i][j] * input[j]) %
                MOD;
        }
    }
    return output;
}

int main() {
    ll n;
    scanf("%lld", &n);

    Matrix transition(2, 2);
    transition.value[1][1] = 1;
    transition.value[1][2] = 1;
    transition.value[2][1] = 1;

    vector<ll> initial(2 + 5);
    initial[1] = 1;
    initial[2] = 0;

    Matrix combined = power(transition, n);
    vector<ll> answer = apply_transformation(combined, initial);
    printf("%lld\n", answer[2]);
    return 0;
}
```

输入：

```text
10
```

输出：

```text
55
```

## 正确性

### 转移矩阵正确

若当前状态为 $S_n=[F_{n+1},F_n]^T$，转移矩阵第一行计算 $F_{n+1}+F_n=F_{n+2}$，第二行计算 $F_{n+1}$。因此乘法结果恰好是 $S_{n+1}$。

### 矩阵快速幂正确

设最初要求 $A^E$。循环始终保持：

$$
result\times base^{exponent}=A^E.
$$

初始时 `result = I`、`base = A`、`exponent = E`，等式成立。指数为偶数时，平方 `base` 并把指数减半不会改变右侧乘积；指数为奇数时，先把一个 `base` 乘入 `result`，再进行同样的平方与减半，等式仍成立。

循环结束时 `exponent = 0`，所以 `result = A^E`。

### 最终答案正确

从 $S_0$ 开始，每乘一次 `A` 就前进一个下标，因此 $A^nS_0=S_n$。`S_n` 的第二个分量是 $F_n$，程序输出 `answer[2]`，所以答案正确。

## 推广到一般线性递推

设一个 $k$ 阶线性递推为：

$$
a_n=c_1a_{n-1}+c_2a_{n-2}+\cdots+c_ka_{n-k}.
$$

为了计算下一项，状态需要保留最近 $k$ 项：

$$
S_n=
\begin{bmatrix}
a_n\\
a_{n-1}\\
\vdots\\
a_{n-k+1}
\end{bmatrix}.
$$

转移矩阵第一行放递推系数 `c1, c2, ..., ck`；下面每一行只负责把旧状态的一个分量向下移动，所以次对角线填 `1`，其余位置填 `0`：

$$
\begin{bmatrix}
c_1&c_2&\cdots&c_k\\
1&0&\cdots&0\\
0&1&\cdots&0\\
\vdots&\vdots&\ddots&\vdots
\end{bmatrix}.
$$

矩阵快速幂的代码不变；变化的只有状态含义、初始状态和转移矩阵。

若递推含固定常数，例如 $a_n=2a_{n-1}+3$，可以在状态末尾增加一个恒为 `1` 的分量，让常数 `3` 也成为矩阵中的一个系数。这与齐次坐标表示平移是同一种方法。

## 复杂度

设状态有 `k` 个分量。朴素矩阵乘法需要 $O(k^3)$ 时间，矩阵快速幂执行 $O(\log n)$ 轮，因此总时间复杂度是：

$$
O(k^3\log n).
$$

矩阵占用 $O(k^2)$ 空间。Fibonacci 的 `k = 2` 是固定常数，所以时间复杂度可简写为 $O(\log n)$，额外空间为 $O(1)$。

矩阵快速幂适合状态维数较小、转移固定而次数极大的递推。若 `k` 很大，$k^3$ 的矩阵乘法可能比逐项递推更慢，不能只看到 $\log n$ 就忽略状态维度。

## 常见错误

### 状态没有保存足够信息

只保存 $F_n$ 无法计算 $F_{n+1}$。必须先确定下一步依赖哪些旧量，再定义状态。

### 背诵 Fibonacci 矩阵

`[[1, 1], [1, 0]]` 只属于当前状态定义。若状态分量顺序改变，矩阵的行列也会改变；应逐行根据新状态推导。

### 使用全零矩阵初始化 result

快速幂的 `result` 表示零次幂，必须初始化为单位矩阵。全零矩阵乘任何矩阵仍为全零矩阵。

### 把矩阵相乘顺序写反

复合变换有方向，矩阵乘法不能随意交换。本篇状态使用列向量，新的变换始终从左侧乘入。

### 指数偏移一位

先写清楚初始状态是 $S_0$ 还是 $S_1$，再确定需要多少次转移。本篇从 $S_0$ 到 $S_n$，所以计算 $A^n$。

### 忘记处理零次幂

当 `n = 0` 时不进入循环，`power` 应返回单位矩阵，并保持初始状态不变。

### 只在最后取模

矩阵元素增长极快。每次乘加都必须及时取模；本篇使用 `__int128` 承接一次乘法，再保存回 64 位整数。

## 基础练习

1. 手算 $A^2S_0$，验证结果为 $[F_3,F_2]^T=[2,1]^T$。
2. 把递推 $a_n=2a_{n-1}+a_{n-2}$ 写成二阶转移矩阵。
3. 为递推 $a_n=a_{n-1}+a_{n-2}+a_{n-3}$ 设计状态和转移矩阵。
4. 为递推 $a_n=2a_{n-1}+3$ 增加恒为 `1` 的状态分量并写出转移矩阵。
5. 修改程序，使其同时输出 $F_n$ 与 $F_{n+1}$。
6. 对较小的 `n` 同时运行逐项递推和矩阵快速幂，比较结果。

## 需要记住什么

1. 为什么只保存一个 Fibonacci 数不足以完成下一次转移？
2. 怎样根据新状态的每个分量逐行推出转移矩阵？
3. 为什么矩阵快速幂的 `result` 必须从单位矩阵开始？
4. 怎样从连续转移得到 $S_n=A^nS_0$？
5. 一般 $k$ 阶线性递推的状态和转移矩阵怎样构造？
6. 矩阵快速幂的时间复杂度为什么是 $O(k^3\log n)$？
