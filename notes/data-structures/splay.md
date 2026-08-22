# Splay

> 最近修订：2026-08-23 04:55 +10:00（未审阅）

动态有序多重集合需要支持插入、删除、排名、第 $k$ 小、前驱和后继。Treap 用
随机优先级保持期望平衡；Splay 采用另一种方法：每次访问一个节点后，通过旋转把它
移动到指定位置。

Splay 不保存随机优先级或平衡因子。单次操作可能达到 $O(n)$，但连续 $m$ 次操作的
总复杂度是 $O(m\log n)$，即均摊每次 $O(\log n)$。

FHQ Treap 通常更适合直接维护有序集合和序列；仍然学习 Splay 的重要原因是：
Link-Cut Tree 会把当前访问的树链维护成 Splay，并反复执行相同的旋转与伸展操作。

## 节点信息

本文维护允许重复键值的有序多重集合。每个不同键值建立一个节点，保存：

- `key`：键值；
- `count`：这个键出现的次数；
- `size`：子树中的元素总数，重复元素分别计数；
- `parent`：父节点；
- `child[0]`、`child[1]`：左、右儿子。

节点 `0` 表示空节点，其 `size` 为 $0$：

```cpp
void pull(int u) {
    tree[u].size =
        size(tree[u].child[0]) + size(tree[u].child[1]) + tree[u].count;
}
```

每次旋转改变父子关系以后，都必须重新计算受到影响的节点。

## 一次旋转

设 `u` 的父节点是 `p`，祖父节点是 `g`。若 `u` 是 `p` 的右儿子，左旋让 `u`
上升；若 `u` 是左儿子，右旋让 `u` 上升。两种情况可以写成同一个函数。

旋转时共有四段关系需要更新：

1. `u` 靠近 `p` 的子树转交给 `p`；
2. `p` 成为 `u` 的一个儿子；
3. `u` 接到原来的祖父 `g`；
4. 若 `g == 0`，`u` 成为整棵树的新根。

```cpp
void rotate(int u) {
    int p = tree[u].parent;
    int g = tree[p].parent;
    int direction = tree[p].child[1] == u;
    int v = tree[u].child[direction ^ 1];

    tree[p].child[direction] = v;
    if (v != 0) {
        tree[v].parent = p;
    }

    tree[u].child[direction ^ 1] = p;
    tree[p].parent = u;
    tree[u].parent = g;
```

最后还要让 `g` 或整棵树的根指向 `u`，并按照先下后上的顺序更新 `p`、`u`。

旋转前后的中序遍历不变，所以不会破坏二叉搜索树的键值顺序。

## 伸展到根

只反复旋转 `u` 虽然最终也能到根，但在一条长链上不能保证良好的均摊复杂度。
Splay 根据 `u`、父亲 `p` 和祖父 `g` 的方向选择旋转顺序。

### 同向：先转父亲

若 `u` 与 `p` 都是左儿子，或都是右儿子，称为同向情形：

```text
    g             p             u
     \             \             \
      p     ->      u     ->      p
       \                           \
        u                           g
```

先旋转 `p`，再旋转 `u`。这一步会同时缩短 `u` 和原祖父一侧的深度。

### 反向：连续转当前节点

若 `u` 与 `p` 的方向不同，先后两次旋转 `u`：

```text
      g           g             u
       \           \           / \
        p    ->     u    ->    g   p
       /             \
      u               p
```

代码只需比较两条父子边的方向：

```cpp
if ((tree[g].child[1] == p) == (tree[p].child[1] == u)) {
    rotate(p);
} else {
    rotate(u);
}
rotate(u);
```

循环直到 `u` 的父节点等于目标节点。普通有序集合把目标设为 `0`，即把 `u`
伸展成根；Link-Cut Tree 还会使用“伸展到某个指定父节点”的形式。

## 插入

插入过程先按照二叉搜索树规则向下查找：

- 找到相同键值时，增加 `count`；
- 找到空位置时，建立新节点并连接到最后一个非空节点；
- 最后把被修改的节点伸展到根。

刚访问的键值移动到根以后，下一次访问附近键值时通常只需经过较短路径。这种根据
实际访问调整树形的性质称为自调整。

## 查询排名与第 k 小

排名定义为：

$$
1+\text{严格小于 key 的元素数量}.
$$

查找时，若当前键小于目标，就把左子树大小和当前节点 `count` 加入答案，再进入
右子树；否则进入左子树。查询结束后，把最后访问的节点伸展到根。

查询第 $k$ 小时，比较 $k$ 与左子树大小 `left_size`：

- `k <= left_size`：进入左子树；
- `k <= left_size + count`：当前节点就是答案；
- 否则减去这两部分，进入右子树。

找到答案后同样把它伸展到根。

## 删除

先找到目标节点并伸展到根。若 `count > 1`，只减少出现次数。

若只剩一个副本：

- 没有左子树时，右子树直接成为根；
- 没有右子树时，左子树直接成为根；
- 两棵子树都存在时，先把它们与旧根断开，再把左子树中的最大节点伸展成新根。

左子树最大节点没有右儿子，因此可以直接把原右子树接到它的右边：

```text
所有左子树键 < 新根键 < 所有右子树键
```

这样删除不需要额外的合并算法。

## 完整代码

下面实现一个支持重复元素的动态有序多重集合。操作编号为：

1. 插入 `x`；
2. 删除 `x` 的一次出现；
3. 查询 `x` 的排名；
4. 查询第 `x` 小；
5. 查询 `x` 的严格前驱；
6. 查询 `x` 的严格后继。

输入保证需要答案的询问合法。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Splay {
    struct Node {
        int key;
        int count;
        int size;
        int parent;
        int child[2];
    };

    int root;
    int node_count;
    vector<Node> tree;

    void init(int maximum_nodes) {
        root = 0;
        node_count = 0;
        tree.assign(maximum_nodes + 5, {});
    }

    int size(int u) const {
        return tree[u].size;
    }

    void pull(int u) {
        tree[u].size =
            size(tree[u].child[0]) + size(tree[u].child[1]) + tree[u].count;
    }

    int new_node(int key, int parent) {
        int u = ++node_count;
        tree[u] = {key, 1, 1, parent, {0, 0}};
        return u;
    }

    void rotate(int u) {
        int p = tree[u].parent;
        int g = tree[p].parent;
        int direction = tree[p].child[1] == u;
        int v = tree[u].child[direction ^ 1];

        tree[p].child[direction] = v;
        if (v != 0) {
            tree[v].parent = p;
        }

        tree[u].child[direction ^ 1] = p;
        tree[p].parent = u;
        tree[u].parent = g;

        if (g == 0) {
            root = u;
        } else {
            int p_direction = tree[g].child[1] == p;
            tree[g].child[p_direction] = u;
        }

        pull(p);
        pull(u);
    }

    void splay(int u, int target = 0) {
        while (tree[u].parent != target) {
            int p = tree[u].parent;
            int g = tree[p].parent;

            if (g != target) {
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

        if (target == 0) {
            root = u;
        }
    }

    int find_node(int key) {
        int u = root;
        int last = 0;

        while (u != 0 && tree[u].key != key) {
            last = u;
            u = tree[u].child[key > tree[u].key];
        }

        if (u != 0) {
            splay(u);
        } else if (last != 0) {
            splay(last);
        }
        return u;
    }

    void insert(int key) {
        if (root == 0) {
            root = new_node(key, 0);
            return;
        }

        int u = root;
        int p = 0;

        while (u != 0 && tree[u].key != key) {
            p = u;
            u = tree[u].child[key > tree[u].key];
        }

        if (u != 0) {
            tree[u].count++;
            pull(u);
            splay(u);
            return;
        }

        u = new_node(key, p);
        tree[p].child[key > tree[p].key] = u;
        splay(u);
    }

    void erase(int key) {
        int u = find_node(key);

        if (u == 0 || tree[root].key != key) {
            return;
        }

        if (tree[root].count > 1) {
            tree[root].count--;
            pull(root);
            return;
        }

        int left = tree[root].child[0];
        int right = tree[root].child[1];

        if (left == 0) {
            root = right;
            if (root != 0) {
                tree[root].parent = 0;
            }
            return;
        }

        tree[left].parent = 0;
        root = left;

        int maximum = left;
        while (tree[maximum].child[1] != 0) {
            maximum = tree[maximum].child[1];
        }
        splay(maximum);

        tree[root].child[1] = right;
        if (right != 0) {
            tree[right].parent = root;
        }
        pull(root);
    }

    int rank(int key) {
        int u = root;
        int last = 0;
        int answer = 1;

        while (u != 0) {
            last = u;
            if (key <= tree[u].key) {
                u = tree[u].child[0];
            } else {
                answer += size(tree[u].child[0]) + tree[u].count;
                u = tree[u].child[1];
            }
        }

        if (last != 0) {
            splay(last);
        }
        return answer;
    }

    int kth(int k) {
        int u = root;

        while (u != 0) {
            int left_size = size(tree[u].child[0]);

            if (k <= left_size) {
                u = tree[u].child[0];
            } else if (k <= left_size + tree[u].count) {
                int answer = tree[u].key;
                splay(u);
                return answer;
            } else {
                k -= left_size + tree[u].count;
                u = tree[u].child[1];
            }
        }

        return 0;
    }

    int predecessor(int key) {
        int u = root;
        int answer = 0;

        while (u != 0) {
            if (tree[u].key < key) {
                answer = u;
                u = tree[u].child[1];
            } else {
                u = tree[u].child[0];
            }
        }

        splay(answer);
        return tree[answer].key;
    }

    int successor(int key) {
        int u = root;
        int answer = 0;

        while (u != 0) {
            if (tree[u].key > key) {
                answer = u;
                u = tree[u].child[0];
            } else {
                u = tree[u].child[1];
            }
        }

        splay(answer);
        return tree[answer].key;
    }
};

int n;
Splay splay_tree;

void solve() {
    cin >> n;
    splay_tree.init(n);

    while (n--) {
        int operation, x;
        cin >> operation >> x;

        if (operation == 1) {
            splay_tree.insert(x);
        } else if (operation == 2) {
            splay_tree.erase(x);
        } else if (operation == 3) {
            cout << splay_tree.rank(x) << '\n';
        } else if (operation == 4) {
            cout << splay_tree.kth(x) << '\n';
        } else if (operation == 5) {
            cout << splay_tree.predecessor(x) << '\n';
        } else {
            cout << splay_tree.successor(x) << '\n';
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

Splay 不保证单次操作的最坏复杂度。一次访问可能把一条长度为 $n$ 的链伸展到根，
耗时 $O(n)$；但任意 $m$ 次操作的总时间为 $O(m\log n)$：

- 每次操作均摊 $O(\log n)$；
- $n$ 个节点占用 $O(n)$ 空间。

这里的“均摊”不是随机期望。它表示把一段操作序列的总成本平均到每次操作上。

## 常见错误

- 旋转后只修改儿子，没有同步修改父节点；
- `u` 成为整棵树根时，没有更新 `root`；
- 同向情形错误地连续旋转 `u`，失去 Splay 的均摊保证；
- 更新子树大小时忽略重复次数 `count`；
- 删除根以后没有把新根的父节点清零；
- 合并左右子树时没有先把左子树最大节点伸展到根；
- 前驱、后继不存在时仍调用 `splay(0)`；完整程序依赖输入保证答案存在。

## 需要记住什么

- Splay 与 Treap 保持平衡的依据有什么不同？
- 一次旋转需要修改哪些父子关系？
- 同向与反向的两层旋转顺序分别是什么？
- 为什么访问结束后要把节点伸展到根？
- 删除根且左右子树都存在时，为什么选择左子树最大节点作为新根？
- “单次最坏 $O(n)$、均摊 $O(\log n)$”分别表达什么？
