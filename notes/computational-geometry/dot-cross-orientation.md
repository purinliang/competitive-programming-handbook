# 点积、叉积与方向判断

> 最近修订：2026-08-17 04:50 +10:00（未审阅）

[坐标、点、向量与精度](points-vectors-precision.md)把两个点之差解释为向量。
接下来需要从向量坐标中读出几何关系：

- 两个方向是同向、垂直还是反向；
- 从向量 $a$ 转向向量 $b$ 是逆时针还是顺时针；
- 三个点是左转、右转还是共线；
- 三角形面积是多少。

这些问题分别由点积和叉积统一解决。

## 点积

二维向量 $a=(a_x,a_y)$ 与 $b=(b_x,b_y)$ 的点积是：

$$
a\cdot b=a_xb_x+a_yb_y.
$$

它也满足：

$$
a\cdot b=|a||b|\cos\theta,
$$

其中 $\theta$ 是两个向量夹角。因此点积的符号可以判断夹角：

- $a\cdot b>0$：夹角小于 $90^\circ$；
- $a\cdot b=0$：至少一个向量为零，或两个非零向量垂直；
- $a\cdot b<0$：夹角大于 $90^\circ$。

代码：

```cpp
ll dot(Point a, Point b) {
    return a.x * b.x + a.y * b.y;
}
```

点积还能计算向量长度平方：

$$
|a|^2=a\cdot a.
$$

只比较距离时，`dot(v,v)` 可以避免开方。

## 二维叉积

二维向量的叉积在竞赛中通常直接记为一个有符号数：

$$
a\times b=a_xb_y-a_yb_x.
$$

它的绝对值等于以 $a,b$ 为邻边的平行四边形面积；符号描述从 $a$ 转向 $b$
的方向：

- $a\times b>0$：逆时针；
- $a\times b<0$：顺时针；
- $a\times b=0$：两个向量共线。

代码：

```cpp
ll cross(Point a, Point b) {
    return a.x * b.y - a.y * b.x;
}
```

这个符号约定建立在 $x$ 轴向右、$y$ 轴向上的坐标系中。

## 为什么叉积能判断方向

固定 $a$，把 $b$ 分解到 $a$ 的左侧或右侧。式子

$$
a_xb_y-a_yb_x
$$

正好是矩阵

$$
\begin{vmatrix}
a_x & a_y\\
b_x & b_y
\end{vmatrix}
$$

的行列式。交换两个向量会改变符号：

$$
a\times b=-(b\times a).
$$

因此“从 $a$ 转到 $b$”与“从 $b$ 转到 $a$”方向相反。把其中一个向量扩大
正数倍只会按比例扩大结果，不会改变转向；这正符合方向判断的几何含义。

## 三点方向

判断点 $A,B,C$ 的行进方向时，使用两条从同一起点 $A$ 发出的向量：

$$
\overrightarrow{AB}=B-A,\qquad
\overrightarrow{AC}=C-A.
$$

定义：

$$
orientation(A,B,C)
=(B-A)\times(C-A).
$$

- 结果为正：从 $A$ 到 $B$ 再朝 $C$ 是左转；
- 结果为负：是右转；
- 结果为零：三个点共线。

```cpp
ll orientation(Point a, Point b, Point c) {
    return cross(b - a, c - a);
}
```

向量必须拥有同一起点。直接写 `cross(b, c)` 判断的是从原点指向两个点的
向量关系，通常不是题目要问的 $A,B,C$ 方向。

## 三角形面积

以 $\overrightarrow{AB}$ 和 $\overrightarrow{AC}$ 为邻边的平行四边形
面积是叉积绝对值。三角形面积是它的一半：

$$
S_{\triangle ABC}
=\frac{|(B-A)\times(C-A)|}{2}.
$$

竞赛中常保存**两倍面积**：

```cpp
ll twice_area = abs(orientation(a, b, c));
```

这样整数坐标会得到精确整数，不必过早引入 `0.5` 和浮点误差。最终输出时，
两倍面积为奇数就带 `.5`。

## 整数范围

叉积包含坐标差的乘法和两个乘积的减法。即使坐标能存进 `int`，中间结果也很
容易溢出，因此通常使用 64 位整数。

本篇完整代码假设坐标绝对值不超过 $10^8$，所以坐标差、乘积和叉积都在 64 位
整数范围内。若题目坐标范围更大，必须重新估算最坏中间值；必要时才使用更宽
类型，不能只看最终答案范围。

浮点坐标版本则用 `double` 计算点积和叉积，并用前文的 `sign` 按 `EPS`
判断符号，不能直接与 `0` 比较。

## 完整代码

下面读入若干组三点，输出左转、右转或共线，并输出三角形的两倍面积。输入坐标
均为整数且绝对值不超过 $10^8$。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct Point {
    ll x;
    ll y;
};

Point operator-(Point a, Point b) {
    return {a.x - b.x, a.y - b.y};
}

ll dot(Point a, Point b) {
    return a.x * b.x + a.y * b.y;
}

ll cross(Point a, Point b) {
    return a.x * b.y - a.y * b.x;
}

ll orientation(Point a, Point b, Point c) {
    return cross(b - a, c - a);
}

void solve() {
    int q;
    cin >> q;

    while (q--) {
        Point a, b, c;
        cin >> a.x >> a.y;
        cin >> b.x >> b.y;
        cin >> c.x >> c.y;

        ll direction = orientation(a, b, c);

        if (direction > 0) {
            cout << "Left\n";
        } else if (direction < 0) {
            cout << "Right\n";
        } else {
            cout << "Collinear\n";
        }

        cout << abs(direction) << '\n';
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

完整代码保留了 `dot`，虽然当前输出只使用 `cross`。这是因为二者共同构成
后续直线、线段、投影和夹角算法的基础向量接口。

## 常见错误

- 把点积与叉积公式混淆；
- 判断 $A,B,C$ 方向时忘记先构造 `B-A` 和 `C-A`；
- 交换叉积参数后仍沿用原来的方向结论；
- 在屏幕坐标系中照搬 $y$ 轴向上的符号约定；
- 使用 32 位整数保存坐标乘积；
- 只根据最终答案估算类型，忽略中间乘法；
- 浮点叉积直接与 `0` 比较；
- 三角形面积忘记除以 `2`，或过早除以 `2` 丢失半整数。

## 需要记住什么

- 点积的符号怎样反映两个非零向量的夹角？
- 叉积的符号怎样反映顺时针与逆时针？
- 为什么三点方向要计算
  `cross(B-A, C-A)`？
- 叉积绝对值与平行四边形、三角形面积有什么关系？
- 为什么几何题必须单独估算中间乘积范围？

