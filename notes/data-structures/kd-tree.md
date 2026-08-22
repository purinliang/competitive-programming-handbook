# KD 树

> 最近修订：2026-08-23 05:00 +10:00（未审阅）

平面上有很多个点，每次给出一个查询点，要求找到离它最近的已有点。逐个计算距离
需要 $O(n)$，大量查询时会反复检查明显很远的点。

一维有序数组可以用二分排除一半候选点。KD 树把类似思路推广到多维空间：每层选
一个坐标轴，用中位数把点集分成两半；查询时先走更可能接近答案的一侧，再用另一侧
点集的包围盒判断它是否仍有可能改进答案。

本文以二维最近点查询为例。距离统一使用欧几里得距离的平方，避免没有必要的开方和
浮点误差。

## 按坐标轴分割点集

当前点集若按横坐标分割，就选择横坐标中位数作为根：

- 横坐标较小的点进入左子树；
- 横坐标较大的点进入右子树；
- 下一层改按纵坐标分割。

之后交替使用横坐标和纵坐标。用 `nth_element` 可以在平均 $O(n)$ 时间内把中位数
放到正确位置，而不必完整排序当前区间。

```cpp
int mid = (l + r) / 2;
nth_element(point.begin() + l, point.begin() + mid, point.begin() + r + 1,
            Compare{dimension});
```

KD 树并不保证某个坐标全局有序。它只保证每个节点按当前分割维度把自己的点集分成
两部分。

## 子树包围盒

只知道分割线还不足以有效剪枝。每个节点额外维护整棵子树中：

- 最小和最大横坐标；
- 最小和最大纵坐标。

这四个值组成一个轴对齐矩形，也就是子树所有点的包围盒。

查询点到包围盒的最小距离可以逐维计算。若查询坐标位于区间内部，这一维距离为
$0$；若在区间左边或右边，距离就是它到最近端点的差：

```cpp
ll box_distance(int u, const Point& target) {
    ll answer = 0;

    if (target.x < tree[u].min_x) {
        answer += square(tree[u].min_x - target.x);
    } else if (target.x > tree[u].max_x) {
        answer += square(target.x - tree[u].max_x);
    }

    if (target.y < tree[u].min_y) {
        answer += square(tree[u].min_y - target.y);
    } else if (target.y > tree[u].max_y) {
        answer += square(target.y - tree[u].max_y);
    }

    return answer;
}
```

这是查询点到这棵子树中任何点的距离下界。若下界已经不小于当前最优答案，整棵
子树都不可能给出更近的点。

## 先搜索更有希望的一侧

到达节点 `u` 时，先用当前点更新答案，再计算左右子树包围盒的距离下界：

```cpp
ll left_distance = box_distance(tree[u].left, target);
ll right_distance = box_distance(tree[u].right, target);
```

先递归下界较小的一侧，通常可以较早得到一个较好的答案。之后重新检查另一侧：只有
它的距离下界仍小于当前答案时才继续搜索。

先后顺序不影响正确性，但会显著影响剪枝效果。

## 正确性直觉

每个原始点恰好出现在 KD 树的一个节点中，因此不剪枝时查询一定会检查所有点。

一棵子树被剪掉的唯一条件是：查询点到其包围盒的最小距离已经不小于当前答案。
子树内每个点都位于包围盒中，它到查询点的距离不可能小于这个下界，所以被剪掉的
子树不可能包含更优答案。

## 完整代码

输入 $n$ 个已有点和 $q$ 个查询点。对每个查询输出它到最近已有点的欧几里得距离
平方。坐标和距离保证在 64 位整数范围内。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct Point {
    ll x;
    ll y;
};

struct KDTree {
    struct Node {
        Point point;
        ll min_x;
        ll max_x;
        ll min_y;
        ll max_y;
        int left;
        int right;
    };

    struct Compare {
        int dimension;

        bool operator()(const Point& a, const Point& b) const {
            if (dimension == 0) {
                return tie(a.x, a.y) < tie(b.x, b.y);
            }
            return tie(a.y, a.x) < tie(b.y, b.x);
        }
    };

    vector<Point> point;
    vector<Node> tree;
    int root;

    KDTree(const vector<Point>& value) {
        int n = value.size() - 1;
        point = value;
        tree.resize(n + 5);
        root = build(1, n, 0);
    }

    ll square(ll x) const {
        return x * x;
    }

    void pull(int u) {
        tree[u].min_x = tree[u].max_x = tree[u].point.x;
        tree[u].min_y = tree[u].max_y = tree[u].point.y;

        for (int v : {tree[u].left, tree[u].right}) {
            if (v == 0) {
                continue;
            }
            tree[u].min_x = min(tree[u].min_x, tree[v].min_x);
            tree[u].max_x = max(tree[u].max_x, tree[v].max_x);
            tree[u].min_y = min(tree[u].min_y, tree[v].min_y);
            tree[u].max_y = max(tree[u].max_y, tree[v].max_y);
        }
    }

    int build(int l, int r, int dimension) {
        if (l > r) {
            return 0;
        }

        int mid = (l + r) / 2;
        nth_element(point.begin() + l, point.begin() + mid,
                    point.begin() + r + 1, Compare{dimension});

        int u = mid;
        tree[u].point = point[mid];
        tree[u].left = build(l, mid - 1, dimension ^ 1);
        tree[u].right = build(mid + 1, r, dimension ^ 1);
        pull(u);
        return u;
    }

    ll point_distance(const Point& a, const Point& b) const {
        return square(a.x - b.x) + square(a.y - b.y);
    }

    ll box_distance(int u, const Point& target) const {
        if (u == 0) {
            return LLONG_MAX;
        }

        ll answer = 0;
        if (target.x < tree[u].min_x) {
            answer += square(tree[u].min_x - target.x);
        } else if (target.x > tree[u].max_x) {
            answer += square(target.x - tree[u].max_x);
        }

        if (target.y < tree[u].min_y) {
            answer += square(tree[u].min_y - target.y);
        } else if (target.y > tree[u].max_y) {
            answer += square(target.y - tree[u].max_y);
        }
        return answer;
    }

    void query(int u, const Point& target, ll& answer) const {
        if (u == 0) {
            return;
        }

        answer = min(answer, point_distance(tree[u].point, target));

        int first = tree[u].left;
        int second = tree[u].right;
        ll first_distance = box_distance(first, target);
        ll second_distance = box_distance(second, target);

        if (first_distance > second_distance) {
            swap(first, second);
            swap(first_distance, second_distance);
        }

        if (first_distance < answer) {
            query(first, target, answer);
        }
        if (second_distance < answer) {
            query(second, target, answer);
        }
    }

    ll nearest_distance(const Point& target) const {
        ll answer = LLONG_MAX;
        query(root, target, answer);
        return answer;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, q;
    cin >> n >> q;

    vector<Point> point(n + 5);
    for (int i = 1; i <= n; ++i) {
        cin >> point[i].x >> point[i].y;
    }

    KDTree kd_tree(point);

    while (q--) {
        Point target;
        cin >> target.x >> target.y;
        cout << kd_tree.nearest_distance(target) << '\n';
    }
    return 0;
}
```

## 复杂度

用 `nth_element` 建树的平均时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

最近点查询的平均复杂度通常接近 $O(\sqrt n)$，但它取决于点的分布与维度，最坏
情况仍可能退化到 $O(n)$。KD 树适合维度很低、点分布没有严重退化的空间查询；它
不是任意高维数据的稳定对数复杂度结构。

## 常见错误

- 用普通 `sort` 排序每个递归区间，把平均建树复杂度写成 $O(n\log n)$；
- 包围盒只包含当前点，没有把左右子树范围合并进来；
- 把点到包围盒中心的距离当成距离下界；
- 先搜索固定左子树，而不是先搜索下界较小的一侧，导致剪枝显著变差；
- 坐标差平方仍用 32 位整数保存；
- 查询已有点的最近其他点时，没有排除点本身。本文的查询点与已有点集相互独立，
  因而不需要排除自身。

## 需要记住什么

- KD 树每一层按什么规则分割点集？
- 为什么子树需要维护包围盒？
- 点到包围盒的最小距离怎样逐维计算？
- 为什么可以安全剪掉距离下界不小于当前答案的子树？
- 为什么先搜索下界较小的子树有助于剪枝？
- KD 树的查询为什么只有平均复杂度，而没有稳定的最坏对数复杂度？
