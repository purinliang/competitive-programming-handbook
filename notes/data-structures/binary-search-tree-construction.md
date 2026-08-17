# 二叉搜索树的概念与构造

> 最近修订：2026-08-17 01:45 +10:00（未审阅）

在无序序列中查找一个值，最坏要逐个检查。若能把较小值和较大值分到不同方向，查找时就可以根据一次比较排除其中一边。

**二叉搜索树**（binary search tree，BST）在普通二叉树的左、右结构上增加键值顺序。本篇只学习定义、查找和按输入顺序逐个插入构造；删除、旋转与自动保持平衡不在这里展开。

## 键与顺序规则

每个节点保存一个用于比较的键 `key`。本篇采用严格规则：

- 左子树中的所有键都小于当前节点的键；
- 右子树中的所有键都大于当前节点的键；
- 左、右子树本身也分别是二叉搜索树。

这不是只比较当前节点与两个直接孩子。要求必须对整棵子树成立。

例如：

```text
        8
      /   \
     3     10
    / \      \
   1   6      14
```

节点 `8` 的整个左子树 `1,3,6` 都小于 `8`，整个右子树 `10,14` 都大于 `8`。节点 `3` 和 `10` 的子树也继续遵守同一规则。

## 重复键必须明确约定

二叉搜索树有多种重复键策略：

- 不建立重复节点，只保存一次；
- 在节点中增加出现次数；
- 约定相等键全部放到左侧或右侧；
- 让每个键对应一个保存多项记录的容器。

算法不能一边假设严格左小右大，一边又随意把相等键放入某侧。

本篇让每个不同键只对应一个节点，并使用 `frequency[u]` 记录出现次数：

```cpp
vector<int> frequency;
```

所以结构仍满足严格左小右大，重复输入只增加已有节点的频次。

## 查找

从根节点 `root` 开始寻找 `target`：

1. 当前节点为空，说明不存在；
2. `target == key[u]`，查找成功；
3. `target < key[u]`，只可能在左子树；
4. `target > key[u]`，只可能在右子树。

```cpp
int find(int target) {
    int u = root;

    while (u != 0) {
        if (target == key[u]) {
            return u;
        }
        if (target < key[u]) {
            u = left_child[u];
        } else {
            u = right_child[u];
        }
    }
    return 0;
}
```

每次只沿一个孩子继续，不必搜索另一棵子树。访问次数与树高 $h$ 成正比，时间复杂度是 $O(h)$。

## 插入位置怎样确定

插入一个尚不存在的键 `value` 时，沿用查找路径：

- `value < key[u]`，递归插入左子树；
- `value > key[u]`，递归插入右子树；
- 遇到空位置时，在这里建立新节点。

若 `value == key[u]`，本篇不建立新节点，只增加：

```cpp
frequency[u]++;
```

新节点只能放到查找最终遇到的空位置。若提前放到其他位置，可能破坏某个祖先要求的键值范围。

## 递归插入为什么返回子树根

定义：

```cpp
int insert(int u, int value)
```

表示“把 `value` 插入以 `u` 为根的子树，并返回插入后这棵子树的根”。

空子树会建立新节点并返回它：

```cpp
if (u == 0) {
    return create_node(value);
}
```

插入左子树后，把返回的根重新接回：

```cpp
left_child[u] = insert(left_child[u], value);
```

右子树同理。当前 `u` 本身没有改变时，最后返回 `u`：

```cpp
return u;
```

整棵树的根也必须接住返回值：

```cpp
root = insert(root, value);
```

第一次插入以前 `root = 0`，递归建立首节点并返回它；后续插入通常仍返回原根。

这种“递归函数返回修改后的子树根”会在删除和旋转中继续出现，但本篇只用它统一处理空树与普通子树的插入。

## 插入顺序决定形状

依次插入：

```text
8 3 10 1 6
```

会得到较分散的树：

```text
      8
    /   \
   3     10
  / \
 1   6
```

若依次插入已经升序的：

```text
1 3 6 8 10
```

每个新键都进入右子树，得到一条链：

```text
1
 \
  3
   \
    6
     \
      8
       \
        10
```

两棵树保存相同键集合，但形状和高度不同。普通二叉搜索树没有自动平衡保证：

- 形状较均衡时，树高可能是 $O(\log n)$；
- 极端链状时，树高是 $O(n)$；
- 因此查找和插入最坏都是 $O(n)$。

不能只因为使用了“二叉搜索树”这个名字，就宣称操作一定是 $O(\log n)$。平衡树会通过额外规则控制高度，属于后续数据结构。

本篇递归插入的调用深度也等于树高。极端链状输入不仅使总构造时间达到 $O(n^2)$，还可能耗尽调用栈；这正是普通 BST 不能无条件充当高性能有序容器的原因之一。

## 中序遍历为什么有序

[二叉树的遍历](binary-tree-traversals.md) 中，中序顺序是：

```text
左子树 -> 当前节点 -> 右子树
```

二叉搜索树的左子树键都更小，右子树键都更大；两棵子树又分别满足同一性质。因此中序遍历会按键的严格递增顺序访问不同节点。

若把每个键按照 `frequency[u]` 输出多次，得到包含重复项的非递减序列。

中序有序是二叉搜索树规则带来的性质，不是任意二叉树都具有的。

## 完整代码

下面用孩子数组构造二叉搜索树，重复键记录频次。程序输出中序序列，再回答若干次键出现次数查询。

```cpp
#include <bits/stdc++.h>
using namespace std;

int root;
int node_count;
vector<int> key;
vector<int> frequency;
vector<int> left_child;
vector<int> right_child;

int create_node(int value) {
    node_count++;
    key[node_count] = value;
    frequency[node_count] = 1;
    return node_count;
}

int insert(int u, int value) {
    if (u == 0) {
        return create_node(value);
    }

    if (value < key[u]) {
        left_child[u] = insert(left_child[u], value);
    } else if (value > key[u]) {
        right_child[u] = insert(right_child[u], value);
    } else {
        frequency[u]++;
    }

    return u;
}

int find(int target) {
    int u = root;

    while (u != 0) {
        if (target == key[u]) {
            return u;
        }
        if (target < key[u]) {
            u = left_child[u];
        } else {
            u = right_child[u];
        }
    }

    return 0;
}

void inorder(int u, vector<int>& result) {
    if (u == 0) {
        return;
    }

    inorder(left_child[u], result);

    for (int count = 1; count <= frequency[u]; count++) {
        result.push_back(key[u]);
    }

    inorder(right_child[u], result);
}

void solve() {
    int n;
    cin >> n;

    key.assign(n + 5, 0);
    frequency.assign(n + 5, 0);
    left_child.assign(n + 5, 0);
    right_child.assign(n + 5, 0);
    root = 0;
    node_count = 0;

    for (int i = 1; i <= n; i++) {
        int value;
        cin >> value;
        root = insert(root, value);
    }

    vector<int> result;
    inorder(root, result);

    int result_size = result.size();

    for (int i = 0; i < result_size; i++) {
        if (i > 0) {
            cout << ' ';
        }
        cout << result[i];
    }
    cout << '\n';

    int q;
    cin >> q;

    while (q--) {
        int target;
        cin >> target;

        int u = find(target);
        cout << (u == 0 ? 0 : frequency[u]) << '\n';
    }
}

int main() {
    solve();
    return 0;
}
```

输入：

```text
7
8 3 10 3 1 6 10
3
3
6
5
```

输出：

```text
1 3 3 6 8 10 10
2
1
0
```

## 需要记住什么

1. 二叉搜索树的左、右子树分别满足怎样的键值范围？
2. 重复键为什么必须显式约定处理策略？本篇采用什么策略？
3. 查找时为什么只需沿一棵子树继续？
4. 递归 `insert` 为什么返回修改后的子树根？
5. 为什么不同插入顺序会构造出不同形状？
6. 普通二叉搜索树的查找与插入为什么最坏仍是 $O(n)$？
7. 中序遍历为什么会按键的非递减顺序输出？
