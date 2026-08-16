# 圆：位置关系与交点

> 最近修订：2026-08-17 09:23 +10:00（未审阅）

两个圆形覆盖区域可能完全分离、相切、相交、互相包含或完全重合。碰撞检测、覆盖范围
分析和圆形边界构造都需要先判断它们的位置关系；只有边界相交时，才继续计算交点。

圆心与半径已经概括了一个圆的全部信息。两个圆的关系只取决于圆心距离 $d$、半径和
$r_1+r_2$，以及半径差 $|r_1-r_2|$。

本篇假设半径严格为正，使用 `double` 和允许误差 `EPS`。

## 圆的表示

圆由圆心 `center` 和半径 `radius` 表示：

```cpp
struct Circle {
    Point center;
    double radius;
};
```

设两个圆为 $C_1(O_1,r_1)$ 和 $C_2(O_2,r_2)$，圆心距离为：

$$
d=|O_2-O_1|.
$$

沿两个圆心的连线观察，问题就变成比较三个长度。

## 六种位置关系

### 相离

若：

$$
d>r_1+r_2,
$$

两个圆之间还有空隙，边界没有交点。

### 外切

若：

$$
d=r_1+r_2,
$$

两个圆在圆心连线上接触，恰好有一个交点。

### 相交

若：

$$
|r_1-r_2|<d<r_1+r_2,
$$

两个圆互相穿过，恰好有两个交点。

### 内切

若：

$$
d=|r_1-r_2|>0,
$$

较小圆位于较大圆内部，两个边界在同一方向接触，恰好有一个交点。

### 内含

若：

$$
d<|r_1-r_2|,
$$

较小圆严格位于较大圆内部，边界没有交点。圆心重合但半径不同也属于这种情况。

### 重合

若：

$$
d=0\quad\text{且}\quad r_1=r_2,
$$

两个圆的边界完全相同，有无穷多个交点。

浮点代码不能直接使用等号判断这些边界，而要把与边界相差不超过 `EPS` 的情况视为
相等。

## 从圆心连线定位交点

两个圆有一个或两个交点时，设交点为 $P$。从 $P$ 向圆心连线作垂线，垂足为 $H$：

```text
              P
             /|\
          r1/ | \r2
           /  |h \
         O1---H---O2
             a
```

设 $|O_1H|=a$、$|PH|=h$。由两个直角三角形：

$$
a^2+h^2=r_1^2,
$$

$$
(d-a)^2+h^2=r_2^2.
$$

两式相减，消去 $h$：

$$
a=\frac{r_1^2-r_2^2+d^2}{2d}.
$$

再得到：

$$
h^2=r_1^2-a^2.
$$

令从 $O_1$ 指向 $O_2$ 的单位向量为：

$$
u=\frac{O_2-O_1}{d}.
$$

垂足：

$$
H=O_1+au.
$$

把 `u = (x,y)` 逆时针旋转 $90^\circ$ 得到 `perpendicular = (-y,x)`，两个交点
就是：

$$
P_1=H+h\cdot perpendicular,
$$

$$
P_2=H-h\cdot perpendicular.
$$

相切时 $h=0$，两个表达式得到同一个点，只保留一次。

## 返回完整结果

位置关系不仅是“有没有交点”。重合表示无穷多个交点，不能与相离、内含混成同一个
空数组。因此使用一个结果结构同时返回关系和有限交点：

```cpp
enum class CircleRelation {
    SEPARATE,
    EXTERNALLY_TANGENT,
    INTERSECT,
    INTERNALLY_TANGENT,
    CONTAINED,
    COINCIDENT
};

struct CircleIntersection {
    CircleRelation relation;
    vector<Point> point;
};
```

`point` 为空可能表示相离或内含，必须结合 `relation` 判断；重合则表示交点集合不是
有限集合。

## 完整代码

输入两个圆，输出位置关系和交点。非重合时第二行输出有限交点数量；重合时输出
`Infinite`。输出的英文只作为这份示例程序的接口，不替代正文中的中文术语。

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

double length(Point a) {
    return hypot(a.x, a.y);
}

struct Circle {
    Point center;
    double radius;
};

enum class CircleRelation {
    SEPARATE,
    EXTERNALLY_TANGENT,
    INTERSECT,
    INTERNALLY_TANGENT,
    CONTAINED,
    COINCIDENT
};

struct CircleIntersection {
    CircleRelation relation;
    vector<Point> point;
};

CircleIntersection intersect(Circle first, Circle second) {
    Point movement = second.center - first.center;
    double d = length(movement);
    double radius_sum = first.radius + second.radius;
    double radius_difference = abs(first.radius - second.radius);

    if (d <= EPS && radius_difference <= EPS) {
        return {CircleRelation::COINCIDENT, {}};
    }
    if (d > radius_sum + EPS) {
        return {CircleRelation::SEPARATE, {}};
    }
    if (d < radius_difference - EPS) {
        return {CircleRelation::CONTAINED, {}};
    }

    double a =
        (first.radius * first.radius - second.radius * second.radius + d * d) /
        (2 * d);
    double height_squared = first.radius * first.radius - a * a;
    height_squared = max(0.0, height_squared);

    Point direction = movement / d;
    Point base = first.center + direction * a;
    double height = sqrt(height_squared);

    if (height <= EPS) {
        if (abs(d - radius_sum) <= EPS) {
            return {CircleRelation::EXTERNALLY_TANGENT, {base}};
        }
        return {CircleRelation::INTERNALLY_TANGENT, {base}};
    }

    Point perpendicular = {-direction.y, direction.x};
    Point offset = perpendicular * height;
    return {CircleRelation::INTERSECT, {base + offset, base - offset}};
}

string relation_name(CircleRelation relation) {
    if (relation == CircleRelation::SEPARATE) {
        return "Separate";
    }
    if (relation == CircleRelation::EXTERNALLY_TANGENT) {
        return "Externally tangent";
    }
    if (relation == CircleRelation::INTERSECT) {
        return "Intersect";
    }
    if (relation == CircleRelation::INTERNALLY_TANGENT) {
        return "Internally tangent";
    }
    if (relation == CircleRelation::CONTAINED) {
        return "Contained";
    }
    return "Coincident";
}

void solve() {
    Circle first, second;
    cin >> first.center.x >> first.center.y >> first.radius;
    cin >> second.center.x >> second.center.y >> second.radius;

    CircleIntersection result = intersect(first, second);
    cout << relation_name(result.relation) << '\n';

    if (result.relation == CircleRelation::COINCIDENT) {
        cout << "Infinite\n";
        return;
    }

    cout << result.point.size() << '\n';
    cout << fixed << setprecision(10);
    for (Point point : result.point) {
        cout << point.x << ' ' << point.y << '\n';
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

判断位置关系和计算至多两个交点都只进行常数次运算，时间、额外空间复杂度都是
$O(1)$。

## 精度与边界

理论上相切时 `height_squared` 等于 0。浮点误差可能让它变成很小的负数，因此在
已经确认圆不相离、不内含以后，使用：

```cpp
height_squared = max(0.0, height_squared);
```

这只是修正边界附近的舍入误差，不能拿来掩盖任意负数。代码必须先完成位置关系判断，
再计算交点。

固定 `EPS = 1e-9` 适合常见坐标范围，不是所有题目的绝对规则。坐标很大或误差要求
特殊时，应根据数值规模调整，必要时使用 `long double`。

## 常见错误

- 只比较 $d$ 与 $r_1+r_2$，漏掉内切、内含和重合；
- 把圆盘相交与圆周相交混淆：内含时圆盘有重叠，圆周却没有交点；
- 圆心重合时仍除以 `d`，产生除零；
- 相切时把同一个交点输出两次；
- 看到 `height_squared` 略小于 0 就直接开方，得到 `NaN`；
- 在判断关系以前无条件把所有负数截成 0，掩盖本应无交点的情况；
- 使用浮点等号判断相切或重合；
- 只返回交点数组，无法区分无交点与无穷多个交点。

## 需要记住什么

- 两圆的六种位置关系分别怎样比较 $d$、$r_1+r_2$ 与 $|r_1-r_2|$？
- 为什么重合必须在除以圆心距离以前单独处理？
- 怎样由两个勾股关系消去 $h$ 并求出 $a$？
- 垂足 `base` 和垂直单位向量怎样得到两个交点？
- 相切时为什么只剩一个交点？
- 为什么 `max(0.0,height_squared)` 必须放在位置关系判断以后？

需要能够画出圆心连线和垂足，重新推导 $a$ 与 $h$；位置关系的边界也应能够直接
判断。枚举类型和英文输出名称只是示例接口，不要求背诵。
