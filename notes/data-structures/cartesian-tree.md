# 笛卡尔树

> 最近修订：2026-08-17 08:52 +10:00（未审阅）

给定一个数组，考虑一个看似需要枚举所有区间的问题：

> 求所有非空连续子数组的最小值之和。

数组有 $O(n^2)$ 个子数组。若逐个区间寻找最小值，总时间会达到 $O(n^3)$；
即使使用区间最小值查询，仍然要枚举 $O(n^2)$ 个区间。

换一个角度：不枚举“每个区间的最小值是谁”，而是对每个位置 `u` 计算：

> 有多少个子数组把 `a[u]` 选作代表最小值？

笛卡尔树把数组位置与最值之间的包含关系组织成一棵二叉树，使这个数量可以由
左右子树大小直接得到。

## 同时满足顺序与大小关系

数组的最小笛卡尔树满足两条性质：

1. 对树做中序遍历，节点编号依次为 `1,2,...,n`；
2. 每个父亲的数组值不大于儿子的数组值。

第一条保留数组的左右顺序，第二条是小根堆性质。

例如，整个数组的最小值一定是树根。它左边的数组区间递归形成左子树，右边的
数组区间递归形成右子树。因此，每个节点的子树都对应原数组中的一个连续区间。

若每次扫描区间寻找最小值再递归建树，严格递增数组会退化到 $O(n^2)$。真正
有用的是：利用单调栈在线性时间内完成同一棵树的构造。

## 从左到右加入新节点

已经处理 `1..i-1`，现在加入位置 `i`。单调栈保存当前笛卡尔树最右侧的一条链，
链上数组值从栈底到栈顶不下降。

只要栈顶值大于 `a[i]`，它就不能继续位于 `i` 的祖先链上：新节点更小，而且
位置在它右边。不断弹栈，并记住最后一个被弹出的节点：

```cpp
int last = 0;
while (!stack.empty() && a[stack.back()] > a[i]) {
    last = stack.back();
    stack.pop_back();
}
```

弹栈结束后有两条连接关系：

- 若栈非空，当前栈顶是 `i` 左侧最近且值不大于 `a[i]` 的祖先，`i` 成为它的
  右儿子；
- 最后弹出的 `last` 所代表的整段位于 `i` 左侧，又都比 `a[i]` 大，因此成为
  `i` 的左儿子。

```cpp
if (!stack.empty()) {
    right_child[stack.back()] = i;
}
left_child[i] = last;
stack.push_back(i);
```

每个节点只会入栈一次、出栈至多一次，所以构造时间为 $O(n)$。

## 相等元素怎样处理

本文只在 `a[stack.back()] > a[i]` 时弹栈，不在相等时弹栈。因此，相等的较早
位置会留在上方，相等的较晚位置倾向于进入其右侧。

这样仍然满足父亲值不大于儿子的堆性质，并为每个子数组规定了唯一代表：若最小
值出现多次，把最靠左的最小值作为代表。若把条件改成 `>=`，则会选择另一套
同样合法的相等值约定，但整篇推导和实现必须保持一致。

## 一个节点代表多少个子数组

设节点 `u` 的左子树有 `left_size` 个节点，右子树有 `right_size` 个节点。
由于中序遍历等于数组顺序：

- 子数组左端点可以从 `u` 或左子树中的任意位置选择，共 `left_size+1` 种；
- 子数组右端点可以从 `u` 或右子树中的任意位置选择，共 `right_size+1` 种。

这些选择组成的每个子数组都包含 `u`，且完全位于 `u` 的子树区间中。小根堆
性质保证 `a[u]` 不大于其中其他值；相等值约定保证该区间唯一归给 `u`。

因此，`a[u]` 作为代表最小值的子数组数量为：

$$
(left\_size+1)\cdot(right\_size+1).
$$

它对答案的贡献为：

$$
a[u]\cdot(left\_size+1)\cdot(right\_size+1).
$$

对所有节点求和，就计算了全部非空子数组的最小值之和。

## 不递归计算子树大小

笛卡尔树在单调数组上可能退化成一条长度为 $n$ 的链。递归 DFS 可能超过调用栈
限制，因此完整代码使用显式栈获得遍历顺序，再反向计算子树大小：

1. 从根出发，把父亲先放入 `order`，再把儿子加入栈；
2. 反向遍历 `order`，此时儿子的子树大小一定已经计算；
3. `subtree_size[u] = 1 + 左子树大小 + 右子树大小`。

构造结束后，单调栈最底部的节点就是根。

## 完整代码

输入数组元素可以相等。题目保证最终答案在 64 位整数范围内。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

int n;
vector<ll> a;
vector<int> left_child;
vector<int> right_child;
vector<int> subtree_size;

int build_cartesian_tree() {
    vector<int> stack;
    stack.reserve(n);

    for (int i = 1; i <= n; i++) {
        int last = 0;

        while (!stack.empty() && a[stack.back()] > a[i]) {
            last = stack.back();
            stack.pop_back();
        }

        if (!stack.empty()) {
            right_child[stack.back()] = i;
        }
        left_child[i] = last;
        stack.push_back(i);
    }

    return stack.front();
}

ll sum_of_subarray_minimums(int root) {
    vector<int> order;
    vector<int> stack;
    order.reserve(n);
    stack.push_back(root);

    while (!stack.empty()) {
        int u = stack.back();
        stack.pop_back();
        order.push_back(u);

        if (left_child[u] != 0) {
            stack.push_back(left_child[u]);
        }
        if (right_child[u] != 0) {
            stack.push_back(right_child[u]);
        }
    }

    ll answer = 0;

    for (int index = (int)order.size() - 1; index >= 0; index--) {
        int u = order[index];
        int left_size = subtree_size[left_child[u]];
        int right_size = subtree_size[right_child[u]];

        subtree_size[u] = left_size + right_size + 1;
        answer += a[u] * (left_size + 1LL) * (right_size + 1LL);
    }

    return answer;
}

void solve() {
    cin >> n;

    a.assign(n + 5, 0);
    left_child.assign(n + 5, 0);
    right_child.assign(n + 5, 0);
    subtree_size.assign(n + 5, 0);

    for (int i = 1; i <= n; i++) {
        cin >> a[i];
    }

    int root = build_cartesian_tree();
    cout << sum_of_subarray_minimums(root) << '\n';
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 笛卡尔树还保存了什么

对任意数组区间 `[l,r]`，位置 `l` 与 `r` 在最小笛卡尔树中的最近公共祖先，
就是该区间按照本文相等值约定选出的代表最小值位置。因此，静态区间最小值问题
可以转换成树上的最近公共祖先问题。

这个联系并不意味着查询最小值时一定要使用笛卡尔树。若只需要静态区间最值，
稀疏表往往更直接；若需要所有子数组最值的贡献或研究区间最值的层次关系，
笛卡尔树的结构才真正有价值。

最大笛卡尔树只需反转比较方向，使父亲值不小于儿子值。它可以用同样方式处理
所有子数组最大值或与区间最大值有关的结构。

## 常见错误

- 只记住“小根堆”，忘记中序遍历必须还原原数组顺序；
- 弹栈后把 `last` 接成 `i` 的右儿子，破坏数组左右顺序；
- 栈非空时忘记把 `i` 设为当前栈顶的右儿子；
- 对相等元素一会儿使用 `>`、一会儿使用 `>=`，导致区间重复或遗漏归属；
- 把最后一个栈顶误当成根；根应是构造结束后的栈底；
- 在可能退化为长链时使用没有深度保护的递归 DFS；
- 计算贡献时使用整棵子树大小，忘记左右端点选择数分别是左右子树大小加 1。

## 需要记住什么

- 笛卡尔树同时满足哪两条性质？
- 单调栈中保存的是笛卡尔树的哪一部分？
- 新节点 `i` 与当前栈顶、最后弹出节点分别是什么关系？
- 本文怎样为相等的最小值规定唯一代表？
- 为什么一个节点代表的子数组数量是左右子树大小加 1 的乘积？
- 为什么建树是 $O(n)$，又为什么完整代码避免递归遍历？
