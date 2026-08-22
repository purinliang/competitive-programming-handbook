# CDQ 分治

> 最近修订：2026-08-23 04:45 +10:00（未审阅）

给定 $n$ 个三维点 $(x_i,y_i,z_i)$。对每个点，统计有多少个点同时满足：

$$
x_j\le x_i,\qquad y_j\le y_i,\qquad z_j\le z_i.
$$

逐对比较需要 $O(n^2)$。普通排序只能直接消去一个维度：按 $x$ 排序以后，排在
当前点前面的点都满足 $x_j\le x_i$，但仍要同时检查 $y$ 和 $z$。

CDQ 分治把其中一个维度变成递归顺序，再用数据结构处理剩余维度。它最典型的用途
是离线处理带时间顺序或偏序关系的问题。

## 三维偏序

如果点 $A$ 的三个坐标都不大于点 $B$，就说 $A$ 支配 $B$。本文把一个点自己也
计入答案。

先按 $(x,y,z)$ 的字典序排序。若只看 $x$，能够支配当前点的点一定不会排在它
后面。问题可以改写为：

> 对排序后的每个位置，统计前面有多少个点的 $y$ 和 $z$ 也不大于当前点。

这仍是二维限制，但已经少了一个维度。

## 按位置分治

把排序后的区间 $[l,r]$ 分成 $[l,mid]$ 和 $[mid+1,r]$：

1. 递归统计左半内部的贡献；
2. 递归统计右半内部的贡献；
3. 统计左半的点对右半的贡献。

第三步只考虑跨越中点的点对。左半点在原排序中不晚于右半点，因此已经满足
$x_{left}\le x_{right}$；只需判断：

$$
y_{left}\le y_{right},\qquad z_{left}\le z_{right}.
$$

这就是 CDQ 分治的核心：递归边界承担一个维度，合并过程处理另外两个维度。

## 按 y 合并

递归返回时，让左右两半分别按照 $y$ 有序。扫描右半点时，把所有满足
$y_{left}\le y_{right}$ 的左半点加入树状数组：

```cpp
while (i <= mid && point[i].y <= point[j].y) {
    fenwick.add(point[i].z, point[i].count);
    i++;
}

point[j].answer += fenwick.prefix_sum(point[j].z);
```

树状数组的下标是 $z$，其中保存已经加入的左半点数量。前缀和恰好统计
$z_{left}\le z_{right}$ 的点。

处理当前跨区间贡献时维护以下不变量：

> 树状数组中恰好包含左半区间内所有 $y$ 不大于当前右半点的点，并按 $z$ 统计
> 数量。

因此一次前缀查询同时完成 $y$ 和 $z$ 两个条件的筛选。

## 恢复树状数组

树状数组只应保存当前递归层加入的左半点。合并结束后，必须撤销这些修改：

```cpp
for (int p = l; p < i; p++) {
    fenwick.add(point[p].z, -point[p].count);
}
```

若不撤销，兄弟递归区间会读到与自己无关的点，答案会重复计算。

这里不需要建立一棵可撤销树状数组。每个加入操作都明确知道对应的相反操作，按
相同位置加上负数即可。

## 保持 y 有序

父递归层也要按照 $y$ 扫描当前区间，所以统计完跨区间贡献后，要像归并排序一样
合并左右两段：

```cpp
int left = l;
int right = mid + 1;
int position = l;

while (left <= mid && right <= r) {
    if (point[left].y <= point[right].y) {
        buffer[position++] = point[left++];
    } else {
        buffer[position++] = point[right++];
    }
}
```

合并不会丢失每个点已经累计的 `answer`。递归区间在进入时按原来的 $x$ 顺序
划分，在返回时转换成按 $y$ 有序的序列，供父层使用。

## 重复点

若多个点的三个坐标完全相同，它们会互相支配。直接逐个处理容易在相等元素跨越
递归中点时产生难以检查的边界。

先把完全相同的点合并成一个节点，并保存出现次数 `count`：

- 向树状数组加入这个节点时加入 `count`；
- 其他节点被它支配时一次得到 `count` 个贡献；
- 这个节点最终支配点数为 `answer + count`，其中 `count` 包含所有相同点。

若题目要求输出“恰好支配 $k$ 个其他点”的数量，则这个节点的每个副本都应加入
下标 `answer + count - 1`。

## 完整代码

下面完成经典三维偏序统计。输入给出 $n$ 个点，三个坐标都在 $[1,k]$；输出
$n$ 行，第 $i$ 行表示恰好有 $i$ 个其他点被当前点支配的点数。

```cpp
#include <bits/stdc++.h>
using namespace std;

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
};

struct Point {
    int x;
    int y;
    int z;
    int count;
    int answer;
};

int n, k, m;
vector<Point> point;
vector<Point> buffer;
vector<int> result;
Fenwick fenwick;

void cdq(int l, int r) {
    if (l == r) {
        return;
    }

    int mid = (l + r) / 2;
    cdq(l, mid);
    cdq(mid + 1, r);

    int i = l;

    for (int j = mid + 1; j <= r; j++) {
        while (i <= mid && point[i].y <= point[j].y) {
            fenwick.add(point[i].z, point[i].count);
            i++;
        }
        point[j].answer += fenwick.prefix_sum(point[j].z);
    }

    for (int p = l; p < i; p++) {
        fenwick.add(point[p].z, -point[p].count);
    }

    int left = l;
    int right = mid + 1;
    int position = l;

    while (left <= mid && right <= r) {
        if (point[left].y <= point[right].y) {
            buffer[position++] = point[left++];
        } else {
            buffer[position++] = point[right++];
        }
    }

    while (left <= mid) {
        buffer[position++] = point[left++];
    }
    while (right <= r) {
        buffer[position++] = point[right++];
    }

    for (int p = l; p <= r; p++) {
        point[p] = buffer[p];
    }
}

void solve() {
    cin >> n >> k;

    vector<Point> input(n);

    for (Point& current : input) {
        cin >> current.x >> current.y >> current.z;
        current.count = 1;
        current.answer = 0;
    }

    sort(
        input.begin(),
        input.end(),
        [](const Point& a, const Point& b) {
            return tie(a.x, a.y, a.z) < tie(b.x, b.y, b.z);
        });

    point.assign(n + 5, {});
    buffer.assign(n + 5, {});
    m = 0;

    for (const Point& current : input) {
        if (m > 0 && point[m].x == current.x &&
            point[m].y == current.y && point[m].z == current.z) {
            point[m].count++;
        } else {
            point[++m] = current;
        }
    }

    fenwick.init(k);
    cdq(1, m);

    result.assign(n + 5, 0);

    for (int i = 1; i <= m; i++) {
        int dominated = point[i].answer + point[i].count - 1;
        result[dominated] += point[i].count;
    }

    for (int i = 0; i < n; i++) {
        cout << result[i] << '\n';
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
```

## 正确性

任意两个不同的合并节点，只会在递归树中第一次分居某个节点的左右子区间。此时：

- 左节点在初始 $(x,y,z)$ 排序中不晚于右节点，因此满足 $x_{left}\le x_{right}$；
- 扫描右节点时，只有满足 $y_{left}\le y_{right}$ 的左节点已经加入树状数组；
- 树状数组前缀和只统计满足 $z_{left}\le z_{right}$ 的已加入节点。

所以每个满足三维偏序的跨区间点对恰好统计一次，不满足条件的点对不会被统计。
左右区间内部的点对由递归保证。合并重复点后，`count` 又恢复了每个副本的贡献，
因此最终答案正确。

## 复杂度

CDQ 共有 $O(\log n)$ 层。每层中，每个点至多执行一次树状数组加入、撤销和查询，
每次树状数组操作为 $O(\log k)$：

- 时间复杂度：$O(n\log n\log k)$；
- 空间复杂度：$O(n+k)$。

若先离散化 $z$，可以把 $k$ 换成不同 $z$ 值的数量。

## 常见错误

- 没有先按第一维排序，就把递归中的前后位置当成 $x$ 的大小关系；
- 左右递归返回后没有保持各自按 $y$ 有序；
- 合并完成后忘记撤销树状数组中的左半点；
- 条件要求“不大于”，扫描时却写成严格小于；
- 完全相同的点没有合并，导致相等边界难以处理；
- 树状数组加入排序后的数组下标，而不是第三维坐标；
- 用 `answer + count` 作为“其他点数量”，忘记减去当前点自身。

## 需要记住什么

- CDQ 分治怎样用递归顺序承担一个维度？
- 为什么合并时只需要检查左半对右半的贡献？
- 树状数组在扫描当前右半点时保存了哪些左半点？
- 为什么每一层结束后必须撤销树状数组修改？
- 为什么完全相同的点适合先合并并保存出现次数？
