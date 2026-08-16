# Treap

> 最近修订：2026-08-17 09:12 +10:00（未审阅）

在线排行榜需要不断执行以下操作：

- 插入一个分数；
- 删除一个分数的一次出现；
- 查询一个分数的排名；
- 查询排名第 $k$ 的分数；
- 查询严格小于或严格大于某个分数的最近值。

`set` 和 `multiset` 能插入、删除、找前驱与后继，却不能直接按子树大小查询排名
和第 $k$ 小。若自己建立普通二叉搜索树，有序输入会让它退化成链，单次操作从
$O(\log n)$ 变成 $O(n)$。

Treap 同时给每个节点保存一个随机优先级，使一棵树满足：

1. 按 `key` 是二叉搜索树；
2. 按随机 `priority` 是小根堆。

它的名字来自 Tree 与 Heap。键值决定中序顺序，随机优先级决定树形；随机树形
使期望高度为 $O(\log n)$。

## 节点需要保存什么

排行榜允许相同分数出现多次。每个不同键值只建立一个节点，并保存：

- `key`：分数；
- `priority`：随机优先级；
- `count`：这个分数出现多少次；
- `size`：整棵子树包含多少个元素，重复元素也分别计数；
- `left`、`right`：左右儿子编号。

节点编号 `0` 表示空节点，`tree[0].size == 0`。因此更新子树大小时不需要特判
空儿子：

```cpp
void pull(int u) {
    tree[u].size =
        tree[tree[u].left].size + tree[tree[u].right].size + tree[u].count;
}
```

子树大小是排名与第 $k$ 小查询的基础。每次改变儿子或 `count` 后，都必须重新
计算当前节点。

## 为什么需要旋转

按照二叉搜索树规则插入新键以后，键值顺序一定正确，但新节点的随机优先级可能
小于父亲，破坏小根堆性质。

旋转只改变局部父子关系，不改变中序遍历顺序：

- 左儿子的优先级更小时，执行右旋，让左儿子上升；
- 右儿子的优先级更小时，执行左旋，让右儿子上升。

右旋前后：

```text
        u                 v
       / \               / \
      v   C    ->        A   u
     / \                   / \
    A   B                 B   C
```

中序遍历始终是 `A,v,B,u,C`。右旋代码为：

```cpp
void rotate_right(int& u) {
    int v = tree[u].left;
    tree[u].left = tree[v].right;
    tree[v].right = u;
    pull(u);
    pull(v);
    u = v;
}
```

参数是 `int& u`，因为旋转以后这棵局部子树的根从 `u` 变成了 `v`。先更新下降
的旧根，再更新上升的新根。

左旋完全对称。

## 插入一个分数

在当前节点 `u` 插入 `key`：

1. 若 `u == 0`，建立新节点；
2. 若键值相等，只增加 `count`；
3. 若键值较小，递归插入左子树；否则插入右子树；
4. 若新儿子的优先级小于当前节点，通过旋转恢复小根堆；
5. 重新计算 `size`。

随机优先级与输入键值独立。因此，即使分数严格递增，树形也不会由输入顺序
固定成一条链。

## 删除一次出现

找到键值相等的节点以后：

- 若 `count > 1`，只减少一次出现；
- 若只有一个儿子或没有儿子，直接让当前根变成非空儿子；
- 若两个儿子都存在，让优先级更小的儿子旋转上升，再到下降后的旧根所在子树
  继续删除。

旋转删除保持二叉搜索树与随机堆两条性质。删除不存在的键时不改变树。

## 查询排名

本文定义一个键值 `key` 的排名为：

$$
1+\text{树中严格小于 key 的元素数量}.
$$

从根向下：

- 若 `key <= tree[u].key`，所有可能更小的元素仍在左子树；
- 若 `key > tree[u].key`，左子树和当前节点的所有出现都严格更小，可以一次加入
  答案，再进入右子树。

即使 `key` 尚未插入，仍然可以查询它若插入后会处于什么排名。

## 查询第 k 小

设左子树元素数量为 `left_size`：

- `k <= left_size`：答案在左子树；
- `left_size < k <= left_size + count`：答案就是当前键值；
- 否则进入右子树，并令 `k -= left_size + count`。

相同键值出现多次时，会占据连续的多个排名。

## 查询前驱与后继

严格前驱是所有小于 `key` 的键中的最大值。沿树向下：

- 当前键小于目标时，它是一个候选答案，并继续向右寻找更大的候选；
- 否则进入左子树。

严格后继完全对称。完整模板返回 `pair<bool,int>`：第一项表示答案是否存在，
第二项才是对应键值，避免使用某个可能与合法分数冲突的哨兵值。

## 完整代码

下面实现一个支持重复元素的动态有序多重集合。操作编号为：

1. 插入 `x`；
2. 删除 `x` 的一次出现；
3. 查询 `x` 的排名；
4. 查询第 `x` 小；
5. 查询 `x` 的严格前驱；
6. 查询 `x` 的严格后继。

输入保证第 4、5、6 类询问存在答案。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Treap {
    struct Node {
        int key;
        uint32_t priority;
        int count;
        int size;
        int left;
        int right;
    };

    int root;
    int node_count;
    vector<Node> tree;
    mt19937 rng;

    Treap(int maximum_nodes)
        : root(0), node_count(0), tree(maximum_nodes + 5),
          rng(chrono::steady_clock::now().time_since_epoch().count()) {}

    int size(int u) const {
        return tree[u].size;
    }

    void pull(int u) {
        tree[u].size = size(tree[u].left) + size(tree[u].right) + tree[u].count;
    }

    int new_node(int key) {
        int u = ++node_count;
        tree[u] = {key, (uint32_t)rng(), 1, 1, 0, 0};
        return u;
    }

    void rotate_left(int& u) {
        int v = tree[u].right;
        tree[u].right = tree[v].left;
        tree[v].left = u;
        pull(u);
        pull(v);
        u = v;
    }

    void rotate_right(int& u) {
        int v = tree[u].left;
        tree[u].left = tree[v].right;
        tree[v].right = u;
        pull(u);
        pull(v);
        u = v;
    }

    void insert(int& u, int key) {
        if (u == 0) {
            u = new_node(key);
            return;
        }

        if (key == tree[u].key) {
            tree[u].count++;
        } else if (key < tree[u].key) {
            insert(tree[u].left, key);
            if (tree[tree[u].left].priority < tree[u].priority) {
                rotate_right(u);
            }
        } else {
            insert(tree[u].right, key);
            if (tree[tree[u].right].priority < tree[u].priority) {
                rotate_left(u);
            }
        }

        pull(u);
    }

    void insert(int key) {
        insert(root, key);
    }

    void erase(int& u, int key) {
        if (u == 0) {
            return;
        }

        if (key < tree[u].key) {
            erase(tree[u].left, key);
        } else if (key > tree[u].key) {
            erase(tree[u].right, key);
        } else if (tree[u].count > 1) {
            tree[u].count--;
        } else if (tree[u].left == 0 || tree[u].right == 0) {
            u = tree[u].left + tree[u].right;
            return;
        } else if (tree[tree[u].left].priority < tree[tree[u].right].priority) {
            rotate_right(u);
            erase(tree[u].right, key);
        } else {
            rotate_left(u);
            erase(tree[u].left, key);
        }

        pull(u);
    }

    void erase(int key) {
        erase(root, key);
    }

    int rank(int key) const {
        int u = root;
        int result = 1;

        while (u != 0) {
            if (key <= tree[u].key) {
                u = tree[u].left;
            } else {
                result += size(tree[u].left) + tree[u].count;
                u = tree[u].right;
            }
        }

        return result;
    }

    int kth(int k) const {
        int u = root;

        while (u != 0) {
            int left_size = size(tree[u].left);

            if (k <= left_size) {
                u = tree[u].left;
            } else if (k <= left_size + tree[u].count) {
                return tree[u].key;
            } else {
                k -= left_size + tree[u].count;
                u = tree[u].right;
            }
        }

        return 0;
    }

    pair<bool, int> predecessor(int key) const {
        int u = root;
        pair<bool, int> result = {false, 0};

        while (u != 0) {
            if (tree[u].key < key) {
                result = {true, tree[u].key};
                u = tree[u].right;
            } else {
                u = tree[u].left;
            }
        }

        return result;
    }

    pair<bool, int> successor(int key) const {
        int u = root;
        pair<bool, int> result = {false, 0};

        while (u != 0) {
            if (tree[u].key > key) {
                result = {true, tree[u].key};
                u = tree[u].left;
            } else {
                u = tree[u].right;
            }
        }

        return result;
    }
};

void solve() {
    int q;
    cin >> q;

    Treap treap(q);

    while (q--) {
        int operation, x;
        cin >> operation >> x;

        if (operation == 1) {
            treap.insert(x);
        } else if (operation == 2) {
            treap.erase(x);
        } else if (operation == 3) {
            cout << treap.rank(x) << '\n';
        } else if (operation == 4) {
            cout << treap.kth(x) << '\n';
        } else if (operation == 5) {
            cout << treap.predecessor(x).second << '\n';
        } else {
            cout << treap.successor(x).second << '\n';
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

## 为什么是期望复杂度

优先级由独立随机数产生。对固定的一组不同键值，Treap 的树形等价于按照随机
顺序插入普通二叉搜索树，期望高度为 $O(\log n)$。插入、删除和查询都只沿一条
根到叶的路径，再进行常数次局部操作，所以期望时间为 $O(\log n)$。

“期望”不等于任何输入都严格保证树高为对数。随机数质量很差、优先级被输入
预测，或手动把优先级写成有序值，都可能失去平衡。竞赛模板使用 `mt19937`
生成优先级已经足够；不需要为了理论上的极小碰撞概率加入复杂补丁。

## Treap 解决的抽象操作

Treap 的核心价值不是“随机旋转”本身，而是维护一个会动态变化的有序多重集合，
并让每个节点可以附加子树统计。只要统计能从左右儿子与当前节点合并，就可以
在旋转后通过 `pull` 恢复，例如元素和、某种标记数量或其他排名信息。

若只需要插入、删除和按值查找，标准库 `set`、`multiset` 更短也更可靠；只有
需要第 $k$ 小、排名或题目特有的子树统计时，手写平衡树才有明显收益。

## 常见错误

- 键值与优先级使用同一种比较关系，破坏搜索树或堆性质；
- 旋转以后忘记修改局部子树根的引用；
- 旋转时先 `pull` 新根，再更新已经下降的旧根；
- 用重复节点代替 `count`，却没有统一相等键应该进入哪一侧；
- 修改 `count`、儿子或旋转后忘记更新 `size`；
- 删除有两个儿子的节点时直接丢弃一棵子树；
- 排名只统计左子树，忘记当前节点可能出现多次；
- 前驱与后继使用非严格比较，错误返回 `key` 自身；
- 只需标准库有序集合接口时仍手写 Treap，增加无必要的代码风险。

## 需要记住什么

- Treap 分别按什么信息满足二叉搜索树与堆性质？
- 旋转为什么不会改变中序顺序？
- 插入后怎样判断向哪个方向旋转？
- 删除有两个儿子的节点时，为什么先让优先级较小的儿子上升？
- `count` 与 `size` 分别统计什么？
- 怎样由左子树大小完成排名和第 $k$ 小查询？
- 什么情况下标准库容器已经足够，不值得手写平衡树？
