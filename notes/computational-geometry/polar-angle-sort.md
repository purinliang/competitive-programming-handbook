# 极角排序

> 最近修订：2026-08-17 09:14 +10:00（未审阅）

站在平面中的观察点 $O$，周围有许多点。若要沿逆时针方向依次访问这些点，就需要
按照射线 $OP$ 的方向排序。

极角排序把每个向量相对 $x$ 轴正方向的角度作为顺序。它是凸包、扫描平面方向、
构造简单多边形和许多按环绕次序处理几何对象的基础操作。

直接调用 `atan2` 可以得到角度，但会引入浮点数和三角函数。若输入是整数坐标，
使用半平面与叉积就能精确比较方向，不必真的计算角度。

## 极角的顺序

本篇把极角定义为从 $x$ 轴正方向开始，沿逆时针方向增长，范围是 $[0,2\pi)$：

```text
             pi / 2
               ^
               |
pi  <-----------O----------->  0
               |
               v
            3 pi / 2
```

给定排序中心 $O$ 和点 $P$，先平移得到向量：

$$
v=P-O.
$$

平移不会改变方向。后续只比较从原点出发的向量 `v`，不能直接拿点的绝对坐标判断
绕 $O$ 的顺序。

## 先分成两个半平面

只用叉积不能直接排满一整圈，因为角度接近 $0$ 与接近 $2\pi$ 的向量之间存在
断点。先把向量分成两半：

- 上半平面：`y > 0`，以及 `y == 0 && x > 0`；
- 下半平面：其余方向，包括 $x$ 轴负方向。

上半平面的角度位于 $[0,\pi)$，应当全部排在下半平面 $[\pi,2\pi)$ 之前。

```cpp
int half(Point v) {
    if (v.y > 0 || (v.y == 0 && v.x > 0)) {
        return 0;
    }
    return 1;
}
```

输入保证待排序点不与中心重合，因此不会出现没有方向的零向量。

## 同一半平面用叉积

两个向量 `a` 和 `b` 位于同一半平面时，它们的夹角不会跨越整圈断点。根据
[点积、叉积与方向判断](dot-cross-orientation.md)，若：

$$
a\times b>0,
$$

从 `a` 转向 `b` 是逆时针方向，所以 `a` 的极角更小，应排在 `b` 前面。

```cpp
ll direction = cross(a, b);
if (direction != 0) {
    return direction > 0;
}
```

若叉积为 0，两个向量在同一直线上。同一半平面已经排除了相反方向，因此它们沿同一
条射线。此时按到中心的距离从近到远排序：

```cpp
return length_squared(a) < length_squared(b);
```

距离也相同时，再按坐标固定顺序，使比较器面对重复点时仍然清晰、确定。

## 完整比较器

```cpp
bool polar_less(Point a, Point b) {
    int half_a = half(a);
    int half_b = half(b);

    if (half_a != half_b) {
        return half_a < half_b;
    }

    ll direction = cross(a, b);
    if (direction != 0) {
        return direction > 0;
    }

    ll distance_a = length_squared(a);
    ll distance_b = length_squared(b);
    if (distance_a != distance_b) {
        return distance_a < distance_b;
    }

    if (a.x != b.x) {
        return a.x < b.x;
    }
    return a.y < b.y;
}
```

这个比较器比较的是从原点出发的向量。围绕任意中心排序时，要先在调用处减去中心，
或在比较器中统一执行平移。

## 完整代码

输入排序中心和 `n` 个点，按照从 $x$ 轴正方向开始的逆时针极角输出；同一射线上的
点从近到远。坐标绝对值不超过 $10^8$，且没有点与中心重合。

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

ll length_squared(Point a) {
    return a.x * a.x + a.y * a.y;
}

int half(Point v) {
    if (v.y > 0 || (v.y == 0 && v.x > 0)) {
        return 0;
    }
    return 1;
}

bool polar_less(Point a, Point b) {
    int half_a = half(a);
    int half_b = half(b);

    if (half_a != half_b) {
        return half_a < half_b;
    }

    ll direction = cross(a, b);
    if (direction != 0) {
        return direction > 0;
    }

    ll distance_a = length_squared(a);
    ll distance_b = length_squared(b);
    if (distance_a != distance_b) {
        return distance_a < distance_b;
    }

    if (a.x != b.x) {
        return a.x < b.x;
    }
    return a.y < b.y;
}

void solve() {
    int n;
    Point origin;
    cin >> n >> origin.x >> origin.y;

    vector<Point> point(n + 5);
    for (int i = 1; i <= n; i++) {
        cin >> point[i].x >> point[i].y;
    }

    sort(point.begin() + 1, point.begin() + n + 1, [origin](Point a, Point b) {
        Point vector_a = a - origin;
        Point vector_b = b - origin;
        return polar_less(vector_a, vector_b);
    });

    for (int i = 1; i <= n; i++) {
        cout << point[i].x << ' ' << point[i].y << '\n';
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

排序进行 $O(n\log n)$ 次比较，每次比较只做常数次整数运算，因此时间复杂度为
$O(n\log n)$。除排序本身使用的空间外，额外空间为 $O(1)$。

## 为什么不用斜率

斜率 $y/x$ 不能直接表示整圈方向：

- `x == 0` 时需要特殊处理；
- 相反向量的斜率相同；
- 不同象限可能得到相同斜率；
- 整数除法会截断，浮点除法会引入误差。

极角排序真正需要的是“先确定半圈，再比较同一半圈中的逆时针关系”。半平面和叉积
正好直接表达这两件事。

## 比较器必须满足严格弱序

传给 `sort` 的比较器必须保持一致：不能出现 `a < b` 与 `b < a` 同时为真，也
不能让循环比较产生矛盾。

不要在叉积为 0 时写 `return true`，也不要使用带误差且不传递的随意判断。对于整数
点，本篇依次比较半平面、叉积、距离和坐标，每一层都只在上一层相等时继续，得到
稳定的字典式顺序。

## 常见错误

- 没有先分半平面，只凭 `cross(a,b) > 0` 排整圈；
- 忘记减去排序中心，实际按照点相对原点的方向排序；
- 把叉积符号写反，得到顺时针顺序；
- 同一射线没有规定距离顺序，后续算法却错误依赖点的先后；
- 用斜率排序，遗漏竖直方向、象限和相反向量问题；
- 叉积使用 32 位整数，在坐标乘法时溢出；
- 输入允许点等于中心，却没有单独规定零向量的位置；
- 比较器对相等元素仍返回 `true`，破坏 `sort` 的要求。

## 需要记住什么

- 本篇的极角从哪个方向开始，沿哪个方向增长？
- 为什么只使用叉积不能直接排满一整圈？
- 上半平面与下半平面如何划分？
- 同一半平面中，`cross(a,b) > 0` 为什么表示 `a` 应排在 `b` 前面？
- 同一射线上的点还需要怎样确定顺序？
- 围绕任意中心排序时，为什么必须先平移？
- 极角比较器为什么要满足严格弱序？

需要能够从“半平面解决断点、叉积比较转向”重新写出比较器；坐标兜底等工程细节可
按题目是否存在重复点调整。
