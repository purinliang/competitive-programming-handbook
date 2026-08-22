# 整体二分

> 最近修订：2026-08-23 06:11 +10:00（未审阅）

给定一个数组和很多次区间第 $k$ 小查询。对每次查询单独二分答案时，都要反复统计
区间内有多少元素不超过中点；若每次统计都扫描区间，总复杂度仍然很高。

这些查询面对同一个数组，也在同一个值域中二分。整体二分把“每个查询各自二分”改成
“一批查询共同二分”：当前答案范围相同的查询一起统计、一起分到左半或右半，再递归
处理。一次扫描得到的数据结构贡献可以服务整批查询。

## 把数组元素看成加入事件

数组元素 `a[pos]` 可以表示成一条加入事件：

```text
在位置 pos 加入一个值为 value 的元素
```

当答案中点为 `mid` 时，只把 `value <= mid` 的元素位置加入树状数组。此时：

```cpp
fenwick.query(r) - fenwick.query(l - 1)
```

恰好等于区间 `[l,r]` 中不超过 `mid` 的元素数量。

## 查询怎样分流

设当前查询要找区间第 `k` 小，统计结果为 `count`：

- 若 `count >= k`，第 `k` 小不超过 `mid`，查询进入左半值域；
- 若 `count < k`，答案大于 `mid`，查询进入右半值域，并把目标排名改为
  `k - count`。

第二种情况下，左半值域中已有 `count` 个元素确定排在答案前面。进入右半后只需寻找
剩余元素中的第 `k-count` 小。

```cpp
if (count >= operation.k) {
    left.push_back(operation);
} else {
    operation.k -= count;
    right.push_back(operation);
}
```

## 加入事件怎样分流

加入事件自身也按值域中点分开：

- `value <= mid` 的事件属于左半，并暂时加入树状数组；
- `value > mid` 的事件属于右半，不加入。

当前层结束后，必须撤销本层加入的全部位置，再递归处理左右两侧：

```cpp
for (const Operation& operation : left) {
    if (operation.type == UPDATE) {
        fenwick.add(operation.pos, -1);
    }
}
```

树状数组只是当前递归层的临时统计工具。忘记撤销会让兄弟递归区间继承不属于自己的
元素。

## 递归边界就是答案

递归维护答案闭区间 `[value_left,value_right]`。当两端相等时，这批查询已经没有
其他可能答案：

```cpp
if (value_left == value_right) {
    for (const Operation& operation : operation) {
        if (operation.type == QUERY) {
            answer[operation.id] = value_left;
        }
    }
    return;
}
```

整体二分的递归区间是答案值域，不是数组下标区间。树状数组维护的才是位置维度。

## 正确性直觉

在递归节点 `[value_left,value_right]` 中，每条查询的真实答案都位于这个值域。

加入全部 `value <= mid` 的位置后，树状数组准确给出查询区间中落在左半值域的元素
数 `count`。若 `count >= k`，第 `k` 小必在左半；否则左半全部 `count` 个元素
都排在答案之前，去掉它们后应在右半寻找第 `k-count` 小。

每次分流都保留真实答案所在的一半。值域缩成单点时，这个值就是查询答案。

## 完整代码

给定长度为 $n$ 的数组和 $q$ 次静态查询，每次给出 `l r k`，输出闭区间 `[l,r]`
中的第 `k` 小值。数组值可以为负数。

```cpp
#include <bits/stdc++.h>
using namespace std;

enum OperationType { UPDATE, QUERY };

struct Operation {
    OperationType type;
    int pos;
    int value;
    int l;
    int r;
    int k;
    int id;
};

struct FenwickTree {
    int n;
    vector<int> tree;

    FenwickTree(int size = 0) : n(size), tree(n + 5) {}

    void add(int x, int value) {
        while (x <= n) {
            tree[x] += value;
            x += x & -x;
        }
    }

    int query(int x) const {
        int answer = 0;
        while (x > 0) {
            answer += tree[x];
            x -= x & -x;
        }
        return answer;
    }

    int query(int l, int r) const {
        return query(r) - query(l - 1);
    }
};

int n, q;
FenwickTree fenwick;
vector<int> answer;

void solve(int value_left, int value_right, vector<Operation> operation) {
    if (operation.empty()) {
        return;
    }

    if (value_left == value_right) {
        for (const Operation& current : operation) {
            if (current.type == QUERY) {
                answer[current.id] = value_left;
            }
        }
        return;
    }

    int mid = value_left + (value_right - value_left) / 2;
    vector<Operation> left;
    vector<Operation> right;
    left.reserve(operation.size());
    right.reserve(operation.size());

    for (Operation current : operation) {
        if (current.type == UPDATE) {
            if (current.value <= mid) {
                fenwick.add(current.pos, 1);
                left.push_back(current);
            } else {
                right.push_back(current);
            }
            continue;
        }

        int count = fenwick.query(current.l, current.r);
        if (count >= current.k) {
            left.push_back(current);
        } else {
            current.k -= count;
            right.push_back(current);
        }
    }

    for (const Operation& current : left) {
        if (current.type == UPDATE) {
            fenwick.add(current.pos, -1);
        }
    }

    solve(value_left, mid, move(left));
    solve(mid + 1, value_right, move(right));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> q;

    vector<Operation> operation;
    operation.reserve(n + q);

    int minimum_value = INT_MAX;
    int maximum_value = INT_MIN;

    for (int pos = 1; pos <= n; ++pos) {
        int value;
        cin >> value;
        minimum_value = min(minimum_value, value);
        maximum_value = max(maximum_value, value);
        operation.push_back({UPDATE, pos, value, 0, 0, 0, 0});
    }

    answer.resize(q + 5);
    for (int id = 1; id <= q; ++id) {
        int l, r, k;
        cin >> l >> r >> k;
        operation.push_back({QUERY, 0, 0, l, r, k, id});
    }

    fenwick = FenwickTree(n);
    solve(minimum_value, maximum_value, move(operation));

    for (int id = 1; id <= q; ++id) {
        cout << answer[id] << '\n';
    }
    return 0;
}
```

树状数组是整段算法共享的唯一工作区，因此直接作为全局对象保存，避免把同一个结构
跨越每层递归反复传参。

## 复杂度

答案值域每次减半，共递归 $O(\log V)$ 层，其中 $V$ 是最大值与最小值之间的范围。
每一层中，每条加入事件或查询事件只进入一个递归节点，并执行常数次
$O(\log n)$ 的树状数组操作。

总时间复杂度为 $O((n+q)\log V\log n)$，额外空间复杂度为
$O(n+q+n)$。若先离散化数组值，可以把值域层数写成 $O(\log n)$，并在叶子处映射回
原值。

## 动态修改怎样扩展

带单点修改的区间第 $k$ 小会把一次修改拆成“旧值删除”和“新值加入”两条带正负权的
事件，并且所有事件与查询必须保持原时间顺序。整体二分的分流框架不变，但统计贡献时
只能让当前查询看到它之前发生的修改。

这正是“整体处理操作序列”比静态版本更有价值的地方。不过动态版本的事件组织容易
掩盖基本思想，本文先用静态问题把值域分流、排名修正和回滚解释清楚。

## 与并行二分的区别

并行二分通常让每个查询保留自己的左右边界，按中点分桶；每一轮从头扫描修改，更新
一批查询的边界。整体二分则递归划分答案值域，同时把事件和查询稳定地分到左右子问题。

两者都利用“一批单调查询共享计算”，但事件组织和适合的问题模型不同。本文讲的是
整体二分，不把两个名称当成完全同义词。

## 常见错误

- 把递归区间 `[value_left,value_right]` 当成数组下标区间；
- `count < k` 时把查询送往右侧，却忘记令 `k -= count`；
- 递归左侧前没有撤销当前层加入树状数组的事件；
- 在动态版本中改变事件相对时间顺序，使查询看到未来修改；
- 值域含负数时用 `(left + right) / 2`，忽略溢出和向零取整差异；
- 把整体二分、普通答案二分和并行二分三个框架混成同一个模板。

## 需要记住什么

- 整体二分递归划分的是哪个维度？
- 数组元素为什么可以表示成加入事件？
- 树状数组在当前递归层统计什么？
- 查询进入右半值域时为什么要减小 `k`？
- 为什么递归兄弟区间之间必须回滚数据结构？
- 动态修改版本为什么必须保持事件时间顺序？
- 整体二分与并行二分在组织方式上有什么区别？
