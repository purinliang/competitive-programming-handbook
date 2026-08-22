# 可持久化并查集

> 最近修订：2026-08-23 05:00 +10:00（未审阅）

普通并查集只保留当前的连通关系。两集合一旦合并，就不能查询合并以前的状态。

若每次操作都产生一个版本，并且可以回到任意历史版本继续合并或查询，我们需要同时
保存多棵并查集。完整复制 `parent` 和 `size` 数组一次需要 $O(n)$，而一次合并实际
只修改两个位置。

可持久化并查集用可持久化线段树保存这两个数组，让每次修改只复制 $O(\log n)$ 个
节点。

## 把数组交给可持久化线段树

线段树的每个叶子对应一个元素 `x`，保存：

```cpp
struct Info {
    int parent;
    int size;
};
```

初始时每个元素自成集合：

```text
parent[x] = x
size[x] = 1
```

每个版本保存一个线段树根 `root[i]`。查询版本中的 `parent[x]`，就是查询
`root[i]` 中位置 `x` 的叶子；修改父亲或集合大小，则建立一个新的线段树根。

## 为什么不能路径压缩

普通并查集查找根时，会把沿途节点的父亲全部改成根。这种路径压缩会在一次查询中
修改数量不固定的位置：

```cpp
parent[x] = find(parent[x]);
```

在可持久化结构中，每次修改都会复制线段树路径。路径压缩不仅让只读查询产生新版本，
还会复制大量节点，使实现和复杂度都变得不稳定。

因此本文不做路径压缩，只使用按大小合并。较小集合的根接到较大集合的根下面，每个
节点的深度至多增加 $O(\log n)$ 次，所以并查集树高保持在 $O(\log n)$。

## 查找集合根

查找过程只读取当前版本：

```cpp
int find(int root, int x) const {
    while (true) {
        Info info = query(root, 1, n, x);
        if (info.parent == x) {
            return x;
        }
        x = info.parent;
    }
}
```

并查集树高为 $O(\log n)$，每次读取叶子又需要 $O(\log n)$，因此一次 `find` 是
$O(\log^2 n)$。

## 建立合并版本

设 `u` 和 `v` 的根分别是 `root_u` 和 `root_v`。若两者不同，先让 `root_u`
表示较大的集合，然后修改两处：

1. 把 `root_v` 的父亲改成 `root_u`；
2. 把 `root_u` 的大小增加 `size[root_v]`。

两次点修改依次建立在同一个新版本上：

```cpp
int new_root = update_parent(old_root, root_v, root_u);
new_root = update_size(new_root, root_u, size_u + size_v);
```

旧根仍然可以访问原来的父亲和大小，因此历史版本没有被污染。

## 回到历史版本

回到版本 `version` 不需要复制节点，只复制根编号：

```cpp
root[i] = root[version];
```

两个版本暂时指向同一棵线段树。以后从其中一个版本继续合并时，路径复制会建立新的
节点，另一个版本仍保持不变。

## 完整代码

初始状态是版本 $0$。第 $i$ 次操作产生版本 $i$：

- `1 u v`：在版本 $i-1$ 的基础上合并 `u` 和 `v`；
- `2 version`：令版本 $i$ 回到指定历史版本；
- `3 u v`：查询版本 $i-1$ 中两点是否连通，版本 $i$ 保持不变。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct PersistentDisjointSetUnion {
    struct Info {
        int parent;
        int size;
    };

    struct Node {
        Info info;
        int left;
        int right;
    };

    int n;
    vector<Node> tree;

    PersistentDisjointSetUnion(int size, int operations) : n(size) {
        tree.reserve(4 * n + 2 * operations * 25 + 5);
        tree.push_back({{0, 0}, 0, 0});
    }

    int new_node() {
        tree.push_back({{0, 0}, 0, 0});
        return tree.size() - 1;
    }

    int clone(int old_u) {
        tree.push_back(tree[old_u]);
        return tree.size() - 1;
    }

    int build(int l, int r) {
        int u = new_node();
        if (l == r) {
            tree[u].info = {l, 1};
            return u;
        }

        int mid = (l + r) / 2;
        tree[u].left = build(l, mid);
        tree[u].right = build(mid + 1, r);
        return u;
    }

    Info query(int u, int l, int r, int pos) const {
        if (l == r) {
            return tree[u].info;
        }

        int mid = (l + r) / 2;
        if (pos <= mid) {
            return query(tree[u].left, l, mid, pos);
        }
        return query(tree[u].right, mid + 1, r, pos);
    }

    int update_parent(int old_u, int l, int r, int pos, int parent) {
        int u = clone(old_u);
        if (l == r) {
            tree[u].info.parent = parent;
            return u;
        }

        int mid = (l + r) / 2;
        if (pos <= mid) {
            tree[u].left = update_parent(tree[old_u].left, l, mid, pos, parent);
        } else {
            tree[u].right =
                update_parent(tree[old_u].right, mid + 1, r, pos, parent);
        }
        return u;
    }

    int update_size(int old_u, int l, int r, int pos, int size) {
        int u = clone(old_u);
        if (l == r) {
            tree[u].info.size = size;
            return u;
        }

        int mid = (l + r) / 2;
        if (pos <= mid) {
            tree[u].left = update_size(tree[old_u].left, l, mid, pos, size);
        } else {
            tree[u].right =
                update_size(tree[old_u].right, mid + 1, r, pos, size);
        }
        return u;
    }

    int find(int root, int x) const {
        while (true) {
            Info info = query(root, 1, n, x);
            if (info.parent == x) {
                return x;
            }
            x = info.parent;
        }
    }

    int merge(int root, int u, int v) {
        u = find(root, u);
        v = find(root, v);
        if (u == v) {
            return root;
        }

        int size_u = query(root, 1, n, u).size;
        int size_v = query(root, 1, n, v).size;
        if (size_u < size_v) {
            swap(u, v);
            swap(size_u, size_v);
        }

        int new_root = update_parent(root, 1, n, v, u);
        new_root = update_size(new_root, 1, n, u, size_u + size_v);
        return new_root;
    }

    bool connected(int root, int u, int v) const {
        return find(root, u) == find(root, v);
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    PersistentDisjointSetUnion dsu(n, m);
    vector<int> root(m + 5);
    root[0] = dsu.build(1, n);

    for (int i = 1; i <= m; ++i) {
        int type;
        cin >> type;

        if (type == 1) {
            int u, v;
            cin >> u >> v;
            root[i] = dsu.merge(root[i - 1], u, v);
        } else if (type == 2) {
            int version;
            cin >> version;
            root[i] = root[version];
        } else {
            int u, v;
            cin >> u >> v;
            root[i] = root[i - 1];
            cout << dsu.connected(root[i], u, v) << '\n';
        }
    }
    return 0;
}
```

## 复杂度

按大小合并使并查集树高为 $O(\log n)$。线段树的一次叶子查询或点修改为
$O(\log n)$，因此：

- `find` 和连通性查询为 $O(\log^2 n)$；
- 合并为 $O(\log^2 n)$，并额外建立 $O(\log n)$ 个新节点；
- 回到历史版本为 $O(1)$；
- 总空间复杂度为 $O(n+m\log n)$。

## 常见错误

- 继续使用路径压缩，使查询修改历史结构；
- 只修改较小集合根的父亲，没有更新新根的集合大小；
- 第二次点修改仍从旧版本根出发，丢掉第一次父亲修改；
- 回到历史版本时复制整棵线段树，而不是共享根编号；
- 把并查集根与可持久化线段树根混为同一个概念；
- 在非根节点读取 `size` 并把它当成集合大小。

## 需要记住什么

- 可持久化线段树的叶子保存并查集的哪些信息？
- 为什么可持久化并查集通常不使用路径压缩？
- 只使用按大小合并时，并查集树高为什么仍是 $O(\log n)$？
- 一次合并会修改哪两个位置？
- 回到历史版本为什么只需复制一个根编号？
- 为什么一次查找的复杂度是 $O(\log^2 n)$ 而不是 $O(\log n)$？
