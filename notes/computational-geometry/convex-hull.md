# 凸包

> 最近修订：2026-08-17 07:51 +10:00（未审阅）

给定平面上的若干点，想象用一根橡皮筋包住它们并收紧，橡皮筋形成的边界就是
这些点的凸包。

凸包是包含全部输入点的最小凸集合。许多原本需要考虑内部所有点的问题，在求出
凸包后只需处理边界顶点，例如最远点对、最小包围矩形和极值方向查询。

## 什么是凸

一个集合是凸的，表示任取其中两点，它们之间的整条线段仍在集合内。

凹多边形有向内凹陷的角，选择凹陷两侧的点时，连线可能经过多边形外部。凸包会
跨过这些凹陷，只保留最外层边界。

输入点可能：

- 重复；
- 全部共线；
- 位于凸包边上但不是拐角；
- 严格位于凸包内部。

算法必须先规定共线边界点是否保留。本篇只保留每条凸包边的两个端点，不保留
边中间的共线点。

## 先按坐标排序

按：

```text
先 x 从小到大
x 相同时 y 从小到大
```

排序，并删除完全重复的点。

```cpp
sort(points.begin(), points.end());
points.erase(
    unique(points.begin(), points.end()),
    points.end());
```

排序后：

- 第一个点一定是最左下的极端点；
- 最后一个点一定是最右上的极端点；
- 可以从左到右构造下凸壳，再从右到左构造上凸壳。

## 构造下凸壳

依次加入排序后的点。当前凸壳末尾已有 `a,b`，准备加入 `p`，检查：

$$
orientation(a,b,p).
$$

为了让下凸壳从左到右保持逆时针转向，必须为正。若小于等于 `0`：

- 负数表示右转，产生向内凹陷；
- 零表示三点共线，而本篇不保留边中间点。

因此删除中间点 `b`：

```cpp
while (lower.size() >= 2 &&
       orientation(
           lower[lower.size() - 2],
           lower.back(),
           p) <= 0) {
    lower.pop_back();
}
lower.push_back(p);
```

删除后继续检查新的末尾两点，直到加入 `p` 能保持严格左转，或凸壳不足两个点。

## 为什么删除中间点

当 `a,b,p` 右转时，`b` 位于从 `a` 到 `p` 的外包边界内侧。保留 `b` 会
产生凹角，不可能属于最小凸边界。

当三点共线时，排序保证 `b` 位于 `a,p` 之间或不比 `p` 更极端。只保留更远的
端点 `p` 就足够包住 `b`。

被弹出的点以后不会重新成为下凸壳顶点，因为后续点的横坐标只会更大。

## 构造上凸壳

从排序数组末尾向开头执行完全相同的过程：

```cpp
for (int i = points.size() - 1; i >= 0; i--) {
    Point p = points[i];

    while (upper.size() >= 2 &&
           orientation(
               upper[upper.size() - 2],
               upper.back(),
               p) <= 0) {
        upper.pop_back();
    }
    upper.push_back(p);
}
```

下凸壳从最左点走到最右点，上凸壳从最右点走回最左点。两者首尾各重复一个端点，
拼接前分别删除最后一个点：

```cpp
lower.pop_back();
upper.pop_back();
lower.insert(
    lower.end(),
    upper.begin(),
    upper.end());
```

结果从字典序最小点开始，按逆时针顺序排列。

## 全部共线

因为转向条件使用 `<= 0`，共线中间点会不断弹出：

- 下凸壳只留下两个极端点；
- 上凸壳也只留下同样两个点的反向路径；
- 去重拼接后，凸包恰好包含两个端点。

若只有一个不同点，凸包就是该点本身。

若题目要求输出凸包边界上的全部共线点，不能简单把 `<= 0` 改成 `< 0` 后就
结束；还需要小心处理全共线输入和上下壳重复点。本篇约定只保留拐角，代码与定义
保持一致。

## 正确性思路

处理到当前点 `p` 时，下凸壳维护：

1. 顶点按坐标从左向右；
2. 相邻三点始终严格左转；
3. 所有已经处理的点都位于这条边界上方或边界上。

若末尾三点不左转，删除中间点不会丢失任何必要外边界；重复删除后，新点与当前
边界相容。归纳可得最终结果是所有点的下方最小凸边界。

上凸壳同理。两条边界合并后包含全部点，边界处处凸，并且任何被删除点都不是
必要拐角，因此得到最小凸多边形。

## 完整代码

输入整数点，输出只保留拐角的凸包。结果从字典序最小点开始逆时针排列。保证
所有叉积在 64 位整数范围内。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct Point {
    ll x;
    ll y;

    bool operator<(const Point& other) const {
        if (x != other.x) {
            return x < other.x;
        }
        return y < other.y;
    }

    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
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

vector<Point> convex_hull(vector<Point> points) {
    sort(points.begin(), points.end());
    points.erase(
        unique(points.begin(), points.end()),
        points.end());

    if (points.size() <= 1) {
        return points;
    }

    vector<Point> lower;
    vector<Point> upper;

    for (Point p : points) {
        while (lower.size() >= 2 &&
               orientation(
                   lower[lower.size() - 2],
                   lower.back(),
                   p) <= 0) {
            lower.pop_back();
        }
        lower.push_back(p);
    }

    for (int i = points.size() - 1; i >= 0; i--) {
        Point p = points[i];

        while (upper.size() >= 2 &&
               orientation(
                   upper[upper.size() - 2],
                   upper.back(),
                   p) <= 0) {
            upper.pop_back();
        }
        upper.push_back(p);
    }

    lower.pop_back();
    upper.pop_back();
    lower.insert(
        lower.end(),
        upper.begin(),
        upper.end());
    return lower;
}

void solve() {
    int n;
    cin >> n;

    vector<Point> points(n);

    for (Point& p : points) {
        cin >> p.x >> p.y;
    }

    vector<Point> hull = convex_hull(points);

    cout << hull.size() << '\n';
    for (Point p : hull) {
        cout << p.x << ' ' << p.y << '\n';
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

这里的 `vector<Point> points(n)` 使用 STL 容器原生下标，只通过范围 `for`
遍历；凸包算法的“第几个输入点”没有题目层面的 1-based 语义。

## 复杂度

- 排序与去重：$O(n\log n)$；
- 每个点在上下壳中至多入栈、出栈各一次：$O(n)$；
- 总时间复杂度：$O(n\log n)$；
- 空间复杂度：$O(n)$。

## 常见错误

- 没有先排序，单调构造失去横坐标顺序；
- 没有删除重复点，产生零长度边和异常转向；
- 不明确是否保留边界共线点就随意选择 `< 0` 或 `<= 0`；
- 下凸壳和上凸壳使用了相反且不一致的转向规则；
- 拼接时没有删除重复的左右极端点；
- 叉积参数顺序反转，却仍按原符号判断左转；
- 忘记单点与全共线输入；
- 用 32 位整数保存坐标乘积。

## 需要记住什么

- 凸集合与凸包分别是什么？
- 为什么先按 `(x,y)` 排序并删除重复点？
- 构造下凸壳时，右转或共线为什么要弹出中间点？
- 上下凸壳怎样拼成逆时针完整边界？
- `<= 0` 的选择怎样决定是否保留边界共线点？

