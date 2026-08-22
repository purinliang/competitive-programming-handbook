# 线段树套线段树

> 最近修订：2026-08-23 05:20 +10:00（未审阅）

维护一个初始全为 $0$ 的 $n\times n$ 网格，支持：

- 给一个点 $(x,y)$ 增加权值；
- 查询矩形 $[x_1,x_2]\times[y_1,y_2]$ 内的权值和。

二维前缀和能在 $O(1)$ 查询静态网格，却不能高效处理在线修改。若为每个 $x$
建立一棵关于 $y$ 的线段树，矩形查询需要遍历 $x_1$ 到 $x_2$，最坏仍是
$O(n\log n)$。

线段树套线段树把两个坐标分别交给两层线段树：外层划分 $x$，内层划分 $y$。

## 外层区间保存什么

外层线段树的每个节点代表一段 $x$ 区间。这个节点挂一棵内层线段树，维护：

> 所有横坐标落在当前外层区间内的点，按照纵坐标 $y$ 汇总后的权值。

例如外层节点代表 $x\in[1,4]$，那么它的内层线段树在位置 $y=3$ 保存所有
$(1,3)$、$(2,3)$、$(3,3)$、$(4,3)$ 的权值和。

点 $(x,y)$ 增加 `value` 时，它属于外层从根到叶的一条路径。沿这条路径的每个
外层节点都要在自己的内层线段树位置 `y` 增加 `value`。

## 矩形查询

查询 $x\in[x_1,x_2]$ 时，外层线段树把这个区间分解成 $O(\log n)$ 个互不相交
的节点区间。

对每个完整覆盖的外层节点，在它的内层线段树中查询 $y\in[y_1,y_2]$。这些外层
区间互不重叠，答案相加后恰好覆盖整个矩形：

```cpp
if (ql <= l && r <= qr) {
    return query_inner(root[u], 1, n, y1, y2);
}
```

外层访问 $O(\log n)$ 个节点，每次内层查询耗时 $O(\log n)$，所以矩形查询为
$O(\log^2 n)$。

## 为什么不能建立完整内层树

外层线段树有 $O(n)$ 个节点。若每个外层节点都建立一棵含 $O(n)$ 个节点的完整
内层线段树，总空间会达到 $O(n^2)$。

初始网格全为 $0$，只有被修改过的位置需要真实节点。本文让每棵内层线段树动态
开点：

- 节点编号 `0` 表示整段仍然全为 $0$；
- 更新访问到空节点时才建立节点；
- 查询访问到 `0` 时直接返回 $0$。

一次点修改经过 $O(\log n)$ 个外层节点；每个外层节点的内层线段树又新建至多
$O(\log n)$ 个节点，因此一次修改最多增加 $O(\log^2 n)$ 个内层节点。

## 内层动态线段树

内层节点保存区间和与左右儿子编号：

```cpp
struct InnerNode {
    ll sum;
    int left;
    int right;
};
```

更新函数接收旧根编号并返回更新后的根编号：

```cpp
int update_inner(int u, int l, int r, int pos, ll value) {
    if (u == 0) {
        u = new_inner_node();
    }

    if (l == r) {
        inner[u].sum += value;
        return u;
    }
```

这里不把 `inner[u].left` 以引用传入递归。`new_inner_node()` 会向 `vector`
追加元素并可能触发扩容；扩容后，指向某个 `Node` 成员的引用会失效。通过返回整数
编号再赋值，可以完全避开这个问题。

## 外层点修改

外层节点 `u` 的内层根保存在 `root[u]`。无论当前外层区间是否已经到达叶子，
当前节点都代表一个包含点 $x$ 的区间，因此先更新它的内层树：

```cpp
root[u] = update_inner(root[u], 1, n, y, value);
```

随后只进入包含 `x` 的一个外层儿子：

```cpp
if (x <= mid) {
    update_outer(u * 2, l, mid, x, y, value);
} else {
    update_outer(u * 2 + 1, mid + 1, r, x, y, value);
}
```

外层线段树本身只负责定位横坐标，不需要另外保存区间和；矩形的纵向统计全部位于
各节点挂载的内层树中。

## 完整代码

下面维护一个初始全为 $0$ 的正方形网格。操作格式为：

- `1 x y value`：点 $(x,y)$ 增加 `value`；
- `2 x1 y1 x2 y2`：查询闭矩形的权值和。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct SegmentTreeOfSegmentTrees {
    struct InnerNode {
        ll sum;
        int left;
        int right;
    };

    int n;
    vector<int> root;
    vector<InnerNode> inner;

    void init(int size) {
        n = size;
        root.assign(n * 4 + 5, 0);
        inner.clear();
        inner.push_back({0, 0, 0});
    }

    int new_inner_node() {
        inner.push_back({0, 0, 0});
        return (int)inner.size() - 1;
    }

    void pull_inner(int u) {
        inner[u].sum =
            inner[inner[u].left].sum + inner[inner[u].right].sum;
    }

    int update_inner(int u, int l, int r, int pos, ll value) {
        if (u == 0) {
            u = new_inner_node();
        }

        if (l == r) {
            inner[u].sum += value;
            return u;
        }

        int mid = (l + r) / 2;
        if (pos <= mid) {
            inner[u].left =
                update_inner(inner[u].left, l, mid, pos, value);
        } else {
            inner[u].right =
                update_inner(inner[u].right, mid + 1, r, pos, value);
        }
        pull_inner(u);
        return u;
    }

    ll query_inner(int u, int l, int r, int ql, int qr) const {
        if (u == 0) {
            return 0;
        }
        if (ql <= l && r <= qr) {
            return inner[u].sum;
        }

        int mid = (l + r) / 2;
        ll sum = 0;

        if (ql <= mid) {
            sum += query_inner(inner[u].left, l, mid, ql, qr);
        }
        if (qr > mid) {
            sum += query_inner(inner[u].right, mid + 1, r, ql, qr);
        }
        return sum;
    }

    void add(int u, int l, int r, int x, int y, ll value) {
        root[u] = update_inner(root[u], 1, n, y, value);

        if (l == r) {
            return;
        }

        int mid = (l + r) / 2;
        if (x <= mid) {
            add(u * 2, l, mid, x, y, value);
        } else {
            add(u * 2 + 1, mid + 1, r, x, y, value);
        }
    }

    void add(int x, int y, ll value) {
        add(1, 1, n, x, y, value);
    }

    ll rectangle_sum(
        int u,
        int l,
        int r,
        int ql,
        int qr,
        int y1,
        int y2) const {
        if (ql <= l && r <= qr) {
            return query_inner(root[u], 1, n, y1, y2);
        }

        int mid = (l + r) / 2;
        ll sum = 0;

        if (ql <= mid) {
            sum += rectangle_sum(u * 2, l, mid, ql, qr, y1, y2);
        }
        if (qr > mid) {
            sum +=
                rectangle_sum(u * 2 + 1, mid + 1, r, ql, qr, y1, y2);
        }
        return sum;
    }

    ll rectangle_sum(int x1, int y1, int x2, int y2) const {
        return rectangle_sum(1, 1, n, x1, x2, y1, y2);
    }
};

int n, q;
SegmentTreeOfSegmentTrees segment;

void solve() {
    cin >> n >> q;
    segment.init(n);

    while (q--) {
        int operation;
        cin >> operation;

        if (operation == 1) {
            int x, y;
            ll value;
            cin >> x >> y >> value;
            segment.add(x, y, value);
        } else {
            int x1, y1, x2, y2;
            cin >> x1 >> y1 >> x2 >> y2;
            cout << segment.rectangle_sum(x1, y1, x2, y2) << '\n';
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

设共有 $m$ 次点修改：

- 单次点修改：$O(\log^2 n)$ 时间，新增 $O(\log^2 n)$ 个内层节点；
- 单次矩形查询：$O(\log^2 n)$ 时间；
- 外层根数组：$O(n)$ 空间；
- 内层节点池：$O(m\log^2 n)$ 空间。

树套树的渐进复杂度很好，但空间常数很大。若一个维度只需前缀操作，可以考虑树状
数组套动态线段树；若所有操作能够离线得到，还可以对每个外层节点单独离散化它会
使用的纵坐标，减少动态节点数量。

## 常见错误

- 为每个外层节点建立完整内层树，空间退化为 $O(n^2)$；
- 点修改只更新外层叶子，没有更新它到根路径上的内层树；
- 矩形查询得到完整覆盖的外层节点后，仍继续递归它的儿子，造成重复统计；
- 动态内层节点 `u == 0` 时没有直接返回 $0$；
- 把 `vector` 元素成员的引用跨越 `push_back` 保留下来，扩容后引用失效；
- 内层树按横坐标更新，外层树又按横坐标划分，遗漏纵坐标；
- 忘记单次修改会增加 $O(\log^2 n)$ 个节点，低估内存。

## 需要记住什么

- 外层节点挂载的内层线段树具体汇总哪些点？
- 点 $(x,y)$ 为什么要修改 $O(\log n)$ 棵内层线段树？
- 矩形查询怎样分解成若干次内层区间查询？
- 为什么完整建立所有内层树会需要 $O(n^2)$ 空间？
- 动态开点怎样把空间降到与实际修改次数有关？
- 为什么内层更新函数返回节点编号比传递 `vector` 成员引用更安全？
