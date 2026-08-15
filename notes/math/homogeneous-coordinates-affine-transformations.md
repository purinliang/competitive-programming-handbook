# 线性变换：齐次坐标与仿射变换

> 最近修订：2026-08-16 00:00 +10:00（未审阅）

[线性变换](linear-transformations-as-matrices.md)能表示缩放、旋转和分量交换，却不能用普通二维矩阵表示平移：

$$
\begin{aligned}
x'&=x+d_x,\\
y'&=y+d_y.
\end{aligned}
$$

原因是这里出现了不依赖输入坐标的常数 $d_x,d_y$，零点也不再映射到零点。

这类“先做线性变换，再加一个固定向量”的变换称为仿射变换。齐次坐标在状态中增加一个恒为 `1` 的分量，把常数项也变成普通矩阵乘法中的系数。这样平移就能与缩放、旋转一起合成。

## 仿射变换的形式

二维仿射变换的一般形式为：

$$
\begin{aligned}
x'&=a_{11}x+a_{12}y+d_x,\\
y'&=a_{21}x+a_{22}y+d_y.
\end{aligned}
$$

前两项构成二维线性变换，$d_x,d_y$ 构成平移向量。用矩阵和向量可以简写为：

$$
p'=Ap+d.
$$

它不是普通二维线性变换，但仍然保持直线、平行关系和直线上点的比例关系。

## 增加一个恒为 1 的分量

把二维点 $(x,y)$ 改写成三维列向量：

$$
\begin{bmatrix}
x\\
y\\
1
\end{bmatrix}.
$$

最后的 `1` 不是第三个空间坐标，而是专门用来承接常数系数。

现在逐行写出新状态。第一行需要得到：

$$
x'=a_{11}x+a_{12}y+d_x\times1.
$$

第二行需要得到：

$$
y'=a_{21}x+a_{22}y+d_y\times1.
$$

第三行要让新增分量继续保持为 `1`：

$$
1=0\times x+0\times y+1\times1.
$$

于是整个仿射变换变成一个 $3\times3$ 矩阵：

$$
\begin{bmatrix}
x'\\
y'\\
1
\end{bmatrix}
=
\begin{bmatrix}
a_{11}&a_{12}&d_x\\
a_{21}&a_{22}&d_y\\
0&0&1
\end{bmatrix}
\begin{bmatrix}
x\\
y\\
1
\end{bmatrix}.
$$

常数项没有消失，只是变成了新增分量 `1` 的系数。

## 平移矩阵

只把点平移 $(d_x,d_y)$ 时：

$$
\begin{aligned}
x'&=x+d_x,\\
y'&=y+d_y.
\end{aligned}
$$

所以矩阵是：

$$
T(d_x,d_y)=
\begin{bmatrix}
1&0&d_x\\
0&1&d_y\\
0&0&1
\end{bmatrix}.
$$

左上角的 $2\times2$ 单位矩阵保持原坐标，最后一列加入平移量。

## 缩放矩阵

以原点为中心，把 `x` 方向缩放 $s_x$ 倍、`y` 方向缩放 $s_y$ 倍：

$$
S(s_x,s_y)=
\begin{bmatrix}
s_x&0&0\\
0&s_y&0\\
0&0&1
\end{bmatrix}.
$$

它原本就是线性变换；加入齐次坐标后只需在右下角补 `1`。

## 逆时针旋转九十度

二维点逆时针旋转九十度满足：

$$
x'=-y,qquad y'=x.
$$

对应齐次矩阵为：

$$
R=
\begin{bmatrix}
0&-1&0\\
1&0&0\\
0&0&1
\end{bmatrix}.
$$

本篇代码只使用这个不会引入浮点误差的固定旋转。任意角度旋转需要 `sin`、`cos` 与浮点精度处理，属于计算几何中的另一部分。

## 点与方向向量为什么使用不同的最后一项

点的位置会受平移影响，因此写成：

$$
\begin{bmatrix}
x\\
y\\
1
\end{bmatrix}.
$$

方向向量只描述方向和长度，不表示一个固定位置。它不应受平移影响，所以写成：

$$
\begin{bmatrix}
x\\
y\\
0
\end{bmatrix}.
$$

把平移矩阵乘到方向向量上时，最后一列会乘 `0`，平移量自然消失。

这也解释了两个点之差为何是方向向量：两个点的齐次分量都是 `1`，相减后最后一项是 `0`。

## 变换顺序决定矩阵顺序

本书使用列向量。若先应用变换 `A`，再应用变换 `B`：

$$
p'=Ap,
$$

$$
p''=Bp'=BAp.
$$

所以合成矩阵是 `B * A`，后执行的变换放在左侧。

例如先向右平移 `2`，再把 `x` 坐标放大 `3` 倍。点 $(1,0)$ 先变成 $(3,0)$，再变成 $(9,0)$。若颠倒顺序，则先得到 $(3,0)$，再得到 $(5,0)$，结果不同。

程序按输入顺序读到新变换 `current` 时，应写：

```cpp
combined = multiply(current, combined);
```

不能写成 `multiply(combined, current)`。

## 构造三个基础矩阵

先从单位矩阵出发，再修改真正变化的位置：

```cpp
Matrix translation(ll dx, ll dy) {
    Matrix answer = identity();
    answer.value[1][3] = dx;
    answer.value[2][3] = dy;
    return answer;
}

Matrix scaling(ll sx, ll sy) {
    Matrix answer = identity();
    answer.value[1][1] = sx;
    answer.value[2][2] = sy;
    return answer;
}

Matrix rotate_counterclockwise() {
    Matrix answer = identity();
    answer.value[1][1] = 0;
    answer.value[1][2] = -1;
    answer.value[2][1] = 1;
    answer.value[2][2] = 0;
    return answer;
}
```

这样每个函数都直接对应前面推导出的矩阵，而不是在主程序中反复填写难以辨认的下标。

## 完整代码

程序先读入一系列操作并合成，再把同一个合成变换应用到多个点。操作类型为：

- `1 dx dy`：平移 $(d_x,d_y)$；
- `2 sx sy`：分别缩放两个坐标；
- `3`：绕原点逆时针旋转九十度。

题目保证全部中间结果与答案能够放入 64 位整数。

```cpp
#include <bits/stdc++.h>

using namespace std;

typedef long long ll;

const int DIMENSION = 3;

struct Matrix {
    vector<vector<ll>> value;

    Matrix() : value(DIMENSION + 5, vector<ll>(DIMENSION + 5)) {}
};

Matrix identity() {
    Matrix answer;
    for (int i = 1; i <= DIMENSION; i++) {
        answer.value[i][i] = 1;
    }
    return answer;
}

Matrix multiply(const Matrix& a, const Matrix& b) {
    Matrix answer;
    for (int i = 1; i <= DIMENSION; i++) {
        for (int k = 1; k <= DIMENSION; k++) {
            for (int j = 1; j <= DIMENSION; j++) {
                answer.value[i][j] += a.value[i][k] * b.value[k][j];
            }
        }
    }
    return answer;
}

vector<ll> apply_transformation(const Matrix& transformation, const vector<ll>& input) {
    vector<ll> output(DIMENSION + 5);
    for (int i = 1; i <= DIMENSION; i++) {
        for (int j = 1; j <= DIMENSION; j++) {
            output[i] += transformation.value[i][j] * input[j];
        }
    }
    return output;
}

Matrix translation(ll dx, ll dy) {
    Matrix answer = identity();
    answer.value[1][3] = dx;
    answer.value[2][3] = dy;
    return answer;
}

Matrix scaling(ll sx, ll sy) {
    Matrix answer = identity();
    answer.value[1][1] = sx;
    answer.value[2][2] = sy;
    return answer;
}

Matrix rotate_counterclockwise() {
    Matrix answer = identity();
    answer.value[1][1] = 0;
    answer.value[1][2] = -1;
    answer.value[2][1] = 1;
    answer.value[2][2] = 0;
    return answer;
}

int main() {
    int operation_count, point_count;
    scanf("%d%d", &operation_count, &point_count);

    Matrix combined = identity();
    for (int i = 1; i <= operation_count; i++) {
        int type;
        scanf("%d", &type);

        Matrix current;
        if (type == 1) {
            ll dx, dy;
            scanf("%lld%lld", &dx, &dy);
            current = translation(dx, dy);
        } else if (type == 2) {
            ll sx, sy;
            scanf("%lld%lld", &sx, &sy);
            current = scaling(sx, sy);
        } else {
            current = rotate_counterclockwise();
        }
        combined = multiply(current, combined);
    }

    for (int i = 1; i <= point_count; i++) {
        ll x, y;
        scanf("%lld%lld", &x, &y);
        vector<ll> point(DIMENSION + 5);
        point[1] = x;
        point[2] = y;
        point[3] = 1;

        vector<ll> answer = apply_transformation(combined, point);
        printf("%lld %lld\n", answer[1], answer[2]);
    }
    return 0;
}
```

输入：

```text
3 2
1 2 1
3
2 2 3
1 2
0 0
```

三个操作依次是平移、旋转、缩放。输出：

```text
-6 9
-2 6
```

## 正确性

每个基础矩阵都按照对应仿射公式逐行构造，所以它能正确完成一次操作。

假设 `combined` 已经表示前若干个操作依次执行的结果。读到下一个矩阵 `current` 后，对任意点 `p`：

$$
current(combined\,p)=(current\times combined)p.
$$

因此更新 `combined = multiply(current, combined)` 后，新矩阵正好表示在原有操作之后继续执行当前操作。由归纳可知，全部操作读完后，`combined` 表示完整操作序列。

程序最后把这个矩阵应用到每个齐次点，所以输出是每个点依次执行全部操作后的坐标。

## 复杂度

本篇矩阵尺寸固定为 $3\times3$。合成一次变换和应用到一个点都只进行常数次运算，因此 `q` 个操作与 `m` 个点的总时间复杂度为 $O(q+m)$，额外空间为 $O(1)$。

若不预先合成，而是让每个点依次执行全部操作，时间复杂度会是 $O(qm)$。当同一串变换需要作用于大量点时，先合成的优势最明显。

## 常见错误

### 仍使用二维向量表示点

二维矩阵没有位置保存独立常数项。必须增加恒为 `1` 的齐次分量，才能把平移写成矩阵乘法。

### 把点的最后一项写成 0

最后一项为 `0` 表示方向向量，平移不会生效。位置点必须写成 `[x, y, 1]^T`。

### 合成顺序颠倒

使用列向量时，先执行 `A` 再执行 `B`，合成矩阵是 `B * A`。应从实际代入式推导，不凭阅读顺序猜测。

### 忘记保持最后一行

二维仿射矩阵最后一行应为 `[0, 0, 1]`。若它被破坏，应用后最后一项不再稳定为 `1`。

### 把任意角度旋转塞进整数模板

任意角度需要浮点三角函数和误差判断。本篇整数代码只实现精确的九十度旋转，不能直接替代一般计算几何模板。

## 基础练习

1. 写出把点向左平移 `4`、向上平移 `7` 的齐次矩阵。
2. 分别计算“先平移后缩放”和“先缩放后平移”的合成矩阵。
3. 证明方向向量 `[x, y, 0]^T` 乘平移矩阵后保持不变。
4. 写出绕原点顺时针旋转九十度的齐次矩阵。
5. 设计“关于 `y` 轴对称”的齐次矩阵，并加入完整程序。
6. 给定中心 $(c_x,c_y)$，用三次基础变换表示“绕该中心逆时针旋转九十度”。

## 需要记住什么

1. 仿射变换与普通线性变换相比多了什么？
2. 齐次坐标末尾的 `1` 怎样把常数项变成矩阵系数？
3. 为什么点使用最后一项 `1`，方向向量使用 `0`？
4. 使用列向量时，按顺序执行 `A`、`B` 后为什么得到 `B * A`？
5. 为什么先合成操作能把批量处理的时间从 $O(qm)$ 降到 $O(q+m)$？
