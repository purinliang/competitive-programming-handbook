# FHQ Treap

> 最近修订：2026-08-17 09:28 +10:00（未审阅）

有一个初始序列 `1,2,...,n`，需要反复翻转闭区间 `[l,r]`。例如：

```text
1 2 3 4 5 6
翻转 [2, 5]
1 5 4 3 2 6
```

`vector` 的一次区间翻转需要 $O(r-l+1)$ 时间。若把序列表示成一棵能够按照
位置拆分与合并的平衡树，就可以：

1. 把前 `l-1` 个元素拆出来；
2. 再拆出接下来的 `r-l+1` 个元素；
3. 给中间部分打一个翻转标记；
4. 按原顺序合并三部分。

FHQ Treap 不使用旋转，核心操作只有 `split` 与 `merge`。本篇使用节点在序列中
的位置作为隐式键，因此也常称为隐式 Treap；它特别适合维护可拆分、可拼接的
动态序列。

## 树怎样表示一个序列

对树做中序遍历，得到的节点值就是当前序列。节点保存：

- `value`：这个位置的值；
- `priority`：随机优先级；
- `size`：子树元素数量；
- `left`、`right`：左右儿子；
- `reversed`：整棵子树是否还需要翻转。

节点没有显式保存“当前位置”。一个节点前面有多少个元素，由左子树大小与所有
祖先关系共同决定。因此，插入、删除或翻转以后，不必逐项修改位置编号。

树按随机优先级满足小根堆。随机优先级使期望树高为 $O(\log n)$。

## 按元素数量拆分

`split(u,count)` 把以 `u` 为根的序列拆成两棵树：

- 第一棵恰好包含前 `count` 个元素；
- 第二棵包含剩余元素。

设左子树大小为 `left_size`。

若 `count <= left_size`，分界线位于左子树内部。递归拆分左儿子以后：

- 递归得到的前半部分直接成为总结果的第一棵树；
- 递归得到的后半部分接回 `u` 的左儿子；
- `u` 成为总结果第二棵树的根。

```cpp
auto [x, y] = split(tree[u].left, count);
tree[u].left = y;
pull(u);
return {x, u};
```

若 `count > left_size`，节点 `u` 与整个左子树都属于第一部分。进入右子树时，
还需要放入第一部分的元素数量变成：

$$
count-left\_size-1.
$$

拆分只沿一条根到叶的路径，期望复杂度为 $O(\log n)$。

## 合并两段相邻序列

`merge(x,y)` 的前提是：`x` 中所有元素在序列中都位于 `y` 之前。

两棵树的根谁在上方，由随机优先级决定：

- 若 `x` 的优先级较小，让 `x` 继续做根，并把 `x` 的右子树与 `y` 合并；
- 否则让 `y` 做根，并把 `x` 与 `y` 的左子树合并。

```cpp
if (tree[x].priority < tree[y].priority) {
    tree[x].right = merge(tree[x].right, y);
    pull(x);
    return x;
}

tree[y].left = merge(x, tree[y].left);
pull(y);
return y;
```

因为 `x` 始终整体位于 `y` 之前，中序顺序不会改变；选择随机优先级较小的根，
则保持 Treap 的堆性质。

## 延迟翻转整棵子树

翻转一段序列时，它的左右次序完全颠倒。对表示这段序列的子树：

1. 交换左右儿子；
2. 翻转 `reversed` 标记。

```cpp
void apply_reverse(int u) {
    if (u == 0) {
        return;
    }
    swap(tree[u].left, tree[u].right);
    tree[u].reversed = !tree[u].reversed;
}
```

不必立即访问所有后代。以后要进入这个节点的儿子以前，再把标记分别作用给两个
儿子，并清除当前标记。这与线段树懒标记相同：完整覆盖的结构先整体记录，只有
真正向下访问时才传播。

`split`、`merge` 和最终中序遍历都会依赖左右儿子的真实顺序，所以进入递归以前
必须先 `push(u)`。

## 翻转一个区间

设整棵树根为 `root`。

第一次拆分：

```cpp
auto [prefix, rest] = split(root, l - 1);
```

第二次拆分：

```cpp
auto [middle, suffix] = split(rest, r - l + 1);
```

此时：

- `prefix` 表示 `[1,l-1]`；
- `middle` 表示 `[l,r]`；
- `suffix` 表示 `[r+1,n]`。

给 `middle` 打翻转标记，再按照原段落顺序合并：

```cpp
apply_reverse(middle);
root = merge(prefix, merge(middle, suffix));
```

一次操作包含两次拆分与两次合并，期望时间为 $O(\log n)$。

## 完整代码

输入 $n$ 和 $m$，初始序列为 `1..n`。随后执行 $m$ 次区间翻转，最后输出序列。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct FHQTreap {
    struct Node {
        int value;
        uint32_t priority;
        int size;
        int left;
        int right;
        bool reversed;
    };

    int root;
    int node_count;
    vector<Node> tree;
    mt19937 rng;

    FHQTreap(int maximum_nodes)
        : root(0), node_count(0), tree(maximum_nodes + 5),
          rng(chrono::steady_clock::now().time_since_epoch().count()) {}

    int size(int u) const {
        return tree[u].size;
    }

    void pull(int u) {
        tree[u].size = size(tree[u].left) + size(tree[u].right) + 1;
    }

    void apply_reverse(int u) {
        if (u == 0) {
            return;
        }
        swap(tree[u].left, tree[u].right);
        tree[u].reversed = !tree[u].reversed;
    }

    void push(int u) {
        if (u == 0 || !tree[u].reversed) {
            return;
        }
        apply_reverse(tree[u].left);
        apply_reverse(tree[u].right);
        tree[u].reversed = false;
    }

    int new_node(int value) {
        int u = ++node_count;
        tree[u] = {value, (uint32_t)rng(), 1, 0, 0, false};
        return u;
    }

    pair<int, int> split(int u, int count) {
        if (u == 0) {
            return {0, 0};
        }

        push(u);
        int left_size = size(tree[u].left);

        if (count <= left_size) {
            auto [x, y] = split(tree[u].left, count);
            tree[u].left = y;
            pull(u);
            return {x, u};
        }

        auto [x, y] = split(tree[u].right, count - left_size - 1);
        tree[u].right = x;
        pull(u);
        return {u, y};
    }

    int merge(int x, int y) {
        if (x == 0 || y == 0) {
            return x + y;
        }

        if (tree[x].priority < tree[y].priority) {
            push(x);
            tree[x].right = merge(tree[x].right, y);
            pull(x);
            return x;
        }

        push(y);
        tree[y].left = merge(x, tree[y].left);
        pull(y);
        return y;
    }

    void push_back(int value) {
        root = merge(root, new_node(value));
    }

    void reverse_interval(int l, int r) {
        auto [prefix, rest] = split(root, l - 1);
        auto [middle, suffix] = split(rest, r - l + 1);
        apply_reverse(middle);
        root = merge(prefix, merge(middle, suffix));
    }

    void collect(int u, vector<int>& sequence) {
        if (u == 0) {
            return;
        }

        push(u);
        collect(tree[u].left, sequence);
        sequence.push_back(tree[u].value);
        collect(tree[u].right, sequence);
    }

    vector<int> to_vector() {
        vector<int> sequence;
        sequence.reserve(size(root));
        collect(root, sequence);
        return sequence;
    }
};

void solve() {
    int n, m;
    cin >> n >> m;

    FHQTreap sequence(n);
    for (int value = 1; value <= n; value++) {
        sequence.push_back(value);
    }

    while (m--) {
        int l, r;
        cin >> l >> r;
        sequence.reverse_interval(l, r);
    }

    vector<int> answer = sequence.to_vector();
    for (int i = 0; i < n; i++) {
        cout << answer[i] << (i + 1 == n ? '\n' : ' ');
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 与旋转 Treap 的区别

上一章的旋转 Treap 以键值作为显式搜索依据，直接实现动态有序多重集合。
FHQ Treap 把结构变化统一写成拆分和合并：

- 按键值拆分，同样可以维护有序集合；
- 按子树大小拆分，可以维护动态序列；
- 在节点上加入可合并统计和懒标记，可以支持区间操作。

两者都依靠随机优先级获得期望平衡。FHQ Treap 并不是在所有题目中都更优；
若只要排名和平衡集合，旋转 Treap 的操作语义很直接。需要反复切开、拼接序列
或制作可持久化版本时，`split` 与 `merge` 往往更自然。

## 可以继续扩展什么

若节点额外维护子树和、最大值或其他可合并信息，就能在拆出区间后直接读取统计。
若加入区间加等懒标记，需要像翻转标记一样规定：

1. 标记怎样作用于当前节点统计；
2. 多个标记怎样组合；
3. 进入儿子以前怎样下传。

这些扩展都来自具体区间操作，不应为了追求“万能模板”一次塞入所有标记。

## 常见错误

- 忘记 FHQ Treap 的序列顺序由中序遍历决定；
- `split(u,count)` 把 `count` 误解为数组下标，而不是第一棵树的元素数量；
- 进入右子树拆分时忘记减去左子树大小和当前节点；
- `merge(x,y)` 时没有保证 `x` 整体位于 `y` 之前；
- 拆分、合并或遍历前忘记下传翻转标记；
- 打翻转标记时只交换儿子，却没有翻转 `reversed`；
- 两次拆分后按错误顺序合并三段；
- 把随机优先级写成有序值，使树退化成长链；
- 为了未来可能出现的操作提前加入大量没有使用的统计与懒标记。

## 需要记住什么

- 隐式 Treap 怎样用子树大小表示位置？
- `split(u,count)` 返回的两棵树各包含哪些元素？
- `merge(x,y)` 需要满足什么前提？
- 为什么拆分和合并都能保持随机堆性质与中序顺序？
- 区间 `[l,r]` 怎样通过两次拆分被单独取出？
- 翻转标记怎样作用、何时下传？
- 旋转 Treap 与 FHQ Treap 分别更自然地服务什么操作？
