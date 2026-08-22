# 线性规划与单纯形法

> 最近修订：2026-08-23 07:08 +10:00（未审阅）

一家工厂生产两种产品：第一种每件收益 `3`，第二种每件收益 `2`。若生产数量分别为
`x` 和 `y`，两种资源给出限制：

$$
x+y\le4,
$$

$$
2x+y\le5,
$$

并且：

$$
x\ge0,\qquad y\ge0.
$$

目标是最大化：

$$
3x+2y.
$$

变量、限制和目标都是一次式，这就是一个线性规划问题。允许 `x,y` 取实数时，最优解为：

$$
x=1,\qquad y=3,
$$

最大收益为 `9`。

线性规划能统一描述资源分配、混合配比和分数型流量等问题。单纯形法沿着可行域的顶点
移动，每一步换入一个能改善目标的变量，直到达到最优点、发现无界，或确认根本不存在
可行解。

> 线性规划允许变量取实数。若题目要求变量必须为整数，它就变成整数规划，不能把单纯
> 形法得到的小数解直接当成答案。

## 标准形式

本文模板求解：

$$
\max c^Tx,
$$

满足：

$$
Ax\le b,
$$

$$
x\ge0.
$$

其中有 `n` 个变量和 `m` 条约束。输入分别是：

- `A[i][j]`：第 `i` 条约束中变量 `x[j]` 的系数；
- `b[i]`：第 `i` 条约束的右端值；
- `c[j]`：目标函数中变量 `x[j]` 的收益系数。

其他常见限制可以转换到标准形式：

- `a^Tx >= b`：两边乘 `-1`，变成 `(-a)^Tx <= -b`；
- `a^Tx = b`：拆成 `a^Tx <= b` 和 `(-a)^Tx <= -b`；
- 自由变量 `z`：写成 `z=z_positive-z_negative`，两个新变量都非负；
- 最小化 `c^Tx`：改为最大化 `-c^Tx`，最后把答案取反。

转换会增加变量或约束。代码只负责转换后的标准形式，调用者必须清楚原问题是否允许
实数解。

## 为什么只需要考虑顶点

线性不等式的交集是凸集：任取两个可行解，它们连线上的点仍然可行。目标函数沿任意
线段都线性变化，不会在一条线段的严格内部突然出现高于两端的新峰值。

因此，若可行域非空、目标有有限最大值，至少存在一个顶点达到最大值。二维例子中，
可行域的候选顶点是：

```text
(0, 0), (0, 4), (1, 3), (2.5, 0)
```

分别代入目标即可看到 `(1,3)` 最优。高维中不能枚举所有顶点，但可以从一个顶点沿边
移动到相邻顶点，这正是单纯形法的基本思路。

## 用松弛变量得到初始基

若右端 `b[i]` 都非负，可以为每条不等式加入一个松弛变量。例子变成：

$$
x+y+s_1=4,
$$

$$
2x+y+s_2=5,
$$

$$
s_1,s_2\ge0.
$$

令 `x=y=0`，就得到：

$$
s_1=4,\qquad s_2=5.
$$

此时 `s_1,s_2` 是基变量，`x,y` 是非基变量。把所有非基变量设为 `0`，每条等式都能
直接给出一个基变量的值，因此得到一个可行顶点。

代码用：

- `basis[row]` 记录每一行当前对应的基变量；
- `nonbasis[column]` 记录每一列当前对应的非基变量；
- `tableau` 保存约束、目标行和右端常数。

## 选择进入基的变量

当前非基变量都取 `0`。若目标行中某一列的检验数表明增加该变量能让目标变大，就选它
作为进入变量。

本文代码的表记把目标系数以相反数存入目标行，因此选择一个小于 `-EPS` 的列。若所有
可选列都不小于 `-EPS`，已经没有局部改进方向；在线性规划的凸可行域中，这同时意味着
当前解是全局最优解。

有多个候选列时，代码先比较检验数；近似相等时选择变量编号较小者。这种稳定的破同分
规则接近 Bland 规则，可以降低退化问题中循环的风险。

## 比值检验选择离开基的变量

让进入变量从 `0` 开始增加，会逐渐消耗各行的剩余量。若第 `i` 行中进入变量系数为
正数，那么它最多增加：

$$
\frac{b_i}{a_i}.
$$

取所有正系数行中的最小比值，最先耗尽的那一行对应的基变量离开基。这称为比值检验。

若进入列在所有约束行中的系数都不大于 `EPS`，增加这个变量永远不会撞到边界，而目标
还能持续增大，所以问题无界。

## 主元变换就是一次换基

进入列与离开行的交点称为主元。一次主元变换做三件事：

1. 把主元所在行解成“进入变量等于其他变量的线性组合”；
2. 代入其余约束和目标行，消去进入变量；
3. 交换这行与这列记录的基变量、非基变量编号。

这与高斯消元的行变换很接近，但目的不同：高斯消元试图把整个线性方程组化简；单纯形
主元变换是在相邻可行基之间移动，并持续改善目标。

反复执行“选进入列、做比值检验、主元变换”，就是单纯形法的第二阶段。

## 为什么还需要第一阶段

如果某条约束右端是负数，令原变量为 `0` 时，对应松弛变量也为负，初始基不可行。例如：

$$
-x\le-1
$$

实际表示 `x >= 1`，显然不能从 `x=0` 开始。

两阶段单纯形法临时加入一个人工变量，并建立辅助目标：先寻找任意可行解。若辅助问题
的最优值仍不能回到 `0`，说明原约束互相矛盾，问题无可行解。

找到可行基以后：

1. 若人工变量仍在基中，用任意非零普通列把它换出；
2. 忽略人工变量列；
3. 恢复原目标函数，开始第二阶段求最优值。

因此完整求解有三种结果：

- `OPTIMAL`：存在有限最优值；
- `INFEASIBLE`：没有满足全部约束的点；
- `UNBOUNDED`：存在可行点，但目标可以无限增大。

## 完整代码

输入标准形式中的 `m,n,A,b,c`，保证 `m,n >= 1`。所有矩阵和向量都按照本文数学下标
从 `1` 开始；额外行列由 `Simplex` 内部管理。

输出：

- `Optimal`、最优目标值和一组最优变量；
- `Infeasible`；
- `Unbounded`。

```cpp
#include <bits/stdc++.h>
using namespace std;

const double EPS = 1e-9;
const double INF = 1e100;

const int OPTIMAL = 0;
const int INFEASIBLE = 1;
const int UNBOUNDED = 2;

struct LinearProgramResult {
    int status;
    double value;
    vector<double> solution;
};

struct Simplex {
    int constraints;
    int variables;
    int objective_row;
    int auxiliary_row;
    int artificial_column;
    int right_column;
    vector<int> basis;
    vector<int> nonbasis;
    vector<vector<double>> tableau;

    Simplex(const vector<vector<double>>& a, const vector<double>& b,
            const vector<double>& c) {
        constraints = (int)b.size() - 1;
        variables = (int)c.size() - 1;
        objective_row = constraints + 1;
        auxiliary_row = constraints + 2;
        artificial_column = variables + 1;
        right_column = variables + 2;

        basis.assign(constraints + 1, 0);
        nonbasis.assign(variables + 2, 0);
        tableau.assign(constraints + 3, vector<double>(variables + 3, 0));

        for (int i = 1; i <= constraints; ++i) {
            for (int j = 1; j <= variables; ++j) {
                tableau[i][j] = a[i][j];
            }
            basis[i] = variables + i;
            tableau[i][artificial_column] = -1;
            tableau[i][right_column] = b[i];
        }

        for (int j = 1; j <= variables; ++j) {
            nonbasis[j] = j;
            tableau[objective_row][j] = -c[j];
        }
        nonbasis[artificial_column] = 0;
        tableau[auxiliary_row][artificial_column] = 1;
    }

    void pivot(int row, int column) {
        double inverse = 1.0 / tableau[row][column];

        for (int i = 1; i <= auxiliary_row; ++i) {
            if (i == row) {
                continue;
            }
            for (int j = 1; j <= right_column; ++j) {
                if (j == column) {
                    continue;
                }
                tableau[i][j] -= tableau[row][j] * tableau[i][column] * inverse;
            }
        }

        for (int j = 1; j <= right_column; ++j) {
            if (j != column) {
                tableau[row][j] *= inverse;
            }
        }
        for (int i = 1; i <= auxiliary_row; ++i) {
            if (i != row) {
                tableau[i][column] *= -inverse;
            }
        }
        tableau[row][column] = inverse;
        swap(basis[row], nonbasis[column]);
    }

    bool run_simplex(int phase) {
        int target_row = phase == 1 ? auxiliary_row : objective_row;

        while (true) {
            int column = 0;
            for (int j = 1; j <= artificial_column; ++j) {
                if (phase == 2 && nonbasis[j] == 0) {
                    continue;
                }
                if (column == 0 ||
                    tableau[target_row][j] <
                        tableau[target_row][column] - EPS ||
                    (abs(tableau[target_row][j] -
                         tableau[target_row][column]) <= EPS &&
                     nonbasis[j] < nonbasis[column])) {
                    column = j;
                }
            }

            if (tableau[target_row][column] >= -EPS) {
                return true;
            }

            int row = 0;
            for (int i = 1; i <= constraints; ++i) {
                if (tableau[i][column] <= EPS) {
                    continue;
                }
                if (row == 0) {
                    row = i;
                    continue;
                }

                double ratio = tableau[i][right_column] / tableau[i][column];
                double best_ratio =
                    tableau[row][right_column] / tableau[row][column];
                if (ratio < best_ratio - EPS ||
                    (abs(ratio - best_ratio) <= EPS && basis[i] < basis[row])) {
                    row = i;
                }
            }

            if (row == 0) {
                return false;
            }
            pivot(row, column);
        }
    }

    LinearProgramResult solve() {
        int row = 1;
        for (int i = 2; i <= constraints; ++i) {
            if (tableau[i][right_column] < tableau[row][right_column]) {
                row = i;
            }
        }

        if (tableau[row][right_column] < -EPS) {
            pivot(row, artificial_column);
            if (!run_simplex(1) ||
                tableau[auxiliary_row][right_column] < -EPS ||
                abs(tableau[auxiliary_row][right_column]) > EPS) {
                return {INFEASIBLE, 0, {}};
            }

            for (int i = 1; i <= constraints; ++i) {
                if (basis[i] != 0) {
                    continue;
                }

                int column = 0;
                for (int j = 1; j <= artificial_column; ++j) {
                    if (column == 0 ||
                        abs(tableau[i][j]) > abs(tableau[i][column]) + EPS ||
                        (abs(abs(tableau[i][j]) - abs(tableau[i][column])) <=
                             EPS &&
                         nonbasis[j] < nonbasis[column])) {
                        column = j;
                    }
                }
                if (abs(tableau[i][column]) > EPS) {
                    pivot(i, column);
                }
            }
        }

        if (!run_simplex(2)) {
            return {UNBOUNDED, INF, {}};
        }

        vector<double> solution(variables + 1, 0);
        for (int i = 1; i <= constraints; ++i) {
            if (basis[i] >= 1 && basis[i] <= variables) {
                solution[basis[i]] = tableau[i][right_column];
            }
        }

        return {OPTIMAL, tableau[objective_row][right_column], solution};
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int m, n;
    cin >> m >> n;

    vector<vector<double>> a(m + 1, vector<double>(n + 1));
    vector<double> b(m + 1);
    vector<double> c(n + 1);

    for (int i = 1; i <= m; ++i) {
        for (int j = 1; j <= n; ++j) {
            cin >> a[i][j];
        }
        cin >> b[i];
    }
    for (int j = 1; j <= n; ++j) {
        cin >> c[j];
    }

    Simplex simplex(a, b, c);
    LinearProgramResult result = simplex.solve();

    if (result.status == INFEASIBLE) {
        cout << "Infeasible\n";
    } else if (result.status == UNBOUNDED) {
        cout << "Unbounded\n";
    } else {
        cout << "Optimal\n";
        cout << fixed << setprecision(10) << result.value << '\n';
        for (int j = 1; j <= n; ++j) {
            if (j > 1) {
                cout << ' ';
            }
            cout << fixed << setprecision(10) << result.solution[j];
        }
        cout << '\n';
    }

    return 0;
}
```

## 复杂度与数值稳定性

一次主元变换需要更新整个表，复杂度为 `O(mn)`。主元次数与输入结构有关；单纯形法在
理论最坏情况下可能指数级，但在许多实际线性规划中表现很好。它不是具有简单多项式
最坏界的竞赛万能模板。

代码使用 `double` 和 `EPS`：

- 只把绝对值明显大于 `EPS` 的数当作非零；
- 比值近似相同时按变量编号破同分；
- 输出值接近 `0` 时可能出现很小的正负误差；
- 系数量级差异过大时，应先缩放数据，或改用更可靠的线性规划库。

若题目需要精确分数、严格判定退化边界，浮点单纯形模板可能不够。

## 常见错误

- 忘记本文是实数线性规划，把小数解用于必须取整数的变量；
- 没把 `>=`、等式和自由变量转换成模板要求的标准形式；
- 认为加入松弛变量后一定得到可行初始基，忽略负右端项；
- 进入变量能改善目标，却没有任何约束能限制它时，仍继续做比值检验；
- 比值检验使用了系数不为正的行；
- 主元变换只更新约束，忘记同步更新目标行；
- 把无可行解和目标无界当成同一种失败；
- 用 `value == 0` 比较浮点数；
- 在退化问题中没有稳定破同分规则，导致反复换回同一组基；
- 不检查变量的非负约束是否符合原问题。

## 需要记住什么

- 线性规划的标准形式包含哪些约束？
- 为什么有有限最优值时可以在可行域顶点找到它？
- 松弛变量怎样把不等式变成等式并提供初始基？
- 进入变量和离开变量分别怎样选择？
- 某个改善目标的进入列没有正系数时，为什么意味着无界？
- 第一阶段解决什么问题，怎样判断无可行解？
- 为什么实数线性规划不能直接替代整数规划？
- 浮点单纯形模板有哪些数值风险？
