# 坐标、点、向量与精度

> 最近修订：2026-08-17 04:39 +10:00（未审阅）

平面几何题会把图形变成坐标，再把“移动、距离、方向、相交”等关系翻译成数值
运算。第一步不是背几何公式，而是建立一套不会混淆的表示方式：

- 点表示一个位置；
- 向量表示一次位移；
- 二者都可以用一对坐标存储，但语义不同；
- 整数运算尽量保持精确，浮点数比较必须考虑误差。

## 平面直角坐标系

本书默认使用通常的平面直角坐标系：

- $x$ 轴正方向向右；
- $y$ 轴正方向向上；
- 点 $P=(x,y)$ 由横坐标和纵坐标确定。

某些屏幕坐标系的 $y$ 轴向下，会使“顺时针”和“逆时针”的符号与本书相反。
题目若采用特殊坐标系，必须先转换或重新判断符号。

## 点

点只说明“在哪里”。两个坐标相同的点表示同一个位置：

```cpp
struct Point {
    double x;
    double y;
};
```

例如 $A=(2,3)$、$B=(5,7)$。点本身通常不进行“两个位置相加”的几何解释，
但点与位移相加有明确意义。

## 向量

从点 $A$ 指向点 $B$ 的向量记作：

$$
\overrightarrow{AB}=B-A=(B_x-A_x,B_y-A_y).
$$

向量只关心移动了多少，不关心从哪里开始。`(3,4)` 可以表示“向右移动
`3`，向上移动 `4`”。

点和向量都由两个数表示，因此竞赛代码通常复用同一个 `Point` 结构：

```cpp
Point operator-(Point a, Point b) {
    return {a.x - b.x, a.y - b.y};
}
```

变量的使用位置决定它表示点还是向量。例如：

```cpp
Point a = {2, 3};
Point b = {5, 7};
Point movement = b - a;
```

这里 `a`、`b` 是点，`movement` 是向量。

## 向量与点的基本运算

向量相加表示连续完成两次位移：

$$
(x_1,y_1)+(x_2,y_2)=(x_1+x_2,y_1+y_2).
$$

向量乘以实数 $k$ 表示按比例伸缩：

$$
k(x,y)=(kx,ky).
$$

点加向量得到移动后的新点。若 $P$ 沿向量 $v$ 移动 $k$ 倍：

$$
P'=P+kv.
$$

对应运算符：

```cpp
Point operator+(Point a, Point b) {
    return {a.x + b.x, a.y + b.y};
}

Point operator*(Point a, double k) {
    return {a.x * k, a.y * k};
}
```

虽然类型系统没有区分点与向量，但推导时仍应先说明每个量的含义，不能因为坐标
形式相同就随意组合。

## 两点距离

向量 $v=(x,y)$ 的长度是：

$$
|v|=\sqrt{x^2+y^2}.
$$

因此点 $A$ 与点 $B$ 的距离是向量 $B-A$ 的长度：

$$
distance(A,B)
=\sqrt{(B_x-A_x)^2+(B_y-A_y)^2}.
$$

C++ 的 `hypot(x,y)` 直接计算 $\sqrt{x^2+y^2}$：

```cpp
double length(Point v) {
    return hypot(v.x, v.y);
}

double distance(Point a, Point b) {
    return length(b - a);
}
```

若只比较两段距离大小，可以比较距离平方，避免不必要的开方并保持整数精度：

$$
|v|^2=x^2+y^2.
$$

## 整数几何与浮点几何

若输入坐标都是整数，并且只使用加、减、乘，最好始终使用整数：

```cpp
struct Point {
    ll x;
    ll y;
};
```

几何公式中的乘积很容易超过 32 位整数，应根据坐标范围使用 64 位整数。使用
`sqrt`、除法、交点坐标或三角函数后，结果通常才需要 `double`。

不要为了“统一”而一开始就把全部整数坐标转换成浮点数。能够精确判断共线、
方向和面积时，整数比带误差的浮点数更可靠。

## 浮点误差

许多十进制小数不能被二进制浮点数精确表示。经过多次运算后，理论上的 `0`
可能得到非常小的正数或负数。因此不要直接写：

```cpp
if (x == 0) {
    // ...
}
```

引入允许误差：

```cpp
const double EPS = 1e-9;

int sign(double x) {
    if (x > EPS) {
        return 1;
    }
    if (x < -EPS) {
        return -1;
    }
    return 0;
}
```

`sign(x)` 把数值分成：

- 明显为正；
- 在误差范围内视为零；
- 明显为负。

两个浮点数近似相等，可以比较：

```cpp
bool equal(double a, double b) {
    return abs(a - b) <= EPS;
}
```

`EPS = 1e-9` 不是适合所有题目的魔法常量。坐标范围极大、运算次数很多或题目
要求特别严格时，需要根据误差规模选择 `EPS`，必要时使用 `long double`。

## 输出精度

浮点答案通常使用定点格式输出足够多的小数位：

```cpp
cout << fixed << setprecision(10) << answer << '\n';
```

输出十位小数不代表计算只有十位精度；它只是规定最后如何显示。计算过程中仍应
保留 `double` 能提供的精度，不要过早四舍五入。

## 完整代码

下面读入两个点，输出从第一个点到第二个点的向量、中点和距离。若两点在误差
范围内重合，额外输出 `Same point`。

```cpp
#include <bits/stdc++.h>
using namespace std;

const double EPS = 1e-9;

struct Point {
    double x;
    double y;
};

Point operator+(Point a, Point b) {
    return {a.x + b.x, a.y + b.y};
}

Point operator-(Point a, Point b) {
    return {a.x - b.x, a.y - b.y};
}

Point operator*(Point a, double k) {
    return {a.x * k, a.y * k};
}

double length(Point v) {
    return hypot(v.x, v.y);
}

double distance(Point a, Point b) {
    return length(b - a);
}

bool equal(double a, double b) {
    return abs(a - b) <= EPS;
}

void solve() {
    Point a, b;
    cin >> a.x >> a.y >> b.x >> b.y;

    Point movement = b - a;
    Point midpoint = (a + b) * 0.5;

    cout << fixed << setprecision(10);
    cout << movement.x << ' ' << movement.y << '\n';
    cout << midpoint.x << ' ' << midpoint.y << '\n';
    cout << distance(a, b) << '\n';

    if (equal(a.x, b.x) && equal(a.y, b.y)) {
        cout << "Same point\n";
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 常见错误

- 把点和向量当作完全相同的几何对象，写出没有含义的运算；
- 求 $\overrightarrow{AB}$ 时写成 `A-B`，把方向反过来；
- 整数坐标的乘积仍使用 32 位整数；
- 能用整数精确判断时过早转换为浮点数；
- 直接用 `==` 比较浮点运算结果；
- 认为固定的 `EPS` 能无条件适用于所有数值范围；
- 只修改输出位数，却误以为提高了计算精度。

## 需要记住什么

- 点与向量的语义有什么区别，代码为什么仍常复用同一结构？
- 为什么 $\overrightarrow{AB}=B-A$？
- 什么情况下应该保持整数运算？
- 为什么浮点数不能总用 `==` 比较？
- `EPS` 和 `setprecision` 分别解决什么问题？

