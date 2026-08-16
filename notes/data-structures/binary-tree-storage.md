# 二叉树的存储

> 最近修订：2026-08-16 14:43 +10:00（未审阅）

[二叉树的基本概念](binary-tree-concepts.md) 已经说明：左、右位置本身就是二叉树
结构的一部分。现在换到数据结构视角，让每个节点明确保存自己的值、左子节点和右
子节点，以便后续按照这个结构访问数据。

## 节点编号与节点值

![二叉树的节点编号、值与左右孩子](../assets/data-structures/binary-tree-storage.svg)

图中圆内的大号数字是节点存储的值 `value`，圆外的小号数字是从 $1$ 开始的节点编号。编号用于在程序中识别节点，值才是题目交给这个节点的数据，两者不能混为一谈。

例如，编号为 $3$ 的节点存储值 $10$。它没有左子节点，右子节点编号为 $6$。编号为 $5$ 的节点只有左子节点 $7$；如果把节点 $7$ 改成它的右子节点，二叉树的结构就会改变。

整棵树可以写成下表。`0` 表示对应位置没有子节点：

| 节点编号 | `value` | `left_child` | `right_child` |
| --- | --- | --- | --- |
| 1 | 8 | 2 | 3 |
| 2 | 3 | 4 | 5 |
| 3 | 10 | 0 | 6 |
| 4 | 1 | 0 | 0 |
| 5 | 6 | 7 | 0 |
| 6 | 14 | 0 | 0 |
| 7 | 4 | 0 | 0 |

## 孩子数组

节点编号是 `1, 2, ..., n` 时，可以直接用数组保存表中的每一列：

```cpp
int n;
vector<int> value;
vector<int> left_child;
vector<int> right_child;
```

于是 `left_child[u]` 和 `right_child[u]` 分别是节点 $u$ 的左、右子节点编号。编号 `0` 不属于实际节点，正好可以表示这个孩子不存在。

读到节点数以后，按照统一的 `+5` 余量初始化：

```cpp
value.assign(n + 5, 0);
left_child.assign(n + 5, 0);
right_child.assign(n + 5, 0);
```

这种表示与普通树的孩子表不同。即使 `vector<int> tree[u]` 按顺序保存孩子，遇到
只有一个孩子的节点时，仍然无法判断它占据左侧还是右侧。只有额外保存左右标签或
两个固定槽位才能补足信息；后一种做法就是孩子数组。

竞赛题直接给出节点编号时，孩子数组通常是最简单的表示。

## 节点结构体

也可以让每个节点直接保存值以及指向两个孩子的指针：

```cpp
struct Node {
    int value;
    Node* left;
    Node* right;
};
```

孩子不存在时，对应指针使用 `nullptr`。例如一个值为 `8`、暂时没有孩子的节点可以写成：

```cpp
Node root = {8, nullptr, nullptr};
```

结构体把属于同一个节点的信息放在一起，适合动态创建、插入或删除节点的树形数据结构。数组下标则更贴近大多数竞赛题给出的整数编号，也更容易统一管理内存。两种写法表达的是同一种左、右孩子关系。

普通二叉树不能直接假设左右孩子位于 `2 * u` 和 `2 * u + 1`。这套公式依赖一种
特殊形态和编号方式，将在 [完全二叉树](complete-binary-tree.md) 中单独推导。

## 从孩子关系找根

有些输入只给出每个节点的左右孩子，没有另外给出根。除根以外，每个节点都恰好
作为某个节点的左孩子或右孩子出现一次；根从不作为任何节点的孩子出现。

读入时标记出现过的孩子：

```cpp
if (left_child[u] != 0) {
    is_child[left_child[u]] = true;
}
if (right_child[u] != 0) {
    is_child[right_child[u]] = true;
}
```

最后唯一满足 `is_child[u] == false` 的真实节点就是根。这个方法依赖输入确实是一棵
合法二叉树；若存在多个未被标记的节点，输入表示的是多棵树或不连通结构。

## 叶节点

在有根二叉树中，没有左孩子也没有右孩子的节点是叶节点：

```cpp
left_child[u] == 0 && right_child[u] == 0
```

只有一个孩子的节点不是叶节点。判断时必须同时检查左右两个位置，不能只看其中
一侧。

## 完整代码

下面的程序读取一棵使用孩子数组表示的二叉树。输入先给节点数 `n`，随后第 `u` 行给出节点 `u` 的 `value`、`left_child` 和 `right_child`。程序找出根，再输出叶节点数量，以及每个叶节点的编号和值。

```cpp
#include <bits/stdc++.h>
using namespace std;

int n;
vector<int> value;
vector<int> left_child;
vector<int> right_child;
vector<int> is_child;

void solve() {
    scanf("%d", &n);

    value.assign(n + 5, 0);
    left_child.assign(n + 5, 0);
    right_child.assign(n + 5, 0);
    is_child.assign(n + 5, false);

    for (int u = 1; u <= n; u++) {
        scanf("%d%d%d", &value[u], &left_child[u], &right_child[u]);

        if (left_child[u] != 0) {
            is_child[left_child[u]] = true;
        }
        if (right_child[u] != 0) {
            is_child[right_child[u]] = true;
        }
    }

    int root = 0;
    for (int u = 1; u <= n; u++) {
        if (!is_child[u]) {
            root = u;
        }
    }

    vector<int> leaves;
    for (int u = 1; u <= n; u++) {
        if (left_child[u] == 0 && right_child[u] == 0) {
            leaves.push_back(u);
        }
    }

    printf("root = %d\n", root);
    int leaf_count = leaves.size();
    printf("leaves = %d\n", leaf_count);
    for (int u : leaves) {
        printf("%d %d\n", u, value[u]);
    }
}

int main() {
    solve();
    return 0;
}
```

对应上图的输入是：

```text
7
8 2 3
3 4 5
10 0 6
1 0 0
6 7 0
14 0 0
4 0 0
```

输出为：

```text
root = 1
leaves = 3
4 1
6 14
7 4
```

## 基础练习

1. 遍历孩子数组，统计左右孩子都为 `0` 的叶节点数量。
2. 输入没有直接给出根节点时，用一个布尔数组标记哪些节点曾作为孩子出现，找出唯一没有父节点的根。
3. 检查输入中是否存在一个孩子被两个不同节点引用；解释这种输入为什么不是一棵树。

## 需要记住什么

- 节点编号和节点值分别承担什么作用？
- 孩子数组中的 `0` 表示什么？
- 普通孩子表为什么不足以完整表示只有一个孩子的二叉树节点？
- 孩子数组与节点结构体分别适合什么场景？
- 只给左右孩子关系时，怎样找出根节点？
- 怎样判断一个节点是不是叶节点？
