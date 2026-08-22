# 线段树套平衡树

> 最近修订：2026-08-23 05:40 +10:00（未审阅）

维护一个会单点修改的数组，支持查询闭区间 `[l,r]` 中：

- 一个值 `x` 的排名；
- 第 $k$ 小值；
- `x` 的严格前驱和严格后继。

一棵全局平衡树只能维护整个数组中的值，丢失了位置区间。普通线段树能把位置区间
拆开，却只保存和、最值等容易合并的信息，无法直接得到动态排名。

线段树套平衡树让外层线段树维护位置，给每个外层节点挂一棵平衡树，维护这个位置
区间内出现的所有值。

## 外层与内层的分工

外层节点 `u` 代表位置区间 `[l,r]`，它的内层 Treap 保存：

```text
a[l], a[l+1], ..., a[r]
```

查询 `[ql,qr]` 时，外层线段树把它分解成 $O(\log n)$ 个互不相交的完整节点。
于是“区间内严格小于 `x` 的元素数量”可以写成：

```text
这些完整节点的 Treap 中，严格小于 x 的元素数量之和
```

每棵 Treap 查询耗时 $O(\log n)$，外层访问 $O(\log n)$ 个节点，总时间为
$O(\log^2 n)$。

## 单点修改

位置 `pos` 的旧值是 `old_value`，新值是 `new_value`。这个位置属于外层从根到叶
的一条路径，路径上每棵内层 Treap 都要：

1. 删除一次 `old_value`；
2. 插入一次 `new_value`。

```cpp
root[u] = treap.erase(root[u], old_value);
root[u] = treap.insert(root[u], new_value);
```

每条外层路径有 $O(\log n)$ 个节点，每次 Treap 修改均摊 $O(\log n)$，因此单点
修改也是 $O(\log^2 n)$。

## 区间排名

本文定义 `x` 在区间中的排名为：

$$
1+\#\{i\in[l,r]\mid a_i<x\}.
$$

内层 Treap 保存子树元素数量，可以在均摊 $O(\log n)$ 内统计严格小于 `x` 的
元素数量。把外层完整节点的结果相加再加 $1$，就是区间排名。

## 区间第 k 小

已经能够计算：

$$
count(value)=\#\{i\in[l,r]\mid a_i\le value\}.
$$

随着 `value` 增加，`count(value)` 单调不减。第 $k$ 小值就是最小的、满足
`count(value) >= k` 的值，因此可以在 32 位整数值域上二分。

每次检查调用一次 $O(\log^2 n)$ 的区间计数，值域二分进行约 $32$ 次：

$$
O(\log V\log^2 n),
$$

其中 $V$ 是值域大小。若所有修改值能够提前读入并离散化，值域二分可以改为在不同
值的有序表上二分。

## 区间前驱与后继

对于外层分解得到的每棵 Treap：

- 查询其中小于 `x` 的最大键，取所有候选的最大值，得到区间严格前驱；
- 查询其中大于 `x` 的最小键，取所有候选的最小值，得到区间严格后继。

某棵 Treap 可能没有候选，因此返回 `pair<bool,int>`，不用可能与合法数组值冲突的
哨兵表示不存在。

## 共享节点池

每棵内层 Treap 有自己的根，但所有 Treap 可以从同一个节点池申请节点：

```cpp
vector<int> root;
Treap treap;
```

不同根之间不会共享 Treap 节点；节点池只是统一管理编号和内存。一个数组元素会被
插入外层根到叶路径上的 $O(\log n)$ 棵 Treap，所以初始结构需要
$O(n\log n)$ 个元素副本。

本文删除节点后不回收编号。若修改不断引入从未出现过的新值，节点池最坏会增加
$O(q\log n)$ 个节点；竞赛模板可以在内存成为瓶颈时加入空闲编号栈。

## 完整代码

下面支持五类操作：

1. 查询 `[l,r]` 中 `x` 的排名；
2. 查询 `[l,r]` 中第 `k` 小；
3. 把 `a[pos]` 修改为 `value`；
4. 查询 `[l,r]` 中 `x` 的严格前驱；
5. 查询 `[l,r]` 中 `x` 的严格后继。

输入保证第 $k$ 小、前驱和后继存在答案。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct TreapPool {
    struct Node {
        int key;
        uint32_t priority;
        int count;
        int size;
        int left;
        int right;
    };

    vector<Node> tree;
    mt19937 rng;

    TreapPool()
        : rng(chrono::steady_clock::now().time_since_epoch().count()) {}

    void init() {
        tree.clear();
        tree.push_back({0, 0, 0, 0, 0, 0});
    }

    int size(int u) const {
        return tree[u].size;
    }

    void pull(int u) {
        tree[u].size = size(tree[u].left) + size(tree[u].right) + tree[u].count;
    }

    int new_node(int key) {
        tree.push_back({key, (uint32_t)rng(), 1, 1, 0, 0});
        return (int)tree.size() - 1;
    }

    int rotate_left(int u) {
        int v = tree[u].right;
        tree[u].right = tree[v].left;
        tree[v].left = u;
        pull(u);
        pull(v);
        return v;
    }

    int rotate_right(int u) {
        int v = tree[u].left;
        tree[u].left = tree[v].right;
        tree[v].right = u;
        pull(u);
        pull(v);
        return v;
    }

    int insert(int u, int key) {
        if (u == 0) {
            return new_node(key);
        }

        if (key == tree[u].key) {
            tree[u].count++;
        } else if (key < tree[u].key) {
            tree[u].left = insert(tree[u].left, key);
            if (tree[tree[u].left].priority < tree[u].priority) {
                u = rotate_right(u);
            }
        } else {
            tree[u].right = insert(tree[u].right, key);
            if (tree[tree[u].right].priority < tree[u].priority) {
                u = rotate_left(u);
            }
        }

        pull(u);
        return u;
    }

    int erase(int u, int key) {
        if (u == 0) {
            return 0;
        }

        if (key < tree[u].key) {
            tree[u].left = erase(tree[u].left, key);
        } else if (key > tree[u].key) {
            tree[u].right = erase(tree[u].right, key);
        } else if (tree[u].count > 1) {
            tree[u].count--;
        } else if (tree[u].left == 0 || tree[u].right == 0) {
            return tree[u].left + tree[u].right;
        } else if (tree[tree[u].left].priority <
                   tree[tree[u].right].priority) {
            u = rotate_right(u);
            tree[u].right = erase(tree[u].right, key);
        } else {
            u = rotate_left(u);
            tree[u].left = erase(tree[u].left, key);
        }

        pull(u);
        return u;
    }

    int count_less(int u, ll key) const {
        int answer = 0;

        while (u != 0) {
            if (tree[u].key < key) {
                answer += size(tree[u].left) + tree[u].count;
                u = tree[u].right;
            } else {
                u = tree[u].left;
            }
        }
        return answer;
    }

    pair<bool, int> predecessor(int u, int key) const {
        bool found = false;
        int answer = 0;

        while (u != 0) {
            if (tree[u].key < key) {
                found = true;
                answer = tree[u].key;
                u = tree[u].right;
            } else {
                u = tree[u].left;
            }
        }
        return {found, answer};
    }

    pair<bool, int> successor(int u, int key) const {
        bool found = false;
        int answer = 0;

        while (u != 0) {
            if (tree[u].key > key) {
                found = true;
                answer = tree[u].key;
                u = tree[u].left;
            } else {
                u = tree[u].right;
            }
        }
        return {found, answer};
    }
};

struct SegmentTreeOfTreaps {
    int n;
    vector<int> root;
    vector<int> value;
    TreapPool treap;

    void init(const vector<int>& a, int size) {
        n = size;
        root.assign(n * 4 + 5, 0);
        value = a;
        treap.init();

        for (int i = 1; i <= n; i++) {
            insert_value(1, 1, n, i, value[i]);
        }
    }

    void insert_value(int u, int l, int r, int pos, int key) {
        root[u] = treap.insert(root[u], key);

        if (l == r) {
            return;
        }

        int mid = (l + r) / 2;
        if (pos <= mid) {
            insert_value(u * 2, l, mid, pos, key);
        } else {
            insert_value(u * 2 + 1, mid + 1, r, pos, key);
        }
    }

    void erase_value(int u, int l, int r, int pos, int key) {
        root[u] = treap.erase(root[u], key);

        if (l == r) {
            return;
        }

        int mid = (l + r) / 2;
        if (pos <= mid) {
            erase_value(u * 2, l, mid, pos, key);
        } else {
            erase_value(u * 2 + 1, mid + 1, r, pos, key);
        }
    }

    void change(int pos, int new_value) {
        erase_value(1, 1, n, pos, value[pos]);
        insert_value(1, 1, n, pos, new_value);
        value[pos] = new_value;
    }

    int count_less(
        int u,
        int l,
        int r,
        int ql,
        int qr,
        ll key) const {
        if (ql <= l && r <= qr) {
            return treap.count_less(root[u], key);
        }

        int mid = (l + r) / 2;
        int answer = 0;

        if (ql <= mid) {
            answer += count_less(u * 2, l, mid, ql, qr, key);
        }
        if (qr > mid) {
            answer += count_less(u * 2 + 1, mid + 1, r, ql, qr, key);
        }
        return answer;
    }

    int count_less(int l, int r, ll key) const {
        return count_less(1, 1, n, l, r, key);
    }

    int rank(int l, int r, int key) const {
        return count_less(l, r, key) + 1;
    }

    int kth(int l, int r, int k) const {
        ll low = INT_MIN;
        ll high = INT_MAX;

        while (low < high) {
            ll mid = low + (high - low) / 2;
            if (count_less(l, r, mid + 1) >= k) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        return (int)low;
    }

    pair<bool, int> predecessor(
        int u,
        int l,
        int r,
        int ql,
        int qr,
        int key) const {
        if (ql <= l && r <= qr) {
            return treap.predecessor(root[u], key);
        }

        int mid = (l + r) / 2;
        pair<bool, int> answer = {false, 0};

        if (ql <= mid) {
            answer = predecessor(u * 2, l, mid, ql, qr, key);
        }
        if (qr > mid) {
            pair<bool, int> candidate =
                predecessor(u * 2 + 1, mid + 1, r, ql, qr, key);
            if (candidate.first &&
                (!answer.first || candidate.second > answer.second)) {
                answer = candidate;
            }
        }
        return answer;
    }

    int predecessor(int l, int r, int key) const {
        return predecessor(1, 1, n, l, r, key).second;
    }

    pair<bool, int> successor(
        int u,
        int l,
        int r,
        int ql,
        int qr,
        int key) const {
        if (ql <= l && r <= qr) {
            return treap.successor(root[u], key);
        }

        int mid = (l + r) / 2;
        pair<bool, int> answer = {false, 0};

        if (ql <= mid) {
            answer = successor(u * 2, l, mid, ql, qr, key);
        }
        if (qr > mid) {
            pair<bool, int> candidate =
                successor(u * 2 + 1, mid + 1, r, ql, qr, key);
            if (candidate.first &&
                (!answer.first || candidate.second < answer.second)) {
                answer = candidate;
            }
        }
        return answer;
    }

    int successor(int l, int r, int key) const {
        return successor(1, 1, n, l, r, key).second;
    }
};

int n, m;
vector<int> a;
SegmentTreeOfTreaps segment;

void solve() {
    cin >> n >> m;

    a.assign(n + 5, 0);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    segment.init(a, n);

    while (m--) {
        int operation;
        cin >> operation;

        if (operation == 1) {
            int l, r, x;
            cin >> l >> r >> x;
            cout << segment.rank(l, r, x) << '\n';
        } else if (operation == 2) {
            int l, r, k;
            cin >> l >> r >> k;
            cout << segment.kth(l, r, k) << '\n';
        } else if (operation == 3) {
            int pos, value;
            cin >> pos >> value;
            segment.change(pos, value);
        } else if (operation == 4) {
            int l, r, x;
            cin >> l >> r >> x;
            cout << segment.predecessor(l, r, x) << '\n';
        } else {
            int l, r, x;
            cin >> l >> r >> x;
            cout << segment.successor(l, r, x) << '\n';
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

- 建立结构：$O(n\log^2 n)$ 期望时间，$O(n\log n)$ 个元素副本；
- 单点修改：期望 $O(\log^2 n)$；
- 区间排名、前驱、后继：期望 $O(\log^2 n)$；
- 区间第 $k$ 小：期望 $O(\log V\log^2 n)$；
- 不回收节点时，节点池最坏为 $O((n+q)\log n)$。

“期望”来自内层 Treap 的随机树高。外层线段树的高度始终是 $O(\log n)$。

## 常见错误

- 单点修改只改外层叶子的 Treap，没有更新根到叶路径；
- 删除旧值后忘记插入新值，或忘记更新 `value[pos]`；
- 内层 `size` 没有计入重复次数；
- 第 $k$ 小二分时统计严格小于 `mid`，却把它当成小于等于；
- 在 `INT_MAX` 上直接计算 `mid + 1`，发生 32 位溢出；本文用 64 位值域变量；
- 合并前驱候选时取最小值，或合并后继候选时取最大值；
- 把节点池共享误解成不同 Treap 可以共享同一个可修改节点；
- 没有估计 $O(n\log n)$ 个初始元素副本带来的内存常数。

## 需要记住什么

- 外层线段树与内层平衡树分别维护哪个维度？
- 为什么一个数组元素会出现在 $O(\log n)$ 棵内层树中？
- 区间排名怎样由多个完整外层节点的计数相加得到？
- 第 $k$ 小为什么可以对答案值域二分？
- 单点修改为什么必须在路径上同时删除旧值并插入新值？
- 共享节点池与共享可修改节点有什么区别？
