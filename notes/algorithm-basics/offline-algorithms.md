# 离线算法

> 最近修订：2026-08-17 05:14 +10:00（未审阅）

有些询问按照输入顺序处理很困难，但把全部询问读完以后，可以换一个更有利的
顺序统一处理。

这种先获得完整输入、允许重排处理顺序、最后再恢复原答案顺序的方法称为
**离线算法**。必须按询问到达顺序立即回答的方法称为**在线算法**。

离线不是“先把答案算好”，而是用全局视角重新组织工作，避免每个询问从头重复
计算。

## 问题：区间内不超过给定值的数

给定数组 `a[1..n]`，每个询问给出 `l,r,x`，要求统计闭区间 `[l,r]` 中
满足：

$$
a[i]\le x
$$

的位置数量。

逐个询问扫描区间需要 $O(nq)$。我们已经会用树状数组快速统计一批“已激活位置”
在区间中的数量，问题变成：怎样让已激活的位置恰好对应 `a[i] <= x`？

## 按数值从小到大激活

把数组元素写成：

```text
(value, position)
```

并按照 `value` 从小到大排序。询问也按照 `x` 从小到大排序。

处理当前询问以前，把所有满足：

```text
value <= x
```

但尚未加入的数据位置激活：

```cpp
while (pointer < n && elements[pointer].first <= query.x) {
    int position = elements[pointer].second;
    fenwick.add(position, 1);
    pointer++;
}
```

此时树状数组中的每个 `1` 恰好对应原数组中一个值不超过当前 `x` 的位置。
区间答案就是：

```cpp
fenwick.range_sum(query.l, query.r);
```

随着询问的 `x` 递增，已经激活的元素永远不需要删除；指针只向右移动一次。

## 为什么必须重排询问

若按输入顺序处理的 `x` 是：

```text
100, 3, 80, 1
```

处理完 `100` 后几乎所有位置都已激活；下一次 `x = 3` 又要撤销大量位置。
普通树状数组虽然能逐个删除，但会产生很多来回工作。

把询问按 `x` 排成：

```text
1, 3, 80, 100
```

激活集合只会扩大。离线排序把“任意变化的阈值”变成了一个单调移动的边界。

## 保存原询问编号

处理顺序可以改变，输出顺序不能改变。每个询问读入时保存原编号：

```cpp
struct Query {
    int l;
    int r;
    ll x;
    int id;
};
```

按照 `x` 排序后，把计算结果写入：

```cpp
answer[query.id] = result;
```

最后按照 `id = 1..q` 输出，就恢复了题目要求的顺序。

原编号是离线算法最常见也最重要的附加信息。只排序询问而不保留编号，通常会
得到数值正确、顺序错误的答案。

## 不变量

处理阈值为 `query.x` 的询问时，维护：

> 树状数组中位置 `i` 的值为 `1`，当且仅当 `a[i] <= query.x`。

排序后的数组元素从小到大加入：

- `while` 结束时，所有不超过 `x` 的元素都已加入；
- 指针停在第一个大于 `x` 的元素，任何不合法元素都尚未加入；
- 每个位置只加入一次。

因此树状数组区间和准确统计当前询问 `[l,r]` 内所有满足条件的位置。

## 哪些问题不能随意离线

离线处理需要提前得到全部操作，并允许改变计算顺序。以下场景通常不能直接离线：

- 交互题必须立即输出答案；
- 后一个操作通过前一个答案加密；
- 操作会修改数据，重排后语义发生变化；
- 题目明确要求流式处理，无法保存完整输入。

有修改并不代表永远不能离线，但必须设计能保持时间关系的更复杂算法，不能把
查询按一个关键字随意排序。

## 完整代码

下面回答所有区间计数询问。数组值与阈值使用 64 位整数，位置和计数使用
32 位整数。

```cpp
#include <bits/stdc++.h>
using namespace std;

typedef long long ll;

struct Fenwick {
    int n;
    vector<int> tree;

    void init(int size) {
        n = size;
        tree.assign(n + 5, 0);
    }

    void add(int x, int value) {
        while (x <= n) {
            tree[x] += value;
            x += x & -x;
        }
    }

    int prefix_sum(int x) const {
        int sum = 0;

        while (x > 0) {
            sum += tree[x];
            x -= x & -x;
        }
        return sum;
    }

    int range_sum(int l, int r) const {
        return prefix_sum(r) - prefix_sum(l - 1);
    }
};

struct Query {
    int l;
    int r;
    ll x;
    int id;
};

int n, q;
vector<pair<ll, int>> elements;
vector<Query> queries;
vector<int> answer;

void solve() {
    cin >> n >> q;

    elements.clear();
    elements.reserve(n);

    for (int i = 1; i <= n; i++) {
        ll value;
        cin >> value;
        elements.push_back({value, i});
    }

    queries.resize(q);
    answer.assign(q + 5, 0);

    for (int i = 0; i < q; i++) {
        cin >> queries[i].l;
        cin >> queries[i].r;
        cin >> queries[i].x;
        queries[i].id = i + 1;
    }

    sort(elements.begin(), elements.end());
    sort(
        queries.begin(),
        queries.end(),
        [](const Query& a, const Query& b) {
            return a.x < b.x;
        });

    Fenwick fenwick;
    fenwick.init(n);

    int pointer = 0;

    for (const Query& query : queries) {
        while (pointer < n &&
               elements[pointer].first <= query.x) {
            int position = elements[pointer].second;
            fenwick.add(position, 1);
            pointer++;
        }

        answer[query.id] =
            fenwick.range_sum(query.l, query.r);
    }

    for (int i = 1; i <= q; i++) {
        cout << answer[i] << '\n';
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

- 排序数组元素：$O(n\log n)$；
- 排序询问：$O(q\log q)$；
- 每个位置激活一次：$O(n\log n)$；
- 每个询问进行一次区间查询：$O(q\log n)$；
- 总时间复杂度：
  $O(n\log n+q\log q+q\log n)$；
- 空间复杂度：$O(n+q)$。

## 常见错误

- 重排询问后忘记保存和恢复原编号；
- 当前条件是 `a[i] <= x`，激活循环却写成严格小于；
- 元素值相同却只激活其中一个位置；
- 把排序后的元素下标加入树状数组，而不是原数组位置；
- 当前询问阈值变小仍继续沿用单调激活，说明询问没有正确排序；
- 含修改操作时随意重排，破坏原始时间顺序；
- 把“离线”误解为不需要输出原顺序答案。

## 需要记住什么

- 在线算法与离线算法的区别是什么？
- 为什么按 `x` 排序后，激活集合只增不减？
- 树状数组中维护的 `1` 具体代表什么？
- 为什么离线询问必须保存原编号？
- 哪些输入依赖会阻止我们随意重排操作？

