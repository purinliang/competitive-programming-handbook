# 平面点定位

> 最近修订：2026-08-23 09:11 +10:00（未审阅）

点在一个简单多边形内部还是外部，只涉及一条边界。更一般的平面点定位会先用许多互不
穿过的线段划分平面，再询问一个点落在哪个区域。

这类问题的核心查询是**竖直射线查询**：从查询点向下发出射线，寻找首先碰到的线段。
若每条线段已经记录其上方、下方分别属于哪个面，找到这条线段后就能返回所在面；若
下方没有线段，查询点位于无界区域。

本文解决离线版本：

- 给定若干条非竖直线段，线段之间不规范相交，也不重叠；
- 给定全部查询点，查询横坐标不等于任何线段端点横坐标；
- 查询点不在线段上；
- 对每个查询，输出正下方第一条线段的输入编号，不存在则输出 `0`。

端点可以相接，但线段内部不能交叉。若要输出面编号，只需把最终线段编号替换为该线段
上方一侧的面编号。

## 为什么不能把所有线段只按一个位置排序

线段的纵坐标随横坐标改变。即使两条线段不相交，在 $x=0$ 时的高度与查询
$x=100$ 时的高度也不同；必须在查询横坐标处比较：

$$
y(x)=y_1+
\frac{x-x_1}{x_2-x_1}(y_2-y_1).
$$

但不相交给出一个关键不变量：在两条线段共同覆盖的横坐标区间内，它们的上下顺序不会
改变。若顺序改变，根据连续性它们之间必有交点。

## 只关心出现过查询的横坐标

把所有不同查询横坐标排序：

$$
X_1<X_2<\cdots<X_m.
$$

一条线段横坐标范围为 $(left,right)$。只需把它登记到满足：

$$
left<X_k<right
$$

的查询位置。没有查询的横坐标不需要建立结构。

对 $X_1,\ldots,X_m$ 建立线段树。一条线段覆盖一段连续下标区间，把它分解到
$O(\log m)$ 个线段树节点。每个节点保存“完整覆盖该节点全部横坐标”的线段。

## 节点内为什么可以固定排序一次

假设线段被存入表示区间 $[l,r]$ 的节点，它一定覆盖从 $X_l$ 到 $X_r$ 的全部查询横
坐标。

节点内任意两条线段在整个区间都有定义，又不会相交，所以它们的上下顺序处处相同。
因此可以任选节点中的一个查询横坐标，例如 $X_l$，把线段按高度排序一次：

```cpp
sort(bucket[u].begin(), bucket[u].end(), [l](int first, int second) {
    double first_y = y_at(segment[first], coordinate[l]);
    double second_y = y_at(segment[second], coordinate[l]);

    if (abs(first_y - second_y) > EPS) {
        return first_y < second_y;
    }
    return first < second;
});
```

到了另一个查询横坐标，具体高度会变化，但排序后的先后关系不会变化。

## 查询经过哪些节点

横坐标 $X_k$ 对应线段树中的一个叶子。从根走到这个叶子的路径上，每个节点都可能
保存跨过 $X_k$ 的线段。

每个节点的线段已经按从低到高排列。在查询横坐标处二分寻找最后一条满足：

$$
y_{segment}(X_k)<query.y
$$

的线段，它就是该节点中位于查询点下方的最高候选。

把根到叶子所有候选再比较一次高度，最高者就是整组线段中竖直射线首先碰到的线段。

## 为什么不用可变比较器的 `set`

另一种常见写法是横向扫描平面，把当前横坐标保存在全局变量中，让 `set` 比较器按
`y(current_x)` 排序。

这种写法只有在能严格证明所有已存元素相对顺序永不改变时才不会破坏平衡树不变量；
端点、共线、相交和事件同横坐标都会让实现非常脆弱。本文的静态线段树把每个节点的
排序固定下来，不在容器存活期间改变比较规则，代价是把复杂度提高到
$O(\log^2 n)$，但接口更可靠。

## 完整代码

输入 `n` 条线段和 `q` 个查询点。线段按输入顺序编号为 `1..n`，逐行输出查询点
正下方第一条线段编号；不存在输出 `0`。

```cpp
#include <bits/stdc++.h>
using namespace std;

const double EPS = 1e-9;

struct Point {
    double x;
    double y;
};

struct Segment {
    Point left;
    Point right;
};

double y_at(const Segment& segment, double x) {
    double ratio = (x - segment.left.x) / (segment.right.x - segment.left.x);
    return segment.left.y + (segment.right.y - segment.left.y) * ratio;
}

int n;
int q;
int coordinate_count;
vector<Segment> segment;
vector<Point> query_point;
vector<double> coordinate;
vector<vector<int>> bucket;

void add_segment(int u, int l, int r, int query_left, int query_right,
                 int segment_id) {
    if (query_left <= l && r <= query_right) {
        bucket[u].push_back(segment_id);
        return;
    }

    int middle = (l + r) / 2;

    if (query_left <= middle) {
        add_segment(u * 2, l, middle, query_left, query_right, segment_id);
    }
    if (query_right > middle) {
        add_segment(u * 2 + 1, middle + 1, r, query_left, query_right,
                    segment_id);
    }
}

void sort_bucket(int u, int l, int r) {
    double x = coordinate[l];

    sort(bucket[u].begin(), bucket[u].end(), [x](int first, int second) {
        double first_y = y_at(segment[first], x);
        double second_y = y_at(segment[second], x);

        if (abs(first_y - second_y) > EPS) {
            return first_y < second_y;
        }
        return first < second;
    });

    if (l == r) {
        return;
    }

    int middle = (l + r) / 2;
    sort_bucket(u * 2, l, middle);
    sort_bucket(u * 2 + 1, middle + 1, r);
}

int best_in_bucket(int u, Point query) {
    int left = 0;
    int right = bucket[u].size();

    while (left < right) {
        int middle = (left + right) / 2;
        double y = y_at(segment[bucket[u][middle]], query.x);

        if (y < query.y - EPS) {
            left = middle + 1;
        } else {
            right = middle;
        }
    }

    if (left == 0) {
        return 0;
    }
    return bucket[u][left - 1];
}

void update_answer(int candidate, Point query, int& answer) {
    if (candidate == 0) {
        return;
    }
    if (answer == 0 ||
        y_at(segment[candidate], query.x) > y_at(segment[answer], query.x)) {
        answer = candidate;
    }
}

int locate(int u, int l, int r, int position, Point query) {
    int answer = best_in_bucket(u, query);

    if (l == r) {
        return answer;
    }

    int middle = (l + r) / 2;
    int child_answer;

    if (position <= middle) {
        child_answer = locate(u * 2, l, middle, position, query);
    } else {
        child_answer = locate(u * 2 + 1, middle + 1, r, position, query);
    }

    update_answer(child_answer, query, answer);
    return answer;
}

void solve() {
    cin >> n >> q;

    segment.assign(n + 5, {});
    query_point.assign(q + 5, {});

    for (int i = 1; i <= n; ++i) {
        Point first, second;
        cin >> first.x >> first.y >> second.x >> second.y;

        if (first.x > second.x) {
            swap(first, second);
        }
        segment[i] = {first, second};
    }

    vector<double> all_x;
    for (int i = 1; i <= q; ++i) {
        cin >> query_point[i].x >> query_point[i].y;
        all_x.push_back(query_point[i].x);
    }

    sort(all_x.begin(), all_x.end());
    all_x.erase(unique(all_x.begin(), all_x.end()), all_x.end());

    coordinate_count = all_x.size();
    coordinate.assign(coordinate_count + 5, 0);
    for (int i = 1; i <= coordinate_count; ++i) {
        coordinate[i] = all_x[i - 1];
    }

    bucket.assign(4 * coordinate_count + 20, {});

    for (int id = 1; id <= n; ++id) {
        int left = upper_bound(coordinate.begin() + 1,
                               coordinate.begin() + coordinate_count + 1,
                               segment[id].left.x) -
                   coordinate.begin();
        int right = lower_bound(coordinate.begin() + 1,
                                coordinate.begin() + coordinate_count + 1,
                                segment[id].right.x) -
                    coordinate.begin() - 1;

        if (left <= right) {
            add_segment(1, 1, coordinate_count, left, right, id);
        }
    }

    sort_bucket(1, 1, coordinate_count);

    for (int i = 1; i <= q; ++i) {
        int position = lower_bound(coordinate.begin() + 1,
                                   coordinate.begin() + coordinate_count + 1,
                                   query_point[i].x) -
                       coordinate.begin();

        cout << locate(1, 1, coordinate_count, position, query_point[i])
             << '\n';
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

`all_x` 是调用 `sort`、`unique` 的临时 STL 序列，使用其原生 0-based 下标；进入
线段树后，压缩横坐标、线段编号和查询编号全部改为 1-based。

完整代码假设至少有一个查询。若题目允许 `q=0`，直接读完输入并结束即可，不需要建立
空线段树。

## 正确性

每条线段被加入恰好覆盖其有效查询横坐标区间的 $O(\log m)$ 个线段树节点。任意查询
横坐标对应根到叶子路径；覆盖该横坐标的每条线段恰好存于这条路径上的一个节点。

同一节点内线段在节点全部横坐标范围上共存且不相交，所以上下顺序不变。节点中的二分
正确找到该节点内查询点下方最高线段。比较根到叶子所有节点候选后，得到所有横跨查询
位置的线段中纵坐标最大的下方线段，也就是向下射线首先碰到的线段。

## 复杂度

设不同查询横坐标数量为 `m`：

- 每条线段加入 $O(\log m)$ 个节点；
- 节点列表排序总计 $O(n\log m\log n)$；
- 每次查询访问 $O(\log m)$ 个节点，每个节点二分 $O(\log n)$；
- 单次查询 $O(\log m\log n)$；
- 空间复杂度 $O(n\log m+q)$。

通常可以统一写成 $O((n+q)\log^2(n+q))$ 时间与 $O(n\log q+q)$ 空间。

## 常见错误

- 把这篇的一般平面定位与“点是否在一个多边形内”混为同一问题；
- 忘记排除竖直线段，仍用 $x$ 插值纵坐标；
- 线段会规范相交，却仍假设节点内上下顺序固定；
- 查询横坐标恰好等于端点，却没有定义端点事件归属；
- 查询点在线段上，却没有定义返回该线段还是相邻面；
- 一条线段被重复存到根到叶子的多个重叠节点，导致空间失控；
- 用不断变化的全局横坐标作为 `set` 比较器，却没有证明存量元素顺序不变；
- 找到正上方线段而不是正下方线段。

## 需要记住什么

- 平面点定位为什么可以转化为竖直射线查询？
- 不相交怎样保证线段的上下顺序在公共横坐标区间内不变？
- 一条线段为什么只需存入 $O(\log m)$ 个节点？
- 查询时为什么只需检查根到对应叶子的路径？
- 静态节点排序相较可变 `set` 比较器避免了什么风险？

