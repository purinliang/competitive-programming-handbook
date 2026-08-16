# 直线、线段与相交判定

> 最近修订：2026-08-17 07:26 +10:00（未审阅）

[点积、叉积与方向判断](dot-cross-orientation.md)已经能判断三个点左转、右转或
共线。线段相交的本质是：每条线段的两个端点是否分处另一条直线两侧，以及共线
时投影区间是否重叠。

几何题中“直线”和“线段”不能混用：

- 直线向两个方向无限延伸；
- 线段只包含两个端点之间的有限部分；
- 两条不平行直线一定相交，但对应线段可能离交点很远。

## 直线与线段

两个不同点 $A,B$ 确定一条直线。参数形式是：

$$
P(t)=A+t(B-A),\qquad t\in\mathbb R.
$$

当 $t$ 可以取任意实数时，得到整条直线；限制：

$$
0\le t\le1
$$

时，得到闭线段 $\overline{AB}$，包含两个端点。

向量：

$$
B-A
$$

称为直线的方向向量。若两个方向向量叉积为 `0`，两条直线平行或重合。

## 点是否在线段上

点 $P$ 在线段 $\overline{AB}$ 上需要同时满足：

1. $A,B,P$ 共线；
2. $P$ 的横纵坐标都位于两个端点形成的闭区间内。

```cpp
bool on_segment(Point a, Point b, Point p) {
    if (orientation(a, b, p) != 0) {
        return false;
    }

    return min(a.x, b.x) <= p.x &&
           p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y &&
           p.y <= max(a.y, b.y);
}
```

只判断共线不够。点可能位于同一条直线上，却在整条线段的延长部分。

横纵坐标都检查，能够统一处理水平、竖直和倾斜线段。

## 两个端点是否分处直线两侧

对线段 $\overline{AB}$ 与 $\overline{CD}$，计算：

$$
o_1=orientation(A,B,C),
$$

$$
o_2=orientation(A,B,D),
$$

$$
o_3=orientation(C,D,A),
$$

$$
o_4=orientation(C,D,B).
$$

若 $o_1,o_2$ 异号，说明 $C,D$ 严格位于直线 $AB$ 两侧。另一方向也必须成立：
$A,B$ 严格位于直线 $CD$ 两侧。

两个条件同时成立时，两条线段在内部发生**规范相交**：

```cpp
bool opposite(ll a, ll b) {
    return (a < 0 && b > 0) ||
           (a > 0 && b < 0);
}
```

不直接判断 `a * b < 0`，因为乘法可能产生没有必要的溢出。

## 端点与共线情况

只看严格异号会漏掉：

- 一个端点恰好落在另一条线段上；
- 两条共线线段部分重叠；
- 两条线段只在端点接触。

分别检查四个共线端点：

```cpp
if (o1 == 0 && on_segment(a, b, c)) {
    return true;
}
if (o2 == 0 && on_segment(a, b, d)) {
    return true;
}
if (o3 == 0 && on_segment(c, d, a)) {
    return true;
}
if (o4 == 0 && on_segment(c, d, b)) {
    return true;
}
```

若都不成立，最后才检查两个严格异号条件。

本篇把端点接触和共线重叠都算作“相交”。题目若要求只有内部交叉才算，需要使用
规范相交定义，不能直接复制包含边界的函数。

## 两条直线的交点

设：

$$
r=B-A,\qquad s=D-C.
$$

两条直线参数式：

$$
A+tr=C+qs.
$$

两边与 $s$ 做叉积：

$$
(A-C)\times s+t(r\times s)=0,
$$

得到：

$$
t=\frac{(C-A)\times s}{r\times s}.
$$

若 $r\times s=0$，两直线平行或重合，没有唯一交点。否则：

```cpp
struct PointD {
    double x;
    double y;
};

PointD operator+(PointD a, PointD b) {
    return {a.x + b.x, a.y + b.y};
}

PointD operator-(PointD a, PointD b) {
    return {a.x - b.x, a.y - b.y};
}

PointD operator*(PointD a, double k) {
    return {a.x * k, a.y * k};
}

double cross(PointD a, PointD b) {
    return a.x * b.y - a.y * b.x;
}

PointD line_intersection(
    PointD a,
    PointD b,
    PointD c,
    PointD d) {
    PointD r = b - a;
    PointD s = d - c;
    double t = cross(c - a, s) / cross(r, s);
    return a + r * t;
}
```

这个函数只应在已经确认分母不为零后调用。整数端点的交点也可能是分数，因此
返回浮点坐标。

判断线段是否相交时不需要真的求交点。先用整数方向判断更简单，也避免浮点误差。

## 完整代码

下面回答多组闭线段是否相交。端点接触与共线重叠都输出 `Yes`。坐标为整数且
绝对值不超过 $10^8$。

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

ll cross(Point a, Point b) {
    return a.x * b.y - a.y * b.x;
}

ll orientation(Point a, Point b, Point c) {
    return cross(b - a, c - a);
}

bool on_segment(Point a, Point b, Point p) {
    if (orientation(a, b, p) != 0) {
        return false;
    }

    return min(a.x, b.x) <= p.x &&
           p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y &&
           p.y <= max(a.y, b.y);
}

bool opposite(ll a, ll b) {
    return (a < 0 && b > 0) ||
           (a > 0 && b < 0);
}

bool intersect(
    Point a,
    Point b,
    Point c,
    Point d) {
    ll o1 = orientation(a, b, c);
    ll o2 = orientation(a, b, d);
    ll o3 = orientation(c, d, a);
    ll o4 = orientation(c, d, b);

    if (o1 == 0 && on_segment(a, b, c)) {
        return true;
    }
    if (o2 == 0 && on_segment(a, b, d)) {
        return true;
    }
    if (o3 == 0 && on_segment(c, d, a)) {
        return true;
    }
    if (o4 == 0 && on_segment(c, d, b)) {
        return true;
    }

    return opposite(o1, o2) &&
           opposite(o3, o4);
}

void solve() {
    int q;
    cin >> q;

    while (q--) {
        Point a, b, c, d;
        cin >> a.x >> a.y >> b.x >> b.y;
        cin >> c.x >> c.y >> d.x >> d.y;

        if (intersect(a, b, c, d)) {
            cout << "Yes\n";
        } else {
            cout << "No\n";
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

## 复杂度

每组线段只进行常数次叉积与坐标比较：

- 单次时间复杂度：$O(1)$；
- 额外空间复杂度：$O(1)$。

## 常见错误

- 把直线相交与线段相交当成同一个问题；
- 只判断四个方向值异号，漏掉端点和共线重叠；
- 只判断三点共线，没有检查点是否位于端点之间；
- 用 `o1 * o2 < 0` 判断异号，引入乘法溢出；
- 交换叉积参数后忘记方向符号也会反转；
- 用浮点交点计算替代可以精确完成的整数相交判定；
- 没确认两直线不平行就除以方向叉积。

## 需要记住什么

- 直线参数中的 $t$ 取值怎样区分直线与闭线段？
- 点在线段上为什么同时需要共线和包围盒判断？
- 规范相交为什么要求两组方向值分别异号？
- 为什么完整相交判定还要处理四种共线端点？
- 什么时候才需要真的计算浮点交点？
