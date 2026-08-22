# 可持久化线段树

> 最近修订：2026-08-23 05:05 +10:00（未审阅）

普通线段树只维护数组的当前状态。一次单点修改会直接覆盖从根到叶子的所有相关
节点，修改以前的状态随之消失。

若每次操作都可以从任意历史版本出发，并且以后仍要查询旧版本，最直接的方法是为
每个版本复制整棵线段树。一次修改只影响 $O(\log n)$ 个节点，复制其余
$O(n)$ 个未变节点显然浪费。

可持久化线段树只复制本次修改经过的根到叶路径，其余子树由新旧版本共享。

## 历史版本数组

初始数组是版本 $0$。每次操作选择一个已有版本 `version`：

- 把某个位置改成新值，产生一个新版本；
- 查询某个区间，新版本与被查询版本完全相同。

每个版本保存一个根节点编号：

```cpp
vector<int> root;
```

`root[i]` 指向版本 $i$ 的整棵线段树。不同根可以共享大量子节点，但任何版本的根
一旦建立，就不再修改它能到达的节点。

## 路径复制

把位置 `pos` 修改为 `value`。在普通线段树中，递归只进入包含 `pos` 的一个儿子。
因此新版本只需要复制：

1. 当前根；
2. 下一层包含 `pos` 的儿子；
3. 继续向下直到叶子。

未被访问的另一棵子树没有变化，可以直接沿用旧节点编号。

假设旧节点是 `old_u`，先复制它：

```cpp
int u = clone(old_u);
```

若修改位置位于左半区间，只让新节点的左儿子指向递归产生的新左儿子：

```cpp
tree[u].left = update(tree[old_u].left, l, mid, pos, value);
```

右儿子仍然是复制时得到的旧编号，因此由新旧版本共享。

## 为什么不能原地修改

若在递归中写成：

```cpp
tree[old_u].left = update(...);
```

旧版本根仍然指向 `old_u`，于是旧版本也会看到新的左儿子。一次修改就污染了所有
共享这个节点的历史版本。

可持久化结构的核心不变量是：

> 已经发布的版本中的节点永远不再修改；新版本只能建立新节点，并引用旧版本中
> 未改变的节点。

这通常称为路径复制。它不仅适用于线段树，也适用于 Trie、平衡树等指针或节点编号
连接的结构。

## 节点池

多个版本共享节点，不能再用 `u * 2` 和 `u * 2 + 1` 推导儿子编号。每次复制都会
从节点池中申请一个新编号，节点显式保存左右儿子：

```cpp
struct Node {
    ll sum;
    int left;
    int right;
};
```

初始建树使用 $O(n)$ 个节点。每次单点修改复制一条长度为 $O(\log n)$ 的路径，
因此 $m$ 次修改后节点总数为 $O(n+m\log n)$。

`vector` 扩容会移动 `Node` 对象，但节点之间只保存整数编号，不保存指针，所以扩容
不会让已有连接失效。

## 建立初始版本

初始版本与普通线段树相同。每个区间建立一个节点，叶子保存数组值，非叶节点保存
左右区间和：

```cpp
int build(int l, int r, const vector<ll>& a) {
    int u = new_node();

    if (l == r) {
        tree[u].sum = a[l];
        return u;
    }

    int mid = (l + r) / 2;
    tree[u].left = build(l, mid, a);
    tree[u].right = build(mid + 1, r, a);
    pull(u);
    return u;
}
```

返回的根编号保存到 `root[0]`。

## 建立新版本

修改函数接收旧版本当前节点 `old_u`，返回新版本对应节点 `u`：

```cpp
int update(int old_u, int l, int r, int pos, ll value) {
    int u = clone(old_u);

    if (l == r) {
        tree[u].sum = value;
        return u;
    }

    int mid = (l + r) / 2;
    if (pos <= mid) {
        tree[u].left = update(tree[old_u].left, l, mid, pos, value);
    } else {
        tree[u].right = update(tree[old_u].right, mid + 1, r, pos, value);
    }
    pull(u);
    return u;
}
```

调用者只需把返回值保存为新版本根：

```cpp
root[i] = update(root[version], 1, n, pos, value);
```

从哪个历史版本出发并不重要。更新函数只读取这个版本的旧路径，再建立一条新路径。

## 查询历史版本

查询不会修改节点，与普通线段树完全相同，只是从指定版本根开始：

```cpp
ll answer = query(root[version], 1, n, l, r);
```

一次纯查询也对应一个操作版本时，令新根直接等于旧根：

```cpp
root[i] = root[version];
```

这不会复制任何节点，两个版本共享整棵树。

## 完整代码

下面维护一个有历史版本的数组。初始数组为版本 $0$，第 $i$ 次操作产生版本 $i$：

- `version 1 pos value`：从 `version` 出发，把 `a[pos]` 设为 `value`；
- `version 2 l r`：查询 `version` 的闭区间 `[l,r]` 之和，新版本保持不变。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct PersistentSegmentTree {
    struct Node {
        ll sum;
        int left;
        int right;
    };

    int n;
    vector<Node> tree;
    vector<int> root;

    int new_node() {
        tree.push_back({0, 0, 0});
        return (int)tree.size() - 1;
    }

    int clone(int u) {
        tree.push_back(tree[u]);
        return (int)tree.size() - 1;
    }

    void pull(int u) {
        tree[u].sum = tree[tree[u].left].sum + tree[tree[u].right].sum;
    }

    int build(int l, int r, const vector<ll>& a) {
        int u = new_node();

        if (l == r) {
            tree[u].sum = a[l];
            return u;
        }

        int mid = (l + r) / 2;
        tree[u].left = build(l, mid, a);
        tree[u].right = build(mid + 1, r, a);
        pull(u);
        return u;
    }

    void init(int size, const vector<ll>& a, int versions) {
        n = size;
        tree.clear();
        tree.push_back({0, 0, 0});
        root.assign(versions + 5, 0);
        root[0] = build(1, n, a);
    }

    int update(int old_u, int l, int r, int pos, ll value) {
        int u = clone(old_u);

        if (l == r) {
            tree[u].sum = value;
            return u;
        }

        int mid = (l + r) / 2;
        if (pos <= mid) {
            tree[u].left = update(tree[old_u].left, l, mid, pos, value);
        } else {
            tree[u].right = update(tree[old_u].right, mid + 1, r, pos, value);
        }
        pull(u);
        return u;
    }

    ll query(int u, int l, int r, int ql, int qr) const {
        if (ql <= l && r <= qr) {
            return tree[u].sum;
        }

        int mid = (l + r) / 2;
        ll sum = 0;

        if (ql <= mid) {
            sum += query(tree[u].left, l, mid, ql, qr);
        }
        if (qr > mid) {
            sum += query(tree[u].right, mid + 1, r, ql, qr);
        }
        return sum;
    }
};

int n, m;
vector<ll> a;
PersistentSegmentTree segment;

void solve() {
    cin >> n >> m;

    a.assign(n + 5, 0);
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    segment.init(n, a, m);

    for (int i = 1; i <= m; i++) {
        int version, operation;
        cin >> version >> operation;

        if (operation == 1) {
            int pos;
            ll value;
            cin >> pos >> value;
            segment.root[i] =
                segment.update(segment.root[version], 1, n, pos, value);
        } else {
            int l, r;
            cin >> l >> r;
            segment.root[i] = segment.root[version];
            cout << segment.query(segment.root[version], 1, n, l, r) << '\n';
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

- 建立初始版本：$O(n)$ 时间和 $O(n)$ 个节点；
- 单点修改：$O(\log n)$ 时间并新建 $O(\log n)$ 个节点；
- 区间查询：$O(\log n)$ 时间，不新建节点；
- $m$ 次操作的总空间：$O(n+m\log n)$。

持久化不会免费保存历史。它避免复制没有变化的部分，但每次修改仍会永久增加一条
路径的节点。

## 常见错误

- 更新时原地修改旧节点，破坏历史版本；
- 新版本只复制根，却继续修改共享的儿子；
- 查询操作忘记让新版本根继承被查询版本；
- 仍用 `u * 2` 推导儿子编号，无法表达跨版本共享；
- 节点池容量按版本数估计，却忘记每次修改产生 $O(\log n)$ 个节点；
- 把版本编号与线段树节点编号混为一谈；
- 用裸指针指向 `vector` 元素，扩容后指针失效。本文只保存整数编号。

## 需要记住什么

- 一个版本为什么只需要保存一个根节点编号？
- 单点修改为什么只复制根到叶的一条路径？
- 新旧版本怎样共享没有变化的子树？
- 为什么已经发布的节点必须保持不可变？
- 查询操作怎样产生一个与历史版本完全相同的新版本？
- 可持久化线段树的空间为什么是 $O(n+m\log n)$？
