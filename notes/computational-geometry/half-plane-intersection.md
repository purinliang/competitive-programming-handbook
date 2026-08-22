# 半平面交

> 最近修订：2026-08-23 08:21 +10:00（未审阅）

一条有向直线把平面分成左右两个半平面。若每条约束都要求点位于有向直线左侧，所有
约束共同允许的区域就是这些半平面的交。

例如凸多边形的每条逆时针边都规定“内部在左侧”。不断加入直线约束，相当于不断切掉
当前可行区域的一部分。半平面交可以求线性不等式定义的二维可行域、多个凸多边形的交，
也能作为许多几何优化问题的核心步骤。

本文输入若干条有向直线，每条由两个不同点 `a -> b` 给出并保留左侧。若交集非空，
保证它是有界多边形；程序输出交集面积，空集输出 `0`。

## 有向直线与左半平面

用直线上一点 `point` 和方向向量 `direction` 表示直线：

```cpp
struct Line {
    Point point;
    Point direction;
    double angle;
};
```

点 $P$ 位于有向直线左侧或边界上，当且仅当：

$$
direction\times(P-point)\ge 0.
$$

浮点版本允许很小的误差：

```cpp
bool on_left(Line line, Point p) {
    return cross(line.direction, p - line.point) >= -EPS;
}
```

边界属于可行域。若题目要求严格不等式，有限精度下通常不能直接得到一个闭多边形，
需要另外分析；本文只处理闭半平面。

## 为什么先按方向排序

若直线方向按极角从小到大排列，相邻约束的交点就会沿最终凸多边形边界依次出现。
使用：

```cpp
angle = atan2(direction.y, direction.x);
```

排序后，每条新直线只可能从当前可行边界的首端或末端切掉一段。于是可以用双端队列
维护仍然有效的直线，而不必每加入一条约束就重新构造整个多边形。

## 同方向直线只保留更严格的一条

两条方向相同的平行直线不会产生交点。它们保留的都是左侧，其中更靠左的一条约束更
严格，另一条完全冗余。

设队列中已有 `previous`，准备加入同方向的 `current`。若 `current.point` 位于
`previous` 左侧，`current` 更严格：

```cpp
if (on_left(previous, current.point)) {
    previous = current;
}
```

预处理时合并同方向直线，能保证后续相邻有效直线拥有唯一交点。

## 两条直线的交点

设：

$$
L_1:P_1+tD_1,
\qquad
L_2:P_2+sD_2.
$$

当 $D_1\times D_2\ne0$ 时：

$$
t=\frac{(P_2-P_1)\times D_2}{D_1\times D_2}.
$$

所以：

```cpp
Point intersection(Line first, Line second) {
    double t = cross(second.point - first.point, second.direction) /
               cross(first.direction, second.direction);
    return first.point + first.direction * t;
}
```

## 新约束怎样删除队尾

队列中最后两条直线的交点是当前边界末端。若它不在新直线左侧，新约束已经切掉这个
顶点，最后一条旧直线不可能再出现在最终边界：

```cpp
while (line_queue.size() >= 2 &&
       !on_left(current, intersection(line_queue[line_queue.size() - 2],
                                      line_queue.back()))) {
    line_queue.pop_back();
}
```

重复删除，直到末端交点重新满足新约束。

## 为什么还要删除队首

方向角是环形的。当前处理到较大方向时，新半平面也可能切掉队首两条直线形成的交点：

```cpp
while (line_queue.size() >= 2 &&
       !on_left(current, intersection(line_queue[0], line_queue[1]))) {
    line_queue.pop_front();
}
```

所有直线处理完后，最后一条与第一条还要闭合。再用首约束检查队尾交点、用尾约束检查
队首交点，才能得到环形的最终边界。

## 完整代码

输入 `n` 条有向直线，每行给出 `x1 y1 x2 y2`，保留从第一点指向第二点的左侧。
若交集非空，保证交集有界。输出交集面积。

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

double cross(Point a, Point b) {
    return a.x * b.y - a.y * b.x;
}

double dot(Point a, Point b) {
    return a.x * b.x + a.y * b.y;
}

struct Line {
    Point point;
    Point direction;
    double angle;
};

bool on_left(Line line, Point p) {
    return cross(line.direction, p - line.point) >= -EPS;
}

bool same_direction(Line first, Line second) {
    return abs(cross(first.direction, second.direction)) <= EPS &&
           dot(first.direction, second.direction) > 0;
}

Point intersection(Line first, Line second) {
    double t = cross(second.point - first.point, second.direction) /
               cross(first.direction, second.direction);
    return first.point + first.direction * t;
}

vector<Point> half_plane_intersection(vector<Line> line) {
    sort(line.begin(), line.end(),
         [](Line first, Line second) { return first.angle < second.angle; });

    vector<Line> filtered;

    for (Line current : line) {
        if (!filtered.empty() && same_direction(filtered.back(), current)) {
            if (on_left(filtered.back(), current.point)) {
                filtered.back() = current;
            }
        } else {
            filtered.push_back(current);
        }
    }

    deque<Line> line_queue;

    for (Line current : filtered) {
        while (line_queue.size() >= 2 &&
               !on_left(current, intersection(line_queue[line_queue.size() - 2],
                                              line_queue.back()))) {
            line_queue.pop_back();
        }

        while (line_queue.size() >= 2 &&
               !on_left(current, intersection(line_queue[0], line_queue[1]))) {
            line_queue.pop_front();
        }

        if (!line_queue.empty() &&
            abs(cross(line_queue.back().direction, current.direction)) <= EPS) {
            return {};
        }

        line_queue.push_back(current);
    }

    while (line_queue.size() >= 3 &&
           !on_left(line_queue.front(),
                    intersection(line_queue[line_queue.size() - 2],
                                 line_queue.back()))) {
        line_queue.pop_back();
    }

    while (line_queue.size() >= 3 &&
           !on_left(line_queue.back(),
                    intersection(line_queue[0], line_queue[1]))) {
        line_queue.pop_front();
    }

    if (line_queue.size() < 3) {
        return {};
    }

    vector<Point> polygon;
    for (int i = 0; i + 1 < (int)line_queue.size(); ++i) {
        polygon.push_back(intersection(line_queue[i], line_queue[i + 1]));
    }
    polygon.push_back(intersection(line_queue.back(), line_queue.front()));
    return polygon;
}

double polygon_area(const vector<Point>& polygon) {
    double sum = 0;
    int n = polygon.size();

    for (int i = 0; i < n; ++i) {
        sum += cross(polygon[i], polygon[(i + 1) % n]);
    }
    return abs(sum) / 2;
}

void solve() {
    int n;
    cin >> n;

    vector<Line> line;

    for (int i = 1; i <= n; ++i) {
        Point a, b;
        cin >> a.x >> a.y >> b.x >> b.y;

        Point direction = b - a;
        line.push_back({a, direction, atan2(direction.y, direction.x)});
    }

    vector<Point> polygon = half_plane_intersection(line);
    cout << fixed << setprecision(10) << polygon_area(polygon) << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

代码没有加入“足够大”的人工包围盒。若输入交集可能无界，应由题目另外定义无界时的
输出，或提供一个有证明的实际边界；随意选择巨大常数会把无界区域错误截成有限多边形。

## 正确性

同方向预处理只删除被更严格半平面完全包含的冗余约束，不改变交集。按方向排序后，
队列始终保存仍可能出现在当前交集边界上的直线。

加入新半平面时，若队首或队尾交点在其外部，对应端部直线已被新约束完全遮住，删除它
不会移除最终边界；循环结束后所有保留端点都满足当前约束。最终闭合检查补上最后方向
与最初方向之间的两项约束。相邻保留直线的交点依次组成满足全部半平面的凸多边形，且
任何被删除直线都不可能提供边界，因此结果恰好是所有半平面的交。

## 复杂度

- 按方向排序：$O(n\log n)$；
- 每条直线至多进入和离开双端队列各一次：$O(n)$；
- 构造交点与计算面积：$O(n)$；
- 总时间复杂度：$O(n\log n)$；
- 空间复杂度：$O(n)$。

## 常见错误

- 没有明确有向直线保留左侧还是右侧；
- 顶点顺序反向，导致原本的凸多边形内部变成外部；
- 同方向直线没有只保留更严格的一条；
- 使用带 `EPS` 的非传递比较函数直接排序，破坏严格弱序；
- 只删除队尾，不处理队首和最后的环形闭合；
- 在平行直线之间直接计算交点并除以接近 `0` 的叉积；
- 用一个未经证明的巨大矩形截断无界交集；
- 混淆空集与无界交集；本文接口只承诺非空交集有界。

## 需要记住什么

- `a -> b` 保留左侧怎样翻译成叉积条件？
- 为什么方向排序后只需维护边界两端？
- 同方向直线怎样判断哪一条更严格？
- 新约束为什么可能同时删除队首和队尾？
- 为什么处理完所有直线后还要进行闭合检查？

