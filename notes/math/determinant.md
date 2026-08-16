# 行列式

> 最近修订：2026-08-17 10:52 +10:00（未审阅）

一个 $n\times n$ 矩阵可以看成线性变换。它把单位正方形、单位立方体或更高维
单位体积变成一个平行多面体。这个有向体积的缩放倍数，就是矩阵的行列式。

行列式为 0 时，体积被压扁到更低维：矩阵的行或列线性相关，线性方程组不可能
拥有唯一解，矩阵也没有逆矩阵。

竞赛中，行列式还会出现在矩阵树定理、线性递推和一些计数公式中。直接按照排列
定义枚举行列式有 $n!$ 项；利用高斯消元，可以在 $O(n^3)$ 时间内计算。

## 二阶行列式的几何意义

矩阵：

$$
A=\begin{bmatrix}a&b\\c&d\end{bmatrix}
$$

的行列式为：

$$
\det(A)=ad-bc.
$$

两列向量张成平行四边形，其面积为 $|ad-bc|$。符号还记录两个基向量的方向：
交换两列会反转方向，因此行列式变号。

高维行列式延续同样性质，不需要为每个维度重新写几何公式。

## 三种行变换怎样影响行列式

高斯消元只使用三类基本行变换：

1. 交换两行：行列式乘以 $-1$；
2. 一行乘以常数 $c$：行列式乘以 $c$；
3. 一行加上另一行的若干倍：行列式不变。

计算行列式时，可以只使用“交换行”和“把一行减去另一行的若干倍”，不把主元
行归一化。消元过程中的第三类操作不改变行列式，只需记录交换次数。

## 消成上三角矩阵

逐列选择主元，并把主元下方的同列系数消成 0。最终得到上三角矩阵：

$$
U=\begin{bmatrix}
u_{11}&*&\cdots&*\\
0&u_{22}&\cdots&*\\
\vdots&\ddots&\ddots&\vdots\\
0&\cdots&0&u_{nn}
\end{bmatrix}.
$$

上三角矩阵的行列式就是对角线乘积：

$$
\det(U)=u_{11}u_{22}\cdots u_{nn}.
$$

若消元中交换了奇数次行，再把结果乘以 $-1$；交换偶数次则符号不变。

## 为什么上三角行列式是对角线乘积

行列式的排列定义中，每一项会从每行、每列各选一个元素。上三角矩阵在主对角线
下方全部为 0。

若第一行没有选第一列，第一列就只能由更下面的某行选择，但这些位置全是 0；
因此第一行必须选 $u_{11}$。删去第一行第一列后，同样论证第二行必须选择
$u_{22}$。逐层继续，唯一可能非零的排列就是主对角线乘积。

## 选择主元并维护符号

与浮点高斯消元相同，在当前列未处理的行中选择绝对值最大的系数作为主元：

```cpp
int pivot = column;
for (int row = column; row <= n; row++) {
    if (abs(a[row][column]) > abs(a[pivot][column])) {
        pivot = row;
    }
}
```

若主元绝对值小于 `EPS`，这一列无法提供独立方向，矩阵秩小于 $n$，行列式为 0。

若 `pivot != column`，交换两行并翻转符号：

```cpp
swap(a[pivot], a[column]);
sign = -sign;
```

## 不要把主元行除成 1

求解方程时把主元归一化很方便；计算行列式时若把一行除以主元，就同时把行列式
除以主元，还要另外乘回去。

更直接的写法保留主元原值。对下方每一行计算：

```cpp
double factor = a[row][column] / a[column][column];
```

再执行行减法。因为“一行减去另一行的倍数”不改变行列式，最后直接取对角线
乘积即可。

## 完整代码

输入一个实数方阵，输出它的行列式。接近 0 的结果统一输出为 0，避免显示
`-0.0000000000`。

```cpp
#include <bits/stdc++.h>
using namespace std;

const double EPS = 1e-10;

int n;
vector<vector<double>> a;

double determinant() {
    int sign = 1;

    for (int column = 1; column <= n; column++) {
        int pivot = column;

        for (int row = column; row <= n; row++) {
            if (abs(a[row][column]) > abs(a[pivot][column])) {
                pivot = row;
            }
        }

        if (abs(a[pivot][column]) < EPS) {
            return 0;
        }

        if (pivot != column) {
            swap(a[pivot], a[column]);
            sign = -sign;
        }

        for (int row = column + 1; row <= n; row++) {
            double factor = a[row][column] / a[column][column];

            for (int j = column; j <= n; j++) {
                a[row][j] -= factor * a[column][j];
            }
        }
    }

    double result = sign;
    for (int i = 1; i <= n; i++) {
        result *= a[i][i];
    }

    if (abs(result) < EPS) {
        return 0;
    }
    return result;
}

void solve() {
    cin >> n;

    a.assign(n + 5, vector<double>(n + 5, 0));
    for (int row = 1; row <= n; row++) {
        for (int column = 1; column <= n; column++) {
            cin >> a[row][column];
        }
    }

    cout << fixed << setprecision(10) << determinant() << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 与高斯消元的联系

两篇文章使用同一套主元选择和行消去，但目标不同：

- 解方程需要读取每个未知数，常用 Gauss–Jordan 消去上下所有行；
- 求行列式只需得到上三角矩阵，消去主元下方即可；
- 解方程可以归一化主元，求行列式则要追踪归一化造成的倍数变化；
- 两者都能通过缺少主元发现矩阵不满秩。

行列式不应被理解成另一个毫无关系的公式；它是消元过程中“每个独立方向贡献
多少缩放”的乘积。

## 模意义下的行列式

若矩阵元素在质数模数下，不能使用浮点除法。应当使用主元的模逆元消元，所有
加减乘法都对模数取模。此时没有 `EPS`，主元是否为 0 可以精确判断。

模数不是质数时，非零元素未必存在逆元，普通除法消元不能直接使用。可以采用
不需要除法的消元、分解模数或利用题目的特殊结构；这些属于新的数论条件，不在
实数行列式模板中混合处理。

## 常见错误

- 交换两行后忘记把行列式变号；
- 把主元行除成 1，却忘记补回被除掉的主元；
- 消元后把所有矩阵元素相乘，而不是只乘主对角线；
- 主元近似为 0 时仍继续相除；
- 只看原矩阵对角线，未先通过合法行变换消成上三角；
- 浮点实现使用 `== 0` 判断奇异矩阵；
- 质数模意义下仍使用 `double` 消元；
- 复合模数下假定每个非零主元都有模逆元。

## 需要记住什么

- 行列式在几何上表示什么，为什么为 0 时矩阵不可逆？
- 三种基本行变换分别怎样改变行列式？
- 为什么上三角矩阵的行列式等于对角线乘积？
- 求行列式时为什么不需要把主元归一化？
- 行交换怎样影响最终符号？
- 实数消元与质数模意义消元的除法分别怎样处理？
