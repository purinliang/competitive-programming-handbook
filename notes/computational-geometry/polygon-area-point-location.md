# 多边形面积与点的位置

> 最近修订：2026-08-17 07:39 +10:00（未审阅）

多边形由按边界顺序排列的顶点：

$$
P_1,P_2,\ldots,P_n
$$

组成，并默认还有闭合边 $P_nP_1$。顶点集合相同但顺序不同，连接出的多边形
可能完全不同，因此输入顺序是图形定义的一部分。

本篇处理简单多边形：

- 边只在相邻端点处相交，不自交；
- 顶点可以顺时针或逆时针给出；
- 查询点可能在内部、外部或边界上。

## 有向边与闭合

按顺序枚举每条有向边：

```text
P[1] -> P[2]
P[2] -> P[3]
...
P[n] -> P[1]
```

为了避免每次对下标取模，可以额外复制：

```cpp
polygon[n + 1] = polygon[1];
```

此后所有边统一写成 `polygon[i] -> polygon[i+1]`，其中 `1 <= i <= n`。

## 鞋带公式

相邻顶点的叉积：

$$
P_i\times P_{i+1}
=x_i y_{i+1}-y_i x_{i+1}.
$$

全部相加得到多边形的**有向两倍面积**：

$$
2S_{\mathrm{signed}}
=\sum_{i=1}^{n}P_i\times P_{i+1}.
$$

这称为鞋带公式。展开时正负乘积像交叉系鞋带一样排列。

```cpp
ll signed_twice_area() {
    ll sum = 0;

    for (int i = 1; i <= n; i++) {
        sum += cross(polygon[i], polygon[i + 1]);
    }
    return sum;
}
```

- 逆时针顶点顺序通常得到正值；
- 顺时针顺序得到负值；
- 实际面积是绝对值的一半。

保存两倍面积能让整数坐标的计算始终保持整数。最终为奇数时，真实面积带
`.5`。

## 为什么有向面积可以相加

每条边与原点形成一个有向三角形，其两倍面积是 `cross(P[i],P[i+1])`。边界
按顺序绕行时，多边形内部区域保留下来，原点到边界之间多余区域会因相反方向
互相抵消。

因此原点不必位于多边形内部。符号记录绕行方向，绝对值给出普通面积。

## 点的位置有三种

查询点 `p` 可能：

```text
Boundary  位于某条边或顶点上
Inside    严格位于内部
Outside   严格位于外部
```

边界必须先单独检查。若把边界点直接交给射线计数，顶点和水平边处的结果会依赖
实现细节。

```cpp
for (int i = 1; i <= n; i++) {
    if (on_segment(
            polygon[i],
            polygon[i + 1],
            p)) {
        return BOUNDARY;
    }
}
```

## 从查询点发出射线

从 `p` 向右发出一条水平射线。直观上：

- 从外部开始；
- 每穿过一次多边形边界，内部/外部状态切换；
- 交点数为奇数则在内部，偶数则在外部。

但射线恰好经过顶点时，相邻两条边可能把同一个交点算两次。使用半开规则：

- 向上跨过查询高度时，包含较低端，不包含较高端；
- 向下跨过时采用对应的相反半开条件；
- 水平边不作为跨越计数，边界已提前处理。

## 环绕数写法

维护 `winding`。对有向边 `a -> b`：

### 向上跨越

```cpp
if (a.y <= p.y && b.y > p.y &&
    orientation(a, b, p) > 0) {
    winding++;
}
```

边从查询高度下方或同高处走到严格上方，并且查询点位于有向边左侧，说明向上的
边在查询点右侧有效穿过射线。

### 向下跨越

```cpp
if (a.y > p.y && b.y <= p.y &&
    orientation(a, b, p) < 0) {
    winding--;
}
```

向下穿过时方向相反，环绕数减一。

全部边处理后：

```cpp
if (winding == 0) {
    return OUTSIDE;
}
return INSIDE;
```

对简单多边形，非零环绕数表示内部。顶点顺时针或逆时针只会改变环绕数符号，
不会改变它是否为零。

## 完整代码

输入一个整数坐标简单多边形，再回答多个整数点的位置。程序先输出面积，再逐行
输出 `Boundary`、`Inside` 或 `Outside`。保证所有叉积与面积累加在 64 位
整数范围内。

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

    return min(a.x, b.x) <= p.x &&
           p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y &&
           p.y <= max(a.y, b.y);
}

int n;
vector<Point> polygon;

ll signed_twice_area() {
    ll sum = 0;

    for (int i = 1; i <= n; i++) {
        sum += cross(polygon[i], polygon[i + 1]);
    }
    return sum;
}

int point_position(Point p) {
    int winding = 0;

    for (int i = 1; i <= n; i++) {
        Point a = polygon[i];
        Point b = polygon[i + 1];

        if (on_segment(a, b, p)) {
            return BOUNDARY;
        }

        if (a.y <= p.y && b.y > p.y &&
            orientation(a, b, p) > 0) {
            winding++;
        }

        if (a.y > p.y && b.y <= p.y &&
            orientation(a, b, p) < 0) {
            winding--;
        }
    }

    if (winding == 0) {
        return OUTSIDE;
    }
    return INSIDE;
}

void solve() {
    int q;
    cin >> n >> q;

    polygon.assign(n + 2, {});

    for (int i = 1; i <= n; i++) {
        cin >> polygon[i].x >> polygon[i].y;
    }
    polygon[n + 1] = polygon[1];

    ll twice_area = abs(signed_twice_area());
    cout << twice_area / 2;

    if (twice_area % 2 == 0) {
        cout << ".0\n";
    } else {
        cout << ".5\n";
    }

    while (q--) {
        Point p;
        cin >> p.x >> p.y;

        int position = point_position(p);

        if (position == BOUNDARY) {
            cout << "Boundary\n";
        } else if (position == INSIDE) {
            cout << "Inside\n";
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

## 复杂度

- 面积计算：$O(n)$；
- 每个点位置查询：$O(n)$；
- $q$ 个查询总时间：$O(nq)$；
- 额外空间复杂度：$O(n)$。

凸多边形可以把点包含查询优化到 $O(\log n)$，但需要利用凸性，不属于本篇任意
简单多边形的基础算法。

## 常见错误

- 忘记最后一条边 `P[n] -> P[1]`；
- 顶点没有按边界顺序给出，却仍直接套鞋带公式；
- 面积忘记取绝对值，顺时针输入得到负数；
- 过早除以 `2`，丢失半整数面积；
- 点位置判断没有先检查边界；
- 射线经过顶点时把相邻两条边重复计数；
- 把水平边当作普通上下穿越；
- 假设点查询函数只适用于逆时针顶点，忽略环绕数只需判断非零。

## 需要记住什么

- 为什么多边形顶点顺序属于图形定义？
- 鞋带公式为什么得到有向两倍面积？
- 为什么边界点必须在射线计数前单独判断？
- 上下穿越的半开条件怎样避免重复计算顶点？
- 环绕数为什么只需判断是否为零？

