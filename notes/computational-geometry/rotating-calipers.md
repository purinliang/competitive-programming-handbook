# 旋转卡壳

> 最近修订：2026-08-23 08:03 +10:00（未审阅）

给定平面上的若干点，寻找距离最远的一对点。直接枚举所有点对需要 $O(n^2)$；先求
凸包后，内部点不可能成为唯一的最远端点，但凸包仍可能有 $O(n)$ 个顶点。

旋转卡壳利用凸多边形边方向的单调变化：一条支撑线沿凸包边旋转时，与它平行的另一条
支撑线接触点也只会沿凸包向前移动。两个指针各绕多边形一圈，就能检查所有可能的对踵
点对。

本文用旋转卡壳求凸多边形直径，也就是最远点对距离平方。输入凸包只保留拐角，顶点按
逆时针顺序排列，所有叉积和距离平方保证在 64 位整数范围内。

## 最远点一定在凸包上

若点 $P$ 严格位于凸包内部，那么沿任意方向穿过 $P$ 的直线都能继续走到凸包边界。
对任意另一点 $Q$，从 $P$ 沿远离 $Q$ 的方向移动到边界，不会缩短与 $Q$ 的距离。

因此至少存在一对凸包顶点达到全体点的最大距离。求出凸包后，可以忽略全部内部点。

## 固定一条边寻找最远支撑点

固定凸包有向边：

$$
P_iP_{i+1}.
$$

点 $P_j$ 到这条直线的距离，与平行四边形面积成正比：

$$
\frac{
|(P_{i+1}-P_i)\times(P_j-P_i)|
}{|P_{i+1}-P_i|}.
$$

固定边后，分母不变，所以只需最大化叉积绝对值。逆时针凸包的其他顶点都在边的左侧，
这里叉积非负，可以直接比较两倍面积：

```cpp
ll area(Point a, Point b, Point p) {
    return cross(b - a, p - a);
}
```

沿凸包依次移动 `j` 时，面积先增大后减小。只要下一个点更远，就继续前进：

```cpp
while (area(polygon[i], polygon[next_i], polygon[next_j]) >
       area(polygon[i], polygon[next_i], polygon[j])) {
    j = next_j;
    next_j = next_index(j);
}
```

停止时，`j` 是这条边的一条对面支撑线所接触的最远顶点。

## 为什么指针不需要回退

从边 $P_iP_{i+1}$ 走到下一条边 $P_{i+1}P_{i+2}$，边的方向只会逆时针旋转。
与它平行的对面支撑线也同向旋转，因此接触点只能沿逆时针凸包保持不动或继续前进，
不会回到已经越过的顶点。

于是：

- 外层指针 `i` 枚举每条边一次；
- 内层指针 `j` 在全部外层循环中总共前进至多一圈。

表面上的嵌套循环总时间仍是 $O(n)$。

## 平行边与平台

若 `j` 和 `next_j` 到当前边的面积相同，说明对面支撑线可能与一条凸包边重合。两个
端点都属于这一支撑位置。

代码在严格增大时移动 `j`，然后检查：

- 当前边两个端点与 `j`；
- 若面积相等，再检查当前边两个端点与 `next_j`。

这样不会漏掉平行边形成的平台，也不需要让 `j` 在相等位置反复绕行。

## 为什么检查边的两个端点

旋转卡壳由“一条边与对面支撑点”描述对踵关系，但最远点对的第一个端点可能是当前边
的任一端。因此每次都比较：

```cpp
distance_squared(polygon[i], polygon[j]);
distance_squared(polygon[next_i], polygon[j]);
```

当所有边都被枚举后，每一对可能达到直径的对踵顶点都被覆盖。

## 完整代码

输入若干整数点。程序先构造只保留拐角的凸包，再输出最远点对的距离平方。若只有一个
不同点，答案为 `0`。

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

ll distance_squared(Point a, Point b) {
    ll dx = a.x - b.x;
    ll dy = a.y - b.y;
    return dx * dx + dy * dy;
}

vector<Point> convex_hull(vector<Point> point) {
    sort(point.begin(), point.end());
    point.erase(unique(point.begin(), point.end()), point.end());

    if (point.size() <= 1) {
        return point;
    }

    vector<Point> lower;
    vector<Point> upper;

    for (Point p : point) {
        while (lower.size() >= 2 &&
               orientation(lower[lower.size() - 2], lower.back(), p) <= 0) {
            lower.pop_back();
        }
        lower.push_back(p);
    }

    for (int i = point.size() - 1; i >= 0; --i) {
        Point p = point[i];

        while (upper.size() >= 2 &&
               orientation(upper[upper.size() - 2], upper.back(), p) <= 0) {
            upper.pop_back();
        }
        upper.push_back(p);
    }

    lower.pop_back();
    upper.pop_back();
    lower.insert(lower.end(), upper.begin(), upper.end());
    return lower;
}

ll convex_diameter_squared(const vector<Point>& hull) {
    int n = hull.size();

    if (n <= 1) {
        return 0;
    }
    if (n == 2) {
        return distance_squared(hull[0], hull[1]);
    }

    auto next_index = [n](int index) { return (index + 1) % n; };

    ll answer = 0;
    int j = 1;

    for (int i = 0; i < n; ++i) {
        int next_i = next_index(i);

        while (true) {
            int next_j = next_index(j);
            ll current_area = orientation(hull[i], hull[next_i], hull[j]);
            ll next_area = orientation(hull[i], hull[next_i], hull[next_j]);

            if (next_area <= current_area) {
                break;
            }
            j = next_j;
        }

        answer = max(answer, distance_squared(hull[i], hull[j]));
        answer = max(answer, distance_squared(hull[next_i], hull[j]));

        int next_j = next_index(j);
        if (orientation(hull[i], hull[next_i], hull[next_j]) ==
            orientation(hull[i], hull[next_i], hull[j])) {
            answer = max(answer, distance_squared(hull[i], hull[next_j]));
            answer = max(answer, distance_squared(hull[next_i], hull[next_j]));
        }
    }

    return answer;
}

void solve() {
    int n;
    cin >> n;

    vector<Point> point(n);
    for (Point& p : point) {
        cin >> p.x >> p.y;
    }

    vector<Point> hull = convex_hull(point);
    cout << convex_diameter_squared(hull) << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

完整程序中的凸包使用 STL 容器原生的 0-based 下标；旋转卡壳只在容器接口内部使用
这些下标。题目中的点没有额外编号语义。

## 正确性

任意最远点对都可以在凸包顶点中找到。对固定凸包边，叉积面积沿凸包先增后减，循环
找到对应的最远支撑顶点；相等平台的另一端也被显式检查。

凸包边方向按逆时针单调旋转，其对面支撑点不会回退。枚举所有边时，算法依次覆盖所有
可能达到直径的对踵关系，并比较边的两个端点与对面支撑点。因此最终最大距离平方恰好
是凸多边形直径，也是原点集最远点对距离平方。

## 复杂度

- 构造凸包：$O(n\log n)$ 时间，$O(n)$ 空间；
- 在含 `h` 个顶点的凸包上旋转卡壳：$O(h)$ 时间；
- 总时间复杂度：$O(n\log n)$；
- 总空间复杂度：$O(n)$。

若输入已经是逆时针严格凸包，只需旋转卡壳部分，时间复杂度为 $O(n)$。

## 常见错误

- 没有先去掉凸包边上的共线中间点；
- 对逆时针凸包使用了相反的叉积方向；
- 每换一条边都把 `j` 从头寻找，退化成 $O(n^2)$；
- 只检查 `hull[i]` 与 `hull[j]`，漏掉当前边另一端；
- 忽略平行支撑边形成的相等平台；
- 对单点或两点凸包直接进入循环；
- 对距离先开方，增加浮点误差且没有必要；
- 用 32 位整数保存叉积或距离平方。

## 需要记住什么

- 为什么最远点对可以限制在凸包顶点上？
- 固定一条边时，叉积面积怎样表示到直线的距离？
- 为什么对面支撑点随着边旋转只会前进？
- 为什么要同时检查当前边的两个端点？
- 平行支撑边形成相等面积时怎样避免漏解？
