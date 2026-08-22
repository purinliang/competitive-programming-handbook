# 凸多边形点包含

> 最近修订：2026-08-23 07:45 +10:00（未审阅）

任意简单多边形可以用环绕数判断点的位置，但每次查询都要检查全部边，时间复杂度为
$O(n)$。当多边形是凸多边形时，从一个固定顶点向其他顶点连线，可以把内部划分成
一把按方向排列的三角形扇；每个查询点只需二分找到它可能落入的那一片。

本文解决下面的问题：

- 凸多边形顶点按逆时针顺序给出；
- 相邻三点不共线；
- 多次询问整数点位于内部、边界还是外部。

边界包含顶点和整条多边形边。所有叉积保证在 64 位整数范围内。

## 从一个顶点划分三角形

固定第一个顶点 $P_1$，连接：

$$
P_1P_3,P_1P_4,\ldots,P_1P_{n-1}.
$$

凸多边形被划分成：

$$
\triangle P_1P_2P_3,
\triangle P_1P_3P_4,
\ldots,
\triangle P_1P_{n-1}P_n.
$$

由于顶点逆时针排列，从 $P_1$ 出发的射线：

$$
P_2-P_1,P_3-P_1,\ldots,P_n-P_1
$$

也按逆时针顺序排列。查询点 $Q$ 若在多边形内，向量 $Q-P_1$ 必定位于
$P_2-P_1$ 与 $P_n-P_1$ 形成的扇形中。

## 先排除扇形外部

计算：

```cpp
ll first_side = orientation(polygon[1], polygon[2], query);
ll last_side = orientation(polygon[1], polygon[n], query);
```

- `first_side < 0`：查询点位于射线 $P_1P_2$ 的顺时针一侧；
- `last_side > 0`：查询点位于射线 $P_1P_n$ 的逆时针一侧。

任一条件成立，查询点都在整个凸多边形外部。

若叉积为 `0`，查询点与边 $P_1P_2$ 或 $P_1P_n$ 共线。此时还要检查它是否落在
闭线段上；位于延长线上的点仍是外部。

## 二分所在扇区

排除两条边界射线后，需要寻找最大的 `left`，使：

$$
orientation(P_1,P_{left},Q)\ge 0.
$$

那么 $Q-P_1$ 的方向位于：

$$
P_{left}-P_1
$$

与：

$$
P_{left+1}-P_1
$$

之间，唯一可能的三角形就是：

$$
\triangle P_1P_{left}P_{left+1}.
$$

```cpp
int left = 2;
int right = n;

while (right - left > 1) {
    int middle = (left + right) / 2;

    if (orientation(polygon[1], polygon[middle], query) >= 0) {
        left = middle;
    } else {
        right = middle;
    }
}
```

这里维护的边界是两条相邻射线的下标，不是坐标区间。循环结束时
`right == left + 1`。

## 只检查最后一条边

查询点已经在两条扇形射线之间。还需判断它是否越过凸多边形边：

$$
P_{left}P_{left+1}.
$$

由于多边形逆时针排列，内部位于每条有向边的左侧：

```cpp
ll side = orientation(polygon[left], polygon[left + 1], query);
```

- `side > 0`：严格位于内部；
- `side == 0`：位于边界；
- `side < 0`：越过这条边，位于外部。

不需要再检查另外两条三角形边，因为二分过程已经保证查询方向位于它们之间。

## 完整代码

输入一个严格凸的整数坐标多边形，再回答多个点的位置。顶点按逆时针顺序给出，
输出 `Inside`、`Boundary` 或 `Outside`。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

const int OUTSIDE = 0;
const int INSIDE = 1;
const int BOUNDARY = 2;

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

    return min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

int n;
vector<Point> polygon;

int point_position(Point query) {
    ll first_side = orientation(polygon[1], polygon[2], query);
    ll last_side = orientation(polygon[1], polygon[n], query);

    if (first_side < 0 || last_side > 0) {
        return OUTSIDE;
    }
    if (first_side == 0) {
        return on_segment(polygon[1], polygon[2], query) ? BOUNDARY : OUTSIDE;
    }
    if (last_side == 0) {
        return on_segment(polygon[1], polygon[n], query) ? BOUNDARY : OUTSIDE;
    }

    int left = 2;
    int right = n;

    while (right - left > 1) {
        int middle = (left + right) / 2;

        if (orientation(polygon[1], polygon[middle], query) >= 0) {
            left = middle;
        } else {
            right = middle;
        }
    }

    ll side = orientation(polygon[left], polygon[left + 1], query);

    if (side < 0) {
        return OUTSIDE;
    }
    if (side == 0) {
        return BOUNDARY;
    }
    return INSIDE;
}

void solve() {
    int q;
    cin >> n >> q;

    polygon.assign(n + 5, {});
    for (int i = 1; i <= n; ++i) {
        cin >> polygon[i].x >> polygon[i].y;
    }

    while (q--) {
        Point query;
        cin >> query.x >> query.y;

        int position = point_position(query);

        if (position == INSIDE) {
            cout << "Inside\n";
        } else if (position == BOUNDARY) {
            cout << "Boundary\n";
        } else {
            cout << "Outside\n";
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

## 正确性

两条极端射线 $P_1P_2$ 与 $P_1P_n$ 包含整个凸多边形；预检查正确排除了扇形
外部，并单独识别两条边界。

其余查询方向在按极角单调排列的射线序列中拥有唯一相邻位置。二分找到的
`left` 因此唯一确定可能包含查询点的三角形
$\triangle P_1P_{left}P_{left+1}$。查询点已位于两条径向边之间，所以它属于
多边形，当且仅当它不越过第三条边 $P_{left}P_{left+1}$。叉积符号分别给出内部、
边界与外部，算法结论正确。

## 复杂度

- 预处理只保存已经按逆时针给出的顶点：$O(n)$ 空间；
- 每次查询二分射线：$O(\log n)$ 时间；
- 查询只使用常数额外空间。

若多边形顶点尚未有序，必须先构造凸包；那一步的时间复杂度是
$O(n\log n)$。

## 常见错误

- 输入是任意简单多边形，却使用依赖凸性的二分；
- 顶点顺时针给出，仍照搬逆时针叉积符号；
- 没有单独处理 $P_1P_2$ 与 $P_1P_n$，把延长线误判为边界；
- 二分得到扇区后忘记检查真正的多边形边；
- 把边界点全部算作内部或外部，没有先统一题目定义；
- 凸多边形保留了连续共线顶点，却仍假设每条扇形射线严格递增；
- 用 32 位整数保存叉积。

## 需要记住什么

- 凸性为什么允许从一个顶点划分三角形扇？
- 两条极端射线分别排除哪一侧的点？
- 二分维护的单调条件是什么？
- 找到扇区后，为什么只需再检查一条多边形边？
- 两条边界射线为什么必须结合 `on_segment` 判断？
