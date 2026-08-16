# 圆：切线

> 最近修订：2026-08-17 09:35 +10:00（未审阅）

从圆外一点观察圆形障碍物，两条刚好擦过边界的直线给出了可见范围的左右边界。两个
圆之间的公切线则会出现在几何路径规划、圆形凸包和边界连接中。

切线最重要的性质是：切点处的半径与切线垂直。本篇先用这个直角关系求点到圆的
切线，再把两个圆的公切线统一成“寻找一个合适的单位法向量”。

本篇假设圆半径严格为正，使用 `double` 和允许误差 `EPS`。

## 直线的表示

一条无限直线可以用直线上一点 `point` 和非零方向向量 `direction` 表示：

$$
X=point+t\cdot direction,
$$

其中 $t$ 可以取任意实数。

```cpp
struct Line {
    Point point;
    Point direction;
};
```

不能只用“两圆上的两个切点”表示公切线。两个圆相切时，它们在那条公切线上的切点
会重合，两点无法确定方向；显式保存方向向量可以统一处理这种退化情况。

## 点到圆的切线数量

设圆为 $C(O,r)$，给定点为 $P$，距离 $d=|P-O|$：

- $d<r$：点在圆内，没有实数切线；
- $d=r$：点在圆上，只有一条切线；
- $d>r$：点在圆外，有两条切线。

若 $P$ 在圆上，切点就是 $P$，切线方向是半径 $OP$ 的垂直方向。

## 圆外一点的两个切点

设切点为 $T$。由于 $OT$ 垂直于切线 $PT$，三角形 $OPT$ 在 $T$ 处为直角：

```text
             T
            /|
           / | r
          /  |
         P---H---O
```

令从圆心指向给定点的单位向量为：

$$
u=\frac{P-O}{d}.
$$

把切点分解成沿 `u` 的分量和垂直分量。由直角三角形相似关系，沿 `u` 的投影长度
为：

$$
a=\frac{r^2}{d}.
$$

垂直分量长度为：

$$
h=\frac{r\sqrt{d^2-r^2}}{d}.
$$

若 `perpendicular = (-u.y,u.x)`，两个切点是：

$$
T_1=O+au+h\cdot perpendicular,
$$

$$
T_2=O+au-h\cdot perpendicular.
$$

每个切点处的切线方向，都可以把半径 $T-O$ 旋转 $90^\circ$ 得到。

## 两个圆的公切线

两个圆的公切线分成两类：

- 外公切线：两个圆心位于切线同侧；
- 内公切线：两个圆心位于切线异侧，切线穿过两圆之间。

设两个圆为 $C_1(O_1,r_1)$、$C_2(O_2,r_2)$。选择公切线的单位法向量 `normal`，
并规定第一个圆的切点为：

$$
T_1=O_1+r_1\cdot normal.
$$

为了统一两类切线，把第二个圆使用的半径记为带符号半径：

$$
r_2'=\begin{cases}
r_2,&\text{外公切线},\\
-r_2,&\text{内公切线}.
\end{cases}
$$

第二个切点为：

$$
T_2=O_2+r_2'\cdot normal.
$$

`T2-T1` 必须与法向量垂直。令 $movement=O_2-O_1$，得到：

$$
movement\cdot normal=r_1-r_2'.
$$

问题因此变成：寻找与给定向量点积为指定值的单位向量。

## 求单位法向量

记：

$$
D=|movement|^2,
$$

$$
radius\_difference=r_1-r_2'.
$$

若：

$$
D<radius\_difference^2,
$$

不存在满足条件的单位法向量，这一类公切线不存在。

否则令：

$$
h=\sqrt{D-radius\_difference^2},
$$

两个候选法向量是：

$$
normal=
\frac{movement\cdot radius\_difference
\pm perpendicular(movement)\cdot h}{D}.
$$

它与 `movement` 的点积正好是 `radius_difference`，长度也正好是 1。若 $h=0$，
正负两个结果相同，只保留一条切线。

切线方向是法向量旋转 $90^\circ$ 后的向量：

$$
direction=perpendicular(normal).
$$

## 公切线数量

设圆心距离为 $d$，并假设两个圆不重合：

- $d>r_1+r_2$：四条，包含两条外公切线和两条内公切线；
- $d=r_1+r_2$：三条，其中两条外公切线，一条内公切线；
- $|r_1-r_2|<d<r_1+r_2$：两条外公切线；
- $d=|r_1-r_2|$：一条公切线；
- $d<|r_1-r_2|$：没有公切线；
- 圆心和半径都相同：有无穷多条公切线。

这张表可以用于检查结果，但代码不必分别手写六套公式。带符号半径会让外公切线和
内公切线分别经过同一段计算，自然得到对应数量。

## 完整代码

操作 `1` 求点到圆的切线，操作 `2` 求两个圆的公切线。每条直线输出直上一点和一个
单位方向向量；圆重合时输出 `Infinite`。

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

Point operator/(Point a, double k) {
    return {a.x / k, a.y / k};
}

double dot(Point a, Point b) {
    return a.x * b.x + a.y * b.y;
}

double length(Point a) {
    return hypot(a.x, a.y);
}

Point perpendicular(Point a) {
    return {-a.y, a.x};
}

struct Circle {
    Point center;
    double radius;
};

struct Line {
    Point point;
    Point direction;
};

vector<Line> tangents_from_point(Circle circle, Point point) {
    Point movement = point - circle.center;
    double d = length(movement);

    if (d < circle.radius - EPS) {
        return {};
    }

    Point unit = movement / d;
    if (d <= circle.radius + EPS) {
        Point contact = circle.center + unit * circle.radius;
        return {{contact, perpendicular(unit)}};
    }

    double projection = circle.radius * circle.radius / d;
    double height = circle.radius *
                    sqrt(max(0.0, d * d - circle.radius * circle.radius)) / d;
    Point base = circle.center + unit * projection;
    Point offset = perpendicular(unit) * height;

    vector<Line> result;
    for (Point contact : {base + offset, base - offset}) {
        Point normal = (contact - circle.center) / circle.radius;
        result.push_back({contact, perpendicular(normal)});
    }
    return result;
}

struct CommonTangents {
    bool infinite;
    vector<Line> line;
};

CommonTangents common_tangents(Circle first, Circle second) {
    Point movement = second.center - first.center;
    double distance_squared = dot(movement, movement);

    if (distance_squared <= EPS) {
        bool same_radius = abs(first.radius - second.radius) <= EPS;
        return {same_radius, {}};
    }

    vector<Line> result;
    for (int side : {1, -1}) {
        double signed_second_radius = side * second.radius;
        double radius_difference = first.radius - signed_second_radius;
        double height_squared =
            distance_squared - radius_difference * radius_difference;

        if (height_squared < -EPS) {
            continue;
        }

        double height = sqrt(max(0.0, height_squared));
        int direction_count = height <= EPS ? 1 : 2;

        for (int turn = 0; turn < direction_count; turn++) {
            double sign = turn == 0 ? 1.0 : -1.0;
            Point normal = (movement * radius_difference +
                            perpendicular(movement) * (height * sign)) /
                           distance_squared;
            Point contact = first.center + normal * first.radius;
            result.push_back({contact, perpendicular(normal)});
        }
    }
    return {false, result};
}

void print_lines(const vector<Line>& line) {
    cout << line.size() << '\n';
    cout << fixed << setprecision(10);

    for (Line current : line) {
        cout << current.point.x << ' ' << current.point.y << ' ';
        cout << current.direction.x << ' ' << current.direction.y << '\n';
    }
}

void solve() {
    int operation;
    cin >> operation;

    if (operation == 1) {
        Circle circle;
        Point point;
        cin >> circle.center.x >> circle.center.y >> circle.radius;
        cin >> point.x >> point.y;
        print_lines(tangents_from_point(circle, point));
        return;
    }

    Circle first, second;
    cin >> first.center.x >> first.center.y >> first.radius;
    cin >> second.center.x >> second.center.y >> second.radius;

    CommonTangents result = common_tangents(first, second);
    if (result.infinite) {
        cout << "Infinite\n";
        return;
    }
    print_lines(result.line);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

每个函数只枚举常数个候选方向，时间和额外空间复杂度都是 $O(1)$。

## 如何检查一条切线

结果直线由 `point` 和 `direction` 表示。若要验证它与圆 $C(O,r)$ 相切，可以
检查：

1. `point` 位于圆上；
2. `(point-O) dot direction` 在误差范围内等于 0。

对于两个圆的公切线，代码保存第一个圆上的切点。第二个圆上的切点可以使用构造时的
同一个 `normal` 和带符号半径计算。即使两个切点重合，方向向量仍然非零，直线表示
不会失效。

## 精度与退化情况

点在圆心时一定处于半径为正的圆内，函数会在除以 `d` 以前返回。两个圆圆心重合时，
也必须先判断是半径相同的重合圆，还是没有公切线的同心异径圆。

理论上切线合并时 `height_squared` 等于 0；浮点误差可能产生微小负数。与圆交点
相同，只有在确认它没有明显小于 0 后才能截成 0。

## 常见错误

- 忘记切点处半径与切线垂直；
- 点在圆内或圆心处仍继续除以圆心距离；
- 把切点当成方向向量，或只返回两个可能重合的切点表示直线；
- 只求外公切线，漏掉圆心异侧的内公切线；
- 为外公切线和内公切线复制两套容易写错符号的公式；
- `height_squared` 理论上为 0 时仍生成正负两个相同答案；
- 两个圆重合时返回空数组，误导调用者认为没有公切线；
- 用两圆相交面积或圆盘是否重叠判断公切线数量。

## 需要记住什么

- 一条直线为什么用“一点和方向向量”表示比用两个切点更稳健？
- 点在圆内、圆上、圆外时分别有几条切线？
- 怎样从直角三角形得到圆外点的两个切点？
- 外公切线和内公切线的区别是什么？
- 带符号的第二个半径怎样统一两类公切线？
- 单位法向量需要满足哪个点积等式？
- 两个圆重合时为什么必须返回“无穷多”而不是空结果？

需要理解垂直半径和单位法向量的推导；公切线公式不要求孤立背诵，应当能够从
`(T2-T1) dot normal = 0` 重新得到。
