# 最小圆覆盖

> 最近修订：2026-08-23 09:28 +10:00（未审阅）

给定平面上的若干点，寻找半径最小、能够包含全部点的圆。这个问题也称最小包围圆，
可以描述“用一次圆形覆盖服务全部位置”“给点集寻找最紧的圆形边界”等模型。

最优圆不会凭空停在任意位置。若圆周上只有一个约束点，圆心还能向它移动并缩小；因此
除单点输入外，最优圆通常由：

- 两个点作为直径端点；或
- 三个不共线点的外接圆

唯一确定。

直接枚举所有二点圆、三点圆再检查全部点需要很高的多项式复杂度。随机增量算法利用
“只有落在当前圆外的点才会改变答案”，期望在线性时间内完成。

## 先随机打乱

把输入点随机排列，再依次加入。维护当前已处理点的最小覆盖圆 `answer`。

若新点 $P_i$ 已在 `answer` 内，原圆仍覆盖全部已处理点，而且此前已经最小，所以答案
不变。

若 $P_i$ 在圆外，任何覆盖前缀的新答案都必须扩大，并且新的最优圆可以选择让 $P_i$
落在边界上。于是把问题变成：

> 求覆盖前 `i` 个点、并要求 $P_i$ 位于圆周上的最小圆。

随机顺序使“新点落在当前最小圆外”成为低概率事件，这是期望线性复杂度的来源。

## 固定一个边界点

发现 $P_i$ 在圆外时，先把圆重置为以它为圆心、半径 `0` 的圆：

```cpp
answer = {point[i], 0};
```

重新扫描所有更早点 $P_j$。若 $P_j$ 已在圆内，不需要改变。若它在圆外，新的最优圆
必须同时让 $P_i,P_j$ 位于边界。

只固定两个边界点时，最小圆就是以线段 $P_iP_j$ 为直径的圆：

$$
center=\frac{P_i+P_j}{2},
\qquad
radius=\frac{|P_i-P_j|}{2}.
$$

## 固定两个边界点

用二点圆重新扫描更早的 $P_k$。若某个 $P_k$ 仍在圆外，要求三个点都位于新圆边界。

三个不共线点唯一确定一个外接圆。圆心到三点距离相同，联立：

$$
|O-A|^2=|O-B|^2,
$$

$$
|O-A|^2=|O-C|^2
$$

后，平方项抵消，得到关于圆心坐标的两个一次方程。解得：

$$
D=2\bigl[
A_x(B_y-C_y)+
B_x(C_y-A_y)+
C_x(A_y-B_y)
\bigr],
$$

$$
O_x=\frac{
|A|^2(B_y-C_y)+
|B|^2(C_y-A_y)+
|C|^2(A_y-B_y)
}{D},
$$

$$
O_y=\frac{
|A|^2(C_x-B_x)+
|B|^2(A_x-C_x)+
|C|^2(B_x-A_x)
}{D}.
$$

分母 $D$ 是三点叉积的两倍，三点共线时为 `0`。

## 三点共线怎样处理

共线三点没有唯一外接圆，但覆盖它们的最小圆非常明确：取距离最远的一对作为直径。

```cpp
Circle circle_from_collinear(Point a, Point b, Point c) {
    double ab = distance_squared(a, b);
    double ac = distance_squared(a, c);
    double bc = distance_squared(b, c);

    if (ab >= ac && ab >= bc) {
        return circle_from_two(a, b);
    }
    if (ac >= ab && ac >= bc) {
        return circle_from_two(a, c);
    }
    return circle_from_two(b, c);
}
```

完整代码直接比较三对距离，并调用对应的二点圆函数。这样重复点、全部共线点也能统一
处理，不会除以接近 `0` 的行列式。

## 为什么三层重扫仍然很快

代码形式有三重循环，但随机顺序下：

- 第 `i` 个点成为当前圆外点的概率与最小圆边界点数量有关，数量至多为 `3`；
- 进入第二层重构的次数很少；
- 同理，第三个边界点出现的概率继续降低。

随机增量算法的期望时间复杂度为 $O(n)$。若输入顺序被刻意构造且不打乱，三层循环
最坏可达到 $O(n^3)$，所以 `shuffle` 是算法的一部分，不是装饰。

## 完整代码

输入若干平面点，输出最小覆盖圆的圆心和半径。点可以重复或全部共线。

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

Point operator/(Point a, double k) {
    return {a.x / k, a.y / k};
}

double cross(Point a, Point b) {
    return a.x * b.y - a.y * b.x;
}

double distance_squared(Point a, Point b) {
    double dx = a.x - b.x;
    double dy = a.y - b.y;
    return dx * dx + dy * dy;
}

double distance(Point a, Point b) {
    return sqrt(distance_squared(a, b));
}

struct Circle {
    Point center;
    double radius;
};

bool contains(Circle circle, Point p) {
    return distance(circle.center, p) <= circle.radius + EPS;
}

Circle circle_from_two(Point a, Point b) {
    Point center = (a + b) / 2;
    return {center, distance(a, b) / 2};
}

Circle circle_from_three(Point a, Point b, Point c) {
    double denominator = 2 * cross(b - a, c - a);

    if (abs(denominator) <= EPS) {
        double ab = distance_squared(a, b);
        double ac = distance_squared(a, c);
        double bc = distance_squared(b, c);

        if (ab >= ac && ab >= bc) {
            return circle_from_two(a, b);
        }
        if (ac >= ab && ac >= bc) {
            return circle_from_two(a, c);
        }
        return circle_from_two(b, c);
    }

    double a_norm = a.x * a.x + a.y * a.y;
    double b_norm = b.x * b.x + b.y * b.y;
    double c_norm = c.x * c.x + c.y * c.y;

    Point center;
    center.x =
        (a_norm * (b.y - c.y) + b_norm * (c.y - a.y) + c_norm * (a.y - b.y)) /
        denominator;
    center.y =
        (a_norm * (c.x - b.x) + b_norm * (a.x - c.x) + c_norm * (b.x - a.x)) /
        denominator;

    return {center, distance(center, a)};
}

Circle minimum_enclosing_circle(vector<Point> point) {
    mt19937 random_engine(
        chrono::steady_clock::now().time_since_epoch().count());
    shuffle(point.begin(), point.end(), random_engine);

    Circle answer = {{0, 0}, -1};

    for (int i = 0; i < (int)point.size(); ++i) {
        if (answer.radius >= 0 && contains(answer, point[i])) {
            continue;
        }

        answer = {point[i], 0};

        for (int j = 0; j < i; ++j) {
            if (contains(answer, point[j])) {
                continue;
            }

            answer = circle_from_two(point[i], point[j]);

            for (int k = 0; k < j; ++k) {
                if (contains(answer, point[k])) {
                    continue;
                }

                answer = circle_from_three(point[i], point[j], point[k]);
            }
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

    Circle answer = minimum_enclosing_circle(point);

    cout << fixed << setprecision(10);
    cout << answer.center.x << ' ' << answer.center.y << '\n';
    cout << answer.radius << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

完整程序假设 `n >= 1`。若题目允许空点集，需要由题目另外定义空集的“最小圆”，
因为它没有唯一圆心。

## 正确性

外层循环开始时，`answer` 是已处理前缀的最小覆盖圆。若新点在圆内，答案显然不变；
若在圆外，新的最小圆必可取为让该点位于边界，于是第一层重扫只需考虑固定这个边界点
的圆。

在第一层中，若更早点仍在圆外，同理可把它固定为第二个边界点，二点圆是只约束这两点
时的最小圆。第三层遇到圆外点后，三个边界点唯一确定外接圆；共线时则由最远点对确定
最小直径圆。每次内层重构都覆盖当前已扫描前缀。由三层循环归纳，外层结束时圆覆盖
全部点且在所有可能边界约束下最小，因此得到全局最小覆盖圆。

## 复杂度

- 随机打乱：$O(n)$；
- 随机增量的期望时间复杂度：$O(n)$；
- 固定不利顺序下的最坏时间复杂度：$O(n^3)$；
- 保存打乱后的点：$O(n)$ 空间；
- 除输入副本外只使用常数额外空间。

## 常见错误

- 没有随机打乱，三层重扫被不利输入拖慢；
- 误以为最优圆一定由三个点确定，漏掉直径二点圆；
- 三点共线时仍除以行列式；
- 圆内判断不允许 `EPS`，把理论边界点误判到圆外；
- 每次发现圆外点都重新枚举全部三点圆，失去增量结构；
- 输入含重复点时产生零向量或错误外接圆；
- 把随机算法理解成近似算法；它的运行路径随机，但返回的是精确最优结构的浮点计算值。

## 需要记住什么

- 最小覆盖圆为什么由至多三个边界点确定？
- 新点落在当前圆外时，为什么可以把它固定在新圆边界上？
- 固定两个边界点时，为什么先从直径圆开始？
- 三点共线时应该怎样构造最小覆盖圆？
- `shuffle` 为什么影响复杂度而不影响答案正确性？
