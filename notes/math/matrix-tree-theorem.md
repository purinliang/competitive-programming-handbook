# 矩阵树定理

> 最近修订：2026-08-23 06:13 +10:00（未审阅）

最小生成树要求找出权值最小的一棵生成树；另一些问题不关心最小权值，而是询问一张
无向图一共有多少棵不同的生成树。

直接枚举 $n-1$ 条边需要检查指数级边集。矩阵树定理把图的度数和邻接关系写进一个
矩阵，再用一个 $(n-1)\times(n-1)$ 行列式精确统计全部生成树。

本文处理无向图的生成树数量，并对质数 $10^9+7$ 取模。

## 图的拉普拉斯矩阵

设无向图的邻接矩阵为 $A$，度数矩阵为 $D$：

- $A_{u,v}$ 是点 $u$ 与点 $v$ 之间的边数；
- $D_{u,u}=degree(u)$，其他位置为 $0$。

图的拉普拉斯矩阵定义为：

$$
L=D-A.
$$

因此对一条无向边 $(u,v)$，只需执行：

```cpp
laplacian[u][u] += 1;
laplacian[v][v] += 1;
laplacian[u][v] -= 1;
laplacian[v][u] -= 1;
```

平行边会重复贡献，因此矩阵树定理自然把选择不同平行边视为不同生成树。

拉普拉斯矩阵每行元素之和都为 $0$：对角线度数恰好抵消这一行所有邻接边。因此它
一定奇异，完整 $n\times n$ 行列式总是 $0$，不能直接拿来统计答案。

## 删除一行一列

从 $L$ 中任选一个编号 `root`，删除第 `root` 行和第 `root` 列，得到余子式矩阵
$L_{root}$。

矩阵树定理说明：

$$
\tau(G)=\det(L_{root}),
$$

其中 $\tau(G)$ 是无向图的生成树数量。

删除哪个点都得到相同答案。实现中通常删除最后一行、最后一列，只需把前
`n - 1` 行列复制进消元矩阵。

若图不连通，不存在覆盖全部点的生成树，对应余子式不满秩，行列式自然为 $0$；无需
另外先跑一次连通性判断。

## 为什么行列式会枚举生成树

给每条无向边任意指定一个方向，建立点边关联矩阵 $B$：一条定向边 `u -> v` 对应的
列在 `u` 行写 $1$、在 `v` 行写 $-1$，其他位置写 $0$。

可以验证：

$$
L=BB^{\mathsf T}.
$$

删除同一个点对应的行后，利用 Cauchy–Binet 公式展开余子式行列式，相当于枚举
$n-1$ 条边组成的列集合。

- 若这些边不构成生成树，关联矩阵列线性相关，对应行列式为 $0$；
- 若这些边构成生成树，对应行列式为 $1$ 或 $-1$，平方后贡献 $1$。

因此每棵生成树恰好贡献一次，其他边集贡献 $0$。这就是“一个行列式等于生成树数量”
背后的计数原因。

## 模质数计算行列式

生成树数量可能非常大，代码在模质数 `MOD` 下计算行列式。

逐列寻找非零主元。若找不到，矩阵不满秩，答案为 $0$。交换两行会让行列式变号；
随后用主元的模逆元消去下方元素：

```cpp
ll factor = matrix[row][column] * mod_inverse(matrix[column][column]) % MOD;
```

与实数行列式不同，这里没有浮点误差和 `EPS`；但 `MOD` 必须是质数，才能保证每个
非零主元都有逆元。

## 正确性直觉

拉普拉斯余子式通过矩阵树定理把每棵生成树计数一次。模 `MOD` 的高斯消元只执行可逆
行变换：行减法不改变行列式，交换行改变符号，主元乘积给出上三角矩阵行列式。

因此消元结果等于拉普拉斯余子式的整数行列式模 `MOD`，也就是生成树数量模 `MOD`。

## 完整代码

输入无向图的点数和边数。图允许重边；自环不会出现在生成树中，代码直接忽略。输出
生成树数量模 $10^9+7$。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const ll MOD = 1e9 + 7;

int n;
int m;
vector<vector<ll>> laplacian;

ll mod_pow(ll base, ll exponent) {
    ll result = 1;
    base %= MOD;

    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = result * base % MOD;
        }
        base = base * base % MOD;
        exponent /= 2;
    }
    return result;
}

ll determinant(vector<vector<ll>> matrix, int size) {
    ll answer = 1;

    for (int column = 1; column <= size; ++column) {
        int pivot = column;
        while (pivot <= size && matrix[pivot][column] == 0) {
            ++pivot;
        }

        if (pivot > size) {
            return 0;
        }

        if (pivot != column) {
            swap(matrix[pivot], matrix[column]);
            answer = (MOD - answer) % MOD;
        }

        ll pivot_value = matrix[column][column];
        answer = answer * pivot_value % MOD;
        ll inverse = mod_pow(pivot_value, MOD - 2);

        for (int row = column + 1; row <= size; ++row) {
            ll factor = matrix[row][column] * inverse % MOD;
            for (int j = column; j <= size; ++j) {
                matrix[row][j] =
                    (matrix[row][j] - factor * matrix[column][j]) % MOD;
                if (matrix[row][j] < 0) {
                    matrix[row][j] += MOD;
                }
            }
        }
    }

    return answer;
}

int main() {
    scanf("%d%d", &n, &m);

    laplacian.assign(n + 5, vector<ll>(n + 5, 0));
    for (int i = 1; i <= m; ++i) {
        int u, v;
        scanf("%d%d", &u, &v);
        if (u == v) {
            continue;
        }

        laplacian[u][u] = (laplacian[u][u] + 1) % MOD;
        laplacian[v][v] = (laplacian[v][v] + 1) % MOD;
        laplacian[u][v] = (laplacian[u][v] - 1 + MOD) % MOD;
        laplacian[v][u] = (laplacian[v][u] - 1 + MOD) % MOD;
    }

    int size = n - 1;
    vector<vector<ll>> minor(size + 5, vector<ll>(size + 5, 0));
    for (int row = 1; row <= size; ++row) {
        for (int column = 1; column <= size; ++column) {
            minor[row][column] = laplacian[row][column];
        }
    }

    printf("%lld\n", determinant(minor, size));
    return 0;
}
```

## 复杂度

构造拉普拉斯矩阵需要 $O(n^2+m)$ 空间初始化与边更新。对大小为 $n-1$ 的余子式做
高斯消元，时间复杂度为 $O(n^3)$，空间复杂度为 $O(n^2)$。

这适合点数中等、边数和生成树数量可能很大的图；点数非常大时，立方复杂度通常成为
瓶颈。

## 与仙人掌计数的关系

《[仙人掌](../graph-theory/cactus-graph.md)》中不同简单环没有公共边，每个长度为
`length` 的环只需选择删除哪一条边，因此答案是环长乘积。那是特殊结构带来的线性
算法。

矩阵树定理适用于任意无向图，不要求环彼此分离，代价是 $O(n^3)$ 消元。遇到特殊图时
应优先利用结构；没有结构时，矩阵树定理提供统一方法。

## 带权与有向版本

若给每条无向边赋乘法权值，把拉普拉斯矩阵中的“边数贡献”换成“边权贡献”，余子式
行列式会得到所有生成树边权乘积之和。

有向图也有统计以指定点为根的内向或外向生成树版本，但拉普拉斯矩阵的入度、出度和
删除方向必须与目标定义匹配。方向约定不同会统计相反的树，不应在无向基础代码上只
删除一个负号。

## 常见错误

- 直接计算完整拉普拉斯矩阵行列式；它的每行和为 $0$，结果必然为 $0$；
- 删除一行却没有删除同编号的一列；
- 对角线写成邻接边权的相反数，非对角线却写成正数；
- 行交换后忘记改变行列式符号；
- 在模质数消元中使用浮点除法；
- 模数是合数时仍用费马小定理求主元逆元；
- 把自环计入度数，却期待它参与生成树；
- 图具有仙人掌等简单结构时仍无条件使用立方算法。

## 需要记住什么

- 无向图拉普拉斯矩阵的对角线和非对角线分别怎样定义？
- 为什么完整拉普拉斯矩阵行列式总是 $0$？
- 矩阵树定理需要删除哪一行、哪一列？
- 为什么余子式行列式会让每棵生成树贡献 $1$？
- 图不连通时答案怎样自然变成 $0$？
- 模质数行列式怎样完成主元除法？
- 仙人掌计数与一般矩阵树定理应怎样取舍？
