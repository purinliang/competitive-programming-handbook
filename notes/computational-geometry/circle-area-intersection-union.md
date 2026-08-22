# 圆面积交与面积并

> 最近修订：2026-08-23 08:47 +10:00（未审阅）

两个圆的公共面积可以由两个扇形减去两个三角形得到。多个圆的面积并却不能简单枚举
两两相交面积：三个圆可能共同覆盖同一区域，普通的“总面积减去两两交集”会重复扣除。

本文先求两圆面积交，再解决更一般的问题：给定若干圆，求至少被一个圆覆盖的面积。
多个圆的算法不做高阶容斥，而是找出每个圆仍暴露在面积并边界上的圆弧，再沿这些圆弧
计算有向面积。

圆半径均严格为正，使用 `double` 和允许误差 `EPS`。

## 两圆面积交的三种情况

设两圆半径为 $r_1,r_2$，圆心距离为 $d$。

### 相离或外切

若：

$$
d\ge r_1+r_2,
$$

公共面积为 `0`。外切只有一个公共点，不产生面积。

### 一个圆包含另一个圆

若：

$$
d\le |r_1-r_2|,
$$

公共部分就是较小圆：

$$
S=\pi\min(r_1,r_2)^2.
$$

### 两圆规范相交

其余情况有两个边界交点。连接两个圆心与任一交点，设两个半圆心角为
$\alpha,\beta$。由余弦定理：

$$
\alpha=
\arccos
\frac{r_1^2+d^2-r_2^2}{2r_1d},
$$

$$
\beta=
\arccos
\frac{r_2^2+d^2-r_1^2}{2r_2d}.
$$

公共透镜由两个圆弓组成。扇形使用完整圆心角 $2\alpha,2\beta$，面积分别是
$r_1^2\alpha$ 与 $r_2^2\beta$。再减去两个直角三角形，可以写成：

$$
\begin{aligned}
S={}&r_1^2\alpha+r_2^2\beta\\
&-\frac12\sqrt{
(-d+r_1+r_2)(d+r_1-r_2)
(d-r_1+r_2)(d+r_1+r_2)
}.
\end{aligned}
$$

实际实现把根号内的四项逐项相乘：

```cpp
double product = (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2);
```

## 反余弦参数必须夹紧

理论上余弦值位于 `[-1,1]`，浮点误差却可能得到 `1.0000000001`，使 `acos`
返回 `NaN`。统一夹紧：

```cpp
double clamp_cosine(double value) {
    return max(-1.0, min(1.0, value));
}
```

根号内理论上非负的乘积也应与 `0` 取最大值。

## 多个圆为什么改看边界

多个圆的面积并边界只由没有落入其他圆内部的圆弧组成。对圆 $C_i$：

1. 求它的圆周被每个其他圆覆盖的角区间；
2. 把全部覆盖区间合并；
3. 剩余角区间就是面积并边界上暴露的圆弧。

同一段覆盖区域无论被多少圆覆盖，角区间合并后都只删除一次，因此没有高阶容斥的重复
计算问题。

## 一个圆覆盖另一个圆周的角区间

考察圆 $C_i(O_i,r_i)$ 的边界。另一个圆 $C_j(O_j,r_j)$ 与它规范相交时，令：

$$
base=\mathrm{atan2}(O_j.y-O_i.y,O_j.x-O_i.x),
$$

$$
delta=
\arccos
\frac{r_i^2+d^2-r_j^2}{2r_id}.
$$

圆 $C_i$ 上落入 $C_j$ 的部分对应角区间：

$$
[base-delta,base+delta].
$$

代码把角度归一化到 $[0,2\pi)$。若区间跨过 `0`，拆成尾部和首部两段。

若整个 $C_i$ 被某个圆包含，它不可能贡献面积并边界，可以预先删除。若 $C_j$ 被
$C_i$ 包含，它不会覆盖 $C_i$ 的圆周，不产生角区间。完全重合的圆只保留一个。

## 暴露圆弧的有向面积

圆弧参数式为：

$$
x=c_x+r\cos\theta,
\qquad
y=c_y+r\sin\theta.
$$

格林公式把逆时针闭合边界的面积写成：

$$
S=\frac12\oint(x\,dy-y\,dx).
$$

圆弧角度从 $left$ 增加到 $right$ 时，对面积的贡献是：

$$
\frac12\left[
r^2(right-left)
+rc_x(\sin right-\sin left)
+rc_y(\cos left-\cos right)
\right].
$$

把所有暴露圆弧贡献相加，内部重叠边界不会出现，恰好得到整个面积并。

## 完整代码

输入若干圆，输出它们覆盖区域的面积并。代码同时保留 `intersection_area`，可直接用于
两圆面积交问题。

```cpp
#include <bits/stdc++.h>
using namespace std;

const double EPS = 1e-9;
const double PI = acos(-1.0);

struct Point {
    double x;
    double y;
};

Point operator-(Point a, Point b) {
    return {a.x - b.x, a.y - b.y};
}

double length(Point a) {
    return hypot(a.x, a.y);
}

struct Circle {
    Point center;
    double radius;
};

double clamp_cosine(double value) {
    return max(-1.0, min(1.0, value));
}

double intersection_area(Circle first, Circle second) {
    double d = length(second.center - first.center);
    double r1 = first.radius;
    double r2 = second.radius;

    if (d >= r1 + r2 - EPS) {
        return 0;
    }
    if (d <= abs(r1 - r2) + EPS) {
        double radius = min(r1, r2);
        return PI * radius * radius;
    }

    double alpha =
        acos(clamp_cosine((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d)));
    double beta =
        acos(clamp_cosine((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d)));

    double product =
        (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2);

    return r1 * r1 * alpha + r2 * r2 * beta - sqrt(max(0.0, product)) / 2;
}

vector<Circle> remove_covered_circles(const vector<Circle>& circle) {
    vector<Circle> active;
    int n = circle.size();

    for (int i = 0; i < n; ++i) {
        bool covered = false;

        for (int j = 0; j < n; ++j) {
            if (i == j) {
                continue;
            }

            double d = length(circle[j].center - circle[i].center);
            bool contained = d + circle[i].radius <= circle[j].radius + EPS;
            bool strictly_smaller = circle[i].radius < circle[j].radius - EPS;
            bool same_circle =
                d <= EPS && abs(circle[i].radius - circle[j].radius) <= EPS;

            if (contained && (strictly_smaller || (same_circle && j < i))) {
                covered = true;
                break;
            }
        }

        if (!covered) {
            active.push_back(circle[i]);
        }
    }

    return active;
}

void add_covered_interval(vector<pair<double, double>>& interval, double left,
                          double right) {
    double full = 2 * PI;

    while (left < 0) {
        left += full;
        right += full;
    }
    while (left >= full) {
        left -= full;
        right -= full;
    }

    if (right <= full) {
        interval.push_back({left, right});
    } else {
        interval.push_back({left, full});
        interval.push_back({0, right - full});
    }
}

double arc_area(Circle circle, double left, double right) {
    double radius = circle.radius;

    return (radius * radius * (right - left) +
            radius * circle.center.x * (sin(right) - sin(left)) +
            radius * circle.center.y * (cos(left) - cos(right))) /
           2;
}

double union_area(vector<Circle> circle) {
    circle = remove_covered_circles(circle);
    double answer = 0;

    for (int i = 0; i < (int)circle.size(); ++i) {
        vector<pair<double, double>> interval;

        for (int j = 0; j < (int)circle.size(); ++j) {
            if (i == j) {
                continue;
            }

            Point movement = circle[j].center - circle[i].center;
            double d = length(movement);
            double r1 = circle[i].radius;
            double r2 = circle[j].radius;

            if (d >= r1 + r2 - EPS || d + r2 <= r1 + EPS) {
                continue;
            }

            double base = atan2(movement.y, movement.x);
            double delta =
                acos(clamp_cosine((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d)));

            add_covered_interval(interval, base - delta, base + delta);
        }

        sort(interval.begin(), interval.end());

        vector<pair<double, double>> merged;
        for (auto [left, right] : interval) {
            if (merged.empty() || left > merged.back().second + EPS) {
                merged.push_back({left, right});
            } else {
                merged.back().second = max(merged.back().second, right);
            }
        }

        double current = 0;
        for (auto [left, right] : merged) {
            if (current < left - EPS) {
                answer += arc_area(circle[i], current, left);
            }
            current = max(current, right);
        }

        if (current < 2 * PI - EPS) {
            answer += arc_area(circle[i], current, 2 * PI);
        }
    }

    return max(0.0, answer);
}

void solve() {
    int n;
    cin >> n;

    vector<Circle> circle(n);
    for (Circle& current : circle) {
        cin >> current.center.x;
        cin >> current.center.y;
        cin >> current.radius;
    }

    cout << fixed << setprecision(10) << union_area(circle) << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 正确性

两圆规范相交时，余弦定理确定两个圆心角；两个扇形减去中间三角形恰好组成公共透镜。
相离与包含情况分别由 `0` 和较小圆面积覆盖，因此 `intersection_area` 对所有位置关系
都正确。

面积并算法删除的圆完全包含于另一个圆，不可能贡献外边界。对每个保留圆，所有被其他
圆覆盖的圆周角区间被求出并合并；其补集恰好是面积并边界上的暴露圆弧。面积并的边界
由这些逆时针圆弧组成，格林公式的圆弧积分相加恰好给出闭合区域面积。因此算法返回所有
圆覆盖区域的面积并。

## 复杂度

- 删除被包含圆：$O(n^2)$；
- 每个圆收集 $O(n)$ 个角区间并排序：$O(n\log n)$；
- 总时间复杂度：$O(n^2\log n)$；
- 角区间与圆数组使用 $O(n)$ 额外空间。

## 常见错误

- 把外切点或内切点误认为具有正面积；
- `acos` 参数没有夹紧到 `[-1,1]`；
- 多圆面积并只减去两两交集，忽略三重及更高重叠；
- 没有删除被完整包含的圆或重复圆；
- 覆盖角区间跨过 `0` 时没有拆开；
- 合并角区间时遗漏相接或误差范围内重叠的区间；
- 只累加扇形面积，忘记圆心不在原点时格林公式还有平移项；
- 把圆周被覆盖与整个圆盘被包含混为一谈。

## 需要记住什么

- 两圆相离、包含和规范相交时，面积交分别怎样处理？
- 两圆透镜面积为什么是两个扇形减去三角形？
- 多圆面积并为什么不适合直接做低阶容斥？
- 怎样得到一个圆周被另一个圆覆盖的角区间？
- 为什么只积分暴露圆弧就能得到整个面积并？
