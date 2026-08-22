# Link-Cut Tree

> 最近修订：2026-08-23 06:05 +10:00（未审阅）

维护一片会动态变化的森林，支持：

- 连接原本不连通的两个点；
- 删除一条已有边；
- 修改一个点的权值；
- 查询两点路径上的权值异或和。

普通树链剖分先对固定树做一次 DFS，把路径拆成若干重链。边会动态增加和删除时，
原来的父子关系与重链划分都会失效。

Link-Cut Tree 动态维护当前需要访问的树链。它不把整棵原树固定存成一棵 Splay，
而是让若干棵辅助 Splay 表示当前选中的路径，并在每次访问时重新组织这些路径。

## 实树与辅助树

题目中的动态森林称为实树。Link-Cut Tree 内部维护的 Splay 称为辅助树。

辅助 Splay 的中序顺序对应实树中一条从上到下的路径。一个点的 `parent` 有两种
可能含义：

- 若它是辅助 Splay 中某个节点的儿子，`parent` 是辅助树父节点；
- 若它是当前辅助 Splay 的根，`parent` 指向实树中更上方的路径父节点。

因此不能只用 `parent[u] == 0` 判断 `u` 是否为一棵辅助 Splay 的根。正确条件是：

```cpp
bool is_root(int u) const {
    int p = tree[u].parent;
    return tree[p].child[0] != u && tree[p].child[1] != u;
}
```

即父节点没有把 `u` 记录为左右儿子。辅助树根仍然可能保存一个非零的实树路径父亲。

## access：改写首选路径

`access(u)` 把实树根到 `u` 的整条路径变成一条首选路径，并让 `u` 成为对应辅助
Splay 的根。

从 `u` 沿 `parent` 向实树根跳：

1. 把当前点 `v` 伸展到它所在辅助树的根；
2. 把 `v` 的右儿子改为上一段已经处理好的路径 `last`；
3. 更新 `v` 的聚合信息；
4. 继续处理 `v` 的路径父节点。

```cpp
void access(int u) {
    int last = 0;

    for (int v = u; v != 0; v = tree[v].parent) {
        splay(v);
        tree[v].child[1] = last;
        pull(v);
        last = v;
    }
    splay(u);
}
```

在辅助 Splay 的中序顺序中，右侧代表路径上更靠近目标点的一段。把右儿子换成
`last`，就是把当前点到目标点的路径设为新的首选路径。

`access` 不会改变实树的边，只改变同一棵实树在辅助树中的表示。

## 路径翻转

实树没有固定根。若要查询 `u` 到 `v` 的路径，可以先把 `u` 变成当前实树的根，
再访问 `v`。

`access(u)` 后，辅助树中从左到右是原实树根到 `u`。交换每个节点的左右儿子，
整条路径就反向，`u` 成为新的实树根。

不必立即遍历整条路径。给辅助树根打上翻转标记：

```cpp
void apply_reverse(int u) {
    swap(tree[u].child[0], tree[u].child[1]);
    tree[u].reversed ^= 1;
}
```

以后旋转或向下查找以前，再把标记传给儿子。Splay 旋转前必须从所在辅助树根开始
依次下传标记，否则左右关系可能仍是过期的。

## makeroot 与 split

把 `u` 变成实树根：

```cpp
void make_root(int u) {
    access(u);
    apply_reverse(u);
}
```

提取 `u` 到 `v` 的路径：

```cpp
void split(int u, int v) {
    make_root(u);
    access(v);
}
```

完成后，`v` 所在辅助 Splay 恰好表示路径 `u -> v`，并且 `v` 是辅助树根。
若每个辅助节点维护子树异或和，路径答案就是 `tree[v].sum`。

## 判断连通性

把 `u` 执行 `access` 后，辅助树最左侧节点就是当前实树根：

```cpp
int find_root(int u) {
    access(u);

    while (tree[u].child[0] != 0) {
        push_down(u);
        u = tree[u].child[0];
    }
    splay(u);
    return u;
}
```

两个点的实树根相同，当且仅当它们连通。

## 连接一条边

连接 `u` 与 `v` 以前，先把 `u` 变成实树根。若 `v` 已经与 `u` 连通，再连接会
产生环，不允许操作；否则让 `u` 的路径父亲指向 `v`：

```cpp
void link(int u, int v) {
    make_root(u);
    if (find_root(v) != u) {
        tree[u].parent = v;
    }
}
```

这里没有把 `u` 立刻设成 `v` 的辅助树儿子。它们之间先以路径父子关系存在，下一次
`access` 会根据需要把这条实边纳入首选路径。

## 删除一条边

要删除实边 `(u,v)`：

1. `make_root(u)`，令路径从 `u` 出发；
2. `access(v)`，把 `u -> v` 整条路径放入同一棵辅助 Splay；
3. 若 `(u,v)` 是直接相连的实边，此时 `u` 是 `v` 的左儿子，并且 `u` 没有右儿子；
4. 断开这条辅助边，同时清空 `u` 的父节点。

```cpp
if (tree[v].child[0] == u && tree[u].child[1] == 0) {
    tree[v].child[0] = 0;
    tree[u].parent = 0;
    pull(v);
}
```

条件检查能够避免误删不存在的边或一条长度大于 $1$ 的路径。

## 完整代码

下面维护动态森林的路径异或和。操作格式为：

- `0 x y`：查询 `x` 到 `y` 路径上的点权异或和；
- `1 x y`：若不成环，连接 `x` 与 `y`；
- `2 x y`：若边存在，删除边 `(x,y)`；
- `3 x value`：把点 `x` 的权值改为 `value`。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct LinkCutTree {
    struct Node {
        int value;
        int sum;
        int parent;
        int child[2];
        bool reversed;
    };

    int n;
    vector<Node> tree;
    vector<int> path;

    void init(const vector<int>& value, int size) {
        n = size;
        tree.assign(n + 5, {});
        path.assign(n + 5, 0);

        for (int u = 1; u <= n; u++) {
            tree[u].value = value[u];
            tree[u].sum = value[u];
        }
    }

    bool is_root(int u) const {
        int p = tree[u].parent;
        return tree[p].child[0] != u && tree[p].child[1] != u;
    }

    void pull(int u) {
        tree[u].sum = tree[tree[u].child[0]].sum ^ tree[u].value ^
                      tree[tree[u].child[1]].sum;
    }

    void apply_reverse(int u) {
        if (u == 0) {
            return;
        }
        swap(tree[u].child[0], tree[u].child[1]);
        tree[u].reversed ^= 1;
    }

    void push_down(int u) {
        if (!tree[u].reversed) {
            return;
        }
        apply_reverse(tree[u].child[0]);
        apply_reverse(tree[u].child[1]);
        tree[u].reversed = false;
    }

    void push_all(int u) {
        int top = 0;
        path[++top] = u;

        while (!is_root(path[top])) {
            path[top + 1] = tree[path[top]].parent;
            top++;
        }
        while (top > 0) {
            push_down(path[top--]);
        }
    }

    void rotate(int u) {
        int p = tree[u].parent;
        int g = tree[p].parent;
        int direction = tree[p].child[1] == u;
        int v = tree[u].child[direction ^ 1];

        if (!is_root(p)) {
            int p_direction = tree[g].child[1] == p;
            tree[g].child[p_direction] = u;
        }
        tree[u].parent = g;

        tree[u].child[direction ^ 1] = p;
        tree[p].parent = u;

        tree[p].child[direction] = v;
        if (v != 0) {
            tree[v].parent = p;
        }

        pull(p);
        pull(u);
    }

    void splay(int u) {
        push_all(u);

        while (!is_root(u)) {
            int p = tree[u].parent;
            int g = tree[p].parent;

            if (!is_root(p)) {
                bool p_is_right = tree[g].child[1] == p;
                bool u_is_right = tree[p].child[1] == u;

                if (p_is_right == u_is_right) {
                    rotate(p);
                } else {
                    rotate(u);
                }
            }
            rotate(u);
        }
    }

    void access(int u) {
        int last = 0;

        for (int v = u; v != 0; v = tree[v].parent) {
            splay(v);
            tree[v].child[1] = last;
            pull(v);
            last = v;
        }
        splay(u);
    }

    void make_root(int u) {
        access(u);
        apply_reverse(u);
    }

    int find_root(int u) {
        access(u);

        while (tree[u].child[0] != 0) {
            push_down(u);
            u = tree[u].child[0];
        }
        splay(u);
        return u;
    }

    void split(int u, int v) {
        make_root(u);
        access(v);
    }

    void link(int u, int v) {
        make_root(u);
        if (find_root(v) != u) {
            tree[u].parent = v;
        }
    }

    void cut(int u, int v) {
        make_root(u);
        access(v);

        if (tree[v].child[0] == u && tree[u].child[1] == 0) {
            tree[v].child[0] = 0;
            tree[u].parent = 0;
            pull(v);
        }
    }

    void change(int u, int value) {
        access(u);
        tree[u].value = value;
        pull(u);
    }

    int path_xor(int u, int v) {
        split(u, v);
        return tree[v].sum;
    }
};

int n, m;
vector<int> value;
LinkCutTree lct;

void solve() {
    cin >> n >> m;

    value.assign(n + 5, 0);
    for (int u = 1; u <= n; u++) {
        cin >> value[u];
    }

    lct.init(value, n);

    while (m--) {
        int operation, x, y;
        cin >> operation >> x >> y;

        if (operation == 0) {
            cout << lct.path_xor(x, y) << '\n';
        } else if (operation == 1) {
            lct.link(x, y);
        } else if (operation == 2) {
            lct.cut(x, y);
        } else {
            lct.change(x, y);
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

Link-Cut Tree 的复杂度来自 Splay 的均摊分析。`access`、`make_root`、`find_root`、
`split`、`link`、`cut`、单点修改和路径查询均为均摊 $O(\log n)$；空间复杂度为
$O(n)$。

单次操作仍可能较慢，保证的是一段操作序列的总复杂度。

## 常见错误

- 把 `parent[u] != 0` 当成 `u` 不属于辅助树根，混淆路径父亲与辅助树父亲；
- Splay 旋转前没有从上到下传递翻转标记；
- `access` 更换右儿子后忘记 `pull`；
- `make_root` 只执行 `access`，没有翻转整条路径；
- `link` 前不检查连通性，给森林加入环；
- `cut` 只看 `u` 与 `v` 连通就断开，误删一条长度大于 $1$ 的路径；
- 路径查询后读取 `tree[u].sum`，而 `split(u,v)` 的辅助树根是 `v`；
- 修改点权前没有 `access`，导致当前节点不是辅助树根，祖先聚合信息没有正确更新。

## 需要记住什么

- 实树与辅助 Splay 分别表示什么？
- 为什么辅助树根仍可能有非零 `parent`？
- `access(u)` 怎样把实树根到 `u` 改成首选路径？
- `make_root` 为什么需要路径翻转？
- `split(u,v)` 后，为什么 `tree[v].sum` 就是整条路径的答案？
- `link` 与 `cut` 分别要检查什么条件？
