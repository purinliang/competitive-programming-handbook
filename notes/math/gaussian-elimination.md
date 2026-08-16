# 高斯消元

> 最近修订：2026-08-17 10:38 +10:00（未审阅）

给定 $n$ 个含 $n$ 个未知数的线性方程，例如：

$$
\begin{cases}
2x+y-z=8,\\
-3x-y+2z=-11,\\
-2x+y+2z=-3,
\end{cases}
$$

需要判断方程组是唯一解、无解还是有无穷多解；若解唯一，还要求出全部未知数。

两个方程相加减、把一个方程乘以非零常数，都会改变方程的写法，却不会改变所有
方程的公共解。高斯消元利用这些等价变换，把复杂方程组逐列化成容易读取答案的
形态。

## 用增广矩阵保存方程

将每个方程的未知数系数写成一行，等号右侧常数放在最后一列：

$$
\left[
\begin{array}{ccc|c}
2&1&-1&8\\
-3&-1&2&-11\\
-2&1&2&-3
\end{array}
\right].
$$

矩阵 `a[row][column]` 的前 `n` 列是系数，第 `n+1` 列是等号右侧。对整行执行
同样的加减和缩放，就等价于对原方程执行合法变换。

## 每一列选择一个主元

从第一列开始，希望找到一个系数非零的方程，用它消掉其他方程在这一列的系数。
这个非零系数称为主元。

处理第 `column` 个未知数时，在尚未确定主元的行中选择绝对值最大的系数：

```cpp
int pivot = current_row;
for (int row = current_row; row <= n; row++) {
    if (abs(a[row][column]) > abs(a[pivot][column])) {
        pivot = row;
    }
}
```

选择绝对值最大者称为部分主元选取。理论上任意非零系数都能作为主元，但浮点数
除以一个极小值会放大误差；选择当前列较大的系数通常更稳定。

若最大绝对值仍小于 `EPS`，这一列没有可用主元，说明这个未知数暂时是自由变量。
跳过本列，继续处理下一列。

## 把主元变成 1

找到主元以后，先交换到 `current_row`。将整行从当前列到常数列都除以主元：

```cpp
double divisor = a[current_row][column];
for (int j = column; j <= n + 1; j++) {
    a[current_row][j] /= divisor;
}
```

当前行在主元列的系数变成 1。

## 消掉其他行的同列系数

若另一行在当前列的系数为 `factor`，执行：

$$
row_i\leftarrow row_i-factor\cdot current\_row.
$$

这一行在当前列就变成 0。本文使用 Gauss–Jordan 形式，消掉主元上方和下方的
所有行：

```cpp
for (int row = 1; row <= n; row++) {
    if (row == current_row) {
        continue;
    }

    double factor = a[row][column];
    for (int j = column; j <= n + 1; j++) {
        a[row][j] -= factor * a[current_row][j];
    }
}
```

记录 `where[column] = current_row`，表示第 `column` 个未知数的主元位于哪一行，
然后进入下一行和下一列。

## 怎样判断无解

消元后，若某一行所有未知数系数都近似为 0，常数项却不为 0，就得到：

$$
0=c\qquad(c\ne0).
$$

这是矛盾方程，原方程组无解。

例如：

$$
\begin{cases}
x+y=1,\\
x+y=2
\end{cases}
$$

两行相减后会得到 `0=1`。

## 怎样判断无穷多解

若没有矛盾行，但某个未知数列从未找到主元，即 `where[column] == 0`，这个未知数
可以自由取值，其他未知数随它变化。方程组有无穷多解。

例如只有一个方程：

$$
x+y=1.
$$

选择任意 $y$，都能令 $x=1-y$，所以解不唯一。

当每个未知数都拥有主元且没有矛盾行时，解唯一。Gauss–Jordan 消元已经把每个
主元列的其他系数消成 0，答案直接是对应行的常数项。

## 完整代码

输入 $n$ 与一个 $n\times(n+1)$ 的增广矩阵。程序输出 `No solution`、
`Infinite solutions`，或唯一解的每个分量。

```cpp
#include <bits/stdc++.h>
using namespace std;

const double EPS = 1e-10;

enum SolutionType { NO_SOLUTION, UNIQUE_SOLUTION, INFINITE_SOLUTIONS };

int n;
vector<vector<double>> a;

SolutionType gaussian_elimination(vector<double>& solution) {
    vector<int> where(n + 5, 0);
    int current_row = 1;

    for (int column = 1; column <= n && current_row <= n; column++) {
        int pivot = current_row;

        for (int row = current_row; row <= n; row++) {
            if (abs(a[row][column]) > abs(a[pivot][column])) {
                pivot = row;
            }
        }

        if (abs(a[pivot][column]) < EPS) {
            continue;
        }

        swap(a[pivot], a[current_row]);

        double divisor = a[current_row][column];
        for (int j = column; j <= n + 1; j++) {
            a[current_row][j] /= divisor;
        }

        for (int row = 1; row <= n; row++) {
            if (row == current_row) {
                continue;
            }

            double factor = a[row][column];
            for (int j = column; j <= n + 1; j++) {
                a[row][j] -= factor * a[current_row][j];
            }
        }

        where[column] = current_row;
        current_row++;
    }

    for (int row = 1; row <= n; row++) {
        bool all_zero = true;

        for (int column = 1; column <= n; column++) {
            if (abs(a[row][column]) >= EPS) {
                all_zero = false;
                break;
            }
        }

        if (all_zero && abs(a[row][n + 1]) >= EPS) {
            return NO_SOLUTION;
        }
    }

    solution.assign(n + 5, 0);

    for (int column = 1; column <= n; column++) {
        if (where[column] == 0) {
            return INFINITE_SOLUTIONS;
        }
        solution[column] = a[where[column]][n + 1];
    }

    return UNIQUE_SOLUTION;
}

void solve() {
    cin >> n;

    a.assign(n + 5, vector<double>(n + 2, 0));
    for (int row = 1; row <= n; row++) {
        for (int column = 1; column <= n + 1; column++) {
            cin >> a[row][column];
        }
    }

    vector<double> solution;
    SolutionType type = gaussian_elimination(solution);

    if (type == NO_SOLUTION) {
        cout << "No solution\n";
    } else if (type == INFINITE_SOLUTIONS) {
        cout << "Infinite solutions\n";
    } else {
        cout << fixed << setprecision(10);
        for (int i = 1; i <= n; i++) {
            cout << solution[i] << '\n';
        }
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 浮点误差与 `EPS`

浮点运算以后，一个理论上的 0 可能变成 `1e-15`。因此代码不直接使用
`a == 0`，而判断 `abs(a) < EPS`。

`EPS` 不是对所有输入都万能。若系数尺度相差极大，固定绝对误差阈值可能不够
稳健；题目若在有限域取模，应该使用模逆元完成精确消元；整数方程若要求精确有理
数，也需要分数或其他精确表示。本篇解决竞赛中常见的中等规模实数方程组。

## 复杂度

最多选择 $n$ 个主元。每个主元可能消去 $n$ 行，每行更新 $O(n)$ 个系数：

- 时间复杂度：$O(n^3)$；
- 空间复杂度：$O(n^2)$。

方程数量与未知数数量不相等时，算法原理不变，只需分别记录行数和列数。本文用
方阵形式集中说明唯一解、无解与自由变量，不在第一份模板中增加额外维度。

## 常见错误

- 只修改系数列，忘记常数列也必须执行同样行变换；
- 固定使用当前行作主元，没有在下方选择绝对值较大的系数；
- 主元近似为 0 时仍然相除，放大数值误差；
- 一列没有主元时直接判无解；它可能只是一个自由变量；
- 看到自由变量就立即判无穷多解，没有先检查 `0=c` 的矛盾行；
- 消元以后假定第 `i` 行一定对应第 `i` 个未知数，忘记记录 `where`；
- 使用浮点数却用 `== 0` 判断主元和矛盾；
- 模意义方程组仍使用浮点除法，而不是模逆元。

## 需要记住什么

- 哪些行变换不会改变线性方程组的解集？
- 为什么选择绝对值较大的主元能改善浮点稳定性？
- 一列没有主元表示什么，为什么不一定无解？
- 怎样从消元结果区分无解、无穷多解与唯一解？
- `where[column]` 保存什么？
- 为什么浮点实现必须使用误差阈值？
- 高斯消元的时间与空间复杂度是什么？
